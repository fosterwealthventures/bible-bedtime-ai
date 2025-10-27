import type { BinaryLike } from "crypto";

export function stableHashSync(input: unknown): string {
  // Lazy-load Node crypto so Edge bundles won’t break
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const crypto = require("crypto") as typeof import("crypto");
  const str = typeof input === "string" ? input : JSON.stringify(input);
  return crypto.createHash("sha256").update(str as BinaryLike).digest("hex").slice(0, 32);
}

export async function stableHash(input: unknown): Promise<string> {
  const str = typeof input === "string" ? input : JSON.stringify(input);

  if (globalThis.crypto?.subtle) {
    const data = new TextEncoder().encode(str);
    const buf = await globalThis.crypto.subtle.digest("SHA-256", data);
    const bytes = Array.from(new Uint8Array(buf));
    return bytes.map(b => b.toString(16).padStart(2, "0")).join("").slice(0, 32);
  }

  return stableHashSync(str);
}