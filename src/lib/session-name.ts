export interface ParsedSession {
  level: string | null
  group: string | null  // drop-in: Co-Ed, Women's, etc.
  skill: string | null  // clinic: Serving, Attacking, etc.
}

// Order matters — more specific first to avoid partial matches
const KNOWN_LEVELS = [
  'Intermediate Plus/Advanced',
  'Intermediate/Intermediate Plus',
  'Beginner/Early Intermediate',
  'Advanced',
  'Beginner',
] as const

export const LEVEL_SHORT: Record<string, string> = {
  'Beginner/Early Intermediate': 'Beg/Int-',
  'Intermediate/Intermediate Plus': 'Int/Int+',
  'Intermediate Plus/Advanced': 'Int+/Adv',
  'Advanced': 'Adv',
  'Beginner': 'Beg',
}

const KNOWN_GROUPS = ["Women's", "Men's", "Co-Ed", "Mixed"] as const

function stripCode(name: string): string {
  return name.replace(/\s*\([A-Z0-9-]+\)\s*$/, '').trim()
}

// Strips "*PROMO PRICE* Thursday 7PM: " style prefixes from drop-in names
function stripDropinPrefix(name: string): string {
  return name
    .replace(/\*[^*]+\*\s*/g, '')                          // *PROMO PRICE*
    .replace(/^\w+\s+\d+\s*(?:AM|PM)\s*:\s*/i, '')        // "Thursday 7PM: "
    .trim()
}

function extractLevel(name: string): { level: string | null; remaining: string } {
  for (const lvl of KNOWN_LEVELS) {
    if (name.startsWith(lvl)) {
      return { level: lvl, remaining: name.slice(lvl.length).trim() }
    }
  }
  return { level: null, remaining: name }
}

export function parseDropinName(name: string): ParsedSession {
  const { level, remaining } = extractLevel(stripCode(stripDropinPrefix(name)))
  const group = KNOWN_GROUPS.find((g) => remaining.includes(g)) ?? null
  return { level, group, skill: null }
}

export function parseClinicName(name: string): ParsedSession {
  const { level, remaining } = extractLevel(stripCode(name))
  // Remove trailing number: "Serving 2" → "Serving"
  const skill = remaining.replace(/\s+\d+$/, '').trim() || null
  return { level, group: null, skill }
}
