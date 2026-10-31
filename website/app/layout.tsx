import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Manrope, Syne } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Grain } from "@/components/Grain";
import { Nav } from "@/components/Nav";
import { Progress } from "@/components/Progress";
import { Spine } from "@/components/Spine";
import { profile } from "@/data/profile";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: {
    default: "Giovanni Pizzighini — Data Engineer",
    template: "%s — Giovanni Pizzighini",
  },
  description: profile.summary,
  authors: [{ name: profile.name }],
  openGraph: {
    title: "Giovanni Pizzighini — Data Engineer",
    description: profile.summary,
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0c0d10",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: profile.role,
  email: profile.email,
  url: profile.linkedin,
  address: {
    "@type": "PostalAddress",
    addressLocality: "São Paulo",
    addressCountry: "BR",
  },
  knowsLanguage: ["English", "Portuguese", "Spanish", "Italian"],
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${manrope.variable} ${mono.variable}`}
    >
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <a className="skip" href="#main">
          Skip to content
        </a>
        <Progress />
        <Grain />
        <Spine />
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  );
}
