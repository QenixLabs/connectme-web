"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TagInput } from "@/components/ui/tag-input";
import { CampaignWizardInput } from "@/lib/validations/campaign-wizard.schema";
import { TaskConfigSection } from "./task-config-section";
import { cn } from "@/lib/utils";
import { Plus, Trash2 } from "lucide-react";

const GENDERS = ["Any", "Male", "Female", "Non-binary"];

function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="text-sm font-medium text-zinc-300">
      {children}
      {required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 pt-2 first:pt-0">
      <div className="h-px flex-1 bg-zinc-700/40" />
      <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-zinc-500 shrink-0">
        {children}
      </span>
      <div className="h-px flex-1 bg-zinc-700/40" />
    </div>
  );
}

export function RequirementsStep({
  campaignId,
  onPendingDocChange,
}: {
  campaignId?: string | null;
  onPendingDocChange?: (file: File | null) => void;
}) {
  const { control, watch, setValue } =
    useFormContext<CampaignWizardInput>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "questions",
  });

  const skills = watch("requirements.skills") ?? [];
  const languages = watch("requirements.languages") ?? [];
  const gender = watch("requirements.gender") ?? "";

  return (
    <div className="flex flex-col gap-4">
      <SectionLabel>Skills & languages</SectionLabel>

      <FormField
        control={control}
        name="requirements.skills"
        render={() => (
          <FormItem className="flex flex-col gap-1.5">
            <FieldLabel>Skills</FieldLabel>
            <FormControl>
              <TagInput
                value={skills}
                onChange={(next) =>
                  setValue("requirements.skills", next, {
                    shouldValidate: true,
                  })
                }
                placeholder="e.g., Classical dance, Guitar..."
              />
            </FormControl>
            <p className="text-[11px] text-zinc-500/60">
              Press Enter to add a skill
            </p>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="requirements.languages"
        render={() => (
          <FormItem className="flex flex-col gap-1.5">
            <FieldLabel>Languages</FieldLabel>
            <FormControl>
              <TagInput
                value={languages}
                onChange={(next) =>
                  setValue("requirements.languages", next, {
                    shouldValidate: true,
                  })
                }
                placeholder="e.g., Hindi, English..."
              />
            </FormControl>
            <p className="text-[11px] text-zinc-500/60">
              Press Enter to add a language
            </p>
            <FormMessage />
          </FormItem>
        )}
      />

      <SectionLabel>Talent profile</SectionLabel>

      <FormField
        control={control}
        name="requirements.gender"
        render={() => (
          <FormItem className="flex flex-col gap-1.5">
            <FieldLabel>Gender preference</FieldLabel>
            <FormControl>
              <div className="flex flex-wrap gap-2">
                {GENDERS.map((g) => {
                  const selected =
                    gender === g || (!gender && g === "Any");
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() =>
                        setValue(
                          "requirements.gender",
                          g === "Any" ? "" : g,
                          { shouldValidate: true },
                        )
                      }
                      className={cn(
                        "px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200",
                        selected
                          ? "bg-zinc-100 text-zinc-900 border-zinc-100 shadow-sm"
                          : "bg-zinc-900/50 text-zinc-400 border-zinc-700/50 hover:border-zinc-600 hover:text-zinc-200",
                      )}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-3">
        <FormField
          name="requirements.age_range.min"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1.5">
              <FieldLabel>Min age</FieldLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  placeholder="18"
                  {...field}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === ""
                        ? undefined
                        : Number(e.target.value),
                    )
                  }
                  value={field.value ?? ""}
                  className="text-sm h-11 rounded-xl border-zinc-700/50 bg-zinc-900/50 text-center focus-visible:ring-teal-500/30"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="requirements.age_range.max"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1.5">
              <FieldLabel>Max age</FieldLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  placeholder="65"
                  {...field}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === ""
                        ? undefined
                        : Number(e.target.value),
                    )
                  }
                  value={field.value ?? ""}
                  className="text-sm h-11 rounded-xl border-zinc-700/50 bg-zinc-900/50 text-center focus-visible:ring-teal-500/30"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <SectionLabel>Budget</SectionLabel>

      <div className="grid grid-cols-2 gap-3">
        <FormField
          name="budget_range.min"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1.5">
              <FieldLabel>Min (&#8377;)</FieldLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="0"
                  {...field}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === ""
                        ? undefined
                        : Number(e.target.value),
                    )
                  }
                  value={field.value ?? ""}
                  className="text-sm h-11 rounded-xl border-zinc-700/50 bg-zinc-900/50 focus-visible:ring-teal-500/30"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="budget_range.max"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1.5">
              <FieldLabel>Max (&#8377;)</FieldLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="0"
                  {...field}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === ""
                        ? undefined
                        : Number(e.target.value),
                    )
                  }
                  value={field.value ?? ""}
                  className="text-sm h-11 rounded-xl border-zinc-700/50 bg-zinc-900/50 focus-visible:ring-teal-500/30"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <SectionLabel>Other requirements</SectionLabel>

      <FormField
        name="requirements.attributes"
        render={({ field }) => (
          <FormItem className="flex flex-col gap-1.5">
            <FormControl>
              <Textarea
                placeholder="Any specific attributes, equipment, availability, or other requirements..."
                className="min-h-[80px] text-sm rounded-xl border-zinc-700/50 bg-zinc-900/50 resize-y focus-visible:ring-teal-500/30 placeholder:text-zinc-500/50"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <SectionLabel>Assignment task</SectionLabel>

      <TaskConfigSection
        campaignId={campaignId}
        onPendingDocChange={onPendingDocChange}
      />

      <SectionLabel>Custom application questions</SectionLabel>

      <div className="space-y-3">
        {fields.map((field, index) => {
          const qType =
            watch(`questions.${index}.question_type`) ?? "text";
          const options = watch(`questions.${index}.options`) ?? [];
          return (
            <div
              key={field.id}
              className="border border-zinc-700/50 rounded-2xl p-4 space-y-3 bg-zinc-900/50"
            >
              <div className="flex items-start gap-3">
                <span className="text-xs font-bold text-zinc-500 mt-3 min-w-[20px]">
                  {index + 1}.
                </span>
                <div className="flex-1 space-y-3">
                  <FormField
                    control={control}
                    name={`questions.${index}.question_text`}
                    render={({ field }) => (
                      <FormItem className="flex flex-col gap-1.5">
                        <FormControl>
                          <Input
                            placeholder="Enter your question..."
                            {...field}
                            className="text-sm h-11 rounded-xl border-zinc-700/50 bg-zinc-900/50 focus-visible:ring-teal-500/30"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={control}
                      name={`questions.${index}.question_type`}
                      render={({ field }) => (
                        <FormItem className="flex flex-col gap-1.5">
                          <FieldLabel>Type</FieldLabel>
                          <div className="flex flex-col gap-1.5">
                            <select
                              value={field.value}
                              onChange={(e) => {
                                field.onChange(e.target.value);
                                if (
                                  e.target.value !== "select" &&
                                  e.target.value !== "multiselect"
                                ) {
                                  setValue(
                                    `questions.${index}.options`,
                                    [],
                                    { shouldValidate: false },
                                  );
                                }
                              }}
                              className="text-sm h-10 rounded-xl border border-zinc-700/50 bg-zinc-900/50 px-3 text-zinc-100"
                            >
                              <option value="text">Text</option>
                              <option value="number">Number</option>
                              <option value="select">Select</option>
                              <option value="multiselect">
                                Multi-select
                              </option>
                              <option value="boolean">Yes / No</option>
                            </select>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex items-end pb-1">
                      <FormField
                        control={control}
                        name={`questions.${index}.is_required`}
                        render={({ field }) => (
                          <FormItem className="flex items-center gap-2.5">
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={(e) =>
                                  field.onChange(e.target.checked)
                                }
                                className="w-4 h-4 rounded accent-teal-500"
                              />
                            </FormControl>
                            <label className="text-sm text-zinc-300 font-medium">
                              Required
                            </label>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {(qType === "select" || qType === "multiselect") && (
                    <FormField
                      control={control}
                      name={`questions.${index}.options`}
                      render={() => (
                        <FormItem className="flex flex-col gap-1.5">
                          <FieldLabel>Options</FieldLabel>
                          <FormControl>
                            <TagInput
                              value={options}
                              onChange={(next) =>
                                setValue(
                                  `questions.${index}.options`,
                                  next,
                                  { shouldValidate: true },
                                )
                              }
                              placeholder="Add options..."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                <button
                  type="button"
                  className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg mt-1 shrink-0 p-1 transition-colors"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          );
        })}

        <button
          type="button"
          className="w-full h-11 text-sm font-medium rounded-xl border-2 border-dashed border-zinc-700/50 hover:border-teal-500/50 hover:bg-teal-500/5 transition-all text-zinc-400 flex items-center justify-center gap-2"
          onClick={() =>
            append({
              question_text: "",
              question_type: "text",
              options: [],
              is_required: false,
              order: fields.length,
            })
          }
        >
          <Plus className="w-4 h-4" strokeWidth={1.5} />
          Add Question
        </button>
      </div>
    </div>
  );
}
