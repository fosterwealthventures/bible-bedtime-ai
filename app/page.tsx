import { Suspense } from "react";
import ClientHome from "./ClientHome";
import WelcomeHero from "@/components/WelcomeHero";

export default function Page() {
  return (
    <main className="min-h-screen">
      <WelcomeHero />
      <Suspense fallback={<div className="p-6 text-sm opacity-70">Loading…</div>}>
        <ClientHome />
      </Suspense>
    </main>
  );
}
