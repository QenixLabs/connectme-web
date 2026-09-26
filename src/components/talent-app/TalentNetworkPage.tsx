"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, type ReactNode } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronRight,
  Clapperboard,
  FileText,
  Heart,
  Home,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  UserRound,
  UsersRound,
  Waypoints,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const categories = [
  { label: "Actors", image: "/images/casting/actor-male.jpg" },
  { label: "Models", image: "/images/casting/actor-female.jpg" },
  { label: "Dancers", image: "/images/portfolio/p1.jpg" },
  { label: "Singers", image: "/images/portfolio/p2.jpg" },
  { label: "Musicians", image: "/images/portfolio/p3.jpg" },
  { label: "Creators", image: "/images/portfolio/p4.jpg" },
  { label: "Photographers", image: "/images/portfolio/p5.jpg" },
  { label: "Filmmakers", image: "/images/casting/casting-team.jpg" },
  { label: "Directors", image: "/images/portfolio/p6.jpg" },
  { label: "Writers", image: "/images/portfolio/p7.jpg" },
  { label: "Editors", image: "/images/portfolio/p8.jpg" },
  { label: "Makeup Artists", image: "/images/portfolio/p9.jpg" },
  { label: "Stylists", image: "/images/casting/rootin-creative-talent-showcase.png" },
  { label: "Voice Artists", image: "/images/portfolio/p10.jpg" },
];

const collaborators = [
  {
    id: "ananya-sharma",
    name: "Ananya Sharma",
    image: "/images/avatars/avatar-sarah.jpg",
    role: "Dancer | Choreographer",
    location: "Mumbai",
    tags: ["Dance", "Choreography", "Acts"],
    score: 88,
    match: 92,
    reason: "Strong match for your filmmaking + acting interests.",
  },
  {
    id: "arjun-mehta",
    name: "Arjun Mehta",
    image: "/images/avatars/avatar-arjun.jpg",
    role: "Actor | Model",
    location: "Mumbai",
    tags: ["Acting", "Modeling", "Fashion"],
    score: 91,
    match: 86,
    reason: "Great fit for commercial, short film and brand projects.",
  },
  {
    id: "riya-kapoor",
    name: "Riya Kapoor",
    image: "/images/avatars/avatar-priya.jpg",
    role: "Singer | Songwriter",
    location: "Delhi",
    tags: ["Vocals", "Lyrics", "Music Prod."],
    score: 85,
    match: 78,
    reason: "Can add a unique music dimension to your project.",
  },
  {
    id: "karan-vohra",
    name: "Karan Vohra",
    image: "/images/avatars/avatar-rohan.jpg",
    role: "Filmmaker | Editor",
    location: "Mumbai",
    tags: ["Direction", "Editing", "Cinematography"],
    score: 89,
    match: 84,
    reason: "Experienced in visual storytelling and music videos.",
  },
];

const projects = [
  {
    name: "Midnight Echoes",
    type: "Music Video",
    image: "/images/casting/casting-team.jpg",
    creator: "Rohan Malhotra",
    location: "Mumbai",
    needs: "Dancer, DOP, Editor, Stylist",
    stage: "Pre-Production",
    detail: "Collaboration (Revenue Share)",
    deadline: "15 Sep 2026",
    collaborators: "4/6 Collaborators",
  },
  {
    name: "City Lights",
    type: "Short Film",
    image: "/images/casting/casting-hero.jpg",
    creator: "Neha Singh",
    location: "Pune",
    needs: "Actor, Cinematographer, Music Composer",
    stage: "Script Stage",
    detail: "Portfolio / Credit",
    deadline: "30 Sep 2026",
    collaborators: "2/5 Collaborators",
  },
];

type RequestTab = "incoming" | "sent" | "active";

const requestTabs: Array<{ id: RequestTab; label: string; count: number }> = [
  { id: "incoming", label: "Incoming", count: 3 },
  { id: "sent", label: "Sent", count: 2 },
  { id: "active", label: "Active", count: 5 },
];

const networkNavigation = [
  { label: "Home", href: "/talent/dashboard", icon: Home },
  { label: "Opportunities", href: "/talent/opportunities", icon: BriefcaseBusiness },
  { label: "Network", href: "/talent/network", icon: UsersRound, active: true },
  { label: "Messages", href: "/talent/messages", icon: MessageCircle, badge: 3 },
  { label: "Profile", href: "/talent/profile", icon: UserRound },
];

