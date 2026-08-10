export interface ConversationParticipant {
  _id: string;
  username?: string;
  full_legal_name?: string;
  company_name?: string;
  profile_photo?: string;
  professions?: string[];
  role: "talent" | "recruiter" | "admin";
  verification_tier: number;
  location?: { country?: string; state?: string; city?: string };
}

export interface Conversation {
  _id: string;
  participant_ids: string[];
  participant?: ConversationParticipant;
  last_message_id: string | null;
  last_message_preview: string;
  last_message_sender_id: string | null;
  last_message_at: string;
  unread_counts: Record<string, number>;
  user_settings: Record<
    string,
    { archived: boolean; muted: boolean; pinned: boolean }
  >;
  first_message: boolean;
  created_at: string;
  updated_at: string;
}

export interface Attachment {
  url: string;
  name: string;
  mime_type: string;
  size: number;
  width?: number;
  height?: number;
}

export interface Message {
  _id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: "text" | "image" | "file" | "system";
  attachments: Attachment[];
  system_event_type?: string;
  client_message_id: string;
  status: "sending" | "sent" | "delivered" | "read" | "failed";
  read_by: string[];
  created_at: string;
}

export interface SendMessagePayload {
  conversation_id: string;
  content: string;
  client_message_id: string;
  attachments?: Attachment[];
}

export interface SendFirstMessagePayload {
  receiver_id: string;
  content: string;
  client_message_id: string;
}
