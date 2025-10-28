export function loadGcpTtsCredentials(): any {
  const raw = process.env.GCP_TTS_CREDENTIALS || process.env.GCP_TTS_CREDENTIALS_B64;
  if (!raw) throw new Error("GCP_TTS_CREDENTIALS(_B64) not set");
  const json = raw.trim().startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8");
  return JSON.parse(json);
}