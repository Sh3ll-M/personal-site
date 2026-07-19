import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--color-bg)",
        sidebar: "var(--color-sidebar)",
        ink: "var(--color-ink)",
        muted: "var(--color-muted)",
        rule: "var(--color-rule)",
        "diff-add": "var(--color-diff-add)",
        "diff-remove": "var(--color-diff-remove)",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
    },
  },
  plugins: [],
};

export default config;
