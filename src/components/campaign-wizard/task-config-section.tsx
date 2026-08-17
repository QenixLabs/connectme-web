"use client";

import { useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CampaignWizardInput } from "@/lib/validations/campaign-wizard.schema";
import { useTaskDocument, useUploadTaskDocument, useDeleteTaskDocument } from "@/hooks/use-campaign-task";
import { cn } from "@/lib/utils";
import { ClipboardList, Upload, FileText, X, Shield } from "lucide-react";

const DEFAULT_NDA_TEMPLATE = `NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement ("Agreement") is between the Talent ("Recipient") and the Campaign Organizer ("Disclosing Party").

1. CONFIDENTIAL INFORMATION: All task details, project briefs, creative assets, scripts, budgets, timelines, and any other information shared through this campaign constitute Confidential Information.

2. NON-DISCLOSURE: The Recipient agrees not to disclose, share, distribute, or use any Confidential Information for any purpose other than completing the assigned task.

3. NON-COMPETE: The Recipient agrees not to use Confidential Information to compete with or circumvent the Disclosing Party for a period of 1 year.

4. DURATION: This Agreement remains in effect for 2 years from the date of acceptance.

5. BREACH: Unauthorized disclosure or use of Confidential Information may result in legal action, platform suspension, and forfeiture of compensation.

6. RETURN OF MATERIALS: Upon completion or termination, the Recipient agrees to delete or return all Confidential Information upon request.

By accepting, you acknowledge that you have read, understood, and agree to be bound by this Agreement.`;

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-sm font-medium text-foreground/80">{children}</label>
  );
}

