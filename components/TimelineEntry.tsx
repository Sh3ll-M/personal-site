"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

type TimelineEntryProps = {
  href: string;
  hash: string;
  date: string;
  added: number;
  removed: number;
  title: string;
  excerpt: string;
};

export function TimelineEntry({ href, hash, date, added, removed, title, excerpt }: TimelineEntryProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.li
      className="relative pl-7"
      initial={reduceMotion ? undefined : { opacity: 0, y: 12 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <span className="absolute left-[-5px] top-1.5 h-2.5 w-2.5 rounded-full bg-diff-add" />
      <div className="font-mono text-xs text-muted">
        {date} &nbsp;{hash} &nbsp;
        <span className="text-diff-add">+{added}</span> <span className="text-diff-remove">-{removed}</span>
      </div>
      <Link href={href} className="mt-1 block font-display text-lg font-bold text-ink hover:underline">
        {title}
      </Link>
      <p className="mt-1 text-sm text-muted">{excerpt}</p>
    </motion.li>
  );
}
