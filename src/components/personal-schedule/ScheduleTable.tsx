import { Fragment, useMemo } from 'react'
import type { ScheduleItem } from '~/types/schedule'
import { format, isAfter, parse } from 'date-fns'

interface ScheduleProps {
  schedule: ScheduleItem[]
}

export default function ScheduleTable({ schedule }: ScheduleProps) {
  const filteredSchedule = useMemo(() => {
    const now = new Date()
    return (schedule ?? [])
      .map((item) => ({
        ...item,
        games: item.games.filter((game) => {
          const gameDate = parse(
            `${item.date} ${game.time}`,
            'yyyy-MM-dd h:mm a',
            new Date()
          )
          return isAfter(gameDate, now)
        }),
      }))
      .filter((item) => item.games.length > 0)
  }, [schedule])

  if (filteredSchedule.length === 0) {
    return <div>No upcoming games.</div>
  }

  return (
    <div className="table-wrapper">
      <table>
        <tbody>
          {filteredSchedule.map((item) => (
            <Fragment key={item.date}>
              <tr>
                <td colSpan={3} className="font-medium text-mist-100">
                  {format(
                    parse(item.date, 'yyyy-MM-dd', new Date()),
                    'EEEE, MMMM d, yyyy'
                  )}
                </td>
              </tr>
              {item.games.map((game) => (
                <tr key={`${item.date}-${game.time}-${game.opponent}`}>
                  <td>
                    {format(
                      parse(
                        `${item.date} ${game.time}`,
                        'yyyy-MM-dd h:mm a',
                        new Date()
                      ),
                      'p'
                    )}
                  </td>
                  <td>vs {game.opponent}</td>
                  <td>Court {game.court}</td>
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  )
}
