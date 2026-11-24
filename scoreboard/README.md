# Volleyball Scoreboard

A fullscreen two-team scoreboard. SvelteKit 2 and Svelte 5, prerendered as a static site and deployed as the Cloudflare Worker `vb` (static assets from `build/`, configured in `wrangler.jsonc`) at https://vb.chrisisonline.workers.dev.

This app is independent of the Astro dashboard in the repo root. It has its own dependencies, lint and format config, tests, and deploy workflow (`.github/workflows/scoreboard.yml`), which runs on pushes to `main` that touch `scoreboard/`.

## Commands

Run these from `scoreboard/`.

```bash
npm install
npm run dev           # local dev server
npm run build         # static build to build/
npm run preview       # serve build/
npm run check         # svelte-check (types)
npm run lint          # Prettier check + ESLint
npm run format        # Prettier write
npm test              # Playwright: builds, previews on :4331, runs every device
```

Install the test browsers once with `npx playwright install chromium webkit`.

## Layout

- `src/lib/scoreboard.svelte.ts` holds the board state: the score tuple, the rotated flag, and the layout derived from screen orientation and rotation.
- `src/lib/fullscreen.svelte.ts` wraps the Fullscreen API, including the webkit prefix.
- `src/lib/celebration.ts` builds the emoji burst and animates it with the Web Animations API.
- `src/routes/+page.svelte` is the board. `src/lib/TeamPanel.svelte` is one team's half.
