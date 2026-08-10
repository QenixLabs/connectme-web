import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { recruiterApi, type UpdateRecruiterProfilePayload } from "@/lib/api/recruiter";
import { subscriptionsApi } from "@/lib/api/subscriptions";
import { notificationsApi } from "@/lib/api/notifications";
import { conversationsApi } from "@/lib/api/conversations";

export const recruiterProfileKeys = {
  all: ["recruiter-profile"] as const,
  profile: () => [...recruiterProfileKeys.all, "profile"] as const,
  subscription: () => [...recruiterProfileKeys.all, "subscription"] as const,
  usage: () => [...recruiterProfileKeys.all, "usage"] as const,
  unreadNotifications: () => [...recruiterProfileKeys.all, "unread-notifications"] as const,
  unreadMessages: () => [...recruiterProfileKeys.all, "unread-messages"] as const,
};

export function useRecruiterProfile() {
  return useQuery({
    queryKey: recruiterProfileKeys.profile(),
    queryFn: () => recruiterApi.getMyProfile(),
  });
}

export function useRecruiterSubscription() {
  return useQuery({
    queryKey: recruiterProfileKeys.subscription(),
    queryFn: () => subscriptionsApi.getMySubscription(),
  });
}

export function useRecruiterUsage() {
  return useQuery({
    queryKey: recruiterProfileKeys.usage(),
    queryFn: () => subscriptionsApi.getUsage(),
  });
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: recruiterProfileKeys.unreadNotifications(),
    queryFn: () => notificationsApi.getUnreadCount(),
    staleTime: 30_000,
  });
}

export function useUnreadMessageCount() {
  return useQuery({
    queryKey: recruiterProfileKeys.unreadMessages(),
    queryFn: () => conversationsApi.getUnreadCount(),
    staleTime: 30_000,
  });
}

export function useUpdateRecruiterProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateRecruiterProfilePayload) =>
      recruiterApi.updateProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruiterProfileKeys.profile() });
    },
  });
}

export function useUploadRecruiterPhoto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => recruiterApi.uploadProfilePhoto(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruiterProfileKeys.profile() });
    },
  });
}

export function useCheckSlugAvailability() {
  return useMutation({
    mutationFn: (slug: string) => recruiterApi.checkSlugAvailability(slug),
  });
}
