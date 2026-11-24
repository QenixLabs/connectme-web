"use client";

import { ArrowUpRight, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type UpgradeLimitDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mediaLabel?: string;
  used?: number;
  limit?: number;
};

export function UpgradeLimitDialog({
  open,
  onOpenChange,
  mediaLabel = "media",
  used,
  limit,
}: UpgradeLimitDialogProps) {
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mb-2 grid size-11 place-items-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="size-5" />
          </div>
          <DialogTitle>Your plan limit has been reached</DialogTitle>
          <DialogDescription>
            {used !== undefined && limit !== undefined
              ? `You have used ${used} of ${limit} ${mediaLabel} allowed on your current plan. `
              : "You have reached the media limit on your current plan. "}
            Upgrade your plan to upload more.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Not now
          </Button>
          <Button
            onClick={() => {
              onOpenChange(false);
              router.push("/pricing");
            }}
          >
            Upgrade plan
            <ArrowUpRight className="ml-2 size-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
