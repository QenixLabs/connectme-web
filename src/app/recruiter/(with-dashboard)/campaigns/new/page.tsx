"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FolderPlus, FilePlus, Loader2 } from "lucide-react";
import { CampaignWizard } from "@/components/campaigns/CampaignWizard";
import { useCampaignTemplates, useUseCampaignTemplate } from "@/lib/api/hooks/useCampaignTemplates";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getApiErrorMessage } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { useTierGuard } from "@/hooks/use-tier-guard";

function TemplateCard({
  name,
  onClick,
  isLoading,
}: {
  name: string;
  onClick: () => void;
  isLoading?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={cn(
        "bg-card border border-border rounded-2xl p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-card-hover flex flex-col gap-2",
        isLoading && "opacity-60 cursor-not-allowed"
      )}
    >
      <div className="flex items-center gap-2">
        {isLoading ? (
          <Loader2 className="w-4 h-4 text-brand animate-spin" strokeWidth={1.5} />
        ) : (
          <FolderPlus className="w-4 h-4 text-brand" strokeWidth={1.5} />
        )}
        <span className="text-sm font-medium text-text-primary">{name}</span>
      </div>
    </button>
  );
}

export default function NewCampaignPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"select" | "wizard">("select");
  const { data: templatesData, isLoading, error } = useCampaignTemplates();
  const useTemplate = useUseCampaignTemplate();

  const templates = templatesData || [];

  const { guard } = useTierGuard(3);

  const handleUseTemplate = (templateId: string) => {
    guard(() => {
      useTemplate.mutate(templateId, {
        onSuccess: (campaign) => {
          router.push(`/recruiter/campaigns/${campaign._id}/edit`);
        },
      });
    });
  };

  if (mode === "wizard") {
    return (
      <div className="max-w-[1280px] mx-auto w-full px-4 py-6 pb-10">
        <CampaignWizard />
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto w-full px-4 py-6 pb-10 flex flex-col gap-6">
      <h1 className="text-xl font-bold text-text-primary">New Campaign</h1>

      <button
        onClick={() => guard(() => setMode("wizard"))}
        className="bg-card border border-border rounded-2xl p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-card-hover flex items-center gap-3"
      >
        <div className="w-10 h-10 rounded-full bg-brand-light flex items-center justify-center">
          <FilePlus className="w-5 h-5 text-brand" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-sm font-medium text-text-primary">Start from scratch</p>
          <p className="text-xs text-text-muted">Create a new campaign manually</p>
        </div>
      </button>

      <div>
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Or use a template</h2>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-2xl" />
            ))}
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertDescription>{getApiErrorMessage(error, "Failed to load templates")}</AlertDescription>
          </Alert>
        ) : templates.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {templates.map((t: { _id: string; name: string }) => (
              <TemplateCard
                key={t._id}
                name={t.name}
                onClick={() => handleUseTemplate(t._id)}
                isLoading={useTemplate.isPending}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-muted">No templates yet. Save a campaign as a template to reuse it.</p>
        )}
      </div>
    </div>
  );
}
