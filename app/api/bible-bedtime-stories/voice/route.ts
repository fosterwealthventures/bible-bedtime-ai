import { NextRequest, NextResponse } from "next/server";
import { TextToSpeechClient } from "@google-cloud/text-to-speech";
import { loadGcpTtsCredentials } from "@/lib/gcpTtsCreds";

// Ensure these API routes never prerender and always use the Node runtime
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    // ensure node runtime and no prerender (declared at file top by step #1)
    let creds: any;
    try { 
      creds = loadGcpTtsCredentials(); 
    } catch (e: any) { 
      return new Response(`TTS creds missing: ${e?.message ?? e}`, { status: 500 }); 
    }
    
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

    const { text, lang = "en-US" } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required", projectHint: projectId }, { status: 400 });
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
      return NextResponse.json({ error: "No audio content generated", projectHint: projectId }, { status: 500 });
    }

    // Generate/obtain audio as a Uint8Array/Buffer named `audioBytes`
    const audioBytes = Buffer.from(response.audioContent);

    return new Response(audioBytes, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
        "Content-Length": String(audioBytes.length),
        "Accept-Ranges": "bytes"
      },
    });
  } catch (error) {
    console.error("Voice TTS error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}