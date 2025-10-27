import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { stableHash } from "../../../../lib/hash";

// IMPORTANT: We'll use a service-account JSON stored in an env var (GCP_TTS_CREDENTIALS)
// so we don't need a file on disk in Vercel/Netlify.
import { TextToSpeechClient } from "@google-cloud/text-to-speech";

export const runtime = "nodejs";

type Body = {
  text: string;
  languageCode?: string; // e.g., "en-US", "es-US"
  voiceName?: string;    // optional specific voice id
  speakingRate?: number; // 0.7–1.1 for bedtime
  pitch?: number;        // -5 to +5
};

function getClient() {
  const creds = process.env.GCP_TTS_CREDENTIALS;
  if (!creds) throw new Error("Missing GCP_TTS_CREDENTIALS env var");
  const json = JSON.parse(creds);
  const client = new TextToSpeechClient({
    credentials: {
      client_email: json.client_email,
      private_key: json.private_key,
    },
    projectId: json.project_id,
  });
  return client;
}

const CACHE_DIR = "/tmp/tts-cache";
if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Body;
    const {
      text,
      languageCode = "en-US",
      voiceName,
      speakingRate = 0.9,
      pitch = 0.0,
    } = body || {};

    if (!text || !text.trim()) {
      return NextResponse.json({ error: "Text required" }, { status: 400 });
    }

    const cacheKey = stableHash({ text, languageCode, voiceName, speakingRate, pitch });
    const cacheFile = path.join(CACHE_DIR, `${cacheKey}.mp3`);

    if (fs.existsSync(cacheFile)) {
      const buf = fs.readFileSync(cacheFile);
      return new NextResponse(buf, {
        status: 200,
        headers: {
          "Content-Type": "audio/mpeg",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    const client = getClient();

    const request: any = {
      input: { text },
      voice: {
        languageCode,
        name: voiceName || undefined,
        ssmlGender: "FEMALE", // gentle by default; change as you like
      },
      audioConfig: {
        audioEncoding: "MP3",
        speakingRate,
        pitch,
      },
    };

    const [response] = await client.synthesizeSpeech(request);
    const audioContent = response.audioContent;
    if (!audioContent) {
      return NextResponse.json({ error: "NoAudio" }, { status: 502 });
    }

    fs.writeFileSync(cacheFile, audioContent as Buffer);

    return new NextResponse(Buffer.from(audioContent as Buffer), {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err: any) {
    console.error("bedtime/tts error:", err?.message || err);
    return NextResponse.json({ error: "ServerError" }, { status: 500 });
  }
}