export function TaskConfigSection({
  campaignId,
  onPendingDocChange,
}: {
  campaignId?: string | null;
  onPendingDocChange?: (file: File | null) => void;
}) {
  const { control, watch, setValue } = useFormContext<CampaignWizardInput>();
  const hasTask = watch("task") !== undefined;
  const [pendingDoc, setPendingDoc] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: taskDocument } = useTaskDocument(campaignId ?? "");
  const uploadDoc = useUploadTaskDocument();
  const deleteDoc = useDeleteTaskDocument();

  const effectiveCampaignId = campaignId ?? undefined;

  const setPending = (file: File | null) => {
    setPendingDoc(file);
    onPendingDocChange?.(file);
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList
            className="h-4 w-4 text-muted-foreground"
            strokeWidth={1.5}
          />
          <span className="text-sm font-semibold text-foreground">
            Assignment Task
          </span>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={!!hasTask}
            onChange={(e) => {
              if (e.target.checked) {
                setValue(
                  "task",
                  {
                    title: "",
                    description: "",
                    task_type: "file_upload",
                    deadline_days: 3,
                    nda_enabled: false,
                    nda_text: undefined,
                  },
                  { shouldValidate: false },
                );
              } else {
                setValue("task", undefined, { shouldValidate: false });
              }
            }}
          />
          <div className="peer relative h-5 w-9 rounded-full bg-input after:absolute after:start-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-border after:bg-background after:content-[''] after:transition-all peer-checked:bg-accent-teal peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full" />
        </label>
      </div>
      <p className="-mt-3 text-[13px] text-muted-foreground">
        Optionally assign a task to all shortlisted talents. They must complete
        it for you to review.
      </p>

      {hasTask && (
        <div className="space-y-4">
          <FormField
            control={control}
            name="task.title"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-1.5">
                <FieldLabel>Task title</FieldLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Submit a 2-minute monologue video"
                    {...field}
                    value={field.value ?? ""}
                    className="h-11 rounded-xl border-border bg-bg-surface-inset text-sm focus-visible:ring-accent-teal/30"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="task.description"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-1.5">
                <FieldLabel>Instructions</FieldLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe what the talent needs to do..."
                    className="min-h-[100px] resize-y rounded-xl border-border bg-bg-surface-inset text-sm placeholder:text-muted-foreground/60 focus-visible:ring-accent-teal/30"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={control}
              name="task.task_type"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-1.5">
                  <FieldLabel>Task type</FieldLabel>
                  <Select
                    value={field.value ?? "file_upload"}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger className="h-10 rounded-xl border-border bg-bg-surface-inset text-sm">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl border-border bg-card">
                      <SelectItem value="file_upload">
                        File Upload
                      </SelectItem>
                      <SelectItem value="text_response">
                        Text Response
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="task.deadline_days"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-1.5">
                  <FieldLabel>Deadline (days after shortlist)</FieldLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={90}
                      placeholder="3"
                      {...field}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === ""
                            ? undefined
                            : Number(e.target.value),
                        )
                      }
                      value={field.value ?? ""}
                      className="h-11 rounded-xl border-border bg-bg-surface-inset text-center text-sm focus-visible:ring-accent-teal/30"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {effectiveCampaignId ? (
            <div className="space-y-2">
              <FieldLabel>Reference Script (PDF)</FieldLabel>
              {taskDocument ? (
                <div className="flex items-center gap-3 rounded-xl border border-border bg-bg-surface-inset p-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent-teal-bg">
                    <FileText
                      className="size-4 text-accent-teal"
                      strokeWidth={1.5}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-xs font-medium text-foreground">
                      {taskDocument.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {(taskDocument.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("Remove reference document?")) {
                        deleteDoc.mutate(effectiveCampaignId);
                      }
                    }}
                    disabled={deleteDoc.isPending}
                    className="flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </button>
                </div>
              ) : pendingDoc ? (
                <div className="flex items-center gap-3 rounded-xl border border-accent-teal/30 bg-accent-teal/5 p-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent-teal-bg">
                    <Upload
                    className="size-4 text-accent-teal"
                      strokeWidth={1.5}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                  <p className="truncate text-xs font-medium text-foreground">
                      {pendingDoc.name}
                    </p>
                  <p className="text-[10px] text-muted-foreground">
                      {(pendingDoc.size / 1024 / 1024).toFixed(1)} MB — will
                      upload on save
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPending(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full items-center gap-2 rounded-xl border-2 border-dashed border-border bg-bg-surface-inset p-3 text-sm text-muted-foreground transition-colors hover:border-accent-teal/50 hover:bg-accent-teal/5"
                >
                  <Upload className="w-4 h-4" strokeWidth={1.5} />
                  Attach a PDF script or reference material
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setPending(file);
                }}
              />
            </div>
          ) : (
              <p className="text-xs text-muted-foreground/70">
              Save campaign to enable file uploads.
            </p>
          )}

          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield
                  className="h-4 w-4 text-muted-foreground"
                  strokeWidth={1.5}
                />
                <span className="text-sm font-semibold text-foreground">
                  Require NDA
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={!!watch("task.nda_enabled")}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setValue("task.nda_enabled", true, {
                        shouldValidate: false,
                      });
                      setValue("task.nda_text", DEFAULT_NDA_TEMPLATE, {
                        shouldValidate: false,
                      });
                    } else {
                      setValue("task.nda_enabled", false, {
                        shouldValidate: false,
                      });
                      setValue("task.nda_text", undefined, {
                        shouldValidate: false,
                      });
                    }
                  }}
                />
                <div className="peer relative h-5 w-9 rounded-full bg-input after:absolute after:start-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-border after:bg-background after:content-[''] after:transition-all peer-checked:bg-accent-teal peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full" />
              </label>
            </div>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Shortlisted talents must agree to the NDA before viewing the task
              details.
            </p>

            {watch("task.nda_enabled") && (
              <div className="mt-3">
                <FormField
                  control={control}
                  name="task.nda_text"
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-1.5">
                      <FieldLabel>NDA Text</FieldLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter NDA terms..."
                          className="min-h-[200px] resize-y rounded-xl border-border bg-bg-surface-inset font-mono text-xs leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-accent-teal/30"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
