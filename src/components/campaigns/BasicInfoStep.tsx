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
import { INDIAN_STATES, getCitiesForState } from '@/lib/indian-cities';
import { Upload, X } from 'lucide-react';

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

interface BasicInfoStepProps {
  mediaFile?: File | null;
  onMediaChange?: (file: File | null) => void;
  existingMedia?: { url: string; type: string; caption?: string } | null;
}

export function BasicInfoStep({ mediaFile, onMediaChange, existingMedia }: BasicInfoStepProps) {
  const { trigger, watch, setValue } = useFormContext();
  const startDate = watch('dates.start');
  const selectedState = watch('location.state');
  const selectedCity = watch('location.city');

  const cityOptions = selectedState ? getCitiesForState(selectedState) : [];

  const blurTrigger = (name: string) => () => trigger(name as any);

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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <FormField
          name="role_type"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1">
              <FieldLabel required>Role type</FieldLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="text-sm h-9 px-2.5">
                    <SelectValue placeholder="Select role type" />
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
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="text-sm h-9 px-2.5">
                    <SelectValue placeholder="Select industry" />
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <FormField
          name="location.state"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1">
              <FieldLabel required>State</FieldLabel>
              <Select
                value={field.value}
                onValueChange={(v) => {
                  field.onChange(v);
                  if (selectedCity && !getCitiesForState(v).includes(selectedCity)) {
                    setValue('location.city', '', { shouldValidate: true });
                  }
                }}
              >
                <FormControl>
                  <SelectTrigger className="text-sm h-9 px-2.5">
                    <SelectValue placeholder="Select state" />
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
                value={field.value}
                onValueChange={field.onChange}
                disabled={!selectedState}
              >
                <FormControl>
                  <SelectTrigger className="text-sm h-9 px-2.5">
                    <SelectValue placeholder={selectedState ? 'Select city' : 'Select state first'} />
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <FormField
          name="dates.start"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1">
              <FieldLabel>Start date</FieldLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                  onBlur={blurTrigger('dates.start')}
                  onChange={(e) => {
                    field.onChange(e);
                    const val = e.target.value;
                    if (val && !watch('deadline')) {
                      const d = new Date(val + 'T00:00:00');
                      d.setDate(d.getDate() - 3);
                      setValue('deadline', d.toISOString().slice(0, 10), { shouldValidate: false });
                    }
                  }}
                  className="text-sm px-2.5 py-2 h-9"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="dates.end"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1">
              <FieldLabel>End date</FieldLabel>
              <FormControl>
                <Input type="date" {...field} onBlur={blurTrigger('dates.end')} className="text-sm px-2.5 py-2 h-9" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="deadline"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1">
              <FieldLabel required>Application deadline</FieldLabel>
              <FormControl>
                <Input type="date" {...field} onBlur={blurTrigger('deadline')} className="text-sm px-2.5 py-2 h-9" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <p className="text-[11px] text-text-muted mt-1">Deadline auto-suggests 3 days before start date</p>

      <SectionLabel>Media</SectionLabel>

      <div className="space-y-2">
        {existingMedia && !mediaFile && (
          <div className="relative rounded-xl overflow-hidden aspect-video border border-border w-full max-w-[280px]">
            {existingMedia.type === 'video' ? (
              <video src={existingMedia.url} className="w-full h-full object-cover" controls />
            ) : (
              <img src={existingMedia.url} alt="" className="w-full h-full object-cover" />
            )}
          </div>
        )}

        {mediaFile ? (
          <div className="relative rounded-xl overflow-hidden aspect-video border border-border w-full max-w-[280px]">
            {mediaFile.type.startsWith('video/') ? (
              <video
                src={URL.createObjectURL(mediaFile)}
                className="w-full h-full object-cover"
                controls
              />
            ) : (
              <img
                src={URL.createObjectURL(mediaFile)}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            )}
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
              type="file"
              accept="image/*,video/*"
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
              className="flex flex-col items-center justify-center gap-2 w-full max-w-[280px] aspect-video rounded-xl border border-dashed border-border bg-muted-bg/50 cursor-pointer hover:bg-muted-bg transition-colors"
            >
              <Upload className="w-5 h-5 text-text-muted" strokeWidth={1.5} />
              <span className="text-xs text-text-secondary">Click to upload image or video</span>
            </label>
          </>
        )}
      </div>
    </div>
  );
}
