"use client";

import { useMemo, useState } from "react";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { useApplyToCampaign } from "@/hooks/use-campaigns";
import type { CampaignQuestion } from "@/lib/api/campaigns";

interface ApplyCampaignDialogProps {
  campaignId: string;
  campaignName: string;
  questions: CampaignQuestion[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function getQuestionId(q: CampaignQuestion, fallbackIndex: number): string {
  return q._id ?? `index-${fallbackIndex}`;
}

export function ApplyCampaignDialog({
  campaignId,
  campaignName,
  questions,
  open,
  onOpenChange,
}: ApplyCampaignDialogProps) {
  const applyMutation = useApplyToCampaign();
  const [message, setMessage] = useState("");
  // Store raw values: string for text/number/select/boolean, string[] for multiselect
  const [values, setValues] = useState<Record<string, string | string[]>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setMessage("");
    setValues({});
    setErrors({});
  };

  const handleOpenChange = (next: boolean) => {
    // Reset so every fresh open starts clean (event handler, not an effect)
    if (!next) resetForm();
    onOpenChange(next);
  };

  const sortedQuestions = useMemo(
    () =>
      [...(questions ?? [])].sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0),
      ),
    [questions],
  );

  const setValue = (key: string, value: string | string[]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const toggleMultiselect = (key: string, option: string) => {
    const current = values[key];
    const arr = Array.isArray(current) ? current : [];
    if (arr.includes(option)) {
      setValue(key, arr.filter((o) => o !== option));
    } else {
      setValue(key, [...arr, option]);
    }
  };

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {};
    sortedQuestions.forEach((q, i) => {
      if (!q.is_required) return;
      const key = getQuestionId(q, i);
      const raw = values[key];
      const empty = Array.isArray(raw)
        ? raw.length === 0
        : !raw || String(raw).trim() === "";
      if (empty) {
        nextErrors[key] = "This question is required.";
      }
    });
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
      toast.error("Please answer all required questions.");
      return;
    }

    const answers = sortedQuestions
      .map((q, i) => {
        const key = getQuestionId(q, i);
        const question_id = q._id;
        // Skip questions without a persisted id — backend matches by question _id
        if (!question_id) return null;
        const raw = values[key];
        const answer = Array.isArray(raw) ? raw.join(", ") : String(raw ?? "").trim();
        if (!answer) return null;
        return { question_id, answer };
      })
      .filter((a): a is { question_id: string; answer: string } => a !== null);

    applyMutation.mutate(
      {
        id: campaignId,
        payload: {
          ...(message.trim() ? { message: message.trim() } : {}),
          ...(answers.length > 0 ? { answers } : {}),
        },
      },
      {
        onSuccess: () => {
          toast.success("Application submitted successfully.");
          resetForm();
          onOpenChange(false);
        },
      },
    );
  };

  const renderField = (q: CampaignQuestion, index: number) => {
    const key = getQuestionId(q, index);
    const type = q.question_type ?? "text";
    const raw = values[key];
    const stringValue = Array.isArray(raw) ? "" : (raw ?? "");
    const error = errors[key];

    const errorText = error ? (
      <p className="mt-1 text-xs text-destructive">{error}</p>
    ) : null;

    switch (type) {
      case "number":
        return (
          <div key={key}>
            <Input
              type="number"
              placeholder="Enter a number"
              value={stringValue as string}
              onChange={(e) => setValue(key, e.target.value)}
              aria-invalid={!!error}
            />
            {errorText}
          </div>
        );
      case "select": {
        const options = q.options ?? [];
        if (options.length === 0) {
          return (
            <div key={key}>
              <Input
                placeholder="Your answer"
                value={stringValue as string}
                onChange={(e) => setValue(key, e.target.value)}
                aria-invalid={!!error}
              />
              {errorText}
            </div>
          );
        }
        return (
          <div key={key}>
            <RadioGroup
              value={stringValue as string}
              onValueChange={(v) => setValue(key, v)}
              className="gap-2"
            >
              {options.map((opt) => (
                <label
                  key={opt}
                  className={cn(
                    "flex cursor-pointer items-center gap-2.5 rounded-xl border border-border bg-muted/50 px-3 py-2.5 text-sm transition-colors hover:border-primary/50",
                    stringValue === opt && "border-primary bg-primary/5",
                  )}
                >
                  <RadioGroupItem value={opt} />
                  <span className="flex-1">{opt}</span>
                </label>
              ))}
            </RadioGroup>
            {errorText}
          </div>
        );
      }
      case "multiselect": {
        const options = q.options ?? [];
        const selected = Array.isArray(raw) ? raw : [];
        if (options.length === 0) {
          return (
            <div key={key}>
              <Textarea
                placeholder="Your answer (you can list multiple)"
                value={stringValue as string}
                onChange={(e) => setValue(key, e.target.value)}
                aria-invalid={!!error}
              />
              {errorText}
            </div>
          );
        }
        return (
          <div key={key} className="space-y-2">
            {options.map((opt) => {
              const checked = selected.includes(opt);
              return (
                <label
                  key={opt}
                  className={cn(
                    "flex cursor-pointer items-center gap-2.5 rounded-xl border border-border bg-muted/50 px-3 py-2.5 text-sm transition-colors hover:border-primary/50",
                    checked && "border-primary bg-primary/5",
                  )}
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => toggleMultiselect(key, opt)}
                  />
                  <span className="flex-1">{opt}</span>
                </label>
              );
            })}
            {errorText}
          </div>
        );
      }
      case "boolean":
        return (
          <div key={key}>
            <RadioGroup
              value={stringValue as string}
              onValueChange={(v) => setValue(key, v)}
              className="grid grid-cols-2 gap-2"
            >
              {(["Yes", "No"] as const).map((opt) => (
                <label
                  key={opt}
                  className={cn(
                    "flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-muted/50 px-3 py-2.5 text-sm font-medium transition-colors hover:border-primary/50",
                    stringValue === opt && "border-primary bg-primary/5 text-primary",
                  )}
                >
                  <RadioGroupItem value={opt} className="sr-only" />
                  {opt}
                </label>
              ))}
            </RadioGroup>
            {errorText}
          </div>
        );
      case "text":
      default:
        return (
          <div key={key}>
            <Textarea
              placeholder="Type your answer here"
              value={stringValue as string}
              onChange={(e) => setValue(key, e.target.value)}
              aria-invalid={!!error}
              className="min-h-20"
            />
            {errorText}
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Apply to this campaign</DialogTitle>
          <DialogDescription className="line-clamp-2">
            {campaignName} — please answer the recruiter&apos;s questions to
            submit your application.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-1">
          <div className="space-y-1.5">
            <Label htmlFor="apply-message">
              Cover message{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </Label>
            <Textarea
              id="apply-message"
              placeholder="Introduce yourself briefly…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={1000}
              className="min-h-20"
            />
          </div>

          {sortedQuestions.map((q, i) => (
            <div key={getQuestionId(q, i)} className="space-y-1.5">
              <Label>
                <span className="mr-1.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                  {i + 1}
                </span>
                <span className="flex-1">
                  {q.question_text}
                  {q.is_required && (
                    <span className="ml-1 text-destructive">*</span>
                  )}
                </span>
              </Label>
              {renderField(q, i)}
            </div>
          ))}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={applyMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={applyMutation.isPending}
            className="bg-gradient-teal font-semibold text-accent-foreground"
          >
            {applyMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Submit application
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
