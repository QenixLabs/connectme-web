"use client";

import { useMutation } from "@tanstack/react-query";
import { collaborationRequestsApi } from "@/lib/api/messages";
import type { CollaborationReason } from "@/components/requests/request-card";

export function useCreateCollaborationRequest() {
  return useMutation({
    mutationFn: ({ receiverId, reason, message }: { receiverId: string; reason: CollaborationReason; message?: string }) =>
      collaborationRequestsApi.createRequest(receiverId, reason, message),
  });
}
