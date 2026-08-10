"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Menu,
  Bell,
  User,
  ArrowLeft,
  ShieldCheck,
  Lock,
  Info,
  Home,
  Briefcase,
  Award,
  MessageSquare,
  Headphones,
  ChevronDown,
  Contact,
  X,
  CheckCircle2,
  RefreshCw,
  Trash2,
  UploadCloud,
  Camera,
  AlertTriangle,
  Plus,
  Upload,
  FileCheck2,
  Search,
  Check,
  Clock,
  ArrowRight,
  ShieldQuestion,
  Loader2,
} from "lucide-react";
import { useAuthStore } from "@/providers/auth-store-provider";
import { useVerification, useCreateVerification, useUploadVerificationDoc, useRemoveVerificationDoc } from "@/hooks/use-verification";
import { useUnreadNotifications, useUnreadMessages } from "@/hooks/use-unread-counts";
import { Skeleton } from "@/components/ui/skeleton";

const steps = [
  {
    title: "Upload Documents",
    desc: "Upload both sides of your identity proof",
    icon: Upload,
    tone: "primary" as const,
  },
  {
    title: "Submitted",
    desc: "We have received your documents",
    icon: FileCheck2,
    tone: "info" as const,
  },
  {
    title: "Under Review",
    desc: "Our team is verifying your documents",
    icon: Search,
    tone: "warning" as const,
  },
  {
    title: "Verified",
    desc: "You'll get a verified badge on your profile",
    icon: Check,
    tone: "success" as const,
  },
];

const tips = [
  "Ensure all details are clearly visible",
  "Good lighting, no glare or blur",
  "All corners of the document visible",
  "Use original, unedited documents",
  "File size should be under 5MB",
];

type VerificationStatus = {
  label: string;
  color: string;
  dotColor: string;
};

function getStatusDisplay(status?: string): VerificationStatus {
  switch (status) {
    case "approved":
      return { label: "Verified", color: "text-success", dotColor: "bg-success" };
    case "pending":
      return { label: "In Progress", color: "text-warning", dotColor: "bg-warning" };
    case "manual_review":
      return { label: "Under Review", color: "text-info", dotColor: "bg-info" };
    case "rejected":
      return { label: "Rejected", color: "text-destructive", dotColor: "bg-destructive" };
    case "auto_approved":
      return { label: "Verified", color: "text-success", dotColor: "bg-success" };
    default:
      return { label: "Not Started", color: "text-muted-foreground", dotColor: "bg-muted-foreground" };
  }
}

