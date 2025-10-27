import crypto from "crypto";

export function stableHash(input: unknown): string {
  const str = typeof input === "string" ? input : JSON.stringify(input);
  return crypto.createHash("sha256").update(str).digest("hex").slice(0, 32);
}