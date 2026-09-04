"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { talentApi } from "@/lib/api/talent";
import { conversationsApi } from "@/lib/api/conversations";
import { requestsApi } from "@/lib/api/requests";
import { queryKeys } from "@/lib/api/query-keys";
import { useAuthStore } from "@/providers/auth-store-provider";

const savedTalentKeys = {
  all: ["saved-talent"] as const,
  status: (username: string) =>
    [...savedTalentKeys.all, "status", username] as const,
};

const shortlistKeys = {
  all: ["talent-shortlist"] as const,
  status: (username: string, campaignId: string) =>
    [...shortlistKeys.all, "status", username, campaignId] as const,
};

function useRequireAuth() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return () => {
    if (!isAuthenticated) {
      const currentPath =
        typeof window !== "undefined" ? window.location.pathname : "";
      const redirectUrl = currentPath
        ? `/auth/login?redirect=${encodeURIComponent(currentPath)}`
        : "/auth/login";
      router.push(redirectUrl);
      return false;
    }
    return true;
  };
}

export function useSaveTalent(username: string) {
  const queryClient = useQueryClient();
  const requireAuth = useRequireAuth();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const statusQuery = useQuery({
    queryKey: savedTalentKeys.status(username),
    queryFn: () => talentApi.getSaveStatus(username),
    enabled: !!username && isAuthenticated,
  });

  const saveMutation = useMutation({
    mutationFn: () => talentApi.saveTalent(username),
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: savedTalentKeys.status(username),
      });
      const prev = queryClient.getQueryData<{ is_saved: boolean }>(
        savedTalentKeys.status(username),
      );
      queryClient.setQueryData(savedTalentKeys.status(username), {
        is_saved: true,
      });
      return { prev };
    },
    onError: (err, _vars, context) => {
      if (context?.prev) {
        queryClient.setQueryData(
          savedTalentKeys.status(username),
          context.prev,
        );
      }
      const message =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Failed to save talent";
      toast.error(message);
    },
    onSuccess: () => {
      toast.success("Saved to profile");
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: savedTalentKeys.status(username),
      });
    },
  });

  const unsaveMutation = useMutation({
    mutationFn: () => talentApi.unsaveTalent(username),
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: savedTalentKeys.status(username),
      });
      const prev = queryClient.getQueryData<{ is_saved: boolean }>(
        savedTalentKeys.status(username),
      );
      queryClient.setQueryData(savedTalentKeys.status(username), {
        is_saved: false,
      });
      return { prev };
    },
    onError: (err, _vars, context) => {
      if (context?.prev) {
        queryClient.setQueryData(
          savedTalentKeys.status(username),
          context.prev,
        );
      }
      const message =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Failed to remove saved talent";
      toast.error(message);
    },
    onSuccess: () => {
      toast.success("Removed from saved");
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: savedTalentKeys.status(username),
      });
    },
  });

  const isSaved = statusQuery.data?.is_saved ?? false;
  const isPending = saveMutation.isPending || unsaveMutation.isPending;

  const toggleSave = () => {
    if (!requireAuth()) return;
    if (isSaved) {
      unsaveMutation.mutate();
    } else {
      saveMutation.mutate();
    }
  };

  return { isSaved, isPending, toggleSave };
}

