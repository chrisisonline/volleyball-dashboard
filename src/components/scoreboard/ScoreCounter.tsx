import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Maximize, Minimize, RotateCcw, RotateCwSquare } from 'lucide-react'
import ConfirmModal from '~/components/ConfirmModal'
import { createBurst, type BurstParticle } from '~/lib/celebration'
import { useFullscreen } from '~/lib/use-fullscreen'
import { useMediaQuery } from '~/lib/use-media-query'

// Shared look for every scoreboard control: circular, translucent grey fill,
// with a lighter translucent border so the rim reads brighter than the fill.
const controlBtn =
  'flex shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20 active:scale-95'

function ScoreCounter() {
  const [scores, setScores] = useState([0, 0])
  const [showResetModal, setShowResetModal] = useState(false)
  const [rotated, setRotated] = useState(false)
  const fullscreen = useFullscreen()
  const isPortrait = useMediaQuery('(orientation: portrait)')
  const stacked = isPortrait !== rotated

  const adjust = useCallback((team: 0 | 1, delta: number) => {
    setScores((prev) => {
      const next = [...prev]
      next[team] = Math.max(0, next[team] + delta)
      return next
    })
  }, [])

  const confirmReset = useCallback(() => {
    setScores([0, 0])
    setShowResetModal(false)
  }, [])

  return (
    <div
      data-testid="board"
      data-layout={stacked ? 'stacked' : 'side-by-side'}
      data-rotated={rotated || undefined}
      className={`scoreboard flex touch-manipulation overflow-hidden bg-(--color-ink) text-white select-none ${stacked ? 'flex-col' : 'flex-row'}`}
    >
      {showResetModal && (
        <ConfirmModal
          message="Reset both scores to 0?"
          confirmLabel="Reset"
          onConfirm={confirmReset}
          onCancel={() => setShowResetModal(false)}
        />
      )}

      <TeamPanel
        label="Home"
        wide={stacked}
        score={scores[0]}
        onIncrement={() => adjust(0, 1)}
        onDecrement={() => adjust(0, -1)}
        bgClass="bg-blue-800"
        activeBgClass="active:bg-blue-700"
      />

      {/* Controls live in the seam between panels so they never cover a score. */}
      <div
        className={`flex shrink-0 items-center justify-center gap-3 ${stacked ? 'h-18 flex-row' : 'w-18 flex-col'}`}
      >
        <button
          onClick={() => setShowResetModal(true)}
          aria-label="Reset scores"
          className={`size-14 ${controlBtn}`}
        >
          <RotateCcw size={26} />
        </button>
        <button
          onClick={() => setRotated((r) => !r)}
          aria-label="Rotate scoreboard"
          aria-pressed={rotated}
          className={`size-14 ${controlBtn}`}
        >
          <RotateCwSquare size={26} />
        </button>
        {fullscreen.isSupported && (
          <button
            onClick={fullscreen.toggle}
            aria-label={
              fullscreen.isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'
            }
            className={`size-14 ${controlBtn}`}
          >
            {fullscreen.isFullscreen ? (
              <Minimize size={26} />
            ) : (
              <Maximize size={26} />
            )}
          </button>
        )}
      </div>

      <TeamPanel
        label="Away"
        wide={stacked}
        score={scores[1]}
        onIncrement={() => adjust(1, 1)}
        onDecrement={() => adjust(1, -1)}
        bgClass="bg-red-800"
        activeBgClass="active:bg-red-700"
      />
    </div>
  )
}

function TeamPanel({
  label,
  wide,
  score,
  onIncrement,
  onDecrement,
  bgClass,
  activeBgClass,
}: {
  label: string
  wide: boolean
  score: number
  onIncrement: () => void
  onDecrement: () => void
  bgClass: string
  activeBgClass: string
}) {
  const [bursts, setBursts] = useState<BurstParticle[]>([])

  const handleIncrement = useCallback(() => {
    onIncrement()
    setBursts((prev) => [...prev, ...createBurst(5)])
  }, [onIncrement])

  const removeBurst = useCallback((id: number) => {
    setBursts((prev) => prev.filter((b) => b.id !== id))
  }, [])

  // Size containment lets the score scale with this panel (cqw/cqh) rather
  // than the viewport, which is what overflowed in portrait. A tall panel
  // stacks label / score / −1, so the circle gets the height left after the
  // label, button and padding (10rem). A wide panel (stacked board) tucks the
  // label in a corner and −1 at the side so the score gets the full height.
  return (
    <section
      aria-label={label}
      className={`@container-[size] relative flex min-h-0 min-w-0 flex-1 items-center ${bgClass} ${
        wide
          ? 'justify-center [--circle:min(calc(100cqw-12rem),calc(100cqh-2rem))]'
          : 'flex-col justify-between py-4 [--circle:min(85cqw,calc(100cqh-10rem))]'
      }`}
    >
      <div
        className={`text-lg font-bold tracking-widest text-white/70 uppercase ${wide ? 'absolute top-3 left-4' : ''}`}
      >
        {label}
      </div>

      <div className="relative flex min-h-0 items-center justify-center">
        <button
          onClick={handleIncrement}
          aria-label={`Add point to ${label}`}
          className={`flex size-(--circle) items-center justify-center rounded-full ${bgClass} ${activeBgClass} transition`}
        >
          <span
            data-testid={`${label.toLowerCase()}-score`}
            className="font-(family-name:--font-score) text-[calc(var(--circle)*0.68)] leading-none font-bold text-white tabular-nums"
          >
            {score}
          </span>
        </button>

        {/* Celebration emoji burst */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          {bursts.map((b) => (
            <motion.span
              key={b.id}
              className="absolute text-6xl sm:text-7xl"
              initial={{ opacity: 0, scale: 0.2, x: 0, y: 0, rotate: 0 }}
              animate={{
                opacity: [0, 1, 1, 0],
                scale: [0.2, b.scale * 1.3, b.scale, b.scale * 0.9],
                x: b.x,
                y: b.y,
                rotate: b.rotate,
              }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              onAnimationComplete={() => removeBurst(b.id)}
            >
              {b.emoji}
            </motion.span>
          ))}
        </div>
      </div>

      <button
        onClick={onDecrement}
        aria-label={`Subtract point from ${label}`}
        className={`size-16 text-2xl font-semibold ${controlBtn} ${wide ? 'absolute top-1/2 right-4 -translate-y-1/2' : ''}`}
      >
        &minus;1
      </button>
    </section>
  )
}

export default ScoreCounter
