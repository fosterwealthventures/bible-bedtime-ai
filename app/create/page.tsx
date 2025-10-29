import dynamic from "next/dynamic";

// Load the client component only on the client
const BedtimeStoryUI = dynamic(() => import("@/app/bible-bedtime-stories/voice/BedtimeStoryUI"), { ssr: false });

export const metadata = {
  title: "Create • Bible Bedtime Stories",
  description: "Generate a gentle Bible bedtime story with prayer and verse.",
};

export default function CreatePage() {
  return <BedtimeStoryUI />;
}