function SectionHeading({
  title,
  action = "See All",
  icon,
  onAction,
}: {
  title: string;
  action?: string;
  icon?: ReactNode;
  onAction?: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-1">
      <div className="flex min-w-0 items-center gap-2">
        <h2 className="truncate font-display text-[18px] font-bold tracking-[-0.03em] text-[#16163b] sm:text-xl">
          {title}
        </h2>
        {icon}
      </div>
      <Button
        type="button"
        variant="link"
        onClick={onAction}
        className="h-auto shrink-0 gap-0.5 px-0 text-[12px] font-semibold text-[#4f20e8]"
      >
        {action}
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}

function CategoryTile({
  label,
  image,
  compact = false,
  onClick,
}: {
  label: string;
  image: string;
  compact?: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onClick}
      className={cn(
        "h-auto min-w-0 flex-col gap-0 overflow-hidden rounded-xl border border-[#e6e2f8] bg-white p-0 text-[#19193c] shadow-[0_3px_10px_rgba(91,70,180,0.06)] transition duration-200 hover:-translate-y-0.5 hover:border-[#a88bff] hover:bg-white hover:shadow-[0_8px_18px_rgba(91,70,180,0.14)]",
        compact ? "rounded-lg" : "rounded-xl",
      )}
    >
      <span className={cn("relative block w-full", compact ? "aspect-[1.65]" : "aspect-[1.42]")}>
        <Image src={image} alt="" fill sizes="(max-width: 640px) 14vw, 130px" className="object-cover" />
      </span>
      <span className={cn("w-full truncate px-1 py-1.5 text-center font-semibold", compact ? "text-[9px]" : "text-[10px]")}>{label}</span>
    </Button>
  );
}

