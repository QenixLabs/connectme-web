"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BadgeCheck, CheckCircle2, FileCheck2, Info, Loader2, ShieldCheck, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/providers/auth-store-provider";
import {
  useCreateVerification,
  useRemoveVerificationDoc,
  useSubmitVerification,
  useUploadVerificationDoc,
  useVerification,
} from "@/hooks/use-verification";
import { getApiErrorMessage } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { VerifyPhoneDialog } from "@/components/talent-app/settings/verify-phone-dialog";
import { VerificationTypeDropdown } from "@/components/shared/verification-type-dropdown";

export default function ProviderVerifyDocumentsPage() {
  const user = useAuthStore((state) => state.user);
  const fetchUser = useAuthStore((state) => state.fetchUser);
  const { data: verification, isLoading } = useVerification(user?._id);
  const createVerification = useCreateVerification();
  const uploadDoc = useUploadVerificationDoc();
  const removeDoc = useRemoveVerificationDoc();
  const submitVerification = useSubmitVerification();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [phoneDialogOpen, setPhoneDialogOpen] = useState(false);
  const [documentType, setDocumentType] = useState("Government ID");

  const emailVerified = Boolean(user?.is_email_verified);
  const phoneVerified = Boolean(user?.is_phone_verified);
  const tierTwo = emailVerified && phoneVerified && (user?.verification_tier ?? 1) >= 2;
  const docs = verification?.submitted_docs ?? [];
  const canEditDocuments = verification?.status === "pending" && tierTwo;
  const isApproved =
    verification?.status === "approved" || verification?.status === "auto_approved";

  useEffect(() => {
    if (isApproved && (user?.verification_tier ?? 1) < 3) {
      void fetchUser().catch((error: unknown) => {
        toast.error(getApiErrorMessage(error, "Could not refresh verification status."));
      });
    }
  }, [fetchUser, isApproved, user?.verification_tier]);

  async function startVerification() {
    try {
      await createVerification.mutateAsync("provider_identity");
      toast.success("Document verification started");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not start document verification."));
    }
  }

  async function uploadDocument(file: File) {
    if (!verification || !canEditDocuments) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be under 5MB.");
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(file.type)) {
      toast.error("Upload a JPG, PNG, WEBP, or PDF document.");
      return;
    }
    try {
      await uploadDoc.mutateAsync({
        verificationId: verification._id,
        file,
        docType: "identity",
      });
      toast.success("Identity document uploaded");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not upload the document."));
    }
  }

  async function removeDocument(index: number) {
    if (!verification) return;
    try {
      await removeDoc.mutateAsync({ verificationId: verification._id, docIndex: index });
      toast.success("Document removed");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not remove the document."));
    }
  }

  async function submitDocuments() {
    if (!verification) return;
    try {
      await submitVerification.mutateAsync(verification._id);
      toast.success("Documents submitted for review");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not submit documents."));
    }
  }

  return (
    <div className="relative mx-auto max-w-4xl space-y-6 overflow-hidden pb-8">
      <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative overflow-hidden rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/10 via-card to-card p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-primary"><ShieldCheck className="size-4" /> Account trust</div>
            <h1 className="mt-2 text-3xl font-black tracking-tight">Verification center</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Complete your identity checks to unlock trusted provider access and make your profile stand out.</p>
          </div>
          <div className="grid size-20 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20"><ShieldCheck className="size-10" strokeWidth={1.5} /></div>
        </div>
        <div className="mt-6 flex items-center gap-3 text-xs font-bold text-muted-foreground"><div className="h-2 flex-1 overflow-hidden rounded-full bg-primary/15"><div className={`h-full rounded-full bg-primary transition-all ${isApproved ? "w-full" : tierTwo ? "w-2/3" : "w-1/3"}`} /></div><span>{isApproved ? "Complete" : tierTwo ? "2 of 3" : "1 of 3"}</span></div>
      </div>

      <Card className="rounded-2xl border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-primary" />
            Verification levels
          </CardTitle>
          <CardDescription>
            Document verification is reviewed by our team before Tier 3 is granted.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <VerificationLevel
            title="Tier 1 · Email"
            description={user?.email ?? "Verify your account email"}
            complete={emailVerified}
          />
          <div className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between">
            <VerificationLevel
              title="Tier 2 · Phone"
              description={phoneVerified ? "Phone number verified" : "Verify your account phone"}
              complete={phoneVerified && (user?.verification_tier ?? 1) >= 2}
            />
            {!phoneVerified && user?.phone && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setPhoneDialogOpen(true)}
              >
                Verify phone
              </Button>
            )}
          </div>
          <VerificationLevel
            title="Tier 3 · Identity document"
            description={
              isApproved
                ? "Document approved"
                : verification?.status === "manual_review"
                  ? "Documents under review"
                  : "Upload a government-issued identity document"
            }
            complete={isApproved}
          />
        </CardContent>
      </Card>

      {!tierTwo && (
        <Alert>
          <ShieldCheck className="size-4" />
          <AlertTitle>Complete Tiers 1 and 2 first</AlertTitle>
          <AlertDescription>
            Verify your email and phone before submitting an identity document. Once
            both are verified, you can continue here.
            {!emailVerified && (
              <span className="mt-1 block">Your account email is not verified yet.</span>
            )}
            {!phoneVerified && !user?.phone && (
              <span className="mt-1 block">
                Add a phone number to your profile before verifying it.
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      <Card className="rounded-2xl border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>Identity document</CardTitle>
          <CardDescription>
            Upload a clear photo or scan of a government-issued ID. Files must be under
            5MB and are only visible to the verification team.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl bg-muted/45 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold"><Info className="size-4 text-primary" /> Document type</div>
            <VerificationTypeDropdown value={documentType} onChange={setDocumentType} options={["Government ID", "Passport", "Aadhaar Card", "Driving Licence"]} />
          </div>
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Loading verification status…
            </div>
          ) : !verification || verification.status === "rejected" ? (
            <div className="space-y-3">
              {verification?.status === "rejected" && (
                <Alert variant="destructive">
                  <AlertTitle>Verification needs attention</AlertTitle>
                  <AlertDescription>
                    {verification.review_notes || "Your previous submission was not approved. Upload a new document to try again."}
                  </AlertDescription>
                </Alert>
              )}
              <Button
                type="button"
                onClick={startVerification}
                disabled={!tierTwo || createVerification.isPending}
              >
                {createVerification.isPending ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 size-4" />
                )}
                {verification ? "Start a new review" : "Start document verification"}
              </Button>
            </div>
          ) : verification.status === "manual_review" ? (
            <Alert>
              <Loader2 className="size-4" />
              <AlertTitle>Documents under review</AlertTitle>
              <AlertDescription>
                We’ll update your account when the review is complete. Tier 3 contact
                features unlock after approval.
              </AlertDescription>
            </Alert>
          ) : isApproved ? (
            <Alert>
              <BadgeCheck className="size-4" />
              <AlertTitle>Tier 3 verification complete</AlertTitle>
              <AlertDescription>
                Your identity document has been approved. You can now contact service
                providers.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {docs.map((doc, index) => (
                <div
                  key={`${doc.type}-${index}`}
                  className="flex items-center justify-between gap-3 rounded-lg border p-3"
                >
                  <span className="flex min-w-0 items-center gap-2 text-sm">
                    <FileCheck2 className="size-4 shrink-0 text-primary" />
                    <span className="truncate">
                      {doc.download_url ? (
                        <a
                          href={doc.download_url}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium underline"
                        >
                          Identity document
                        </a>
                      ) : (
                        "Identity document"
                      )}
                    </span>
                  </span>
                  {canEditDocuments && (
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      aria-label="Remove identity document"
                      disabled={removeDoc.isPending}
                      onClick={() => void removeDocument(index)}
                    >
                      <X className="size-4" />
                    </Button>
                  )}
                </div>
              ))}

              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.pdf"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void uploadDocument(file);
                  event.target.value = "";
                }}
              />
              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  variant="outline"
                  disabled={!canEditDocuments || uploadDoc.isPending}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploadDoc.isPending ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 size-4" />
                  )}
                  {docs.length ? "Replace / add document" : "Upload identity document"}
                </Button>
                <Button
                  type="button"
                  disabled={!canEditDocuments || docs.length === 0 || submitVerification.isPending}
                  onClick={() => void submitDocuments()}
                >
                  {submitVerification.isPending && (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  )}
                  Submit for review
                </Button>
              </div>
              {verification.status === "pending" && docs.length > 0 && (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="size-4 text-emerald-600" />
                  Your document is uploaded. Submit it when you’re ready.
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        Need to update your provider details?{" "}
        <Link href="/provider/profile" className="font-medium text-primary underline">
          Go to your profile
        </Link>
      </p>

      {user?.phone && (
        <VerifyPhoneDialog
          open={phoneDialogOpen}
          onOpenChange={(open) => {
            setPhoneDialogOpen(open);
            if (!open) void fetchUser();
          }}
          phone={user.phone}
        />
      )}
    </div>
  );
}

function VerificationLevel({
  title,
  description,
  complete,
}: {
  title: string;
  description: string;
  complete: boolean;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-xl border p-4">
      {complete ? (
        <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />
      ) : (
        <ShieldCheck className="size-5 shrink-0 text-muted-foreground" />
      )}
      <div className="min-w-0">
        <p className="font-semibold">{title}</p>
        <p className="truncate text-sm text-muted-foreground">{description}</p>
      </div>
      <span className="ml-auto text-xs font-semibold text-muted-foreground">
        {complete ? "Complete" : "Needed"}
      </span>
    </div>
  );
}
