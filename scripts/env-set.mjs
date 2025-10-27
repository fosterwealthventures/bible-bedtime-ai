import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";

const args = process.argv.slice(2).filter(Boolean);
if (args.length === 0 || !args.every(a => a.includes("="))) {
  console.error("Usage: npm run env:set -- KEY=VALUE [ANOTHER=VAL2 ...]");
  process.exit(1);
}

const envPath = resolve(process.cwd(), ".env.local");
let lines = [];
if (existsSync(envPath)) {
  lines = readFileSync(envPath, "utf8").split(/\\r?\\n/);
} else {
  lines = [];
}

const setMap = new Map(args.map(a => {
  const idx = a.indexOf("=");
  const k = a.slice(0, idx).trim();
  const v = a.slice(idx + 1);
  return [k, v];
}));

// Build a map of existing keys -> line index
const keyLineIdx = new Map();
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (!line || line.trim().startsWith("#")) continue;
  const eq = line.indexOf("=");
  if (eq > 0) {
    const k = line.slice(0, eq).trim();
    keyLineIdx.set(k, i);
  }
}

// Update or append
for (const [k, v] of setMap.entries()) {
  const newLine = `${k}=${v}`;
  if (keyLineIdx.has(k)) {
    lines[keyLineIdx.get(k)] = newLine;
    console.log(`Updated ${k}`);
  } else {
    lines.push(newLine);
    console.log(`Added ${k}`);
  }
}

// Ensure trailing newline
if (lines.length && lines[lines.length - 1] !== "") lines.push("");

writeFileSync(envPath, lines.join("\\n"), { encoding: "utf8" });
console.log("✔ .env.local saved:", envPath);