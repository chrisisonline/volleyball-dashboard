<script lang="ts">
  import Maximize from '@lucide/svelte/icons/maximize'
  import Minimize from '@lucide/svelte/icons/minimize'
  import RotateCcw from '@lucide/svelte/icons/rotate-ccw'
  import RotateCwSquare from '@lucide/svelte/icons/rotate-cw-square'
  import ConfirmModal from '$lib/ConfirmModal.svelte'
  import TeamPanel from '$lib/TeamPanel.svelte'
  import { Fullscreen } from '$lib/fullscreen.svelte'
  import { Scoreboard } from '$lib/scoreboard.svelte'

  const board = new Scoreboard()
  const fullscreen = new Fullscreen()
  let confirmingReset = $state(false)
</script>

<div
  class="scoreboard"
  data-testid="board"
  data-layout={board.layout}
  data-rotated={board.rotated || undefined}
>
  {#if confirmingReset}
    <ConfirmModal
      message="Reset both scores to 0?"
      confirmLabel="Reset"
      onConfirm={() => {
        board.reset()
        confirmingReset = false
      }}
      onCancel={() => (confirmingReset = false)}
    />
  {/if}

  <TeamPanel {board} team={0} />

  <!-- Controls live in the seam between panels so they never cover a score. -->
  <div class="seam">
    <button
      class="control"
      onclick={() => (confirmingReset = true)}
      aria-label="Reset scores"
    >
      <RotateCcw size={26} />
    </button>
    <button
      class="control"
      onclick={() => board.toggleRotated()}
      aria-label="Rotate scoreboard"
      aria-pressed={board.rotated}
    >
      <RotateCwSquare size={26} />
    </button>
    {#if fullscreen.isSupported}
      <button
        class="control"
        onclick={fullscreen.toggle}
        aria-label={fullscreen.isFullscreen
          ? 'Exit fullscreen'
          : 'Enter fullscreen'}
      >
        {#if fullscreen.isFullscreen}
          <Minimize size={26} />
        {:else}
          <Maximize size={26} />
        {/if}
      </button>
    {/if}
  </div>

  <TeamPanel {board} team={1} />
</div>

<style>
  /* Pinned to the viewport edges (no viewport units, so pre-15.4 Safari
     sizes it too). Padding keeps content clear of the notch and home bar. */
  .scoreboard {
    position: fixed;
    inset: 0;
    display: flex;
    flex-direction: row;
    overflow: hidden;
    padding: env(safe-area-inset-top) env(safe-area-inset-right)
      env(safe-area-inset-bottom) env(safe-area-inset-left);
    background: var(--color-ink);
    color: white;
    touch-action: manipulation;
    user-select: none;
    -webkit-user-select: none;
  }

  .scoreboard[data-layout='stacked'] {
    flex-direction: column;
  }

  /* Rotated: laid out at the swapped viewport size, then turned 90° about
     its top-left corner, which sits on the viewport's top-right corner. Each
     board edge lands on a different screen edge, so the insets shift too. */
  .scoreboard[data-rotated] {
    inset: auto;
    top: 0;
    left: 100%;
    width: 100vh;
    width: 100dvh;
    height: 100vw;
    height: 100dvw;
    transform-origin: top left;
    transform: rotate(90deg);
    padding: env(safe-area-inset-right) env(safe-area-inset-bottom)
      env(safe-area-inset-left) env(safe-area-inset-top);
  }

  .seam {
    display: flex;
    flex-shrink: 0;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    width: 4.5rem;
  }

  [data-layout='stacked'] .seam {
    flex-direction: row;
    width: auto;
    height: 4.5rem;
  }

  .seam .control {
    width: 3.5rem;
    height: 3.5rem;
  }
</style>
