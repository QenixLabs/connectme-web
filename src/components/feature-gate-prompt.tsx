"use client";

import { useRouter } from "next/navigation";
import { Crown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getFeatureDescription } from "@/lib/feature-descriptions";

interface FeatureGatePromptProps {
  open: boolean;
  onClose: () => void;
  feature: string;
  plan?: string;
  title?: string;
  description?: string;
}

export function FeatureGatePrompt({
  open,
  onClose,
  feature,
  plan,
  title,
  description,
}: FeatureGatePromptProps) {
  const router = useRouter();
  const fallback = getFeatureDescription(feature);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md border-purple-200">
        <DialogHeader className="gap-3">
          <div className="mx-auto sm:mx-0 w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
            <Crown className="w-6 h-6 text-purple-600" strokeWidth={1.5} />
          </div>
          <DialogTitle className="text-center sm:text-left">
            {title || fallback.title}
          </DialogTitle>
          <DialogDescription className="text-center sm:text-left">
            {description || fallback.description}
          </DialogDescription>
        </DialogHeader>

        {plan && (
          <p className="text-xs text-muted-foreground text-center sm:text-left">
            Current plan: <span className="font-medium">{plan}</span>
          </p>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Not now
          </Button>
          <Button
            className="bg-purple-600 hover:bg-purple-700 text-white"
            onClick={() => {
              onClose();
              router.push("/pricing");
            }}
          >
            Upgrade plan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
