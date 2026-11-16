import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { LanguageProvider } from "@/components/language-switcher";
import type { Language } from "@/lib/i18n";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Resort | Operations",
  description: "The Resort operations workspace for Tatlisu, North Cyprus.",
  applicationName: "The Resort",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "The Resort" },
};

export const viewport: Viewport = {
  themeColor: "#e8e9e7",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const rawLang = cookieStore.get("resort_lang")?.value;
  const initialLang: Language = rawLang === "tr" ? "tr" : "en";

  return (
    <html lang={initialLang}>
      <body>
        <LanguageProvider initialLang={initialLang}>{children}</LanguageProvider>
      </body>
    </html>
  );
}
