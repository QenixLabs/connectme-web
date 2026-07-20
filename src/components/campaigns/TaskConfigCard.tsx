'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'motion/react';
import { ClipboardList, Eye, EyeOff, Upload, FileText, X, Download, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { useCampaignTask, useUpsertCampaignTask, useDeleteCampaignTask, useTaskDocument, useUploadTaskDocument, useDeleteTaskDocument } from '@/lib/api/hooks/useCampaignTask';
import { type CampaignTask } from '@/lib/api';

const taskFormSchema = z.object({
  is_enabled: z.boolean(),
  title: z.string().max(200).optional(),
  description: z.string().max(2000).optional(),
  task_type: z.enum(['file_upload', 'text_response']).optional(),
  deadline_days: z.number().min(1).max(90).optional(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-sm font-medium text-ink-soft">
      {children}
    </label>
  );
}

interface TaskConfigCardProps {
  campaignId: string;
}

export function TaskConfigCard({ campaignId }: TaskConfigCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [pendingDoc, setPendingDoc] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: taskResponse, isLoading: isLoadingTask } = useCampaignTask(campaignId);
  const upsertTask = useUpsertCampaignTask();
  const deleteTask = useDeleteCampaignTask();
  const { data: taskDocument } = useTaskDocument(campaignId);
  const uploadDoc = useUploadTaskDocument();
  const deleteDoc = useDeleteTaskDocument();

  const existingTask: CampaignTask | null = taskResponse?.task || null;

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      is_enabled: existingTask?.is_enabled ?? false,
      title: existingTask?.title ?? '',
      description: existingTask?.description ?? '',
      task_type: existingTask?.task_type ?? 'file_upload',
      deadline_days: existingTask?.deadline_days ?? 3,
    },
  });

  const handleSave = async (values: TaskFormValues) => {
    await upsertTask.mutateAsync(
      { campaignId, payload: values },
    );

    if (pendingDoc) {
      uploadDoc.mutate(
        { campaignId, file: pendingDoc },
        {
          onSettled: () => {
            setPendingDoc(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            setIsEditing(false);
          },
        },
      );
    } else {
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    deleteTask.mutate(campaignId, {
      onSuccess: () => {
        setIsEditing(false);
        form.reset({
          is_enabled: false,
          title: '',
          description: '',
          task_type: 'file_upload',
          deadline_days: 3,
        });
      },
    });
  };

  const enableToggle = form.watch('is_enabled');

  if (isLoadingTask) {
    return (
      <div className="border border-border/60 rounded-2xl p-5 bg-card animate-pulse">
        <div className="h-5 w-40 bg-muted rounded mb-3" />
        <div className="h-4 w-64 bg-muted rounded" />
      </div>
    );
  }

  if (!existingTask && !isEditing) {
    return (
      <div className="border border-border/60 rounded-2xl p-5 bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-ink-muted" strokeWidth={1.5} />
            <span className="text-sm font-semibold text-ink">Assignment Task</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-8 rounded-xl border-border/60 bg-card hover:bg-cream-soft text-sm font-medium"
            onClick={() => setIsEditing(true)}
          >
            Configure Task
          </Button>
        </div>
        <p className="text-[13px] text-ink-muted mt-2">
          Assign a task to shortlisted talents. They must complete it for you to review.
        </p>
      </div>
    );
  }

  if (!isEditing && existingTask) {
    return (
      <div className="border border-border/60 rounded-2xl p-5 bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-gold" strokeWidth={1.5} />
            <span className="text-sm font-semibold text-ink">Assignment Task</span>
            {existingTask.is_enabled && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Active
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-xl border-border/60 bg-card hover:bg-cream-soft text-sm font-medium"
              onClick={() => {
                form.reset({
                  is_enabled: existingTask.is_enabled,
                  title: existingTask.title,
                  description: existingTask.description,
                  task_type: existingTask.task_type,
                  deadline_days: existingTask.deadline_days,
                });
                setIsEditing(true);
              }}
            >
              Edit
            </Button>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
          <div>
            <span className="text-[11px] font-medium text-ink-muted uppercase tracking-wide">Title</span>
            <p className="text-sm text-ink mt-0.5 truncate">{existingTask.title}</p>
          </div>
          <div>
            <span className="text-[11px] font-medium text-ink-muted uppercase tracking-wide">Type</span>
            <p className="text-sm text-ink mt-0.5">
              {existingTask.task_type === 'file_upload' ? 'File Upload' : 'Text Response'}
            </p>
          </div>
          <div className="mt-2">
            <span className="text-[11px] font-medium text-ink-muted uppercase tracking-wide">Deadline</span>
            <p className="text-sm text-ink mt-0.5">{existingTask.deadline_days} days after shortlist</p>
          </div>
        </div>
        {existingTask.description && (
          <div className="mt-2">
            <span className="text-[11px] font-medium text-ink-muted uppercase tracking-wide">Instructions</span>
            <p className="text-sm text-ink-soft mt-0.5 line-clamp-2">{existingTask.description}</p>
          </div>
        )}

        {taskDocument && (
          <div className="mt-3 pt-3 border-t border-border/40 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-brand" strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-ink truncate">{taskDocument.name}</p>
              <p className="text-[10px] text-ink-muted">{(taskDocument.size / 1024 / 1024).toFixed(1)} MB</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <a
                href={taskDocument.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted-bg text-ink-muted hover:text-ink transition-colors"
                title="Download"
              >
                <Download className="w-3.5 h-3.5" strokeWidth={1.5} />
              </a>
              <button
                onClick={() => {
                  if (confirm('Remove reference document?')) {
                    deleteDoc.mutate(campaignId);
                  }
                }}
                disabled={deleteDoc.isPending}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-rose-50 text-ink-muted hover:text-rose-600 transition-colors"
                title="Remove"
              >
                <X className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-gold/30 rounded-2xl p-5 bg-card"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSave)} className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-gold" strokeWidth={1.5} />
              <span className="text-sm font-semibold text-ink">Configure Task</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={enableToggle ?? false}
                onChange={(e) => form.setValue('is_enabled', e.target.checked)}
              />
              <div className="w-9 h-5 bg-border/60 peer-checked:bg-brand rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all" />
            </label>
          </div>

          {enableToggle && (
            <>
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-1.5">
                    <FieldLabel>Task title</FieldLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Submit a 2-minute monologue video"
                        {...field}
                        value={field.value ?? ''}
                        className="text-sm h-11 rounded-xl border-border/60 bg-card focus-visible:ring-gold/30"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-1.5">
                    <FieldLabel>Instructions</FieldLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe what the talent needs to do..."
                        className="min-h-[80px] text-sm rounded-xl border-border/60 bg-card resize-y focus-visible:ring-gold/30 placeholder:text-ink-muted/50"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="task_type"
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-1.5">
                      <FieldLabel>Task type</FieldLabel>
                      <Select
                        value={field.value ?? 'file_upload'}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="text-sm h-10 rounded-xl border-border/60 bg-card">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="file_upload">File Upload</SelectItem>
                          <SelectItem value="text_response">Text Response</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deadline_days"
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-1.5">
                      <FieldLabel>Deadline (days)</FieldLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={90}
                          placeholder="3"
                          {...field}
                          onChange={(e) => {
                            const val = e.target.value === '' ? 3 : Number(e.target.value);
                            field.onChange(val);
                          }}
                          value={field.value ?? 3}
                          className="text-sm h-11 rounded-xl border-border/60 bg-card text-center focus-visible:ring-gold/30"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-2">
                <FieldLabel>Reference Script (PDF)</FieldLabel>
                {taskDocument ? (
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-muted-bg/20">
                    <div className="w-9 h-9 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-brand" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-ink truncate">{taskDocument.name}</p>
                      <p className="text-[10px] text-ink-muted">{(taskDocument.size / 1024 / 1024).toFixed(1)} MB</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('Remove reference document?')) {
                          deleteDoc.mutate(campaignId);
                        }
                      }}
                      disabled={deleteDoc.isPending}
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-rose-50 text-ink-muted hover:text-rose-600 transition-colors shrink-0"
                    >
                      <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </button>
                  </div>
                ) : pendingDoc ? (
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-brand/30 bg-brand/5">
                    <div className="w-9 h-9 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
                      <Upload className="w-4 h-4 text-brand" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-ink truncate">{pendingDoc.name}</p>
                      <p className="text-[10px] text-ink-muted">{(pendingDoc.size / 1024 / 1024).toFixed(1)} MB — click Save to upload</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setPendingDoc(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-rose-50 text-ink-muted hover:text-rose-600 transition-colors shrink-0"
                    >
                      <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 w-full p-3 rounded-xl border-2 border-dashed border-border/60 bg-muted-bg/20 hover:border-brand/50 hover:bg-brand/5 transition-colors text-sm text-ink-muted"
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
                    if (file) setPendingDoc(file);
                  }}
                />
              </div>
            </>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 rounded-xl text-sm font-medium text-ink-muted hover:text-ink"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
            {existingTask && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 rounded-xl text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleDelete}
                disabled={deleteTask.isPending}
              >
                Remove Task
              </Button>
            )}
            <Button
              type="submit"
              size="sm"
              className="h-8 rounded-xl text-sm font-medium"
              disabled={upsertTask.isPending}
            >
              {upsertTask.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </Form>
    </motion.div>
  );
}
