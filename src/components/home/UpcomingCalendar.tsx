import { useMemo } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import {
  format,
  addDays,
  startOfDay,
  startOfWeek,
  isWithinInterval,
  isBefore,
} from 'date-fns'

import { useSessionQuery } from '~/lib/hooks'
import { queryClient } from '~/lib/query-client'
import {
  parseDropinName,
  parseClinicName,
  LEVEL_SHORT,
  SKILL_SHORT,
  shortenLocationName,
  formatSessionTime,
  getSessionSortKey,
  getSignupUrl,
} from '~/lib/session-name'
import type { SessionRecord, SessionType } from '~/types/momentum'

interface TaggedSession {
  session: SessionRecord
  type: SessionType
}

// ─── Session Card ─────────────────────────────────────────────────────────────

function SessionCard({ session, type }: TaggedSession) {
  const {
    session_start_hour,
    session_start_minute,
    session_capacity,
    session_name,
  } = session.properties
  const timeStr = formatSessionTime(session_start_hour, session_start_minute)
  const spotsLeft = session_capacity - session.slotsFilled
  const parsed =
    type === 'dropin'
      ? parseDropinName(session_name)
      : parseClinicName(session_name)
  const levelLabel = parsed.level
    ? (LEVEL_SHORT[parsed.level] ?? parsed.level)
    : null
  const locationLabel = shortenLocationName(
    session.locationObject?.record?.properties?.location_name ?? ''
  )

  return (
    <button
      className="w-full rounded bg-mist-700 p-1.5 text-left transition-colors hover:bg-mist-600"
      onClick={() =>
        window.open(
          getSignupUrl(
            session.id,
            session.programObject.record.properties.program_type
          ),
          '_blank'
        )
      }
    >
      <div className="text-base font-bold">{timeStr}</div>
      <div className="mt-0.5 text-base text-mist-300">
        {[
          levelLabel,
          parsed.group || (parsed.skill ? (SKILL_SHORT[parsed.skill] ?? parsed.skill) : null),
        ]
          .filter(Boolean)
          .join(' · ')}
      </div>
      <div className="mt-0.5 text-base text-mist-300">{locationLabel}</div>
      <div className="mt-1 flex items-center justify-between">
        <span
          className={`rounded px-1 text-sm font-bold ${type === 'dropin' ? 'bg-cyan-900' : 'bg-indigo-800'}`}
        >
          {type === 'dropin' ? 'Drop In' : 'Clinic'}
        </span>
        <span
          className={`text-sm ${spotsLeft === 0 ? 'text-red-400' : spotsLeft < 3 ? 'text-yellow-400' : 'text-mist-400'}`}
        >
          {session.slotsFilled}/{session_capacity}
        </span>
      </div>
    </button>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="w-full rounded bg-mist-700 p-1.5">
      <div className="h-4 w-16 animate-pulse rounded bg-mist-500/50" />
      <div className="mt-1 h-3 w-24 animate-pulse rounded bg-mist-500/50" />
      <div className="mt-1 h-3 w-20 animate-pulse rounded bg-mist-500/50" />
      <div className="mt-2 h-3 w-12 animate-pulse rounded bg-mist-500/50" />
    </div>
  )
}

function SkeletonDayCell({ day }: { day: Date }) {
  const today = startOfDay(new Date())
  const isToday = format(day, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
  const isPast = isBefore(day, today)
  return (
    <div
      className={`flex min-h-24 flex-col gap-1 rounded-lg p-2 ${isToday ? 'bg-mist-900/50 ring-1 ring-mist-500' : 'bg-mist-900'} ${isPast ? 'opacity-40' : ''}`}
    >
      <div className="mb-1 flex items-baseline gap-2 lg:flex-col lg:gap-0 lg:text-center">
        <div className={`text-sm font-bold ${isToday ? 'text-white' : ''}`}>
          {format(day, 'EEE')}{' '}
          <span className="lg:hidden">{format(day, 'MMM d')}</span>
          <span className="hidden lg:inline">{format(day, 'd')}</span>
        </div>
      </div>
      <SkeletonCard />
    </div>
  )
}

function SkeletonWeek({ week }: { week: Date[] }) {
  return (
    <div className="grid grid-cols-1 gap-2 lg:grid-cols-7">
      {week.map((day) => (
        <SkeletonDayCell key={format(day, 'yyyy-MM-dd')} day={day} />
      ))}
    </div>
  )
}

// ─── Day Cell ─────────────────────────────────────────────────────────────────

function DayCell({ day, sessions }: { day: Date; sessions: TaggedSession[] }) {
  const today = startOfDay(new Date())
  const isToday = format(day, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
  const isPast = isBefore(day, today)
  return (
    <div
      className={`flex min-h-24 flex-col gap-1 rounded-lg p-2 ${isToday ? 'bg-mist-900/50 ring-1 ring-mist-500' : 'bg-mist-900'} ${isPast ? 'opacity-40' : ''}`}
    >
      <div className="mb-1 flex items-baseline gap-2 lg:flex-col lg:gap-0 lg:text-center">
        <div className={`text-sm font-bold ${isToday ? 'text-white' : ''}`}>
          {format(day, 'EEE')}{' '}
          <span className="lg:hidden">{format(day, 'MMM d')}</span>
          <span className="hidden lg:inline">{format(day, 'd')}</span>
        </div>
        {isToday && (
          <span className="text-sm text-mist-400 lg:hidden">Today</span>
        )}
      </div>
      {sessions.map(({ session, type }) => (
        <SessionCard key={session.id} session={session} type={type} />
      ))}
    </div>
  )
}

// ─── Calendar ─────────────────────────────────────────────────────────────────

function Calendar() {
  const { data: dropinData, isLoading: dropinLoading } = useSessionQuery('dropin')
  const { data: clinicData, isLoading: clinicLoading } = useSessionQuery('clinic')

  const today = startOfDay(new Date())
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }) // Monday
  const days = Array.from({ length: 14 }, (_, i) => addDays(weekStart, i))
  const [week1, week2] = [days.slice(0, 7), days.slice(7)]

  const sessionsByDate = useMemo(() => {
    const map: Record<string, TaggedSession[]> = {}

    const add = (records: SessionRecord[] | undefined, type: SessionType) => {
      records?.forEach((session) => {
        const key = session.properties.session_start_date
        const date = new Date(key)
        if (
          !isWithinInterval(date, {
            start: weekStart,
            end: addDays(weekStart, 13),
          })
        )
          return
        ;(map[key] ??= []).push({ session, type })
      })
    }

    add(dropinData?.records, 'dropin')
    add(clinicData?.records, 'clinic')

    Object.values(map).forEach((sessions) =>
      sessions.sort((a, b) =>
        getSessionSortKey(a.session).localeCompare(getSessionSortKey(b.session))
      )
    )

    return map
  }, [dropinData, clinicData, weekStart])

  if (dropinLoading || clinicLoading) {
    return (
      <div className="flex flex-col gap-3">
        <SkeletonWeek week={week1} />
        <SkeletonWeek week={week2} />
      </div>
    )
  }

  const renderWeek = (week: Date[]) => (
    <div className="grid grid-cols-1 gap-2 lg:grid-cols-7">
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
