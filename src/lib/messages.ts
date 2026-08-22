import type { Conversation, ConversationParticipant, Message } from "@/lib/api/types";

export function getConversationParticipant(
  conversation: Conversation | null | undefined,
  currentUserId: string | undefined | null,
): ConversationParticipant | undefined {
  if (!conversation || !currentUserId) return undefined;

  if (conversation.participant) return conversation.participant;

  const other = conversation.participant_ids?.find((p) => {
    const id = typeof p === "string" ? p : p._id;
    return id && id !== currentUserId;
  });

  return typeof other === "string" ? undefined : other;
}

export function getMessageSenderId(message: Message | null | undefined): string | undefined {
  if (!message) return undefined;
  if (typeof message.sender_id === "string") return message.sender_id;
  return message.sender_id?._id;
}
