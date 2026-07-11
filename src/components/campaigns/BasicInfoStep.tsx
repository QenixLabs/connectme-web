'use client';

import { useRef, useState, useCallback } from 'react';
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
import { INDIAN_STATES, getCitiesForState } from '@/lib/indian-cities';
import { Upload, X, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

import { PROFESSIONS } from '@/lib/professions';
import { getSpecialtiesForProfession } from '@/lib/profession-fields';
import { TagInput } from '@/components/ui/tag-input';

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="text-sm font-medium text-ink-soft">
      {children}
      {required && <span className="text-rose-500 ml-0.5">*</span>}
    </label>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 pt-2 first:pt-0">
      <div className="h-px flex-1 bg-border/40" />
      <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted shrink-0">
        {children}
      </span>
      <div className="h-px flex-1 bg-border/40" />
    </div>
  );
}

function DateBlock({
  label,
  value,
  required,
  onChange,
  placeholder = 'Select',
  hint,
}: {
  label: string;
  value: string;
  required?: boolean;
  onChange: (val: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const display = value
    ? new Date(value + 'T00:00:00').toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : placeholder;

  return (
    <div
      className="relative bg-card border border-border/60 rounded-xl px-4 py-3 flex flex-col gap-0.5 cursor-pointer hover:border-gold/40 hover:shadow-sm transition-all"
      onClick={() => inputRef.current?.showPicker?.() || inputRef.current?.click()}
    >
      <div className="text-[10px] text-ink-muted uppercase tracking-wider font-semibold">
        {label}
        {required && <span className="text-rose-500 ml-0.5">*</span>}
      </div>
      <div className="text-sm text-ink flex items-center gap-1.5 font-medium">
        <Calendar className="w-3.5 h-3.5 text-ink-muted/60 shrink-0" strokeWidth={1.5} />
        <span className={value ? 'text-ink' : 'text-ink-muted/60'}>
          {display}
          {hint && !value && <span className="text-ink-muted/40"> &middot; {hint}</span>}
        </span>
      </div>
      <input
        ref={inputRef}
        type="date"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
      />
    </div>
  );
}

interface BasicInfoStepProps {
  mediaFile?: File | null;
  onMediaChange?: (file: File | null) => void;
  existingCoverUrl?: string | null;
}

export function BasicInfoStep({ mediaFile, onMediaChange, existingCoverUrl }: BasicInfoStepProps) {
  const { watch, setValue } = useFormContext();
  const selectedRole = watch('role_type');
  const selectedState = watch('location.state');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cityOptions = selectedState ? getCitiesForState(selectedState) : [];

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith('image/')) {
        onMediaChange?.(file);
      }
    },
    [onMediaChange]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <FormField
        name="name"
        render={({ field }) => (
          <FormItem className="flex flex-col gap-1.5">
            <FieldLabel required>Campaign name</FieldLabel>
            <FormControl>
              <Input
                placeholder="e.g., Summer commercial casting"
                {...field}
                className="text-sm h-11 rounded-xl border-border/60 bg-card focus-visible:ring-gold/30 placeholder:text-ink-muted/50"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        name="description"
        render={({ field }) => (
          <FormItem className="flex flex-col gap-1.5">
            <FieldLabel required>Description</FieldLabel>
            <FormControl>
              <Textarea
                placeholder="Describe the project, role, and what you're looking for..."
                className="min-h-[80px] text-sm rounded-xl border-border/60 bg-card resize-y focus-visible:ring-gold/30 placeholder:text-ink-muted/50"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-3">
        <FormField
          name="role_type"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1.5">
              <FieldLabel required>Role type</FieldLabel>
              <Select value={field.value ?? ''} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="text-sm h-11 rounded-xl border-border/60 bg-card">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="rounded-xl">
                  {PROFESSIONS.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

      </div>

      {getSpecialtiesForProfession(selectedRole).length > 0 && (
          <div className="flex flex-col gap-3">
            <SectionLabel>Specialties</SectionLabel>
            <FormField
              name="specialties"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <TagInput
                      value={field.value ?? []}
                      onChange={field.onChange}
                      suggestions={getSpecialtiesForProfession(selectedRole)}
                      placeholder="Add specialties..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

      <SectionLabel>Location</SectionLabel>

      <div className="grid grid-cols-2 gap-3">
        <FormField
          name="location.state"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1.5">
              <FieldLabel required>State</FieldLabel>
              <Select
                value={field.value ?? ''}
                onValueChange={(v) => {
                  field.onChange(v);
                  if (cityOptions.length > 0 && !getCitiesForState(v).includes(watch('location.city') || '')) {
                    setValue('location.city', '', { shouldValidate: true });
                  }
                }}
              >
                <FormControl>
                  <SelectTrigger className="text-sm h-11 rounded-xl border-border/60 bg-card">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="rounded-xl">
                  {INDIAN_STATES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="location.city"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1.5">
              <FieldLabel required>City</FieldLabel>
              <Select
                value={field.value ?? ''}
                onValueChange={field.onChange}
                disabled={!selectedState}
              >
                <FormControl>
                  <SelectTrigger className="text-sm h-11 rounded-xl border-border/60 bg-card">
                    <SelectValue placeholder={selectedState ? 'Select city' : 'State first'} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="rounded-xl">
                  {cityOptions.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <SectionLabel>Timeline</SectionLabel>

      <FormField
        name="dates.start"
        render={({ field }) => (
          <FormItem className="hidden">
            <input type="date" {...field} />
          </FormItem>
        )}
      />
      <FormField
        name="dates.end"
        render={({ field }) => (
          <FormItem className="hidden">
            <input type="date" {...field} />
          </FormItem>
        )}
      />
      <FormField
        name="deadline"
        render={({ field }) => (
          <FormItem className="hidden">
            <input type="date" {...field} />
          </FormItem>
        )}
      />

      <div className="space-y-3">
      <div className="space-y-3">
          <DateBlock
            label="Start date"
            value={watch('dates.start') || ''}
            onChange={(val) => {
              setValue('dates.start', val, { shouldValidate: true });
              if (val && !watch('deadline')) {
                const start = new Date(val + 'T00:00:00');
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const deadline = new Date(start);
                deadline.setDate(deadline.getDate() - 3);
                if (deadline < today) {
                  deadline.setTime(today.getTime());
                }
                setValue('deadline', deadline.toISOString().slice(0, 10), { shouldValidate: false });
              }
            }}
          />
          <DateBlock
            label="End date"
            value={watch('dates.end') || ''}
            onChange={(val) => setValue('dates.end', val, { shouldValidate: true })}
          />
        </div>
        <DateBlock
          label="Application deadline"
          value={watch('deadline') || ''}
          required
          onChange={(val) => setValue('deadline', val, { shouldValidate: true })}
          hint="auto-fills 3 days before start"
        />
      </div>

      <SectionLabel>Media</SectionLabel>

      <div className="space-y-3">
        {existingCoverUrl && !mediaFile && (
          <div className="relative rounded-xl overflow-hidden aspect-video border border-border/60 w-full max-w-[320px] shadow-luxe">
            <img src={existingCoverUrl} alt="" className="w-full h-full object-cover" />
          </div>
        )}

        {mediaFile ? (
          <div className="relative rounded-xl overflow-hidden aspect-video border border-border/60 w-full max-w-[320px] shadow-luxe">
            <img
              src={URL.createObjectURL(mediaFile)}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => onMediaChange?.(null)}
              className="absolute top-2 right-2 p-2 rounded-lg bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm transition-colors"
            >
              <X className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        ) : (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onMediaChange?.(file);
                e.target.value = '';
              }}
              className="hidden"
              id="campaign-media-upload"
            />
            <label
              htmlFor="campaign-media-upload"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              className={cn(
                "flex flex-col items-center justify-center gap-3 w-full max-w-[320px] aspect-video rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200",
                dragOver
                  ? "border-gold bg-gold-soft/50"
                  : "border-border/60 bg-muted-bg/40 hover:border-gold/40 hover:bg-muted-bg",
              )}
            >
              <div className={cn(
                "rounded-full p-2.5 transition-colors",
                dragOver ? "bg-gold/10" : "bg-muted-bg",
              )}>
                <Upload className={cn("w-5 h-5", dragOver ? "text-gold" : "text-ink-muted")} strokeWidth={1.5} />
              </div>
              <span className={cn("text-sm font-medium", dragOver ? "text-gold-ink" : "text-ink-muted")}>
                {dragOver ? "Drop image here" : "Upload cover image"}
              </span>
              <span className="text-xs text-ink-muted/60">PNG, JPG or WebP</span>
            </label>
          </>
        )}
      </div>
    </div>
  );
}
