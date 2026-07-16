import { useState, useCallback } from 'react'
import { ArrowLeft, Maximize, Minimize, RotateCcw } from 'lucide-react'
import Button from '~/components/Button'
import ConfirmModal from '~/components/ConfirmModal'

const btnClass = 'bg-mist-800'

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
      <Button
        href={import.meta.env.BASE_URL}
        icon={ArrowLeft}
        className={`absolute top-2 left-2 z-10 ${btnClass}`}
      />
      <Button
        onClick={reset}
        icon={RotateCcw}
        className={`absolute top-2 left-1/2 z-10 -translate-x-1/2 ${btnClass}`}
      />
      <Button
        onClick={toggleFullscreen}
        icon={isFullscreen ? Minimize : Maximize}
        className={`absolute top-2 right-2 z-10 ${btnClass}`}
      />

      {/* Score panels */}
      <TeamPanel
        label="Home"
        score={scores[0]}
        onIncrement={() => adjust(0, 1)}
        onDecrement={() => adjust(0, -1)}
        bgClass="bg-teal-500"
        activeBgClass="active:bg-teal-400"
      />
      <div className="w-1 bg-(--color-ink)" />
      <TeamPanel
        label="Away"
        score={scores[1]}
        onIncrement={() => adjust(1, 1)}
        onDecrement={() => adjust(1, -1)}
        bgClass="bg-orange-500"
        activeBgClass="active:bg-orange-400"
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
  return (
    <div
      className={`flex flex-1 flex-col items-center justify-between pt-6 pb-4 ${bgClass}`}
    >
      {/* Label */}
      <div className="text-lg font-bold tracking-widest text-black/60 uppercase">
        {label}
      </div>

      {/* Score — contained increment button */}
      <button
        onClick={onIncrement}
        className={`rounded-none px-15 py-5 ${bgClass} ${activeBgClass} ring-4 ring-black/15 transition-colors active:ring-black/30`}
      >
        <span className="text-[min(50vw,50vh)] leading-none font-black text-black/85 tabular-nums">
          {score}
        </span>
      </button>

      {/* Decrement button */}
      <Button onClick={onDecrement} className="bg-mist-800">
        &minus; 1
      </Button>
    </div>
  )
}

export default ScoreCounter
