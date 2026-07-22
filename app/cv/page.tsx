import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "CV",
  description: "Sh3ll-M's CV — experience, skills, and background.",
  path: "/cv",
});

type ExperienceEntry = {
  role: string;
  org: string;
  period: string;
  summary: string;
};

const EXPERIENCE: ExperienceEntry[] = [
  {
    role: "Replace with your role",
    org: "Replace with company/org",
    period: "20XX — Present",
    summary: "Replace with a one or two line summary of what you did here.",
  },
];

const SKILLS: string[] = ["Replace", "With", "Your", "Skills"];

export default function CvPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">CV</h1>

      <section className="mt-8">
        <h2 className="font-mono text-xs uppercase tracking-wide text-muted">Experience</h2>
        <div className="mt-4 space-y-6">
          {EXPERIENCE.map((entry) => (
            <div key={`${entry.org}-${entry.period}`}>
              <div className="font-display text-lg font-bold text-ink">{entry.role}</div>
              <div className="font-mono text-xs text-muted">
                {entry.org} &nbsp;·&nbsp; {entry.period}
              </div>
              <p className="mt-1 text-sm text-muted">{entry.summary}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-mono text-xs uppercase tracking-wide text-muted">Skills</h2>
        <div className="mt-3 flex flex-wrap gap-2 font-mono text-xs text-muted">
          {SKILLS.map((skill) => (
            <span key={skill} className="rounded border border-rule px-2 py-0.5">
              {skill}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
