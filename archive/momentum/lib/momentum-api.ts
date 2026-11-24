import type { VolleyballApiResponse } from '~/types/momentum'

const API_BASE = 'https://data.mmao.ca/ghlLeagues/aGagGPzv1aS4v8hffakm'
const clinicsURL = `${API_BASE}?age=adult&program_type=clinic`
const dropinURL = `${API_BASE}?age=adult&program_type=drop_in`

async function fetchMomentumAPI(url: string): Promise<VolleyballApiResponse> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const raw = (await res.json()) as VolleyballApiResponse
  return {
    records: raw.records.filter((r) => r.properties.status !== 'inactive'),
  }
}

export async function fetchDropinSchedule(): Promise<VolleyballApiResponse> {
  return fetchMomentumAPI(dropinURL)
}
export async function fetchClinicSchedule(): Promise<VolleyballApiResponse> {
  return fetchMomentumAPI(clinicsURL)
}
