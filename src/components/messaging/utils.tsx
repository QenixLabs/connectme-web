import type { Conversation, ConversationParticipant } from "@/lib/api/messages";

export function getParticipantId(p: string | ConversationParticipant): string {
  return typeof p === "string" ? p : String(p._id);
}

export function getOtherParticipant(
  conversation: Conversation,
  currentUserId: string,
): ConversationParticipant | null {
  const other = conversation.participant_ids.find(
    (p) => getParticipantId(p) !== currentUserId,
  );
  return typeof other === "object" && other !== null ? other : null;
}

export function getOtherParticipantId(
  conversation: Conversation,
  currentUserId: string,
): string {
  const other = getOtherParticipant(conversation, currentUserId);
  return other ? String(other._id) : "";
}

export function getDisplayName(
  participant: ConversationParticipant | null,
  fallbackId: string,
): string {
  if (!participant) return `User ${fallbackId.slice(-6)}`;
  if (participant.role === "recruiter") {
    return (
      participant.company_name ||
      participant.email ||
      `User ${String(participant._id).slice(-6)}`
    );
  }
  return (
    participant.full_legal_name ||
    participant.username ||
    participant.email ||
    `User ${String(participant._id).slice(-6)}`
  );
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  if (isToday) return "Today";
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString();
}

export function generateClientId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function UserAvatar({
  photo,
  name,
  className,
}: {
  photo?: string;
  name: string;
  className?: string;
}) {
  return (
    <div
      className={`rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${className || ""}`}
    >
      {photo ? (
        <img src={photo} alt={name} className="w-full h-full object-cover" />
      ) : (
        getInitials(name)
      )}
    </div>
  );
}
