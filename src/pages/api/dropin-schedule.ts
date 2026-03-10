import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const response = await fetch('https://data.mmao.ca/ghlLeagues/aGagGPzv1aS4v8hffakm?age=adult&program_type=drop_in', {
    headers: {
      'Origin': 'https://momentumvolleyball.ca',
      'Referer': 'https://momentumvolleyball.ca/',
      'User-Agent': 'Mozilla/5.0'
    }
  });
  const data = await response.json();
  return new Response(
    JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=3600'
      }
    }
  )
}
""