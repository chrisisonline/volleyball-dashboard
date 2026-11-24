import type { Attachment } from 'svelte/attachments'

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

// Spread evenly around a full circle, with a little jitter so it never looks
// mechanical, and flung outward a random distance.
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

const at = (p: number, scale: number, x = 0, y = 0, rotate = 0) =>
  `translate(${x * p}px, ${y * p}px) rotate(${rotate * p}deg) scale(${scale})`

export function fly(
  particle: BurstParticle,
  onDone: () => void
): Attachment<HTMLElement> {
  return (node) => {
    const { x, y, rotate, scale } = particle
    const animation = node.animate(
      [
        { offset: 0, opacity: 0, transform: at(0, 0.2) },
        {
          offset: 1 / 3,
          opacity: 1,
          transform: at(1 / 3, scale * 1.3, x, y, rotate),
        },
        {
          offset: 2 / 3,
          opacity: 1,
          transform: at(2 / 3, scale, x, y, rotate),
        },
        { offset: 1, opacity: 0, transform: at(1, scale * 0.9, x, y, rotate) },
      ],
      {
        duration: 1200,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        fill: 'forwards',
      }
    )
    animation.onfinish = onDone
    return () => animation.cancel()
  }
}
