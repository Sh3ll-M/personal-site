---
title: "Calling Azure OpenAI from Power BI"
date: "2026-07-23"
tags: ["power-bi", "power-query", "azure-openai"]
excerpt: "How we started calling our Azure OpenAI deployment from inside Power BI to get a lightweight usage analysis for customers, and what changed moving from GPT-4o to GPT-5."
---

At work we had a customer who uses an external consultancy company to analyse their usage data of their Intranet so they see how the users are interacting with the site, what is/isn't working well for them etc... I thought it would be good to do this for all our customers, however, without a team of analysts that quickly becomes unmanageable.

What I ended up doing was a little bit of research around using our Azure OpenAI deployment, which we use for other "things" already, tying that into Power BI and throwing some data and some prompts at it to mimic what a real person would do and give us a very high level analysis.

I found an example online of someone doing something similar and built a function I could call to talk to our OpenAI deployment, in the first case this was GPT-4o.

## GPT-4o

```powerquery
let
    // The function itself — call this with some text and get an answer back
    Source = (user as text, optional system as text, optional model as text) =>
        let
            // Default to gpt-4o if no model override was passed in
            _model = if model = null then "gpt-4o" else model,

            // Build the optional "system" message as a chunk of JSON text —
            // this only gets included if a system prompt was actually provided
            _system = if system = null then "" else "{
        ""role"": ""system"",
        ""content"": """ & system & """
      },",

            // Connection details — these come from named parameters set up in the Power BI file
            _api_key = OpenAI_Key,
            _url_base = OpenAI_Endpoint,
            _url_rel = OpenAI_Path,
            _api_version = OpenAI_Version,

            // Build the request body by hand as a JSON string
            ContentJSON = "{
    ""model"": """ & _model & """,
    ""messages"": [
      " & _system & "
      {
        ""role"": ""user"",
        ""content"": """ & user & """
      }
    ]
  }",

            ContentBinary = Text.ToBinary(ContentJSON),

            // Send the request to the Chat Completions endpoint and parse the JSON that comes back
            Source = Json.Document(
                Web.Contents(
                    _url_base,
                    [
                        RelativePath = _url_rel & _api_version,
                        Headers = [
                            #"Content-Type" = "application/json",
                            #"api-key" = _api_key
                        ],
                        Content = ContentBinary
                    ]
                )
            ),

            // Pull out the answer text, why it stopped, and how many tokens it used
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

More recently, we moved up to GPT-5 and that involved changing how the function worked due to the structure needed for the new call. As you can see, this isn't a "chat completions" query anymore. We also don't specify the model in the URL alongside having to pass in a token limit.

That's down to how the endpoints work — the GPT-4o call goes through a deployment-specific URL, so the model name is actually sitting in the path itself (you'll see "gpt-4o" in there if you go looking). The GPT-5 endpoint doesn't work off a deployment path in the same way, so the model just gets specified in the body instead.

## GPT-5

```powerquery
let
    // The function itself — call this with some text and get an answer back
    Source = (user as text, optional system as text, optional max_tokens as number) =>
        let
            _api_key = OpenAI_Key,
            _url_base = OpenAI_Endpoint,
            _url_rel = OpenAI_Path,
            _api_version = OpenAI_Version,
            _max_tokens = if max_tokens = null or max_tokens <= 0 then 300 else max_tokens,

            // 1. Build the input list — the Responses API only wants the user's message here
            inputList = { [role = "user", content = user] },

            // 2. Build the base request payload
            basePayload = [
                model = "gpt-5.1",
                max_output_tokens = _max_tokens,
                input = inputList
            ],

            // 3. If a system prompt was provided, add it in as "instructions"
            payloadRecord = if system = null or system = "" then 
                                basePayload 
                            else 
                                Record.AddField(basePayload, "instructions", system),

            // 4. Turn the payload into JSON
            ContentBinary = Json.FromValue(payloadRecord),

            // 5. Call the endpoint — give it up to 5 minutes, and don't blow up immediately if it fails
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

            // 6. If the call failed or timed out, raise a clear error instead of a cryptic one
            Source = if ApiResult = null then 
                        error "[OpenAI Error] API call failed or timed out."
                     else 
                        ApiResult,

            // 7. Read the answer text — use the handy "output_text" field if it's there,
            //    otherwise dig it out of the response manually
            content = if Record.HasFields(Source, "output_text") then 
                          Source[output_text] 
                      else 
                          try Source[output]{0}[content]{0}[text] otherwise "[Error: Malformed response]",

            // 8. Read the status — this tells us why the response stopped
            reason = try Source[output]{0}[status] otherwise "error",

            // 9. Read the token usage — the field names changed between APIs, so check both
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
