import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Inter,
  Playfair_Display,
  Space_Mono,
} from "next/font/google";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { getSiteSettings } from "@/lib/queries";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: settings.site_title,
    description: settings.tagline ?? "Un portfolio digitale oltre il CV.",
  };
}

const FONT_VARS: Record<string, string> = {
  geist: "var(--font-geist-sans)",
  inter: "var(--font-inter)",
  playfair: "var(--font-playfair)",
  "space-mono": "var(--font-space-mono)",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();
  const fontVar = FONT_VARS[settings.font_choice] ?? FONT_VARS.geist;

  return (
    <html
      lang="it"
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${playfair.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <head>
        <style>{`
          :root { --primary: ${settings.primary_color}; --accent: ${settings.accent_color}; }
          body { font-family: ${fontVar}, Arial, Helvetica, sans-serif !important; }
        `}</style>
      </head>
      <body className="min-h-full flex flex-col">
        <Nav siteTitle={settings.site_title} />
        <main className="flex flex-1 flex-col">{children}</main>
        <Footer siteTitle={settings.site_title} />
      </body>
    </html>
  );
}
