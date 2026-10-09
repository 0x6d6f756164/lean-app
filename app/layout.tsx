import type { Metadata, Viewport } from "next";
import SiteHeader from "@/components/SiteHeader";
import { SITE } from "@/lib/site";
import "./globals.css";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import { Analytics } from "@vercel/analytics/next"

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: SITE.name, template: `%s · ${SITE.name}` },
  description: SITE.description,
  authors: [{ name: SITE.author.name, url: SITE.author.url }],
  openGraph: {
    title: SITE.name,
    description: SITE.description,
    siteName: SITE.name,
    type: "website",
  },
  twitter: { card: "summary_large_image" },
  applicationName: SITE.name,
  appleWebApp: { capable: true, title: SITE.name, statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f7f9" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0e13" },
  ],
};  

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={SITE.locale}>
      <body>
        <SiteHeader />
        {children}
        <ServiceWorkerRegister />
        <Analytics />
      </body>
    </html>
  );
}