function Sidebar({ unreadMessages }: { unreadMessages?: number }) {
  const navItems = [
    { label: "Home", icon: Home, badge: null },
    { label: "Jobs", icon: Briefcase, badge: null },
    { label: "Experience", icon: Award, badge: null },
    { label: "Messages", icon: MessageSquare, badge: unreadMessages && unreadMessages > 0 ? String(unreadMessages) : null },
  ];

  return (
    <aside className="sticky top-16 flex h-[calc(100vh-4rem)] w-[136px] shrink-0 flex-col justify-between border-r border-border bg-surface/40 py-6">
      <nav className="flex flex-col gap-2 px-3">
        {navItems.map((item) => (
          <button
            key={item.label}
            className="relative flex flex-col items-center gap-2 rounded-xl px-2 py-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <item.icon className="h-6 w-6" strokeWidth={1.6} />
            {item.label}
            {item.badge ? (
              <span className="absolute right-3 top-2 grid h-5 w-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {item.badge}
              </span>
            ) : null}
          </button>
        ))}
      </nav>
      <div className="mx-3 rounded-xl border border-border bg-surface p-4 text-center">
        <Headphones className="mx-auto h-6 w-6 text-muted-foreground" strokeWidth={1.6} />
        <p className="mt-2 text-sm font-semibold">Need Help?</p>
        <a href="#support" className="mt-1 block text-xs font-medium text-primary hover:underline">
          Contact our support team
        </a>
      </div>
    </aside>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur sm:px-6">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <Skeleton className="h-7 w-36" />
        <div className="ml-auto flex items-center gap-1">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <Skeleton className="h-10 w-10 rounded-lg" />
        </div>
      </header>
      <div className="flex min-h-[calc(100vh-4rem)]">
        <div className="hidden lg:flex sticky top-16 h-[calc(100vh-4rem)] w-[136px] shrink-0 flex-col gap-2 border-r border-border bg-surface/40 p-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6">
          <Skeleton className="h-5 w-32 mb-4" />
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-5">
              <Skeleton className="h-44 rounded-2xl" />
              <Skeleton className="h-28 rounded-xl panel" />
              <Skeleton className="h-80 rounded-xl panel" />
            </div>
            <div className="space-y-5">
              <Skeleton className="h-64 rounded-xl panel" />
              <Skeleton className="h-48 rounded-xl panel" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function TalentVerifyDocumentsPage() {
  const user = useAuthStore((s) => s.user);
  const { data: verification, isLoading } = useVerification(user?._id);
  const { data: unreadNotifications } = useUnreadNotifications();
  const { data: unreadMessages } = useUnreadMessages();
  const createVerification = useCreateVerification();
  const uploadDoc = useUploadVerificationDoc();
  const removeDoc = useRemoveVerificationDoc();

  const [docType, setDocType] = useState("Aadhaar Card");
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  const docs = useMemo(() => verification?.submitted_docs ?? [], [verification?.submitted_docs]);
  const frontDoc = docs.find((d) => d.type === "front");
  const backDoc = docs.find((d) => d.type === "back");
  const uploadedCount = docs.length;
  const canSubmit = frontDoc && backDoc && verification?.status === "pending";
  const statusDisplay = getStatusDisplay(verification?.status);

  const handleFileSelect = useCallback(
    async (file: File, docTypeValue: string) => {
      if (!verification) {
        toast.error("Please start verification first");
        return;
      }
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error("File size must be under 5MB");
        return;
      }
      const allowed = ["image/jpeg", "image/png", "application/pdf"];
      if (!allowed.includes(file.type)) {
        toast.error("Only JPG, PNG, and PDF files are allowed");
        return;
      }
      try {
        await uploadDoc.mutateAsync({
          verificationId: verification._id,
          file,
          docType: docTypeValue,
        });
        toast.success(`${docTypeValue === "front" ? "Front" : "Back"} side uploaded`);
      } catch {
        toast.error("Upload failed. Please try again.");
      }
    },
    [verification, uploadDoc],
  );

  const handleRemove = useCallback(
    async (docTypeValue: string) => {
      if (!verification) return;
      const idx = docs.findIndex((d) => d.type === docTypeValue);
      if (idx === -1) return;
      try {
        await removeDoc.mutateAsync({
          verificationId: verification._id,
          docIndex: idx,
        });
        toast.success("Document removed");
      } catch {
        toast.error("Failed to remove document");
      }
    },
    [verification, docs, removeDoc],
  );

  const handleStartVerification = useCallback(async () => {
    try {
      await createVerification.mutateAsync("talent_id");
      toast.success("Verification started");
    } catch {
      toast.error("Failed to start verification");
    }
  }, [createVerification]);

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur sm:px-6">
        <button
          aria-label="Open menu"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-foreground transition-colors hover:bg-accent"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="truncate text-xl font-extrabold tracking-tight sm:text-2xl">
          Connect<span className="text-primary">Me</span>
        </span>
        <div className="ml-auto flex shrink-0 items-center gap-1">
          <Link
            href="/talent/notifications"
            aria-label="Notifications"
            className="relative grid h-10 w-10 place-items-center rounded-lg transition-colors hover:bg-accent"
          >
            <Bell className="h-5 w-5" strokeWidth={1.7} />
            {unreadNotifications && unreadNotifications.count > 0 ? (
              <span className="absolute right-1 top-1 grid h-4 w-4 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {unreadNotifications.count}
              </span>
            ) : null}
          </Link>
          <button
            aria-label="Account"
            className="grid h-10 w-10 place-items-center rounded-lg transition-colors hover:bg-accent"
          >
            <User className="h-5 w-5" strokeWidth={1.7} />
          </button>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-4rem)]">
        <Sidebar unreadMessages={unreadMessages?.count} />

        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6">
          <Link
            href="/talent/profile"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Profile
          </Link>

          {/* No verification started */}
          {!verification && (
            <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-border bg-surface p-10 text-center">
              <div className="relative grid h-24 w-24 place-items-center">
                <span className="glow-ring absolute inset-0 rounded-full" />
                <ShieldCheck className="h-12 w-12 text-primary" strokeWidth={1.4} />
              </div>
              <h2 className="mt-5 text-xl font-extrabold">Start Identity Verification</h2>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Verify your identity to build trust with recruiters and unlock premium features.
              </p>
              <button
                onClick={handleStartVerification}
                disabled={createVerification.isPending}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {createVerification.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                Start Verification
              </button>
            </div>
          )}

          {/* Verification in progress */}
          {verification && (
            <div className="mt-4 grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div className="min-w-0 space-y-5">
                {/* Hero */}
                <section className="hero-gradient relative overflow-hidden rounded-2xl border border-border p-5 sm:p-7">
                  <div className="grid gap-6 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center">
                    <div className="relative grid h-28 w-28 shrink-0 place-items-center">
                      <span className="glow-ring absolute inset-0 rounded-full" />
                      <ShieldCheck className="h-14 w-14 text-primary" strokeWidth={1.4} />
                    </div>
                    <div className="min-w-0">
                      <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                        Identity Verification
                      </h1>
                      <p className="mt-2 max-w-md text-sm text-muted-foreground">
                        Verify your identity to build trust with recruiters and unlock premium
                        features.
                      </p>
                      <p className="mt-3 flex items-center gap-2 text-sm">
                        <span className={`h-2.5 w-2.5 rounded-full ${statusDisplay.dotColor}`} />
                        <span className="font-semibold text-muted-foreground">Status:</span>
                        <span className={`font-bold ${statusDisplay.color}`}>{statusDisplay.label}</span>
                      </p>
                    </div>
                    <div className="flex max-w-xs gap-3 rounded-xl border border-border bg-background/50 p-4">
                      <Lock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        Your data is 100% secure and private. Only our verification team can access
                        your documents.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Progress */}
                <section className="panel p-5">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:justify-between">
                    <h2 className="text-base font-bold sm:text-lg">Verification Progress</h2>
                    <div className="flex shrink-0 items-center gap-2 rounded-lg border border-border bg-background/50 px-3 py-2 text-sm font-semibold">
                      <span className="text-primary">{uploadedCount}</span>
                      <span className="text-muted-foreground">/ 2 Files Attached</span>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${(uploadedCount / 2) * 100}%` }}
                    />
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {uploadedCount === 0
                      ? "Upload both sides of your identity proof to continue."
                      : uploadedCount === 1
                        ? "Upload the remaining side to continue."
                        : "Both sides uploaded. Ready to submit."}
                  </p>
                </section>

                {/* Identity proof */}
                <section className="panel p-5">
                  <h2 className="text-lg font-bold">
                    1. Identity Proof <span className="text-primary">(Required)</span>
                  </h2>

                  <label
                    htmlFor="docType"
                    className="mt-4 block text-sm font-medium text-muted-foreground"
                  >
                    Document Type
                  </label>
                  <div className="relative mt-2 max-w-sm">
                    <Contact className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <select
                      id="docType"
                      value={docType}
                      onChange={(e) => setDocType(e.target.value)}
                      className="w-full appearance-none rounded-lg border border-border bg-background/50 py-3 pl-10 pr-10 text-sm font-medium text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring/40"
                    >
                      <option>Aadhaar Card</option>
                      <option>PAN Card</option>
                      <option>Passport</option>
                      <option>Driving Licence</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  </div>

                  <input
                    ref={frontInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(file, "front");
                      e.target.value = "";
                    }}
                  />
                  <input
                    ref={backInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(file, "back");
                      e.target.value = "";
                    }}
                  />

                  <div className="mt-6 grid gap-6 md:grid-cols-2 md:divide-x md:divide-border">
                    {/* Front */}
                    <div className="md:pr-6">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-base font-bold">Front Side</h3>
                        {frontDoc ? (
                          <span className="rounded-md bg-success/15 px-2 py-0.5 text-xs font-semibold text-success">
                            Uploaded
                          </span>
                        ) : (
                          <span className="rounded-md bg-warning/15 px-2 py-0.5 text-xs font-semibold text-warning">
                            Pending
                          </span>
                        )}
                      </div>
                      {frontDoc ? (
                        <div className="mt-3 rounded-xl border border-border bg-background/40 p-4">
                          <div className="flex items-start gap-4">
                            <div className="relative shrink-0">
                              <div className="grid h-16 w-24 place-items-center rounded-md border border-border bg-surface-2/60">
                                <FileCheck2 className="h-6 w-6 text-success" />
                              </div>
                              <button
                                onClick={() => handleRemove("front")}
                                aria-label="Remove preview"
                                className="absolute -right-2 -top-2 grid h-5 w-5 place-items-center rounded border border-border bg-surface text-muted-foreground hover:text-foreground"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold">front_side.{frontDoc.url.split(".").pop() || "jpg"}</p>
                              <p className="mt-1 text-xs text-muted-foreground">{docType}</p>
                            </div>
                            <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
                          </div>
                          <div className="mt-4 grid grid-cols-2 gap-3">
                            <button
                              onClick={() => frontInputRef.current?.click()}
                              disabled={uploadDoc.isPending}
                              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface-2/60 px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-accent disabled:opacity-50"
                            >
                              {uploadDoc.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                              ) : (
                                <RefreshCw className="h-4 w-4 text-primary" />
                              )}{" "}
                              Replace
                            </button>
                            <button
                              onClick={() => handleRemove("front")}
                              disabled={removeDoc.isPending}
                              className="inline-flex items-center justify-center gap-2 rounded-lg border border-destructive/40 px-3 py-2.5 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
                            >
                              <Trash2 className="h-4 w-4" /> Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-3 rounded-xl border border-dashed border-border p-5 text-center">
                          <div className="flex flex-col items-center gap-3 sm:flex-row sm:text-left">
                            <UploadCloud className="h-9 w-9 shrink-0 text-primary" strokeWidth={1.5} />
                            <div className="min-w-0">
                              <p className="text-base font-bold">Upload Front Side</p>
                              <p className="mt-1 text-sm text-muted-foreground">
                                Drag &amp; drop or choose file
                              </p>
                              <p className="text-xs text-muted-foreground">
                                JPG, PNG, PDF • Max 5MB
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => frontInputRef.current?.click()}
                            disabled={uploadDoc.isPending}
                            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface-2/60 px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-accent disabled:opacity-50"
                          >
                            {uploadDoc.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Camera className="h-4 w-4" />
                            )}{" "}
                            Take Photo
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Back */}
                    <div className="md:pl-6">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-base font-bold">Back Side</h3>
                        {backDoc ? (
                          <span className="rounded-md bg-success/15 px-2 py-0.5 text-xs font-semibold text-success">
                            Uploaded
                          </span>
                        ) : (
                          <span className="rounded-md bg-warning/15 px-2 py-0.5 text-xs font-semibold text-warning">
                            Pending
                          </span>
                        )}
                      </div>
                      {backDoc ? (
                        <div className="mt-3 rounded-xl border border-border bg-background/40 p-4">
                          <div className="flex items-start gap-4">
                            <div className="relative shrink-0">
                              <div className="grid h-16 w-24 place-items-center rounded-md border border-border bg-surface-2/60">
                                <FileCheck2 className="h-6 w-6 text-success" />
                              </div>
                              <button
                                onClick={() => handleRemove("back")}
                                aria-label="Remove preview"
                                className="absolute -right-2 -top-2 grid h-5 w-5 place-items-center rounded border border-border bg-surface text-muted-foreground hover:text-foreground"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold">back_side.{backDoc.url.split(".").pop() || "jpg"}</p>
                              <p className="mt-1 text-xs text-muted-foreground">{docType}</p>
                            </div>
                            <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
                          </div>
                          <div className="mt-4 grid grid-cols-2 gap-3">
                            <button
                              onClick={() => backInputRef.current?.click()}
                              disabled={uploadDoc.isPending}
                              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface-2/60 px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-accent disabled:opacity-50"
                            >
                              {uploadDoc.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                              ) : (
                                <RefreshCw className="h-4 w-4 text-primary" />
                              )}{" "}
                              Replace
                            </button>
                            <button
                              onClick={() => handleRemove("back")}
                              disabled={removeDoc.isPending}
                              className="inline-flex items-center justify-center gap-2 rounded-lg border border-destructive/40 px-3 py-2.5 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
                            >
                              <Trash2 className="h-4 w-4" /> Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-3 rounded-xl border border-dashed border-border p-5 text-center">
                          <div className="flex flex-col items-center gap-3 sm:flex-row sm:text-left">
                            <UploadCloud className="h-9 w-9 shrink-0 text-primary" strokeWidth={1.5} />
                            <div className="min-w-0">
                              <p className="text-base font-bold">Upload Back Side</p>
                              <p className="mt-1 text-sm text-muted-foreground">
                                Drag &amp; drop or choose file
                              </p>
                              <p className="text-xs text-muted-foreground">
                                JPG, PNG, PDF • Max 5MB
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => backInputRef.current?.click()}
                            disabled={uploadDoc.isPending}
                            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface-2/60 px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-accent disabled:opacity-50"
                          >
                            {uploadDoc.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Camera className="h-4 w-4" />
                            )}{" "}
                            Take Photo
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {!backDoc && uploadedCount > 0 && (
                    <div className="mt-5 flex items-center gap-3 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3">
                      <AlertTriangle className="h-5 w-5 shrink-0 text-warning" />
                      <p className="text-sm font-medium text-warning">
                        Please upload the back side of your document to proceed.
                      </p>
                    </div>
                  )}
                </section>

                {/* Additional document */}
                <section className="panel grid gap-5 p-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                  <div className="min-w-0">
                    <h2 className="text-lg font-bold">
                      2. Additional Document <span className="text-primary">(Optional)</span>
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Add PAN Card, Passport, Driving Licence or any other document.
                    </p>
                  </div>
                  <button className="flex items-center gap-4 rounded-xl border border-dashed border-border px-5 py-4 text-left transition-colors hover:bg-accent/50">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-surface-2/60">
                      <Plus className="h-5 w-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-bold">Add Another Document</span>
                      <span className="mt-1 block text-xs text-muted-foreground">
                        JPG, PNG, PDF • Max 5MB
                      </span>
                    </span>
                  </button>
                </section>

                {/* Submit */}
                <div>
                  <button
                    disabled={!canSubmit || uploadDoc.isPending}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-primary/25 bg-primary/15 px-4 py-4 text-base font-bold text-foreground/50 disabled:cursor-not-allowed enabled:border-primary enabled:bg-primary enabled:text-primary-foreground enabled:hover:bg-primary/90"
                  >
                    <Lock className="h-4 w-4" /> Submit for Verification
                  </button>
                  <p className="mt-3 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
                    <ShieldQuestion className="h-4 w-4 shrink-0" />
                    {uploadedCount < 2
                      ? "Upload both required sides to enable submission"
                      : verification?.status === "pending"
                        ? "Ready to submit"
                        : verification?.status === "approved"
                          ? "Your identity is already verified"
                          : "Your verification is being processed"}
                  </p>
                </div>
              </div>

              {/* Right rail */}
              <div className="space-y-5">
                <section className="panel p-5">
                  <h2 className="text-lg font-bold">Verification Process</h2>
                  <ol className="mt-4 space-y-5">
                    {steps.map((step, i) => (
                      <li key={step.title} className="relative flex gap-4">
                        {i < steps.length - 1 ? (
                          <span className="absolute left-[15px] top-9 h-[calc(100%+4px)] w-px bg-border" />
                        ) : null}
                        <span
                          className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${
                            step.tone === "primary"
                              ? "bg-primary/20 text-primary"
                              : step.tone === "info"
                                ? "bg-info/25 text-info"
                                : step.tone === "warning"
                                  ? "bg-warning/20 text-warning"
                                  : "bg-success/20 text-success"
                          }`}
                        >
                          <step.icon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-bold">{step.title}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{step.desc}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                  <div className="mt-5 flex items-center gap-3 rounded-lg border border-border bg-background/40 px-4 py-3 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 shrink-0" />
                    Usually takes 24–48 hours
                  </div>
                </section>

                <section className="panel p-5">
                  <h2 className="text-lg font-bold">Tips for Successful Verification</h2>
                  <ul className="mt-4 space-y-3">
                    {tips.map((tip) => (
                      <li key={tip} className="flex gap-3 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                  <a
                    href="#guidelines"
                    className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                  >
                    View full guidelines <ArrowRight className="h-4 w-4" />
                  </a>
                </section>

                <section className="panel p-5 text-center lg:hidden">
                  <Headphones className="mx-auto h-6 w-6 text-muted-foreground" strokeWidth={1.6} />
                  <p className="mt-2 text-sm font-semibold">Need Help?</p>
                  <a href="#support" className="mt-1 block text-xs font-medium text-primary">
                    Contact our support team
                  </a>
                </section>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
