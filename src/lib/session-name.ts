import { parse, format } from 'date-fns'
import { find } from 'lodash-es'
import type { SessionRecord } from '~/types/dropin'

export function formatSessionTime(hour: string, minute: string): string {
  return format(parse(`${hour}:${minute}`, 'H:m', new Date()), 'h:mm a')
}

export function getSessionSortKey(session: SessionRecord): string {
  const { session_start_date, session_start_hour, session_start_minute } =
    session.properties
  return `${session_start_date}T${String(session_start_hour).padStart(2, '0')}:${String(session_start_minute).padStart(2, '0')}`
}

export interface ParsedSession {
  level: string
  group: string // drop-in: Co-Ed, Women's, etc.
  skill: string // clinic: Serving, Attacking, etc.
}

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
  Advanced: 'Adv',
  Beginner: 'Beg',
}

const CLINIC_SKILLS = [
  'Defense & Attack Transition',
  'Passing & Serve Reception',
  'Passing & Reception',
  'Attacking',
  'Serving',
  'Setting',
  'Defense',
]

const KNOWN_GROUPS = ["Women's", "Men's", 'Co-Ed', 'Mixed'] as const

function findLevel(name: string) {
  return find(KNOWN_LEVELS, (lvl) => name.includes(lvl)) ?? '---'
}

export function parseDropinName(name: string): ParsedSession {
  const level = findLevel(name)
  const group = find(KNOWN_GROUPS, (group) => name.includes(group)) ?? '---'
  return { level, group, skill: '' }
}

export function parseClinicName(name: string): ParsedSession {
  const level = findLevel(name)
  const skill = find(CLINIC_SKILLS, (skill) => name.includes(skill)) ?? '---'
  return { level, group: '', skill }
}

const LOCATION_SHORT: Record<string, string> = {
  'toronto volleyball centre': 'Downsview',
  'de la salle': 'De La Salle',
  york: 'York School',
}

export function shortenLocationName(name: string): string {
  const lower = name.toLowerCase()
  for (const [key, short] of Object.entries(LOCATION_SHORT)) {
    if (lower.includes(key)) return short
  }
  // Fallback: strip "The ", take first two words
  return name
    .replace(/^the\s+/i, '')
    .split(/\s+/)
    .slice(0, 2)
    .join(' ')
}
