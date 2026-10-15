import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { EditModeProvider } from "@/components/edit/EditModeProvider";
import { EditToolbar } from "@/components/edit/EditToolbar";
import { ColorPanel } from "@/components/edit/ColorPanel";
import { getSiteSettings } from "@/lib/queries";
import { getIsAdmin } from "@/lib/supabase/auth";
import "./globals.css";

// Two families: Inter for reading, Playfair Display (the same high-contrast
// serif feel as the GD monogram) for titles and accents.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: settings.site_title,
    description: settings.tagline ?? "Un portfolio digitale oltre il CV.",
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [settings, isAdmin] = await Promise.all([
    getSiteSettings(),
    getIsAdmin(),
  ]);

  return (
    <html
      lang="it"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <head>
        <style>{`
          :root {
            --primary: ${settings.primary_color};
            ${settings.background_color ? `--background: ${settings.background_color};` : ""}
            ${settings.font_color ? `--foreground: ${settings.font_color};` : ""}
          }
        `}</style>
      </head>
      <body className="flex min-h-full flex-col">
        <EditModeProvider isAdmin={isAdmin}>
          <Nav
            siteTitle={settings.site_title}
            contactEmail={settings.contact_email}
          />
          <main className="flex flex-1 flex-col">{children}</main>
          <Footer
            text={settings.footer_text ?? "Built by Greta dall'Olio"}
            linkedinUrl={settings.linkedin_url}
            contactEmail={settings.contact_email}
          />
          {isAdmin && (
            <>
              <EditToolbar />
              <ColorPanel
                colors={{
                  primary_color: settings.primary_color,
                  background_color: settings.background_color ?? "#000000",
                  font_color: settings.font_color ?? "#ffffff",
                }}
              />
            </>
          )}
        </EditModeProvider>
      </body>
    </html>
  );
}
