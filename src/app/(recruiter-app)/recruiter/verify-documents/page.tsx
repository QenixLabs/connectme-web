"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  BadgeCheck,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  Clock,
  ContactRound,
  FileCheck2,
  Gem,
  Loader2,
  LockKeyhole,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  TrendingUp,
  UploadCloud,
  UsersRound,
  X,
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/providers/auth-store-provider";
import {
  useCreateVerification,
  useRemoveVerificationDoc,
  useSubmitVerification,
  useUploadVerificationDoc,
  useVerification,
} from "@/hooks/use-verification";

const documentTypes = [
  "GST Certificate",
  "PAN Card (Company)",
  "Incorporation Certificate",
  "Other company document",
];

const benefits = [
  { label: "Greater trust\nfrom talent", icon: ShieldCheck },
  { label: "More\napplications", icon: UsersRound },
  { label: "Priority in\nsearch results", icon: Gem },
  { label: "Unlock premium\nopportunities", icon: TrendingUp },
];

const tips = [
  "Ensure all details are clearly visible",
  "Good lighting, no glare or blur",
  "All corners of the document visible",
  "Use original, unedited documents",
  "File size should be under 5MB",
];

type StatusDisplay = {
  label: string;
  tone: "success" | "warning" | "info" | "danger" | "muted";
};

function getStatusDisplay(status?: string): StatusDisplay {
  switch (status) {
    case "approved":
    case "auto_approved":
      return { label: "Verified", tone: "success" };
    case "manual_review":
      return { label: "Under review", tone: "info" };
    case "rejected":
      return { label: "Action needed", tone: "danger" };
    case "pending":
      return { label: "In progress", tone: "warning" };
    default:
      return { label: "Not verified", tone: "muted" };
  }
}

function getCurrentStep(status: string | undefined, uploadedCount: number) {
  if (status === "approved" || status === "auto_approved") return 5;
  if (status === "manual_review") return 4;
  if (uploadedCount >= 2) return 3;
  return 2;
}

function toneClasses(tone: StatusDisplay["tone"]) {
  switch (tone) {
    case "success":
      return "bg-success/15 text-success";
    case "warning":
      return "bg-warning/15 text-warning";
    case "info":
      return "bg-primary/10 text-primary";
    case "danger":
      return "bg-destructive/10 text-destructive";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function getFileName(url: string | undefined, fallback: string) {
  const name = url?.split(/[\\/]/).pop()?.split("?")[0];
  return name || fallback;
}

function LoadingSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[850px] px-5 py-8 sm:px-10 lg:px-14">
      <Skeleton className="h-8 w-full rounded-full" />
      <Skeleton className="mt-10 h-64 rounded-3xl" />
      <Skeleton className="mt-6 h-24 rounded-2xl" />
      <Skeleton className="mt-4 h-24 rounded-2xl" />
    </div>
  );
}

