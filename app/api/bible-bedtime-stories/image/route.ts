import { NextRequest, NextResponse } from "next/server";

// Uses Google AI Studio Image Generation API (Imagen 3) with the SAME API key as Gemini.
// Keep this server-side only to avoid exposing the key.
const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.IMAGEN_MODEL || "imagen-3.0";  // other options: imagen-3.0-fast

export const runtime = "nodejs";

type Body = {
  prompt: string;
  size?: "1024x1024" | "768x1024" | "1024x768";
  n?: number; // number of images (1–4)
};

function parseSize(sz?: string) {
  switch (sz) {
    case "768x1024": return { width: 768, height: 1024 };
    case "1024x768": return { width: 1024, height: 768 };
    default: return { width: 1024, height: 1024 };
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!API_KEY) {
      return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });
    }
    const { prompt, size = "1024x1024", n = 1 } = (await req.json()) as Body;
    if (!prompt || !prompt.trim()) {
      return NextResponse.json({ error: "Prompt required" }, { status: 400 });
    }

    const { width, height } = parseSize(size);

    // NOTE: This endpoint is the Google AI Images (Imagen) generate endpoint.
    // Auth is via API key query param (?key=), not Bearer.
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateImage?key=${API_KEY}`;

    const payload = {
      // A minimal, safe payload. Adjust as Google updates the schema.
      // We request up to n images; the API may cap at 4.
      // Safety: bedtime-friendly output only.
      // Guidance: soft, watercolor, gentle palette for kids.
      // For production, consider adding safetySettings as needed.
      instances: Array.from({ length: Math.min(Math.max(n, 1), 4) }, () => ({
        prompt: {
          text: prompt + " | style: soft, watercolor, gentle bedtime palette, child-safe, low contrast",
        },
        image: { width, height },
      })),
    };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (!res.ok) {
      return NextResponse.json({ error: "ImagenError", details: json }, { status: 502 });
    }

    // Expected shape: { predictions: [{ bytesBase64: "..." }, ...] }
    const images = (json?.predictions || [])
      .map((p: any) => p?.bytesBase64)
      .filter(Boolean);

    return NextResponse.json({
      model: MODEL,
      images,              // base64-encoded PNGs
      mime: "image/png",
      size: { width, height }
    });
  } catch (err: any) {
    console.error("bedtime/image error:", err);
    return NextResponse.json({ error: "ServerError" }, { status: 500 });
  }
}