"use client";

import {
  ArrowRight, CalendarDays, Check, ChevronDown, Clapperboard, FileText, MapPin,
  MessageSquare, MoreVertical, Phone, Share2, Sparkles, Star, Trophy,
  UserRoundCheck, Users, Video,
} from "lucide-react";
import Image from "next/image";
import { useState, type ComponentType } from "react";

import campaignHero from "@/assets/campaign/campaign-hero.jpg";
import arjun from "@/assets/campaign/candidate-arjun.jpg";
import karan from "@/assets/campaign/candidate-karan.jpg";
import vivaan from "@/assets/campaign/candidate-vivaan.jpg";
import { Button } from "@/components/ui/button";
import { useCampaign } from "@/hooks/use-campaigns";
import { CandidatesSection } from "@/components/campaign-detail/candidates-section";

const FALLBACK_COVER_IMAGE = "/images/casting/casting-hero.png";

type Icon = ComponentType<{ className?: string }>;

const metrics: Array<[Icon, string, string, string]> = [
  [Users, "342", "Applications", "12%"], [Sparkles, "278", "AI Matches", "18%"],
  [Star, "46", "Shortlisted", "9%"], [Video, "18", "Auditions", "20%"],
];

const pipeline: Array<[Icon, string, string]> = [
  [Users, "342", "Applications"], [FileText, "198", "Review"], [Star, "46", "Shortlist"],
  [Video, "18", "Audition"], [Phone, "8", "Callback"], [Users, "5", "Interview"],
  [FileText, "2", "Offer"], [Trophy, "1", "Hired"],
];

const candidates = [
  { name: "Arjun Mehta", city: "Mumbai", exp: "5 yrs exp", score: 92, image: arjun, tags: ["Acting", "Screen Presence", "Hindi"] },
  { name: "Karan Malhotra", city: "Delhi", exp: "3 yrs exp", score: 88, image: karan, tags: ["Acting", "Dialogue Delivery", "Action"] },
  { name: "Vivaan Singh", city: "Mumbai", exp: "4 yrs exp", score: 85, image: vivaan, tags: ["Drama", "Emotional Range", "Hindi"] },
  { name: "Rohit Verma", city: "Pune", exp: "6 yrs exp", score: 82, image: arjun, tags: ["Action", "Screen Presence", "Fitness"] },
  { name: "Aditya Rao", city: "Bangalore", exp: "4 yrs exp", score: 80, image: karan, tags: ["Drama", "Voice Modulation", "English"] },
];

const activities: Array<[Icon, string, string, string?]> = [
  [Users, "12 new applications received", "2 hours ago"], [Star, "Aarav Sharma was shortlisted", "4 hours ago"],
  [Video, "Audition slot booked with Karan Malhotra", "6 hours ago"], [MessageSquare, "Meera Kapoor commented", "“Great screen presence!” · 8 hours ago", "MK"],
  [Sparkles, "3 new AI matches found", "12 hours ago"], [Clapperboard, "Sanjay Jaiswar updated campaign details", "1 day ago", "SJ"],
  [Video, "Vivaan Singh completed audition", "1 day ago"], [Check, "Campaign status changed to Active", "2 days ago", "SJ"],
];

