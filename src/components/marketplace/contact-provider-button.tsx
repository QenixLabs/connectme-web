"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { conversationsApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api/client";
import { useAuthStore } from "@/providers/auth-store-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface ContactProviderButtonProps {
  providerSlug: string;
  providerName: string;
  className?: string;
  variant?: "default" | "outline" | "secondary";
}

function inboxFor(role?: string, capabilities?: string[]) {
  if (capabilities?.includes("provider") || role === "provider") {
    return "/provider/messages";
  }
  if (role === "recruiter") return "/recruiter/messages";
  return "/talent/messages";
}

export function ContactProviderButton({
  providerSlug,
  providerName,
  className,
  variant = "default",
}: ContactProviderButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  function handleOpen() {
    if (!user) {
      router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    setError("");
    setOpen(true);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSending(true);
    setError("");
    try {
      const { conversation_id } = await conversationsApi.startByUsername(providerSlug);
      const inbox = inboxFor(user?.role, user?.account_capabilities);
      const content = message.trim();

      if (content) {
        try {
          await conversationsApi.sendMessage({
            conversation_id,
            content,
            client_message_id: `marketplace-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          });
          toast.success("Message sent");
        } catch (sendError) {
          toast.message("Conversation created", {
            description: getApiErrorMessage(
              sendError,
              "Open your inbox to send the message.",
            ),
          });
        }
      }

      setOpen(false);
      setMessage("");
      router.push(`${inbox}/${conversation_id}`);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not contact this provider"));
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <Button type="button" className={className} variant={variant} onClick={handleOpen}>
        <MessageSquare className="mr-2 size-4" />
        Contact provider
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Contact {providerName}</DialogTitle>
            <DialogDescription>
              Introduce your project and what you need. You can continue the conversation in your
              inbox.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3">
            <Textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={4}
              maxLength={2000}
              placeholder="Hi! I'd like to discuss a project…"
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={sending}>
                {sending && <Loader2 className="mr-2 size-4 animate-spin" />}
                {message.trim() ? "Send message" : "Start conversation"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
