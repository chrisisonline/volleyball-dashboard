# Momentum archive

The drop-in and clinic integration, built against the old Momentum Volleyball
API (`https://data.mmao.ca/ghlLeagues/...`). Momentum changed its API and these
endpoints no longer return usable data, so the code was pulled out of `src/`.

It is excluded from the build, `tsc`, ESLint, and Prettier. Imports still use the
original `~/` paths, so moving a file back into `src/` at its old location makes
it work again.

| File | Original location |
| --- | --- |
| `lib/momentum-api.ts` | `src/lib/momentum-api.ts` |
| `lib/hooks.ts` | `src/lib/hooks.ts` |
| `lib/session-name.ts` | `src/lib/session-name.ts` |
| `types/momentum.ts` | `src/types/momentum.ts` |
| `components/UpcomingCalendar.tsx` | `src/components/home/UpcomingCalendar.tsx` |
| `components/SessionSchedule.tsx` | `src/components/sessions/SessionSchedule.tsx` |
| `pages/index.astro` | `src/pages/index.astro` |
| `pages/dropin-schedule.astro` | `src/pages/dropin-schedule.astro` |
| `pages/clinic-schedule.astro` | `src/pages/clinic-schedule.astro` |
| `commands/check-ui.md` | `.claude/commands/check-ui.md` |
