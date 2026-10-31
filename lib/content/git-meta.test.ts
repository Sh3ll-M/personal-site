import { describe, it, expect } from "vitest";
import { getGitMetaForFile } from "./git-meta";

describe("getGitMetaForFile", () => {
  it("parses hash, date, and diffstat from git log output", () => {
    const calls: string[] = [];
    const fakeRun = (command: string) => {
      calls.push(command);
      return (
        "__commit__a3f9c2,2026-07-12\n" +
        "\n" +
        " 1 file changed, 142 insertions(+), 8 deletions(-)\n"
      );
    };

    const meta = getGitMetaForFile("content/posts/hello.md", fakeRun);

    expect(meta).toEqual({ hash: "a3f9c2", date: "2026-07-12", added: 142, removed: 8 });
    expect(calls[0]).toContain("content/posts/hello.md");
  });

  it("defaults added/removed to 0 when shortstat has no matching counts", () => {
    const fakeRun = () => "__commit__1c88d4,2026-06-02\n\n 1 file changed\n";

    const meta = getGitMetaForFile("content/posts/new.md", fakeRun);

    expect(meta.added).toBe(0);
    expect(meta.removed).toBe(0);
  });

  it("skips a trivial commit and uses the most recent one that changed content", () => {
    const fakeRun = () =>
      "__commit__d2c023,2026-10-31\n" +
      "\n" +
      " 1 file changed, 0 insertions(+), 0 deletions(-)\n" +
      "__commit__7ce13f,2026-09-01\n" +
      "\n" +
      " 1 file changed, 41 insertions(+), 2 deletions(-)\n";

    const meta = getGitMetaForFile("content/projects/renamed.md", fakeRun);

    expect(meta).toEqual({ hash: "7ce13f", date: "2026-09-01", added: 41, removed: 2 });
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
