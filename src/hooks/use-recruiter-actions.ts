"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { recruiterApi } from "@/lib/api/recruiter";
import { conversationsApi } from "@/lib/api/conversations";
import { useAuthStore } from "@/providers/auth-store-provider";

const savedRecruiterKeys = {
  all: ["saved-recruiter"] as const,
  status: (slug: string) =>
    [...savedRecruiterKeys.all, "status", slug] as const,
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

export function useSaveRecruiter(slug: string) {
  const queryClient = useQueryClient();
  const requireAuth = useRequireAuth();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const statusQuery = useQuery({
    queryKey: savedRecruiterKeys.status(slug),
    queryFn: () => recruiterApi.getRecruiterSaveStatus(slug),
    enabled: !!slug && isAuthenticated,
  });

  const saveMutation = useMutation({
    mutationFn: () => recruiterApi.saveRecruiter(slug),
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: savedRecruiterKeys.status(slug),
      });
      const prev = queryClient.getQueryData<{ is_saved: boolean }>(
        savedRecruiterKeys.status(slug),
      );
      queryClient.setQueryData(savedRecruiterKeys.status(slug), {
        is_saved: true,
      });
      return { prev };
    },
    onError: (err, _vars, context) => {
      if (context?.prev) {
        queryClient.setQueryData(
          savedRecruiterKeys.status(slug),
          context.prev,
        );
      }
      const message =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Failed to follow recruiter";
      toast.error(message);
    },
    onSuccess: () => {
      toast.success("Following recruiter");
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: savedRecruiterKeys.status(slug),
      });
    },
  });

  const unsaveMutation = useMutation({
    mutationFn: () => recruiterApi.unsaveRecruiter(slug),
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: savedRecruiterKeys.status(slug),
      });
      const prev = queryClient.getQueryData<{ is_saved: boolean }>(
        savedRecruiterKeys.status(slug),
      );
      queryClient.setQueryData(savedRecruiterKeys.status(slug), {
        is_saved: false,
      });
      return { prev };
    },
    onError: (err, _vars, context) => {
      if (context?.prev) {
        queryClient.setQueryData(
          savedRecruiterKeys.status(slug),
          context.prev,
        );
      }
      const message =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Failed to unfollow recruiter";
      toast.error(message);
    },
    onSuccess: () => {
      toast.success("Unfollowed recruiter");
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: savedRecruiterKeys.status(slug),
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
