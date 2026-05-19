# Routes & Components

## Public Routes

| Route | File | Description |
|-------|------|-------------|
| `/` | `app/page.tsx` | Landing page |
| `/talent/:username` | `app/(public)/talent/[username]/page.tsx` | Public talent profile |
| `/talent/:username/portfolio` | `app/(public)/talent/[username]/portfolio/page.tsx` | Public portfolio |

---

## Auth Routes

| Route | File | Description |
|-------|------|-------------|
| `/auth/login` | `app/auth/login/page.tsx` | Email + password login |
| `/auth/talent/signup` | `app/auth/talent/signup/page.tsx` | Talent registration |
| `/auth/recruiter/signup` | `app/auth/recruiter/signup/page.tsx` | Recruiter registration |
| `/auth/verify-email` | `app/auth/verify-email/page.tsx` | OTP verification |
| `/auth/forgot-password` | `app/auth/forgot-password/page.tsx` | Password reset request |

---

## Talent Routes (requires `talent` role)

| Route | File | Description |
|-------|------|-------------|
| `/talent/dashboard` | `app/talent/dashboard/page.tsx` | Talent dashboard |
| `/talent/profile` | `app/talent/profile/page.tsx` | Profile edit + view |
| `/talent/portfolio` | `app/talent/portfolio/page.tsx` | Portfolio management |
| `/talent/messages` | `app/talent/messages/page.tsx` | Messages |
| `/talent/notifications` | `app/talent/notifications/page.tsx` | Notifications |
| `/talent/opportunities` | `app/talent/opportunities/page.tsx` | Campaign opportunities |
| `/talent/verify-documents` | `app/talent/verify-documents/page.tsx` | Identity verification upload |

Talent profile sub-components:
- `_completeness-banner.tsx`
- `_completeness-ring.tsx`
- `_edit-form.tsx`
- `_profile-card.tsx`
- `_profile-detail.tsx`
- `_tips-card.tsx`
- `_trust-score.tsx`
- `loading.tsx`

---

## Recruiter Routes (requires `recruiter` role)

| Route | File | Description |
|-------|------|-------------|
| `/recruiter/dashboard` | `app/recruiter/dashboard/page.tsx` | Recruiter dashboard |
| `/recruiter/profile` | `app/recruiter/profile/page.tsx` | Profile edit + view |
| `/recruiter/campaigns` | `app/recruiter/campaigns/page.tsx` | Campaign management |
| `/recruiter/find-talent` | `app/recruiter/find-talent/page.tsx` | Talent search |
| `/recruiter/messages` | `app/recruiter/messages/page.tsx` | Messages |
| `/recruiter/notifications` | `app/recruiter/notifications/page.tsx` | Notifications |
| `/recruiter/verify-documents` | `app/recruiter/verify-documents/page.tsx` | Company verification upload |

Recruiter profile sub-component:
- `_edit-form.tsx`

---

## Admin Routes (requires `admin` role)

| Route | File | Description |
|-------|------|-------------|
| `/admin/dashboard` | `app/admin/dashboard/page.tsx` | Admin dashboard |
| `/admin/verifications` | `app/admin/verifications/page.tsx` | Pending verifications review |

---

## Layouts

| File | Scope |
|------|-------|
| `app/layout.tsx` | Root layout (fonts, providers, metadata) |
| `app/talent/layout.tsx` | Talent shell (dashboard-layout) |
| `app/recruiter/layout.tsx` | Recruiter shell (dashboard-layout) |
| `app/admin/layout.tsx` | Admin shell |
| `components/layout/auth-layout.tsx` | Auth page wrapper |
| `components/layout/dashboard-layout.tsx` | Sidebar + header for role dashboards |

---

## Components

### UI Primitives (shadcn)
`components/ui/`: alert, avatar, badge, button, card, collapsible, dialog, divider-label, empty-state, error-banner, form, input, label, otp-input, password-input, password-rules, password-strength, phone-input, section-header, select, separator, sheet, skeleton, stat-card, success-banner, success-state, switch, tabs, tag-input, text-input, textarea, verified-badge

### Domain Components
| Component | Path |
|-----------|------|
| Portfolio grid | `components/portfolio/portfolio-grid.tsx` |
| Portfolio item card | `components/portfolio/portfolio-item-card.tsx` |
| Portfolio uploader | `components/portfolio/portfolio-uploader.tsx` |
| Media kit view | `components/portfolio/media-kit-view.tsx` |
| Notification list | `components/notifications/notification-list.tsx` |
| Document submission form | `components/verification/document-submission-form.tsx` |
| Verification status card | `components/verification/verification-status-card.tsx` |
| Verification alerts | `components/verification-alerts.tsx` |
| Talent card | `components/talent-card.tsx` |
| Recruiter card | `components/recruiter-card.tsx` |
| Profile skeleton | `components/skeletons/profile-skeleton.tsx` |

---

## API Wrappers (`src/lib/api.ts`)

| Wrapper | Methods |
|---------|---------|
| `authApi` | login, signup, verifyOtp, resendOtp, getCurrentUser, logout, forgotPassword, resetPassword, sendPhoneOtp, verifyPhoneOtp |
| `talentApi` | checkUsernameAvailability, getMyProfile, getCompleteness, createProfile, updateProfile, getPublicProfile, getPublicPortfolio, requestAccess, respondToAccessRequest, getAccessRequests, getAllTalent, uploadProfilePhoto, uploadDocument, getPortfolio, uploadPortfolioImage, uploadPortfolioVideo, updatePortfolioItem, deletePortfolioItem, reorderPortfolioItems |
| `recruiterApi` | getMyProfile, updateProfile |
| `messagesApi` | getConversations, sendMessage, markAsRead |
| `notificationsApi` | getNotifications, getHistory, getUnreadCount, markAsRead, markAsHistory, dismissAuto |
| `verificationApi` | createVerification, addVerificationDoc, getVerificationStatus, removeVerificationDoc |
| `adminApi` | getDashboardStats, getPendingVerifications, approveVerification, rejectVerification, getUsers |

---

## Hooks

| Hook | Path | Purpose |
|------|------|---------|
| `usePasswordStrength` | `hooks/use-password-strength.ts` | Password strength scoring |
| `useSocket` | `hooks/use-socket.ts` | WebSocket connection via Socket.io |

---

## State

`src/stores/auth-store.ts` — Zustand vanilla store with `persist` middleware:
- `user`, `isAuthenticated`, `isLoading`, `error`, `hasHydrated`
- Actions: `login`, `logout`, `fetchUser`, `clearError`
- Persists to localStorage, mirrors `auth_session` + `user_role` cookies for middleware
