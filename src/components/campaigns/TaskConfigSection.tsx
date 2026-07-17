'use client';

import { useFormContext } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CampaignWizardInput } from '@/lib/validations/campaign-wizard.schema';
import { ClipboardList } from 'lucide-react';

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-sm font-medium text-ink-soft">
      {children}
    </label>
  );
}

export function TaskConfigSection() {
  const { control, watch, setValue } = useFormContext<CampaignWizardInput>();
  const hasTask = watch('task') !== undefined && watch('task.title');

  return (
    <div className="flex flex-col gap-4 border border-border/60 rounded-2xl p-5 bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-ink-muted" strokeWidth={1.5} />
          <span className="text-sm font-semibold text-ink">Assignment Task</span>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={!!hasTask}
            onChange={(e) => {
              if (e.target.checked) {
                setValue('task', {
                  title: '',
                  description: '',
                  task_type: 'file_upload',
                  deadline_days: 3,
                }, { shouldValidate: false });
              } else {
                setValue('task', undefined, { shouldValidate: false });
              }
            }}
          />
          <div className="w-9 h-5 bg-border/60 peer-checked:bg-brand rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all" />
        </label>
      </div>
      <p className="text-[13px] text-ink-muted -mt-3">
        Optionally assign a task to all shortlisted talents. They must complete it for you to review.
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
                    value={field.value ?? ''}
                    className="text-sm h-11 rounded-xl border-border/60 bg-card focus-visible:ring-gold/30"
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
                    className="min-h-[100px] text-sm rounded-xl border-border/60 bg-card resize-y focus-visible:ring-gold/30 placeholder:text-ink-muted/50"
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
              control={control}
              name="task.task_type"
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
                      onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                      value={field.value ?? ''}
                      className="text-sm h-11 rounded-xl border-border/60 bg-card text-center focus-visible:ring-gold/30"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      )}
    </div>
  );
}
