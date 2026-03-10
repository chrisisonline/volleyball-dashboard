
# Astro Volleyball Schedule Viewer

## Overview

This project is a simple, fast, and content-focused web application for displaying a volleyball tournament schedule. It is built with Astro.js, leveraging its "Islands Architecture" to deliver a highly performant, static-first user experience. The application is designed for the Firebase Studio (formerly Project IDX) development environment.

## Core Technologies

- **Framework**: Astro.js
- **UI Components**: React
- **Styling**: Tailwind CSS
- **Runtime**: Node.js 20

## Design & Features

### Initial Version

- **Layout**: A clean, single-column layout with a header and main content area.
- **Header**: A simple, non-responsive header with the title "Volleyball Schedule" and links to "Home" and "About" pages.
- **Styling**: Basic styling using Tailwind CSS for typography, spacing, and a simple color scheme.
- **Pages**:
  - `index.astro`: The home page, which displays the main schedule.
  - `about.astro`: An about page with a brief description of the project.
- **Components**:
  - `Header.astro`: The site header.
  - `Layout.astro`: The main layout component.
  - `Schedule.tsx`: A React component to display the schedule (though not fully interactive yet).

### Previous Change: Convert All Components to React

**Goal**: Convert all Astro components (`.astro`) to React components (`.jsx`) for a consistent React-based component architecture.

### Current Change Request: Add SSR API Route and Schedule Page

**Goal**: Create a server-rendered page that fetches data from an external API via a proxied API route.

### Plan

1.  **Enable SSR**: Update `astro.config.mjs` to use the Node.js adapter, enabling server-side rendering.
2.  **Create API Proxy**: Create a new API route at `src/pages/api/schedule.ts` that fetches data from an external source with a `Cache-Control` header.
3.  **Create Schedule Display**:
    *   Create a new page at `src/pages/schedule.astro`.
    *   Create a new component `src/components/ScheduleProxyTable.astro` that fetches data from the internal `/api/schedule` endpoint and renders it in a styled HTML table.
4.  **Add Navigation**: Add a link on the homepage (`index.astro`) to the new schedule page.
