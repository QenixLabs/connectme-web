"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Mail, UsersRound, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/providers/auth-store-provider";
import { teamApi } from "@/lib/api/team";

export default function TeamInvitationPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [pending, setPending] = useState<"accept" | "decline" | null>(null);
  const [result, setResult] = useState<"accepted" | "declined" | null>(null);

  const respond = async (action: "accept" | "decline") => {
    setPending(action);
    try {
      if (action === "accept") {
        await teamApi.acceptInvitation(token);
        setResult("accepted");
        toast.success("You joined the team");
      } else {
        await teamApi.declineInvitation(token);
        setResult("declined");
        toast.success("Invitation declined");
      }
    } catch (error) {
      const value = error as { response?: { data?: { message?: string } } };
      toast.error(
        value.response?.data?.message ||
          "This invitation is no longer available",
      );
    } finally {
      setPending(null);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-border bg-card p-6 text-center shadow-lg sm:p-8">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
          <UsersRound className="size-7" />
        </span>
        {result === "accepted" ? (
          <>
            <h1 className="mt-5 text-2xl font-extrabold">
              You&apos;re on the team
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your RootIn access is ready.
            </p>
            <Button
              className="mt-6 w-full"
              onClick={() => router.push("/recruiter/team")}
            >
              Open team
            </Button>
          </>
        ) : result === "declined" ? (
          <>
            <h1 className="mt-5 text-2xl font-extrabold">
              Invitation declined
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This invitation will no longer grant access to the team.
            </p>
            <Button variant="outline" className="mt-6 w-full" asChild>
              <Link href="/recruiter/dashboard">Continue to RootIn</Link>
            </Button>
          </>
        ) : (
          <>
            <h1 className="mt-5 text-2xl font-extrabold">
              You&apos;re invited to a team
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Review the invitation and join your recruiter team with your
              RootIn account.
            </p>
            {user ? (
              <div className="mt-6 space-y-2">
                <Button
                  className="min-h-11 w-full"
                  onClick={() => void respond("accept")}
                  disabled={pending !== null}
                >
                  <Check className="size-4" />
                  {pending === "accept" ? "Joining..." : "Accept invitation"}
                </Button>
                <Button
                  variant="outline"
                  className="min-h-11 w-full"
                  onClick={() => void respond("decline")}
                  disabled={pending !== null}
                >
                  <X className="size-4" />
                  {pending === "decline" ? "Declining..." : "Decline"}
                </Button>
              </div>
            ) : (
              <div className="mt-6 rounded-xl bg-muted p-4">
                <Mail className="mx-auto size-5 text-primary" />
                <p className="mt-2 text-sm font-semibold">
                  Sign in to continue
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Use the email address that received this invitation.
                </p>
                <Button className="mt-4 w-full" asChild>
                  <Link href="/auth/login">Sign in to RootIn</Link>
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
