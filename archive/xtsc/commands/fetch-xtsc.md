# Fetch and refresh XTSC volleyball registration data

Refreshes `src/data/xtsc-registrations.json` by scraping the live XTSC registration events page using a headless Puppeteer browser. Run this at the start of each new season when new leagues open for registration.

## How it works

The XTSC site (`xtsc.ca/zuluru/events/`) uses client-side JavaScript to filter registration options via radio buttons — there is no JSON API. The Puppeteer script (`scripts/fetch-xtsc.ts`) launches a headless browser, enumerates every radio button combination for each volleyball league section, and deduplicates results by event URL to produce a clean list of distinct leagues.

## Steps

1. Run the fetch script to re-scrape XTSC and overwrite the cached JSON:

   ```bash
   npm run fetch:xtsc
   ```

   This will print how many leagues were written, e.g. `Wrote 11 leagues to src/data/xtsc-registrations.json`.

2. Review the output at `src/data/xtsc-registrations.json`. Each entry has:

   ```typescript
   {
     name: string        // full league name from XTSC
     section: string     // registration category (e.g. "2-Hour RR Downtown Volleyball - Spring")
     season: string | null   // "Early Spring" | "Spring" | etc.
     day: string | null      // "Monday" | "Tuesday" | ... | "Sunday"
     location: string | null // gym name, or null if not filterable
     price: string | null    // e.g. "CA$898.35"
     url: string             // direct link to the XTSC event page
     eventId: string         // numeric event ID from the URL
   }
   ```

3. If any entries look wrong (e.g. a league resolves to an incorrect event due to XTSC filtering logic changes), manually correct `src/data/xtsc-registrations.json` before committing.

4. Commit the updated JSON and ship it:

   ```bash
   /ship
   ```

## When to run

- At the start of a new season when new leagues appear on the XTSC registration page
- When registration opens/closes for leagues you're tracking
- If the `/xtsc-schedule` page shows stale or missing leagues

## Troubleshooting

- If Puppeteer fails to launch, ensure `npm install` has been run (puppeteer is a devDependency)
- If the script produces 0 leagues, XTSC may have changed their page structure — inspect `https://www.xtsc.ca/zuluru/events/` and update the selectors in `scripts/fetch-xtsc.ts`
- The script only extracts **volleyball** leagues (filters by `h3` headings containing "volleyball")
