import type { ScheduleItem } from '~/types/schedule'
import { parse, format, isFuture } from 'date-fns'

interface NextGameProps {
  schedule: ScheduleItem[]
}

export default function NextGame({ schedule }: NextGameProps) {
  const upcomingGame = schedule
    .flatMap((day) =>
      day.games.map((game) => {
        const gameDateTime = parse(
          `${day.date} ${game.time}`,
          'yyyy-MM-dd h:mm a',
          new Date()
        )
        return {
          ...game,
          dateObj: gameDateTime,
        }
      })
    )
    .find((game) => isFuture(game.dateObj))

  if (!upcomingGame) {
    return (
      <div className="rounded-lg bg-mist-700 p-4 text-center">
        No more games this season. See you next year!
      </div>
    )
  }

  return (
    <div className="rounded-lg bg-mist-900 p-4">
      <h2 className="mb-2 text-xl font-bold">Next Game</h2>
      <p>{format(upcomingGame.dateObj, 'EEEE, MMMM d, yyyy')}</p>
      <p>
        {format(upcomingGame.dateObj, 'p')} on Court {upcomingGame.court}
      </p>
      <p>vs {upcomingGame.opponent}</p>
    </div>
  )
}
