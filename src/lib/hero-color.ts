const PALETTE: { bg: string; accent: string }[] = [
  { bg: "#1a1c2a", accent: "#7b8cde" },
  { bg: "#1a2a1f", accent: "#6db87a" },
  { bg: "#2a1a1a", accent: "#c97d7d" },
  { bg: "#1a1f2a", accent: "#7da5c9" },
  { bg: "#2a1a2a", accent: "#b97db9" },
  { bg: "#1a2a2a", accent: "#6db8b8" },
  { bg: "#2a241a", accent: "#c9a47d" },
  { bg: "#201a2a", accent: "#9680c9" },
  { bg: "#1a2420", accent: "#6d8a7a" },
  { bg: "#2a1f1a", accent: "#c98e7d" },
  { bg: "#1e1a24", accent: "#8e7db9" },
  { bg: "#1a2224", accent: "#6d96a0" },
  { bg: "#24201a", accent: "#a08e6d" },
  { bg: "#1a1e24", accent: "#6d82a0" },
  { bg: "#241a1e", accent: "#a06d82" },
  { bg: "#1c2022", accent: "#8a969e" },
  { bg: "#221e1a", accent: "#968a6d" },
  { bg: "#1a2024", accent: "#6d8a9e" },
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

export function resolveHeroBackground(input?: string | null, seed?: string): {
  background: string;
  accent: string;
  isImage: boolean;
} {
  if (input && (input.startsWith("http") || input.startsWith("/"))) {
    return {
      background: `url(${input}) center/cover no-repeat`,
      accent: PALETTE[0].accent,
      isImage: true,
    };
  }

  if (input && /^#[0-9a-fA-F]{3,8}$/.test(input)) {
    return {
      background: input,
      accent: PALETTE[0].accent,
      isImage: false,
    };
  }

  const index = hashString(seed ?? "default") % PALETTE.length;
  const color = PALETTE[index];
  return {
    background: color.bg,
    accent: color.accent,
    isImage: false,
  };
}

export { PALETTE };
export const PALETTE_COLORS = PALETTE.map((p) => p.bg);
