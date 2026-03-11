import { useMemo } from 'react'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { parse, parseISO, format } from 'date-fns'
import { groupBy, mapValues, sortBy, map } from 'lodash-es'
import SkeletonTable from '~/components/SkeletonTable'
import { DROPIN_QUERY_KEY, fetchDropinSchedule } from '~/lib/dropin-api'
import type { SessionRecord } from '~/types/dropin'

interface LocationGroup {
  locationName: string
  address: string
  sessions: SessionRecord[]
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      gcTime: Infinity,
      retry: 1,
    },
  },
})

const COLUMNS = ['Date', 'Time', 'Event', 'Spots']

// ─── Row ──────────────────────────────────────────────────────────────────────

function DropinRow({ item }: { item: SessionRecord }) {
  const { properties, slotsFilled } = item
  const {
    session_name,
    session_start_date,
    session_start_hour,
    session_start_minute,
    session_capacity,
  } = properties

  return (
    <tr>
      <td>{format(parseISO(session_start_date), 'MMM d')}</td>
      <td>
        {format(
          parse(`${session_start_hour}:${session_start_minute}`, 'H:m', new Date()),
          'h:mm a'
        )}
      </td>
      <td>{session_name}</td>
      <td>
        {slotsFilled} / {session_capacity}
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

function LocationTable({ locationName, address, sessions }: LocationTableProps) {
  return (
    <div className="table-wrapper">
      <table className="table-fixed">
        <colgroup>
          <col className="w-1/6" /> {/* Date */}
          <col className="w-1/6" /> {/* Time */}
          <col className="w-1/2" /> {/* Event */}
          <col className="w-1/6" /> {/* Spots */}
        </colgroup>
        <thead>
          {/* Location header spanning all columns */}
          <tr className="bg-mist-600">
            <th colSpan={4} className="text-left">
              <h2>{locationName}</h2>
              <span className="text-md font-normal text-mist-300">{address}</span>
            </th>
          </tr>
          {/* Column headers */}
          <tr className="bg-mist-700">
            {COLUMNS.map((col) => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sessions.map((item) => (
            <DropinRow
              key={
                item.properties.session_start_date +
                item.properties.session_start_hour +
                item.properties.session_start_minute
              }
              item={item}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Schedule (query + grouping) ──────────────────────────────────────────────

function DropinSchedule() {
  const { data, error, isLoading } = useQuery({
    queryKey: DROPIN_QUERY_KEY,
    queryFn: fetchDropinSchedule,
  })

  // Group by location name, then sort each group's sessions chronologically
  const grouped: Record<string, LocationGroup> = useMemo(
    () =>
      mapValues(
        groupBy(data?.records, (item) => item.locationObject.record.properties.location_name),
        (sessions): LocationGroup => ({
          locationName: sessions[0].locationObject.record.properties.location_name,
          address: sessions[0].locationObject.record.properties.address,
          sessions: sortBy(
            sessions,
            (s) =>
              `${s.properties.session_start_date}T${String(s.properties.session_start_hour).padStart(2, '0')}:${String(s.properties.session_start_minute).padStart(2, '0')}`
          ),
        })
      ),
    [data]
  )

  if (error) {
    return <p>Error loading schedule: {error instanceof Error ? error.message : 'Unknown error'}</p>
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
      {map(grouped, ({ locationName: name, address, sessions }, locationName) => (
        <LocationTable
          key={locationName}
          locationName={name}
          address={address}
          sessions={sessions}
        />
      ))}
    </div>
  )
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default function MomentumDropinTable() {
  return (
    <QueryClientProvider client={queryClient}>
      <DropinSchedule />
    </QueryClientProvider>
  )
}
