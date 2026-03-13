# Volleyball Dashboard — Claude Context

## What this app is
A personal volleyball schedule tracker. Aggregates the user's season schedule (local JSON) with live drop-in and clinic data from the Momentum Volleyball API. Deployed as a static site to GitHub Pages.

Live site: `https://chrisisonline.github.io/volleyball-dashboard`

## Tech stack
| | |
|---|---|
| Framework | Astro 5 (static output, Islands Architecture) |
| UI | React 18 (interactive islands only) |
| Data fetching | TanStack Query 5 (client-side, with localStorage cache fallback) |
| Styling | Tailwind CSS 4 |
| Dates | date-fns 4 |
| Utils | lodash-es |
| Language | TypeScript (strict) |
| Deploy | GitHub Actions → GitHub Pages on push to `main` |

## Project structure
```
src/
  pages/           # Astro file-based routes
    index.astro          → /          (home: next game + 2-week calendar)
    friday-schedule.astro → /friday-schedule  (season schedule table)
    dropin-schedule.astro → /dropin-schedule  (drop-in sessions by location)
    clinic-schedule.astro → /clinic-schedule  (clinic sessions by location)
  components/
    Header.astro / Sidebar.astro      # Static layout (no JS shipped)
    home/
      NextGame.tsx                    # Next upcoming game card
      UpcomingCalendar.tsx            # 14-day calendar of drop-ins + clinics
    personal-schedule/
      ScheduleTable.tsx               # Full season schedule
    momentum-dropins/
      MomentumDropinTable.tsx         # Sessions grouped by location
    Button.tsx / MenuButton.tsx / SkeletonTable.tsx
  layouts/
    Layout.astro                      # Page wrapper (Header + Sidebar + slot)
  lib/
    dropin-api.ts                     # Momentum API fetch + localStorage cache
    query-client.ts                   # TanStack Query singleton
    session-name.ts                   # Parses level/group/skill from session names
  types/
    dropin.ts                         # Momentum API response types
    schedule.ts                       # Personal schedule types (Game, ScheduleItem)
  data/
    friday-schedule.json              # Hard-coded season schedule (local data)
```

## External API
**Momentum Volleyball API** — `https://data.mmao.ca/ghlLeagues/aGagGPzv1aS4v8hffakm`
- Query params: `age=adult`, `program_type=drop_in` or `program_type=clinic`
- Required headers: `Origin: https://momentumvolleyball.ca`, `Referer`, `User-Agent`
- Response: `{ records: SessionRecord[] }` — see `src/types/dropin.ts`
- Fetched client-side (not at build time) due to CORS/dynamic data needs

## Code style
Always follow the project's ESLint and Prettier configuration exactly when generating code:
- **Prettier** (`.prettierrc`): no semicolons, single quotes, 2-space indent, trailing commas (ES5), 80-char print width
- **TypeScript**: prefer `type` imports (`import type`), no `any`, no unused vars
- **React**: no prop-types (TypeScript handles it), self-close empty components, hooks rules enforced
- Run `npm run lint` and `npm run format` mentally before outputting code — generated code must pass both without changes

## Key conventions
- **Astro components** (`.astro`) = static, zero client JS — used for layout/navigation
- **React components** (`.tsx`) = interactive islands, hydrated with `client:load` or `client:idle`
- Path aliases: `~/` and `@/` both resolve to `src/`
- Base path `/volleyball-dashboard` must be included in all internal links (use `import.meta.env.BASE_URL`)
- Color palette: custom "mist" scale (mist-100 → mist-900) with teal/cyan accents
- Mobile: sidebar hidden by default, toggled via `body.menu-open` class from `MenuButton`

## Claude behavior preferences
- After completing each task, report token usage as a percentage of the 200k context window (e.g. "18k / 200k context (9%)")

## Commands
```bash
npm run dev      # local dev server
npm run build    # production build → dist/
npm run preview  # preview built output
npm run lint     # ESLint
npm run format   # Prettier
```
