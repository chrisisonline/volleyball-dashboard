interface AvailabilityMeterProps {
  filled: number
  capacity: number
  className?: string
}

// Battery-style availability indicator: three small blocks that light up and
// escalate in color as a session fills. Breakpoints are on percent filled:
//   < 20%  → 1 block, green  (plenty of room)
//   20-80% → 2 blocks, yellow (filling up)
//   80-99% → 3 blocks, orange (almost full)
//   100%   → 3 blocks, red    (full)
export default function AvailabilityMeter({
  filled,
  capacity,
  className = '',
}: AvailabilityMeterProps) {
  const ratio = capacity > 0 ? filled / capacity : 0

  let litBlocks: number
  let color: string
  if (ratio >= 1) {
    litBlocks = 3
    color = 'bg-red-500'
  } else if (ratio >= 0.8) {
    litBlocks = 3
    color = 'bg-orange-500'
  } else if (ratio >= 0.2) {
    litBlocks = 2
    color = 'bg-yellow-400'
  } else {
    litBlocks = 1
    color = 'bg-green-500'
  }

  const spotsLeft = Math.max(0, capacity - filled)

  return (
    <span
      className={`inline-flex items-center gap-0.5 ${className}`}
      role="img"
      aria-label={
        spotsLeft === 0 ? 'Full' : `${spotsLeft} of ${capacity} spots left`
      }
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={`h-3 w-1.5 rounded-[1px] ${i < litBlocks ? color : 'bg-mist-600'}`}
        />
      ))}
    </span>
  )
}
