import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SupabaseProvider } from "@/providers/SupabaseProvider";
import { ApuntoProvider } from "@/providers/ApuntoProvider";
import { CategoryFilterProvider } from "@/providers/CategoryFilter";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Apunto",
  description: "Ultimate todo list",
  manifest: "/site.webmanifest",
  appleWebApp: {
    title: 'Apunto',
    statusBarStyle: 'black-translucent',
    startupImage: [
      '/apple-touch-icon.png',
      {
        url: 'apple-touch-icon.png',
        media: '(device-width: 768px) and (device-height: 1024px)',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SupabaseProvider>
      <ApuntoProvider>
        <CategoryFilterProvider>
          <html lang="en">
            <body className={inter.className}>{children}</body>
          </html>
        </CategoryFilterProvider>
      </ApuntoProvider>
    </SupabaseProvider>

  );
}
