const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;

/** Everything site-wide lives here. Per-tool info lives in lib/tools.ts. */
export const SITE = {
  name: "Lean Toolkit",
  logoLetter: "L",
  eyebrow: "Industrial engineering",
  tagline: "Lean tools that show their work",
  description: "Free calculators and charts for Lean and industrial engineering.",
  intro:
    "Enter your numbers, see the result instantly, and learn what it means. Everything runs in your browser, and every result can be shared as a link or exported as an image.",

  // For server code only (metadata, social images). On Vercel it is picked up
  // automatically; set NEXT_PUBLIC_SITE_URL (with https://) once you have a custom domain.
  url:
    process.env.NEXT_PUBLIC_SITE_URL ||
    (vercelUrl ? `https://${vercelUrl}` : "http://localhost:3000"),
  locale: "en",

  author: { name: "Mouad", url: "https://mouad-eg.vercel.app" },

  /** Header links that are not tools. */
    /** Header links for the user's own data, shown apart from the tools. */
  workspaceNav: [
    { label: "Workspace", href: "/workspace" },
    { label: "Dashboard", href: "/dashboard" },
  ],
  /** Colors of the social preview image. */
  og: {
    background: "#0b0e13",
    foreground: "#e8ecf1",
    muted: "#9aa7b8",
    accent: "#38bdf8",
    onAccent: "#04121c",
    border: "#2b3442",
  },
};