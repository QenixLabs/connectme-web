'use client';

import { useFormContext } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { TagInput } from '@/components/ui/tag-input';
import { CampaignWizardInput } from '@/lib/validations/campaign-wizard.schema';

export function RequirementsStep() {
  const { control, watch, setValue } = useFormContext<CampaignWizardInput>();

  const skills = watch('requirements.skills') ?? [];
  const languages = watch('requirements.languages') ?? [];

  return (
    <div className="space-y-5">
      <FormField
        control={control}
        name="requirements.skills"
        render={() => (
          <FormItem>
            <FormLabel>Skills</FormLabel>
            <FormControl>
              <TagInput
                value={skills}
                onChange={(next) => setValue('requirements.skills', next, { shouldValidate: true })}
                placeholder="Type a skill and press Enter"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="requirements.languages"
        render={() => (
          <FormItem>
            <FormLabel>Languages</FormLabel>
            <FormControl>
              <TagInput
                value={languages}
                onChange={(next) => setValue('requirements.languages', next, { shouldValidate: true })}
                placeholder="Type a language and press Enter"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        name="requirements.gender"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Gender Preference</FormLabel>
            <FormControl>
              <Input placeholder="e.g., Male, Female, Any" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          name="requirements.age_range.min"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Min Age</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="18"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="requirements.age_range.max"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Max Age</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="65"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormField
          name="budget_range.min"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Budget Min</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="0"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="budget_range.max"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Budget Max</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="0"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="budget_range.currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Currency</FormLabel>
              <FormControl>
                <Input placeholder="INR" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        name="requirements.attributes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Other Attributes</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Any specific attributes or requirements..."
                className="min-h-[80px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
