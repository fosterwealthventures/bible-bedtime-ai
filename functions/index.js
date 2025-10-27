import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Storage } from '@google-cloud/storage';
import textToSpeech from '@google-cloud/text-to-speech';
import fetch from 'node-fetch';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';

admin.initializeApp();
const storage = new Storage();
const ttsClient = new textToSpeech.TextToSpeechClient();
const BUCKET = `${process.env.GCLOUD_PROJECT}.appspot.com`;

function stableHash(input) {
  const str = typeof input === 'string' ? input : JSON.stringify(input);
  return crypto.createHash('sha256').update(str).digest('hex').slice(0, 32);
}

function getGemini(model = process.env.GEMINI_MODEL || 'gemini-1.5-flash') {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('Missing GEMINI_API_KEY');
  const genAI = new GoogleGenerativeAI(key);
  return genAI.getGenerativeModel({ model });
}

function requireAuth(context){
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Sign in required.');
  }
  return context.auth.uid;
}

async function putPublicFile(buffer, destPath, contentType='application/octet-stream'){
  const bucket = storage.bucket(BUCKET);
  const file = bucket.file(destPath);
  await file.save(buffer, { contentType, resumable:false, public: false });
  const [signedUrl] = await file.getSignedUrl({ action: 'read', expires: Date.now() + 1000*60*60*24 });
  return { signedUrl, gsPath: `gs://${BUCKET}/${destPath}` };
}

const CACHE_DIR = '/tmp/tts-cache';
if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

export const generateNarration = functions.https.onCall(async (data, context) => {
  const uid = requireAuth(context);
  const { text = '', durationMin = 15, lang = 'en' } = data || {};
  if (!text) throw new functions.https.HttpsError('invalid-argument', 'text required');

  const voice = (lang === 'es') ? { languageCode: 'es-US', name: 'es-US-Neural2-B' }
                                : { languageCode: 'en-US', name: 'en-US-Neural2-C' };
  const speakingRate = durationMin >= 45 ? 0.85 : durationMin >= 30 ? 0.9 : 0.95;

  const cacheKey = stableHash({ text, voice, speakingRate, pitch: -2.0 });
  const cacheFile = path.join(CACHE_DIR, `${cacheKey}.mp3`);

  if (fs.existsSync(cacheFile)) {
    const buffer = fs.readFileSync(cacheFile);
    const dest = `stories/tts/${uid}/${Date.now()}-${lang}-${durationMin}.mp3`;
    const { signedUrl } = await putPublicFile(buffer, dest, 'audio/mpeg');
    return { audioUrl: signedUrl };
  }

  const [resp] = await ttsClient.synthesizeSpeech({
    input: { text },
    voice,
    audioConfig: { audioEncoding: 'MP3', speakingRate, pitch: -2.0 }
  });

  const buffer = Buffer.from(resp.audioContent, 'binary');
  fs.writeFileSync(cacheFile, buffer);

  const dest = `stories/tts/${uid}/${Date.now()}-${lang}-${durationMin}.mp3`;
  const { signedUrl } = await putPublicFile(buffer, dest, 'audio/mpeg');
  return { audioUrl: signedUrl };
});

export const quicktestGemini = functions.https.onCall(async (data, context) => {
  try {
    const model = getGemini();
    const prompt = 'Reply with a short JSON: {"ok":true,"msg":"Gemini key works"}';
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const clean = text.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
    let json;
    try {
      json = JSON.parse(clean);
    } catch {
      json = { raw: text };
    }
    return { model: process.env.GEMINI_MODEL || 'gemini-1.5-flash', response: json };
  } catch (err) {
    throw new functions.https.HttpsError('internal', err.message);
  }
});

export const generateImage = functions.https.onCall(async (data, context) => {
  const uid = requireAuth(context);
  const { title = 'Bedtime Bible', theme = 'love', ageRange = 'Ages 3–6' } = data || {};
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new functions.https.HttpsError('failed-precondition', 'GEMINI_API_KEY not set');
  }

  const prompt = `${title} | theme: ${theme}, age: ${ageRange}, style: soft, watercolor, gentle bedtime palette, child-safe, low contrast, Bible story illustration`;
  const model = 'imagen-3.0';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateImage?key=${apiKey}`;

  const payload = {
    instances: [{
      prompt: { text: prompt },
      image: { width: 1024, height: 1024 }
    }]
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new functions.https.HttpsError('internal', `Imagen API error: ${error.error?.message || 'Unknown'}`);
  }

  const json = await response.json();
  const images = json?.predictions?.map(p => p?.bytesBase64).filter(Boolean);

  if (!images || images.length === 0) {
    throw new functions.https.HttpsError('internal', 'No images generated');
  }

  // Upload the first image to Firebase Storage
  const buffer = Buffer.from(images[0], 'base64');
  const dest = `stories/images/${uid}/${Date.now()}.png`;
  const { signedUrl } = await putPublicFile(buffer, dest, 'image/png');

  return { imageUrl: signedUrl };
});

export const generateFullStory = functions.https.onCall(async (data, context) => {
  const uid = requireAuth(context);
  const { theme = 'love', durationMin = 15, language = 'en', ageRange = 'Ages 3–6', title } = data || {};

  // Generate story using Gemini
  const model = getGemini();
  const prompt = `Create a short, calming bedtime Bible story for ${ageRange} in ${language}. Theme: ${theme}. Length: ${durationMin} minutes. Include: 1 short prayer, 1 memory verse, 1 talk-about-it question. Format as JSON: {"title": "...", "subtitle": "...", "story": "...", "verse": "...", "verseText": "...", "prayer": "...", "question": "..."}. Keep it gentle, positive, and faith-based.`;
  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const clean = text.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  let storyData;
  try {
    storyData = JSON.parse(clean);
  } catch (err) {
    throw new functions.https.HttpsError('internal', 'Failed to parse Gemini response');
  }

  // Generate image using Imagen
  const imagePrompt = `${storyData.title} | theme: ${theme}, age: ${ageRange}, style: soft, watercolor, gentle bedtime palette, child-safe, low contrast, Bible story illustration`;
  const imageModel = 'imagen-3.0';
  const imageUrl = `https://generativelanguage.googleapis.com/v1beta/models/${imageModel}:generateImage?key=${process.env.GEMINI_API_KEY}`;
  const imagePayload = {
    instances: [{
      prompt: { text: imagePrompt },
      image: { width: 1024, height: 1024 }
    }]
  };
  const imageResponse = await fetch(imageUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(imagePayload)
  });
  if (!imageResponse.ok) {
    throw new functions.https.HttpsError('internal', 'Imagen API error');
  }
  const imageJson = await imageResponse.json();
  const images = imageJson?.predictions?.map(p => p?.bytesBase64).filter(Boolean);
  const buffer = Buffer.from(images[0], 'base64');
  const dest = `stories/images/${uid}/${Date.now()}.png`;
  const { signedUrl } = await putPublicFile(buffer, dest, 'image/png');

  return { ...storyData, imageUrl: signedUrl };
});
