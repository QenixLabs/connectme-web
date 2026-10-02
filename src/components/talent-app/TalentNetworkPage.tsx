"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  SlidersHorizontal,
  UserRound,
  UsersRound,
  Waypoints,
  X,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import logoImage from "@/assets/rootin-logo-orange.png";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { TagInput } from "@/components/ui/tag-input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useCampaigns } from "@/hooks/use-campaigns";
import { useSaveTalent, useStartConversation } from "@/hooks/use-talent-actions";
import { useTalentProfile } from "@/hooks/use-talent-dashboard";
import { useTalentSearch, useProfessions } from "@/hooks/use-talent-search";
import {
  useCollabPostsFeed,
  useMyCollabPosts,
  useCreateCollabPost,
  useCloseCollabPost,
  useReopenCollabPost,
  useDeleteCollabPost,
  useExpressInterest,
} from "@/hooks/use-collab-posts";
import type { CollabPost } from "@/lib/api/collab-posts";
import { useRecruiterDirectory } from "@/hooks/use-recruiter-directory";
import { useSaveRecruiter, useStartConversation as useRecruiterConversation } from "@/hooks/use-recruiter-actions";
import { useMyRequests, useAcceptRequest, useRejectRequest, useCreateRequest } from "@/hooks/use-requests";
import { useUnreadMessages, useUnreadNotifications } from "@/hooks/use-unread-counts";
import { useTalentNavItems } from "@/hooks/use-talent-nav-items";
import type { CollaborationRequest } from "@/lib/api/requests";
import type { Campaign } from "@/lib/api/campaigns";
import type { PublicRecruiterDirectoryItem, PublicRecruiterDirectoryParams } from "@/lib/api/recruiter";
import type { SearchTalentsParams, TalentProfile } from "@/lib/api/talent";
import { cn } from "@/lib/utils";
import { BottomBar } from "@/components/shared/bottom-bar";

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

type RequestTab = "incoming" | "sent" | "active";

type ConnectionStatus = "none" | "pending" | "connected";

const inviteReasons = [
  { value: "collaboration", label: "Collaborate", hint: "Work together on a project" },
  { value: "mentorship", label: "Mentorship", hint: "Learn from each other" },
  { value: "referral", label: "Referral", hint: "Share work and opportunities" },
] as const;

const requestTabs: Array<{ id: RequestTab; label: string }> = [
  { id: "incoming", label: "Incoming" },
  { id: "sent", label: "Sent" },
  { id: "active", label: "Active" },
];

const recruiterCategoryOptions = [
  { label: "All", value: undefined },
  { label: "Casting Directors", value: "Casting Director" },
  { label: "Agencies", value: "Agency" },
  { label: "Production", value: "Production" },
  { label: "Brands", value: "Brand" },
] as const;

const networkNavigation: Array<{ label: string; href: string; icon: LucideIcon; active?: boolean; badge?: number }> = [
  { label: "Home", href: "/talent/dashboard", icon: Home },
  { label: "Network", href: "/talent/network", icon: UsersRound, active: true },
  { label: "Opportunities", href: "/talent/opportunities", icon: BriefcaseBusiness },
  { label: "Messages", href: "/talent/messages", icon: MessageCircle },
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
        <h2 className="truncate font-display text-[18px] font-bold tracking-[-0.03em] text-[#162d52] sm:text-xl">
          {title}
        </h2>
        {icon}
      </div>
      <Button
        type="button"
        variant="link"
        onClick={onAction}
        className="h-auto shrink-0 gap-0.5 px-0 text-[12px] font-semibold text-[#1a5bdb]"
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
  onClick,
}: {
  label: string;
  image: string;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onClick}
      className="h-[112px] w-[84px] min-w-0 flex-col gap-3 overflow-hidden rounded-2xl border-0 bg-white p-2 text-[#193454] shadow-[0_3px_12px_rgba(15,23,42,0.05)] transition duration-200 hover:bg-white hover:shadow-[0_6px_16px_rgba(15,23,42,0.08)] sm:w-full"
    >
      <span className="relative block size-[60px] shrink-0 overflow-hidden rounded-xl bg-[#edf4ff]">
        <Image src={image} alt="" fill sizes="60px" className="object-cover" />
      </span>
      <span className="line-clamp-2 min-h-7 w-full overflow-hidden px-0.5 text-center text-[10px] font-semibold leading-3">{label}</span>
    </Button>
  );
}

