# XTSC archive

The XTSC registration listings page and the Puppeteer scraper that fed it. It was
pulled out of the app when the site was cut down to just the scoreboard.

It is excluded from the build, `tsc`, ESLint, and Prettier.

| File | Original location |
| --- | --- |
| `pages/xtsc-schedule.astro` | `src/pages/xtsc-schedule.astro` |
| `data/xtsc-registrations.json` | `src/data/xtsc-registrations.json` |
| `scripts/fetch-xtsc.ts` | `scripts/fetch-xtsc.ts` |
| `commands/fetch-xtsc.md` | `.claude/commands/fetch-xtsc.md` |

To restore it, move the files back and re-add this to `package.json` scripts:

```json
"fetch:xtsc": "tsx scripts/fetch-xtsc.ts"
```
