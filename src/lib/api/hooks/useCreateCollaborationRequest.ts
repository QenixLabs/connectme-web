"use client";

import { useMutation } from "@tanstack/react-query";
import { collaborationRequestsApi } from "@/lib/api/messages";

export function useCreateCollaborationRequest() {
  return useMutation({
    mutationFn: (receiverId: string) =>
      collaborationRequestsApi.createRequest(receiverId),
  });
}
