import type { VolleyballApiResponse } from '~/types/dropin'

const API_BASE = 'https://data.mmao.ca/ghlLeagues/aGagGPzv1aS4v8hffakm'
const clinicsURL = `${API_BASE}?ver=1773359594561&age=adult&program_type=clinic`
const dropinURL = `${API_BASE}?age=adult&program_type=drop_in`

async function fetchMomentumAPI(
  url: string,
  cacheKey: string
): Promise<VolleyballApiResponse> {
  const res = await fetch(url, {
    headers: {
      Origin: 'https://momentumvolleyball.ca',
      Referer: 'https://momentumvolleyball.ca/',
      'User-Agent': 'Mozilla/5.0',
    },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = (await res.json()) as VolleyballApiResponse
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
