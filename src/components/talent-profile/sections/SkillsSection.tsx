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
import { CollapsibleSection } from "../primitives";

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

function getSkillIcon(skill: string) {
  const Icon = skillIconMap[skill] ?? Sparkles;
  return <Icon className="size-3 text-brand" />;
}

const MAX_VISIBLE = 8;

export function SkillsSection({
  skills,
  collapsible = false,
}: {
  skills: string[];
  collapsible?: boolean;
}) {
  const [showAll, setShowAll] = useState(false);
  const hasMore = skills.length > MAX_VISIBLE;
  const visible = showAll ? skills : skills.slice(0, MAX_VISIBLE);

  return (
    <CollapsibleSection
      icon={<Star className="size-4" />}
      title="Top Skills"
      action={hasMore ? (showAll ? "Show Less" : "View All") : undefined}
      onAction={hasMore ? () => setShowAll((v) => !v) : undefined}
      collapsible={collapsible && skills.length > 0}
    >
      {skills.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground/60">
          No skills added yet.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {visible.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1.5 text-[11px] font-semibold text-foreground"
            >
              {getSkillIcon(skill)} {skill}
            </span>
          ))}
          {!showAll && hasMore && (
            <button
              onClick={() => setShowAll(true)}
              className="inline-flex items-center rounded-full px-3 py-1.5 text-[11px] font-semibold text-brand transition-colors hover:text-brand/80"
            >
              +{skills.length - MAX_VISIBLE} more
            </button>
          )}
        </div>
      )}
    </CollapsibleSection>
  );
}
