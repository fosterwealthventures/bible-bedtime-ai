# Bible Bedtime Stories App

A Next.js PWA for generating personalized Bible bedtime stories.

## Setup

1. Install dependencies: `npm install`
2. Set up environment variables in `.env.local`:
   - GEMINI_API_KEY: Your Google AI Studio API key
   - GCP_TTS_CREDENTIALS: JSON string of your Google Cloud TTS service account
3. Run the development server: `npm run dev`
4. Open [http://localhost:3000/bible-bedtime-stories](http://localhost:3000/bible-bedtime-stories)

## Features

- Generate stories by theme, age, and length
- Browser TTS for narration
- Printable PDF
- PWA support

## Notes

- For production, consider using cloud TTS for better quality.
- Ensure API keys are secure.
