import { describe, it, expect } from "vitest";
import { getGitMetaForFile } from "./git-meta";

describe("getGitMetaForFile", () => {
  it("parses hash, date, and diffstat from git log output", () => {
    const calls: string[] = [];
    const fakeRun = (command: string) => {
      calls.push(command);
      if (command.includes("--shortstat")) {
        return " 1 file changed, 142 insertions(+), 8 deletions(-)\n";
      }
      return "a3f9c2,2026-07-12\n";
    };

    const meta = getGitMetaForFile("content/posts/hello.md", fakeRun);

    expect(meta).toEqual({ hash: "a3f9c2", date: "2026-07-12", added: 142, removed: 8 });
    expect(calls[0]).toContain("content/posts/hello.md");
  });

  it("defaults added/removed to 0 when shortstat has no matching counts", () => {
    const fakeRun = (command: string) =>
      command.includes("--shortstat") ? " 1 file changed\n" : "1c88d4,2026-06-02\n";

    const meta = getGitMetaForFile("content/posts/new.md", fakeRun);

    expect(meta.added).toBe(0);
    expect(meta.removed).toBe(0);
  });

  it("throws when there is no git history for the file", () => {
    const fakeRun = () => "";
    expect(() => getGitMetaForFile("content/posts/untracked.md", fakeRun)).toThrow(
      /No git history/
    );
  });

  it("derives real metadata from actual git history (no fake run)", () => {
    const meta = getGitMetaForFile("package.json");
    expect(meta.hash).toMatch(/^[0-9a-f]{7,40}$/);
    expect(meta.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(meta.added).toBeGreaterThanOrEqual(0);
    expect(meta.removed).toBeGreaterThanOrEqual(0);
  });
});
