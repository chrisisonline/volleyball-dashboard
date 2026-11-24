/**
 * Scrapes XTSC volleyball registration events from xtsc.ca and writes to
 * src/data/xtsc-registrations.json. Run manually when the season changes:
 *
 *   npm run fetch:xtsc
 */

import { writeFileSync } from 'fs'
import { join } from 'path'
import puppeteer from 'puppeteer'

const URL = 'https://www.xtsc.ca/zuluru/events/'
const OUT = join(import.meta.dirname, '../src/data/xtsc-registrations.json')

interface XtscLeague {
  name: string
  section: string
  season: string | null
  day: string | null
  location: string | null
  price: string | null
  url: string
  eventId: string
}

const browser = await puppeteer.launch({ headless: true })
const page = await browser.newPage()
await page.setUserAgent(
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
)
await page.goto(URL, { waitUntil: 'networkidle2' })

const leagues: XtscLeague[] = await page.evaluate(async () => {
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

  function getGroups(table: Element) {
    const radios = Array.from(
      table.querySelectorAll<HTMLInputElement>('input[type="radio"]'),
    )
    const groups: Record<string, HTMLInputElement[]> = {}
    radios.forEach((r) => {
      if (!groups[r.name]) groups[r.name] = []
      groups[r.name].push(r)
    })
    return groups
  }

  function cartesian<T>(arrays: T[][]): T[][] {
    if (arrays.length === 0) return [[]] as T[][]
    return arrays.reduce<T[][]>(
      (acc, arr) => acc.flatMap((combo) => arr.map((item) => [...combo, item])),
      [[]],
    )
  }

  function getResult(table: Element) {
    const link = table.querySelector<HTMLAnchorElement>('a[href*="events/view"]')
    if (link) {
      const label = link.closest('td')?.textContent?.replace('View Event', '').trim() ?? ''
      return { resolved: true, label, url: link.href }
    }
    return { resolved: false, label: '', url: '' }
  }

  function resetTable(table: Element) {
    const btn = table.querySelector<HTMLElement>('button')
    if (btn) {
      btn.click()
    } else {
      table.querySelectorAll<HTMLInputElement>('input[type="radio"]').forEach((r) => {
        r.checked = false
        r.dispatchEvent(new Event('change', { bubbles: true }))
      })
    }
  }

  const headings = Array.from(document.querySelectorAll('h3'))
  const volleyballSections = headings.filter(
    (h) =>
      h.textContent?.toLowerCase().includes('volleyball') &&
      h.nextElementSibling?.tagName === 'TABLE',
  )

  const seen = new Map<string, XtscLeague>()

  for (const h of volleyballSections) {
    const sectionName = (h.textContent ?? '').replace('More info', '').trim()
    const table = h.nextElementSibling!
    const groups = getGroups(table)
    const groupNames = Object.keys(groups)

    if (groupNames.length === 0) {
      const result = getResult(table)
      if (result.resolved && !seen.has(result.url)) {
        const name = result.label.replace(/CA\$[\d,.]+ \(taxes included\)/, '').trim()
        const priceMatch = result.label.match(/CA\$([\d,.]+)/)
        seen.set(result.url, {
          name,
          section: sectionName,
          season: name.match(/Early Spring|Spring|Summer|Fall|Winter/i)?.[0] ?? null,
          day: name.match(/Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday/i)?.[0] ?? null,
          location: null,
          price: priceMatch ? `CA$${priceMatch[1]}` : null,
          url: result.url,
          eventId: result.url.match(/event=(\d+)/)?.[1] ?? '',
        })
      }
      continue
    }

    const groupArrays = groupNames.map((name) => groups[name])
    const combos = cartesian(groupArrays)

    for (const combo of combos) {
      resetTable(table)
      await sleep(30)

      const comboObj: Record<string, string> = {}
      for (let i = 0; i < groupNames.length; i++) {
        const radio = combo[i]
        radio.checked = true
        radio.dispatchEvent(new Event('change', { bubbles: true }))
        comboObj[groupNames[i]] = radio.value
      }
      await sleep(80)

      const result = getResult(table)
      if (result.resolved && !seen.has(result.url)) {
        const name = result.label.replace(/CA\$[\d,.]+ \(taxes included\)/, '').trim()
        const priceMatch = result.label.match(/CA\$([\d,.]+)/)
        const locationVal = comboObj['location']
        const location = locationVal
          ? locationVal.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
          : null

        seen.set(result.url, {
          name,
          section: sectionName,
          season: name.match(/Early Spring|Spring|Summer|Fall|Winter/i)?.[0] ?? null,
          day: name.match(/Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday/i)?.[0] ?? null,
          location,
          price: priceMatch ? `CA$${priceMatch[1]}` : null,
          url: result.url,
          eventId: result.url.match(/event=(\d+)/)?.[1] ?? '',
        })
      }
    }
  }

  return Array.from(seen.values())
})

await browser.close()

writeFileSync(OUT, JSON.stringify(leagues, null, 2))
console.log(`Wrote ${leagues.length} leagues to src/data/xtsc-registrations.json`)
