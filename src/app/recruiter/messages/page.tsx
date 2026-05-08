import { MessageSquare } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export default function RecruiterMessagesPage() {
  return (
    <div className="space-y-6">
      <EmptyState
        icon={<MessageSquare className="w-8 h-8 text-text-muted" strokeWidth={1.5} />}
        title="Messages"
        description="No messages yet. Start conversations with talent from their profiles."
      />
    </div>
  );
}
