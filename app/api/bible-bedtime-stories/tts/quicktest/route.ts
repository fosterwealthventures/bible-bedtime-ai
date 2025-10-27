import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import fs from "fs";
import path from "path";
import { stableHash } from "../../../../lib/hash";
import { TextToSpeechClient } from "@google-cloud/text-to-speech";

export const runtime = "nodejs";

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

export async function GET() {
  const text = "This is your Bible Bedtime Stories text to speech check. God bless you.";
  const languageCode = "en-US";
  const speakingRate = 0.9;
  const pitch = 0.0;

  const cacheKey = stableHash({ text, languageCode, speakingRate, pitch });
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
}