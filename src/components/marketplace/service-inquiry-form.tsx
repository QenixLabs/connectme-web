"use client";

import { useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { serviceInquiriesApi } from "@/lib/api";
import type { CreateServiceInquiryPayload } from "@/lib/api/inquiries";
import { getApiErrorMessage } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { useAuthStore } from "@/providers/auth-store-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ServiceInquiryFormProps {
  providerSlug: string;
  providerName: string;
  serviceId?: string;
}

export function ServiceInquiryForm({
  providerSlug,
  providerName,
  serviceId,
}: ServiceInquiryFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const keyRef = useRef<{ signature: string; key: string } | null>(null);
  const [description, setDescription] = useState("");
  const [requestedDate, setRequestedDate] = useState("");
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState("");
  const [error, setError] = useState("");

  const signature = useMemo(
    () =>
      JSON.stringify([
        description.trim(),
        requestedDate,
        location.trim(),
        budget,
      ]),
    [description, requestedDate, location, budget],
  );
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

    const amount = budget.trim() ? Number(budget) : undefined;
    if (amount !== undefined && (!Number.isFinite(amount) || amount < 0)) {
      setError("Enter a valid budget amount.");
      return;
    }

    if (!keyRef.current || keyRef.current.signature !== signature) {
      keyRef.current = { signature, key: crypto.randomUUID() };
    }
    mutation.mutate({
      provider_slug: providerSlug,
      ...(serviceId ? { service_id: serviceId } : {}),
      description: description.trim(),
      ...(requestedDate
        ? {
            requested_date: new Date(`${requestedDate}T00:00:00`).toISOString(),
          }
        : {}),
      ...(location.trim() ? { location: location.trim() } : {}),
      ...(amount === undefined ? {} : { budget: { amount, currency: "INR" } }),
      idempotency_key: keyRef.current.key,
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send a service inquiry</CardTitle>
        <CardDescription>
          Describe what you need. {providerName} can respond in your
          conversation. Scope, pricing, and arrangements are agreed directly
          with the provider.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={submit}>
          <div className="space-y-2">
            <label
              htmlFor="inquiry-description"
              className="text-sm font-medium"
            >
              What service do you need?
            </label>
            <Textarea
              id="inquiry-description"
              required
              minLength={1}
              maxLength={2000}
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Share your goals, requirements, and any useful context."
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="inquiry-date" className="text-sm font-medium">
                Preferred date (optional)
              </label>
              <Input
                id="inquiry-date"
                type="date"
                value={requestedDate}
                onChange={(event) => setRequestedDate(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="inquiry-location" className="text-sm font-medium">
                Location (optional)
              </label>
              <Input
                id="inquiry-location"
                maxLength={160}
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="City or service area"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="inquiry-budget" className="text-sm font-medium">
              Indicative budget in INR (optional)
            </label>
            <Input
              id="inquiry-budget"
              type="number"
              min="0"
              max="1000000000"
              step="0.01"
              value={budget}
              onChange={(event) => setBudget(event.target.value)}
              placeholder="Your approximate budget"
            />
            <p className="text-xs text-muted-foreground">
              This is shared as information only; ConnectMe does not collect
              payments.
            </p>
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <Button
            type="submit"
            disabled={mutation.isPending || !description.trim()}
          >
            {mutation.isPending ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Send className="mr-2 size-4" />
            )}
            Send inquiry
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
