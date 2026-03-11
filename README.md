# 🏐 Volleyball Dashboard

A personal dashboard for tracking volleyball schedules, drop-in sessions, and upcoming games — built with Astro and React.

**Live site:** [chrisisonline.github.io/volleyball-dashboard](https://chrisisonline.github.io/volleyball-dashboard)

---

## Pages

| Page | Description |
|------|-------------|
| **Home** | Shows the next upcoming Friday game |
| **Friday Schedule** | Full season schedule for Momentum Intermediate League @ The York School |
| **Drop-in Schedule** | Live drop-in session availability, grouped by location, fetched from the Momentum API |

## Tech Stack

- **[Astro](https://astro.build)** — static site framework (Islands Architecture)
- **[React](https://react.dev)** — interactive components (client-side islands)
- **[TanStack Query](https://tanstack.com/query)** — data fetching and caching for drop-in schedule
- **[Tailwind CSS v4](https://tailwindcss.com)** — styling
- **[date-fns](https://date-fns.org)** — date formatting
- **[lodash-es](https://lodash.com)** — grouping and sorting session data

## Development

```bash
npm install
npm run dev       # start local dev server at localhost:4321
npm run build     # production build → dist/
npm run preview   # preview production build locally
```

## Deployment

Automatically deployed to GitHub Pages via GitHub Actions on every push to `master`.
