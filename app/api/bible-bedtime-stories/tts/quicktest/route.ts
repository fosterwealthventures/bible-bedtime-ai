// Prevent Next from trying to prerender/export this API route during build
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import fs from "fs";
import path from "path";
import { stableHashSync } from "@/lib/hash";
import { TextToSpeechClient } from "@google-cloud/text-to-speech";
import { loadGcpTtsCredentials } from "@/lib/gcpTtsCreds";

function getClient() {
  try {
    const creds = loadGcpTtsCredentials();
    
    // normalize PEM for OpenSSL
    if (typeof creds.private_key === "string") {
      let pk = creds.private_key;
      if (pk.includes("\\n")) pk = pk.replace(/\\n/g, "\n");
      pk = pk.replace(/\r\n/g, "\n").trim();
      if (!pk.startsWith("-----BEGIN PRIVATE KEY-----")) pk = "-----BEGIN PRIVATE KEY-----\n" + pk;
      if (!pk.endsWith("-----END PRIVATE KEY-----")) pk = pk + "\n-----END PRIVATE KEY-----";
      creds.private_key = pk;
    }

    const projectId = process.env.GCP_TTS_PROJECT_ID || creds.project_id;
    if (!projectId) throw new Error("No project id found. Set GCP_TTS_PROJECT_ID or include project_id in GCP_TTS_CREDENTIALS.");
    
    const client = new TextToSpeechClient({
      projectId,
      credentials: {
        client_email: creds.client_email,
        private_key: creds.private_key,
      },
    });
    return client;
  } catch (err: any) {
    throw new Error(`Failed to initialize TTS client: ${err?.message ?? err}`);
  }
}

const CACHE_DIR = "/tmp/tts-cache";
if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

export async function GET() {
  try {
    const text = "This is your Bible Bedtime Stories text to speech check. God bless you.";
    const languageCode = "en-US";
    const speakingRate = 0.9;
    const pitch = 0.0;

    const cacheKey = stableHashSync({ text, languageCode, speakingRate, pitch });
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
      ssmlGender: "FEMALE",
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
    return new Response(`Error processing TTS request: ${err?.message ?? err}`, { status: 500 });
  }
}