export default function RecruiterVerifyDocumentsPage() {
  const user = useAuthStore((state) => state.user);
  const { data: verification, isLoading } = useVerification(user?._id);
  const createVerification = useCreateVerification();
  const uploadDoc = useUploadVerificationDoc();
  const removeDoc = useRemoveVerificationDoc();
  const submitVerification = useSubmitVerification();

  const [docType, setDocType] = useState("Company Registration");
  const [additionalDocType, setAdditionalDocType] = useState(documentTypes[0]);
  const [notice, setNotice] = useState("");
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);
  const additionalInputRef = useRef<HTMLInputElement>(null);
  const uploadSectionRef = useRef<HTMLElement>(null);

  const docs = useMemo(() => verification?.submitted_docs ?? [], [verification?.submitted_docs]);
  const frontDoc = docs.find((doc) => doc.type === "front");
  const backDoc = docs.find((doc) => doc.type === "back");
  const additionalDocs = docs.filter((doc) => doc.type !== "front" && doc.type !== "back");
  const uploadedCount = docs.length;
  const statusDisplay = getStatusDisplay(verification?.status);
  const currentStep = getCurrentStep(verification?.status, uploadedCount);
  const canSubmit = Boolean(
    verification && frontDoc && backDoc && verification.status === "pending",
  );
  const isUploading = uploadDoc.isPending;

  const scrollToUpload = useCallback(() => {
    uploadSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleFileSelect = useCallback(
    async (file: File, type: string) => {
      if (!verification) {
        toast.error("Please start verification first");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be under 5MB");
        return;
      }
      if (!["image/jpeg", "image/png", "application/pdf"].includes(file.type)) {
        toast.error("Only JPG, PNG, and PDF files are allowed");
        return;
      }

      try {
        await uploadDoc.mutateAsync({
          verificationId: verification._id,
          file,
          docType: type,
        });
        setNotice(type === "front" ? "Front side uploaded." : type === "back" ? "Back side uploaded." : "Additional document uploaded.");
        toast.success("Document uploaded");
      } catch {
        toast.error("Upload failed. Please try again.");
      }
    },
    [uploadDoc, verification],
  );

  const handleRemove = useCallback(
    async (docTypeValue: string) => {
      if (!verification) return;
      const docIndex = docs.findIndex((doc) => doc.type === docTypeValue);
      if (docIndex < 0) return;
      try {
        await removeDoc.mutateAsync({ verificationId: verification._id, docIndex });
        setNotice("Document removed.");
        toast.success("Document removed");
      } catch {
        toast.error("Failed to remove document");
      }
    },
    [docs, removeDoc, verification],
  );

  const handleRemoveAt = useCallback(
    async (docIndex: number) => {
      if (!verification) return;
      try {
        await removeDoc.mutateAsync({ verificationId: verification._id, docIndex });
        setNotice("Document removed.");
        toast.success("Document removed");
      } catch {
        toast.error("Failed to remove document");
      }
    },
    [removeDoc, verification],
  );

  const handleStartVerification = useCallback(async () => {
    if (verification) {
      if (canSubmit) {
        try {
          await submitVerification.mutateAsync(verification._id);
          setNotice("Documents submitted for verification.");
          toast.success("Documents submitted for verification");
        } catch {
          toast.error("Failed to submit. Please try again.");
        }
      } else {
        scrollToUpload();
      }
      return;
    }

    try {
      await createVerification.mutateAsync("recruiter_company");
      setNotice("Verification started. Upload your company documents below.");
      toast.success("Verification started");
    } catch {
      toast.error("Failed to start verification");
    }
  }, [canSubmit, createVerification, scrollToUpload, submitVerification, verification]);

  if (isLoading) return <LoadingSkeleton />;

  const companyProofStatus: StatusDisplay = frontDoc || backDoc
    ? { label: frontDoc && backDoc ? "Uploaded" : "In progress", tone: frontDoc && backDoc ? "success" : "warning" }
    : { label: "Pending", tone: "muted" };
  const reviewStatus = verification
    ? getStatusDisplay(verification.status)
    : { label: "Not started", tone: "muted" as const };
  const verifiedStatus: StatusDisplay =
    verification?.status === "approved" || verification?.status === "auto_approved"
      ? { label: "Verified", tone: "success" }
      : { label: "Not verified", tone: "muted" };

  return (
    <main className="onboarding-theme min-h-[calc(100svh-4rem)] overflow-hidden bg-background">
      <div className="relative mx-auto min-h-[calc(100svh-4rem)] w-full max-w-[850px] overflow-hidden px-5 pb-16 pt-5 sm:px-10 lg:px-14">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-primary/10 [clip-path:polygon(0_58%,18%_45%,42%_76%,65%_91%,82%_68%,100%_25%,100%_100%,0_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-primary/10 [clip-path:polygon(0_38%,17%_16%,37%_55%,58%_100%,100%_100%,0_100%)] opacity-70" />


        <section className="relative z-10 mt-8">


          <div className="relative mt-8 min-h-[290px] overflow-hidden sm:min-h-[330px]">
            <div className="relative z-10 max-w-[57%] sm:max-w-[52%]">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Recruiter verification</p>
              <h1 className="mt-3 text-[2.35rem] font-extrabold leading-[1.1] sm:text-5xl">
                Build trust with <span className="text-primary">verification.</span>
              </h1>
              <p className="mt-4 text-base font-medium leading-6 text-muted-foreground sm:text-lg">
                A verified company profile helps you connect with high-quality talent, build credibility, and unlock more opportunities.
              </p>
            </div>
            <div className="absolute -right-3 top-0 flex aspect-square w-[52%] max-w-[310px] items-center justify-center rounded-full bg-primary/10 sm:-right-8 sm:-top-8 sm:w-[56%]">
              <div className="absolute inset-[10%] rounded-full border border-primary/20" />
              <div className="absolute inset-[23%] rounded-full border border-dashed border-primary/30" />
              <div className="relative grid size-[42%] place-items-center rounded-[30%] bg-primary text-primary-foreground shadow-[0_18px_50px_-14px_rgba(88,50,220,0.65)]">
                <ShieldCheck className="size-1/2" strokeWidth={1.4} />
                <BadgeCheck className="absolute -right-3 -top-3 size-8 rounded-full bg-background p-1 text-success" fill="currentColor" strokeWidth={2} />
              </div>
            </div>
          </div>
        </section>

        <section className="relative z-10 space-y-4" aria-label="Verification status">
          <button
            type="button"
            onClick={() => (verification ? scrollToUpload() : void handleStartVerification())}
            className="flex min-h-24 w-full items-center justify-start gap-2 rounded-2xl border border-border bg-card/90 p-3 text-left shadow-sm transition hover:border-primary/40 hover:bg-card sm:p-4"
          >
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:size-16 sm:rounded-2xl">
              <Building2 className="size-6 sm:size-8" strokeWidth={2.2} />
            </span>
            <span className="min-w-0 flex-1 px-2 sm:px-3">
              <strong className="block text-base font-bold text-foreground sm:text-xl">Company proof</strong>
              <span className="mt-1 block text-[13px] font-medium leading-4 text-muted-foreground sm:text-base sm:leading-5">Upload both sides of your company registration document.</span>
            </span>
            <span className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-2 text-[11px] font-semibold sm:px-3 sm:text-sm ${toneClasses(companyProofStatus.tone)}`}>
              {companyProofStatus.tone === "success" ? <CircleCheck className="size-4" /> : <CircleAlert className="size-4" />}
              <span className="hidden sm:inline">{companyProofStatus.label}</span>
            </span>
            <ChevronRight className="ml-1 size-6 shrink-0 text-muted-foreground" strokeWidth={2.5} />
          </button>

          <button
            type="button"
            onClick={() => (verification ? scrollToUpload() : void handleStartVerification())}
            className="flex min-h-24 w-full items-center justify-start gap-2 rounded-2xl border border-border bg-card/90 p-3 text-left shadow-sm transition hover:border-primary/40 hover:bg-card sm:p-4"
          >
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 sm:size-16 sm:rounded-2xl">
              <Search className="size-6 sm:size-8" strokeWidth={2.2} />
            </span>
            <span className="min-w-0 flex-1 px-2 sm:px-3">
              <strong className="block text-base font-bold text-foreground sm:text-xl">Document review</strong>
              <span className="mt-1 block text-[13px] font-medium leading-4 text-muted-foreground sm:text-base sm:leading-5">Submit your documents and track the verification review.</span>
            </span>
            <span className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-2 text-[11px] font-semibold sm:px-3 sm:text-sm ${toneClasses(reviewStatus.tone)}`}>
              {reviewStatus.tone === "success" || reviewStatus.tone === "info" ? <CircleCheck className="size-4" /> : <CircleAlert className="size-4" />}
              <span className="hidden sm:inline">{reviewStatus.label}</span>
            </span>
            <ChevronRight className="ml-1 size-6 shrink-0 text-muted-foreground" strokeWidth={2.5} />
          </button>

          <div className="flex min-h-24 w-full items-center justify-start gap-2 rounded-2xl border border-border bg-card/90 p-3 text-left shadow-sm sm:p-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-success/10 text-success sm:size-16 sm:rounded-2xl">
              <BadgeCheck className="size-6 sm:size-8" strokeWidth={2.2} />
            </span>
            <span className="min-w-0 flex-1 px-2 sm:px-3">
              <strong className="block text-base font-bold text-foreground sm:text-xl">Verified profile</strong>
              <span className="mt-1 block text-[13px] font-medium leading-4 text-muted-foreground sm:text-base sm:leading-5">Get a verified badge on your recruiter profile.</span>
            </span>
            <span className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-2 text-[11px] font-semibold sm:px-3 sm:text-sm ${toneClasses(verifiedStatus.tone)}`}>
              {verifiedStatus.tone === "success" ? <CircleCheck className="size-4" /> : <CircleAlert className="size-4" />}
              <span className="hidden sm:inline">{verifiedStatus.label}</span>
            </span>
          </div>
        </section>

        <section className="relative z-10 mt-5 rounded-2xl bg-primary/10 p-5">
          <h2 className="text-lg font-bold">Why get verified?</h2>
          <div className="mt-5 grid grid-cols-4 divide-x divide-border">
            {benefits.map(({ label, icon: Icon }) => (
              <div key={label} className="flex min-w-0 flex-col items-center px-2 text-center">
                <Icon className="size-8 text-primary" fill="currentColor" strokeWidth={1.7} />
                <span className="mt-3 whitespace-pre-line text-xs font-medium leading-4 text-muted-foreground sm:text-sm">{label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="relative z-10 mt-5 space-y-4">
          <button
            type="button"
            onClick={handleStartVerification}
            disabled={createVerification.isPending || submitVerification.isPending}
            className="flex h-16 w-full items-center justify-center gap-2 rounded-xl bg-[linear-gradient(105deg,#9362eb,#6333d1)] px-5 text-xl font-semibold text-white shadow-[0_14px_30px_-18px_rgba(88,50,220,0.75)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 sm:text-2xl"
          >
            {createVerification.isPending || submitVerification.isPending ? <Loader2 className="size-6 animate-spin" /> : <ShieldCheck className="size-6" />}
            <span>{!verification ? "Start Verification" : canSubmit ? "Submit for Verification" : "Continue Verification"}</span>
            <ChevronRight className="ml-auto size-7" />
          </button>
          <Link
            href="/recruiter/profile"
            className="flex h-16 w-full items-center justify-center rounded-xl border border-primary/30 bg-background px-5 text-lg font-bold text-foreground transition hover:bg-primary/5 sm:text-xl"
          >
            Do this later
          </Link>
          <div className="flex items-start gap-4 px-4 pt-2 text-sm font-medium leading-5 text-muted-foreground">
            <LockKeyhole className="mt-0.5 size-5 shrink-0" />
            <p>Your information is secure and will only be used for verification purposes. We respect your privacy.</p>
          </div>
          <p className="min-h-6 text-center text-sm font-semibold text-primary" role="status" aria-live="polite">{notice}</p>
        </section>

        {verification && (
          <section ref={uploadSectionRef} className="relative z-10 mt-8 scroll-mt-6 rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Secure upload</p>
                <h2 className="mt-2 text-2xl font-extrabold">Company documents</h2>
                <p className="mt-2 max-w-xl text-sm leading-5 text-muted-foreground">Upload the front and back of your company proof. JPG, PNG, or PDF files up to 5MB are accepted.</p>
              </div>
              <span className={`rounded-full px-3 py-2 text-sm font-bold ${toneClasses(statusDisplay.tone)}`}>{statusDisplay.label}</span>
            </div>

            <div className="mt-6 rounded-2xl bg-muted/60 p-4">
              <div className="flex items-center justify-between gap-3 text-sm font-semibold">
                <span>Verification progress</span>
                <span><strong className="text-primary">{Math.min(uploadedCount, 2)}</strong> / 2 sides uploaded</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-primary/10">
                <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${Math.min(uploadedCount, 2) * 50}%` }} />
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                {uploadedCount === 0 ? "Upload both sides of your company proof to continue." : !backDoc || !frontDoc ? "Upload the remaining side to continue." : canSubmit ? "Both sides uploaded. Ready to submit." : "Your documents are being processed."}
              </p>
            </div>

            <div className="mt-6 flex flex-wrap items-end gap-4">
              <div className="min-w-[240px] flex-1">
                <label htmlFor="document-type" className="text-sm font-semibold text-muted-foreground">Document type</label>
                <div className="relative mt-2">
                  <ContactRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <select id="document-type" value={docType} onChange={(event) => setDocType(event.target.value)} className="w-full appearance-none rounded-xl border border-border bg-background py-3 pl-10 pr-10 text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
                    <option>Company Registration</option>
                    <option>GST Certificate</option>
                    <option>PAN Card (Company)</option>
                    <option>Incorporation Certificate</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>
              <p className="max-w-xs text-xs leading-4 text-muted-foreground">Your selected type is applied to newly uploaded company proof files.</p>
            </div>

            <input ref={frontInputRef} type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void handleFileSelect(file, "front"); event.target.value = ""; }} />
            <input ref={backInputRef} type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void handleFileSelect(file, "back"); event.target.value = ""; }} />
            <input ref={additionalInputRef} type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void handleFileSelect(file, additionalDocType); event.target.value = ""; }} />

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {[
                { side: "front", label: "Front side", doc: frontDoc, inputRef: frontInputRef },
                { side: "back", label: "Back side", doc: backDoc, inputRef: backInputRef },
              ].map(({ side, label, doc, inputRef }) => (
                <div key={side} className="rounded-2xl border border-border bg-background p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-bold">{label}</h3>
                    <span className={`rounded-full px-2 py-1 text-xs font-bold ${doc ? "bg-success/15 text-success" : "bg-warning/15 text-warning"}`}>{doc ? "Uploaded" : "Pending"}</span>
                  </div>
                  {doc ? (
                    <div className="mt-4 rounded-xl border border-border bg-muted/50 p-3">
                      <div className="flex items-center gap-3">
                        <div className="grid size-12 shrink-0 place-items-center rounded-lg bg-success/10 text-success"><FileCheck2 className="size-6" /></div>
                        <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{getFileName(doc.download_url || doc.url, `${side}_side`)}</p><p className="mt-1 text-xs text-muted-foreground">{docType}</p></div>
                        <CircleCheck className="size-5 shrink-0 text-success" />
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <button type="button" onClick={() => inputRef.current?.click()} disabled={isUploading} className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm font-semibold transition hover:bg-primary/5 disabled:opacity-50"><RefreshCw className="size-4 text-primary" /> Replace</button>
                        <button type="button" onClick={() => void handleRemove(side)} disabled={removeDoc.isPending} className="inline-flex items-center justify-center gap-2 rounded-lg border border-destructive/30 px-3 py-2.5 text-sm font-semibold text-destructive transition hover:bg-destructive/10 disabled:opacity-50"><Trash2 className="size-4" /> Remove</button>
                      </div>
                    </div>
                  ) : (
                    <button type="button" onClick={() => inputRef.current?.click()} disabled={isUploading} className="mt-4 flex min-h-36 w-full flex-col items-center justify-center rounded-xl border border-dashed border-primary/30 bg-primary/5 p-5 text-center transition hover:bg-primary/10 disabled:opacity-50">
                      {isUploading ? <Loader2 className="size-8 animate-spin text-primary" /> : <UploadCloud className="size-9 text-primary" strokeWidth={1.5} />}
                      <span className="mt-3 text-sm font-bold">Upload {label}</span>
                      <span className="mt-1 text-xs text-muted-foreground">Choose a JPG, PNG, or PDF file</span>
                    </button>
                  )}
                </div>
              ))}
            </div>

            {(!frontDoc || !backDoc) && uploadedCount > 0 && (
              <div className="mt-4 flex items-center gap-3 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm font-semibold text-warning">
                <CircleAlert className="size-5 shrink-0" /> Please upload both sides of your document to proceed.
              </div>
            )}

            <div className="mt-6 rounded-2xl border border-dashed border-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold">Additional document <span className="font-medium text-primary">(Optional)</span></h3>
                  <p className="mt-1 text-sm text-muted-foreground">Add a GST certificate, PAN card, incorporation certificate, or another company document.</p>
                </div>
                <button type="button" onClick={() => additionalInputRef.current?.click()} disabled={isUploading} className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-sm font-bold transition hover:bg-primary/5 disabled:opacity-50"><Plus className="size-4" /> Add document</button>
              </div>
              <select value={additionalDocType} onChange={(event) => setAdditionalDocType(event.target.value)} className="mt-4 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium outline-none focus:border-primary">
                {documentTypes.map((type) => <option key={type}>{type}</option>)}
              </select>
              {additionalDocs.length > 0 && (
                <div className="mt-4 space-y-2">
                  {additionalDocs.map((doc, index) => {
                    const docIndex = docs.indexOf(doc);
                    return <div key={`${doc.url}-${index}`} className="flex items-center gap-3 rounded-lg bg-muted/60 px-3 py-2 text-sm"><FileCheck2 className="size-4 text-success" /><span className="min-w-0 flex-1 truncate">{getFileName(doc.download_url || doc.url, "Additional document")}</span><button type="button" onClick={() => void handleRemoveAt(docIndex)} aria-label="Remove additional document" className="text-muted-foreground transition hover:text-destructive"><X className="size-4" /></button></div>;
                  })}
                </div>
              )}
            </div>

            <button type="button" onClick={() => void handleStartVerification()} disabled={!canSubmit || submitVerification.isPending} className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-base font-bold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary/15 disabled:text-muted-foreground">
              {submitVerification.isPending ? <Loader2 className="size-5 animate-spin" /> : <Check className="size-5" />} Submit for Verification
            </button>
            <p className="mt-3 text-center text-xs text-muted-foreground">{canSubmit ? "Ready to submit" : verification.status === "approved" || verification.status === "auto_approved" ? "Your company is already verified" : "Upload both document sides to enable submission"}</p>
          </section>
        )}

        <section className="relative z-10 mt-8 grid gap-5 rounded-2xl border border-border bg-card/70 p-5 sm:grid-cols-2 sm:p-6">
          <div id="guidelines">
            <h2 className="text-lg font-bold">Your verification journey</h2>
            <ol className="mt-5 space-y-4">
              {["Start verification", "Upload company proof", "Submit documents", "Under review", "Verified profile"].map((step, index) => (
                <li key={step} className="flex items-center gap-3 text-sm">
                  <span className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold ${index + 1 < currentStep ? "bg-success/15 text-success" : index + 1 === currentStep ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{index + 1 < currentStep ? <Check className="size-4" /> : index + 1}</span>
                  <span className={index + 1 <= currentStep ? "font-bold text-foreground" : "text-muted-foreground"}>{step}</span>
                </li>
              ))}
            </ol>
            <p className="mt-5 flex items-center gap-2 text-sm text-muted-foreground"><Clock className="size-4" /> Usually takes 24-48 hours after submission</p>
          </div>
          <div>
            <h2 className="text-lg font-bold">Tips for successful verification</h2>
            <ul className="mt-5 space-y-3">
              {tips.map((tip) => <li key={tip} className="flex gap-3 text-sm text-muted-foreground"><CheckCircle2 className="size-4 shrink-0 text-success" />{tip}</li>)}
            </ul>
            <Link href="#guidelines" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">View full guidelines <ChevronRight className="size-4" /></Link>
          </div>
        </section>

        <div className="pointer-events-none relative z-10 mt-8 ml-auto w-fit -rotate-6 text-xl font-bold leading-5 text-foreground opacity-70">
          A Safer<br />Brighter<br />Creative<br />Community
          <span className="mt-1 block h-1 w-16 bg-primary" />
        </div>
      </div>
    </main>
  );
}
