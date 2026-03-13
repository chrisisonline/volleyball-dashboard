import { useMemo } from 'react'
import {
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query'
import { parse, parseISO, format } from 'date-fns'
import { groupBy, mapValues, sortBy, map } from 'lodash-es'

import Button from '~/components/Button'
import SkeletonTable from '~/components/SkeletonTable'
import { getCachedSchedule, fetchDropinSchedule, fetchClinicSchedule } from '~/lib/dropin-api'
import { queryClient } from '~/lib/query-client'
import type { SessionRecord, VolleyballApiResponse } from '~/types/dropin'

interface LocationGroup {
  locationName: string
  address: string
  sessions: SessionRecord[]
}

type ScheduleType = 'dropin' | 'clinic'

const SCHEDULE_CONFIG: Record<ScheduleType, { queryKey: string; fetchFn: () => Promise<VolleyballApiResponse> }> = {
  dropin: { queryKey: 'dropin-schedule', fetchFn: fetchDropinSchedule },
  clinic: { queryKey: 'clinic-schedule', fetchFn: fetchClinicSchedule },
}

interface DropinScheduleProps {
  type: ScheduleType
}

const COLUMNS = ['Date', 'Event', 'Spots', 'Signup']

// ─── Row ──────────────────────────────────────────────────────────────────────

function DropinRow({ item, even }: { item: SessionRecord; even: boolean }) {
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
      <td className='text-center'>
        {format(parseISO(session_start_date), 'EEE MMM d')} <br />
        {format(
          parse(
            `${session_start_hour}:${session_start_minute}`,
            'H:m',
            new Date()
          ),
          'h:mm a'
        )}
      </td>
      <td>{session_name}</td>
      <td className='text-center'>
        {slotsFilled} / {session_capacity}
      </td>
      <td className='text-center'>
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
          <col className="w-1/6" /> {/* Date */}
          <col className="w-1/2" /> {/* Event */}
          <col className="w-1/6" /> {/* Spots */}
          <col className="w-1/6" /> {/* Signup */}
        </colgroup>
        <thead>
          {/* Location header spanning all columns */}
          <tr className="bg-mist-900">
            <th colSpan={5} className="text-left">
              <h2>{locationName}</h2>
              <span className="text-md font-normal text-mist-300">
                {address}
              </span>
            </th>
          </tr>
          {/* Column headers */}
          <tr className="bg-mist-800">
            {COLUMNS.map((col) => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sessions.map((item, index) => (
            <DropinRow
              key={
                item.properties.session_start_date +
                item.properties.session_start_hour +
                item.properties.session_start_minute
              }
              even={!!(index % 2)}
              item={item}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Schedule (query + grouping) ──────────────────────────────────────────────

function DropinSchedule({ type }: DropinScheduleProps) {
  const { queryKey, fetchFn } = SCHEDULE_CONFIG[type]
  const { data, error, isLoading } = useQuery({
    queryKey: [queryKey],
    queryFn: fetchFn,
    initialData: () => getCachedSchedule(queryKey),
    initialDataUpdatedAt: 0,
  })

  // Group by location name, then sort each group's sessions chronologically
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

export default function MomentumDropinTable(props: DropinScheduleProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <DropinSchedule {...props} />
    </QueryClientProvider>
  )
}
