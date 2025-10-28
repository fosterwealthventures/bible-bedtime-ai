export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

export async function GET() {
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY);
  const hasTts = Boolean(process.env.GCP_TTS_CREDENTIALS || process.env.GCP_TTS_CREDENTIALS_B64);
  const project = process.env.GCP_TTS_PROJECT_ID || "";
  return Response.json({
    ok: true,
    env: {
      GEMINI_API_KEY: hasGeminiKey ? "present" : "missing",
      GCP_TTS_PROJECT_ID: project ? "present" : "missing",
      TTS_CREDENTIALS: hasTts ? "present" : "missing",
    },
  });
}