function InviteDialog({
  target,
  onClose,
}: {
  target: { userId: string; name: string };
  onClose: () => void;
}) {
  const createRequest = useCreateRequest();
  const [message, setMessage] = useState("");
  const [reason, setReason] = useState<string>("collaboration");

  const handleSubmit = () => {
    createRequest.mutate(
      {
        receiver_id: target.userId,
        message: message.trim() || undefined,
        reason,
      },
      {
        onSuccess: (data) => {
          if (data.wasAccepted) {
            toast.success(`You and ${target.name} are now connected`);
          } else {
            toast.success(`Invite sent to ${target.name}`);
          }
          onClose();
        },
        onError: (err) => {
          const serverMessage =
            (err as { response?: { data?: { message?: string } } }).response?.data
              ?.message || "Failed to send invite";
          toast.error(serverMessage);
        },
      },
    );
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="network-dialog bg-white sm:max-w-[440px]">
        <DialogHeader className="text-left">
          <DialogTitle className="text-[#172b4d]">Invite {target.name}</DialogTitle>
          <DialogDescription className="text-[#64748b]">
            Say what you want to create together. They can accept, then you can message 1:1.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label className="text-xs font-bold text-[#1e3a5f]">Why are you reaching out?</Label>
            <RadioGroup value={reason} onValueChange={setReason} className="grid gap-2">
              {inviteReasons.map((option) => (
                <Label
                  key={option.value}
                  htmlFor={`invite-reason-${option.value}`}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#dbe7f7] bg-[#f8fbff] px-3 py-2.5 text-sm font-medium text-[#334e68] transition has-checked:border-[#3b82f6] has-checked:bg-[#eff6ff]"
                >
                  <RadioGroupItem id={`invite-reason-${option.value}`} value={option.value} />
                  <span>
                    <span className="block font-bold text-[#1e3a5f]">{option.label}</span>
                    <span className="block text-xs font-normal text-[#71809a]">{option.hint}</span>
                  </span>
                </Label>
              ))}
            </RadioGroup>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="invite-message" className="text-xs font-bold text-[#1e3a5f]">
              Message <span className="font-normal text-[#71809a]">(optional)</span>
            </Label>
            <Textarea
              id="invite-message"
              value={message}
              onChange={(event) => setMessage(event.target.value.slice(0, 500))}
              placeholder={`Hi ${target.name}! I'd love to collaborate on…`}
              rows={4}
              className="resize-none rounded-xl border-[#dbe7f7] bg-[#f8fbff] text-sm shadow-none focus-visible:ring-[#3b82f6]"
            />
            <p className="text-right text-[10px] text-[#8795aa]">{message.length}/500</p>
          </div>
        </div>
        <DialogFooter className="flex-row justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={createRequest.isPending}
            className="h-10 rounded-xl border-[#dbe7f7] text-[#1a5bdb]"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={createRequest.isPending}
            className="h-10 rounded-xl bg-[#1a5bdb] px-6 text-white hover:bg-[#1246b7]"
          >
            {createRequest.isPending ? "Sending…" : "Send Invite"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CollaboratorCard({
  collaborator,
  connectionStatus,
  onInvite,
}: {
  collaborator: TalentProfile & { match_score?: number; is_verified?: boolean };
  connectionStatus: ConnectionStatus;
  onInvite: () => void;
}) {
  const save = useSaveTalent(collaborator.username);
  const conversation = useStartConversation(collaborator.username, "talent");
  const name = collaborator.full_legal_name || collaborator.username;
  const professions = collaborator.professions?.join(" | ") || "Creative professional";
  const location = collaborator.location?.city || collaborator.location?.state || "Location not listed";
  const tags = (collaborator.specialties?.length ? collaborator.specialties : collaborator.skills?.map((skill) => skill.name) ?? []).slice(0, 3);
  const portfolioItems = (collaborator.portfolioHighlights ?? [])
    .filter((item) => item.thumbnail_url || item.type === "image")
    .slice(0, 4);
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Card className="group h-full gap-0 overflow-hidden rounded-2xl border-0 bg-white py-0 shadow-[0_4px_16px_rgba(15,23,42,0.06)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_22px_rgba(15,23,42,0.1)]">
      <div className="relative aspect-[2.25] overflow-hidden bg-[#edf4ff]">
        {collaborator.hero_background || collaborator.profile_photo ? (
          <Image
            src={collaborator.hero_background || collaborator.profile_photo || ""}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 580px"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid size-full place-items-center bg-gradient-to-br from-[#dbeafe] to-[#a9c7f5] text-3xl font-bold text-[#1a5bdb]">{initials}</div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#10102d]/35 to-transparent" />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={save.toggleSave}
          disabled={save.isPending}
          aria-label={save.isSaved ? `Remove ${name} from saved` : `Save ${name}`}
          className="absolute right-3 top-3 size-11 rounded-xl bg-white/95 text-[#1a5bdb] shadow-[0_4px_12px_rgba(15,65,150,0.14)] hover:bg-white hover:text-[#1a5bdb]"
        >
          <Heart className={cn("size-4", save.isSaved && "fill-[#f03368] text-[#f03368]")} />
        </Button>
        {collaborator.match_score != null ? (
          <span className="absolute bottom-3 right-3 flex items-center gap-1 text-[10px] font-bold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.55)]">
            <Check className="size-3" strokeWidth={3} /> {Math.round(collaborator.match_score)}% match
          </span>
        ) : null}
      </div>

      <CardContent className="relative flex flex-1 flex-col space-y-3 p-4 pt-9 sm:p-5 sm:pt-9">
        <div className="absolute -top-8 left-4 grid size-16 place-items-center overflow-hidden rounded-full bg-[#edf4ff] text-lg font-bold text-[#1a5bdb] shadow-[0_4px_14px_rgba(15,65,150,0.16)] ring-4 ring-white sm:left-5">
          {collaborator.profile_photo ? <Image src={collaborator.profile_photo} alt={name} fill sizes="64px" className="object-cover" /> : initials}
        </div>

        <div className="min-w-0">
          <h3 className="flex items-center gap-1 truncate text-[16px] font-bold tracking-[-0.02em] text-[#172b4d]">
            <span className="truncate">{name}</span>
            {collaborator.is_verified ? <BadgeCheck className="size-4 shrink-0 fill-[#2289e8] text-white" aria-label="Verified" /> : null}
          </h3>
          <p className="mt-1 truncate text-[11px] font-medium text-[#565477]">{professions}</p>
          <p className="mt-1.5 flex items-center gap-1 text-[11px] text-[#71809a]">
            <MapPin className="size-3 text-[#2563eb]" /> {location}
          </p>
        </div>

        <div className="flex min-h-5 gap-2 overflow-hidden whitespace-nowrap text-[10px] font-medium text-[#52677f]">
          {tags.map((tag, index) => (
            <span key={tag} className="shrink-0">{index > 0 ? "· " : ""}{tag}</span>
          ))}
        </div>

        <div className={cn(
          "flex items-center gap-1.5 text-[10px] font-semibold",
          collaborator.availability === "available" ? "text-[#12915b]" : "text-[#71809a]",
        )}>
          <span className={cn("size-2 rounded-full", collaborator.availability === "available" ? "bg-[#19bd70]" : "bg-[#aaa6c0]")} />
          {collaborator.availability?.replace("_", " ") || "Availability not listed"}
        </div>
        <p className="line-clamp-2 min-h-8 text-[11px] leading-[1.45] text-[#64748b]">{collaborator.headline || collaborator.about || "Creative professional"}</p>

        {portfolioItems.length > 0 ? (
          <div className="flex gap-2 overflow-hidden">
            {portfolioItems.map((item) => (
              <div key={item.id} className="relative aspect-[1.35] min-w-0 flex-1 overflow-hidden rounded-lg bg-[#edf4ff]">
                <Image src={item.thumbnail_url || item.url} alt={item.title || "Portfolio work"} fill sizes="120px" className="object-cover" />
              </div>
            ))}
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-2 pt-1">
          <Button asChild variant="outline" size="sm" className="h-10 rounded-xl border-[#3b82f6] px-2 text-[10px] font-bold text-[#1d4ed8] hover:bg-[#eff6ff] hover:text-[#1d4ed8]">
            <Link href={`/talent/${collaborator.username}`}>
              View Profile <ArrowRight className="size-3.5" />
            </Link>
          </Button>
          {connectionStatus === "connected" ? (
            <Button type="button" size="sm" onClick={conversation.start} disabled={conversation.isPending} className="h-10 rounded-xl bg-gradient-to-r from-[#2563eb] to-[#1a5bdb] px-2 text-[10px] font-bold text-white shadow-[0_5px_12px_rgba(26,91,219,0.22)] hover:from-[#1d4ed8] hover:to-[#1246b7]">
              Message
            </Button>
          ) : (
            <Button type="button" size="sm" onClick={onInvite} disabled={connectionStatus === "pending"} className="h-10 rounded-xl bg-gradient-to-r from-[#2563eb] to-[#1a5bdb] px-2 text-[10px] font-bold text-white shadow-[0_5px_12px_rgba(26,91,219,0.22)] hover:from-[#1d4ed8] hover:to-[#1246b7]">
              {connectionStatus === "pending" ? "Pending" : "Invite"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function RecruiterCard({ recruiter }: { recruiter: PublicRecruiterDirectoryItem }) {
  const save = useSaveRecruiter(recruiter.slug);
  const conversation = useRecruiterConversation(recruiter.slug, "recruiter");
  const location = [recruiter.location?.city, recruiter.location?.state].filter(Boolean).join(", ") || "Location not listed";
  const tags = [...(recruiter.specialties ?? []), ...(recruiter.casting_categories ?? [])]
    .filter((tag, index, all) => all.indexOf(tag) === index)
    .slice(0, 3);
  const visibleProjects = recruiter.projects.filter((project) => project.cover_image_url).slice(0, 4);

  return (
    <Card className="group h-full gap-0 overflow-hidden rounded-2xl border-0 bg-white py-0 shadow-[0_4px_16px_rgba(15,23,42,0.06)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_22px_rgba(15,23,42,0.1)]">
      <div className="relative aspect-[16/7] overflow-hidden bg-[#edf4ff]">
        {recruiter.banner_image_url ? <Image src={recruiter.banner_image_url} alt={`${recruiter.company_name} banner`} fill sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 580px" className="object-cover transition duration-500 group-hover:scale-105" /> : <div className="size-full bg-gradient-to-br from-[#eaf2ff] via-[#c5dcfa] to-[#b0cef5]" />}
        <Button type="button" variant="ghost" size="icon-sm" onClick={save.toggleSave} disabled={save.isPending} aria-label={save.isSaved ? `Remove ${recruiter.company_name} from saved` : `Save ${recruiter.company_name}`} className="absolute right-3 top-3 size-11 rounded-xl bg-white/95 text-[#1a5bdb] shadow-[0_4px_12px_rgba(15,65,150,0.14)] hover:bg-white hover:text-[#1a5bdb]">
          <Heart className={cn("size-4", save.isSaved && "fill-[#f03368] text-[#f03368]")} />
        </Button>
      </div>

      <CardContent className="relative flex flex-1 flex-col space-y-3 p-4 pt-9 sm:p-5 sm:pt-9">
        <div className="absolute -top-8 left-4 grid size-16 place-items-center overflow-hidden rounded-full bg-[#edf4ff] text-lg font-bold text-[#1a5bdb] shadow-[0_4px_14px_rgba(15,65,150,0.16)] ring-4 ring-white sm:left-5">
          {recruiter.profile_photo ? <Image src={recruiter.profile_photo} alt={recruiter.company_name} fill sizes="64px" className="object-cover" /> : recruiter.company_name.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="flex items-center gap-1 truncate text-[16px] font-bold tracking-[-0.02em] text-[#172b4d]">
              <span className="truncate">{recruiter.company_name}</span>
              {recruiter.is_verified ? <BadgeCheck className="size-4 shrink-0 fill-[#2289e8] text-white" aria-label="Verified" /> : null}
            </h3>
            <p className="mt-1 flex items-center gap-1 text-[11px] text-[#71809a]"><MapPin className="size-3 text-[#2563eb]" /> {location}</p>
          </div>
          {recruiter.average_rating != null ? <span className="flex shrink-0 items-center gap-1 text-sm font-bold text-[#506b88]"><Star className="size-4 fill-[#f6a914] text-[#f6a914]" /> {recruiter.average_rating.toFixed(1)} <span className="text-[10px] font-medium text-[#8795aa]">({recruiter.total_reviews_count})</span></span> : null}
        </div>

        <p className="line-clamp-2 min-h-8 text-[11px] leading-[1.45] text-[#64748b]">{recruiter.industry || recruiter.position || "Industry professional"}{recruiter.headline ? ` · ${recruiter.headline}` : ""}</p>

        {visibleProjects.length > 0 ? <div className="flex gap-2 overflow-hidden">{visibleProjects.map((project) => <div key={project._id} className="relative aspect-[1.35] min-w-0 flex-1 overflow-hidden rounded-lg bg-[#edf4ff]"><Image src={project.cover_image_url || ""} alt={project.name || "Project"} fill sizes="120px" className="object-cover" /></div>)}</div> : null}

        <div className="flex items-center justify-between gap-2">
          {recruiter.project_count > 0 ? <span className="text-center text-[#1a5bdb]"><strong className="block text-sm">{recruiter.project_count}+</strong><span className="text-[10px]">Projects</span></span> : <span />}
          <div className="flex min-w-0 flex-1 flex-wrap justify-end gap-x-2 text-[10px] font-medium text-[#52677f]">{tags.map((tag, index) => <span key={tag} className="max-w-[46%] truncate">{index > 0 ? "· " : ""}{tag}</span>)}</div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <Button asChild variant="outline" size="sm" className="h-10 rounded-xl border-[#3b82f6] px-2 text-[10px] font-bold text-[#1d4ed8] hover:bg-[#eff6ff] hover:text-[#1d4ed8]"><Link href={`/recruiter/${recruiter.slug}`}>View Profile <ArrowRight className="size-3.5" /></Link></Button>
          <Button type="button" size="sm" onClick={conversation.start} disabled={conversation.isPending} className="h-10 rounded-xl bg-gradient-to-r from-[#2563eb] to-[#1a5bdb] px-2 text-[10px] font-bold text-white shadow-[0_5px_12px_rgba(26,91,219,0.22)] hover:from-[#1d4ed8] hover:to-[#1246b7]">Message</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ProjectCard({ project }: { project: Campaign }) {
  const location = project.location?.city || project.location?.state || "Remote";
  const needs = project.requirements?.skills?.join(", ") || project.specialties?.join(", ") || project.role_type || "Creative collaborators";
  const budget = project.budget_range?.min || project.budget_range?.max
    ? `${project.budget_range.currency === "INR" ? "₹" : "$"}${(project.budget_range.min ?? project.budget_range.max)?.toLocaleString()}${project.budget_range.max ? ` - ${project.budget_range.currency === "INR" ? "₹" : "$"}${project.budget_range.max.toLocaleString()}` : ""}`
    : "Details on project page";
  return (
    <Card className="w-[min(100%,420px)] min-w-[min(100%,420px)] gap-0 rounded-[17px] border-[#dbe7f7] bg-white p-2.5 shadow-[0_5px_16px_rgba(37,99,235,0.08)] sm:min-w-0">
      <CardContent className="flex gap-3 p-0">
        <div className="relative h-[158px] w-[132px] shrink-0 overflow-hidden rounded-xl bg-[#edf4ff]">
          {project.cover_image_url ? <Image src={project.cover_image_url} alt="" fill sizes="132px" className="object-cover" /> : <div className="grid size-full place-items-center bg-gradient-to-br from-[#eaf2ff] to-[#b6d1f5] text-[#1a5bdb]"><Clapperboard className="size-10" /></div>}
        </div>
        <div className="min-w-0 flex-1 py-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-[14px] font-bold text-[#193454]">{project.name}</h3>
            <Badge className="shrink-0 rounded-full border-0 bg-[#eaf2ff] px-2 py-1 text-[9px] font-semibold text-[#1d4ed8]">{project.role_type || "Project"}</Badge>
          </div>
          <p className="mt-1 flex items-center gap-1 truncate text-[10px] text-[#64748b]">
            {project.recruiter?.company_name || "Project creator"} <span className="text-[#9ab2d0]">•</span> <MapPin className="size-3 text-[#2563eb]" /> {location}
          </p>
          <p className="mt-2 text-[10px] leading-snug text-[#64748b]">Needs: {needs}</p>
          <div className="mt-2 space-y-1.5 text-[10px] text-[#64748b]">
            <p className="flex items-center gap-1.5"><CalendarDays className="size-3.5 text-[#2563eb]" /> {project.status}</p>
            <p className="flex items-center gap-1.5"><UsersRound className="size-3.5 text-[#2563eb]" /> {budget}</p>
            <p className="flex items-center gap-1.5"><FileText className="size-3.5 text-[#2563eb]" /> Deadline: {project.deadline ? new Date(project.deadline).toLocaleDateString() : "Open"}</p>
          </div>
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="text-[10px] font-semibold text-[#607b96]">{project.applications_count ?? 0} applications</span>
            <Button asChild variant="outline" size="xs" className="h-7 rounded-md border-[#3b82f6] px-2 text-[9px] font-bold text-[#1d4ed8] hover:bg-[#eff6ff] hover:text-[#1d4ed8]"><Link href={`/talent/opportunities/${project._id}`}>View Project</Link></Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function NetworkRequestCard({
  request,
  currentUserId,
  incoming,
}: {
  request: CollaborationRequest;
  currentUserId: string;
  incoming: boolean;
}) {
  const accept = useAcceptRequest();
  const reject = useRejectRequest();
  const other = currentUserId
    ? request.requester_id._id === currentUserId
      ? request.receiver_id
      : request.requester_id
    : incoming
      ? request.requester_id
      : request.receiver_id;
  const name = other.full_legal_name || other.username || "Unknown user";
  const initials = name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  const profileHref = other.role === "recruiter" ? "/recruiter/profile" : `/talent/${other.username}`;
  const conversation = useStartConversation(other.username || "", other.role === "recruiter" ? "recruiter" : "talent");

  return (
    <Card className="gap-0 rounded-[17px] border-[#dbe7f7] bg-white py-0 shadow-[0_5px_16px_rgba(37,99,235,0.07)]">
      <CardContent className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:p-4">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div className="relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-[#edf4ff] text-lg font-bold text-[#1a5bdb]">
            {other.profile_photo ? <Image src={other.profile_photo} alt={name} fill sizes="56px" className="object-cover" /> : initials}
          </div>
          <div className="min-w-0">
            <h3 className="flex items-center gap-1 text-[14px] font-bold text-[#203b61]">
              <span className="truncate">{name}</span>
              {other.verification_status === "enterprise" ? <BadgeCheck className="size-4 shrink-0 fill-[#2387e9] text-white" aria-label="Verified" /> : null}
            </h3>
            <p className="mt-0.5 truncate text-[10px] font-medium text-[#64748b]">{other.position || other.role}</p>
            {request.message ? <p className="mt-1 text-[11px] leading-snug text-[#52677f]">{request.message}</p> : null}
            <p className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-[#64748b]">
              <FileText className="size-3.5 text-[#2563eb]" /> {request.reason || "collaboration"} <span className="text-[#9ab2d0]">|</span> {new Date(request.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:w-[230px] sm:justify-end">
          {request.status === "pending" && incoming ? (
            <>
              <Button type="button" size="sm" onClick={() => accept.mutate(request._id)} disabled={accept.isPending || reject.isPending} className="h-9 rounded-lg bg-[#1a5bdb] px-5 text-[10px] font-bold hover:bg-[#1246b7]">Accept</Button>
              <Button type="button" variant="outline" size="sm" onClick={() => reject.mutate(request._id)} disabled={accept.isPending || reject.isPending} className="h-9 rounded-lg border-[#dbe7f7] px-5 text-[10px] font-bold text-[#35516f] hover:bg-[#f1f6ff]">Decline</Button>
            </>
          ) : request.status === "pending" ? (
            <Badge className="rounded-full border-0 bg-[#eaf2ff] px-3 py-2 text-[10px] font-bold text-[#1d4ed8]">Pending</Badge>
          ) : request.status === "accepted" || request.status === "messaging_only" ? (
            <Badge className="rounded-full border-0 bg-[#c9f6de] px-3 py-2 text-[10px] font-bold text-[#098b51]">Connected</Badge>
          ) : (
            <Badge className="rounded-full border-0 bg-[#f8e4ea] px-3 py-2 text-[10px] font-bold text-[#bd3e5b]">Declined</Badge>
          )}
          <Button asChild type="button" variant="outline" size="sm" className="h-9 rounded-lg border-[#dbe7f7] px-4 text-[10px] font-bold text-[#35516f] hover:bg-[#f1f6ff]"><Link href={profileHref}>View Profile</Link></Button>
          {request.status === "accepted" || request.status === "messaging_only" ? <Button type="button" variant="outline" size="sm" onClick={conversation.start} disabled={conversation.isPending} className="h-9 rounded-lg border-[#dbe7f7] px-4 text-[10px] font-bold text-[#35516f] hover:bg-[#f1f6ff]">Message</Button> : null}
        </div>
      </CardContent>
    </Card>
  );
}

const composerSchema = z.object({
  title: z.string().trim().min(1, "Give your collab a title").max(120, "Keep the title under 120 characters"),
  description: z.string().trim().min(1, "Describe what you want to create").max(2000, "Keep it under 2000 characters"),
  looking_for: z.array(z.string().trim().min(1).max(60)).max(10, "Up to 10 professions").default([]),
  location_city: z.string().trim().max(100, "Keep the city under 100 characters").optional(),
});

type ComposerValues = z.input<typeof composerSchema>;

function CollabPostComposerDialog({ onClose }: { onClose: () => void }) {
  const createPost = useCreateCollabPost();
  const professionsQuery = useProfessions();
  const form = useForm<ComposerValues>({
    resolver: zodResolver(composerSchema),
    defaultValues: { title: "", description: "", looking_for: [], location_city: "" },
  });

  const handleSubmit = (values: ComposerValues) => {
    createPost.mutate(
      {
        title: values.title,
        description: values.description,
        looking_for: values.looking_for ?? [],
        location_city: values.location_city || undefined,
      },
      { onSuccess: () => onClose() },
    );
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="network-dialog max-h-[90vh] overflow-y-auto bg-white sm:max-w-[520px]">
        <DialogHeader className="text-left">
          <DialogTitle className="text-[#172b4d]">Post a collaboration</DialogTitle>
          <DialogDescription className="text-[#64748b]">
            Tell other talents what you want to create and who you need. They can express interest and you chat 1:1.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-4 py-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-[#1e3a5f]">Title</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g. Looking for a dancer for a music video"
                      className="h-11 rounded-xl border-[#dbe7f7] bg-[#f8fbff] text-sm shadow-none focus-visible:ring-[#3b82f6]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-[#1e3a5f]">Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={4}
                      placeholder="What are you creating? Where, when, what's in it for collaborators?"
                      className="resize-none rounded-xl border-[#dbe7f7] bg-[#f8fbff] text-sm shadow-none focus-visible:ring-[#3b82f6]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="looking_for"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-[#1e3a5f]">Who do you need?</FormLabel>
                  <FormControl>
                    <TagInput
                      value={field.value ?? []}
                      onChange={field.onChange}
                      suggestions={professionsQuery.data ?? []}
                      maxTags={10}
                      placeholder="e.g. Dancer, Photographer…"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location_city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-[#1e3a5f]">
                    City <span className="font-normal text-[#71809a]">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      placeholder="e.g. Mumbai"
                      className="h-11 rounded-xl border-[#dbe7f7] bg-[#f8fbff] text-sm shadow-none focus-visible:ring-[#3b82f6]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="flex-row justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={createPost.isPending}
                className="h-10 rounded-xl border-[#dbe7f7] text-[#1a5bdb]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createPost.isPending}
                className="h-10 rounded-xl bg-[#1a5bdb] px-6 text-white hover:bg-[#1246b7]"
              >
                {createPost.isPending ? "Publishing…" : "Publish Post"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function InterestDialog({ post, onClose }: { post: CollabPost; onClose: () => void }) {
  const expressInterest = useExpressInterest();
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    expressInterest.mutate(
      { id: post._id, message: message.trim() || undefined },
      { onSuccess: () => onClose() },
    );
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="network-dialog bg-white sm:max-w-[440px]">
        <DialogHeader className="text-left">
          <DialogTitle className="text-[#172b4d]">Express interest</DialogTitle>
          <DialogDescription className="text-[#64748b]">
            {post.owner.full_legal_name || post.owner.username || "The talent"} will receive your
            request for “{post.title}”. On accept you can message 1:1.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 py-2">
          <Label htmlFor="interest-message" className="text-xs font-bold text-[#1e3a5f]">
            Message <span className="font-normal text-[#71809a]">(optional)</span>
          </Label>
          <Textarea
            id="interest-message"
            value={message}
            onChange={(event) => setMessage(event.target.value.slice(0, 500))}
            placeholder="Hi! I'd love to be part of this because…"
            rows={4}
            className="resize-none rounded-xl border-[#dbe7f7] bg-[#f8fbff] text-sm shadow-none focus-visible:ring-[#3b82f6]"
          />
          <p className="text-right text-[10px] text-[#8795aa]">{message.length}/500</p>
        </div>
        <DialogFooter className="flex-row justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={expressInterest.isPending}
            className="h-10 rounded-xl border-[#dbe7f7] text-[#1a5bdb]"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={expressInterest.isPending}
            className="h-10 rounded-xl bg-[#1a5bdb] px-6 text-white hover:bg-[#1246b7]"
          >
            {expressInterest.isPending ? "Sending…" : "Send Interest"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CollabPostCard({ post, onInterest }: { post: CollabPost; onInterest: () => void }) {
  const ownerName = post.owner.full_legal_name || post.owner.username || "Talent";
  const ownerInitials = ownerName.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  const professions = post.owner.professions?.join(" | ") || "Creative professional";
  const visibleTags = post.looking_for.slice(0, 3);
  const extraTags = post.looking_for.length - visibleTags.length;
  const conversation = useStartConversation(post.owner.username ?? "", "talent");

  return (
    <Card className="flex gap-0 rounded-[17px] border-[#dbe7f7] bg-white py-0 shadow-[0_5px_16px_rgba(37,99,235,0.07)]">
      <CardContent className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center gap-2.5">
          <div className="relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-[#edf4ff] text-sm font-bold text-[#1a5bdb]">
            {post.owner.profile_photo ? <Image src={post.owner.profile_photo} alt={ownerName} fill sizes="40px" className="object-cover" /> : ownerInitials}
          </div>
          <div className="min-w-0">
            <p className="flex items-center gap-1 truncate text-[13px] font-bold text-[#203b61]">
              <span className="truncate">{ownerName}</span>
              {post.owner.is_verified ? <BadgeCheck className="size-3.5 shrink-0 fill-[#2387e9] text-white" aria-label="Verified" /> : null}
            </p>
            <p className="truncate text-[10px] font-medium text-[#64748b]">{professions}</p>
          </div>
        </div>

        <div className="min-w-0">
          <h3 className="text-[14px] font-bold leading-snug text-[#193454]">{post.title}</h3>
          <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-[#64748b]">{post.description}</p>
        </div>

        {post.looking_for.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {visibleTags.map((tag) => (
              <Badge key={tag} variant="secondary" className="rounded-full bg-[#eaf2ff] px-2.5 py-1 text-[10px] font-medium text-[#1d4ed8]">
                {tag}
              </Badge>
            ))}
            {extraTags > 0 ? <span className="px-1 py-1 text-[10px] font-semibold text-[#71809a]">+{extraTags} more</span> : null}
          </div>
        ) : null}

        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <span className="flex items-center gap-1.5 text-[10px] font-semibold text-[#64748b]">
            {post.location?.city ? <><MapPin className="size-3 text-[#2563eb]" /> {post.location.city}</> : null}
            <UsersRound className="size-3 text-[#2563eb]" /> {post.interested_count} interested
          </span>
          {post.viewer_interest === "connected" && post.owner.username ? (
            <Button type="button" size="xs" onClick={conversation.start} disabled={conversation.isPending} className="h-8 rounded-lg bg-[#1a5bdb] px-4 text-[10px] font-bold hover:bg-[#1246b7]">Message</Button>
          ) : post.viewer_interest === "pending" ? (
            <Badge className="rounded-full border-0 bg-[#eaf2ff] px-3 py-1.5 text-[10px] font-bold text-[#1d4ed8]">Interest sent</Badge>
          ) : (
            <Button type="button" size="xs" onClick={onInterest} className="h-8 rounded-lg bg-[#1a5bdb] px-4 text-[10px] font-bold hover:bg-[#1246b7]">I&apos;m interested</Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function MyCollabPostRow({ post }: { post: CollabPost }) {
  const closePost = useCloseCollabPost();
  const reopenPost = useReopenCollabPost();
  const deletePost = useDeleteCollabPost();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const busy = closePost.isPending || reopenPost.isPending || deletePost.isPending;

  return (
    <>
      <Card className="gap-0 rounded-[17px] border-[#dbe7f7] bg-white py-0 shadow-[0_5px_16px_rgba(37,99,235,0.07)]">
        <CardContent className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-bold text-[#203b61]">{post.title}</p>
            <p className="mt-0.5 flex items-center gap-2 text-[10px] font-semibold text-[#64748b]">
              <Badge className={cn("rounded-full border-0 px-2 py-0.5 text-[9px] font-bold", post.status === "open" ? "bg-[#c9f6de] text-[#098b51]" : "bg-[#eaf2ff] text-[#1d4ed8]")}>
                {post.status === "open" ? "Open" : "Closed"}
              </Badge>
              <span className="flex items-center gap-1"><UsersRound className="size-3 text-[#2563eb]" /> {post.interested_count} interested</span>
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {post.status === "open" ? (
              <Button type="button" variant="outline" size="sm" onClick={() => closePost.mutate(post._id)} disabled={busy} className="h-8 rounded-lg border-[#dbe7f7] px-3 text-[10px] font-bold text-[#35516f] hover:bg-[#f1f6ff]">Close</Button>
            ) : (
              <Button type="button" variant="outline" size="sm" onClick={() => reopenPost.mutate(post._id)} disabled={busy} className="h-8 rounded-lg border-[#dbe7f7] px-3 text-[10px] font-bold text-[#35516f] hover:bg-[#f1f6ff]">Reopen</Button>
            )}
            <Button type="button" variant="ghost" size="sm" onClick={() => setConfirmDelete(true)} disabled={busy} className="h-8 rounded-lg px-3 text-[10px] font-bold text-[#e3354f] hover:bg-[#fff1f3] hover:text-[#d42744]">Delete</Button>
          </div>
        </CardContent>
      </Card>
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="network-dialog bg-white sm:max-w-[380px]">
          <DialogHeader className="text-left">
          <DialogTitle className="text-[#172b4d]">Delete this post?</DialogTitle>
          <DialogDescription className="text-[#64748b]">
              “{post.title}” will be removed. Existing conversations with interested talents are kept.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setConfirmDelete(false)} className="h-10 rounded-xl border-[#dbe7f7] text-[#1a5bdb]">Keep</Button>
            <Button
              type="button"
              onClick={() => deletePost.mutate(post._id, { onSuccess: () => setConfirmDelete(false) })}
              disabled={deletePost.isPending}
              className="h-10 rounded-xl bg-[#e3354f] px-5 text-white hover:bg-[#c22740]"
            >
              {deletePost.isPending ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function TalentNetworkPage() {
  const router = useRouter();
  const sharedNavItems = useTalentNavItems();
  const mobileNavItems = ["Home", "Network", "Opportunities", "Messages", "Profile"].flatMap(
    (label) => {
      const item = sharedNavItems.find((navItem) => navItem.label === label);
      return item ? [item] : [];
    },
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [requestTab, setRequestTab] = useState<RequestTab>("incoming");
  const [searchParams, setSearchParams] = useState<SearchTalentsParams>({ sort: "newest", limit: 8 });
  const [directoryParams, setDirectoryParams] = useState<PublicRecruiterDirectoryParams>({ sort: "relevance", limit: 12 });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [inviteTarget, setInviteTarget] = useState<{ userId: string; name: string } | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [interestPost, setInterestPost] = useState<CollabPost | null>(null);

  const profileQuery = useTalentProfile();
  const collaboratorQuery = useTalentSearch(searchParams);
  const recruiterQuery = useRecruiterDirectory(directoryParams);
  const projectQuery = useCampaigns({ status: "active", sort: "newest", limit: 4 });
  const feedQuery = useCollabPostsFeed({ search: searchParams.search, limit: 6 });
  const myPostsQuery = useMyCollabPosts({ limit: 20 });
  const requestQuery = useMyRequests();
  const unreadMessages = useUnreadMessages();
  const unreadNotifications = useUnreadNotifications();

  const collaborators = collaboratorQuery.data?.pages.flatMap((page) => page.data) ?? [];
  const collabPosts = feedQuery.data?.pages.flatMap((page) => page.data) ?? [];
  const myCollabPosts = myPostsQuery.data?.pages.flatMap((page) => page.data) ?? [];
  const collabPostTotal = feedQuery.data?.pages[0]?.total ?? 0;
  const recruiters = recruiterQuery.data?.pages.flatMap((page) => page.data) ?? [];
  const projects = projectQuery.data ?? [];
  const receivedRequests = requestQuery.data?.received ?? [];
  const sentRequests = requestQuery.data?.sent ?? [];
  const activeRequests = [...receivedRequests, ...sentRequests].filter(
    (request) => request.status === "accepted" || request.status === "messaging_only",
  );
  const visibleRequests = requestTab === "incoming"
    ? receivedRequests
    : requestTab === "sent"
      ? sentRequests
      : activeRequests;
  // Single lookup shared by every collaborator card: userId → connection state.
  // (Previously each card fetched the whole requests list under its own query key.)
  const connectionByUserId = useMemo(() => {
    const map = new Map<string, ConnectionStatus>();
    const classify = (status: CollaborationRequest["status"]): ConnectionStatus =>
      status === "pending"
        ? "pending"
        : status === "accepted" || status === "messaging_only"
          ? "connected"
          : "none";
    for (const request of sentRequests) {
      const id = request.receiver_id?._id;
      if (id) map.set(id, classify(request.status));
    }
    for (const request of receivedRequests) {
      const id = request.requester_id?._id;
      if (id) map.set(id, classify(request.status));
    }
    return map;
  }, [sentRequests, receivedRequests]);
  const navigation = networkNavigation.map((item) => item.label === "Messages"
    ? { ...item, badge: unreadMessages.data?.count ?? 0 }
    : item);
  const recruiterFilterCount = [directoryParams.category, directoryParams.location_city, directoryParams.specialization, directoryParams.min_rating, directoryParams.verified_only].filter(Boolean).length;
  const resultCount = recruiterQuery.data?.pages[0]?.total ?? 0;
  const collaboratorCount = collaboratorQuery.data?.pages[0]?.total ?? 0;

  const handleFilter = (label: string) => {
    const profession = label.endsWith("s") ? label.slice(0, -1).toLowerCase() : label.toLowerCase();
    if (["Actors", "Models", "Dancers", "Singers", "Musicians", "Creators", "Photographers", "Filmmakers", "Directors", "Writers", "Editors", "Makeup Artists", "Stylists", "Voice Artists"].includes(label)) {
      setSearchParams((current) => ({ ...current, profession, sort: "newest", page: undefined, cursor: undefined }));
      document.getElementById("collaborators")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (label === "Find Collaborators") {
      setSearchParams((current) => ({ ...current, profession: undefined, location_city: undefined, sort: "newest", page: undefined, cursor: undefined }));
      document.getElementById("collaborators")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (label === "Recommended for You") {
      setSearchParams((current) => ({ ...current, profession: undefined, location_city: undefined, sort: "relevance", page: undefined, cursor: undefined }));
      document.getElementById("collaborators")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (label === "Nearby Talent") {
      const city = profileQuery.data?.location?.city;
      if (!city) {
        toast.info("Add a city to your profile to find nearby talent");
        return;
      }
      setSearchParams((current) => ({ ...current, location_city: city, profession: undefined, sort: "newest", page: undefined, cursor: undefined }));
      document.getElementById("collaborators")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (label === "Join a Project") {
      document.getElementById("projects")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (label === "Creative Partners") {
      setSearchParams((current) => ({ ...current, profession: undefined, location_city: undefined, sort: "newest", page: undefined, cursor: undefined }));
      document.getElementById("collaborators")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (label === "Create a Project") {
      setComposerOpen(true);
      return;
    }
  };

  const handleSearch = () => {
    const query = searchQuery.trim();
    setSearchParams((current) => ({ ...current, search: query || undefined, page: undefined, cursor: undefined }));
    setDirectoryParams((current) => ({ ...current, search: query || undefined, page: undefined }));
  };

  const handleDirectoryCategory = (value?: string) => {
    setDirectoryParams((current) => ({ ...current, category: value, verified_only: undefined, page: undefined }));
    document.getElementById("recruiters")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const clearFilters = () => {
    setSearchParams((current) => ({
      ...current,
      profession: undefined,
      location_city: undefined,
      availability: undefined,
      page: undefined,
      cursor: undefined,
    }));
    setDirectoryParams((current) => ({ ...current, category: undefined, location_city: undefined, specialization: undefined, min_rating: undefined, verified_only: undefined, page: undefined }));
  };

  return (
    <div className="network-page-theme min-h-screen bg-[#f7f9fc] pb-20 text-foreground md:pb-8">
      <header className="bg-white backdrop-blur-xl">
        <div className="mx-auto flex h-[62px] max-w-[1440px] items-center justify-between gap-4 px-4 sm:h-[78px] sm:px-6 lg:px-10">
          <Link href="/talent/network" className="flex min-w-0 items-center gap-2.5" aria-label="Rootin talent network">
            <Image src={logoImage} alt="RootIn" height={36} className="h-8 w-auto sm:h-10" priority />
          </Link>

          <nav className="hidden flex-1 items-center justify-center gap-1 md:flex" aria-label="Talent navigation">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Button key={item.label} asChild variant="ghost" size="sm" className={cn("relative gap-1.5 rounded-full px-4 text-xs font-semibold text-[#64748b] hover:bg-[#eff6ff] hover:text-[#1a5bdb]", item.active && "bg-[#eaf2ff] text-[#1a5bdb]")}>
                  <Link href={item.href} aria-current={item.active ? "page" : undefined}>
                    <Icon className="size-4" /> {item.label}
                    {item.badge ? <span className="grid size-4 place-items-center rounded-full bg-[#ef3157] text-[9px] font-bold text-white">{item.badge}</span> : null}
                  </Link>
                </Button>
              );
            })}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button asChild variant="ghost" size="icon-lg" aria-label="Notifications" className="relative rounded-full bg-[#f3f7ff] text-[#1e4b9a] hover:bg-[#eaf2ff] hover:text-[#1a5bdb]">
              <Link href="/talent/notifications">
                <Bell className="size-5" />
                {unreadNotifications.data?.count ? <span className="absolute right-0.5 top-0.5 grid size-[17px] place-items-center rounded-full bg-[#ef3157] text-[9px] font-bold text-white">{unreadNotifications.data.count}</span> : null}
              </Link>
            </Button>
            <Button asChild variant="ghost" size="icon-lg" aria-label="Open profile" className="rounded-full p-0 hover:bg-transparent">
              <Link href="/talent/profile" className="relative overflow-hidden rounded-full border-2 border-[#dbe7f7]">
                {profileQuery.data?.profile_photo ? <Image src={profileQuery.data.profile_photo} alt="Your profile" fill sizes="40px" className="object-cover" /> : <span className="grid size-full place-items-center bg-[#eaf2ff] text-sm font-bold text-[#1a5bdb]">{(profileQuery.data?.full_legal_name || profileQuery.data?.username || "U").slice(0, 1).toUpperCase()}</span>}
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden bg-[#f7f9fc]">
          <Image src="/images/collaboration-banner.png" alt="Creative collaborators working together" fill priority sizes="100vw" className="hidden object-cover object-right opacity-70 sm:block" />
          <div className="absolute inset-0 hidden bg-[linear-gradient(90deg,rgba(247,250,255,0.99)_0%,rgba(247,250,255,0.94)_48%,rgba(247,250,255,0.56)_100%)] sm:block" />
          <div className="relative mx-auto max-w-[1440px] px-4 pb-1 pt-5 sm:px-6 sm:pb-7 sm:pt-12 lg:px-10">
            <div className="max-w-[700px]">
              <h1 className="font-display text-[24px] font-bold leading-[1.08] tracking-[-0.05em] text-[#102d55] sm:text-5xl lg:text-[56px]">Find your creative collaborators</h1>
              <p className="mt-2 max-w-[560px] text-[13px] leading-relaxed text-[#64748b] sm:text-lg">Connect with verified talents, start conversations and build work together.</p>
            </div>

            <Card className="mt-5 max-w-[1080px] gap-0 rounded-2xl border-0 bg-white py-0 shadow-[0_4px_16px_rgba(15,23,42,0.06)] sm:mt-8">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <label htmlFor="network-search" className="block text-[12px] font-bold text-[#1e3a5f] sm:text-base">Search collaborators</label>
                    <Input
                      id="network-search"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      onKeyDown={(event) => { if (event.key === "Enter") handleSearch(); }}
                      placeholder="Actors, dancers, photographers…"
                      className="h-6 border-0 bg-transparent p-0 text-[11px] text-[#52677f] shadow-none placeholder:text-[#71809a] focus-visible:ring-0 sm:text-sm"
                    />
                  </div>
                  <Button type="button" size="icon-lg" onClick={handleSearch} aria-label="Search network" className="size-11 rounded-xl bg-[#1a5bdb] text-white shadow-[0_5px_12px_rgba(26,91,219,0.22)] hover:bg-[#1246b7]">
                    <Search className="size-5" />
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setFiltersOpen(true)}
                  className="mt-3 h-11 w-full justify-start gap-2 rounded-xl px-1 text-xs font-medium text-[#52677f] hover:bg-[#f7f9fc] hover:text-[#1e3a5f]"
                >
                  <MapPin className="size-4 text-[#2563eb]" />
                  <span className="truncate">{directoryParams.location_city || "All locations"}</span>
                  <ChevronRight className="ml-auto size-4 rotate-90 text-[#7890ad]" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
          <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pt-5 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setFiltersOpen(true)}
              className="h-11 shrink-0 gap-1.5 rounded-xl border-[#d6e0ec] bg-white px-4 text-[12px] font-semibold text-[#35516f] hover:border-[#93b9f2] hover:bg-[#f7f9fc] hover:text-[#1a5bdb]"
            >
              <SlidersHorizontal className="size-4" /> Filters{recruiterFilterCount > 0 ? ` (${recruiterFilterCount})` : ""}
            </Button>
            <Button type="button" onClick={() => handleFilter("Find Collaborators")} className="h-11 shrink-0 gap-1.5 rounded-xl bg-[#1a5bdb] px-4 text-[12px] font-bold text-white shadow-[0_5px_12px_rgba(26,91,219,0.2)] hover:bg-[#1246b7]">
              <UsersRound className="size-4" /> Find Collaborators
            </Button>
            <Button type="button" variant="outline" onClick={() => handleFilter("Join a Project")} className="h-11 shrink-0 gap-1.5 rounded-xl border-[#d6e0ec] bg-white px-4 text-[12px] font-semibold text-[#35516f] hover:border-[#93b9f2] hover:bg-[#f7f9fc] hover:text-[#1a5bdb]">
              <Clapperboard className="size-4" /> Join a Project
            </Button>
          </div>

          <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
            {recruiterCategoryOptions.map((category) => {
              const active = category.value === directoryParams.category && !directoryParams.verified_only;
              return <Button key={category.label} type="button" variant="outline" onClick={() => handleDirectoryCategory(category.value)} aria-pressed={active} className={cn("h-9 shrink-0 rounded-full border-[#d6e0ec] bg-white px-3 text-[11px] font-semibold text-[#52677f] hover:border-[#93b9f2] hover:bg-[#f7f9fc] hover:text-[#1a5bdb]", active && "border-[#1a5bdb] bg-[#eef4ff] text-[#1a5bdb] hover:border-[#1a5bdb] hover:bg-[#eef4ff]")}>{category.label}</Button>;
            })}
          </div>

          <section className="pt-6 sm:pt-7">
            <SectionHeading title="Collaboration Categories" />
            <div className="no-scrollbar -mx-4 mt-3 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-7 sm:gap-3 sm:overflow-visible sm:px-0 lg:grid-cols-8">
              {categories.map((category) => <div key={category.label} className="w-[84px] shrink-0 snap-start sm:w-auto"><CategoryTile {...category} onClick={() => handleFilter(category.label)} /></div>)}
            </div>
          </section>

          <Drawer open={filtersOpen} onOpenChange={setFiltersOpen}>
            <DrawerContent className="max-h-[88vh] bg-white">
              <DrawerHeader className="border-b border-[#e6eef9] text-left">
                <DrawerTitle className="text-[#172b4d]">Filter discovery</DrawerTitle>
              </DrawerHeader>
              <div className="grid gap-4 overflow-y-auto px-4 py-5">
                <label className="grid gap-2 text-xs font-bold text-[#1e3a5f]">
                  Category
                  <select
                    value={directoryParams.category ?? ""}
                    onChange={(event) => setDirectoryParams((current) => ({ ...current, category: event.target.value || undefined, verified_only: undefined, page: undefined }))}
                    className="h-11 rounded-xl border border-[#dbe7f7] bg-[#f8fbff] px-3 text-sm font-normal text-[#334e68] outline-none focus:border-[#3b82f6]"
                  >
                    {recruiterCategoryOptions.map((option) => <option key={option.label} value={option.value ?? ""}>{option.label}</option>)}
                  </select>
                </label>
                <label className="grid gap-2 text-xs font-bold text-[#1e3a5f]">
                  Location
                  <Input
                    value={directoryParams.location_city ?? ""}
                    onChange={(event) => setDirectoryParams((current) => ({ ...current, location_city: event.target.value || undefined, page: undefined }))}
                    placeholder="City"
                    className="h-11 rounded-xl border-[#dbe7f7] bg-[#f8fbff] text-sm shadow-none focus-visible:ring-[#3b82f6]"
                  />
                </label>
                <label className="grid gap-2 text-xs font-bold text-[#1e3a5f]">
                  Specialization
                  <Input
                    value={directoryParams.specialization ?? ""}
                    onChange={(event) => setDirectoryParams((current) => ({ ...current, specialization: event.target.value || undefined, page: undefined }))}
                    placeholder="e.g. Feature Films"
                    className="h-11 rounded-xl border-[#dbe7f7] bg-[#f8fbff] text-sm shadow-none focus-visible:ring-[#3b82f6]"
                  />
                </label>
                <label className="grid gap-2 text-xs font-bold text-[#1e3a5f]">
                  Minimum rating
                  <select
                    value={directoryParams.min_rating?.toString() ?? ""}
                    onChange={(event) => setDirectoryParams((current) => ({ ...current, min_rating: event.target.value ? Number(event.target.value) : undefined, page: undefined }))}
                    className="h-11 rounded-xl border border-[#dbe7f7] bg-[#f8fbff] px-3 text-sm font-normal text-[#334e68] outline-none focus:border-[#3b82f6]"
                  >
                    <option value="">Any rating</option>
                    <option value="4">4.0 and above</option>
                    <option value="4.5">4.5 and above</option>
                  </select>
                </label>
                <label className="flex items-center gap-3 rounded-xl bg-[#f3f7ff] px-3 py-3 text-xs font-bold text-[#1e3a5f]">
                  <input type="checkbox" checked={directoryParams.verified_only ?? false} onChange={(event) => setDirectoryParams((current) => ({ ...current, verified_only: event.target.checked || undefined, category: event.target.checked ? undefined : current.category, page: undefined }))} className="size-4 accent-[#1a5bdb]" />
                  Verified only
                </label>
              </div>
              <DrawerFooter className="flex-row border-t border-[#e6eef9] bg-[#f8fbff]">
                <Button type="button" variant="outline" onClick={clearFilters} className="h-11 flex-1 rounded-xl border-[#dbe7f7] text-[#1a5bdb]">Clear All</Button>
                <DrawerClose asChild><Button type="button" className="h-11 flex-1 rounded-xl bg-[#1a5bdb] text-white hover:bg-[#1246b7]">Apply Filters</Button></DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>

          <section id="collaborators" className="scroll-mt-5 pt-6 sm:pt-8">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-[#35516f]">
                <span className="text-[#172b4d]">{collaboratorCount.toLocaleString()}</span> talents open to collaborate
              </p>
                <Button
                type="button"
                variant="outline"
                onClick={() => setSearchParams((current) => ({ ...current, sort: current.sort === "relevance" ? "newest" : "relevance", page: undefined, cursor: undefined }))}
                className="h-9 rounded-full border-[#dbe7f7] bg-white px-3 text-[11px] font-semibold text-[#35516f] hover:bg-[#eff6ff]"
              >
                Sort: {searchParams.sort === "relevance" ? "Relevance" : "Newest"} <ChevronRight className="size-3.5 rotate-90" />
              </Button>
            </div>
            <SectionHeading
              title="Talents you can collaborate with"
              icon={<Badge className="gap-1 rounded-full border-0 bg-[#eaf2ff] px-2 py-1 text-[10px] font-bold text-[#1d4ed8]"><Sparkles className="size-3" /> Live Results</Badge>}
              onAction={() => { if (collaboratorQuery.hasNextPage && !collaboratorQuery.isFetchingNextPage) void collaboratorQuery.fetchNextPage(); }}
            />
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-4">
              {collaboratorQuery.isLoading ? Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-[390px] rounded-[20px]" />) : collaborators.map((collaborator) => (
                <CollaboratorCard
                  key={collaborator._id}
                  collaborator={collaborator}
                  connectionStatus={connectionByUserId.get(collaborator.user_id) ?? "none"}
                  onInvite={() => setInviteTarget({
                    userId: collaborator.user_id,
                    name: collaborator.full_legal_name || collaborator.username,
                  })}
                />
              ))}
            </div>
            {!collaboratorQuery.isLoading && collaboratorQuery.isError ? <p className="mt-4 text-sm text-[#bd3e5b]">Unable to load collaborators. Please try again.</p> : null}
            {!collaboratorQuery.isLoading && !collaboratorQuery.isError && collaborators.length === 0 ? <p className="mt-4 text-sm text-[#64748b]">No collaborators match your search.</p> : null}
          </section>

          <section id="collab-posts" className="scroll-mt-5 pt-6 sm:pt-8">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-[#35516f]">
                <span className="text-[#172b4d]">{collabPostTotal.toLocaleString()}</span> open collabs from talents
              </p>
              <Button
                type="button"
                onClick={() => setComposerOpen(true)}
                className="h-9 gap-1.5 rounded-full bg-gradient-to-r from-[#2563eb] to-[#1a5bdb] px-4 text-[11px] font-bold text-white shadow-[0_6px_14px_rgba(37,99,235,0.24)] hover:from-[#1d4ed8] hover:to-[#1246b7]"
              >
                <Plus className="size-3.5" /> Post a collab
              </Button>
            </div>
            <SectionHeading
              title="Open collabs from talents"
              icon={<Badge className="gap-1 rounded-full border-0 bg-[#eaf2ff] px-2 py-1 text-[10px] font-bold text-[#1d4ed8]"><Clapperboard className="size-3" /> Talent posted</Badge>}
              onAction={() => { if (feedQuery.hasNextPage && !feedQuery.isFetchingNextPage) void feedQuery.fetchNextPage(); }}
            />
            {myCollabPosts.length > 0 ? (
              <div className="mt-3 space-y-2">
                <p className="px-1 text-[11px] font-bold uppercase tracking-wide text-[#71809a]">Your posts</p>
                {myCollabPosts.map((post) => <MyCollabPostRow key={post._id} post={post} />)}
              </div>
            ) : null}
            {feedQuery.isPending ? (
              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-3">{Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-[240px] rounded-[17px]" />)}</div>
            ) : feedQuery.isError ? (
              <div className="mt-3 rounded-[17px] border border-[#dbe7f7] bg-white px-5 py-8 text-center shadow-[0_5px_16px_rgba(37,99,235,0.06)]"><p className="font-semibold text-[#294b70]">We couldn&apos;t load collab posts right now.</p><Button type="button" variant="outline" onClick={() => feedQuery.refetch()} className="mt-3 rounded-xl border-[#3b82f6] text-[#1d4ed8]">Try again</Button></div>
            ) : collabPosts.length === 0 ? (
              <div className="mt-3 rounded-[17px] border border-dashed border-[#b9d0ee] bg-white/70 px-5 py-8 text-center">
                <p className="font-semibold text-[#294b70]">No open collabs yet — be the first to post one.</p>
                <p className="mt-1 text-sm text-[#71809a]">Describe what you want to create and who you need.</p>
                <Button type="button" onClick={() => setComposerOpen(true)} className="mt-4 h-10 rounded-xl bg-[#1a5bdb] px-6 text-white hover:bg-[#1246b7]">Post a collab</Button>
              </div>
            ) : (
              <div className={cn("mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-3", feedQuery.isFetching && "opacity-60")}>
                {collabPosts.map((post) => <CollabPostCard key={post._id} post={post} onInterest={() => setInterestPost(post)} />)}
              </div>
            )}
            {feedQuery.isFetchingNextPage ? <p className="mt-4 text-center text-sm text-[#71809a]">Loading more collabs...</p> : null}
          </section>

          <section id="recruiters" className="scroll-mt-5 pt-6 sm:pt-8">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-[#35516f]"><span className="text-[#172b4d]">{resultCount.toLocaleString()}</span> {directoryParams.verified_only ? "verified organizations" : "organizations found"}</p>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDirectoryParams((current) => ({ ...current, sort: current.sort === "rating" ? "relevance" : "rating", page: undefined }))}
                className="h-9 rounded-full border-[#dbe7f7] bg-white px-3 text-[11px] font-semibold text-[#35516f] hover:bg-[#eff6ff]"
              >
                Sort: {directoryParams.sort === "rating" ? "Rating" : "Relevance"} <ChevronRight className="size-3.5 rotate-90" />
              </Button>
            </div>
            <SectionHeading
              title="Recruiters & agencies"
              icon={<Badge className="gap-1 rounded-full border-0 bg-[#eaf2ff] px-2 py-1 text-[10px] font-bold text-[#1d4ed8]"><ShieldCheck className="size-3" /> Real profiles</Badge>}
              onAction={() => { if (recruiterQuery.hasNextPage && !recruiterQuery.isFetchingNextPage) void recruiterQuery.fetchNextPage(); }}
            />
            {recruiterQuery.isPending ? (
              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-[420px] rounded-[20px]" />)}</div>
            ) : recruiterQuery.isError ? (
              <div className="mt-3 rounded-[20px] border border-[#dbe7f7] bg-white px-5 py-10 text-center shadow-[0_8px_26px_rgba(37,99,235,0.06)]"><p className="font-semibold text-[#294b70]">We couldn&apos;t load recruiters right now.</p><p className="mt-1 text-sm text-[#71809a]">Please try again in a moment.</p><Button type="button" variant="outline" onClick={() => recruiterQuery.refetch()} className="mt-4 rounded-xl border-[#3b82f6] text-[#1d4ed8]">Try again</Button></div>
            ) : recruiters.length === 0 ? (
              <div className="mt-3 rounded-[20px] border border-[#dbe7f7] bg-white px-5 py-10 text-center shadow-[0_8px_26px_rgba(37,99,235,0.06)]"><p className="font-semibold text-[#294b70]">No recruiters or agencies match your filters.</p><p className="mt-1 text-sm text-[#71809a]">Clear a filter or change your search to see more real profiles.</p><Button type="button" variant="outline" onClick={clearFilters} className="mt-4 rounded-xl border-[#3b82f6] text-[#1d4ed8]">Clear filters</Button></div>
            ) : (
              <div className={cn("mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-4", recruiterQuery.isFetching && "opacity-60")}>{recruiters.map((recruiter) => <RecruiterCard key={recruiter.slug} recruiter={recruiter} />)}</div>
            )}
            {recruiterQuery.isFetchingNextPage ? <p className="mt-4 text-center text-sm text-[#71809a]">Loading more organizations...</p> : null}
          </section>

          <section id="projects" className="scroll-mt-5 pt-5 sm:pt-7">
            <SectionHeading title="Active Collaboration Projects" onAction={() => router.push("/talent/opportunities")} />
            <div className="no-scrollbar -mx-1 mt-3 flex snap-x gap-3 overflow-x-auto px-1 pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible">
              {projectQuery.isLoading ? Array.from({ length: 2 }).map((_, index) => <Skeleton key={index} className="h-[190px] rounded-[17px]" />) : projects.map((project) => <ProjectCard key={project._id} project={project} />)}
            </div>
            {!projectQuery.isLoading && projectQuery.isError ? <p className="mt-4 text-sm text-[#bd3e5b]">Unable to load active projects.</p> : null}
            {!projectQuery.isLoading && !projectQuery.isError && projects.length === 0 ? <p className="mt-4 text-sm text-[#64748b]">No active projects are available right now.</p> : null}
            <Button asChild className="mt-3 h-[62px] w-full justify-between rounded-[14px] bg-gradient-to-r from-[#2563eb] to-[#1a5bdb] px-5 text-white shadow-[0_8px_22px_rgba(37,99,235,0.26)] hover:from-[#1d4ed8] hover:to-[#1246b7]">
              <Link href="/talent/opportunities">
              <span className="flex items-center gap-2.5 text-left"><Plus className="size-5" /><span><span className="block text-[15px] font-bold">Explore More Opportunities</span><span className="block text-[10px] font-medium text-white/80">Find active projects and apply to the right opportunities.</span></span></span>
              <ArrowRight className="size-5" />
              </Link>
            </Button>
          </section>

          <section className="pt-6 sm:pt-8">
            <SectionHeading title="Collaboration Requests" onAction={() => router.push("/talent/requests")} />
            <div className="mt-3 flex w-fit rounded-full bg-[#edf4ff] p-0.5">
              {requestTabs.map((tab) => (
                <Button key={tab.id} type="button" variant="ghost" onClick={() => setRequestTab(tab.id)} className={cn("h-9 rounded-full px-4 text-[11px] font-medium text-[#35516f] hover:bg-[#dbeafe] hover:text-[#1a5bdb]", requestTab === tab.id && "bg-gradient-to-r from-[#2563eb] to-[#1a5bdb] font-bold text-white shadow-[0_4px_9px_rgba(37,99,235,0.2)] hover:bg-[#1a5bdb] hover:text-white")}>
                  {tab.label} ({tab.id === "incoming" ? receivedRequests.length : tab.id === "sent" ? sentRequests.length : activeRequests.length})
                </Button>
              ))}
            </div>

            {requestQuery.isLoading ? <Skeleton className="mt-3 h-32 rounded-[17px]" /> : null}
            {!requestQuery.isLoading && requestQuery.isError ? <p className="mt-4 text-sm text-[#bd3e5b]">Unable to load collaboration requests.</p> : null}
             {!requestQuery.isLoading && !requestQuery.isError && visibleRequests.length === 0 ? <p className="mt-4 text-sm text-[#64748b]">No requests in this section.</p> : null}
            <div className="mt-3 space-y-3">
              {!requestQuery.isLoading && visibleRequests.map((request) => (
                <NetworkRequestCard key={request._id} request={request} currentUserId={profileQuery.data?.user_id ?? ""} incoming={requestTab === "incoming"} />
              ))}
            </div>
          </section>

          <Card className="mb-5 mt-7 gap-0 overflow-hidden rounded-[17px] border-[#dbe7f7] bg-white py-0 shadow-[0_5px_16px_rgba(37,99,235,0.06)] sm:mb-7">
            <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-5 sm:p-5">
              <div className="flex items-center gap-3 sm:min-w-[225px]">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#cff8e1] text-[#078954]"><ShieldCheck className="size-7" /></span>
              <div><p className="text-[12px] font-bold text-[#294b70]">Safer Collaboration Community</p><p className="mt-0.5 text-[10px] leading-snug text-[#64748b]">Profile and safety tools<br />Professional. Meaningful Collaborations.</p></div>
              </div>
              <div className="grid flex-1 grid-cols-5 divide-x divide-[#dbe7f7] border-y border-[#e6eef9] py-3 sm:border-y-0 sm:border-l sm:py-0">
                {[{ icon: BadgeCheck, label: "Identity", sub: "Verified" }, { icon: FileText, label: "Professional", sub: "Profile" }, { icon: BriefcaseBusiness, label: "Previous", sub: "Projects" }, { icon: Star, label: "Reputation", sub: "" }, { icon: Waypoints, label: "Collaboration", sub: "History" }].map((item) => { const Icon = item.icon; return <div key={item.label} className="flex flex-col items-center gap-1 px-1 text-center text-[#49627e]"><span className="grid size-8 place-items-center rounded-full bg-[#d9f9e7] text-[#10945b]"><Icon className="size-4" /></span><span className="text-[9px] font-semibold leading-tight">{item.label}<br />{item.sub}</span></div>; })}
              </div>
              <Button asChild type="button" variant="ghost" className="h-auto shrink-0 flex-col gap-1 rounded-xl px-3 py-2 text-[10px] font-semibold text-[#e3354f] hover:bg-[#fff1f3] hover:text-[#d42744]"><Link href="/talent/safety"><X className="size-5" />Report / Safety</Link></Button>
            </CardContent>
          </Card>
        </div>
      </main>

      {inviteTarget ? (
        <InviteDialog
          key={inviteTarget.userId}
          target={inviteTarget}
          onClose={() => setInviteTarget(null)}
        />
      ) : null}

      {composerOpen ? <CollabPostComposerDialog onClose={() => setComposerOpen(false)} /> : null}
      {interestPost ? (
        <InterestDialog
          key={interestPost._id}
          post={interestPost}
          onClose={() => setInterestPost(null)}
        />
      ) : null}

       <BottomBar navItems={sharedNavItems} mobileNavItems={mobileNavItems} iconOnly />
    </div>
  );
}
