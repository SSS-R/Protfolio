// Static facts the admin panel doesn't manage (contact, socials, nav) plus
// small formatters that turn the legacy HUD-style data into readable copy.

export const SITE = {
  name: 'Sultan Sajed Shahriar',
  email: 'sultan.txt.official@gmail.com',
  location: 'Dhaka, Bangladesh',
  coords: '23.81° N — 90.41° E',
  timeZone: 'Asia/Dhaka',
  socials: [
    { label: 'GitHub', href: 'https://github.com/SSS-R' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/sultan-sajed-shahriar-a71478288/' },
  ],
} as const;

export const NAV = [
  { label: 'Work', href: '/work' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
] as const;

/** "READY_FOR_QUESTS" → "Ready for quests". Leaves normal text alone. */
export function pretty(value: string | undefined): string {
  if (!value) return '';
  if (!value.includes('_') && value !== value.toUpperCase()) return value;
  const words = value.replace(/_/g, ' ').trim().toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

// Pixel-art placeholders from the v2 theme. They are icons, not project art or
// photos, so the v3 design falls back to its generated covers / no portrait.
const LEGACY_ASSETS = new Set([
  '/images/network_nodes.png',
  '/images/pc_tower.png',
  '/images/developer_avatar.png',
]);

export function isRealImage(src: string | undefined): src is string {
  return !!src && !LEGACY_ASSETS.has(src);
}

const SKILL_NAMES: Record<string, string> = {
  PY: 'Python',
  CPP: 'C++',
  JAVA: 'Java',
  JS: 'JavaScript',
  TS: 'TypeScript',
  C: 'C',
  REACT: 'React',
  NEXT: 'Next.js',
  FASTAPI: 'FastAPI',
  TW: 'Tailwind CSS',
  GIT: 'Git',
  DOCKER: 'Docker',
  REDIS: 'Redis',
  NODE: 'Node.js',
};

export function skillName(code: string): string {
  return SKILL_NAMES[code.toUpperCase()] ?? code;
}

export const CATEGORY_LABEL: Record<string, string> = {
  SHIPPED: 'Shipped',
  ACTIVE: 'In progress',
  TBD: 'Lab & academic',
};

/** "[ JUL 2025 - FEB 2026 ]" → "Jul 2025 — Feb 2026" */
export function prettyRange(range: string): string {
  return range
    .replace(/[[\]]/g, '')
    .trim()
    .split(/\s+-\s+/)
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(' — ');
}

/** Honest label for a project link: a bare profile URL is not "source code". */
export function linkLabel(href: string | undefined): string | null {
  if (!href) return null;
  if (/github\.com\/[^/]+\/?$/.test(href)) return 'GitHub';
  if (href.includes('github.com')) return 'Repository';
  return 'Live site';
}
