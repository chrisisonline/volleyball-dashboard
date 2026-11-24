import { useMemo } from 'react'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import {
  format,
  addDays,
  startOfDay,
  startOfWeek,
  isWithinInterval,
  isBefore,
} from 'date-fns'

import AvailabilityMeter from '~/components/AvailabilityMeter'
import { useSessionQuery } from '~/lib/hooks'
import { queryClient, persister } from '~/lib/query-client'
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

  const categoryColor =
    type === 'dropin' ? 'var(--color-dropin)' : 'var(--color-clinic)'

  return (
    <button
      className="w-full border-t-2 bg-mist-800 p-2 text-left transition-colors hover:bg-mist-700"
      style={{ borderTopColor: categoryColor }}
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
      <div className="mt-0.5 text-sm text-mist-300">
        {[
          levelLabel,
          parsed.group ||
            (parsed.skill ? (SKILL_SHORT[parsed.skill] ?? parsed.skill) : null),
        ]
          .filter(Boolean)
          .join(' · ')}
      </div>
      <div className="mt-0.5 text-sm text-mist-400">{locationLabel}</div>
      <div className="mt-2 flex items-center justify-between">
        <span
          className="rounded-sm px-1.5 py-0.5 text-xs font-bold tracking-wide text-mist-900 uppercase"
          style={{ backgroundColor: categoryColor }}
        >
          {type === 'dropin' ? 'Drop In' : 'Clinic'}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-sm text-mist-400">
            {session.slotsFilled}/{session_capacity}
          </span>
          <AvailabilityMeter
            filled={session.slotsFilled}
            capacity={session_capacity}
          />
        </span>
      </div>
    </button>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

// Square placeholder bar — mirrors the sharp-cornered look of the real UI.
function Bar({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-mist-500/50 ${className ?? ''}`} />
}

// Mirrors SessionCard: top accent border, mist-800 fill, square corners.
function SkeletonCard() {
  return (
    <div className="w-full border-t-2 border-mist-600 bg-mist-800 p-2">
      <Bar className="h-4 w-14" />
      <Bar className="mt-1 h-3 w-24" />
      <Bar className="mt-1 h-3 w-20" />
      <div className="mt-2 flex items-center justify-between">
        <Bar className="h-4 w-14" />
        <Bar className="h-3 w-10" />
      </div>
    </div>
  )
}

// Mirrors the populated DayCell: bordered square cell with collapsing borders.
function SkeletonDayCell({ day }: { day: Date }) {
  const today = startOfDay(new Date())
  const isToday = format(day, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
  const isPast = isBefore(day, today)
  return (
    <div
      className={`-my-px -ml-px flex min-h-24 flex-col gap-1 border border-(--color-line-subtle) p-2 lg:max-w-45 lg:min-w-0 lg:flex-1 ${isToday ? 'bg-mist-800/50 ring-1 ring-mist-400' : ''} ${isPast ? 'opacity-40' : ''}`}
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

// Mirrors renderWeek: full-width rows on mobile, a bordered strip on desktop.
function SkeletonWeek({ week }: { week: Date[] }) {
  return (
    <div className="-mt-px flex flex-col border-y border-(--color-line-subtle) lg:flex-row lg:items-stretch">
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
  const isEmpty = sessions.length === 0
  const heightClass = isEmpty
    ? 'min-h-12 lg:min-h-16 lg:self-start'
    : 'min-h-24'
  // Event days grow first (high grow weight) up to their max width; empty days
  // grow only with the leftover space, so they stay thin on normal screens but
  // stretch out to fill the row's right-side gutter on wide screens.
  const widthClass = isEmpty
    ? 'lg:w-28 lg:grow'
    : 'lg:min-w-0 lg:max-w-72 lg:grow-[99] lg:basis-0'
  const borderClass = isEmpty
    ? ''
    : '-my-px -ml-px border border-[var(--color-line-subtle)]'
  return (
    <div
      className={`flex ${heightClass} ${widthClass} ${borderClass} flex-col gap-1 p-2 ${isToday ? 'bg-mist-800/50 ring-1 ring-mist-400' : ''} ${isPast ? 'opacity-40' : ''}`}
    >
      <div
        className={`flex items-baseline gap-2 lg:flex-col lg:gap-0 lg:text-center ${isEmpty ? '' : 'mb-1'}`}
      >
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
  const { data: dropinData, isLoading: dropinLoading } =
    useSessionQuery('dropin')
  const { data: clinicData, isLoading: clinicLoading } =
    useSessionQuery('clinic')

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
      <div className="flex flex-col">
        <SkeletonWeek week={week1} />
        <SkeletonWeek week={week2} />
      </div>
    )
  }

  const renderWeek = (week: Date[]) => (
    <div className="-mt-px flex flex-col border-y border-(--color-line-subtle) lg:flex-row lg:items-stretch">
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
    <div className="flex flex-col">
      {renderWeek(week1)}
      {renderWeek(week2)}
    </div>
  )
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default function UpcomingCalendar() {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
    >
      <Calendar />
    </PersistQueryClientProvider>
  )
}
