"use client";

import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { collabPostsApi, type CollabPostsParams, type CreateCollabPostPayload } from "@/lib/api/collab-posts";

export const collabPostsKeys = {
  all: ["collab-posts"] as const,
  feed: (params: CollabPostsParams) => [...collabPostsKeys.all, "feed", params] as const,
  mine: (params: CollabPostsParams) => [...collabPostsKeys.all, "mine", params] as const,
};

function backendMessage(err: unknown, fallback: string) {
  return (
    (err as { response?: { data?: { message?: string } } }).response?.data?.message || fallback
  );
}

export function useCollabPostsFeed(params: CollabPostsParams = {}) {
  const { page: _page, ...stableParams } = params;
  return useInfiniteQuery({
    queryKey: collabPostsKeys.feed(stableParams),
    queryFn: ({ pageParam }) => collabPostsApi.listFeed({ ...stableParams, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? (lastPage.page ?? 1) + 1 : undefined,
    placeholderData: (prev) => prev,
  });
}

export function useMyCollabPosts(params: CollabPostsParams = {}) {
  const { page: _page, ...stableParams } = params;
  return useInfiniteQuery({
    queryKey: collabPostsKeys.mine(stableParams),
    queryFn: ({ pageParam }) => collabPostsApi.listMine({ ...stableParams, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? (lastPage.page ?? 1) + 1 : undefined,
    placeholderData: (prev) => prev,
  });
}

function useInvalidateCollabPosts() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: collabPostsKeys.all });
  };
}

export function useCreateCollabPost() {
  const invalidate = useInvalidateCollabPosts();
  return useMutation({
    mutationFn: (payload: CreateCollabPostPayload) => collabPostsApi.create(payload),
    onSuccess: () => {
      toast.success("Collab post published");
      invalidate();
    },
    onError: (err) => {
      toast.error(backendMessage(err, "Failed to publish collab post"));
    },
  });
}

export function useCloseCollabPost() {
  const invalidate = useInvalidateCollabPosts();
  return useMutation({
    mutationFn: (id: string) => collabPostsApi.close(id),
    onSuccess: () => {
      toast.success("Collab post closed");
      invalidate();
    },
    onError: (err) => {
      toast.error(backendMessage(err, "Failed to close collab post"));
    },
  });
}

export function useReopenCollabPost() {
  const invalidate = useInvalidateCollabPosts();
  return useMutation({
    mutationFn: (id: string) => collabPostsApi.reopen(id),
    onSuccess: () => {
      toast.success("Collab post reopened");
      invalidate();
    },
    onError: (err) => {
      toast.error(backendMessage(err, "Failed to reopen collab post"));
    },
  });
}

export function useDeleteCollabPost() {
  const invalidate = useInvalidateCollabPosts();
  return useMutation({
    mutationFn: (id: string) => collabPostsApi.remove(id),
    onSuccess: () => {
      toast.success("Collab post deleted");
      invalidate();
    },
    onError: (err) => {
      toast.error(backendMessage(err, "Failed to delete collab post"));
    },
  });
}

export function useExpressInterest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, message }: { id: string; message?: string }) =>
      collabPostsApi.expressInterest(id, message),
    onSuccess: (data) => {
      if (data.wasAccepted) {
        toast.success("You are now connected — say hello!");
      } else {
        toast.success("Interest sent — they will see your request");
      }
      queryClient.invalidateQueries({ queryKey: collabPostsKeys.all });
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      queryClient.invalidateQueries({ queryKey: ["collaboration-requests"] });
    },
    onError: (err) => {
      toast.error(backendMessage(err, "Failed to send interest"));
    },
  });
}
