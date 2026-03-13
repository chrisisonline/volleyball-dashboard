import { useQuery } from '@tanstack/react-query'
import {
  fetchDropinSchedule,
  fetchClinicSchedule,
  getCachedSchedule,
} from '~/lib/dropin-api'
import type { SessionType } from '~/types/dropin'

const QUERY_CONFIG = {
  dropin: { queryKey: 'dropin-schedule', queryFn: fetchDropinSchedule },
  clinic: { queryKey: 'clinic-schedule', queryFn: fetchClinicSchedule },
} as const

export function useSessionQuery(type: SessionType) {
  const { queryKey, queryFn } = QUERY_CONFIG[type]
  return useQuery({
    queryKey: [queryKey],
    queryFn,
    initialData: () => getCachedSchedule(queryKey),
  })
}
