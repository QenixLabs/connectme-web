# ConnectME Frontend

Next.js 16 app for the ConnectME talent platform.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 (CSS-first via `@tailwindcss/postcss`)
- shadcn/ui (New York, neutral, lucide icons)
- Zustand v5 (client state)
- Axios (API calls, `withCredentials: true`)
- React Hook Form + Zod (forms)
- TanStack React Query v5 (installed; not yet wired)
- Motion (Framer) v12, Sonner (toasts), Recharts, date-fns

## Getting Started

```bash
npm install
npm run dev
```

Runs on `http://localhost:3000` by default. Backend also defaults to `:3000`, so set `PORT` on one of them or run the backend on `:3000` and the frontend on a different port (e.g. `next dev -p 3001`).

## Environment

Create `.env.local` and set:

```
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

Points to the NestJS backend (global prefix `api/v1`). Code fallback is `http://localhost:3001/api/v1` if unset — override locally so it actually hits the backend.

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
├── app/
│   ├── layout.tsx, page.tsx, globals.css
│   ├── auth/
│   │   ├── login/                        # email + password
│   │   ├── forgot-password/
│   │   ├── verify-email/                 # OTP entry
│   │   ├── talent/signup/
│   │   └── recruiter/signup/
│   ├── talent/
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   ├── opportunities/
│   │   ├── messages/
│   │   ├── profile/                      # owner view + edit
│   │   └── [username]/                   # public profile
│   └── recruiter/
│       ├── layout.tsx
│       ├── dashboard/
│       ├── campaigns/
│       ├── messages/
│       └── profile/
├── components/
│   ├── ui/                               # shadcn primitives (~30 files)
│   ├── layout/                           # auth-layout, dashboard-layout
│   ├── skeletons/                        # profile-skeleton
│   └── talent-card.tsx
├── stores/
│   └── auth-store.ts                     # user, isAuthenticated, login/logout/fetchUser
├── lib/
│   ├── api.ts                            # apiClient + authApi/talentApi/messagesApi
│   ├── utils.ts                          # cn()
│   ├── formatters.ts, greeting.ts, validation.ts
│   ├── validations/
│   │   └── talent-profile.schema.ts
│   └── talent-profile/                   # display + form helpers, options
└── hooks/
    └── use-password-strength.ts
```

Path alias: `@/*` → `./src/*`.

## API Layer (`src/lib/api.ts`)

Single Axios instance (`apiClient`), `withCredentials: true`, `Content-Type: application/json`. 401 responses redirect to `/auth/login` via response interceptor.

Endpoint groups:

- **`authApi`** — `login`, `signup`, `verifyOtp`, `resendOtp`, `getCurrentUser`, `logout`, `forgotPassword`, `resetPassword`
- **`talentApi`** — `checkUsernameAvailability`, `getMyProfile`, `getCompleteness`, `createProfile`, `updateProfile`, `getPublicProfile`, `requestAccess`, `respondToAccessRequest`, `getAccessRequests`
- **`messagesApi`** — `getConversations`, `markAsRead`

## State

`src/stores/auth-store.ts` holds `user`, `isAuthenticated`, `isLoading`, `error`. Actions: `login`, `logout`, `fetchUser`, `clearError`. Login redirects role-based (`/talent/profile` or `/recruiter/profile`).

No middleware exists. Auth gating is client-side: 401 from the backend triggers a redirect via the Axios interceptor.

## Styling

- Tailwind v4 configured CSS-first in `src/app/globals.css` (no `tailwind.config.{js,ts}`).
- PostCSS plugin: `@tailwindcss/postcss`.
- shadcn config (`components.json`): `style: new-york`, `baseColor: neutral`, `cssVariables: true`, `rsc: true`, `iconLibrary: lucide`.
- Use `cn()` from `src/lib/utils.ts` for conditional classes.

## UI Component Rule

Always use shadcn/ui primitives instead of hand-rolling buttons, inputs, dialogs, sheets, cards, tables, tabs, forms, alerts, badges, dropdowns, sidebars, etc. Install on demand via the shadcn CLI. Place primitives under `src/components/ui/` (kebab-case), domain components under `src/components/{domain}/` (PascalCase).

Forms: shadcn `Form` + `FormField` + `FormItem` + `FormControl` + `FormMessage` with React Hook Form + `zodResolver`. Schemas live under `src/lib/validations/`.

## Backend

Backend lives at `connectME/server/`. See its README for endpoints and env. The frontend assumes the backend's `httpOnly` `token` cookie is set on login and sent automatically with every request via `withCredentials: true`.
