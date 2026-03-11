import type { VolleyballApiResponse } from '~/types/dropin'

export const DROPIN_QUERY_KEY = ['dropin-schedule'] as const

export async function fetchDropinSchedule(): Promise<VolleyballApiResponse> {
  const res = await fetch(
    'https://data.mmao.ca/ghlLeagues/aGagGPzv1aS4v8hffakm?age=adult&program_type=drop_in',
    {
      headers: {
        Origin: 'https://momentumvolleyball.ca',
        Referer: 'https://momentumvolleyball.ca/',
        'User-Agent': 'Mozilla/5.0',
      },
    }
  )
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json() as Promise<VolleyballApiResponse>
}
