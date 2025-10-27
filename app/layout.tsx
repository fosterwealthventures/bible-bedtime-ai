import "./globals.css";
import type { Metadata } from "next";
import ClientInit from "./client-init";
import SiteHeader from "@/components/SiteHeader";
import { UIProvider } from "@/lib/ui-state";
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bible Bedtime Stories",
  description: "Stories that nurture.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <UIProvider>
          <ClientInit />
          <SiteHeader />
          {children}
        </UIProvider>
      </body>
    </html>
  );
}