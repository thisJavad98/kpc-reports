import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteFooter } from "@/components/SiteFooter";
import { AuthProvider } from "@/lib/auth";
import { ConfirmProvider } from "@/lib/confirm";
import { MobileChromeProvider } from "@/lib/mobile-chrome";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KPC Reports",
  description: "Project folders and text reports for KPC teams.",
  themeColor: "#000000",
  other: {
    "color-scheme": "dark",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full pb-14 font-sans">
        <AuthProvider>
          <ConfirmProvider>
            <MobileChromeProvider>{children}</MobileChromeProvider>
          </ConfirmProvider>
        </AuthProvider>
        <SiteFooter />
      </body>
    </html>
  );
}
