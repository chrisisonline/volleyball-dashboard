import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Maximize, Minimize, RotateCcw } from 'lucide-react'
import ConfirmModal from '~/components/ConfirmModal'
import { createBurst, type BurstParticle } from '~/lib/celebration'

// Shared look for every scoreboard control: circular, translucent grey fill,
// with a lighter translucent border so the rim reads brighter than the fill.
const controlBtn =
  'flex items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20 active:scale-95'

function ScoreCounter() {
  const [scores, setScores] = useState([0, 0])
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)

  const adjust = useCallback((team: 0 | 1, delta: number) => {
    setScores((prev) => {
      const next = [...prev]
      next[team] = Math.max(0, next[team] + delta)
      return next
    })
  }, [])

  const reset = useCallback(() => {
    setShowResetModal(true)
  }, [])

  const confirmReset = useCallback(() => {
    setScores([0, 0])
    setShowResetModal(false)
  }, [])

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
        setIsFullscreen(true)
      } else {
        await document.exitFullscreen()
        setIsFullscreen(false)
      }
    } catch {
      // Fullscreen not supported or denied
    }
  }, [])

  return (
    <div className="relative flex h-dvh w-screen bg-(--color-ink) text-white select-none">
      {showResetModal && (
        <ConfirmModal
          message="Reset both scores to 0?"
          confirmLabel="Reset"
          onConfirm={confirmReset}
          onCancel={() => setShowResetModal(false)}
        />
      )}
      {/* Floating buttons */}
      <a
        href={import.meta.env.BASE_URL}
        aria-label="Back to home"
        className={`absolute top-3 left-3 z-10 size-14 ${controlBtn}`}
      >
        <ArrowLeft size={26} />
      </a>
      <button
        onClick={reset}
        aria-label="Reset scores"
        className={`absolute top-3 left-1/2 z-10 size-14 -translate-x-1/2 ${controlBtn}`}
      >
        <RotateCcw size={26} />
      </button>
      <button
        onClick={toggleFullscreen}
        aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        className={`absolute top-3 right-3 z-10 size-14 ${controlBtn}`}
      >
        {isFullscreen ? <Minimize size={26} /> : <Maximize size={26} />}
      </button>

      {/* Score panels */}
      <TeamPanel
        label="Home"
        score={scores[0]}
        onIncrement={() => adjust(0, 1)}
        onDecrement={() => adjust(0, -1)}
        bgClass="bg-blue-800"
        activeBgClass="active:bg-blue-700"
      />
      <div className="w-1 bg-(--color-ink)" />
      <TeamPanel
        label="Away"
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
  score,
  onIncrement,
  onDecrement,
  bgClass,
  activeBgClass,
}: {
  label: string
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

  return (
    <div
      className={`flex flex-1 flex-col items-center justify-between pt-6 pb-4 ${bgClass}`}
    >
      {/* Label */}
      <div className="text-lg font-bold tracking-widest text-white/70 uppercase">
        {label}
      </div>

      {/* Score — contained increment button */}
      <div className="relative flex items-center justify-center">
        <button
          onClick={handleIncrement}
          className={`flex size-[66vmin] items-center justify-center rounded-full ${bgClass} ${activeBgClass} transition active:ring-white/70`}
        >
          <span className="font-(family-name:--font-score) text-[45vmin] leading-none font-bold text-white tabular-nums">
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

      {/* Decrement button */}
      <button
        onClick={onDecrement}
        aria-label="Subtract one point"
        className={`size-19 text-2xl font-semibold ${controlBtn}`}
      >
        &minus;1
      </button>
    </div>
  )
}

export default ScoreCounter
