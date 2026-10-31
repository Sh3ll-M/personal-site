import { execSync } from "node:child_process";

export type GitMeta = {
  hash: string;
  date: string;
  added: number;
  removed: number;
};

export type RunCommand = (command: string) => string;

const defaultRun: RunCommand = (command) => execSync(command, { encoding: "utf-8" });

type Commit = { hash: string; date: string; added: number; removed: number };

// Sentinel prefix so we can reliably tell a commit header line apart from the
// shortstat line that follows it.
const HEADER = "__commit__";

function parseLog(output: string): Commit[] {
  const commits: Commit[] = [];
  let current: Commit | null = null;

  for (const line of output.split("\n")) {
    if (line.startsWith(HEADER)) {
      const [hash, date] = line.slice(HEADER.length).split(",");
      current = { hash, date, added: 0, removed: 0 };
      commits.push(current);
    } else if (current) {
      const insertMatch = line.match(/(\d+) insertion/);
      const deleteMatch = line.match(/(\d+) deletion/);
      if (insertMatch) current.added = Number(insertMatch[1]);
      if (deleteMatch) current.removed = Number(deleteMatch[1]);
    }
  }

  return commits;
}

export function getGitMetaForFile(filePath: string, run: RunCommand = defaultRun): GitMeta {
  // --follow traces history across renames; the sentinel format plus --shortstat
  // lets us read each commit's diffstat in one pass.
  const output = run(
    `git log --follow --format=${HEADER}%h,%ad --shortstat --date=short -- "${filePath}"`
  );
  const commits = parseLog(output);

  if (commits.length === 0) {
    throw new Error(`No git history found for ${filePath}`);
  }

  // Prefer the most recent commit that actually changed the file's content, so a
  // trivial commit (such as a pure rename) does not show up as "+0 -0".
  const meaningful = commits.find((c) => c.added > 0 || c.removed > 0) ?? commits[0];

  return {
    hash: meaningful.hash,
    date: meaningful.date,
    added: meaningful.added,
    removed: meaningful.removed,
  };
}
