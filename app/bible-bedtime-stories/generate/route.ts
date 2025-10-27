import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { theme, lang = "en" } = await req.json();

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Generate a short Bible bedtime story based on the theme: ${theme}. Include a title, subtitle, story text, a short prayer, a memory verse reference, and the verse text. Format as JSON: { title: "...", subtitle: "...", text: "...", prayer: "...", verseRef: "...", verseText: "..." }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the JSON response
    const data = JSON.parse(text);

    // Generate image
    const imagePrompt = `A gentle, watercolor illustration for a children's Bible bedtime story about ${theme}. Soft, calming colors, child-safe, bedtime theme.`;
    const imageRes = await fetch('/api/bible-bedtime-stories/image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: imagePrompt, size: '1024x1024', n: 1 }),
    });

    if (imageRes.ok) {
      const imageData = await imageRes.json();
      if (imageData.images && imageData.images.length > 0) {
        data.image = imageData.images[0]; // base64 image
      }
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error generating story:', error);
    return NextResponse.json({ error: 'Error generating story' }, { status: 500 });
  }
}
