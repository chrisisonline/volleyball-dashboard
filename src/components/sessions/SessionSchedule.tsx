import { useMemo } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { parseISO, format } from 'date-fns'
import { groupBy, mapValues, sortBy, map } from 'lodash-es'

import Button from '~/components/Button'
import SkeletonTable from '~/components/SkeletonTable'
import { useSessionQuery } from '~/lib/hooks'
import { queryClient } from '~/lib/query-client'
import { formatSessionTime, getSessionSortKey } from '~/lib/session-name'
import type { SessionRecord, SessionType } from '~/types/dropin'

interface LocationGroup {
  locationName: string
  address: string
  sessions: SessionRecord[]
}

interface SessionScheduleProps {
  type: SessionType
}

const COLUMNS = ['Date', 'Event', 'Spots', 'Signup']

// ─── Row ──────────────────────────────────────────────────────────────────────

function SessionRow({ item, even }: { item: SessionRecord; even: boolean }) {
  const { properties, slotsFilled } = item
  const {
    session_name,
    session_start_date,
    session_start_hour,
    session_start_minute,
    session_capacity,
    private_signup_link,
  } = properties

  return (
    <tr className={even ? 'bg-mist-800' : 'bg-mist-900'}>
      <td className="text-center">
        {format(parseISO(session_start_date), 'EEE MMM d')} <br />
        {formatSessionTime(session_start_hour, session_start_minute)}
      </td>
      <td>{session_name}</td>
      <td className="text-center">
        {slotsFilled} / {session_capacity}
      </td>
      <td className="text-center">
        <Button onClick={() => window.open(private_signup_link, '_blank')}>
          Signup
        </Button>
      </td>
    </tr>
  )
}

// ─── Location Table ───────────────────────────────────────────────────────────

interface LocationTableProps {
  locationName: string
  address: string
  sessions: SessionRecord[]
}

function LocationTable({
  locationName,
  address,
  sessions,
}: LocationTableProps) {
  return (
    <div className="table-wrapper">
      <table className="table-fixed">
        <colgroup>
          <col className="w-1/6" />
          <col className="w-1/2" />
          <col className="w-1/6" />
          <col className="w-1/6" />
        </colgroup>
        <thead>
          <tr className="bg-mist-900">
            <th colSpan={4} className="text-left">
              <h2>{locationName}</h2>
              <span className="text-md font-normal text-mist-300">
                {address}
              </span>
            </th>
          </tr>
          <tr className="bg-mist-800">
            {COLUMNS.map((col) => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sessions.map((item, index) => (
            <SessionRow key={item.id} even={!!(index % 2)} item={item} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Schedule (query + grouping) ──────────────────────────────────────────────

function Schedule({ type }: SessionScheduleProps) {
  const { data, error, isLoading } = useSessionQuery(type)

  const grouped: Record<string, LocationGroup> = useMemo(
    () =>
      mapValues(
        groupBy(
          data?.records,
          (item) => item.locationObject.record.properties.location_name
        ),
        (sessions): LocationGroup => ({
          locationName:
            sessions[0].locationObject.record.properties.location_name,
          address: sessions[0].locationObject.record.properties.address,
          sessions: sortBy(sessions, getSessionSortKey),
        })
      ),
    [data]
  )

  if (error) {
    return (
      <p>
        Error loading schedule:{' '}
        {error instanceof Error ? error.message : 'Unknown error'}
      </p>
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <SkeletonTable columns={COLUMNS.length} rows={4} />
        <SkeletonTable columns={COLUMNS.length} rows={4} />
        <SkeletonTable columns={COLUMNS.length} rows={4} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {map(
        grouped,
        ({ locationName: name, address, sessions }, locationName) => (
          <LocationTable
            key={locationName}
            locationName={name}
            address={address}
            sessions={sessions}
          />
        )
      )}
    </div>
  )
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default function SessionSchedule(props: SessionScheduleProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <Schedule {...props} />
    </QueryClientProvider>
  )
}
