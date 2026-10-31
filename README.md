# RootIn Web

Next.js (App Router) + React 19 frontend for the RootIn talent platform, including the
marketplace launched in Phases 2–6 and hardened in Phase 7.

## Stack

- Next.js 16 (App Router, React Server/Client Components)
- React 19 + TypeScript
- TanStack React Query 5 (server state, caching, polling)
- Zustand (local UI/session state)
- Tailwind CSS 4 + Radix UI primitives
- axios API client (`src/lib/api/client.ts`)
- Vitest + Testing Library (Vitest 3, jsdom per-file pragma where needed)
- ESLint 9 (`eslint.config.mjs`)

The backend lives in the sibling `connectme-api` repository. All requests go to
`NEXT_PUBLIC_API_URL` with credentials enabled (httpOnly cookie auth, Bearer fallback).

## Getting Started

```bash
npm install
# create .env.local with the variables below
npm run dev        # http://localhost:3000
```

Required environment variables (names only; never commit values):

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | API base URL, including `/api/v1` |
| `NEXT_PUBLIC_SITE_URL` | Canonical site origin used for metadata/sharing |

## Scripts

```bash
npm run dev        # next dev
npm run build      # next build
npm run start      # next start (production server)
npm run lint       # eslint
npm run test       # vitest run
npm run test:watch # vitest
```

## PWA / Installation

The app is installable with the browser's own install UI; there is no custom
button, banner, or prompt.

| Piece | Location |
|-------|----------|
| Web app manifest (`/manifest.webmanifest`) | `src/app/manifest.ts` |
| App icons (192, 512, maskable, Apple touch) | `public/icons/`, `public/apple-touch-icon.png` |
| Service worker (`/sw.js`) | `public/sw.js` |
| Production registration | `src/components/pwa/service-worker-registration.tsx` |
| Offline fallback (`/offline`) | `src/app/offline/page.tsx` |

The service worker registers only in production builds. It never caches
navigations or API responses; it caches same-origin static assets and a static
offline page. Installation requires a production build served over HTTPS
(`localhost` is also treated as secure by browsers).

## Project Structure

```
src/
├── app/
│   ├── (marketplace)/          # public marketplace + participant inquiries
│   │   ├── providers/          # directory + public provider profile
│   │   ├── services/           # public service discovery + detail
│   │   └── inquiries/          # requester/provider inquiry lists + detail
│   ├── (provider-app)/provider # onboarding, profile, services, inquiries, messages
│   ├── (talent-app)/talent
│   ├── (recruiter-app)/recruiter
│   ├── (admin-app)/admin
│   └── (auth), (marketing)
├── components/marketplace/     # provider/service cards, inquiry form, reviews, bell
├── components/provider/        # provider dashboard UI (services, inquiries)
├── hooks/                      # React Query hooks (notifications, provider, inquiries)
├── lib/api/                    # axios clients + TypeScript domain types
│   ├── marketplace.ts          # providers, services, reviews, profile, activation
│   ├── inquiries.ts            # service inquiries
│   ├── notifications.ts        # notifications + settings
│   └── query-keys.ts           # stable React Query key factory
└── middleware.ts               # auth/role routing
```

Path alias: `@/*` → `src/*`.

## Marketplace Journeys

The marketplace introduces two parties (provider and requester) and indicative pricing only.
There is no payments, checkout, commission, escrow, or platform-managed booking flow.

| Journey | Route | Main pieces |
|---------|-------|-------------|
| Discover providers | `/providers` | directory filters, facets, `ProviderCard` |
| View provider | `/providers/[slug]` | public profile, services, rating summary, reviews, contact |
| Discover services | `/services` | keyword/location/category/price filters, `ServiceCard` |
| View service | `/services/[id]` | service detail + inquiry form |
| Send inquiry | `/services/[id]` | `ServiceInquiryForm` → `POST /service-inquiries` |
| Track inquiries | `/inquiries` | requester and provider lists, status filters |
| Inquiry detail | `/inquiries/[id]` | participants only; status transitions |
| Manage listings | `/provider/services` | create/edit/publish/unpublish provider listings |
| Manage incoming inquiries | `/provider/inquiries` | respond/close, provider notifications |
| Leave review | provider profile | eligibility-gated, one active review per provider |
| Report review | provider profile | creates a moderation report for admins |
| Notifications | header bell | unread count + list/history, mark read |

