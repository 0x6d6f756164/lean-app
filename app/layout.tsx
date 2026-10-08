import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://your-lean-toolkit.vercel.app"),
  title: { default: "Lean Toolkit", template: "%s · Lean Toolkit" },
  description: "Free calculators and charts for Lean and industrial engineering.",
  openGraph: {
    title: "Lean Toolkit",
    description: "Calculators and charts for Lean and industrial engineering.",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}