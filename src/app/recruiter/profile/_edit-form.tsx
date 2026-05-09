"use client";

import { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, Pencil, X } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RecruiterCard } from "@/components/recruiter-card";
import { recruiterApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import {
  updateRecruiterProfileSchema,
  type UpdateRecruiterProfileInput,
  type RecruiterProfile,
} from "@/lib/validations/recruiter-profile.schema";
import {
  COMPANY_SIZE_OPTIONS,
  INDUSTRY_OPTIONS,
  POSITION_OPTIONS,
  dynamicOptions,
} from "@/lib/recruiter-profile/options";
import {
  DEFAULT_VALUES,
  hydrateFromServer,
  buildPayload,
} from "@/lib/recruiter-profile/form-helpers";

interface EditFormProps {
  profile: RecruiterProfile | null;
  onSaved: (profile: RecruiterProfile) => void;
  onCancel: () => void;
}

const SECTION_IDS = ["company", "details", "role"];

/* ------------------------------------------------------------------ */
/*  Hooks                                                              */
/* ------------------------------------------------------------------ */

function useActiveSection(ids: string[]) {
  const [activeId, setActiveId] = useState(ids[0] ?? "");
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-15% 0px -70% 0px" }
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [ids]);
  return activeId;
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function FormSection({
  id,
  title,
  children,
  defaultOpen = true,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div id={id} className="scroll-mt-28">
      <Card className="p-5 sm:p-6">
        <Collapsible open={open} onOpenChange={setOpen}>
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="w-full flex items-center justify-between"
            >
              <h2 className="text-base font-semibold text-text-primary">{title}</h2>
              <ChevronDown
                className={cn(
                  "w-4 h-4 text-text-tertiary transition-transform duration-200",
                  open && "rotate-180"
                )}
              />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="pt-4">{children}</div>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  );
}

function SectionNav({
  activeId,
  onSelect,
}: {
  activeId: string;
  onSelect: (id: string) => void;
}) {
  const items = [
    { id: "company", label: "Company" },
    { id: "details", label: "Details" },
    { id: "role", label: "Your Role" },
  ];
  return (
    <aside className="hidden lg:block w-36 shrink-0">
      <div className="sticky top-20 space-y-1">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={cn(
              "w-full text-left px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
              activeId === item.id
                ? "bg-brand/10 text-brand"
                : "text-text-secondary hover:bg-muted-bg hover:text-text-primary"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
    </aside>
  );
}

function MobileNav({
  activeId,
  onSelect,
}: {
  activeId: string;
  onSelect: (id: string) => void;
}) {
  const items = [
    { id: "company", label: "Company" },
    { id: "details", label: "Details" },
    { id: "role", label: "Role" },
  ];
  return (
    <div className="lg:hidden sticky top-[53px] z-30 bg-page/95 backdrop-blur border-b border-border -mx-4 px-4 py-2">
      <div
        className="flex gap-1.5 overflow-x-auto pb-0.5"
        style={{ scrollbarWidth: "none" }}
      >
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={cn(
              "shrink-0 px-2.5 py-1 rounded-full text-xs font-medium transition-colors border",
              activeId === item.id
                ? "bg-brand text-white border-brand"
                : "bg-card text-text-secondary border-border"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main                                                               */
/* ------------------------------------------------------------------ */

export function EditForm({ profile, onSaved, onCancel }: EditFormProps) {
  const [saveError, setSaveError] = useState<string | null>(null);

  const form = useForm<UpdateRecruiterProfileInput>({
    resolver: zodResolver(updateRecruiterProfileSchema),
    defaultValues: profile ? hydrateFromServer(profile) : DEFAULT_VALUES,
    mode: "onSubmit",
  });

  const {
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting, isDirty },
  } = form;

  const activeSection = useActiveSection(SECTION_IDS);

  useEffect(() => {
    if (profile) {
      reset(hydrateFromServer(profile));
    }
  }, [profile, reset]);

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const onSubmit = handleSubmit(async (values) => {
    setSaveError(null);
    try {
      const payload = buildPayload(values);
      const saved = await recruiterApi.updateProfile(payload);
      onSaved(saved as RecruiterProfile);
    } catch (err) {
      setSaveError(getApiErrorMessage(err, "Failed to save profile"));
    }
  });

  return (
    <div className="flex gap-6">
      <SectionNav activeId={activeSection} onSelect={scrollTo} />
      <div className="flex-1 min-w-0">
        <MobileNav activeId={activeSection} onSelect={scrollTo} />

        <div className="mb-6">
          <h1 className="text-xl font-bold text-text-primary">Edit your profile</h1>
          <p className="text-sm text-text-tertiary mt-1">
            Keep your company profile up to date so talent can find you.
          </p>
        </div>

        <div className="mb-6">
          <p className="text-xs sm:text-sm text-text-muted mb-3 px-1">
            Preview: how talent sees your company
          </p>
          <RecruiterCard
            profile={(profile ? { ...profile, ...form.watch() } : form.watch()) as RecruiterProfile}
            sample={!profile}
          />
        </div>

        {saveError && (
          <div className="mb-4">
            <Alert variant="destructive">
              <AlertDescription>{saveError}</AlertDescription>
            </Alert>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-5 pb-10">
            {/* COMPANY INFO */}
            <FormSection id="company" title="Company Info">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name="company_name"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} placeholder="e.g. Starlight Productions" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="company_website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} placeholder="example.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="linkedin_company_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LinkedIn Company URL</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} placeholder="https://linkedin.com/company/..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </FormSection>

            {/* COMPANY DETAILS */}
            <FormSection id="details" title="Company Details">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name="company_size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Size</FormLabel>
                      <Select onValueChange={(v) => field.onChange(v || undefined)} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {dynamicOptions(field.value, COMPANY_SIZE_OPTIONS).map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry</FormLabel>
                      <Select onValueChange={(v) => field.onChange(v || undefined)} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {dynamicOptions(field.value, INDUSTRY_OPTIONS).map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </FormSection>

            {/* YOUR ROLE */}
            <FormSection id="role" title="Your Role">
              <FormField
                control={control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Position</FormLabel>
                    <Select onValueChange={(v) => field.onChange(v || undefined)} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {dynamicOptions(field.value, POSITION_OPTIONS).map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FormSection>

            {/* FLOATING SUBMIT BAR */}
            <div className="fixed bottom-16 left-0 right-0 bg-card border-t border-border px-4 py-3 z-30">
              <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
                <div className="min-w-0">
                  {isDirty && (
                    <p className="text-[10px] text-brand font-medium">Unsaved changes</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onCancel}
                    disabled={isSubmitting}
                  >
                    <X className="w-4 h-4 sm:mr-1" strokeWidth={1.5} />
                    <span className="hidden sm:inline">Cancel</span>
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!isDirty}
                    isLoading={isSubmitting}
                  >
                    <Pencil className="w-4 h-4 sm:mr-1" strokeWidth={1.5} />
                    <span className="hidden sm:inline">Save changes</span>
                    <span className="sm:hidden">Save</span>
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
