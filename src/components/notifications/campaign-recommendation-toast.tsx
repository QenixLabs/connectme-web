"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Sparkles, MapPin, Briefcase, ArrowRight, X } from "lucide-react";
import { useSocket } from "@/hooks/use-socket";
import { useAuthStore } from "@/providers/auth-store-provider";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { NotificationItem } from "@/lib/api/notifications";

interface CampaignRecommendationData {
  campaign_id: string;
  match_score: number;
  campaign_name: string;
  role_type?: string;
}

function CampaignRecommendationCard({
  data,
  onDismiss,
  onView,
}: {
  data: CampaignRecommendationData;
  onDismiss: () => void;
  onView: () => void;
}) {
  return (
    <Card className="p-4 bg-white border border-brand-muted shadow-xl max-w-sm w-full">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-semibold text-amber-600 uppercase tracking-wide">
            Campaign Match
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          className="text-text-muted hover:text-text-primary transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <h3 className="mt-2 text-sm font-semibold text-text-primary line-clamp-2">
        {data.campaign_name}
      </h3>

      <div className="mt-2 flex items-center gap-2 text-xs text-text-muted">
        {data.role_type && (
          <span className="flex items-center gap-1">
            <Briefcase className="w-3 h-3" />
            {data.role_type}
          </span>
        )}
        <Badge variant="secondary" className="text-2xs">
          {data.match_score}% match
        </Badge>
      </div>

      <Button size="sm" className="mt-3 w-full" onClick={onView}>
        View Campaign
        <ArrowRight className="w-3.5 h-3.5 ml-1" />
      </Button>
    </Card>
  );
}

export function CampaignRecommendationToast() {
  const router = useRouter();
  const { socket } = useSocket();
  const role = useAuthStore((state) => state.user?.role);

  const handleNotification = useCallback(
    (notification: NotificationItem) => {
      if (notification.type !== "campaign_recommendation") return;
      if (role !== "talent") return;

      const data = notification.data as CampaignRecommendationData;
      if (!data?.campaign_id) return;

      const toastId = toast.custom(
        () => (
          <CampaignRecommendationCard
            data={data}
            onDismiss={() => toast.dismiss(toastId)}
            onView={() => {
              toast.dismiss(toastId);
              router.push(`/talent/opportunities/${data.campaign_id}`);
            }}
          />
        ),
        {
          duration: 10000,
          position: "bottom-right",
        }
      );
    },
    [role, router]
  );

  useEffect(() => {
    if (!socket) return;

    socket.on("notification:new", handleNotification);
    return () => {
      socket.off("notification:new", handleNotification);
    };
  }, [socket, handleNotification]);

  return null;
}
