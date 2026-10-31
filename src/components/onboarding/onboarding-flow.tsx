"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  Loader2,
  Search,
  Store,
  UsersRound,
} from "lucide-react";
import { useState } from "react";
import logoImage from "@/assets/rootin-logo-orange.png";
import { authApi } from "@/lib/api";
import { authStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * Migrated from design-pixel-perfect/src/routes/index.tsx.
 *
 * Drop the three art images into `public/assets/onboarding/`:
 *   - rootin-talent-collage.png     (welcome screen collage)
 *   - rootin-recruiter-banner.png   (recruiter role card art)
 *   - rootin-talent-banner.png      (talent role card art)
 */
const recruiterImage = "/assets/onboarding/rootin-recruiter-banner.png";
const talentImage = "/assets/onboarding/rootin-talent-banner.png";

const imageSizes = "(max-width: 520px) 100vw, 430px";

export type OnboardingRole = "recruiter" | "talent" | "provider";

type Role = OnboardingRole;

function RootinLogo() {
  return (
    <Link href="/" aria-label="RootIn home">
      <Image
        src={logoImage}
        alt="RootIn"
        height={32}
        className="h-10 w-auto"
        priority
      />
    </Link>
  );
}

const recruiterTags = ["Casting Directors", "Agencies", "Production Houses", "Brands & Advertisers", "Event Companies"];
const talentTags = ["Actors", "Models", "Dancers", "Musicians", "Creators", "Technicians", "Voice Artists", "and more..."];
const providerTags = ["Photographers", "Studios", "Makeup Artists", "Event Services", "and more..."];

function RoleCard({
  role,
  selected,
  onSelect,
}: {
  role: Role;
  selected: boolean;
  onSelect: () => void;
}) {
  const recruiter = role === "recruiter";
  const provider = role === "provider";
  const tags = recruiter ? recruiterTags : provider ? providerTags : talentTags;
  const image = recruiter ? recruiterImage : provider ? "/provider-signup-hero.png" : talentImage;
  const roleLabel = recruiter ? "recruiters" : provider ? "service providers" : "talent";
  const title = recruiter ? "Recruiter" : provider ? "Service Provider" : "Talent Professional";
  const description = recruiter
    ? "Find exceptional talent, create opportunities and bring stories to life."
    : provider
      ? "Showcase your services, connect with clients and grow your business."
      : "Showcase your work, get discovered and unlock new opportunities.";
  return (
    <button
      type="button"
      className={`role-card ${selected ? "role-card-selected" : ""}`}
      onClick={onSelect}
      aria-pressed={selected}
    >
      <Image
        className="role-art"
        src={image}
        alt=""
        aria-hidden="true"
        fill
        sizes={imageSizes}
      />
      <span className="role-shade" />
      <span className="relative z-10 block max-w-[48%] text-left">
        <span className="role-eyebrow">For {roleLabel}</span>
        <span className="mt-2 block text-[1.16rem] font-extrabold leading-tight text-foreground">
          I’m a {title}
        </span>
        <span className="mt-2 block text-[0.7rem] font-medium leading-[1.45] text-muted-foreground">
          {description}
        </span>
      </span>
      {selected && <span className="select-check"><Check size={15} strokeWidth={3} /></span>}
      <span className="role-symbol">
        {recruiter ? <Search size={17} /> : provider ? <Store size={17} /> : <UsersRound size={17} />}
      </span>
      <span className="tag-list">
        {tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}
      </span>
    </button>
  );
}

export function RoleScreen({
  initialRole = "recruiter",
  onContinue,
  googleSignup = false,
}: {
  initialRole?: OnboardingRole;
  onContinue?: (role: OnboardingRole) => void;
  googleSignup?: boolean;
} = {}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Role>(initialRole);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [providerSoonOpen, setProviderSoonOpen] = useState(false);

  const handleContinue = async () => {
    if (selected === "provider") {
      setProviderSoonOpen(true);
      return;
    }
    if (onContinue) {
      onContinue(selected);
      return;
    }
    if (googleSignup) {
      setSubmitting(true);
      setError(null);
      try {
        authStore.getState().setAccessToken(null);
        await authApi.completeGoogleSignup(selected);
        router.replace(selected === "talent"
          ? "/auth/talent/signup?resume=1"
          : "/auth/recruiter/signup?resume=1");
      } catch (err: unknown) {
        const response = err as { response?: { data?: { message?: string | string[] } } };
        const message = response.response?.data?.message;
        setError(
          message === "GOOGLE_SIGNUP_SESSION_EXPIRED"
            ? "Your Google signup session expired. Please start Google sign-in again."
            : Array.isArray(message)
              ? message.join(" ")
              : message || "Could not continue Google signup. Please try again.",
        );
      } finally {
        setSubmitting(false);
      }
      return;
    }
    router.push(
      selected === "talent"
        ? "/auth/talent/signup"
        : "/auth/recruiter/signup",
    );
  };

  return (
    <main className="screen role-screen">
      <header className="role-header flex items-center">
        <RootinLogo />
        <span className="h-10 w-10" />
      </header>



      <section className="px-6 pt-6">
        <h1 className="text-[1.65rem] font-extrabold leading-[1.08] text-foreground">
          {googleSignup ? (
            <>Choose your role<br />on <span className="text-primary">Rootin.</span></>
          ) : (
            <>How do you want to<br />be a part of <span className="text-primary">Rootin?</span></>
          )}
        </h1>
        <p className="mt-2 text-[0.78rem] font-medium text-muted-foreground">
          {googleSignup
            ? "Your Google account is verified. Choose a role to continue signup."
            : "Choose your role to get a personalized experience."}
        </p>
      </section>

      <section className="mt-5 grid gap-4 px-5">
        <RoleCard role="recruiter" selected={selected === "recruiter"} onSelect={() => setSelected("recruiter")} />
        <RoleCard role="talent" selected={selected === "talent"} onSelect={() => setSelected("talent")} />
        <RoleCard role="provider" selected={selected === "provider"} onSelect={() => { setSelected("provider"); setProviderSoonOpen(true); }} />
      </section>

      <div className="mt-auto px-5 pb-6 pt-5">
        {error && (
          <p className="mb-3 rounded-xl bg-red-500/10 px-4 py-3 text-sm font-medium text-red-700" role="alert">
            {error}
          </p>
        )}
        <button className="continue-button" type="button" onClick={handleContinue} disabled={submitting}>
          <span>
            {submitting
              ? "Preparing your signup..."
              : `Continue as ${
                  selected === "provider"
                    ? "Service Provider"
                    : selected === "recruiter"
                      ? "Recruiter"
                      : "Talent"
                }`}
          </span>
          {submitting ? <Loader2 size={21} className="animate-spin" /> : <ArrowRight size={21} />}
        </button>
        <p className="mt-6 text-center text-[0.72rem] font-medium text-muted-foreground">
          Already have an account?{" "}
          <Link className="font-bold text-primary" href="/auth/login">
            Sign In
          </Link>
        </p>
      </div>

      <Dialog open={providerSoonOpen} onOpenChange={setProviderSoonOpen}>
        <DialogContent className="max-w-[22rem] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold">Coming soon</DialogTitle>
            <DialogDescription className="text-sm leading-6">
              Service Provider accounts are coming soon. We&apos;re putting the finishing touches
              on this experience.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              className="w-full rounded-xl font-bold"
              onClick={() => setProviderSoonOpen(false)}
            >
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

export function OnboardingFlow() {
  return (
    <div className="app-shell onboarding-theme">
      <RoleScreen />
    </div>
  );
}
