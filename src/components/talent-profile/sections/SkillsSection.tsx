"use client";

import { useState } from "react";
import {
  Star,
  Sparkles,
  Clapperboard,
  Swords,
  Drama,
  Smile,
  Mic,
  Headphones,
  Volume2,
  AudioLines,
  AudioWaveform,
  Music2,
  Music3,
  Music4,
  Piano,
  Drum,
  Guitar,
  Move,
  Camera,
  Video,
  Film,
  Scissors,
  Shirt,
  Palette,
  PenLine,
  Pen,
  BookOpen,
  Paintbrush,
  Megaphone,
  Radio,
  MonitorPlay,
  Tv,
  Disc,
  Disc2,
  Disc3,
  Podcast,
  Flame,
  FlameKindling,
  Target,
  Crosshair,
  BowArrow,
  Shield,
  Sword,
  ShieldCheck,
  Diamond,
  PartyPopper,
  Ticket,
  Flower,
  Flower2,
  Rose,
  Leaf,
  TreePine,
  Utensils,
  Coffee,
  GlassWater,
  CakeSlice,
  Croissant,
  Highlighter,
  Eraser,
  SquarePen,
  CodeXml,
  Eye,
  type LucideIcon,
} from "lucide-react";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import type { TalentSkill } from "@/lib/api/talent";
import { GlassCard, SectionHeader } from "../primitives";

const skillIconMap: Record<string, LucideIcon> = {
  // ── Performance & Acting ──────────────────────────────────
  Acting: Clapperboard,
  "Stage Combat": Swords,
  Theater: Drama,
  Improv: Smile,
  Comedy: Smile,
  "Stand-up Comedy": Smile,
  Mime: Drama,
  Stunt: Flame,
  "Fire Performance": Flame,
  "Fire Eating": FlameKindling,
  Circus: PartyPopper,
  Juggling: PartyPopper,
  Magic: Sparkles,
  "Magic Shows": Sparkles,
  "Puppet Theater": Drama,

  // ── Music & Instruments ───────────────────────────────────
  Singing: Mic,
  Rapping: Mic,
  Beatboxing: AudioLines,
  Guitar: Guitar,
  Piano: Piano,
  Drums: Drum,
  Percussion: Drum,
  Bass: Music4,
  Violin: Music3,
  Flute: Music2,
  Saxophone: Music2,
  Trumpet: Music2,
  Keyboard: Piano,
  DJing: Disc3,
  "Music Production": Disc2,
  Beatmaking: AudioWaveform,
  "Sound Design": AudioLines,
  Arrangement: Music2,
  "Music Composition": Music4,

  // ── Voice & Audio ─────────────────────────────────────────
  Dubbing: Headphones,
  "Voice Acting": Volume2,
  Narration: Volume2,
  "Audiobook Narration": Volume2,
  Podcasting: Podcast,
  "Voice-over": Mic,
  "Radio Hosting": Radio,
  "Public Speaking": Mic,
  Hosting: Mic,
  Emceeing: Megaphone,
  "Talk Show": MonitorPlay,

  // ── Dance ─────────────────────────────────────────────────
  "Classical Dance": Music2,
  "Contemporary Dance": Move,
  "Hip Hop Dance": Music2,
  Choreography: Move,
  Ballet: Flower2,
  "Belly Dance": Flower,
  Salsa: Music2,
  "Ballroom Dance": Music2,
  "Latin Dance": Music2,
  "Folk Dance": Leaf,
  "Breakdance": Flame,
  "Freestyle Dance": Sparkles,
  "Jazz Dance": Music3,
  "Tap Dance": Music4,

  // ── Visual Arts & Design ──────────────────────────────────
  Photography: Camera,
  Videography: Video,
  Cinematography: Film,
  "Video Editing": Scissors,
  "Film Editing": Film,
  "Photo Editing": Camera,
  Direction: MonitorPlay,
  "Film Direction": Clapperboard,
  "Art Direction": Palette,
  "Color Grading": Palette,

  // ── Fashion & Beauty ──────────────────────────────────────
  Hairstyling: Scissors,
  Styling: Shirt,
  "Runway Modeling": Camera,
  Modeling: Camera,
  Makeup: Palette,
  "Makeup Artistry": Paintbrush,
  "Nail Art": Paintbrush,
  "Wardrobe Design": Shirt,
  "Costume Design": Shirt,
  "Fashion Design": Shirt,
  Tailoring: Scissors,
  "Textile Design": Palette,

  // ── Writing & Content ─────────────────────────────────────
  "Script Writing": PenLine,
  "Creative Writing": BookOpen,
  Copywriting: PenLine,
  Screenwriting: SquarePen,
  Poetry: PenLine,
  Lyrics: Music4,
  "Songwriting": Music4,
  Blogging: PenLine,
  Journalism: Pen,
  "Content Writing": PenLine,
  Copyediting: Highlighter,
  Proofreading: Eraser,

  // ── Digital & Tech Creative ───────────────────────────────
  "UI/UX Design": SquarePen,
  "Web Design": CodeXml,
  "Graphic Design": Palette,
  Illustration: Paintbrush,
  "Digital Art": Paintbrush,
  "3D Modeling": Diamond,
  Animation: Move,
  "Motion Graphics": Move,
  "Visual Effects": Sparkles,
  "Game Design": Flame,
  "VFX Artist": Sparkles,

  // ── Culinary & Food ───────────────────────────────────────
  "Cooking": Utensils,
  Baking: Croissant,
  "Cake Decorating": CakeSlice,
  "Food Styling": Utensils,
  "Mixology": GlassWater,
  "Coffee Art": Coffee,

  // ── Craft & Handmade ──────────────────────────────────────
  "Jewelry Making": Flower2,
  "Pottery": Flower,
  "Woodworking": TreePine,
  "Floral Design": Rose,
  "Candle Making": Flame,
  "Soap Making": Sparkles,
  Knitting: Flower,
  "Embroidery": Flower2,
  "Leather Craft": Leaf,
  "Glass Art": Sparkles,

  // ── Martial Arts & Combat ─────────────────────────────────
  "Martial Arts": Shield,
  "Stage Fencing": Swords,
  "Weapon Handling": Sword,
  Archery: BowArrow,
  "Self Defense": ShieldCheck,

  // ── Sports & Fitness ──────────────────────────────────────
  Yoga: Flower,
  "Fitness Training": Flame,
  Gymnastics: Move,
  "Acrobatics": Move,
  "Aerial Arts": Move,
  Swimming: Flower,
  "Sports Performance": Target,
  "Precision Skills": Target,
  "Target Practice": Crosshair,

  // ── Event & Stage ─────────────────────────────────────────
  "Stage Presence": Star,
  "Event Hosting": PartyPopper,
  "Event Planning": Ticket,
  "Stage Management": MonitorPlay,
  "Lighting Design": Sparkles,
  "Sound Engineering": AudioLines,
  "Stage Design": MonitorPlay,

  // ── Languages & Communication ─────────────────────────────
  "Voice Mimicry": Volume2,
  "Accent Work": Volume2,
  "Dialect Coaching": Volume2,
  "Public Relations": Megaphone,
  "Brand Ambassador": Sparkles,

  // ── Other Creative Skills ─────────────────────────────────
  "Impressionist": Smile,
  "Character Work": Drama,
  "Ensemble Performance": Drama,
  "Improv Comedy": Smile,
  "Sketch Comedy": Smile,
  "Physical Comedy": Smile,
  "Dark Comedy": Smile,
  "Musical Theater": Music2,
  "Opera Singing": Music2,
  "Choral Singing": Music3,
  "Beat Production": Disc,
  "Vinyl DJing": Disc3,
  "Radio Production": Radio,
  "TV Production": Tv,
  "Film Production": Film,
  "Commercial Acting": Clapperboard,
  "Voice Direction": Volume2,
  "Casting": Eye,
  "Talent Scouting": Eye,
};

