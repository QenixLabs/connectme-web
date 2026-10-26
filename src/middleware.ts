import { NextRequest, NextResponse } from "next/server";

type Role = "talent" | "recruiter" | "admin" | "provider";

const PROTECTED_TALENT_PATHS = [
  "/talent/dashboard",
  "/talent/profile",
  "/talent/portfolio",
  "/talent/experience",
  "/talent/opportunities",
  "/talent/analytics",
  "/talent/applications",
  "/talent/requests",
  "/talent/messages",
  "/talent/notifications",
  "/talent/billing",
  "/talent/settings",
  "/talent/verify-documents",
];

const PROTECTED_RECRUITER_PATHS = [
  "/recruiter/dashboard",
  "/recruiter/welcome",
  "/recruiter/new",
  "/recruiter/profile",
  "/recruiter/campaigns",
  "/recruiter/find-talent",
  "/recruiter/requests",
  "/recruiter/messages",
  "/recruiter/notifications",
  "/recruiter/billing",
  "/recruiter/verify-documents",
];

const PROTECTED_PROVIDER_PATHS = ["/provider"];

const ROLE_HOME: Record<Role, string> = {
  talent: "/talent/dashboard",
  recruiter: "/recruiter/dashboard",
  admin: "/admin/dashboard",
  provider: "/provider/dashboard",
};

function matchRole(pathname: string): Role | null {
  if (pathname.startsWith("/admin")) return "admin";
  if (PROTECTED_TALENT_PATHS.some((p) => pathname.startsWith(p))) return "talent";
  if (PROTECTED_RECRUITER_PATHS.some((p) => pathname.startsWith(p))) return "recruiter";
  if (PROTECTED_PROVIDER_PATHS.some((p) => pathname.startsWith(p))) return "provider";
  return null;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const requiredRole = matchRole(pathname);
  if (!requiredRole) return NextResponse.next();

  const authSession = req.cookies.get("auth_session")?.value;
  if (!authSession) {
    const url = new URL("/auth/login", req.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  const userRole = req.cookies.get("user_role")?.value as Role | undefined;
  const capabilities = (req.cookies.get("user_capabilities")?.value ?? "")
    .split(",")
    .filter(Boolean);
  if (userRole && userRole !== requiredRole) {
    const isProviderOnboardingEntry =
      requiredRole === "provider" && pathname.startsWith("/provider/onboarding");
    const canEnterProviderArea =
      requiredRole === "provider" &&
      (capabilities.includes("provider") ||
        (isProviderOnboardingEntry && (userRole === "talent" || userRole === "recruiter")));
    if (!canEnterProviderArea) {
      return NextResponse.redirect(new URL(ROLE_HOME[userRole] ?? "/auth/login", req.url));
    }
  }

  const onboarding = req.cookies.get("onboarding_completed")?.value;
  const effectiveRole = userRole ?? requiredRole;
  if (onboarding === "0" && (effectiveRole === "talent" || effectiveRole === "recruiter")) {
    const onboardingPath =
      effectiveRole === "recruiter" ? "/auth/recruiter/signup?resume=1" : "/auth/talent/signup?resume=1";
    if (!pathname.startsWith("/auth/")) {
      return NextResponse.redirect(new URL(onboardingPath, req.url));
    }
  }
  if (onboarding === "0" && effectiveRole === "provider") {
    if (!pathname.startsWith("/auth/") && !pathname.startsWith("/provider/onboarding")) {
      return NextResponse.redirect(new URL("/provider/onboarding", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/talent/:path*", "/recruiter/:path*", "/admin/:path*", "/provider/:path*"],
};
