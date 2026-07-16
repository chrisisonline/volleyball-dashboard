// Helpers for the scoreboard's point-scored emoji burst.

export const CELEBRATION_EMOJIS = ['🏐', '🎉', '🔥', '💥', '⭐', '👏', '🙌']

export type BurstParticle = {
  id: number
  emoji: string
  x: number
  y: number
  rotate: number
  scale: number
}

const randomBetween = (min: number, max: number) =>
  min + Math.random() * (max - min)

const randomItem = <T>(items: readonly T[]) =>
  items[Math.floor(Math.random() * items.length)]

let particleId = 0

// Build one burst of emoji particles, spread evenly around a full circle
// (with a little jitter so it never looks mechanical) and flung outward a
// random distance.
export function createBurst(count = 14): BurstParticle[] {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 + randomBetween(-0.4, 0.4)
    const distance = randomBetween(180, 440)
    return {
      id: particleId++,
      emoji: randomItem(CELEBRATION_EMOJIS),
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      rotate: randomBetween(-180, 180),
      scale: randomBetween(0.8, 1.7),
    }
  })
}
