# Volleyball Dashboard — Blueprint

## Overview
A personal volleyball schedule tracker built with Astro + React. Shows the user's Friday night league schedule and live drop-in/clinic sessions from the Momentum Volleyball API. Deployed statically to GitHub Pages.

## Pages

| Route | File | Description |
|---|---|---|
| `/` | `index.astro` | Home — next upcoming game + 2-week drop-in/clinic calendar |
| `/friday-schedule` | `friday-schedule.astro` | Full Momentum Intermediate League season schedule |
| `/dropin-schedule` | `dropin-schedule.astro` | All drop-in sessions from API, grouped by location |
| `/clinic-schedule` | `clinic-schedule.astro` | All clinic sessions from API, grouped by location |

## Features implemented

### Layout & Navigation
- Fixed header with title and mobile hamburger menu
- Fixed left sidebar (w-64) with active link highlighting, hidden on mobile
- Responsive layout — sidebar toggles via `body.menu-open` class
- GitHub Pages sub-path routing (BASE_URL = `/volleyball-dashboard`)

### Home Page
- **NextGame** card: pulls next game from `friday-schedule.json`, shows date/time/court/opponent
- **UpcomingCalendar**: 14-day grid (starting Monday) merging drop-in + clinic API data; highlights today; shows availability (spots filled/capacity); links to signup

### Friday Schedule Page
- **ScheduleTable**: Reads `src/data/friday-schedule.json`; filters out past games; shows date, time, court, opponent

### Drop-in & Clinic Pages
- **MomentumDropinTable**: Fetches live API data; groups sessions by location; shows session name, dates/times, capacity, signup button
- **SkeletonTable**: Loading state while API data loads

### Data Layer
- `dropin-api.ts`: Fetches Momentum API with required headers; localStorage cache fallback to avoid redundant requests
- `session-name.ts`: Parses human-readable level (Beginner/Intermediate/Advanced), group (Women's/Men's/Co-Ed), and skill from raw session name strings
- TanStack Query: infinite stale/GC time — data fetched once per session

## Design system
- Tailwind CSS 4 with custom "mist" color scale (mist-100 → mist-900)
- Teal/cyan accents for interactive elements and highlights
- `.table-wrapper` class for consistent table scroll/border treatment
- Rounded session cards with hover states and spots-remaining indicators
- Volleyball emoji (🏐) as favicon and in header
