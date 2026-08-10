import { NextRequest, NextResponse } from "next/server";

type Role = "talent" | "recruiter" | "admin";

const PROTECTED_TALENT_PATHS = [
  "/talent/dashboard",
  "/talent/profile",
  "/talent/portfolio",
  "/talent/experience",
  "/talent/opportunities",
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
  "/recruiter/profile",
  "/recruiter/campaigns",
  "/recruiter/find-talent",
  "/recruiter/requests",
  "/recruiter/messages",
  "/recruiter/notifications",
  "/recruiter/billing",
  "/recruiter/verify-documents",
];

const ROLE_HOME: Record<Role, string> = {
  talent: "/talent/dashboard",
  recruiter: "/recruiter/dashboard",
  admin: "/admin/dashboard",
};

function matchRole(pathname: string): Role | null {
  if (pathname.startsWith("/admin")) return "admin";
  if (PROTECTED_TALENT_PATHS.some((p) => pathname.startsWith(p))) return "talent";
  if (PROTECTED_RECRUITER_PATHS.some((p) => pathname.startsWith(p))) return "recruiter";
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
  if (userRole && userRole !== requiredRole) {
    return NextResponse.redirect(new URL(ROLE_HOME[userRole] ?? "/auth/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/talent/:path*", "/recruiter/:path*", "/admin/:path*"],
};
