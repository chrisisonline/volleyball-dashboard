<script lang="ts">
  import { createBurst, fly } from '$lib/celebration'
  import type { BurstParticle } from '$lib/celebration'
  import { TEAMS } from '$lib/scoreboard.svelte'
  import type { Scoreboard, Team } from '$lib/scoreboard.svelte'

  let { board, team }: { board: Scoreboard; team: Team } = $props()

  const { label, color } = $derived(TEAMS[team])
  let bursts = $state<BurstParticle[]>([])
  const wide = $derived(board.layout === 'stacked')

  function increment() {
    board.add(team)
    bursts.push(...createBurst(5))
  }

  function removeBurst(id: number) {
    bursts = bursts.filter((b) => b.id !== id)
  }
</script>

<!-- Size containment lets the score scale with this panel (cqw/cqh) rather
     than the viewport. -->
<section
  aria-label={label}
  class:wide
  style:--team={`var(--color-${color})`}
  style:--team-active={`var(--color-${color}-active)`}
>
  <div class="label">{label}</div>

  <div class="circle-wrap">
    <button
      class="circle"
      onclick={increment}
      aria-label={`Add point to ${label}`}
    >
      <span class="score" data-testid={`${label.toLowerCase()}-score`}>
        {board.scores[team]}
      </span>
    </button>

    <div class="bursts">
      {#each bursts as b (b.id)}
        <span class="particle" {@attach fly(b, () => removeBurst(b.id))}>
          {b.emoji}
        </span>
      {/each}
    </div>
  </div>

  <button
    class="control subtract"
    onclick={() => board.subtract(team)}
    aria-label={`Subtract point from ${label}`}
  >
    &minus;1
  </button>
</section>

<style>
  /* A tall panel stacks label / score / −1, so the circle gets the height
     left after the label, button and padding (10rem). A wide panel (stacked
     board) tucks the label in a corner and −1 at the side so the score gets
     the full height. */
  section {
    container-type: size;
    position: relative;
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    min-width: 0;
    min-height: 0;
    padding-block: 1rem;
    background: var(--team);
    --circle: min(85cqw, calc(100cqh - 10rem));
  }

  section.wide {
    flex-direction: row;
    justify-content: center;
    padding-block: 0;
    --circle: min(calc(100cqw - 12rem), calc(100cqh - 2rem));
  }

  .label {
    font-size: 1.125rem;
    line-height: 1.75rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgb(255 255 255 / 0.7);
  }

  .wide .label {
    position: absolute;
    top: 0.75rem;
    left: 1rem;
  }

  .circle-wrap {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 0;
  }

  .circle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--circle);
    height: var(--circle);
    border-radius: 9999px;
    background: var(--team);
    transition: background-color 150ms;
  }

  .circle:active {
    background: var(--team-active);
  }

  .score {
    font-family: var(--font-score);
    font-size: calc(var(--circle) * 0.68);
    line-height: 1;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }

  .bursts {
    pointer-events: none;
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .particle {
    position: absolute;
    font-size: 3.75rem;
    line-height: 1;
    opacity: 0;
  }

  @media (min-width: 40rem) {
    .particle {
      font-size: 4.5rem;
    }
  }

  .subtract {
    width: 4rem;
    height: 4rem;
    font-size: 1.5rem;
    line-height: 2rem;
    font-weight: 600;
  }

  .wide .subtract {
    position: absolute;
    top: 50%;
    right: 1rem;
    translate: 0 -50%;
  }
</style>