function CollaboratorCard({
  collaborator,
  saved,
  invited,
  onToggleSaved,
  onInvite,
}: {
  collaborator: (typeof collaborators)[number];
  saved: boolean;
  invited: boolean;
  onToggleSaved: () => void;
  onInvite: () => void;
}) {
  return (
    <Card className="group min-w-[244px] snap-start gap-0 overflow-hidden rounded-[17px] border-[#e3def7] bg-white py-0 shadow-[0_5px_18px_rgba(67,54,132,0.09)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(67,54,132,0.15)] sm:min-w-[260px] lg:min-w-0">
      <div className="relative h-[132px] overflow-hidden bg-[#eeeaff]">
        <Image
          src={collaborator.image}
          alt={collaborator.name}
          fill
          sizes="(max-width: 640px) 244px, 260px"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#10102d]/35 to-transparent" />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onToggleSaved}
          aria-label={saved ? `Remove ${collaborator.name} from saved` : `Save ${collaborator.name}`}
          className={cn(
            "absolute right-2 top-2 rounded-full bg-black/20 text-white backdrop-blur-sm hover:bg-black/35 hover:text-white",
            saved && "bg-white text-[#f03368] hover:bg-white hover:text-[#f03368]",
          )}
        >
          <Heart className={cn("size-4", saved && "fill-current")} />
        </Button>
        <Badge className="absolute bottom-2 right-2 gap-1 rounded-full border-0 bg-[#c7f7dd] px-2 py-1 text-[10px] font-bold text-[#0b8a52] shadow-sm">
          <Check className="size-3" strokeWidth={3} /> {collaborator.match}%
        </Badge>
      </div>

      <CardContent className="space-y-2.5 p-3.5">
        <div className="min-w-0">
          <h3 className="flex items-center gap-1 truncate text-[14px] font-bold tracking-[-0.02em] text-[#171737]">
            <span className="truncate">{collaborator.name}</span>
            <BadgeCheck className="size-4 shrink-0 fill-[#2289e8] text-white" aria-label="Verified" />
          </h3>
          <p className="mt-0.5 truncate text-[11px] font-medium text-[#565477]">{collaborator.role}</p>
          <p className="mt-1 flex items-center gap-1 text-[10px] text-[#777497]">
            <MapPin className="size-3 text-[#5c34df]" /> {collaborator.location}
          </p>
        </div>

        <div className="flex min-h-5 gap-1 overflow-hidden">
          {collaborator.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="shrink-0 rounded-md bg-[#f0ebff] px-2 py-1 text-[9px] font-medium text-[#5134aa]">
              {tag}
            </Badge>
          ))}
        </div>

        <div>
          <div className="flex items-center justify-between text-[10px]">
            <span className="font-medium text-[#6d6a8c]">RootScore</span>
            <span className="font-bold text-[#282052]">{collaborator.score}</span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#ebe7fa]">
            <span className="block h-full rounded-full bg-gradient-to-r from-[#7834f2] to-[#af38f6]" style={{ width: `${collaborator.score}%` }} />
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#12915b]">
          <span className="size-2 rounded-full bg-[#19bd70]" /> Available
        </div>
        <p className="min-h-8 text-[10px] leading-[1.35] text-[#676483]">{collaborator.reason}</p>

        <div className="grid grid-cols-2 gap-2 pt-0.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => toast.info(`Opening ${collaborator.name}'s profile`)}
            className="h-9 rounded-lg border-[#7138f4] px-2 text-[10px] font-bold text-[#5725dc] hover:bg-[#f5f0ff] hover:text-[#5725dc]"
          >
            View Profile
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onInvite}
            className="h-9 rounded-lg bg-[#5520e8] px-2 text-[10px] font-bold text-white shadow-[0_5px_12px_rgba(85,32,232,0.22)] hover:bg-[#4513cf]"
          >
            {invited ? "Invited" : "Invite"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ProjectCard({ project }: { project: (typeof projects)[number] }) {
  return (
    <Card className="w-[min(100%,420px)] min-w-[min(100%,420px)] gap-0 rounded-[17px] border-[#e1def2] bg-white p-2.5 shadow-[0_5px_16px_rgba(67,54,132,0.08)] sm:min-w-0">
      <CardContent className="flex gap-3 p-0">
        <div className="relative h-[158px] w-[132px] shrink-0 overflow-hidden rounded-xl bg-[#eceafa]">
          <Image src={project.image} alt="" fill sizes="132px" className="object-cover" />
        </div>
        <div className="min-w-0 flex-1 py-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-[14px] font-bold text-[#19183d]">{project.name}</h3>
            <Badge className="shrink-0 rounded-full border-0 bg-[#eee8ff] px-2 py-1 text-[9px] font-semibold text-[#5a31c6]">{project.type}</Badge>
          </div>
          <p className="mt-1 flex items-center gap-1 truncate text-[10px] text-[#6f6b8c]">
            {project.creator} <span className="text-[#b3afd0]">•</span> <MapPin className="size-3 text-[#5e36d9]" /> {project.location}
          </p>
          <p className="mt-2 text-[10px] leading-snug text-[#666382]">Needs: {project.needs}</p>
          <div className="mt-2 space-y-1.5 text-[10px] text-[#666382]">
            <p className="flex items-center gap-1.5"><CalendarDays className="size-3.5 text-[#5630ce]" /> {project.stage}</p>
            <p className="flex items-center gap-1.5"><UsersRound className="size-3.5 text-[#5630ce]" /> {project.detail}</p>
            <p className="flex items-center gap-1.5"><FileText className="size-3.5 text-[#5630ce]" /> Deadline: {project.deadline}</p>
          </div>
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="text-[10px] font-semibold text-[#6a668a]">{project.collaborators}</span>
            <Button type="button" variant="outline" size="xs" onClick={() => toast.info(`Opening ${project.name}`)} className="h-7 rounded-md border-[#7138f4] px-2 text-[9px] font-bold text-[#5725dc] hover:bg-[#f5f0ff] hover:text-[#5725dc]">View Project</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function NetworkBottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-[#e3e0f2] bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_26px_rgba(48,39,105,0.08)] backdrop-blur-xl md:hidden">
      <div className="mx-auto grid h-[70px] max-w-md grid-cols-5">
        {networkNavigation.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.label}
              asChild
              variant="ghost"
              className={cn(
                "relative h-full flex-col gap-1 rounded-none px-1 py-2 text-[10px] font-medium text-[#69658c] hover:bg-[#faf9ff] hover:text-[#4e20e7]",
                item.active && "font-bold text-[#5420e8]",
              )}
            >
              <Link href={item.href} aria-current={item.active ? "page" : undefined}>
                <span className="relative">
                  <Icon className="size-[22px]" strokeWidth={item.active ? 2.6 : 2} />
                  {item.badge ? <span className="absolute -right-2 -top-2 grid size-4 place-items-center rounded-full bg-[#f03255] text-[9px] font-bold text-white">{item.badge}</span> : null}
                </span>
                <span>{item.label}</span>
              </Link>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}

export function TalentNetworkPage() {
  const searchRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Find Collaborators");
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [invitedIds, setInvitedIds] = useState<string[]>([]);
  const [requestTab, setRequestTab] = useState<RequestTab>("incoming");
  const [requestStatus, setRequestStatus] = useState<"pending" | "accepted" | "declined">("pending");

  const filters = [
    { label: "Find Collaborators", icon: UsersRound },
    { label: "Join a Project", icon: Clapperboard },
    { label: "Create a Project", icon: Plus },
    { label: "Creative Partners", icon: UsersRound },
    { label: "Nearby Talent", icon: MapPin },
    { label: "Recommended for You", icon: Star },
  ];

  const handleFilter = (label: string) => {
    setActiveFilter(label);
    if (label === "Find Collaborators" || label === "Recommended for You") {
      document.getElementById("collaborators")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    toast.info(`${label} is ready for you to explore`);
  };

  const handleSearch = () => {
    const query = searchQuery.trim();
    toast.success(query ? `Finding collaborators for “${query}”` : "Tell us what you want to create");
  };

  const toggleSaved = (id: string) => {
    setSavedIds((current) => current.includes(id) ? current.filter((savedId) => savedId !== id) : [...current, id]);
  };

  const handleInvite = (id: string, name: string) => {
    setInvitedIds((current) => current.includes(id) ? current : [...current, id]);
    toast.success(`Invite sent to ${name}`);
  };

  return (
    <div className="min-h-screen bg-[#fbfaff] pb-20 text-[#171737] md:pb-8">
      <header className="border-b border-[#e8e4f3] bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[78px] max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
          <Link href="/talent/network" className="flex min-w-0 items-center gap-2.5" aria-label="Rootin talent network">
            <span className="grid size-11 shrink-0 place-items-center rounded-[15px] bg-[#f0eaff] text-[#5520e8]">
              <Waypoints className="size-7" strokeWidth={2.6} />
            </span>
            <span className="min-w-0">
              <span className="block font-display text-[25px] font-bold leading-none tracking-[-0.06em] text-[#15152f]">Rootin</span>
              <span className="mt-1 block truncate text-[10px] leading-none text-[#696682]">People. Talent. Opportunities.</span>
            </span>
          </Link>

          <nav className="hidden flex-1 items-center justify-center gap-1 md:flex" aria-label="Talent navigation">
            {networkNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <Button key={item.label} asChild variant="ghost" size="sm" className={cn("relative gap-1.5 rounded-full px-4 text-xs font-semibold text-[#696682] hover:bg-[#f3efff] hover:text-[#4e20e7]", item.active && "bg-[#eee7ff] text-[#4e20e7]")}>
                  <Link href={item.href} aria-current={item.active ? "page" : undefined}>
                    <Icon className="size-4" /> {item.label}
                    {item.badge ? <span className="grid size-4 place-items-center rounded-full bg-[#ef3157] text-[9px] font-bold text-white">{item.badge}</span> : null}
                  </Link>
                </Button>
              );
            })}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon-lg"
              onClick={() => searchRef.current?.focus()}
              aria-label="Search collaborators"
              className="rounded-full bg-[#f8f5ff] text-[#2f1a85] hover:bg-[#eee8ff] hover:text-[#4e20e7]"
            >
              <Search className="size-5" />
            </Button>
            <Button asChild variant="ghost" size="icon-lg" aria-label="Notifications" className="relative rounded-full bg-[#f8f5ff] text-[#2f1a85] hover:bg-[#eee8ff] hover:text-[#4e20e7]">
              <Link href="/talent/notifications">
                <Bell className="size-5" />
                <span className="absolute right-0.5 top-0.5 grid size-[17px] place-items-center rounded-full bg-[#ef3157] text-[9px] font-bold text-white">3</span>
              </Link>
            </Button>
            <Button asChild variant="ghost" size="icon-lg" aria-label="Open profile" className="rounded-full p-0 hover:bg-transparent">
              <Link href="/talent/profile" className="relative overflow-hidden rounded-full border-2 border-[#ede8ff]">
                <Image src="/avatars/avatar-user.jpg" alt="Your profile" fill sizes="40px" className="object-cover" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-[#e6e0fa] bg-[#f5f1ff]">
          <Image src="/images/collaboration-banner.png" alt="Creative collaborators working together" fill priority sizes="100vw" className="object-cover object-right opacity-90" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(249,247,255,0.98)_0%,rgba(249,247,255,0.9)_46%,rgba(249,247,255,0.38)_76%,rgba(249,247,255,0.1)_100%)]" />
          <div className="relative mx-auto max-w-[1440px] px-4 pb-5 pt-8 sm:px-6 sm:pb-7 sm:pt-12 lg:px-10">
            <div className="max-w-[700px]">
              <p className="mb-2 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#6031d4] sm:text-xs">
                <Sparkles className="size-3.5" /> The creative network
              </p>
              <h1 className="font-display text-[32px] font-bold leading-[1.05] tracking-[-0.055em] text-[#101033] sm:text-5xl lg:text-[56px]">Collaborate with Talent</h1>
              <p className="mt-2 max-w-[520px] text-[14px] leading-relaxed text-[#343158] sm:text-lg">Find the right people to create something great together.</p>
            </div>

            <div className="mt-6 flex max-w-[1080px] items-center gap-2 rounded-[16px] border border-[#cfc0ff] bg-white/95 p-2 shadow-[0_8px_24px_rgba(95,52,213,0.12)] backdrop-blur sm:mt-8 sm:rounded-[18px] sm:p-2.5">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#f0ebff] text-[#5520e8] sm:size-12">
                <Sparkles className="size-5" />
              </span>
              <div className="min-w-0 flex-1 px-1">
                <label htmlFor="network-search" className="block text-[13px] font-bold text-[#202044] sm:text-base">What are you looking to create?</label>
                <Input
                  ref={searchRef}
                  id="network-search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  onKeyDown={(event) => { if (event.key === "Enter") handleSearch(); }}
                  placeholder="Looking for a female dancer and cinematographer for a music video in Mumbai..."
                  className="h-6 border-0 bg-transparent p-0 text-[11px] text-[#5c5879] shadow-none placeholder:text-[#777493] focus-visible:ring-0 sm:text-sm"
                />
              </div>
              <Button type="button" size="icon-lg" onClick={handleSearch} aria-label="Search network" className="rounded-xl bg-[#5520e8] text-white shadow-[0_6px_15px_rgba(85,32,232,0.3)] hover:bg-[#4513cf]">
                <Search className="size-5" />
              </Button>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
          <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto py-4 sm:flex-wrap sm:overflow-visible sm:py-5">
            {filters.map((filter) => {
              const Icon = filter.icon;
              const active = activeFilter === filter.label;
              return (
                <Button
                  key={filter.label}
                  type="button"
                  variant={active ? "default" : "secondary"}
                  onClick={() => handleFilter(filter.label)}
                  aria-pressed={active}
                  className={cn(
                    "h-9 shrink-0 rounded-full border border-[#e6e1f6] bg-[#f0edff] px-4 text-[11px] font-semibold text-[#282153] hover:border-[#b9a3ff] hover:bg-[#e7ddff] hover:text-[#4e20e7]",
                    active && "border-[#8c5afa] bg-gradient-to-r from-[#8b2cf4] to-[#5520e8] text-white shadow-[0_6px_14px_rgba(112,47,240,0.24)] hover:border-[#8c5afa] hover:bg-[#5520e8] hover:text-white",
                  )}
                >
                  <Icon className="size-4" /> {filter.label}
                </Button>
              );
            })}
          </div>

          <section className="pt-1 sm:pt-2">
            <SectionHeading title="Collaboration Categories" onAction={() => toast.info("Showing all collaboration categories")} />
            <div className="mt-3 grid grid-cols-7 gap-2 sm:grid-cols-7 sm:gap-3 lg:grid-cols-7 xl:grid-cols-8">
              {categories.slice(0, 7).map((category) => <CategoryTile key={category.label} {...category} onClick={() => handleFilter(category.label)} />)}
            </div>
            <div className="mt-2 grid grid-cols-7 gap-2 sm:grid-cols-8 sm:gap-3 lg:grid-cols-8">
              {categories.slice(7).map((category) => <CategoryTile key={category.label} {...category} compact onClick={() => handleFilter(category.label)} />)}
              <Button type="button" variant="ghost" onClick={() => toast.info("More categories coming soon")} className="h-auto min-w-0 flex-col gap-0 overflow-hidden rounded-lg border border-[#e6e2f8] bg-[#f0ebff] p-0 text-[#4e20e7] shadow-[0_3px_10px_rgba(91,70,180,0.06)] hover:bg-[#e9e0ff]">
                <span className="flex aspect-[1.65] w-full items-center justify-center gap-0.5 text-lg font-black tracking-[0.2em]"><MoreHorizontal className="size-5" /></span>
                <span className="w-full truncate px-1 py-1.5 text-center text-[9px] font-semibold">Other</span>
              </Button>
            </div>
          </section>

          <section id="collaborators" className="scroll-mt-5 pt-7 sm:pt-9">
            <SectionHeading
              title="People who complement your talent"
              icon={<Badge className="gap-1 rounded-full border-0 bg-[#eee7ff] px-2 py-1 text-[10px] font-bold text-[#6427df]"><Sparkles className="size-3" /> AI Powered</Badge>}
              onAction={() => toast.info("Loading more recommendations")}
            />
            <div className="no-scrollbar -mx-1 mt-3 flex snap-x gap-3 overflow-x-auto px-1 pb-3 lg:grid lg:grid-cols-4 lg:overflow-visible">
              {collaborators.map((collaborator) => (
                <CollaboratorCard
                  key={collaborator.id}
                  collaborator={collaborator}
                  saved={savedIds.includes(collaborator.id)}
                  invited={invitedIds.includes(collaborator.id)}
                  onToggleSaved={() => toggleSaved(collaborator.id)}
                  onInvite={() => handleInvite(collaborator.id, collaborator.name)}
                />
              ))}
            </div>
          </section>

          <section className="pt-5 sm:pt-7">
            <SectionHeading title="Active Collaboration Projects" onAction={() => toast.info("Showing all active projects")} />
            <div className="no-scrollbar -mx-1 mt-3 flex snap-x gap-3 overflow-x-auto px-1 pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible">
              {projects.map((project) => <ProjectCard key={project.name} project={project} />)}
            </div>
            <Button type="button" onClick={() => toast.success("Project creator opened")} className="mt-3 h-[62px] w-full justify-between rounded-[14px] bg-gradient-to-r from-[#5720ee] to-[#9d2ff4] px-5 text-white shadow-[0_8px_22px_rgba(119,44,235,0.26)] hover:from-[#4514ce] hover:to-[#8e21e4]">
              <span className="flex items-center gap-2.5 text-left"><Plus className="size-5" /><span><span className="block text-[15px] font-bold">Create a Collaboration</span><span className="block text-[10px] font-medium text-white/80">Post your project, find the right talent and bring your vision to life.</span></span></span>
              <ArrowRight className="size-5" />
            </Button>
          </section>

          <section className="pt-7 sm:pt-9">
            <SectionHeading title="Collaboration Requests" onAction={() => toast.info("Opening collaboration requests")} />
            <div className="mt-3 flex w-fit rounded-full bg-[#f0edff] p-0.5">
              {requestTabs.map((tab) => (
                <Button key={tab.id} type="button" variant="ghost" onClick={() => setRequestTab(tab.id)} className={cn("h-9 rounded-full px-4 text-[11px] font-medium text-[#39335e] hover:bg-[#e5dbff] hover:text-[#4e20e7]", requestTab === tab.id && "bg-gradient-to-r from-[#8c2df4] to-[#5420e9] font-bold text-white shadow-[0_4px_9px_rgba(92,31,229,0.2)] hover:bg-[#5420e9] hover:text-white")}>
                  {tab.label} ({tab.count})
                </Button>
              ))}
            </div>

            <Card className="mt-3 gap-0 rounded-[17px] border-[#e1def2] bg-white py-0 shadow-[0_5px_16px_rgba(67,54,132,0.07)]">
              <CardContent className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:p-4">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-[#ede9fb]">
                    <Image src="/images/avatars/msg-rohit.jpg" alt="Vikram Rao" fill sizes="56px" className="object-cover" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="flex items-center gap-1 text-[14px] font-bold text-[#1c1a3e]">{requestTab === "incoming" ? "Vikram Rao" : requestTab === "sent" ? "Meera Shah" : "Ananya Sharma"} <BadgeCheck className="size-4 shrink-0 fill-[#2387e9] text-white" /></h3>
                    <p className="mt-0.5 truncate text-[10px] font-medium text-[#5b577a]">Actor | Content Creator</p>
                    <p className="mt-1 text-[11px] leading-snug text-[#545071]">Hey! I&apos;d love to collaborate on your short film project. I think my profile fits well with what you&apos;re looking for.</p>
                    <p className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-[#696583]"><FileText className="size-3.5 text-[#5530d3]" /> The Silent Frame (Short Film) <span className="text-[#aaa6c0]">|</span> 2 days ago</p>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2 sm:w-[230px] sm:justify-end">
                  <Badge className="gap-1 rounded-full border-0 bg-[#c9f6de] px-2.5 py-1.5 text-[10px] font-bold text-[#098b51]"><Check className="size-3" /> 88% Match</Badge>
                  {requestStatus === "pending" ? (
                    <>
                      <Button type="button" size="sm" onClick={() => { setRequestStatus("accepted"); toast.success("Collaboration request accepted"); }} className="h-9 rounded-lg bg-[#5520e8] px-5 text-[10px] font-bold hover:bg-[#4513cf]">Accept</Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => { setRequestStatus("declined"); toast.info("Request declined"); }} className="h-9 rounded-lg border-[#ddd8f0] px-5 text-[10px] font-bold text-[#443e6e] hover:bg-[#f8f6ff]">Decline</Button>
                    </>
                  ) : (
                    <Badge className={cn("rounded-full border-0 px-3 py-2 text-[10px] font-bold", requestStatus === "accepted" ? "bg-[#c9f6de] text-[#098b51]" : "bg-[#f8e4ea] text-[#bd3e5b]")}>{requestStatus === "accepted" ? "Connected" : "Declined"}</Badge>
                  )}
                  <Button type="button" variant="outline" size="sm" onClick={() => toast.info("Opening profile")} className="h-9 rounded-lg border-[#ddd8f0] px-4 text-[10px] font-bold text-[#443e6e] hover:bg-[#f8f6ff]">View Profile</Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => toast.info("Opening message composer")} className="h-9 rounded-lg border-[#ddd8f0] px-4 text-[10px] font-bold text-[#443e6e] hover:bg-[#f8f6ff]">Message</Button>
                </div>
              </CardContent>
            </Card>
          </section>

          <Card className="mb-5 mt-7 gap-0 overflow-hidden rounded-[17px] border-[#dcd9f0] bg-white py-0 shadow-[0_5px_16px_rgba(67,54,132,0.06)] sm:mb-7">
            <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-5 sm:p-5">
              <div className="flex items-center gap-3 sm:min-w-[225px]">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#cff8e1] text-[#078954]"><ShieldCheck className="size-7" /></span>
                <div><p className="text-[12px] font-bold text-[#262245]">Trusted Collaboration Community</p><p className="mt-0.5 text-[10px] leading-snug text-[#696583]">Verified Talent Only<br />Safe. Professional. Meaningful Collaborations.</p></div>
              </div>
              <div className="grid flex-1 grid-cols-5 divide-x divide-[#e6e2f2] border-y border-[#eeeaf7] py-3 sm:border-y-0 sm:border-l sm:py-0">
                {[{ icon: BadgeCheck, label: "Identity", sub: "Verified" }, { icon: FileText, label: "Professional", sub: "Profile" }, { icon: BriefcaseBusiness, label: "Previous", sub: "Projects" }, { icon: Star, label: "Reputation", sub: "" }, { icon: Waypoints, label: "Collaboration", sub: "History" }].map((item) => { const Icon = item.icon; return <div key={item.label} className="flex flex-col items-center gap-1 px-1 text-center text-[#4f4a7b]"><span className="grid size-8 place-items-center rounded-full bg-[#d9f9e7] text-[#10945b]"><Icon className="size-4" /></span><span className="text-[9px] font-semibold leading-tight">{item.label}<br />{item.sub}</span></div>; })}
              </div>
              <Button type="button" variant="ghost" onClick={() => toast.info("Report and safety options opened")} className="h-auto shrink-0 flex-col gap-1 rounded-xl px-3 py-2 text-[10px] font-semibold text-[#e3354f] hover:bg-[#fff1f3] hover:text-[#d42744]"><X className="size-5" />Report / Safety</Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <NetworkBottomNav />
    </div>
  );
}
