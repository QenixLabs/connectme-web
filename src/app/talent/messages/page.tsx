import { MessageSquare } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export default function TalentMessagesPage() {
  return (
    <div className="space-y-6">
      <EmptyState
        icon={<MessageSquare className="w-8 h-8 text-text-muted" strokeWidth={1.5} />}
        title="Messages"
        description="No messages yet. When recruiters contact you, they will appear here."
      />
    </div>
  );
}
