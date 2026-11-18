import { apiClient } from "./client";

export type SupportAttachment = { name: string; mime_type: string; size: number; url: string };
export type SupportReply = { _id?: string; author_id: string; author_role: "user" | "admin"; message: string; attachments?: SupportAttachment[]; created_at: string };
export type SupportTicket = {
  _id: string; user_id: string | { _id: string; email: string; role: string }; subject: string;
  category: string; priority: string; status: "open" | "in_progress" | "waiting_on_user" | "resolved" | "closed";
  replies: SupportReply[]; created_at: string; updated_at: string; last_activity_at: string;
};
export type SupportTicketPage = { tickets: SupportTicket[]; total: number; page: number; limit: number; total_pages: number };

export const supportApi = {
  async create(payload: { subject: string; message: string; category?: string; attachments?: File[] }) {
    const body = new FormData();
    body.append("subject", payload.subject);
    body.append("message", payload.message);
    if (payload.category) body.append("category", payload.category);
    payload.attachments?.forEach((file) => body.append("attachments", file));
    return (await apiClient.post<SupportTicket>("/support/tickets", body, {
      headers: { "Content-Type": "multipart/form-data" },
    })).data;
  },
  async mine(page = 1) { return (await apiClient.get<SupportTicketPage>("/support/tickets/mine", { params: { page } })).data; },
  async getMine(id: string) { return (await apiClient.get<SupportTicket>(`/support/tickets/mine/${id}`)).data; },
  async replyMine(id: string, message: string) { return (await apiClient.post<SupportTicket>(`/support/tickets/mine/${id}/replies`, { message })).data; },
  async adminList(params: { page?: number; status?: string; search?: string }) { return (await apiClient.get<SupportTicketPage>("/support/tickets", { params })).data; },
  async adminGet(id: string) { return (await apiClient.get<SupportTicket>(`/support/tickets/${id}`)).data; },
  async adminReply(id: string, message: string, status?: string) { return (await apiClient.post<SupportTicket>(`/support/tickets/${id}/replies`, { message, status })).data; },
  async adminStatus(id: string, status: string) { return (await apiClient.patch<SupportTicket>(`/support/tickets/${id}/status`, { status })).data; },
};
