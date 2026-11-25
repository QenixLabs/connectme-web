"use client";

import { useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Send, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { serviceInquiriesApi } from "@/lib/api";
import type { CreateServiceInquiryPayload } from "@/lib/api/inquiries";
import type { PublicServiceSummary } from "@/lib/api/marketplace";
import { getApiErrorMessage } from "@/lib/api/client";
import { useAuthStore } from "@/providers/auth-store-provider";
import { getVerificationPath } from "@/lib/verification-path";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface ServiceInquiryFormProps {
  providerSlug: string;
  providerName: string;
  services?: PublicServiceSummary[];
  serviceId?: string;
  packageTitle?: string;
  inSheet?: boolean;
}

const GENERAL_INQUIRY = "__general_inquiry__";

const BUDGET_RANGES = [
  { value: "up_to_25000", label: "Up to â‚¹25k", amount: 25_000 },
  { value: "25000_50000", label: "â‚¹25kâ€“â‚¹50k", amount: 25_000 },
  { value: "50000_100000", label: "â‚¹50kâ€“â‚¹1L", amount: 50_000 },
  { value: "above_100000", label: "Above â‚¹1L", amount: 100_000 },
] as const;

export function ServiceInquiryForm({
  providerSlug,
  providerName,
  services = [],
  serviceId,
  packageTitle,
  inSheet = false,
}: ServiceInquiryFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const verificationPath = user ? getVerificationPath(user) : "/auth/login";
  const queryClient = useQueryClient();
  const keyRef = useRef<{ signature: string; key: string } | null>(null);
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState(
    serviceId ?? GENERAL_INQUIRY,
  );
  const [requestedDate, setRequestedDate] = useState("");
  const [location, setLocation] = useState("");
  const [budgetRange, setBudgetRange] = useState("");
  const [error, setError] = useState("");

  const signature = useMemo(
    () =>
      JSON.stringify([
        projectName.trim(),
        description.trim(),
        selectedServiceId,
        requestedDate,
        location.trim(),
        budgetRange,
        packageTitle,
      ]),
    [
      projectName,
      description,
      selectedServiceId,
      requestedDate,
      location,
      budgetRange,
      packageTitle,
    ],
  );
  const selectedService = services.find(
    (service) => service.id === selectedServiceId,
  );
  const selectedBudget = BUDGET_RANGES.find(
    (option) => option.value === budgetRange,
  );
  const hasPrefillService =
    serviceId && !services.some((service) => service.id === serviceId);

  const mutation = useMutation({
    mutationFn: (payload: CreateServiceInquiryPayload) =>
      serviceInquiriesApi.create(payload),
    onSuccess: async ({ inquiry }) => {
      await queryClient.invalidateQueries({
        queryKey: ["service-inquiries", "mine"],
      });
      toast.success("Inquiry sent");
      router.push(`/inquiries/${inquiry.id}`);
    },
    onError: (reason) =>
      setError(getApiErrorMessage(reason, "Could not send your inquiry.")),
  });

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!user) {
      router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    const trimmedProjectName = projectName.trim();
    const trimmedDescription = description.trim();
    if (!trimmedProjectName) {
      setError("Enter a project name.");
      return;
    }
    if (!trimmedDescription) {
      setError("Add a brief description of your project.");
      return;
    }

    const payloadDescription = [
      packageTitle ? `Selected package: ${packageTitle}` : null,
      selectedService ? `Selected service: ${selectedService.title}` : null,
      `Project name: ${trimmedProjectName}`,
      selectedBudget ? `Budget range: ${selectedBudget.label}` : null,
      trimmedDescription,
    ]
      .filter(Boolean)
      .join("\n\n");
    if (payloadDescription.length > 2000) {
      setError("Shorten the project details to fit the 2,000 character limit.");
      return;
    }

    if (!keyRef.current || keyRef.current.signature !== signature) {
      keyRef.current = { signature, key: crypto.randomUUID() };
    }

    mutation.mutate({
      provider_slug: providerSlug,
      ...(selectedServiceId !== GENERAL_INQUIRY
        ? { service_id: selectedServiceId }
        : {}),
      description: payloadDescription,
      ...(requestedDate
        ? {
            requested_date: new Date(`${requestedDate}T00:00:00`).toISOString(),
          }
        : {}),
      ...(location.trim() ? { location: location.trim() } : {}),
      ...(selectedBudget
        ? { budget: { amount: selectedBudget.amount, currency: "INR" } }
        : {}),
      idempotency_key: keyRef.current.key,
    });
  }

  return (
    <>
      <SheetHeader className="shrink-0 border-b border-provider-border px-5 pb-4 pr-14 pt-6 text-left sm:px-8 sm:pt-8 sm:pr-14">
        {inSheet ? (
          <SheetTitle className="text-xl font-bold text-provider-foreground sm:text-2xl">
            Request Quote
          </SheetTitle>
        ) : (
          <h2 className="text-xl font-bold text-provider-foreground sm:text-2xl">
            Request Quote
          </h2>
        )}
        {inSheet ? (
          <SheetDescription className="max-w-xl text-provider-muted">
            Share a few project details with {providerName}. Scope, pricing, and
            arrangements are agreed directly with the provider.
          </SheetDescription>
        ) : (
          <p className="max-w-xl text-provider-muted">
            Share a few project details with {providerName}. Scope, pricing, and
            arrangements are agreed directly with the provider.
          </p>
        )}
      </SheetHeader>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {user && user.verification_tier < 3 ? (
          <div className="m-5 space-y-4 rounded-xl border border-provider-primary/20 bg-provider-tint p-4 sm:m-8">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-provider-primary" />
              <div>
                <p className="font-semibold text-provider-foreground">
                  Verify your account to contact providers
                </p>
                <p className="mt-1 text-sm text-provider-muted">
                  Complete email verification (Tier 1), phone verification
                  (Tier 2), and document review (Tier 3) before sending a
                  service inquiry.
                </p>
              </div>
            </div>
            <Button asChild className="min-h-11">
              <Link href={verificationPath}>Continue verification</Link>
            </Button>
          </div>
        ) : (
          <form
            className="flex min-h-full flex-col"
            onSubmit={submit}
            noValidate
          >
            <div className="flex-1 space-y-5 px-5 py-5 sm:px-8 sm:py-7">
              {packageTitle && (
                <p className="rounded-xl border border-provider-primary/20 bg-provider-tint px-4 py-3 text-sm font-semibold text-provider-primary">
                  Selected package: {packageTitle}
                </p>
              )}

              <div className="space-y-2">
                <label
                  htmlFor="quote-service"
                  className="text-sm font-semibold text-provider-foreground"
                >
                  Service
                </label>
                <Select
                  value={selectedServiceId}
                  onValueChange={(value) => setSelectedServiceId(value)}
                >
                  <SelectTrigger
                    id="quote-service"
                    className="h-12 w-full rounded-xl border-provider-border"
                  >
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={GENERAL_INQUIRY}>
                      General inquiry
                    </SelectItem>
                    {hasPrefillService && serviceId && (
                      <SelectItem value={serviceId}>
                        {packageTitle
                          ? `Service for ${packageTitle}`
                          : "Selected service"}
                      </SelectItem>
                    )}
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="quote-project-name"
                  className="text-sm font-semibold text-provider-foreground"
                >
                  Project name <span aria-hidden="true">*</span>
                </label>
                <Input
                  id="quote-project-name"
                  required
                  maxLength={120}
                  value={projectName}
                  onChange={(event) => setProjectName(event.target.value)}
                  placeholder="e.g. Summer product launch"
                  className="h-12 rounded-xl border-provider-border"
                  aria-invalid={Boolean(error && !projectName.trim())}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="quote-description"
                  className="text-sm font-semibold text-provider-foreground"
                >
                  Brief description <span aria-hidden="true">*</span>
                </label>
                <Textarea
                  id="quote-description"
                  required
                  maxLength={2000}
                  rows={5}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Describe your goals, requirements, and any useful context."
                  className="min-h-32 resize-y rounded-xl border-provider-border"
                  aria-invalid={Boolean(error && !description.trim())}
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <label
                    htmlFor="quote-date"
                    className="text-sm font-semibold text-provider-foreground"
                  >
                    Expected date <span className="font-normal text-provider-muted">(optional)</span>
                  </label>
                  <Input
                    id="quote-date"
                    type="date"
                    value={requestedDate}
                    onChange={(event) => setRequestedDate(event.target.value)}
                    className="h-12 rounded-xl border-provider-border"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="quote-location"
                    className="text-sm font-semibold text-provider-foreground"
                  >
                    Project location{" "}
                    <span className="font-normal text-provider-muted">(optional)</span>
                  </label>
                  <Input
                    id="quote-location"
                    maxLength={160}
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    placeholder="City or service area"
                    className="h-12 rounded-xl border-provider-border"
                  />
                </div>
              </div>

              <fieldset className="space-y-2">
                <legend className="text-sm font-semibold text-provider-foreground">
                  Budget range{" "}
                  <span className="font-normal text-provider-muted">(optional)</span>
                </legend>
                <ToggleGroup
                  type="single"
                  value={budgetRange}
                  onValueChange={setBudgetRange}
                  aria-label="Select a budget range"
                  className="grid w-full grid-cols-2 gap-2"
                >
                  {BUDGET_RANGES.map((option) => (
                    <ToggleGroupItem
                      key={option.value}
                      value={option.value}
                      variant="outline"
                      className="min-h-11 w-full whitespace-normal rounded-xl border-provider-border px-2 text-xs font-medium text-provider-foreground data-[state=on]:border-provider-primary data-[state=on]:bg-provider-tint data-[state=on]:text-provider-primary sm:text-sm"
                    >
                      {option.label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </fieldset>
            </div>

            <div className="sticky bottom-0 border-t border-provider-border bg-provider-surface/95 px-5 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl sm:px-8 sm:pb-5">
              {error && (
                <p role="alert" className="mb-3 text-sm text-destructive">
                  {error}
                </p>
              )}
              <Button
                type="submit"
                disabled={
                  mutation.isPending ||
                  !projectName.trim() ||
                  !description.trim()
                }
                className="h-12 w-full rounded-full bg-gradient-to-r from-provider-primary-strong to-provider-primary font-semibold shadow-provider-action"
              >
                {mutation.isPending ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Send className="mr-2 size-4" />
                )}
                Send Request
              </Button>
              <p className="mt-2 text-center text-xs text-provider-muted">
                Your budget is informational only. Morporfile does not collect
                payments.
              </p>
            </div>
          </form>
        )}
      </div>
    </>
  );
}
