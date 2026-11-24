# Volleyball Dashboard — Claude Context

## What this app is
A personal volleyball app, deployed as a static site to GitHub Pages. Right now it is just a fullscreen scoreboard at `/`. The app is being rebuilt; new pages will be added on top of the existing layout and UI components.

Live site: `https://chrisisonline.github.io/volleyball-dashboard`

## Tech stack
| | |
|---|---|
| Framework | Astro 5 (static output, Islands Architecture) |
| UI | React 18 (interactive islands only) |
| Data fetching | TanStack Query 5 (available, unused until a new data source lands) |
| Styling | Tailwind CSS 4 |
| Animation | framer-motion (scoreboard) |
| Dates | date-fns 4 |
| Utils | lodash-es |
| Icons | lucide-react |
| Language | TypeScript (strict) |
| Deploy | GitHub Actions → GitHub Pages on push to `main` |

## Project structure
```
src/
  pages/
    index.astro            → /  (fullscreen scoreboard; /scoreboard redirects here)
  components/
    Header.astro / Sidebar.astro      # Static layout (no JS shipped)
    MenuButton.tsx                    # Mobile sidebar toggle (client:load)
    Button.tsx                        # Reusable button (renders as <a> if href given)
    SkeletonTable.tsx                 # Animated loading placeholder table
    AvailabilityMeter.tsx             # Battery-style filled/capacity indicator
    ConfirmModal.tsx                  # Centered confirmation dialog
    scoreboard/
      ScoreCounter.tsx                # Fullscreen score counter (increment/decrement/reset)
  layouts/
    Layout.astro                      # Page wrapper (Header + Sidebar + slot)
  lib/
    celebration.ts                    # Scoreboard burst particles
    query-client.ts                   # TanStack Query singleton + sessionStorage persister
    use-fullscreen.ts                 # Fullscreen API (incl. webkit prefix) + support detection
    use-media-query.ts                # matchMedia hook (orientation etc.)
tests/
  scoreboard.spec.ts                  # Playwright e2e tests
archive/                              # Retired code. Excluded from build, tsc, ESLint, Prettier.
  momentum/                           # Old Momentum drop-in/clinic API integration (API changed; dead)
  xtsc/                               # XTSC registration page + Puppeteer scraper
```

`archive/` files keep their original `~/` imports. Each subfolder's README maps files back to their original paths. Don't import from `archive/` in `src/`.

## Code style
Always follow the project's ESLint and Prettier configuration exactly when generating code:
- **Prettier** (`.prettierrc`): no semicolons, single quotes, 2-space indent, trailing commas (ES5), 80-char print width
- **TypeScript**: prefer `type` imports (`import type`), no `any`, no unused vars
- **React**: no prop-types (TypeScript handles it), self-close empty components, hooks rules enforced
- Run `npm run lint` and `npm run format` mentally before outputting code — generated code must pass both without changes

## Key conventions
- **Astro components** (`.astro`) = static, zero client JS — used for layout/navigation
- **React components** (`.tsx`) = interactive islands, hydrated with `client:load` or `client:only="react"`
  - `client:only="react"` for components that use TanStack Query (no SSR)
  - `client:load` for immediate interactivity without data fetching (MenuButton, ScoreCounter)
- Path aliases: `~/` and `@/` both resolve to `src/`
- Base path `/volleyball-dashboard` must be included in all internal links (use `import.meta.env.BASE_URL`)
- Color palette: custom "mist" scale (mist-100 → mist-900) with teal/cyan accents
- Mobile: sidebar hidden by default, toggled via `body.menu-open` class from `MenuButton`
- The scoreboard page is standalone (doesn't use `Layout.astro`). New pages should use `Layout.astro` and get a link in `Sidebar.astro`.

## Testing
Playwright e2e tests in `tests/` run against the built site (`playwright.config.ts` builds and serves it) on WebKit (iPhone, iPhone SE, iPad, desktop Safari) and Chromium (Pixel, desktop Chrome), portrait and landscape.
- Tests assert behavior a person sees: scores change, nothing overflows the viewport or overlaps, layout follows orientation. Find elements by role/aria-label, not classes.
- Any scoreboard change must keep `npm test` green. When you add a feature, add a test for it.
- A Stop hook (`.claude/hooks/run-tests.sh`) runs the suite when `src/`, `tests/` or config files have uncommitted changes, and blocks finishing on failure. It skips if the same diff already passed.
- CI runs the suite before every deploy; a failure stops the deploy.

## Scoreboard notes
- Layout follows viewport orientation: portrait stacks Home over Away, landscape is side by side. The rotate button turns the board 90° for phones with rotation lock on.
- Scores size with container query units (`cqw`/`cqh`) on each panel, never `vw`/`vmin`.
- iPhone Safari has no Fullscreen API; the fullscreen button hides itself there. Add to Home Screen gives a chrome-free view instead.

## Custom slash commands
- `/lint` — run ESLint auto-fix + Prettier on changed files, block if errors remain
- `/ship` — stage all changes, draft commit message, and commit
- `/update-claude-md` — scan recent commits + current files and sync CLAUDE.md

## Commands
```bash
npm run dev           # local dev server
npm run build         # production build → dist/
npm run preview       # preview built output
npm run lint          # ESLint check
npm run lint:fix      # ESLint auto-fix
npm run format        # Prettier write
npm run format:check  # Prettier check (no writes)
npm test              # Playwright e2e suite (all devices)
npm run test:ui       # Playwright UI mode for debugging
npx playwright test --project=iphone   # one device
```
