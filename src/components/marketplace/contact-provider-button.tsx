"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { getVerificationPath } from "@/lib/verification-path";
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
  serviceId?: string;
  serviceTitle?: string;
  buttonLabel?: string;
  className?: string;
  variant?: "default" | "outline" | "secondary";
}

function defaultMessageFor(serviceTitle?: string) {
  return serviceTitle
    ? `I'm contacting you about the service "${serviceTitle}".`
    : "";
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
  serviceId,
  serviceTitle,
  buttonLabel = "Contact provider",
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
    if (user.verification_tier < 3) {
      toast.error("Complete Tier 3 verification to contact service providers.");
      router.push(getVerificationPath(user));
      return;
    }
    setError("");
    setMessage(defaultMessageFor(serviceTitle));
    setOpen(true);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSending(true);
    setError("");
    try {
      const { conversation_id } = await conversationsApi.startByUsername(
        providerSlug,
        serviceId,
      );
      const inbox = inboxFor(user?.role, user?.account_capabilities);
      const content = message.trim();

      if (content) {
        try {
          await conversationsApi.sendMessage({
            conversation_id,
            content,
            client_message_id: `marketplace-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            ...(serviceId ? { service_id: serviceId } : {}),
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
      const serviceQuery = serviceId
        ? `?serviceId=${encodeURIComponent(serviceId)}`
        : "";
      router.push(`${inbox}/${conversation_id}${serviceQuery}`);
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
        {buttonLabel}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Contact {providerName}</DialogTitle>
            <DialogDescription>
              {serviceTitle
                ? `We've drafted a message about ${serviceTitle}. Edit it before sending.`
                : "Introduce your project and what you need. You can continue the conversation in your inbox."}
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
                {message.trim() || serviceTitle ? "Send message" : "Start conversation"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
