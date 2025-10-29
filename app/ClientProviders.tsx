"use client";
import ParentalSettingsProvider from "@/context/ParentalSettingsProvider";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return <ParentalSettingsProvider>{children}</ParentalSettingsProvider>;
}

