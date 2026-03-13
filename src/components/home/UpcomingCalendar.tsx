import { useMemo } from 'react'
import { QueryClientProvider, useQuery } from '@tanstack/react-query'
import { parse, parseISO, format, addDays, startOfDay, startOfWeek, isWithinInterval, isBefore } from 'date-fns'

import { getCachedSchedule, fetchDropinSchedule, fetchClinicSchedule } from '~/lib/dropin-api'
import { queryClient } from '~/lib/query-client'
import { parseDropinName, parseClinicName, LEVEL_SHORT } from '~/lib/session-name'
import type { SessionRecord } from '~/types/dropin' // used in TaggedSession + useMemo

type SessionType = 'dropin' | 'clinic'

interface TaggedSession {
  session: SessionRecord
  type: SessionType
}

// ─── Session Card ─────────────────────────────────────────────────────────────

function SessionCard({ session, type }: TaggedSession) {
  const { session_start_hour, session_start_minute, session_capacity, private_signup_link, session_name } =
    session.properties
  const timeStr = format(parse(`${session_start_hour}:${session_start_minute}`, 'H:m', new Date()), 'h:mm a')
  const spotsLeft = session_capacity - session.slotsFilled
  const parsed = type === 'dropin' ? parseDropinName(session_name) : parseClinicName(session_name)
  const levelLabel = parsed.level ? (LEVEL_SHORT[parsed.level] ?? parsed.level) : null

  return (
    <button
      className="w-full text-left rounded p-1.5 bg-mist-700 hover:bg-mist-600 transition-colors"
      onClick={() => window.open(private_signup_link, '_blank')}
    >
      <div className="text-base font-bold">{timeStr}</div>
      <div className="text-base text-mist-300 mt-0.5">
        {[levelLabel, parsed.group ?? parsed.skill].filter(Boolean).join(' · ')}
      </div>
      <div className="flex justify-between items-center mt-1">
        <span className={`text-sm font-bold px-1 rounded ${type === 'dropin' ? 'bg-cyan-900' : 'bg-indigo-800'}`}>
          {type === 'dropin' ? 'Drop In' : 'Clinic'}
        </span>
        <span className={`text-sm ${spotsLeft <= 2 ? 'text-red-400' : 'text-mist-400'}`}>
          {session.slotsFilled}/{session_capacity}
        </span>
      </div>
    </button>
  )
}

// ─── Day Cell ─────────────────────────────────────────────────────────────────

function DayCell({ day, sessions }: { day: Date; sessions: TaggedSession[] }) {
  const today = startOfDay(new Date())
  const isToday = format(day, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
  const isPast = isBefore(day, today)
  return (
    <div className={`rounded-lg p-2 min-h-24 flex flex-col gap-1 ${isToday ? 'bg-mist-900/50 ring-1 ring-mist-500' : 'bg-mist-900'} ${isPast ? 'opacity-40' : ''}`}>
      <div className="flex lg:flex-col lg:text-center items-baseline gap-2 lg:gap-0 mb-1">
        <div className={`text-sm font-bold ${isToday ? 'text-white' : ''}`}>
          {format(day, 'EEE')} <span className="lg:hidden">{format(day, 'MMM d')}</span><span className="hidden lg:inline">{format(day, 'd')}</span>
        </div>
        {isToday && <span className="text-sm text-mist-400 lg:hidden">Today</span>}
      </div>
      {sessions.map(({ session, type }) => (
        <SessionCard key={session.id} session={session} type={type} />
      ))}
    </div>
  )
}

// ─── Calendar ─────────────────────────────────────────────────────────────────

function Calendar() {
  const { data: dropinData } = useQuery({
    queryKey: ['dropin-schedule'],
    queryFn: fetchDropinSchedule,
    initialData: () => getCachedSchedule('dropin-schedule'),
    initialDataUpdatedAt: 0,
  })

  const { data: clinicData } = useQuery({
    queryKey: ['clinic-schedule'],
    queryFn: fetchClinicSchedule,
    initialData: () => getCachedSchedule('clinic-schedule'),
    initialDataUpdatedAt: 0,
  })

  const today = startOfDay(new Date())
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }) // Monday
  const days = Array.from({ length: 14 }, (_, i) => addDays(weekStart, i))

  const sessionsByDate = useMemo(() => {
    const map: Record<string, TaggedSession[]> = {}

    const add = (records: SessionRecord[] | undefined, type: SessionType) => {
      records?.forEach((session) => {
        const date = parseISO(session.properties.session_start_date)
        if (!isWithinInterval(date, { start: weekStart, end: addDays(weekStart, 13) })) return
        const key = session.properties.session_start_date
        ;(map[key] ??= []).push({ session, type })
      })
    }

    add(dropinData?.records, 'dropin')
    add(clinicData?.records, 'clinic')

    Object.values(map).forEach((sessions) =>
      sessions.sort((a, b) => {
        const t = (s: SessionRecord) =>
          `${String(s.properties.session_start_hour).padStart(2, '0')}:${String(s.properties.session_start_minute).padStart(2, '0')}`
        return t(a.session).localeCompare(t(b.session))
      })
    )

    return map
  }, [dropinData, clinicData])

  const [week1, week2] = [days.slice(0, 7), days.slice(7)]

  const renderWeek = (week: Date[]) => (
    <div className="grid grid-cols-1 lg:grid-cols-7 gap-2">
      {week.map((day) => (
        <DayCell
          key={format(day, 'yyyy-MM-dd')}
          day={day}
          sessions={sessionsByDate[format(day, 'yyyy-MM-dd')] ?? []}
        />
      ))}
    </div>
  )

  return (
    <div className="flex flex-col gap-3">
      {renderWeek(week1)}
      {renderWeek(week2)}
    </div>
  )
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default function UpcomingCalendar() {
  return (
    <QueryClientProvider client={queryClient}>
      <Calendar />
    </QueryClientProvider>
  )
}
