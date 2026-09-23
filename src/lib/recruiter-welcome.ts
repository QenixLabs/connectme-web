/**
 * One-time recruiter welcome screen ("show after signup, never again").
 *
 * The flag is stored in localStorage, keyed by user id (falling back to
 * email) so each account on a shared browser sees the welcome screen exactly
 * once. Signup redirects to `/recruiter/welcome`; the welcome page bounces
 * already-seen visitors straight to `/recruiter/dashboard`.
 */

const STORAGE_PREFIX = "rootin:recruiter-welcome-seen:";

interface WelcomeIdentity {
  _id?: string;
  email?: string;
  username?: string;
}

export function recruiterWelcomeKey(user?: WelcomeIdentity | null): string {
  return `${STORAGE_PREFIX}${user?._id ?? user?.email ?? "anon"}`;
}

export function hasSeenRecruiterWelcome(user?: WelcomeIdentity | null): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(recruiterWelcomeKey(user)) === "1";
  } catch {
    return false;
  }
}

export function markRecruiterWelcomeSeen(user?: WelcomeIdentity | null): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(recruiterWelcomeKey(user), "1");
  } catch {
    // Storage unavailable (private mode etc.) — welcome may show again,
    // but the app keeps working.
  }
}
