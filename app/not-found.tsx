import Link from "next/link";

export default function NotFound() {
  return (
    <div>
      <div className="font-mono text-xs text-diff-remove">
        git checkout: pathspec did not match any file
      </div>
      <h1 className="mt-2 font-display text-2xl font-bold text-ink">404</h1>
      <p className="mt-2 text-sm text-muted">
        Nothing here.{" "}
        <Link href="/" className="text-diff-add hover:underline">
          Back to home
        </Link>
        .
      </p>
    </div>
  );
}
