import { MediaQuery } from 'svelte/reactivity'

export type Team = 0 | 1
export type Layout = 'stacked' | 'side-by-side'

export const TEAMS = [
  { label: 'Home', color: 'home' },
  { label: 'Away', color: 'away' },
] as const satisfies readonly [unknown, unknown]

export class Scoreboard {
  scores = $state<[number, number]>([0, 0])
  rotated = $state(false)

  #portrait = new MediaQuery('(orientation: portrait)')

  // A rotated board is laid out at the swapped viewport size, so its own
  // arrangement flips relative to the screen's orientation.
  layout: Layout = $derived(
    this.#portrait.current !== this.rotated ? 'stacked' : 'side-by-side'
  )

  add(team: Team) {
    this.scores[team] += 1
  }

  subtract(team: Team) {
    this.scores[team] = Math.max(0, this.scores[team] - 1)
  }

  reset() {
    this.scores = [0, 0]
  }

  toggleRotated() {
    this.rotated = !this.rotated
  }
}
