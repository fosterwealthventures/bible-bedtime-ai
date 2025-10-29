// lib/firebaseClient.ts
import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  type Auth,
  signInAnonymously,
  onAuthStateChanged,
} from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const cfg = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let _app: FirebaseApp;
let _auth: Auth;
let _db: Firestore;

export function firebaseApp(): FirebaseApp {
  if (!_app) _app = getApps().length ? getApp() : initializeApp(cfg);
  return _app;
}

export function firebaseAuth(): Auth {
  if (!_auth) _auth = getAuth(firebaseApp());
  return _auth;
}

export function firestore(): Firestore {
  if (!_db) _db = getFirestore(firebaseApp());
  return _db;
}

// Optional: anonymous auth helper (call in a client component)
export async function ensureAnonAuth(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  const auth = firebaseAuth();
  return new Promise(async (resolve) => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        await signInAnonymously(auth).catch(() => {});
      }
      resolve(auth.currentUser?.uid ?? null);
      unsub();
    });
  });
}

// Optional: Analytics only in browser, and only if supported
export async function initAnalytics() {
  if (typeof window === "undefined") return null;
  try {
    const { getAnalytics, isSupported } = await import("firebase/analytics");
    if (await isSupported()) return getAnalytics(firebaseApp());
  } catch {}
  return null;
}
