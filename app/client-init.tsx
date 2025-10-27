"use client";

import { useEffect } from "react";

/**
 * Runs client-only bootstraps that were previously in layout.tsx.
 * Move any window-only code here (analytics, theme, SW, etc).
 */
export default function ClientInit() {
  useEffect(() => {
    // Example: register a service worker (uncomment if you use it)
    // if ("serviceWorker" in navigator) {
    //   navigator.serviceWorker.register("/sw.js").catch(console.error);
    // }
  }, []);

  return null;
}