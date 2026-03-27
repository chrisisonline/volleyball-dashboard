import { useMemo } from 'react'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { parseISO, format } from 'date-fns'
import { groupBy, mapValues, sortBy, map } from 'lodash-es'

import Button from '~/components/Button'
import SkeletonTable from '~/components/SkeletonTable'
import { useSessionQuery } from '~/lib/hooks'
import { queryClient, persister } from '~/lib/query-client'
import {
  formatSessionTime,
  getSessionSortKey,
  getSignupUrl,
  parseDropinName,
  parseClinicName,
} from '~/lib/session-name'
import type { SessionRecord, SessionType } from '~/types/momentum'

interface LocationGroup {
  locationName: string
  address: string
  sessions: SessionRecord[]
}

interface SessionScheduleProps {
  type: SessionType
}

function getColumns(type: SessionType) {
  return [
    'Date',
    'Level',
    type === 'dropin' ? 'Group' : 'Topic',
    'Spots',
    'Signup',
  ]
}

// ─── Row ──────────────────────────────────────────────────────────────────────

function SessionRow({
  item,
  type,
}: {
  item: SessionRecord
  type: SessionType
}) {
  const { properties, slotsFilled } = item
  const {
    session_name,
    session_start_date,
    session_start_hour,
    session_start_minute,
    session_capacity,
  } = properties

  const parsed =
    type === 'dropin'
      ? parseDropinName(session_name)
      : parseClinicName(session_name)

  const detailLabel = type === 'dropin' ? parsed.group : parsed.skill

  return (
    <tr>
      <td className="text-center">
        {format(parseISO(session_start_date), 'EEE MMM d')} <br />
        {formatSessionTime(session_start_hour, session_start_minute)}
      </td>
      <td>{parsed.level}</td>
      <td>{detailLabel}</td>
      <td className="text-center">
        {slotsFilled} / {session_capacity}
      </td>
      <td className="text-center">
        <Button
          onClick={() =>
            window.open(
              getSignupUrl(
                item.id,
                item.programObject.record.properties.program_type
              ),
              '_blank'
            )
          }
        >
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
  type: SessionType
}

function LocationTable({
  locationName,
  address,
  sessions,
  type,
}: LocationTableProps) {
  const columns = getColumns(type)
  return (
    <div className="table-wrapper">
      <table className="table-fixed">
        <colgroup>
          <col className="w-1/6" />
          <col className="w-1/4" />
          <col className="w-1/4" />
          <col className="w-1/8" />
          <col className="w-1/6" />
        </colgroup>
        <thead>
          <tr>
            <th colSpan={5}>
              <h2>{locationName}</h2>
              <span className="text-sm font-normal text-mist-300">
                {address}
              </span>
            </th>
          </tr>
          <tr>
            {columns.map((col) => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sessions.map((item) => (
            <SessionRow key={item.id} item={item} type={type} />
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

  const columnCount = getColumns(type).length

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
        <SkeletonTable columns={columnCount} rows={4} />
        <SkeletonTable columns={columnCount} rows={4} />
        <SkeletonTable columns={columnCount} rows={4} />
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
            type={type}
          />
        )
      )}
    </div>
  )
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default function SessionSchedule(props: SessionScheduleProps) {
  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
      <Schedule {...props} />
    </PersistQueryClientProvider>
  )
}
