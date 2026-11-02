import type { Metadata } from "next";
import { Geist, Geist_Mono, Vazirmatn } from "next/font/google";
import { AuthProvider } from "@/lib/auth";
import { ConfirmProvider } from "@/lib/confirm";
import { LocaleProvider } from "@/lib/i18n/locale";
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

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
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
      className={`${geistSans.variable} ${geistMono.variable} ${vazirmatn.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full font-sans">
        <LocaleProvider>
          <AuthProvider>
            <ConfirmProvider>
              <MobileChromeProvider>{children}</MobileChromeProvider>
            </ConfirmProvider>
          </AuthProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
