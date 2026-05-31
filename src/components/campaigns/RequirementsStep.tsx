'use client';

import { useFormContext, useFieldArray } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { TagInput } from '@/components/ui/tag-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { CampaignWizardInput } from '@/lib/validations/campaign-wizard.schema';
import { Plus, Trash2, GripVertical } from 'lucide-react';

const CURRENCIES = ['INR', 'USD', 'EUR'];

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

export function RequirementsStep() {
  const { control, watch, setValue } = useFormContext<CampaignWizardInput>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'questions',
  });

  const skills = watch('requirements.skills') ?? [];
  const languages = watch('requirements.languages') ?? [];
  const isUnpaid = watch('is_unpaid') ?? false;

  return (
    <div className="flex flex-col gap-2.5">
      <SectionLabel>Skills &amp; languages</SectionLabel>

      <FormField
        control={control}
        name="requirements.skills"
        render={() => (
          <FormItem className="flex flex-col gap-1">
            <FieldLabel>Skills</FieldLabel>
            <FormControl>
              <TagInput
                value={skills}
                onChange={(next) => setValue('requirements.skills', next, { shouldValidate: true })}
                placeholder="Type and press Enter"
              />
            </FormControl>
            <p className="text-[11px] text-text-muted mt-0.5">Press Enter to add a skill</p>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="requirements.languages"
        render={() => (
          <FormItem className="flex flex-col gap-1">
            <FieldLabel>Languages</FieldLabel>
            <FormControl>
              <TagInput
                value={languages}
                onChange={(next) => setValue('requirements.languages', next, { shouldValidate: true })}
                placeholder="Type and press Enter"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <SectionLabel>Talent profile</SectionLabel>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <FormField
          name="requirements.gender"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1">
              <FieldLabel>Gender preference</FieldLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="text-sm h-9 px-2.5">
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Any">Any</SelectItem>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Non-binary">Non-binary</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="requirements.age_range.min"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1">
              <FieldLabel>Min age</FieldLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  placeholder="18"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                  value={field.value ?? ''}
                  className="text-sm px-2.5 py-2 h-9"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="requirements.age_range.max"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1">
              <FieldLabel>Max age</FieldLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  placeholder="65"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                  value={field.value ?? ''}
                  className="text-sm px-2.5 py-2 h-9"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <SectionLabel>Budget</SectionLabel>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-end">
        <FormField
          name="budget_range.min"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1">
              <FieldLabel>Min (₹)</FieldLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="0"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                  value={field.value ?? ''}
                  disabled={isUnpaid}
                  className="text-sm px-2.5 py-2 h-9"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="budget_range.max"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1">
              <FieldLabel>Max (₹)</FieldLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="0"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                  value={field.value ?? ''}
                  disabled={isUnpaid}
                  className="text-sm px-2.5 py-2 h-9"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="budget_range.currency"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1">
              <FieldLabel>Currency</FieldLabel>
              <Select value={field.value} onValueChange={field.onChange} disabled={isUnpaid}>
                <FormControl>
                  <SelectTrigger className="text-sm h-9 px-2.5">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        name="is_budget_disclosed"
        render={({ field }) => (
          <FormItem className="flex items-center gap-1.5 mt-1">
            <FormControl>
              <input
                type="checkbox"
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                className="w-3.5 h-3.5 accent-[#B85C00]"
              />
            </FormControl>
            <label className="text-xs text-text-secondary">Budget not disclosed to applicants</label>
          </FormItem>
        )}
      />

      <FormField
        name="is_unpaid"
        render={({ field }) => (
          <FormItem className="flex items-center gap-1.5">
            <FormControl>
              <input
                type="checkbox"
                checked={field.value}
                onChange={(e) => {
                  field.onChange(e.target.checked);
                  if (e.target.checked) {
                    setValue('budget_range.min', undefined, { shouldValidate: false });
                    setValue('budget_range.max', undefined, { shouldValidate: false });
                  }
                }}
                className="w-3.5 h-3.5 accent-[#B85C00]"
              />
            </FormControl>
            <label className="text-xs text-text-secondary">Unpaid / voluntary role</label>
          </FormItem>
        )}
      />

      <SectionLabel>Other requirements</SectionLabel>

      <FormField
        name="requirements.attributes"
        render={({ field }) => (
          <FormItem className="flex flex-col gap-1">
            <FormControl>
              <Textarea
                placeholder="Any specific attributes, equipment, availability, or other requirements..."
                className="min-h-[72px] text-sm px-2.5 py-2 resize-y"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <SectionLabel>Custom application questions</SectionLabel>

      <div className="space-y-3">
        {fields.map((field, index) => {
          const qType = watch(`questions.${index}.question_type`) ?? 'text';
          const options = watch(`questions.${index}.options`) ?? [];
          return (
            <div key={field.id} className="border border-border rounded-xl p-3 space-y-2.5 bg-muted-bg/30">
              <div className="flex items-start gap-2">
                <span className="text-xs text-text-muted mt-2">{index + 1}</span>
                <div className="flex-1 space-y-2">
                  <FormField
                    control={control}
                    name={`questions.${index}.question_text`}
                    render={({ field }) => (
                      <FormItem className="flex flex-col gap-1">
                        <FormControl>
                          <Input
                            placeholder="Enter your question..."
                            {...field}
                            className="text-sm h-9"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <FormField
                      control={control}
                      name={`questions.${index}.question_type`}
                      render={({ field }) => (
                        <FormItem className="flex flex-col gap-1">
                          <Select
                            value={field.value}
                            onValueChange={(val) => {
                              field.onChange(val);
                              if (val !== 'select' && val !== 'multiselect') {
                                setValue(`questions.${index}.options`, [], { shouldValidate: false });
                              }
                            }}
                          >
                            <FormControl>
                              <SelectTrigger className="text-sm h-9">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="text">Text</SelectItem>
                              <SelectItem value="number">Number</SelectItem>
                              <SelectItem value="select">Select</SelectItem>
                              <SelectItem value="multiselect">Multi-select</SelectItem>
                              <SelectItem value="boolean">Yes / No</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex items-center gap-2 h-9">
                      <FormField
                        control={control}
                        name={`questions.${index}.is_required`}
                        render={({ field }) => (
                          <FormItem className="flex items-center gap-1.5">
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={(e) => field.onChange(e.target.checked)}
                                className="w-4 h-4 accent-brand"
                              />
                            </FormControl>
                            <label className="text-sm text-text-secondary">Required</label>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {(qType === 'select' || qType === 'multiselect') && (
                    <FormField
                      control={control}
                      name={`questions.${index}.options`}
                      render={() => (
                        <FormItem className="flex flex-col gap-1">
                          <FormControl>
                            <TagInput
                              value={options}
                              onChange={(next) => setValue(`questions.${index}.options`, next, { shouldValidate: true })}
                              placeholder="Add options..."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="text-error-text hover:bg-error-light shrink-0"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                </Button>
              </div>
            </div>
          );
        })}

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full h-10 text-sm"
          onClick={() => append({ question_text: '', question_type: 'text', options: [], is_required: false, order: fields.length })}
        >
          <Plus className="w-4 h-4 mr-1.5" strokeWidth={1.5} />
          Add Question
        </Button>
      </div>
    </div>
  );
}