export function CampaignDashboard({ campaignId }: { campaignId: string }) {
  const { data: campaign } = useCampaign(campaignId);
  const [tab, setTab] = useState("Overview");
  const [notice, setNotice] = useState("");
  const tabs = ["Overview", "Candidates", "Auditions", "Messages", "Team", "Settings"];
  const notify = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(""), 2200); };

  return <main className="min-h-screen bg-background pb-28 text-foreground">
    <section className="overflow-hidden bg-hero-surface text-hero-foreground">
      <div className="mx-auto grid max-w-[1440px] grid-cols-[minmax(0,1fr)_minmax(140px,42%)] items-stretch">
        <div className="relative flex min-w-0 flex-col justify-center px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
          <div className="absolute right-4 top-4 flex items-center gap-2 sm:right-7 sm:top-6">
            <Button variant="hero" size="icon-sm-square" aria-label="Share campaign" onClick={() => notify("Share link copied")}><Share2 className="size-4" /></Button>
            <Button variant="hero" size="icon-sm-square" aria-label="More campaign options"><MoreVertical className="size-4" /></Button>
          </div>
          <div className="max-w-3xl pr-10 sm:pr-14">
            <p className="text-[10px] font-bold tracking-[0.28em] text-hero-foreground/80 sm:text-xs">WEB SERIES</p>
            <h1 className="mt-3 text-2xl font-extrabold leading-tight sm:mt-4 sm:text-4xl lg:text-5xl">Lead Actor — Web Series</h1>
            <p className="mt-3 hidden text-base text-hero-foreground/90 sm:block lg:text-lg">A gripping drama about ambition, power and redemption.</p>
            <div className="mt-5 grid gap-2 text-[11px] sm:mt-7 sm:flex sm:flex-wrap sm:gap-x-6 sm:gap-y-3 sm:text-sm">
              <span className="flex min-w-0 items-center gap-2"><MapPin className="size-4 shrink-0" /><span className="truncate">Mumbai, Maharashtra</span></span>
              <span className="flex min-w-0 items-center gap-2"><CalendarDays className="size-4 shrink-0" /><span className="truncate">Deadline: 30 Sep 2025</span></span>
              <span className="hidden items-center gap-2 sm:flex"><Clapperboard className="size-4 shrink-0" />Production: Web Series</span>
            </div>
            <Button variant="success" size="sm" className="mt-5 w-fit rounded-full sm:mt-7"><Check className="size-4" />Active<ChevronDown className="size-4" /></Button>
          </div>
        </div>
        <div className="flex items-center justify-center bg-card p-2 sm:p-4 lg:p-6">
          {/* Plain img: cover_image_url is a remote API URL whose host isn't always in next/image remotePatterns */}
          <img src={campaign?.cover_image_url || FALLBACK_COVER_IMAGE} alt="Film director holding a megaphone and clapperboard beside a movie camera" width={554} height={554} className="aspect-square w-full object-contain" />
        </div>
      </div>
    </section>

    <div className="mx-auto max-w-[1440px] px-4 lg:px-8">
      <nav aria-label="Campaign sections" className="no-scrollbar -mt-3 flex gap-2 overflow-x-auto rounded-t-2xl bg-card p-4 shadow-card">
        {tabs.map((item) => <Button key={item} variant={tab === item ? "default" : "ghost"} onClick={() => setTab(item)} className="h-11 min-w-[calc((100%-1rem)/3)] flex-none">{item}</Button>)}
      </nav>

      <section aria-label="Campaign metrics" className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {metrics.map(([MetricIcon, value, label, delta], index) => <article key={label} className="animate-rise flex min-h-24 items-center gap-4 rounded-lg border border-border bg-card p-4 shadow-card" style={{ animationDelay: `${index * 70}ms` }}><div className="grid size-12 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary"><MetricIcon className="size-7" /></div><div><div className="text-2xl font-extrabold">{value}</div><div className="text-sm text-muted-foreground">{label}</div><div className="mt-1 text-[11px] text-success">↑ {delta} <span className="text-muted-foreground">vs last week</span></div></div></article>)}
      </section>

      {tab === "Overview" && <>
      <section className="mt-4 rounded-lg border border-border bg-card p-5 shadow-card">
        <div className="flex items-start justify-between"><div><h2 className="text-xl font-extrabold">Hiring Pipeline</h2><p className="text-sm text-muted-foreground">Track your talent through every stage.</p></div><Button variant="ghost" size="sm"><span className="flex items-end gap-0.5"><i className="h-2 w-1 bg-primary" /><i className="h-4 w-1 bg-primary" /><i className="h-3 w-1 bg-primary" /></span>View Funnel</Button></div>
        <div className="mt-6 grid grid-cols-4 gap-y-6 lg:grid-cols-8">{pipeline.map(([StageIcon, value, label], index) => <div key={label} className="relative text-center"><div className={`relative z-10 mx-auto grid size-12 place-items-center rounded-full ${index < 4 ? "bg-primary text-primary-foreground shadow-button" : "bg-primary-soft text-primary"}`}><StageIcon className="size-5" /></div>{index < pipeline.length - 1 && <div className="absolute left-[calc(50%+24px)] top-6 hidden h-0.5 w-[calc(100%-48px)] bg-primary-soft lg:block" />}<div className="mt-2 text-sm font-extrabold">{value}</div><div className="text-xs text-muted-foreground">{label}</div></div>)}</div>
      </section>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.25fr_1fr]">
        <section className="rounded-lg border border-border bg-card p-5 shadow-card"><div className="mb-3 flex items-center justify-between"><h2 className="text-xl font-extrabold">Recent Candidates</h2><Button variant="ghost" size="sm">View All</Button></div><div className="divide-y divide-border">{candidates.map((person) => <article key={person.name} className="grid grid-cols-[58px_1fr_auto] items-center gap-3 py-3"><Image src={person.image} alt={`${person.name} casting headshot`} loading="lazy" className="h-[70px] w-[58px] rounded-md object-cover" /><div className="min-w-0"><div className="flex items-center gap-1.5 text-sm font-bold">{person.name}<span className="grid size-4 place-items-center rounded-full bg-primary text-[9px] text-primary-foreground">✓</span></div><div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground"><span className="flex items-center gap-1"><MapPin className="size-3" />{person.city}</span><span>◉ {person.exp}</span></div><div className="mt-2 flex flex-wrap gap-1">{person.tags.map((tag) => <span key={tag} className="rounded bg-primary-soft px-2 py-1 text-[10px] text-secondary-foreground">{tag}</span>)}</div></div><div className="flex items-center gap-3"><div className="grid size-12 place-items-center rounded-full border-[3px] border-success text-xs font-extrabold">{person.score}%</div><Button variant="ghost" size="icon-sm-square" aria-label={`Actions for ${person.name}`}><MoreVertical className="size-4" /></Button></div></article>)}</div></section>
        <section className="rounded-lg border border-border bg-card p-5 shadow-card"><div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-extrabold">Campaign Activity</h2><Button variant="ghost" size="sm">View All</Button></div><div>{activities.map(([ActivityIcon, title, meta, initials], index) => <div key={title} className="relative grid grid-cols-[40px_1fr_auto] gap-3 pb-5 last:pb-0"><div className={`relative z-10 grid size-10 place-items-center rounded-full ${index === activities.length - 1 ? "bg-success-soft text-success" : "bg-primary-soft text-primary"}`}><ActivityIcon className="size-4" /></div>{index < activities.length - 1 && <div className="absolute left-5 top-10 h-[calc(100%-40px)] w-px bg-border" />}<div className="pt-1"><div className="text-sm font-semibold leading-5">{title}</div><div className="text-xs leading-5 text-muted-foreground">{meta}</div></div>{initials && <div className="mt-1 grid size-8 place-items-center rounded-full bg-foreground text-[10px] text-primary-foreground">{initials}</div>}</div>)}</div></section>
      </div>
      </>}

      {tab === "Candidates" && <CandidatesSection campaignId={campaignId} />}

      {!["Overview", "Candidates"].includes(tab) && (
        <section className="mt-4 rounded-lg border border-dashed border-border bg-card p-10 text-center shadow-card">
          <h2 className="font-display text-lg font-semibold text-foreground">{tab}</h2>
          <p className="mt-1 text-sm text-muted-foreground">This section is coming soon.</p>
        </section>
      )}
    </div>

    <aside className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 p-4 shadow-[0_-8px_30px_oklch(0.3_0.08_280/10%)] backdrop-blur-lg"><div className="mx-auto flex max-w-[1360px] items-center justify-between gap-4"><div className="hidden items-center gap-3 sm:flex"><Image src={campaignHero} alt="" className="h-16 w-14 rounded-md object-cover" /><div><div className="flex items-center gap-3 font-bold">Lead Actor — Web Series <span className="rounded-full bg-success-soft px-2 py-1 text-xs text-success">✓ Active</span></div><div className="mt-1 text-sm text-muted-foreground">30 days left&nbsp;&nbsp; • &nbsp;&nbsp;342 applications</div></div></div><Button size="lg" onClick={() => notify("Opening application review")} className="w-full sm:w-auto"><UserRoundCheck className="size-5" />Review Applications<ArrowRight className="size-5" /></Button></div></aside>
    {notice && <div role="status" className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-md bg-foreground px-4 py-2 text-sm text-primary-foreground shadow-card">{notice}</div>}
  </main>;
}
