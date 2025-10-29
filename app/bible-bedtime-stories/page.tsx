import { Suspense } from "react";
import ClientBiblePage from "./ClientBiblePage";
import WelcomeHero from "@/components/WelcomeHero";
import StorySelection from "@/components/StorySelection";
import BoundStoryPlayer from "@/components/BoundStoryPlayer";

export default function Page() {
  return (
    <div className="page-container">
      <WelcomeHero />
      <StorySelection />
      <BoundStoryPlayer />
      <Suspense fallback={<div className="p-6 text-sm opacity-70">Loading…</div>}>
        <ClientBiblePage />
      </Suspense>
    </div>
  );
}
