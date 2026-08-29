"use client";

import { useState } from "react";
import { Plus, Send, User } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { conversationsApi, recruiterApi, talentApi } from "@/lib/api";
import type { Conversation } from "@/lib/api/types";

interface NewConversationDialogProps {
  currentUserId?: string;
  onCreated: (conversation: Conversation) => void;
  onSelect?: (conversationId: string) => void;
}

export function NewConversationDialog({
  currentUserId,
  onCreated,
  onSelect,
}: NewConversationDialogProps) {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const handle = username.trim().toLowerCase();
    const content = message.trim();

    if (!handle) {
      toast.error("Enter a username.");
      return;
    }
    if (!content) {
      toast.error("Write a first message.");
      return;
    }
    if (handle === currentUserId?.toLowerCase()) {
      toast.error("You cannot message yourself.");
      return;
    }

    setLoading(true);

    try {
      let receiverId: string | undefined;

      try {
        const recruiter = await recruiterApi.getPublicProfile(handle);
        receiverId = recruiter.user_id;
      } catch {
        // not a recruiter slug, try talent username
      }

      if (!receiverId) {
        try {
          const talent = await talentApi.getPublicProfile(handle);
          receiverId = "private" in talent ? talent.preview.user_id : talent.user_id;
        } catch {
          // not found
        }
      }

      if (!receiverId) {
        toast.error("No user found with that username.");
        setLoading(false);
        return;
      }

      const clientId = `client-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const sent = await conversationsApi.sendFirstMessage({
        receiver_id: receiverId,
        content,
        client_message_id: clientId,
      });

      const conversation = await conversationsApi.getConversation(sent.conversation_id);

      toast.success("Conversation started.");
      setOpen(false);
      setUsername("");
      setMessage("");
      onCreated(conversation);
      onSelect?.(conversation._id);
    } catch (err: any) {
      const message = err?.backendMessage || (err instanceof Error ? err.message : "Could not start conversation.");
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          aria-label="New message"
          className="rounded-full bg-surface-raised text-primary shadow-[var(--shadow-card)] transition-all hover:bg-surface-2 hover:shadow-[var(--shadow-card-hover)]"
        >
          <Plus className="size-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="gap-0 border-border bg-card p-0 sm:max-w-md">
        <DialogHeader className="border-b border-border p-5 text-left">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <User className="size-4" />
            </span>
            Start a conversation
          </DialogTitle>
          <DialogDescription className="pt-1">
            Enter a recruiter or talent username and send your first message.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium text-foreground">
              Username
            </label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. casting-director"
              autoComplete="off"
              className="h-11 rounded-xl border-border bg-surface-raised focus-visible:border-primary/40"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="first-message" className="text-sm font-medium text-foreground">
              First message
            </label>
            <Textarea
              id="first-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Introduce yourself..."
              rows={4}
              className="resize-none rounded-xl border-border bg-surface-raised focus-visible:border-primary/40"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="rounded-xl border-border"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !username.trim() || !message.trim()}
              className={cn(
                "btn-accept rounded-xl px-6",
                loading && "opacity-80"
              )}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Sending...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="size-4" />
                  Send
                </span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
