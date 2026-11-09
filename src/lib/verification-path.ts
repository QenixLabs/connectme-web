import type { User } from "@/stores/auth-store";

export function getVerificationPath(user: Pick<User, "role" | "account_capabilities">) {
  if (user.role === "provider" || user.account_capabilities?.includes("provider")) {
    return "/provider/verify-documents";
  }
  if (user.role === "recruiter") {
    return "/recruiter/verify-documents";
  }
  return "/talent/verify-documents";
}