export type SkillIconStyle = {
  icon: LucideIcon;
  iconClass: string;
  backgroundClass: string;
};

const skillCategoryMap: Array<{
  pattern: RegExp;
  icon: LucideIcon;
  iconClass: string;
  backgroundClass: string;
}> = [
  {
    pattern: /dance|ballet|choreograph|yoga|gymnast|acrobat|aerial|movement/,
    icon: Move,
    iconClass: "text-[#7C3AED]",
    backgroundClass: "bg-purple-50",
  },
  {
    pattern: /photo|camera|video|film|cinema|editing|cinematograph/,
    icon: Camera,
    iconClass: "text-[#2563EB]",
    backgroundClass: "bg-blue-50",
  },
  {
    pattern: /makeup|beauty|hair|fashion|model|styling|wardrobe|costume|tailor/,
    icon: Paintbrush,
    iconClass: "text-[#EC4899]",
    backgroundClass: "bg-pink-50",
  },
  {
    pattern: /color|art|design|illustrat|paint|creative|visual|graphic/,
    icon: Palette,
    iconClass: "text-[#7C3AED]",
    backgroundClass: "bg-purple-50",
  },
  {
    pattern: /combat|fenc|martial|weapon|archery|stunt|stage fight/,
    icon: Swords,
    iconClass: "text-[#2563EB]",
    backgroundClass: "bg-blue-50",
  },
  {
    pattern: /act|theater|theatre|drama|improv|comedy|mime|casting|character/,
    icon: Drama,
    iconClass: "text-[#EC4899]",
    backgroundClass: "bg-pink-50",
  },
  {
    pattern: /sing|music|guitar|piano|drum|vocal|dj|audio|sound|voice|podcast|radio/,
    icon: Music2,
    iconClass: "text-[#14B8A6]",
    backgroundClass: "bg-teal-50",
  },
  {
    pattern: /write|copy|script|poetry|lyric|journal|blog|content|reading/,
    icon: PenLine,
    iconClass: "text-[#2563EB]",
    backgroundClass: "bg-blue-50",
  },
  {
    pattern: /code|web|digital|tech|animation|motion|vfx|game|3d|ui|ux/,
    icon: MonitorPlay,
    iconClass: "text-[#7C3AED]",
    backgroundClass: "bg-purple-50",
  },
  {
    pattern: /cook|bake|food|culinary|coffee|mixology/,
    icon: Utensils,
    iconClass: "text-[#F59E0B]",
    backgroundClass: "bg-amber-50",
  },
];

