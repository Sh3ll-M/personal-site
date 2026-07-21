// Single source of truth for the site's public URL. Reads NEXT_PUBLIC_SITE_URL
// so Matthew can point this at a custom domain later without touching code;
// falls back to the live Vercel deployment URL.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://personal-site-ecru-eta-23.vercel.app";
