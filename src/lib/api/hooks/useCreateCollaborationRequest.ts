"use client";

import { useMutation } from "@tanstack/react-query";
import { collaborationRequestsApi } from "@/lib/api/messages";

export function useCreateCollaborationRequest() {
  return useMutation({
    mutationFn: ({ receiverId, message }: { receiverId: string; message?: string }) =>
      collaborationRequestsApi.createRequest(receiverId, message),
  });
}
