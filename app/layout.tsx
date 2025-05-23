import { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LanguageSelector from "./components/LanguageSelector";
import { I18nProvider } from "./i18n/provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Categorizer",
  description: "A categorizer app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white`}
      >
        <I18nProvider>
          {/* <div className="absolute bottom-4 right-4 z-50">
            <LanguageSelector />
          </div> */}
          <div id="modal-root"></div>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