export function useShortlistTalent(username: string, campaignId: string) {
  const queryClient = useQueryClient();
  const requireAuth = useRequireAuth();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const statusQuery = useQuery({
    queryKey: shortlistKeys.status(username, campaignId),
    queryFn: () => talentApi.getShortlistStatus(username, campaignId),
    enabled: !!username && !!campaignId && isAuthenticated,
  });

  const shortlistMutation = useMutation({
    mutationFn: () => talentApi.shortlistTalent(username, campaignId),
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: shortlistKeys.status(username, campaignId),
      });
      const prev = queryClient.getQueryData<{ is_shortlisted: boolean }>(
        shortlistKeys.status(username, campaignId),
      );
      queryClient.setQueryData(shortlistKeys.status(username, campaignId), {
        is_shortlisted: true,
      });
      return { prev };
    },
    onError: (err, _vars, context) => {
      if (context?.prev) {
        queryClient.setQueryData(
          shortlistKeys.status(username, campaignId),
          context.prev,
        );
      }
      const message =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Failed to shortlist talent";
      toast.error(message);
    },
    onSuccess: () => {
      toast.success("Shortlisted");
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: shortlistKeys.status(username, campaignId),
      });
    },
  });

  const unshortlistMutation = useMutation({
    mutationFn: () => talentApi.unshortlistTalent(username, campaignId),
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: shortlistKeys.status(username, campaignId),
      });
      const prev = queryClient.getQueryData<{ is_shortlisted: boolean }>(
        shortlistKeys.status(username, campaignId),
      );
      queryClient.setQueryData(shortlistKeys.status(username, campaignId), {
        is_shortlisted: false,
      });
      return { prev };
    },
    onError: (err, _vars, context) => {
      if (context?.prev) {
        queryClient.setQueryData(
          shortlistKeys.status(username, campaignId),
          context.prev,
        );
      }
      const message =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Failed to remove from shortlist";
      toast.error(message);
    },
    onSuccess: () => {
      toast.success("Removed from shortlist");
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: shortlistKeys.status(username, campaignId),
      });
    },
  });

  const isShortlisted = statusQuery.data?.is_shortlisted ?? false;
  const isPending = shortlistMutation.isPending || unshortlistMutation.isPending;

  const toggleShortlist = () => {
    if (!requireAuth()) return;
    if (isShortlisted) {
      unshortlistMutation.mutate();
    } else {
      shortlistMutation.mutate();
    }
  };

  return { isShortlisted, isPending, toggleShortlist };
}

export function useConnectionRequest(targetUserId: string) {
  const queryClient = useQueryClient();
  const requireAuth = useRequireAuth();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const statusQuery = useQuery({
    queryKey: [
      ...queryKeys.collaborationRequests.all(),
      "status",
      targetUserId,
    ] as const,
    queryFn: () => requestsApi.getMyRequests(),
    enabled: !!targetUserId && isAuthenticated,
    select: (data) => {
      const sent = data.sent.find((r) => r.receiver_id?._id === targetUserId);
      if (sent?.status === "pending") return "pending" as const;
      if (sent?.status === "accepted" || sent?.status === "messaging_only")
        return "connected" as const;
      return "none" as const;
    },
  });

  const mutation = useMutation({
    mutationFn: () => requestsApi.createRequest({ receiver_id: targetUserId }),
    onSuccess: () => {
      toast.success("Connection request sent");
      queryClient.invalidateQueries({
        queryKey: queryKeys.collaborationRequests.all(),
      });
    },
    onError: (err) => {
      const message =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Failed to send connection request";
      toast.error(message);
    },
  });

  const send = () => {
    if (!requireAuth()) return;
    mutation.mutate();
  };

  return {
    status: statusQuery.data ?? ("none" as const),
    isPending: mutation.isPending,
    send,
  };
}

export function useStartConversation(
  username: string,
  role?: "talent" | "recruiter" | "admin" | null,
) {
  const router = useRouter();
  const requireAuth = useRequireAuth();

  const mutation = useMutation({
    mutationFn: () => conversationsApi.startByUsername(username),
    onSuccess: (data) => {
      const messagesPath =
        role === "recruiter"
          ? `/recruiter/messages/${data.conversation_id}`
          : `/talent/messages/${data.conversation_id}`;
      router.push(messagesPath);
    },
    onError: (err) => {
      const message =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Failed to start conversation";
      toast.error(message);
    },
  });

  const start = () => {
    if (!requireAuth()) return;
    mutation.mutate();
  };

  return { start, isPending: mutation.isPending };
}
