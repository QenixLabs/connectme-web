"use client";

import { useRouter } from "next/navigation";
import { Crown } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { getFeatureDescription } from "@/lib/feature-descriptions";

interface FeatureGateAlertProps {
  feature: string;
  plan?: string;
  title?: string;
  description?: string;
}

export function FeatureGateAlert({
  feature,
  plan,
  title,
  description,
}: FeatureGateAlertProps) {
  const router = useRouter();
  const fallback = getFeatureDescription(feature);

  return (
    <Alert className="border-purple-200 bg-purple-50">
      <Crown className="h-5 w-5 text-purple-600" strokeWidth={1.5} />
      <AlertTitle className="text-purple-900">{title || fallback.title}</AlertTitle>
      <AlertDescription className="text-purple-800">
        <span className="block">{description || fallback.description}</span>
        {plan && (
          <span className="block text-xs mt-1 text-purple-700">
            Current plan: <span className="font-medium">{plan}</span>
          </span>
        )}
      </AlertDescription>
      <div className="mt-3">
        <Button
          size="sm"
          className="bg-purple-600 hover:bg-purple-700 text-white"
          onClick={() => router.push("/pricing")}
        >
          Upgrade plan
        </Button>
      </div>
    </Alert>
  );
}
