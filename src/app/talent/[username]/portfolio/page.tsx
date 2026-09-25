"use client";

/* eslint-disable @next/next/no-img-element */

import { Suspense, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useStore } from "zustand/react";
import { authStore } from "@/stores/auth-store";
import { toast } from "sonner";
import {
  ArrowLeft,
  BadgeCheck,
  Clapperboard,
  FileText,
  Eye,
  Bookmark,
  Loader2,
  Images,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Plane,
  Play,
  Plus,
  Video,
} from "lucide-react";
import {
  usePublicPortfolio,
  useUploadPortfolioImage,
  useUploadPortfolioVideo,
  useUploadPortfolioYouTube,
  useUpdatePortfolioItem,
  useDeletePortfolioItem,
  useReorderPortfolio,
} from "@/hooks/use-portfolio";
import {
  usePublicTalentProfile,
} from "@/hooks/use-talent-profile";
import { useSaveTalent, useStartConversation } from "@/hooks/use-talent-actions";
import {
  isPrivateTalentProfileResponse,
} from "@/lib/api/talent";
import type {
  PortfolioItem,
  PortfolioItemType,
} from "@/lib/types/portfolio";
import { PortfolioActions } from "@/components/portfolio/PortfolioActions";
import { PortfolioReelOverlay } from "@/components/portfolio/PortfolioReelOverlay";
import { AddPortfolioModal } from "@/components/portfolio/AddPortfolioModal";
import { EditPortfolioModal } from "@/components/portfolio/EditPortfolioModal";
import { ReorderSheet } from "@/components/portfolio/ReorderSheet";
import { ShareSheet } from "@/components/portfolio/ShareSheet";
import { EmptyPortfolioState } from "@/components/portfolio/EmptyPortfolioState";
import { PortfolioSkeleton } from "@/components/portfolio/PortfolioSkeleton";
import { ProfileHighlightsStatus } from "@/components/talent-app/portfolio/profile-highlights-status";
import type { LucideIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ShowcaseTab = "Showreel" | "Videos" | "Photos" | "Documents";

const showcaseTabs: { id: ShowcaseTab; label: string; icon: LucideIcon }[] = [
  { id: "Showreel", label: "Showreel", icon: Clapperboard },
  { id: "Videos", label: "Videos", icon: Video },
  { id: "Photos", label: "Photos", icon: Images },
  { id: "Documents", label: "Documents", icon: FileText },
];

function formatLocation(location?: {
  country?: string;
  state?: string;
  city?: string;
}) {
  return [location?.city, location?.state, location?.country]
    .filter(Boolean)
    .join(", ");
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function MediaThumbnail({
  item,
  className = "",
}: {
  item: PortfolioItem;
  className?: string;
}) {
  if (item.type === "video" && !item.thumbnailUrl) {
    return (
      <video
        src={item.url}
        className={`h-full w-full object-cover ${className}`}
        muted
        playsInline
        preload="metadata"
      />
    );
  }

  return (
    <img
      src={item.thumbnailUrl || item.url}
      alt={item.title}
      className={`h-full w-full object-cover ${className}`}
      loading="lazy"
    />
  );
}

function PlayMark({ large = false }: { large?: boolean }) {
  return (
    <span
      className={`grid place-items-center rounded-full border-2 border-white/90 bg-slate-950/40 text-white backdrop-blur-sm ${
        large ? "size-16" : "size-10"
      }`}
    >
      <Play className={`${large ? "size-7" : "size-4"} fill-current`} />
    </span>
  );
}

function ShowcaseSectionHeader({
  icon: Icon,
  title,
  count,
  tone,
  onViewAll,
}: {
  icon: LucideIcon;
  title: string;
  count: number;
  tone: "purple" | "pink" | "blue" | "indigo";
  onViewAll?: () => void;
}) {
  const toneClasses = {
    purple: "from-violet-600 to-fuchsia-500",
    pink: "from-pink-500 to-rose-500",
    blue: "from-cyan-500 to-blue-600",
    indigo: "from-blue-600 to-indigo-600",
  };

  return (
    <div className="mb-3 flex items-center gap-2.5">
      <span
        className={`grid size-9 place-items-center rounded-xl bg-gradient-to-br text-white shadow-sm ${toneClasses[tone]}`}
      >
        <Icon className="size-5" />
      </span>
      <h2 className="text-[19px] font-extrabold tracking-tight text-[#12204a]">
        {title} <span className="text-[#651fff]">({count})</span>
      </h2>
      {onViewAll && count > 0 && (
        <button
          type="button"
          onClick={onViewAll}
          className="ml-auto inline-flex items-center gap-1 text-sm font-bold text-[#641cff] hover:text-[#4311bd]"
        >
          View All <span aria-hidden>›</span>
        </button>
      )}
    </div>
  );
}

function PortfolioContent() {
  const params = useParams();
  const router = useRouter();
  const username = (params?.username as string) || "";
  const user = useStore(authStore, (s) => s.user);
  const isOwner =
    !!user?.username &&
    user.username.toLowerCase() === username.toLowerCase();
  const viewerRole = user?.role ?? null;
  const { start: startConversation, isPending: messagePending } = useStartConversation(username, viewerRole);
  const { isSaved, isPending: savePending, toggleSave } = useSaveTalent(username);

  const {
    data: items = [],
    isLoading,
    error,
  } = usePublicPortfolio(username);
  const {
    data: profileResponse,
    isLoading: profileLoading,
    error: profileError,
  } = usePublicTalentProfile(username);

  const profile = profileResponse
    ? isPrivateTalentProfileResponse(profileResponse)
      ? profileResponse.preview
      : profileResponse
    : undefined;

  const sortedItems = useMemo(
    () =>
      [...items].sort(
        (a, b) => Number(b.isFeatured) - Number(a.isFeatured),
      ),
    [items],
  );

  const [activeTab, setActiveTab] = useState<ShowcaseTab>("Showreel");

  const searchParams = useSearchParams();
  const initialItemIdFromUrl = searchParams.get("item");
  const [reelOpen, setReelOpen] = useState(() => !!initialItemIdFromUrl);
  const [reelInitialItemId, setReelInitialItemId] = useState<string | null>(
    () => initialItemIdFromUrl,
  );
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<PortfolioItem | null>(null);
  const [showreelCandidate, setShowreelCandidate] = useState<PortfolioItem | null>(null);
  const [reorderOpen, setReorderOpen] = useState(false);
  const [shareItem, setShareItem] = useState<PortfolioItem | null>(null);

  const uploadImage = useUploadPortfolioImage();
  const uploadVideo = useUploadPortfolioVideo();
  const uploadYouTube = useUploadPortfolioYouTube();
  const updateItem = useUpdatePortfolioItem();
  const deleteItem = useDeletePortfolioItem();
  const reorder = useReorderPortfolio();

  const isSubmitting =
    uploadImage.isPending ||
    uploadVideo.isPending ||
    uploadYouTube.isPending ||
    updateItem.isPending ||
    deleteItem.isPending ||
    reorder.isPending;

  const mediaItems = useMemo(
    () => sortedItems.filter((item) => ["image", "video", "youtube"].includes(item.type)),
    [sortedItems],
  );
  const showreel = useMemo(
    () => mediaItems.find((item) => item.profileHighlightType === "showreel"),
    [mediaItems],
  );
  const videoItems = useMemo(
    () => mediaItems.filter((item) => (item.type === "video" || item.type === "youtube") && item.id !== showreel?.id),
    [mediaItems, showreel],
  );
  const photoItems = useMemo(
    () => mediaItems.filter((item) => item.type === "image"),
    [mediaItems],
  );
  const documentItems = useMemo(
    () => sortedItems.filter((item) => item.type === "document"),
    [sortedItems],
  );

  const handleTabChange = useCallback((tab: ShowcaseTab) => {
    setActiveTab(tab);
  }, []);

  const handleItemClick = useCallback((item: PortfolioItem) => {
    setReelInitialItemId(item.id);
    setReelOpen(true);
  }, []);

  const handleCloseReel = useCallback(() => {
    setReelOpen(false);
    setReelInitialItemId(null);
  }, []);

  const handleAddWork = useCallback(
    async (data: {
      type: PortfolioItemType;
      title: string;
      description?: string;
      file?: File;
      thumbnail?: File;
      url?: string;
      isFeatured: boolean;
    }) => {
      const basePayload = {
        title: data.title,
        caption: data.title,
        description: data.description,
        category: "work" as const,
      };

      try {
        if (data.type === "image" && data.file) {
          await uploadImage.mutateAsync({ file: data.file, data: basePayload });
        } else if (data.type === "video" && data.file) {
          await uploadVideo.mutateAsync({
            file: data.file,
            thumbnail: data.thumbnail,
            data: basePayload,
          });
        } else if (data.type === "youtube" && data.url) {
          await uploadYouTube.mutateAsync({
            url: data.url,
            data: basePayload,
          });
        }
        toast.success("Work published successfully");
        setAddOpen(false);
      } catch {
        toast.error("Failed to publish work. Please try again.");
      }
    },
    [uploadImage, uploadVideo, uploadYouTube],
  );

  const handleEdit = useCallback(
    async (
      itemId: string,
      data: {
        title: string;
        description?: string;
        isFeatured: boolean;
        visibility: PortfolioItem["visibility"];
        skills: string[];
      },
    ) => {
      try {
        const currentItem = items.find((item) => item.id === itemId);
        await updateItem.mutateAsync({
          itemId,
          data: {
            title: data.title,
            caption: data.title,
            description: data.description,
            profile_highlight_type: data.isFeatured
              ? currentItem?.profileHighlightType || (currentItem?.type === "image" ? "image" : "video")
              : null,
            category: "work",
          },
        });
        toast.success("Changes saved");
        setEditItem(null);
      } catch {
        toast.error("Failed to save changes");
      }
    },
    [items, updateItem],
  );

  const handleToggleFeatured = useCallback(
    async (item: PortfolioItem) => {
      if (!item.profileHighlightType) {
        const isImage = item.type === "image";
        const count = items.filter(
          (candidate) => candidate.profileHighlightType === (isImage ? "image" : "video"),
        ).length;
        if (count >= (isImage ? 4 : 3)) {
          toast.error(isImage ? "4 photos already featured" : "3 videos already featured", {
            description: isImage
              ? "Remove a featured photo before adding another."
              : "Remove a featured video before adding another.",
          });
          return;
        }
      }

      try {
        await updateItem.mutateAsync({
          itemId: item.id,
          data: {
            profile_highlight_type: item.profileHighlightType
              ? null
              : item.type === "image"
                ? "image"
                : "video",
          },
        });
        toast.success(item.profileHighlightType ? "Removed from public profile" : "Added to public profile");
      } catch {
        toast.error("Failed to update public profile selection");
      }
    },
    [items, updateItem],
  );

  const handleSetShowreel = useCallback(
    async (item: PortfolioItem) => {
      if (item.profileHighlightType === "showreel") {
        await handleToggleFeatured(item);
        return;
      }
      const currentShowreel = items.find((candidate) => candidate.profileHighlightType === "showreel");
      if (currentShowreel) {
        setShowreelCandidate(item);
        return;
      }
      try {
        await updateItem.mutateAsync({
          itemId: item.id,
          data: { profile_highlight_type: "showreel" },
        });
        toast.success("Showreel added to public profile");
      } catch {
        toast.error("Failed to set showreel");
      }
    },
    [handleToggleFeatured, items, updateItem],
  );

  const replaceShowreel = useCallback(async () => {
    if (!showreelCandidate) return;
    try {
      await updateItem.mutateAsync({
        itemId: showreelCandidate.id,
        data: {
          profile_highlight_type: "showreel",
          replace_profile_highlight: true,
        },
      });
      setShowreelCandidate(null);
      toast.success("Showreel replaced");
    } catch {
      toast.error("Failed to replace showreel");
    }
  }, [showreelCandidate, updateItem]);

  const handleDelete = useCallback(
    async (item: PortfolioItem) => {
      if (!confirm("Delete this work? This cannot be undone.")) return;
      try {
        await deleteItem.mutateAsync(item.id);
        toast.success("Work deleted");
      } catch {
        toast.error("Failed to delete work");
      }
    },
    [deleteItem],
  );

  const handleReorder = useCallback(
    async (orderedIds: string[]) => {
      try {
        await reorder.mutateAsync(orderedIds);
        toast.success("Order saved");
        setReorderOpen(false);
      } catch {
        toast.error("Failed to save order");
      }
    },
    [reorder],
  );

  const handleShare = useCallback((item: PortfolioItem) => {
    setShareItem(item);
  }, []);

  const displayName =
    profile?.professional_name?.trim() ||
    profile?.full_legal_name?.trim() ||
    profile?.username?.trim() ||
    username;
  const roles = [
    ...(profile?.professions || []),
    ...(profile?.specialties || []),
  ].filter((role, index, allRoles) => allRoles.indexOf(role) === index);
  const location = formatLocation(profile?.location);
  const isAvailable = profile?.availability === "available";
  const isOpenToTravel = profile?.willing_to_travel?.toLowerCase() === "yes";
  const showAllSections = activeTab === "Showreel";

  if (isLoading || profileLoading) {
    return <PortfolioSkeleton />;
  }

  if (error || profileError) {
    return (
      <div className="min-h-screen bg-[#f5f7ff] text-[#12204a]">
        <main className="mx-auto max-w-2xl px-4 py-20 text-center">
          <p className="font-semibold text-red-600">Failed to load portfolio.</p>
          <p className="mt-2 text-sm text-slate-500">
            {(error || profileError)?.message}
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f5f7ff] text-[#12204a]">
      <div className="pointer-events-none absolute -left-28 top-24 size-80 rounded-full bg-[#cfe0ff]/55 blur-3xl" />
      <div className="pointer-events-none absolute right-[-9rem] top-48 size-96 rounded-full bg-[#f3d8ff]/55 blur-3xl" />
      <main className="relative mx-auto max-w-3xl px-4 pb-20 pt-5 sm:px-6 lg:pt-8">
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="Go back"
              className="grid size-11 place-items-center rounded-full border border-white/80 bg-white/70 text-[#1d4ed8] shadow-[0_8px_24px_rgba(37,99,235,0.1)] backdrop-blur transition-transform active:scale-95"
            >
              <ArrowLeft className="size-5" />
            </button>
            <div className="hidden items-center gap-2 sm:flex">
              <span className="relative grid size-9 place-items-center">
                <span className="absolute size-6 -rotate-45 rounded-lg bg-gradient-to-br from-[#1d4ed8] to-[#8b5cf6]" />
                <span className="absolute size-6 rotate-45 rounded-lg bg-gradient-to-br from-[#06b6d4] to-[#ec4899] mix-blend-multiply" />
              </span>
              <span>
                <span className="block text-lg font-extrabold leading-none tracking-tight text-[#10204c]">Rootin</span>
                <span className="text-[9px] font-semibold text-[#23366c]">People. Talent. Opportunities.</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isOwner ? (
              <Button
                onClick={() => setAddOpen(true)}
                size="sm"
                className="h-10 rounded-full bg-gradient-to-r from-[#2563eb] to-[#7c3aed] px-4 text-white shadow-[0_8px_20px_rgba(37,99,235,0.22)] hover:opacity-90"
              >
                <Plus className="mr-1.5 size-4" /> Add Work
              </Button>
            ) : (
              <Link
                href={`/talent/${encodeURIComponent(username)}`}
                className="inline-flex h-10 items-center gap-2 rounded-full border border-[#cfdcff] bg-white/75 px-4 text-sm font-bold text-[#163b96] shadow-[0_8px_20px_rgba(37,99,235,0.08)] backdrop-blur"
              >
                <Eye className="size-4" /> View Profile
              </Link>
            )}
            <button
              type="button"
              aria-label="More options"
              className="grid size-10 place-items-center rounded-full border border-[#e3d8ff] bg-white/70 text-[#251a65] shadow-[0_8px_20px_rgba(122,78,214,0.08)]"
            >
              <MoreHorizontal className="size-5" />
            </button>
          </div>
        </header>

        <section className="relative mt-8 sm:mt-10">
          <p className="text-sm font-bold uppercase tracking-[0.08em] text-[#7c66e8]">Portfolio</p>
          <div className="mt-1 flex items-start justify-between gap-5">
            <div>
              <h1 className="text-[36px] font-black leading-[1.02] tracking-[-0.045em] text-[#111d47] sm:text-5xl">
                {displayName}&apos;s<br />
                <span className="bg-gradient-to-r from-[#2563eb] via-[#5425db] to-[#c026d3] bg-clip-text text-transparent">Portfolio</span>
              </h1>
              <p className="mt-2 max-w-xl text-[15px] font-medium leading-relaxed text-[#1b2d5d] sm:text-base">
                Explore their best work across videos, photos and more.
              </p>
            </div>
            <span className="hidden shrink-0 pt-2 text-right font-script text-2xl leading-[0.9] text-[#5727d7] sm:block">
              Stories<br />People.<br />Emotions.
            </span>
          </div>
        </section>

        <section className="mt-6 flex items-center gap-4 rounded-[22px] border border-white/80 bg-white/65 px-4 py-4 shadow-[0_12px_30px_rgba(81,111,194,0.09)] backdrop-blur sm:px-5">
          <div className="relative size-[82px] shrink-0 rounded-full bg-gradient-to-br from-[#0ea5e9] to-[#2563eb] p-[3px] shadow-[0_0_0_3px_rgba(37,99,235,0.12)] sm:size-[94px]">
            <div className="grid h-full w-full place-items-center overflow-hidden rounded-full bg-[#dbeafe] text-xl font-extrabold text-[#1d4ed8]">
              {profile?.profile_photo ? (
                <img src={profile.profile_photo} alt={displayName} className="h-full w-full object-cover" />
              ) : (
                initials(displayName)
              )}
            </div>
            {profile?.is_verified && (
              <span className="absolute -bottom-0.5 -right-0.5 grid size-7 place-items-center rounded-full border-2 border-white bg-[#168bf1] text-white">
                <BadgeCheck className="size-4.5 fill-white text-[#168bf1]" />
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="flex items-center gap-1.5 truncate text-[21px] font-extrabold tracking-tight text-[#14224f]">
              {displayName}
              {profile?.is_verified && <BadgeCheck className="size-5 shrink-0 fill-[#1694ee] text-white" />}
            </h2>
            {roles.length > 0 && <p className="truncate text-sm font-medium text-[#16295a]">{roles.slice(0, 3).join("  |  ")}</p>}
            {location && (
              <p className="mt-1 flex items-center gap-1 text-sm text-[#365496]">
                <MapPin className="size-4 fill-[#6533db] text-[#6533db]" /> {location}
              </p>
            )}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {profile?.availability && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#dcfce7] px-2.5 py-1 text-[11px] font-bold text-[#20843d]">
                  <span className={`size-1.5 rounded-full ${isAvailable ? "bg-[#16a34a]" : "bg-[#f59e0b]"}`} />
                  {isAvailable ? "Available for Work" : "Currently Busy"}
                </span>
              )}
              {isOpenToTravel && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#e0edff] px-2.5 py-1 text-[11px] font-bold text-[#2457b6]">
                  <Plane className="size-3" /> Open to Travel
                </span>
              )}
            </div>
          </div>
        </section>

        <nav className="mt-4 grid grid-cols-4 rounded-[20px] border border-white/90 bg-white/60 p-1 shadow-[0_8px_24px_rgba(81,111,194,0.08)] backdrop-blur">
          {showcaseTabs.map(({ id, label, icon: Icon }) => {
            const count = id === "Showreel" ? (showreel ? 1 : 0) : id === "Videos" ? videoItems.length : id === "Photos" ? photoItems.length : documentItems.length;
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => handleTabChange(id)}
                className={`relative flex min-w-0 flex-col items-center gap-1 rounded-[16px] px-1 py-2 text-[11px] font-bold transition-colors ${isActive ? "bg-white text-[#5620d8] shadow-[0_5px_15px_rgba(92,49,200,0.12)]" : "text-[#365391] hover:bg-white/65"}`}
              >
                <Icon className="size-5" />
                <span className="truncate">{label}</span>
                <span className="text-[10px] font-semibold opacity-70">{count}</span>
                {isActive && <span className="absolute inset-x-4 -bottom-1 h-1 rounded-full bg-gradient-to-r from-[#5620d8] to-[#b817f0]" />}
              </button>
            );
          })}
        </nav>

        {isOwner && (
          <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-[#dbe5ff] bg-white/55 px-3 py-2 text-xs text-[#48629b]">
            <span>Manage your public showcase</span>
            <button type="button" onClick={() => setReorderOpen(true)} className="font-bold text-[#4e22d0] hover:underline">Reorder work</button>
          </div>
        )}

        {isOwner && <ProfileHighlightsStatus items={items} />}

        {items.length === 0 ? (
          <EmptyPortfolioState isOwner={isOwner} onAddWork={() => setAddOpen(true)} />
        ) : (
          <div className="mt-4 space-y-4">
            {activeTab === "Showreel" && showreel && (
              <section className="rounded-[24px] border border-white/90 bg-white/70 p-3.5 shadow-[0_10px_30px_rgba(81,111,194,0.08)] sm:p-4">
                <div className="mb-3 flex items-center gap-2.5">
                  <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white"><Clapperboard className="size-5" /></span>
                  <h2 className="text-[19px] font-extrabold tracking-tight text-[#12204a]">Featured Showreel</h2>
                  <span className="ml-auto rounded-full bg-[#fff5d9] px-2.5 py-1 text-[11px] font-bold text-[#9a6500]">Featured</span>
                </div>
                <button type="button" onClick={() => handleItemClick(showreel)} className="group relative block aspect-[2.25/1] w-full overflow-hidden rounded-[18px] bg-slate-900 text-left sm:aspect-[2.65/1]">
                  <MediaThumbnail item={showreel} className="transition-transform duration-500 group-hover:scale-105" />
                  <span className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/5 to-transparent" />
                  <span className="absolute inset-0 grid place-items-center"><PlayMark large /></span>
                  <span className="absolute bottom-3 left-3 max-w-[65%] truncate rounded-md bg-slate-950/70 px-2 py-1 text-sm font-bold text-white">{showreel.title}</span>
                  {showreel.duration && <span className="absolute bottom-3 right-3 rounded-md bg-slate-950/70 px-2 py-1 text-xs font-bold text-white">{showreel.duration}</span>}
                  {isOwner && <span className="absolute right-3 top-3" onClick={(event) => event.stopPropagation()}><PortfolioActions item={showreel} username={username} onEdit={setEditItem} onToggleFeatured={handleToggleFeatured} onSetShowreel={handleSetShowreel} onDelete={handleDelete} onShare={handleShare} /></span>}
                </button>
              </section>
            )}

            {(showAllSections || activeTab === "Videos") && (
              <section className="rounded-[24px] border border-white/90 bg-white/70 p-3.5 shadow-[0_10px_30px_rgba(81,111,194,0.08)] sm:p-4">
                <ShowcaseSectionHeader icon={Video} title="Videos" count={videoItems.length} tone="pink" onViewAll={() => setActiveTab("Videos")} />
                {videoItems.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {(showAllSections ? videoItems.slice(0, 4) : videoItems).map((item) => (
                      <button key={item.id} type="button" onClick={() => handleItemClick(item)} className="group min-w-0 text-left">
                        <span className="relative block aspect-[1.62/1] overflow-hidden rounded-[12px] bg-slate-200">
                          <MediaThumbnail item={item} className="transition-transform duration-500 group-hover:scale-105" />
                          <span className="absolute inset-0 grid place-items-center bg-slate-950/10"><PlayMark /></span>
                          {item.duration && <span className="absolute bottom-2 right-2 rounded bg-slate-950/75 px-1.5 py-1 text-[10px] font-bold text-white">{item.duration}</span>}
                          {isOwner && <span className="absolute right-2 top-2" onClick={(event) => event.stopPropagation()}><PortfolioActions item={item} username={username} onEdit={setEditItem} onToggleFeatured={handleToggleFeatured} onSetShowreel={handleSetShowreel} onDelete={handleDelete} onShare={handleShare} /></span>}
                        </span>
                        <span className="mt-1.5 block truncate text-[15px] font-extrabold text-[#12204a]">{item.title}</span>
                        <span className="mt-0.5 block truncate text-xs font-medium text-[#5370ae]">{item.description || `${item.category === "work" ? "Featured work" : item.category}  |  ${new Date(item.createdAt).getFullYear()}`}</span>
                      </button>
                    ))}
                  </div>
                ) : <p className="py-5 text-center text-sm text-slate-500">No videos yet.</p>}
              </section>
            )}

            {(showAllSections || activeTab === "Photos") && (
              <section className="rounded-[24px] border border-white/90 bg-white/70 p-3.5 shadow-[0_10px_30px_rgba(81,111,194,0.08)] sm:p-4">
                <ShowcaseSectionHeader icon={Images} title="Photos" count={photoItems.length} tone="blue" onViewAll={() => setActiveTab("Photos")} />
                {photoItems.length > 0 ? (
                  <div className="grid grid-cols-4 gap-2">
                    {(showAllSections ? photoItems.slice(0, 3) : photoItems).map((item) => (
                      <button key={item.id} type="button" onClick={() => handleItemClick(item)} className="group relative aspect-square overflow-hidden rounded-[13px] bg-slate-200">
                        <MediaThumbnail item={item} className="transition-transform duration-500 group-hover:scale-105" />
                        {isOwner && <span className="absolute right-1.5 top-1.5" onClick={(event) => event.stopPropagation()}><PortfolioActions item={item} username={username} onEdit={setEditItem} onToggleFeatured={handleToggleFeatured} onDelete={handleDelete} onShare={handleShare} /></span>}
                      </button>
                    ))}
                    {showAllSections && photoItems.length > 3 && <button type="button" onClick={() => setActiveTab("Photos")} className="grid aspect-square place-items-center rounded-[13px] bg-gradient-to-br from-[#182d5b] to-[#213f7a] text-white"><span className="text-2xl font-black">+{photoItems.length - 3}</span><span className="text-xs font-semibold">More</span></button>}
                  </div>
                ) : <p className="py-5 text-center text-sm text-slate-500">No photos yet.</p>}
              </section>
            )}

            {(showAllSections || activeTab === "Documents") && (
              <section className="rounded-[24px] border border-white/90 bg-white/70 p-3.5 shadow-[0_10px_30px_rgba(81,111,194,0.08)] sm:p-4">
                <ShowcaseSectionHeader icon={FileText} title="Documents" count={documentItems.length} tone="indigo" onViewAll={() => setActiveTab("Documents")} />
                {documentItems.length > 0 ? (
                  <div className="grid gap-2.5 sm:grid-cols-3">
                    {(showAllSections ? documentItems.slice(0, 3) : documentItems).map((item) => (
                      <button key={item.id} type="button" onClick={() => handleItemClick(item)} className="group flex min-w-0 items-center gap-3 rounded-2xl border border-[#e1e9fb] bg-white/75 p-3 text-left transition-colors hover:bg-white">
                        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#fff0ed] text-[#ef3d2e]"><FileText className="size-6 fill-current" /></span>
                        <span className="min-w-0"><span className="block truncate text-sm font-extrabold text-[#12204a]">{item.title || item.fileName || "Document"}</span><span className="mt-0.5 block truncate text-xs font-medium text-[#5370ae]">PDF {item.fileSize ? ` | ${(item.fileSize / 1024 / 1024).toFixed(1)} MB` : ""}</span></span>
                        {isOwner && <span className="ml-auto shrink-0" onClick={(event) => event.stopPropagation()}><PortfolioActions item={item} username={username} onEdit={setEditItem} onDelete={handleDelete} onShare={handleShare} /></span>}
                      </button>
                    ))}
                  </div>
                ) : <p className="py-5 text-center text-sm text-slate-500">No documents yet.</p>}
              </section>
            )}
          </div>
        )}

        {!isOwner && profile && (
          <div className="mt-5 space-y-2.5">
            <button
              type="button"
              onClick={startConversation}
              disabled={messagePending}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#08a9ed] via-[#304ff1] to-[#ec20c8] text-base font-extrabold text-white shadow-[0_10px_25px_rgba(76,77,224,0.24)] transition-transform active:scale-[0.99] disabled:opacity-70"
            >
              {messagePending ? <Loader2 className="size-5 animate-spin" /> : <MessageCircle className="size-5" />}
              Message Talent
            </button>
            <button
              type="button"
              onClick={toggleSave}
              disabled={savePending}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl border border-[#cfe0ff] bg-white/80 text-sm font-extrabold text-[#2348ac] shadow-[0_8px_20px_rgba(81,111,194,0.08)] transition-colors hover:bg-white disabled:opacity-70"
            >
              {savePending ? <Loader2 className="size-5 animate-spin" /> : <Bookmark className={isSaved ? "size-5 fill-current" : "size-5"} />}
              {isSaved ? "Saved Talent" : "Save Talent"}
            </button>
          </div>
        )}
      </main>

      <PortfolioReelOverlay
        items={sortedItems}
        username={username}
        initialItemId={reelInitialItemId ?? undefined}
        isOwner={isOwner}
        open={reelOpen}
        onClose={handleCloseReel}
        onEdit={isOwner ? setEditItem : undefined}
        onToggleFeatured={isOwner ? handleToggleFeatured : undefined}
        onDelete={isOwner ? handleDelete : undefined}
        onShare={handleShare}
      />

      {isOwner && (
        <>
          <AddPortfolioModal
            open={addOpen}
            onClose={() => setAddOpen(false)}
            onSubmit={handleAddWork}
            isSubmitting={isSubmitting}
          />
          <EditPortfolioModal
            item={editItem}
            open={!!editItem}
            onClose={() => setEditItem(null)}
            onSubmit={handleEdit}
            isSubmitting={updateItem.isPending}
          />
          <ReorderSheet
            items={items}
            open={reorderOpen}
            onClose={() => setReorderOpen(false)}
            onReorder={handleReorder}
            isSubmitting={reorder.isPending}
          />
        </>
      )}

      <Dialog
        open={!!showreelCandidate}
        onOpenChange={(open) => !open && setShowreelCandidate(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Replace featured showreel?</DialogTitle>
            <DialogDescription>
              Your public profile can show one showreel. Choose which work should appear first.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            {[items.find((item) => item.profileHighlightType === "showreel"), showreelCandidate]
              .filter(Boolean)
              .map((item, index) => (
                <div key={item!.id} className="min-w-0">
                  <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
                    <img
                      src={item!.thumbnailUrl || item!.url}
                      alt={item!.title}
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute left-2 top-2 rounded bg-background/80 px-1.5 py-0.5 text-[10px] font-semibold">
                      {index === 0 ? "Current" : "New"}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-xs font-medium">{item!.title}</p>
                </div>
              ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowreelCandidate(null)}>
              Cancel
            </Button>
            <Button onClick={replaceShowreel} disabled={updateItem.isPending}>
              Replace Showreel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ShareSheet
        url={
          shareItem
            ? `${typeof window !== "undefined" ? window.location.origin : ""}/talent/${username}/portfolio?item=${shareItem.id}`
            : ""
        }
        title={shareItem?.title || ""}
        open={!!shareItem}
        onClose={() => setShareItem(null)}
      />
    </div>
  );
}

export default function PortfolioPage() {
  return (
    <Suspense fallback={<PortfolioSkeleton />}>
      <PortfolioContent />
    </Suspense>
  );
}
