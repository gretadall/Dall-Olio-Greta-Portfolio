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
import { getSiteSettings } from "@/lib/queries";
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
  const settings = await getSiteSettings();
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
            ${
              backgroundImageUrl
                ? `background-image: url('${backgroundImageUrl}'); background-size: cover; background-position: center; background-attachment: fixed;`
                : ""
            }
          }
        `}</style>
      </head>
      <body className="min-h-full flex flex-col">
        {settings.splash_enabled && (
          <SplashScreen
            imageUrl={splashImageUrl}
            title={settings.splash_title}
            message={settings.splash_message}
          />
        )}
        <Nav
          siteTitle={settings.site_title}
          heroPhotoPath={settings.hero_photo_path}
          heroPhotoRadius={settings.hero_photo_radius}
          linkedinUrl={settings.linkedin_url}
          contactEmail={settings.contact_email}
        />
        <main className="flex flex-1 flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
