"use client";
import {
  ensureAnonAuth,
  firebaseAuth,
  firestore,
} from "@/lib/firebaseClient";
import type { LibraryItem } from "@/types/library";
import { useEffect, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  type Unsubscribe,
} from "firebase/firestore";

// Firestore paths
const colPath = (uid: string) => `libraries/${uid}/stories`;

async function ensureDbContext() {
  if (typeof window === "undefined") {
    throw new Error("Firestore client is only available in the browser.");
  }
  await ensureAnonAuth();
  const auth = firebaseAuth();
  const uid = auth.currentUser?.uid ?? "anon-local";
  const db = firestore();
  return { db, uid };
}

export function useLibrary() {
  const [items, setItems] = useState<LibraryItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsub: Unsubscribe | null = null;
    let mounted = true;
    (async () => {
      try {
        const { db, uid } = await ensureDbContext();
        const q = query(
          collection(db, colPath(uid)),
          orderBy("lastPlayedAt", "desc")
        );
        unsub = onSnapshot(
          q,
          (snap) => {
            const next: LibraryItem[] = snap.docs.map((d) => ({
              id: d.id,
              ...d.data(),
            })) as any;
            if (mounted) setItems(next);
          },
          (err) => {
            if (mounted) setError(String(err));
          }
        );
      } catch (e: any) {
        if (mounted) setError(String(e?.message || e));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
      if (unsub) unsub();
    };
  }, []);

  return { items, loading, error } as const;
}

export async function upsertLibraryItem(item: LibraryItem) {
  try {
    const { db, uid } = await ensureDbContext();
    const ref = doc(collection(db, colPath(uid)), item.slug);
    await setDoc(ref, { ...item, updatedAt: Date.now() }, { merge: true });
  } catch {
    // Swallow errors to match previous fail-safe behavior
  }
}

export async function updateProgress(slug: string, progressSec: number) {
  try {
    const { db, uid } = await ensureDbContext();
    const ref = doc(collection(db, colPath(uid)), slug);
    await updateDoc(ref, { progressSec, lastPlayedAt: Date.now() });
  } catch {
    // Ignore failures; progress tracking is best-effort
  }
}
