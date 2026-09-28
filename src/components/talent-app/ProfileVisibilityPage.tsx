"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  Activity,
  ArrowLeft,
  Bell,
  CalendarDays,
  Check,
  ChevronRight,
  Eye,
  Globe2,
  Image as ImageIcon,
  Lightbulb,
  MessageCircle,
  Search,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useMyProfile, useUpdateMyProfile } from "@/hooks/use-talent-profile";
import type { PrivacyMode, SectionVisibility, UpdateTalentProfilePayload } from "@/lib/api/talent";
import { useAuthStore } from "@/providers/auth-store-provider";
import logoImage from "@/assets/rootin-logo-orange.png";

type IconTone = "violet" | "pink" | "blue" | "orange" | "teal" | "rose" | "purple";
type ContactVisibility = "rootin" | "public";
type PortfolioVisibility = "recruiters" | "hidden";

const DEFAULT_SECTION_VISIBILITY: Required<SectionVisibility> = {
  bio: true,
  skills: true,
  experience: true,
  portfolio: true,
  availability: true,
  location: true,
  physical_attributes: true,
  languages: true,
  accents: true,
  documents: true,
  social_links: true,
};

const toneClasses: Record<IconTone, string> = {
  violet: "bg-[#f0e8ff] text-[#6428f5]",
  pink: "bg-[#ffe5f5] text-[#db2498]",
  blue: "bg-[#e4efff] text-[#2862d8]",
  orange: "bg-[#fff0e6] text-[#ed6a21]",
  teal: "bg-[#ddf8f2] text-[#079b88]",
  rose: "bg-[#ffe6f0] text-[#e63d94]",
  purple: "bg-[#eee6ff] text-[#7434eb]",
};

const presets: {
  value: string;
  title: string;
  description: string;
  icon: LucideIcon;
  mode: PrivacyMode;
  sections: Partial<Required<SectionVisibility>>;
}[] = [
  {
    value: "maximum",
    title: "Maximum Exposure",
    description: "Be visible to everyone for more opportunities.",
    icon: Globe2,
    mode: "public",
    sections: DEFAULT_SECTION_VISIBILITY,
  },
  {
    value: "recruiter",
    title: "Recruiter Only",
    description: "Visible only to verified recruiters and agencies.",
    icon: UsersRound,
    mode: "recruiters_only",
    sections: DEFAULT_SECTION_VISIBILITY,
  },
  {
    value: "limited",
    title: "Limited Visibility",
    description: "Keep a low profile while exploring opportunities.",
    icon: Eye,
    mode: "recruiters_only",
    sections: { ...DEFAULT_SECTION_VISIBILITY, portfolio: false, social_links: false },
  },
  {
    value: "private",
    title: "Private Mode",
    description: "Hide from search and most recruiters.",
    icon: Eye,
    mode: "private",
    sections: { ...DEFAULT_SECTION_VISIBILITY, portfolio: false, social_links: false },
  },
];

function SettingIcon({ icon: Icon, tone }: { icon: LucideIcon; tone: IconTone }) {
  return (
    <span className={`grid size-11 shrink-0 place-items-center rounded-full sm:size-12 ${toneClasses[tone]}`}>
      <Icon className="size-[21px]" strokeWidth={2.1} />
    </span>
  );
}

function SettingCard({
  icon,
  tone,
  title,
  description,
  children,
  helper,
  className = "",
}: {
  icon: LucideIcon;
  tone: IconTone;
  title: string;
  description: string;
  children: ReactNode;
  helper?: React.ReactNode;
  className?: string;
}) {
  return (
    <article className={`rounded-[20px] border border-[#e7e5f4] bg-white p-4 shadow-[0_8px_24px_rgba(81,58,166,0.06)] sm:p-5 ${className}`}>
      <div className="flex items-start gap-3 sm:gap-4">
        <SettingIcon icon={icon} tone={tone} />
        <div className="min-w-0 flex-1">
          <h2 className="text-[16px] font-bold leading-5 tracking-[-0.02em] text-[#12143a] sm:text-[17px]">{title}</h2>
          <p className="mt-1 max-w-[620px] text-[13px] leading-[1.45] text-[#62678a] sm:text-sm">{description}</p>
          {helper}
        </div>
        <div className="shrink-0 pt-0.5">{children}</div>
      </div>
    </article>
  );
}

function Toggle({ checked, onCheckedChange, label }: { checked: boolean; onCheckedChange: (checked: boolean) => void; label: string }) {
  return (
    <Switch
      checked={checked}
      onCheckedChange={onCheckedChange}
      aria-label={label}
      className="h-6 w-11 rounded-full bg-[#e5e3ef] data-[state=checked]:bg-[#6428f5] [&_[data-slot=switch-thumb]]:size-5 [&_[data-slot=switch-thumb]]:bg-white [&_[data-slot=switch-thumb]]:shadow-[0_2px_5px_rgba(40,22,115,0.2)]"
    />
  );
}

