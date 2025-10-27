// lib/tts-browser.ts
// Browser-only Text-to-Speech helper with voice readiness and AudioContext resume.

export type TTSOptions = {
  voice?: string;   // exact voice name
  rate?: number;    // 0.1–10 (default 1)
  pitch?: number;   // 0–2   (default 1)
  volume?: number;  // 0–1   (default 1)
};

let audioCtx: AudioContext | null = null;

function ensureAudioContext() {
  if (typeof window === "undefined") return;
  if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
}

export async function ensureVoices(): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return [];
  const synth = window.speechSynthesis;

  const waitForVoices = () =>
    new Promise<SpeechSynthesisVoice[]>((resolve) => {
      const list = synth.getVoices();
      if (list && list.length) return resolve(list);

      const onvoiceschanged = () => {
        synth.removeEventListener("voiceschanged", onvoiceschanged);
        resolve(synth.getVoices());
      };
      synth.addEventListener("voiceschanged", onvoiceschanged);

      // Fallback in case event doesn't fire
      setTimeout(() => resolve(synth.getVoices()), 1000);
    });

  return await waitForVoices();
}

export async function speakText(text: string, opts: TTSOptions = {}) {
  if (typeof window === "undefined" || !("speechSynthesis" in window) || !text?.trim()) return;

  ensureAudioContext();
  try {
    if (audioCtx && audioCtx.state === "suspended") {
      await audioCtx.resume();
    }
  } catch {}

  const synth = window.speechSynthesis;
  synth.cancel(); // clear any queued speech

  const voices = await ensureVoices();

  const utter = new SpeechSynthesisUtterance(text);
  if (opts.rate) utter.rate = opts.rate;
  if (opts.pitch) utter.pitch = opts.pitch;
  if (opts.volume !== undefined) utter.volume = opts.volume;

  if (opts.voice) {
    const match = voices.find((v) => v.name === opts.voice);
    if (match) utter.voice = match;
  } else {
    const en = voices.find((v) => v.lang?.toLowerCase().startsWith("en")) ?? voices[0];
    if (en) utter.voice = en;
  }

  synth.speak(utter);
}

export function stopSpeaking() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
}
