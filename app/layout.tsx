import "./globals.css";
import "@/styles/accessibility.css";
import type { Metadata } from "next";
import ClientInit from "./client-init";
import SiteHeader from "@/components/SiteHeader";
import { UIProvider } from "@/lib/ui-state";
import ClientProviders from "./ClientProviders";
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bible Bedtime Stories",
  description: "Stories that nurture.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background antialiased`}>
        <UIProvider>
          <ClientProviders>
            <ClientInit />
            <SiteHeader />
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </ClientProviders>
        </UIProvider>
      </body>
    </html>
  );
}