Provider onboarding/activation lives at `/provider/onboarding`; a provider must activate before
their profile and published listings appear in public discovery.

## Data Fetching, Caching, and Polling

- All server state goes through React Query with keys from `src/lib/api/query-keys.ts`
  (`provider.*`, `services.*`, `serviceInquiries.*`, `notifications.*`).
- Mutations invalidate the relevant list/detail keys; inquiry creation invalidates
  `serviceInquiries.mine` and `notifications.*`.
- The notification bell fetches lists **only while the popover is open** and refetches the
  unread count every 60 seconds while mounted (`staleTime: 30_000`).
- Inquiries use bounded pagination; the API caps `limit` at 100.
- The inquiry form reuses one idempotency key per submission attempt and rotates it after a
  successful send, so double clicks do not create duplicate inquiries.

## Testing

```bash
npm run test                        # full Vitest run
& .\node_modules\.bin\vitest.cmd run src/components/marketplace/marketplace-notification-bell.test.tsx
& .\node_modules\.bin\vitest.cmd run src/components/marketplace/service-inquiry-form.test.tsx
& .\node_modules\.bin\tsc.cmd --noEmit   # type check (no tsc npm script)
npm run build
```

Component tests that need the DOM start with the per-file pragma:

```ts
// @vitest-environment jsdom
```

Marketplace coverage:

- `src/components/marketplace/marketplace-notification-bell.test.tsx` — count polling, lazy list
  loading only while open, mark-read/history behavior.
- `src/components/marketplace/service-inquiry-form.test.tsx` — validation, success redirect,
  idempotency key reuse/rotation, unauthenticated redirect.
- `src/components/marketplace/provider-card.test.tsx`, `service-card.test.tsx` — public card
  rendering.
- `src/lib/marketplace-search.test.ts`, `src/lib/api/__tests__/inquiries.test.ts` — query
  serialization and API payloads.

There is no browser E2E framework in this repository. Phase 7 deliberately avoided adding a heavy
Playwright/Cypress dependency: the critical journeys are covered by component-level tests plus the
manual staging smoke checklist below. If browser automation becomes a requirement, add Playwright
as a separate CI job rather than replacing the existing tests.

## Manual E2E / Staging Smoke Checklist

Run against staging with dedicated accounts (provider, requester, third party, admin):

1. Sign in as provider; complete onboarding and activation; confirm redirect to the provider
   dashboard.
2. Create a listing, publish it, and confirm it appears at `/services` and on
   `/providers/[slug]`.
3. Save a draft and unpublish a listing; confirm neither appears in public discovery.
4. Sign in as requester; open a service, submit an inquiry, confirm redirect to `/inquiries/[id]`.
5. Double-submit the inquiry form; confirm only one inquiry exists.
6. Sign in as provider; confirm exactly one notification, open `/provider/inquiries`, respond,
   then close; confirm the requester is notified and no self-notification appears.
7. As the requester, open the inquiry detail; confirm a third account gets a 404/forbidden view.
8. After a two-way conversation and inquiry closure, submit a review; confirm the second attempt
   is rejected.
9. Report the review as a third account; confirm success with no report contents exposed to
   non-admins.
10. Open the bell: lists load only when opened, unread count refreshes on a 60-second cadence,
    mark-read moves the item to history, and a foreign notification ID cannot be modified.
11. Trigger an inquiry burst; confirm `429` with a friendly error after the configured limit.

## Deployment and Rollback

Deployment target is not pinned in this repository (Vercel or any Node host running
`next build` + `next start`). Requirements:

- Set `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_SITE_URL` per environment at build time
  (`NEXT_PUBLIC_*` values are inlined during `next build`).
- Serve over HTTPS; the API sets `Secure` cookies in staging/production.
- Ensure the web origin matches the API's `FRONTEND_URL` exactly (CORS uses credentials).
- Deploy the API and its indexes first, then the web build.

Rollback: redeploy the previous web build; no database migration is owned by this app. If a
rollback is caused by an API contract change, roll the API back first, then the web build, and
re-run the smoke checklist.

## Known Issues

- No automated browser E2E suite (see Testing).
- Notification delivery is poll-based (60 s unread count); there is no WebSocket push for
  marketplace notifications. The API has no transactional outbox, so a failed notification write
  is logged and may need operational replay.
- `next build` emits middleware-convention deprecation warnings; they do not fail the build.
- The bell does not fetch notification lists while closed by design, so an open popover is
  required to see new items beyond the unread count.
