import StoryPlayer from "@/components/StoryPlayer";

export default function PlayerSection() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <StoryPlayer
        src="/api/tts/stream?storyId=jairus-daughter"
        title="Jairus’ Daughter"
        subtitle="Age 5–8 • 10 min • EN"
        artwork="/bible-bedtime-hero.png"
        lang="en"
        transcript={`[full generated story text here...]`}
        scripture={{ ref: "Mark 5:21–43", text: "…" }}
        prayer={`Dear Jesus, thank You for Your healing love... Amen.`}
        discussion={[
          "Where did Jairus go for help?",
          "How did Jesus show His power?",
          "When you feel afraid, how can you pray?"
        ]}
        onDownloadHref="/api/tts/download?storyId=jairus-daughter"
        onRegenerate={() => { /* call your generate endpoint with current options */ }}
        onEnd={() => { /* enqueue next story or show 'The End' */ }}
      />
    </div>
  );
}

