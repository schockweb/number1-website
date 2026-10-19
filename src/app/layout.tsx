import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageProvider";
import AuthProvider from "@/components/AuthProvider";
import ConstructionBanner from "@/components/ConstructionBanner";

export const metadata: Metadata = {
  title: "Number1 | High-End Digital Solutions",
  description: "Experience the next era of digital excellence with Number1 — your premier AI employee.",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Syne:wght@400..800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <AuthProvider>
          <LanguageProvider>
            {children}
            <ConstructionBanner />
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

