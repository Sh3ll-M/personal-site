// Single source of truth for the site's public URL. Reads NEXT_PUBLIC_SITE_URL
// so Matthew can point this at a custom domain later without touching code;
// falls back to the live Vercel deployment URL.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://personal-site-ecru-eta-23.vercel.app";

// Contact links shown in the sidebar. The email is a Cloudflare Email
// Routing alias, not Matthew's real inbox address.
export const CONTACT_LINKS = {
  email: "hello@sh3ll.co.uk",
  github: "https://github.com/Sh3ll-M",
  linkedin: "https://www.linkedin.com/in/matthew-shell-9b8139b/",
};
