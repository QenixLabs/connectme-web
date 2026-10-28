import { Badge } from "@/components/ui/badge";
import type { ServiceInquiryStatus } from "@/lib/api/inquiries";

const LABELS: Record<ServiceInquiryStatus, string> = {
  new: "New",
  responded: "Responded",
  closed: "Closed",
};

export function InquiryStatus({ status }: { status: ServiceInquiryStatus }) {
  return (
    <Badge variant={status === "new" ? "default" : "secondary"}>
      {LABELS[status]}
    </Badge>
  );
}
