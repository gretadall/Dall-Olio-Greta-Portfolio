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
import { SplashScreen } from "@/components/SplashScreen";
import { getSiteSettings, getPublishedSections } from "@/lib/queries";
import { getMediaUrl } from "@/lib/supabase/media";
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
  const [settings, sections] = await Promise.all([
    getSiteSettings(),
    getPublishedSections(),
  ]);
  const fontVar = FONT_VARS[settings.font_choice] ?? FONT_VARS.geist;
  const backgroundImageUrl = settings.background_image_path
    ? getMediaUrl(settings.background_image_path)
    : null;
  const splashImageUrl = settings.splash_image_path
    ? getMediaUrl(settings.splash_image_path)
    : null;

  return (
    <html
      lang="it"
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${playfair.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <head>
        <style>{`
          :root {
            --primary: ${settings.primary_color};
            --accent: ${settings.accent_color};
            ${settings.background_color ? `--background: ${settings.background_color};` : ""}
            ${settings.font_color ? `--foreground: ${settings.font_color};` : ""}
            ${settings.muted_color ? `--muted: ${settings.muted_color};` : ""}
          }
          body {
            font-family: ${fontVar}, Arial, Helvetica, sans-serif !important;
          }
        `}</style>
      </head>
      <body className="min-h-full flex flex-col">
        {backgroundImageUrl && (
          <div
            aria-hidden
            className="-z-10"
            style={{
              position: "fixed",
              top: "-10vh",
              bottom: "-10vh",
              left: 0,
              right: 0,
              backgroundImage: `url('${backgroundImageUrl}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        )}
        {settings.splash_enabled && (
          <SplashScreen
            imageUrl={splashImageUrl}
            title={settings.splash_title}
            message={settings.splash_message}
            durationMs={(settings.splash_duration_seconds ?? 3) * 1000}
          />
        )}
        <Nav
          siteTitle={settings.site_title}
          linkedinUrl={settings.linkedin_url}
          contactEmail={settings.contact_email}
          homeLabel={settings.nav_home_label ?? "Chi sono"}
          reteLabel={settings.nav_rete_label ?? "Rete"}
          linkedinLabel={settings.linkedin_label ?? "LinkedIn"}
          contactLabel={settings.contact_button_label ?? "Scrivimi"}
          sections={sections.map((s) => ({
            slug: s.slug,
            title: s.title,
            icon: s.icon,
          }))}
        />
        <main className="flex flex-1 flex-col">{children}</main>
        <Footer text={settings.footer_text ?? "Built by Greta dall'Olio"} />
      </body>
    </html>
  );
}
