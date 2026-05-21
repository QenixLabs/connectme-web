# ConnectME Frontend

Next.js 16 app for the ConnectME talent platform.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 (CSS-first via `@tailwindcss/postcss`)
- shadcn/ui (New York, neutral, lucide icons)
- Zustand v5 (client state, vanilla store + provider)
- Axios (`withCredentials: true`)
- React Hook Form + Zod (forms)
- TanStack React Query v5 (data fetching + mutations + cache invalidation)
- Motion (Framer) v12, Sonner (toasts), Recharts, date-fns

## Getting Started

```bash
npm install
npm run dev
```

Runs on `http://localhost:3000` by default. Backend also defaults to `:3000`, so set `PORT` on one of them or run the backend on `:3000` and the frontend on a different port (e.g. `next dev -p 3001`).

## Environment

Create `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

Points to the NestJS backend (global prefix `api/v1`). Code fallback is `http://localhost:3001/api/v1` if unset.

## Scripts

```bash
npm run dev         # next dev
npm run build       # next build
npm run start       # next start
npm run lint        # eslint
```

## Project Structure

```
src/
├── app/                          # App Router pages
│   ├── layout.tsx, page.tsx, globals.css
│   ├── auth/                     # login, signup, forgot-password, verify-email
│   ├── talent/                   # dashboard, profile, portfolio, messages,
│   │                             # notifications, opportunities (list + detail
│   │                             # with invite banners + apply form), verify-documents
│   ├── recruiter/                # dashboard (live stats), campaigns (list + detail
│   │                             # with applicants/invites/analytics), find-talent
│   │                             # (list + card views + invite modal), messages,
│   │                             # notifications, verify-documents
│   ├── admin/                    # dashboard, verifications
│   └── (public)/talent/[username]/  # public profile + portfolio
├── components/
│   ├── ui/                       # shadcn primitives (~35 files)
│   ├── layout/                   # auth-layout, dashboard-layout
│   ├── portfolio/                # grid, uploader, item card, media kit
│   ├── verification/             # document submission, status card
│   ├── talent-card.tsx, recruiter-card.tsx, verification-alerts.tsx
│   ├── invite-to-campaign-modal.tsx
│   └── notifications/notification-list.tsx (real-time, campaign invite actions)
├── stores/
│   └── auth-store.ts             # user, isAuthenticated, login/logout/fetchUser
├── providers/
│   ├── auth-store-provider.tsx
│   └── socket-provider.tsx
├── lib/
│   ├── api.ts                    # apiClient + domain API wrappers
│   ├── utils.ts                  # cn()
│   ├── formatters.ts, greeting.ts, validation.ts
│   ├── validations/              # Zod schemas
│   ├── talent-profile/           # display + form helpers, options
│   └── recruiter-profile/        # form helpers, options
├── hooks/
│   ├── use-password-strength.ts
│   └── use-socket.ts
└── middleware.ts                 # Auth + role guard
```

Path alias: `@/*` → `./src/*`.

## Auth & Middleware

`middleware.ts` guards `/talent/*`, `/recruiter/*`, `/admin/*`:
- Checks `auth_session` cookie (mirrored from Zustand store on login)
- Redirects unauthenticated to `/auth/login`
- Enforces role match (talent → `/talent/*`, recruiter → `/recruiter/*`, admin → `/admin/*`)
- Public talent profiles (`/talent/:username`) bypass auth

Zustand auth store (`src/stores/auth-store.ts`) persists to localStorage and mirrors `auth_session` + `user_role` cookies so middleware can read them.

## API Layer

Single Axios instance (`apiClient`) in `src/lib/api.ts`, `withCredentials: true`, unwraps `{ success, data }` envelopes, 401 redirects to login.

Domain wrappers: `authApi`, `talentApi`, `recruiterApi`, `campaignApi`, `messagesApi`, `notificationsApi`, `verificationApi`, `adminApi`.

TanStack Query hooks (one file per domain under `src/lib/api/hooks/`):
- `useCampaigns()`, `useCampaign(id)`, `useCampaignApplications(id)`, `useUpdateApplicationStatus()`
- `useCampaignInvites(id)`, `useCampaignAnalytics(id)`, `useCampaignDemographics(id)`
- `useInviteTalent()`, `useRespondToInvite()`
- `useRecruiterDashboardStats()`, `useCampaignTalentView(id)`
- `useTalentSearch(filters)`, `useDistinctProfessions(search)`

Query-key factory: `src/lib/api/query-keys.ts`.

## Styling

- Tailwind v4 CSS-first in `src/app/globals.css` (no `tailwind.config.{js,ts}`)
- PostCSS plugin: `@tailwindcss/postcss`
- shadcn config (`components.json`): `style: new-york`, `baseColor: neutral`, `cssVariables: true`, `rsc: true`, `iconLibrary: lucide`
- Use `cn()` from `src/lib/utils.ts` for conditional classes

## UI Component Rule

Always use shadcn/ui primitives. Install on demand via shadcn CLI. Place primitives under `src/components/ui/` (kebab-case), domain components under `src/components/{domain}/` (PascalCase).

Forms: shadcn `Form` + `FormField` + `FormItem` + `FormControl` + `FormMessage` with React Hook Form + `zodResolver`. Schemas under `src/lib/validations/`.

## Pages

See [docs/routes.md](docs/routes.md) for full route documentation.

## Backend

Backend lives at `connectME/server/`. See its README for endpoints and env. The frontend assumes the backend's `httpOnly` `token` cookie is set on login and sent automatically with every request via `withCredentials: true`.
