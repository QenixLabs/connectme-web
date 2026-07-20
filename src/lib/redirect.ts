export function redirectToSuspendedPage(until: string, reason: string, moderationActionId?: string) {
  if (typeof window === "undefined") return;
  const currentPath = window.location.pathname;
  if (currentPath === "/suspended") return;
  const params = new URLSearchParams({ until, reason });
  if (moderationActionId) params.set("moderation_action_id", moderationActionId);
  window.location.href = `/suspended?${params.toString()}`;
}

export function redirectToBannedPage(bannedAt: string, reason: string, moderationActionId?: string) {
  if (typeof window === "undefined") return;
  const currentPath = window.location.pathname;
  if (currentPath === "/banned") return;
  const params = new URLSearchParams({ banned_at: bannedAt, reason });
  if (moderationActionId) params.set("moderation_action_id", moderationActionId);
  window.location.href = `/banned?${params.toString()}`;
}
