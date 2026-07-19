import { execSync } from "node:child_process";

export type GitMeta = {
  hash: string;
  date: string;
  added: number;
  removed: number;
};

export type RunCommand = (command: string) => string;

const defaultRun: RunCommand = (command) => execSync(command, { encoding: "utf-8" });

export function getGitMetaForFile(filePath: string, run: RunCommand = defaultRun): GitMeta {
  const log = run(`git log -1 --format=%h|%ad --date=short -- "${filePath}"`).trim();
  if (!log) {
    throw new Error(`No git history found for ${filePath}`);
  }
  const [hash, date] = log.split("|");

  const shortstat = run(`git log -1 --shortstat -- "${filePath}"`);
  const insertMatch = shortstat.match(/(\d+) insertion/);
  const deleteMatch = shortstat.match(/(\d+) deletion/);

  return {
    hash,
    date,
    added: insertMatch ? Number(insertMatch[1]) : 0,
    removed: deleteMatch ? Number(deleteMatch[1]) : 0,
  };
}
