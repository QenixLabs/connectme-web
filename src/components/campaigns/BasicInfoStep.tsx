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

const ROLE_TYPES = [
  'Lead',
  'Supporting',
  'Background / extra',
  'Voice over',
  'Model',
  'Dancer',
  'Musician',
  'Anchor / host',
];

const INDUSTRIES = [
  'Film',
  'TV / OTT',
  'Commercial / ad',
  'Music video',
  'Theatre',
  'Digital / social',
  'Fashion',
  'Corporate',
];

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="text-sm text-text-secondary">
      {children}
      {required && <span className="text-[#B85C00]"> *</span>}
    </label>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-medium tracking-widest text-text-muted uppercase mt-5 mb-2.5">
      {children}
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
      className="relative bg-muted-bg border border-border rounded-lg px-3 py-2 flex flex-col gap-0.5 cursor-pointer hover:border-[#B85C00]/50 transition-colors"
      onClick={() => inputRef.current?.showPicker?.() || inputRef.current?.click()}
    >
      <div className={`text-[10px] text-text-muted uppercase tracking-wide ${required ? "after:content-['_*'] after:text-[#B85C00]" : ''}`}>
        {label}
      </div>
      <div className="text-sm text-text-primary flex items-center gap-1.5">
        <Calendar className="w-3.5 h-3.5 text-text-muted shrink-0" strokeWidth={1.5} />
        <span className={value ? 'text-text-primary' : 'text-text-muted'}>
          {display}
          {hint && !value && <span className="text-text-muted"> · {hint}</span>}
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
  existingBanner?: { url: string; type: 'image' | 'video'; thumbnail?: string } | null;
}

export function BasicInfoStep({ mediaFile, onMediaChange, existingBanner }: BasicInfoStepProps) {
  const { trigger, watch, setValue } = useFormContext();
  const selectedState = watch('location.state');
  const selectedCity = watch('location.city');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cityOptions = selectedState ? getCitiesForState(selectedState) : [];

  const blurTrigger = (name: string) => () => trigger(name as any);

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
    <div className="flex flex-col gap-2.5">
      <FormField
        name="name"
        render={({ field }) => (
          <FormItem className="flex flex-col gap-1">
            <FieldLabel required>Campaign name</FieldLabel>
            <FormControl>
              <Input placeholder="e.g., Summer commercial casting" {...field} className="text-sm px-2.5 py-2 h-9" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        name="description"
        render={({ field }) => (
          <FormItem className="flex flex-col gap-1">
            <FieldLabel required>Description</FieldLabel>
            <FormControl>
              <Textarea
                placeholder="Describe the project, role, and what you're looking for..."
                className="min-h-[72px] text-sm px-2.5 py-2 resize-y"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-2">
        <FormField
          name="role_type"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1">
              <FieldLabel required>Role type</FieldLabel>
              <Select value={field.value ?? ''} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="text-sm h-9 px-2.5">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {ROLE_TYPES.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="industry"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1">
              <FieldLabel required>Industry</FieldLabel>
              <Select value={field.value ?? ''} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="text-sm h-9 px-2.5">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {INDUSTRIES.map((i) => (
                    <SelectItem key={i} value={i}>{i}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <SectionLabel>Location</SectionLabel>

      <div className="grid grid-cols-2 gap-2">
        <FormField
          name="location.state"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1">
              <FieldLabel required>State</FieldLabel>
              <Select
                value={field.value ?? ''}
                onValueChange={(v) => {
                  field.onChange(v);
                  if (selectedCity && !getCitiesForState(v).includes(selectedCity)) {
                    setValue('location.city', '', { shouldValidate: true });
                  }
                }}
              >
                <FormControl>
                  <SelectTrigger className="text-sm h-9 px-2.5">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
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
            <FormItem className="flex flex-col gap-1">
              <FieldLabel required>City</FieldLabel>
              <Select
                value={field.value ?? ''}
                onValueChange={field.onChange}
                disabled={!selectedState}
              >
                <FormControl>
                  <SelectTrigger className="text-sm h-9 px-2.5">
                    <SelectValue placeholder={selectedState ? 'Select' : 'State first'} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
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

      <div className="grid grid-cols-2 gap-2">
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

      <SectionLabel>Media</SectionLabel>

      <div className="space-y-2">
        {existingBanner && !mediaFile && (
          <div className="relative rounded-xl overflow-hidden aspect-video border border-border w-full max-w-[280px]">
            {existingBanner.type === 'video' ? (
              <video src={existingBanner.url} className="w-full h-full object-cover" controls poster={existingBanner.thumbnail} />
            ) : (
              <img src={existingBanner.url} alt="" className="w-full h-full object-cover" />
            )}
          </div>
        )}

        {mediaFile ? (
          <div className="relative rounded-xl overflow-hidden aspect-video border border-border w-full max-w-[280px]">
            <img
              src={URL.createObjectURL(mediaFile)}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => onMediaChange?.(null)}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <X className="w-3.5 h-3.5" strokeWidth={1.5} />
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
                "flex flex-col items-center justify-center gap-2 w-full max-w-[280px] aspect-video rounded-xl border border-dashed cursor-pointer transition-colors",
                dragOver
                  ? "border-brand bg-brand/5"
                  : "border-border bg-muted-bg/50 hover:bg-muted-bg"
              )}
            >
              <Upload className={cn("w-5 h-5", dragOver ? "text-brand" : "text-text-muted")} strokeWidth={1.5} />
              <span className={cn("text-xs", dragOver ? "text-brand font-medium" : "text-text-secondary")}>
                {dragOver ? "Drop image here" : "Tap or drop image"}
              </span>
            </label>
          </>
        )}
      </div>
    </div>
  );
}
