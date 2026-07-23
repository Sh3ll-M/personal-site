---
title: "Calling Azure OpenAI from Power BI: What Changed Moving from GPT-4o to GPT-5.1"
date: "2026-07-23"
tags: ["power-bi", "power-query", "azure-openai"]
excerpt: "A reusable Power Query function wraps an Azure OpenAI call so any report can pass in text and get a response back — here's what had to change when we moved from GPT-4o to GPT-5.1."
---

We use Power BI a lot at work, and at some point the obvious question came up: what if a query step could *ask* something instead of only transforming what's already there? Cleaning up freeform text, quick classification, that kind of one-off task — fiddly to do with M's string functions, trivial for an LLM.

The answer was a small reusable custom function in Power Query: pass it some text, it calls Azure OpenAI, you get a response back. Any query in the model can call it like any other function. It's been in production for a few months, and since then the model behind it moved from GPT-4o to GPT-5.1 — which turned out to be more than a one-line change.

## The GPT-4o version: Chat Completions

```powerquery
let
    Source = (user as text, optional system as text, optional model as text) =>

let
    _model = if model = null then "gpt-4o" else model,
    _system = if system = null then "" else "{
        ""role"": ""system"",
        ""content"": """ & system & """
      },",

    _api_key = OpenAI_Key,
    _url_base = OpenAI_Endpoint,
    _url_rel = OpenAI_Path,
    _api_version = OpenAI_Version,

    ContentJSON ="{
    ""model"": """ & _model & """,
    ""messages"": [
      " & _system & "
      {
        ""role"": ""user"",
        ""content"": """ & user & """
      }
    ]
  }",

    ContentBinary =  Text.ToBinary(ContentJSON),

    Source = Json.Document(
        Web.Contents(
            _url_base, 
            [
                RelativePath=_url_rel & _api_version,
                Headers=[
                    #"Content-Type"="application/json", 
                    #"api-key"=_api_key
                ],
                Content=ContentBinary
            ]
        )
    ),
  
    choice = Source[choices]{0},
    content = Table.SelectRows(Record.ToTable(choice[message]), each [Name] = "content")[Value]{0},
    reason = Table.SelectRows(Record.ToTable(choice), each [Name] = "finish_reason")[Value]{0},
    usage = Source[usage],
    prompt_tokens = usage[prompt_tokens],
    completion_tokens = usage[completion_tokens],
    total_tokens = usage[total_tokens],

    Result = {content, reason, prompt_tokens, completion_tokens, total_tokens}
in
    Result
in
    Source
```

This is the classic Chat Completions shape: a `messages` array of `role`/`content` pairs, with an optional system message prepended if one was passed in. The JSON payload is hand-built as a string — `ContentJSON` is literally string concatenation with escaped quotes — which works, but it's fragile. Anything in the input text containing a stray `"` needs escaping upstream, and a misplaced quote turns into a fairly opaque M parsing error rather than a helpful one.

The response comes back as `choices[0].message.content`, `choices[0].finish_reason`, and usage numbers under `prompt_tokens` / `completion_tokens` / `total_tokens` — a few `Record.ToTable` lookups to pull each one out.

## The GPT-5.1 version: Responses API

```powerquery
let
    Source = (user as text, optional system as text, optional max_tokens as number) =>
    let
        _api_key = OpenAI_Key,
        _url_base = OpenAI_Endpoint,
        _url_rel = OpenAI_Path,
        _api_version = OpenAI_Version,
        _max_tokens = if max_tokens = null or max_tokens <= 0 then 300 else max_tokens,

        // 1. Build the input list (Responses API only wants the user message here)
        inputList = { [role = "user", content = user] },

        // 2. Build the base payload record
        basePayload = [
            model = "gpt-5.1",
            max_output_tokens = _max_tokens,
            input = inputList
        ],

        // 3. Safely add system instructions 
        payloadRecord = if system = null or system = "" then 
                            basePayload 
                        else 
                            Record.AddField(basePayload, "instructions", system),

        // 4. Convert to JSON
        ContentBinary = Json.FromValue(payloadRecord),

        // 5. Make the Web Request with error handling
        ApiResult = try Json.Document(
            Web.Contents(
                _url_base, 
                [
                    RelativePath = _url_rel & _api_version,
                    Headers = [
                        #"Content-Type" = "application/json", 
                        #"api-key" = _api_key
                    ],
                    Content = ContentBinary,
                    Timeout = #duration(0, 0, 5, 0)
                ]
            )
        ) otherwise null,
  
        // 6. Handle null response
        Source = if ApiResult = null then 
                    error "[OpenAI Error] API call failed or timed out."
                 else 
                    ApiResult,

        // 7. Parse the output text safely
        content = if Record.HasFields(Source, "output_text") then 
                      Source[output_text] 
                  else 
                      try Source[output]{0}[content]{0}[text] otherwise "[Error: Malformed response]",
        
        // 8. Extract metadata safely
        reason = try Source[output]{0}[status] otherwise "error",
        
        // 9. Handle token usage field name differences
        usage = try Source[usage] otherwise [input_tokens = 0, output_tokens = 0, total_tokens = 0],
        prompt_tokens = try (if Record.HasFields(usage, "input_tokens") then usage[input_tokens] else usage[prompt_tokens]) otherwise 0,
        completion_tokens = try (if Record.HasFields(usage, "output_tokens") then usage[output_tokens] else usage[completion_tokens]) otherwise 0,
        total_tokens = try usage[total_tokens] otherwise 0,

        Result = {content, reason, prompt_tokens, completion_tokens, total_tokens} 
    in
        Result
in
    Source
```

A few things changed at once here, driven by Azure's newer Responses API rather than by choice:

- **`messages` becomes `input`.** Instead of an array of role/content pairs including an optional system message, the user turn goes into an `input` list and the system prompt becomes a top-level `instructions` field on the payload instead of a message in the array.
- **JSON building got safer.** `Json.FromValue` serializes the M record directly instead of hand-rolling a JSON string, so quoting and escaping stop being something we have to think about at all.
- **Token budget is explicit.** `max_output_tokens` didn't exist as a parameter before; it's now passed explicitly (defaulting to 300).
- **Response shape moved.** `output_text` is a convenience field the Responses API adds for the common case, so that's read first, falling back to walking `output[0].content[0].text` if it's missing. `finish_reason` became `output[0].status`.
- **Usage fields got renamed.** `prompt_tokens`/`completion_tokens` became `input_tokens`/`output_tokens`. Both lookups are kept (`if Record.HasFields(usage, "input_tokens") then ... else ...`) so the function doesn't break outright if it ever has to point at an older deployment.
- **Error handling got a lot more defensive.** The GPT-4o version had none — if the call failed, the whole query step failed with whatever M's default error looked like. The new version wraps the web call in `try...otherwise`, sets an explicit five-minute timeout, and raises a clear `[OpenAI Error]` message instead of a generic failure.

## Why bother with a wrapper function at all

The payoff of wrapping this in one function is that all of the above lived in exactly one place. When the model changed, one Power Query function got edited, not every report that happened to call it.

The field-name churn between the two APIs — `finish_reason` → `status`, `prompt_tokens` → `input_tokens` — is the kind of thing that's easy to miss if you're not reading the migration notes closely. A query still using `Source[choices]{0}` fails with a fairly unhelpful M error against a Responses API payload, since `choices` doesn't exist anymore. Worth keeping in mind if you're maintaining anything similar.
