"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  FolderPlus,
  FilePlus,
  Loader2,
  ArrowLeft,
  Sparkles,
  LayoutTemplate,
  ChevronRight,
  Clock,
  Film,
  Megaphone,
  Tv,
  Palette,
  Theater,
  Music,
} from "lucide-react";
import { CampaignWizard } from "@/components/campaigns/CampaignWizard";
import {
  useCampaignTemplates,
  useUseCampaignTemplate,
} from "@/lib/api/hooks/useCampaignTemplates";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getApiErrorMessage } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { useTierGuard } from "@/hooks/use-tier-guard";

const INDUSTRY_GRADIENTS = [
  "from-violet-500 to-purple-700",
  "from-sky-500 to-blue-700",
  "from-rose-500 to-pink-700",
  "from-teal-500 to-emerald-700",
  "from-fuchsia-500 to-purple-700",
  "from-indigo-500 to-violet-700",
  "from-amber-500 to-orange-700",
  "from-cyan-500 to-teal-700",
];

function getTemplateGradient(idx: number): string {
  return INDUSTRY_GRADIENTS[idx % INDUSTRY_GRADIENTS.length];
}

function TemplateCard({
  name,
  onClick,
  isLoading,
  index,
}: {
  name: string;
  onClick: () => void;
  isLoading?: boolean;
  index: number;
}) {
  const gradient = getTemplateGradient(index);
  const initials = name
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase())
    .slice(0, 2)
    .join("");

  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.05 + index * 0.06, ease: "easeOut" }}
      onClick={onClick}
      disabled={isLoading}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-luxe transition-all duration-300 hover:shadow-luxe-lg hover:-translate-y-0.5 text-left",
        isLoading && "opacity-60 cursor-not-allowed",
      )}
    >
      <div
        className={cn(
          "h-2 bg-gradient-to-r",
          gradient,
        )}
      />
      <div className="p-5 flex items-center gap-4">
        <div
          className={cn(
            "h-11 w-11 rounded-xl bg-gradient-to-br grid place-items-center text-white text-sm font-bold shrink-0 shadow-sm",
            gradient,
          )}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-semibold text-ink truncate">{name}</p>
          <p className="text-[13px] text-ink-muted mt-0.5">Template</p>
        </div>
        {isLoading ? (
          <Loader2
            className="w-5 h-5 text-gold animate-spin shrink-0"
            strokeWidth={1.5}
          />
        ) : (
          <ChevronRight
            className="w-5 h-5 text-ink-muted shrink-0 transition-transform group-hover:translate-x-0.5"
            strokeWidth={1.5}
          />
        )}
      </div>
    </motion.button>
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
      <div className="max-w-[1280px] mx-auto w-full px-4 sm:px-6 py-8 pb-10">
        <button
          type="button"
          onClick={() => setMode("select")}
          className="flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition-colors mb-6 group font-medium"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" strokeWidth={1.5} />
          Back to templates
        </button>
        <CampaignWizard />
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto w-full px-4 sm:px-6 py-8 pb-10 flex flex-col gap-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <h1 className="text-[28px] font-serif font-semibold text-ink tracking-tight">
          New Campaign
        </h1>
        <p className="mt-1.5 text-[15px] text-ink-muted leading-relaxed">
          Start from scratch or use a saved template to get going faster
        </p>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.06, ease: "easeOut" }}
        onClick={() => guard(() => setMode("wizard"))}
        className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-luxe transition-all duration-300 hover:shadow-luxe-lg hover:-translate-y-0.5 text-left"
      >
        <div className="flex items-center gap-5 p-6">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-gold to-gold-hover grid place-items-center shadow-[0_4px_14px_-4px_oklch(0.74_0.13_80/0.45)] transition-transform group-hover:scale-105">
            <FilePlus className="w-6 h-6 text-white" strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-lg font-serif font-semibold text-ink">
              Start from scratch
            </p>
            <p className="mt-1 text-[15px] text-ink-muted">
              Create a new campaign manually with our step-by-step wizard
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-ink-muted shrink-0 transition-transform group-hover:translate-x-1" strokeWidth={1.5} />
        </div>
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.12, ease: "easeOut" }}
      >
        <div className="flex items-center gap-2.5 mb-5">
          <LayoutTemplate className="h-4 w-4 text-ink-muted" strokeWidth={1.5} />
          <h2 className="text-sm font-semibold text-ink uppercase tracking-[0.06em]">
            Saved Templates
          </h2>
          {templates.length > 0 && (
            <span className="text-xs text-ink-muted font-medium ml-1 px-2 py-0.5 rounded-md bg-muted-bg">
              {templates.length}
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-[86px] rounded-2xl" />
            ))}
          </div>
        ) : error ? (
          <Alert variant="destructive" className="rounded-xl border-error-muted">
            <AlertDescription>
              {getApiErrorMessage(error, "Failed to load templates")}
            </AlertDescription>
          </Alert>
        ) : templates.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((t: { _id: string; name: string }, idx: number) => (
              <TemplateCard
                key={t._id}
                name={t.name}
                onClick={() => handleUseTemplate(t._id)}
                isLoading={useTemplate.isPending}
                index={idx}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted-bg/40 px-6 py-20 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gold-soft shadow-luxe">
              <Clock className="h-7 w-7 text-gold-ink" strokeWidth={1.5} />
            </div>
            <p className="text-sm font-semibold text-ink">
              No templates yet
            </p>
            <p className="mt-1.5 max-w-sm text-[15px] text-ink-muted leading-relaxed">
              Save a campaign as a template to reuse it here for faster campaign creation.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
