# ULYS — Phase 1 (Frontend Only)

EdTech platform helping Kazakhstani students discover opportunities, build a
portfolio, get AI mentorship, and understand university fit.

This is **Phase 1**: complete frontend, mock data only. No backend, no
Supabase, no real auth, no AI API calls yet.

## Getting started

\`\`\`bash
npm install
npm run dev
\`\`\`

Open http://localhost:3000

## Structure

- \`/\` — marketing landing page
- \`/login\`, \`/signup\`, \`/forgot-password\`, \`/onboarding\` — auth UI (no real auth yet)
- \`/app\` — the authenticated application shell (sidebar on desktop, bottom nav on mobile)
  - \`/app\` — dashboard
  - \`/app/opportunities\`, \`/app/opportunities/[id]\` — Opportunity Hub
  - \`/app/mentor\` — AI Mentor (Uli) chat, canned responses for now
  - \`/app/portfolio\` — Smart Portfolio builder (add/edit/delete/reorder)
  - \`/app/universities\`, \`/app/universities/[id]\` — University / Profile Analysis
  - \`/app/saved\` — saved opportunities
  - \`/app/profile\` — student profile
  - \`/app/settings\` — account, notifications, preferences
  - \`/app/search\` — global search across opportunities and universities

All data lives in \`src/data/*.ts\` — swap for real API calls in Phase 2.

## Design system

- Colors, radii, fonts are defined as CSS variables in \`src/app/globals.css\`
- Palette: warm paper background, ink text, red / yellow / blue / violet brand colors
- Fonts: Unbounded (display), Inter (body), JetBrains Mono (data/labels) — self-hosted via \`@fontsource\`

## Phase 2 (not started)

Supabase, Postgres schema, RLS, Storage, real auth, AI API integration,
payments — see the product brief for full scope.
