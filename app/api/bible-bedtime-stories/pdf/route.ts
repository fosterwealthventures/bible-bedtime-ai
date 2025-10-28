import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

// Ensure these API routes never prerender and always use the Node runtime
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { story, prayer, verseRef, verseText, childName } = await req.json();

    const html = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; }
            p { line-height: 1.6; }
          </style>
        </head>
        <body>
          <h1>Bible Bedtime Story</h1>
          ${childName ? `<p>Dear ${childName},</p>` : ''}
          <h2>Story</h2>
          <p>${story}</p>
          <h2>Prayer</h2>
          <p>${prayer}</p>
          <h2>Verse Reference</h2>
          <p>${verseRef}</p>
          <h2>Verse Text</h2>
          <p>${verseText}</p>
        </body>
      </html>
    `;

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html);
    const pdf = await page.pdf({ format: 'A4' });
    await browser.close();

    return new NextResponse(Buffer.from(pdf as any), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="bedtime-story.pdf"',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Error generating PDF' }, { status: 500 });
  }
}