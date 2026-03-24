import type { VolleyballApiResponse } from '~/types/momentum'

const API_BASE = 'https://data.mmao.ca/ghlLeagues/aGagGPzv1aS4v8hffakm'
const clinicsURL = `${API_BASE}?ver=1773359594561&age=adult&program_type=clinic`
const dropinURL = `${API_BASE}?ver=1773806118719&age=adult&program_type=drop_in`

async function fetchMomentumAPI(
  url: string,
  cacheKey: string
): Promise<VolleyballApiResponse> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const raw = (await res.json()) as VolleyballApiResponse
  const data: VolleyballApiResponse = {
    records: raw.records.filter((r) => r.properties.status !== 'inactive'),
  }
  try {
    localStorage.setItem(cacheKey, JSON.stringify(data))
  } catch {
    // storage quota exceeded or unavailable — silently ignore
  }
  return data
}

export function getCachedSchedule(
  cacheKey: string
): VolleyballApiResponse | undefined {
  try {
    const cached = localStorage.getItem(cacheKey)
    return cached ? (JSON.parse(cached) as VolleyballApiResponse) : undefined
  } catch {
    return undefined
  }
}

export async function fetchDropinSchedule(): Promise<VolleyballApiResponse> {
  return fetchMomentumAPI(dropinURL, 'dropin-schedule')
}
export async function fetchClinicSchedule(): Promise<VolleyballApiResponse> {
  return fetchMomentumAPI(clinicsURL, 'clinic-schedule')
}