function getPreset(mode: PrivacyMode, sections: Required<SectionVisibility>) {
  if (mode === "private") return "private";
  if (mode === "recruiters_only" && !sections.portfolio && !sections.social_links) return "limited";
  if (mode === "recruiters_only") return "recruiter";
  return "maximum";
}

export function ProfileVisibilityPage() {
  const user = useAuthStore((state) => state.user);
  const profileQuery = useMyProfile();
  const updateProfile = useUpdateMyProfile();
  const profile = profileQuery.data;
  const [draft, setDraft] = useState<{
    mode: PrivacyMode;
    sections: Required<SectionVisibility>;
    contact: ContactVisibility;
    portfolio: PortfolioVisibility;
  } | null>(null);

  if (profileQuery.isLoading || !profile) {
    return <div className="min-h-svh bg-[#fafaff]" aria-label="Loading profile visibility" />;
  }

  const sections = draft?.sections ?? { ...DEFAULT_SECTION_VISIBILITY, ...profile.section_visibility };
  const mode = draft?.mode ?? profile.privacy_mode ?? "public";
  const socialLinks = profile.social_links ?? {};
  const contact = draft?.contact ?? (Object.values(socialLinks).some((value) => value.visibility === "public") ? "public" : "rootin");
  const portfolio = draft?.portfolio ?? (sections.portfolio ? "recruiters" : "hidden");
  const activePreset = getPreset(mode, sections);
  const displayName = profile.full_legal_name || user?.username || "Talent";
  const initials = displayName.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  function updateDraft(patch: Partial<NonNullable<typeof draft>>) {
    setDraft((current) => ({
      mode: current?.mode ?? mode,
      sections: current?.sections ?? sections,
      contact: current?.contact ?? contact,
      portfolio: current?.portfolio ?? portfolio,
      ...patch,
    }));
  }

  function updateSection(key: keyof SectionVisibility, value: boolean) {
    updateDraft({ sections: { ...sections, [key]: value } });
  }

  function applyPreset(value: string) {
    const preset = presets.find((item) => item.value === value);
    if (!preset) return;
    updateDraft({
      mode: preset.mode,
      sections: { ...sections, ...preset.sections },
      portfolio: preset.sections.portfolio === false ? "hidden" : "recruiters",
    });
  }

  function saveChanges() {
    const nextSocialLinks = Object.fromEntries(
      Object.entries(socialLinks).map(([key, value]) => [
        key,
        { ...value, visibility: contact === "rootin" ? "recruiters_only" : "public" },
      ]),
    );
    const payload: UpdateTalentProfilePayload = {
      privacy_mode: mode,
      section_visibility: sections,
      social_links: nextSocialLinks,
    };
    updateProfile.mutate(payload, {
      onSuccess: () => {
        setDraft(null);
        toast.success("Visibility settings saved");
      },
      onError: () => toast.error("Could not save visibility settings"),
    });
  }

  return (
    <div className="min-h-svh bg-[#fafaff] text-[#12143a]">
      <div className="mx-auto w-full max-w-[1240px] px-4 pb-32 pt-4 sm:px-6 sm:pt-5 lg:px-8 lg:pb-8">
        <header className="flex items-center justify-between">
          <Link href="/talent/dashboard" className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6428f5]" aria-label="Rootin home">
            <Image src={logoImage} alt="Rootin" priority className="h-10 w-auto object-contain sm:h-12" style={{ filter: "hue-rotate(200deg) saturate(1.35)" }} />
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button asChild variant="ghost" size="icon" className="relative size-10 rounded-full text-[#12143a] hover:bg-white sm:size-11" aria-label="Notifications">
              <Link href="/talent/notifications"><Bell className="size-5 sm:size-6" strokeWidth={1.9} /></Link>
            </Button>
            <Link href="/talent/profile" aria-label="Open profile" className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6428f5]">
              <Avatar className="size-10 border-2 border-white bg-[#eee8ff] shadow-[0_5px_18px_rgba(95,66,180,0.13)] sm:size-12">
                <AvatarImage src={profile.profile_photo} alt={`${displayName} profile photo`} />
                <AvatarFallback className="bg-[#eee8ff] text-xs font-bold text-[#7131e9]">{initials || "ME"}</AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </header>

        <main className="mt-5 sm:mt-7">
          <section className="relative min-h-[146px] overflow-hidden sm:min-h-[190px]">
            <div className="relative z-10 max-w-[590px] pt-3 sm:pt-7">
              <Link href="/talent/settings" className="mb-4 inline-flex items-center gap-1 text-xs font-semibold text-[#6428f5] hover:text-[#4f18d3] sm:mb-5 sm:text-sm">
                <ArrowLeft className="size-4" /> Settings
              </Link>
              <h1 className="max-w-[280px] text-[29px] font-bold leading-[1.02] tracking-[-0.045em] text-[#12143a] sm:max-w-none sm:text-[36px]">Profile Visibility</h1>
              <p className="mt-2 max-w-[330px] text-[14px] leading-5 text-[#62678a] sm:max-w-[440px] sm:text-[16px] sm:leading-6">You&apos;re in control. Choose what to show and who can see it.</p>
            </div>
            <Image src="/assets/talent-edit/talent-visible-header.png" alt="Visibility creates opportunity" width={700} height={400} priority className="absolute -right-8 bottom-[-10px] z-0 h-[155px] w-[67%] object-contain object-right-bottom sm:-right-4 sm:bottom-[-14px] sm:h-[210px] sm:w-[48%]" />
          </section>

          <div className="grid gap-7 lg:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.8fr)] lg:items-start">
            <section className="space-y-3" aria-labelledby="visibility-controls">
              <div className="mb-1 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#8a85a8]">Your controls</p>
                  <h2 id="visibility-controls" className="mt-1 text-[20px] font-bold tracking-[-0.03em] text-[#12143a]">Visibility settings</h2>
                </div>
                <span className="hidden rounded-full bg-[#f1eaff] px-3 py-1 text-xs font-semibold text-[#6428f5] sm:inline-flex">Private controls</span>
              </div>

              <SettingCard icon={Globe2} tone="violet" title="Public Profile" description="Allow your profile to be visible to everyone on the web. A public profile helps you get discovered outside Rootin." helper={<div className="mt-2 flex flex-wrap items-center gap-2"><Badge className="border-0 bg-[#e4fff4] px-2.5 py-1 text-[11px] font-bold text-[#079653]">Recommended</Badge><span className="text-xs text-[#777394]">Increases your chances of getting noticed.</span></div>}>
                <Toggle checked={mode === "public"} onCheckedChange={(checked) => updateDraft({ mode: checked ? "public" : "recruiters_only" })} label="Make profile public" />
              </SettingCard>
              <SettingCard icon={UsersRound} tone="pink" title="Recruiter Discoverability" description="Show your profile to verified recruiters, agencies and production houses on Rootin.">
                <Toggle checked={mode !== "private"} onCheckedChange={(checked) => updateDraft({ mode: checked ? "recruiters_only" : "private" })} label="Allow recruiter discovery" />
              </SettingCard>
              <SettingCard icon={Search} tone="blue" title="Search Visibility" description="Allow your profile to appear in search results based on your skills, location and categories.">
                <Toggle checked={mode !== "private"} onCheckedChange={(checked) => updateDraft({ mode: checked ? "recruiters_only" : "private" })} label="Show profile in search" />
              </SettingCard>
              <SettingCard icon={CalendarDays} tone="orange" title="Availability Visibility" description="Show your current availability so relevant opportunities know when to reach out.">
                <Toggle checked={sections.availability} onCheckedChange={(checked) => updateSection("availability", checked)} label="Show availability" />
              </SettingCard>
              <SettingCard icon={MessageCircle} tone="teal" title="Contact Visibility" description="Control how recruiters can contact you. Keep personal contact details private while staying reachable.">
                <Select value={contact} onValueChange={(value) => updateDraft({ contact: value as ContactVisibility })}>
                  <SelectTrigger className="h-10 w-[150px] rounded-xl border-[#e0dcf2] bg-white px-3 text-[12px] font-semibold text-[#12143a] shadow-none sm:w-[185px] sm:text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent className="border-[#e7e5f4] bg-white text-[#12143a]"><SelectItem value="rootin">RootIn Messages Only</SelectItem><SelectItem value="public">RootIn + public links</SelectItem></SelectContent>
                </Select>
              </SettingCard>
              <SettingCard icon={ImageIcon} tone="rose" title="Portfolio Visibility" description="Choose who can view your photos, videos and showreel on your profile.">
                <Select value={portfolio} onValueChange={(value) => { const next = value as PortfolioVisibility; updateDraft({ portfolio: next }); updateSection("portfolio", next === "recruiters"); }}>
                  <SelectTrigger className="h-10 w-[150px] rounded-xl border-[#e0dcf2] bg-white px-3 text-[12px] font-semibold text-[#12143a] shadow-none sm:w-[185px] sm:text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent className="border-[#e7e5f4] bg-white text-[#12143a]"><SelectItem value="recruiters">Visible to Recruiters</SelectItem><SelectItem value="hidden">Hidden from profile</SelectItem></SelectContent>
                </Select>
              </SettingCard>
              <SettingCard icon={Activity} tone="purple" title="Activity Status" description="Show when you were last active on Rootin, helping recruiters know when to reach out.">
                <Toggle checked={sections.availability} onCheckedChange={(checked) => updateSection("availability", checked)} label="Show activity status" />
              </SettingCard>

              <section className="rounded-[20px] border border-[#e7e5f4] bg-white p-4 shadow-[0_8px_24px_rgba(81,58,166,0.05)] sm:p-5">
                <div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#fff1d9] text-[#ed971e]"><Lightbulb className="size-5" fill="currentColor" /></span><div><h2 className="text-[17px] font-bold text-[#12143a]">Visibility Presets</h2><p className="mt-1 text-xs leading-5 text-[#62678a]">Quickly apply recommended settings.</p></div></div>
                <div className="no-scrollbar -mx-1 mt-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 pb-1 lg:grid lg:grid-cols-2 lg:overflow-visible">
                  {presets.map((preset) => {
                    const selected = activePreset === preset.value;
                    const PresetIcon = preset.icon;
                    return <button key={preset.value} type="button" onClick={() => applyPreset(preset.value)} className={`relative min-w-[142px] snap-start rounded-2xl border p-3 text-left transition-all lg:min-w-0 ${selected ? "border-[#6428f5] bg-[#f4efff] shadow-[0_5px_16px_rgba(100,40,245,0.13)]" : "border-[#e7e5f4] bg-white hover:border-[#c9b6ff]"}`}><span className={`mb-3 grid size-8 place-items-center rounded-xl ${selected ? "bg-[#6428f5] text-white" : "bg-[#f1eaff] text-[#6428f5]"}`}><PresetIcon className="size-4" /></span>{selected && <span className="absolute right-2 top-2 grid size-5 place-items-center rounded-full bg-[#6428f5] text-white"><Check className="size-3.5" strokeWidth={3} /></span>}<span className="block text-[12px] font-bold leading-4 text-[#12143a]">{preset.title}</span><span className="mt-1 block text-[11px] leading-4 text-[#777394]">{preset.description}</span></button>;
                  })}
                </div>
              </section>
            </section>

            <aside className="space-y-4">
              <Link href="/talent/profile/preview" className="flex items-center gap-3 rounded-[20px] border border-[#e7e5f4] bg-white p-4 shadow-[0_8px_24px_rgba(81,58,166,0.05)] transition hover:border-[#c9b6ff] sm:p-5"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#e4efff] text-[#2862d8]"><Eye className="size-5" /></span><span className="min-w-0 flex-1"><span className="block text-[15px] font-bold text-[#12143a]">Recruiter View Preview</span><span className="mt-1 block text-xs text-[#62678a]">See how your profile appears to recruiters.</span></span><ChevronRight className="size-5 shrink-0 text-[#6428f5]" /></Link>

              <section className="rounded-[20px] border border-[#e7e5f4] bg-[#fbf9ff] p-4 sm:p-5"><div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-full bg-[#f1eaff] text-[#6428f5]"><Lightbulb className="size-4" /></span><h2 className="text-[17px] font-bold text-[#12143a]">Tips for Better Visibility</h2></div><ul className="mt-4 space-y-3">{["Keep your profile information up to date.", "Add a high-quality showreel and photos.", "Mark your availability to attract relevant opportunities.", "Respond to messages promptly.", "Maintain a complete profile for higher search ranking."].map((tip) => <li key={tip} className="flex items-start gap-2 text-[13px] leading-5 text-[#62678a]"><Check className="mt-0.5 size-4 shrink-0 rounded-full bg-[#6428f5] p-0.5 text-white" strokeWidth={3} />{tip}</li>)}</ul></section>
            </aside>
          </div>

          <section className="relative mt-7 overflow-hidden rounded-[20px] border border-[#e7dafa] bg-gradient-to-r from-[#f0e5ff] via-[#f8e7ff] to-[#ffeaf6] shadow-[0_8px_24px_rgba(81,58,166,0.06)]"><Image src="/assets/talent-edit/talent-visible-bottom.png" alt="Be Seen. Be Cast." width={1000} height={300} className="h-auto min-h-[106px] w-full object-contain object-right sm:min-h-0" /></section>
        </main>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#e7e5f4] bg-white/90 px-4 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-3 backdrop-blur-xl md:static md:border-0 md:bg-transparent md:px-0 md:pb-0 md:pt-0">
        <div className="mx-auto max-w-[1240px] sm:px-6 lg:px-8"><Button type="button" onClick={saveChanges} disabled={updateProfile.isPending} className="h-14 w-full rounded-2xl bg-gradient-to-r from-[#5420ed] to-[#8b39f2] text-[16px] font-bold text-white shadow-[0_10px_24px_rgba(100,40,245,0.25)] hover:brightness-105 md:ml-auto md:mt-5 md:h-12 md:w-auto md:min-w-[190px] md:px-8">{updateProfile.isPending ? "Saving..." : "Save Changes"}</Button></div>
      </div>
    </div>
  );
}
