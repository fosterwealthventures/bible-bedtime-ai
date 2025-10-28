// app/api/tts/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";

type SA = {
  client_email: string;
  private_key: string; // PEM
};

function loadServiceAccount(): SA | null {
  const raw = process.env.GCP_TTS_CREDENTIALS;
  const b64 = process.env.GCP_TTS_CREDENTIALS_B64;

  try {
    if (raw) {
      return JSON.parse(raw) as SA;
    }
    if (b64) {
      const json = Buffer.from(b64, "base64").toString("utf8");
      return JSON.parse(json) as SA;
    }
  } catch (e) {
    // fall through
  }
  return null;
}

async function getAccessToken(sa: SA): Promise<string> {
  // Build a self-signed JWT for OAuth 2.0 Service Account flow
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claim = {
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/cloud-platform",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const enc = (obj: any) =>
    Buffer.from(JSON.stringify(obj)).toString("base64url");
  const unsigned = `${enc(header)}.${enc(claim)}`;

  const signer = crypto.createSign("RSA-SHA256");
  signer.update(unsigned);
  signer.end();
  const signature = signer.sign(sa.private_key).toString("base64url");

  const assertion = `${unsigned}.${signature}`;

  const form = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion,
  });

  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
    cache: "no-store",
  });

  if (!r.ok) {
    const err = await r.text();
    throw new Error(`OAuth token error: ${r.status} ${err}`);
  }

  const json = (await r.json()) as { access_token: string };
  return json.access_token;
}

export async function POST(req: Request) {
  const sa = loadServiceAccount();

  // No creds? Tell client to use browser TTS fallback gracefully.
  if (!sa) {
    return NextResponse.json({ fallback: true }, { status: 200 });
  }

  try {
    const { text, voice = "en-US-Neural2-C", lang = "EN" } = await req.json();

    const accessToken = await getAccessToken(sa);

    const r = await fetch("https://texttospeech.googleapis.com/v1/text:synthesize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: { text },
        voice: {
          languageCode: lang === "ES" ? "es-US" : "en-US",
          name: voice,
        },
        audioConfig: {
          audioEncoding: "MP3",
          speakingRate: 0.95,
        },
      }),
      cache: "no-store",
    });

    if (!r.ok) {
      const err = await r.text();
      // Surface fallback → client will switch to Web Speech API
      return NextResponse.json(
        { fallback: true, error: `TTS error: ${r.status} ${err}` },
        { status: 200 }
      );
    }

    const data = await r.json();
    return NextResponse.json({ mp3Base64: data.audioContent });
  } catch (e: any) {
    return NextResponse.json(
      { fallback: true, error: e?.message ?? "TTS failure" },
      { status: 200 }
    );
  }
}