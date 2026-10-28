"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, ArrowLeft, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { serviceInquiriesApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { useAuthStore } from "@/providers/auth-store-provider";
import { InquiryStatus } from "@/components/service-inquiries/inquiry-status";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function inboxPath(
  viewerRole: "requester" | "provider",
  user?: { role?: string; account_capabilities?: string[] } | null,
) {
  if (
    viewerRole === "provider" ||
    user?.account_capabilities?.includes("provider") ||
    user?.role === "provider"
  ) {
    return "/provider/messages";
  }
  if (user?.role === "recruiter") return "/recruiter/messages";
  return "/talent/messages";
}

export default function ServiceInquiryDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const user = useAuthStore((state) => state.user);
  const client = useQueryClient();
  const queryKey = queryKeys.serviceInquiries.detail(id);
  const query = useQuery({
    queryKey,
    queryFn: () => serviceInquiriesApi.getOne(id),
    enabled: Boolean(id),
    retry: false,
  });
  const update = useMutation({
    mutationFn: (status: "responded" | "closed") =>
      serviceInquiriesApi.update(id, { status }),
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey }),
        client.invalidateQueries({ queryKey: ["service-inquiries"] }),
      ]);
      toast.success("Inquiry updated");
    },
  });

  if (query.isLoading)
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-56" />
      </div>
    );
  if (query.isError || !query.data) {
    const status = (query.error as { response?: { status?: number } } | null)
      ?.response?.status;
    return (
      <Card className="mx-auto max-w-lg border-dashed">
        <CardContent className="flex flex-col items-center p-10 text-center">
          <AlertCircle className="size-8 text-muted-foreground" />
          <h1 className="mt-3 text-xl font-semibold">
            {status === 404 ? "Inquiry not found" : "Could not load inquiry"}
          </h1>
          <p role="alert" className="mt-2 text-sm text-destructive">
            {getApiErrorMessage(
              query.error,
              "Check your access and try again.",
            )}
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => void query.refetch()}
          >
            Try again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { inquiry, viewer_role: viewerRole } = query.data;
  const canRespond = viewerRole === "provider" && inquiry.status === "new";
  const canClose = inquiry.status !== "closed";
  const inbox = inboxPath(viewerRole, user);
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Button variant="ghost" size="sm" className="-ml-2" asChild>
        <Link
          href={
            viewerRole === "provider" ? "/provider/inquiries" : "/inquiries"
          }
        >
          <ArrowLeft className="mr-2 size-4" />
          Back to inquiries
        </Link>
      </Button>
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle>Service inquiry</CardTitle>
            <InquiryStatus status={inquiry.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="whitespace-pre-wrap text-sm leading-relaxed">
            {inquiry.description}
          </p>
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Requested date</dt>
              <dd>
                {inquiry.requested_date
                  ? new Date(inquiry.requested_date).toLocaleDateString()
                  : "Not specified"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Location</dt>
              <dd>{inquiry.location || "Not specified"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Indicative budget</dt>
              <dd>
                {inquiry.budget
                  ? `${inquiry.budget.currency} ${inquiry.budget.amount.toLocaleString()}`
                  : "Not specified"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Received</dt>
              <dd>{new Date(inquiry.created_at).toLocaleString()}</dd>
            </div>
          </dl>
          <div className="flex flex-wrap gap-2 border-t pt-4">
            <Button asChild>
              <Link href={`${inbox}/${inquiry.conversation_id}`}>
                <MessageSquare className="mr-2 size-4" />
                Open conversation
              </Link>
            </Button>
            {canRespond && (
              <Button
                variant="secondary"
                disabled={update.isPending}
                onClick={() => update.mutate("responded")}
              >
                Mark responded
              </Button>
            )}
            {canClose && (
              <Button
                variant="outline"
                disabled={update.isPending}
                onClick={() => update.mutate("closed")}
              >
                Close inquiry
              </Button>
            )}
          </div>
          {update.isError && (
            <p role="alert" className="text-sm text-destructive">
              {getApiErrorMessage(update.error, "Could not update inquiry.")}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            ConnectMe does not manage appointments, agreements, or payments.
            Continue any discussion directly with the provider.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