const genericSkillIcon: SkillIconStyle = {
  icon: Sparkles,
  iconClass: "text-[#7C3AED]",
  backgroundClass: "bg-purple-50",
};

export function getSkillIcon(skillName: string): SkillIconStyle {
  const normalized = skillName.trim().toLowerCase();
  const exactIcon = Object.entries(skillIconMap).find(
    ([name]) => name.toLowerCase() === normalized,
  )?.[1];
  const category = skillCategoryMap.find(({ pattern }) => pattern.test(normalized));

  return {
    icon: exactIcon ?? category?.icon ?? genericSkillIcon.icon,
    iconClass: category?.iconClass ?? genericSkillIcon.iconClass,
    backgroundClass: category?.backgroundClass ?? genericSkillIcon.backgroundClass,
  };
}

const MAX_VISIBLE = 6;

export function SkillsSection({
  skills,
  collapsible = false,
}: {
  skills: TalentSkill[];
  collapsible?: boolean;
}) {
  const [showAll, setShowAll] = useState(false);
  const [sectionOpen, setSectionOpen] = useState(true);
  const hasMore = skills.length > MAX_VISIBLE;
  const visible = showAll ? skills : skills.slice(0, MAX_VISIBLE);
  const content = skills.length === 0 ? (
    <p className="py-3 text-center text-sm text-muted-foreground/60">
      No skills added yet.
    </p>
  ) : (
    <div className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-2">
      {visible.map((skill) => {
        const { icon: Icon, iconClass, backgroundClass } = getSkillIcon(skill.name);

        return (
          <span
            key={skill.name}
            className={cn(
              "flex min-h-11 items-center rounded-xl bg-white/75 p-2.5 text-[#1d274b] shadow-[0_4px_12px_rgba(92,72,145,0.07)]",
              (skill.proficiency === "expert" || skill.proficiency === "advanced") &&
                "bg-white shadow-[0_5px_14px_rgba(92,72,145,0.1)]",
            )}
          >
            <span className="flex min-w-0 items-center gap-2">
              <span className={cn("grid size-8 shrink-0 place-items-center rounded-xl", backgroundClass)}>
                <Icon className={cn("size-[18px]", iconClass)} strokeWidth={2.25} />
              </span>
              <span className="truncate text-[12px] font-extrabold">{skill.name}</span>
            </span>
          </span>
        );
      })}
      {!showAll && hasMore && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="inline-flex min-h-10 items-center rounded-full bg-blue-50 px-3 text-[12px] font-bold text-[#2563EB] shadow-sm transition-colors hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          +{skills.length - MAX_VISIBLE} more
        </button>
      )}
    </div>
  );

  return (
    <GlassCard
      className="p-[18px]"
      style={{
        background:
          "linear-gradient(135deg, color-mix(in oklab, #ffffff 96%, #eadcff), #ffffff 58%, color-mix(in oklab, #ffffff 95%, #ffddec))",
      }}
    >
      <SectionHeader
        icon={<Star className="size-4 fill-current" />}
        title="Top Skills"
        action={hasMore ? (showAll ? "Show Less" : "View All") : undefined}
        onAction={hasMore ? () => setShowAll((v) => !v) : undefined}
        collapsible={collapsible && skills.length > 0}
        open={sectionOpen}
        onToggle={() => setSectionOpen((v) => !v)}
      />
      {collapsible && skills.length > 0 ? (
        <Collapsible open={sectionOpen}>
          <CollapsibleContent>{content}</CollapsibleContent>
        </Collapsible>
      ) : (
        content
      )}
    </GlassCard>
  );
}
