import { NextRequest, NextResponse } from "next/server";
import { TextToSpeechClient } from "@google-cloud/text-to-speech";
export const runtime = "nodejs";

/* env-driven Google TTS credentials (base64 preferred) */
const b64 = process.env.GCP_TTS_CREDENTIALS_B64;
const raw = b64 ? Buffer.from(b64, "base64").toString("utf8") : process.env.GCP_TTS_CREDENTIALS;
if (!raw) throw new Error("Missing GCP_TTS_CREDENTIALS_B64 (preferred) or GCP_TTS_CREDENTIALS.");

let sa: any;
try { sa = JSON.parse(raw as string); } catch { throw new Error("GCP_TTS_CREDENTIALS(_B64) is not valid JSON."); }
// normalize PEM for OpenSSL
if (typeof sa.private_key === "string") {
  let pk = sa.private_key;
  if (pk.includes("\\n")) pk = pk.replace(/\\n/g, "\n");
  pk = pk.replace(/\r\n/g, "\n").trim();
  if (!pk.startsWith("-----BEGIN PRIVATE KEY-----")) pk = "-----BEGIN PRIVATE KEY-----\n" + pk;
  if (!pk.endsWith("-----END PRIVATE KEY-----")) pk = pk + "\n-----END PRIVATE KEY-----";
  sa.private_key = pk;
}

const projectId = process.env.GCP_TTS_PROJECT_ID || sa.project_id;
if (!projectId) throw new Error("No project id found. Set GCP_TTS_PROJECT_ID or include project_id in GCP_TTS_CREDENTIALS.");

const client = new TextToSpeechClient({
  projectId,
  credentials: {
    client_email: sa.client_email,
    private_key: sa.private_key,
  },
});

export async function POST(req: NextRequest) {
  try {
    const { text, lang = "en-US" } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required", projectHint: process.env.GCP_TTS_PROJECT_ID || "(from JSON) " + (typeof sa === "object" ? sa.project_id : "unknown") }, { status: 400 });
    }

    const request = {
      input: { text },
      voice: {
        languageCode: lang,
        ssmlGender: "NEUTRAL" as const,
      },
      audioConfig: {
        audioEncoding: "MP3" as const,
      },
    };

    const [response] = await client.synthesizeSpeech(request);

    if (!response.audioContent) {
      return NextResponse.json({ error: "No audio content generated", projectHint: process.env.GCP_TTS_PROJECT_ID || "(from JSON) " + (typeof sa === "object" ? sa.project_id : "unknown") }, { status: 500 });
    }

    return new NextResponse(Buffer.from(response.audioContent), {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": response.audioContent.length.toString(),
        "X-GCP-Project": projectId,
      },
    });
  } catch (error) {
    console.error("TTS error:", error);
    return NextResponse.json({ error: "Internal server error", projectHint: process.env.GCP_TTS_PROJECT_ID || "(from JSON) " + (typeof sa === "object" ? sa.project_id : "unknown") }, { status: 500 });
  }
}