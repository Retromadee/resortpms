import type { Metadata, Viewport } from "next";
import { GoogleTranslateScript } from "@/components/language-switcher";
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

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <GoogleTranslateScript />
      </body>
    </html>
  );
}
