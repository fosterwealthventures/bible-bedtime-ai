export function placeholderArtUrl(title: string, theme?: string) {
  const T = (title || "").toLowerCase();
  const candidates: Record<string, string> = {
    lion: "🦁",
    daniel: "🦁",
    david: "🪄",
    goliath: "🛡️",
    ark: "🛶",
    noah: "🌧️",
    sea: "🌊",
    moses: "🪄",
    shepherd: "🐑",
    samaritan: "🤝",
    storm: "🌩️",
    father: "❤️",
    psalm: "🎵",
    kindness: "💖",
    protection: "🛡️",
    healing: "🌿",
    love: "💗",
    peace: "🕊️",
    joy: "🌟",
    thankfulness: "🙏",
    obedience: "📜",
  };

  let emoji = "📖";
  for (const key of Object.keys(candidates)) {
    if (T.includes(key)) {
      emoji = candidates[key];
      break;
    }
  }
  if (!theme && /peace|kindness|love|joy|thanks|heal|protect/.test(T)) {
    // already captured above if present
  } else if (theme) {
    const th = theme.toLowerCase();
    for (const key of Object.keys(candidates)) {
      if (th.includes(key)) {
        emoji = candidates[key];
        break;
      }
    }
  }

  const palettes = [
    ["#7c6cf5", "#b28cff"],
    ["#58c1ff", "#8fe1ff"],
    ["#68d391", "#b2f2bb"],
    ["#f6ad55", "#fbd38d"],
    ["#f472b6", "#fbcfe8"],
    ["#60a5fa", "#93c5fd"],
  ];
  let hash = 0;
  for (let i = 0; i < T.length; i++) hash = (hash * 31 + T.charCodeAt(i)) >>> 0;
  const [c1, c2] = palettes[hash % palettes.length];

  const safeTitle = (title || "Bible Bedtime Story").replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const svg = `
  <svg xmlns='http://www.w3.org/2000/svg' width='1200' height='630' viewBox='0 0 1200 630'>
    <defs>
      <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0%' stop-color='${c1}'/>
        <stop offset='100%' stop-color='${c2}'/>
      </linearGradient>
      <filter id='grain'>
        <feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/>
        <feColorMatrix type='saturate' values='0'/>
        <feComponentTransfer><feFuncA type='table' tableValues='0 0.08'/></feComponentTransfer>
        <feBlend mode='overlay'/>
      </filter>
    </defs>
    <rect width='100%' height='100%' fill='url(#g)'/>
    <g filter='url(#grain)'><rect width='100%' height='100%' fill='rgba(0,0,0,0.02)' /></g>
    <text x='50%' y='45%' dominant-baseline='middle' text-anchor='middle' font-size='220'>${emoji}</text>
    <text x='50%' y='70%' dominant-baseline='middle' text-anchor='middle'
          font-family='Inter, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial'
          font-size='46' fill='rgba(0,0,0,0.65)'>${safeTitle}</text>
  </svg>`;
  const encoded = encodeURIComponent(svg).replace(/'/g, "%27").replace(/"/g, "%22");
  return `data:image/svg+xml;charset=UTF-8,${encoded}`;
}

