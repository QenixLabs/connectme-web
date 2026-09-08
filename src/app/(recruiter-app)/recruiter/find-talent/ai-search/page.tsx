"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowRight,
  ArrowUp,
  Calendar,
  Check,
  ChevronLeft,
  Clapperboard,
  Clock,
  Languages,
  MapPin,
  Mic,
  Music,
  Paperclip,
  Search,
  Sparkles,
  Target,
  User,
  Users,
} from "lucide-react";
import { talentApi, type AiSearchCriteria } from "@/lib/api/talent";
import {
  emptyCriteria,
  toSearchParams,
  type SearchCriteria,
} from "@/lib/find-talent/search-model";

const SAMPLE_QUERY =
  "I'm looking for a female actor, 25–30 years old, fluent in Telugu, based in Mumbai, for a web series. She should be available now.";

const DEFAULT_CRITERIA: SearchCriteria = {
  ...emptyCriteria,
  profession: "Actor",
  gender: "Female",
  ageMin: 25,
  ageMax: 30,
  languages: ["Telugu"],
  location: "Mumbai",
  availability: "available",
  search: "web series",
};

const examples = [
  { icon: Clapperboard, text: "Male model for fashion shoot in Delhi" },
  { icon: Music, text: "Playback singer, Hindi, 20–30" },
  { icon: Users, text: "Dancers for a music video, Mumbai" },
];

const defaultChips = [
  { icon: User, label: "Female Actor", tint: "bg-pink-100 text-pink-600" },
  { icon: Calendar, label: "25 – 30 years", tint: "bg-indigo-100 text-indigo-600" },
  { icon: Languages, label: "Telugu", tint: "bg-emerald-100 text-emerald-600" },
  { icon: MapPin, label: "Mumbai", tint: "bg-sky-100 text-sky-600" },
  { icon: Clapperboard, label: "Web Series", tint: "bg-amber-100 text-amber-600" },
  { icon: Clock, label: "Available Now", tint: "bg-emerald-100 text-emerald-600" },
];

function criteriaFromAi(criteria: AiSearchCriteria): SearchCriteria {
  return {
    search: criteria.search,
    profession: criteria.profession ?? "",
    location: criteria.location ?? "",
    gender: criteria.gender ?? "",
    availability: criteria.availability ?? "",
    languages: criteria.languages,
    skills: criteria.skills,
    ageMin: criteria.ageMin,
    ageMax: criteria.ageMax,
    experienceMin: criteria.experienceMin,
    experienceMax: criteria.experienceMax,
  };
}

function criteriaChips(criteria: SearchCriteria) {
  const chips: Array<{ icon: typeof User; label: string; tint: string }> = [];
  if (criteria.gender || criteria.profession) {
    chips.push({
      icon: User,
      label: [criteria.gender, criteria.profession].filter(Boolean).join(" "),
      tint: "bg-pink-100 text-pink-600",
    });
  }
  if (criteria.ageMin != null || criteria.ageMax != null) {
    chips.push({
      icon: Calendar,
      label: `${criteria.ageMin ?? ""} – ${criteria.ageMax ?? ""} years`,
      tint: "bg-indigo-100 text-indigo-600",
    });
  }
  criteria.languages.forEach((language) =>
    chips.push({ icon: Languages, label: language, tint: "bg-emerald-100 text-emerald-600" }),
  );
  if (criteria.location) {
    chips.push({ icon: MapPin, label: criteria.location, tint: "bg-sky-100 text-sky-600" });
  }
  criteria.skills.forEach((skill) =>
    chips.push({ icon: Sparkles, label: skill, tint: "bg-amber-100 text-amber-600" }),
  );
  if (criteria.availability) {
    chips.push({
      icon: Clock,
      label: criteria.availability.replaceAll("_", " "),
      tint: "bg-emerald-100 text-emerald-600",
    });
  }
  return chips;
}

function criteriaLines(criteria: SearchCriteria) {
  return [
    criteria.gender && `Gender: ${criteria.gender}`,
    (criteria.ageMin != null || criteria.ageMax != null) &&
      `Playing Age: ${criteria.ageMin ?? ""}–${criteria.ageMax ?? ""}`,
    criteria.languages.length > 0 && `Language: ${criteria.languages.join(", ")}`,
    criteria.location && `Location: ${criteria.location}`,
    criteria.profession && `Profession: ${criteria.profession}`,
    criteria.experienceMin != null || criteria.experienceMax != null
      ? `Experience: ${criteria.experienceMin ?? ""}–${criteria.experienceMax ?? ""} years`
      : null,
    criteria.availability && `Availability: ${criteria.availability.replaceAll("_", " ")}`,
    criteria.skills.length > 0 && `Skills: ${criteria.skills.join(", ")}`,
  ].filter((line): line is string => Boolean(line));
}

export default function AiTalentSearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState(SAMPLE_QUERY);
  const [criteria, setCriteria] = useState<SearchCriteria>(DEFAULT_CRITERIA);
  const [hasParsedQuery, setHasParsedQuery] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState("");

  const parsedChips = hasParsedQuery ? criteriaChips(criteria) : defaultChips;
  const matchingCriteria = hasParsedQuery ? criteriaLines(criteria) : [
    "Gender: Female",
    "Playing Age: 25–30",
    "Language: Telugu",
    "Location: Mumbai",
    "Project Type: Web Series",
    "Availability: Immediate",
  ];

  const parseQuery = async () => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery || isParsing) return null;

    setIsParsing(true);
    setError("");
    try {
      const parsed = criteriaFromAi(await talentApi.extractSearchCriteria(trimmedQuery));
      setCriteria(parsed);
      setHasParsedQuery(true);
      return parsed;
    } catch {
      setError("We couldn't understand that request. Please try describing the talent again.");
      return null;
    } finally {
      setIsParsing(false);
    }
  };

  const findMatchingTalent = async () => {
    const parsed = await parseQuery();
    const nextCriteria = parsed ?? criteria;
    if (!parsed && !hasParsedQuery) return;

    const searchParams = new URLSearchParams(toSearchParams(nextCriteria));
    router.push(`/recruiter/find-talent/results?${searchParams.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[image:var(--gradient-page)] pb-24">
      <div className="mx-auto max-w-md px-4 pb-8">
        <header className="flex items-center gap-3 pt-5">
          <button
            type="button"
            aria-label="Go back"
            onClick={() => router.back()}
            className="text-foreground"
          >
            <ChevronLeft className="size-6" />
          </button>
          <div>
            <span className="block text-xl font-extrabold leading-none tracking-tight">AI Talent Search</span>
            <span className="block text-[10px] font-medium text-muted-foreground">Powered by RootIn AI</span>
          </div>
          <span className="ml-auto grid size-10 place-items-center rounded-full bg-foreground text-xs font-bold text-warning">
            AI
          </span>
        </header>

        <section className="relative mt-6 min-h-[260px] overflow-hidden rounded-3xl shadow-[var(--shadow-card)]">
          <Image
            src="/find-talent-hero.png"
            alt="Talent in a studio under professional lights"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 430px"
            className="absolute inset-0 size-full object-cover object-right"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/70 to-transparent" />
          <div className="relative p-5">
            <h1 className="text-4xl font-extrabold tracking-tight">
              <span className="bg-[image:var(--gradient-primary)] bg-clip-text text-transparent">AI</span>{" "}
              Talent Search
            </h1>
            <p className="mt-2 text-base font-medium leading-snug text-secondary-foreground">
              Describe what you&apos;re looking for,
              <br />
              our AI will find the right talent for you.
            </p>
            <div className="mt-4 grid max-w-[15rem] grid-cols-3 gap-1 rounded-2xl bg-white/80 p-2 backdrop-blur-sm">
              {[
                { icon: Sparkles, lines: ["Smarter", "Matches"] },
                { icon: Users, lines: ["Wider", "Discovery"] },
                { icon: Target, lines: ["Better", "Hiring"] },
              ].map(({ icon: Icon, lines }) => (
                <div key={lines[0]} className="flex items-center justify-center gap-1.5 px-1">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                    <Icon className="size-4" />
                  </span>
                  <span className="text-[10px] font-semibold leading-tight text-secondary-foreground">
                    {lines[0]}
                    <br />
                    {lines[1]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-5 rounded-2xl bg-card p-3 shadow-[var(--shadow-card)]">
          <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Sparkles className="size-4 text-primary" />
            <span>Describe the talent you need...</span>
          </label>
          <div className="mt-2 rounded-xl border border-border bg-muted/40 p-3">
            <textarea
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Describe the talent you need"
              rows={4}
              className="w-full resize-none bg-transparent text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground"
              placeholder="e.g. Female actor, 25–30, Telugu, Mumbai"
            />
            <div className="mt-2 flex justify-end">
              <button
                type="button"
                aria-label="Submit search"
                onClick={parseQuery}
                disabled={isParsing || !query.trim()}
                className="grid size-10 place-items-center rounded-full bg-[image:var(--gradient-primary)] text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                <ArrowUp className="size-5" />
              </button>
            </div>
          </div>
          <div className="mt-2 flex items-center">
            <button type="button" aria-label="Attach file" className="p-2 text-muted-foreground hover:text-foreground">
              <Paperclip className="size-4" />
            </button>
            <span className="h-4 w-px bg-border" />
            <button type="button" aria-label="Voice input" className="p-2 text-muted-foreground hover:text-foreground">
              <Mic className="size-4" />
            </button>
            <span className="h-4 w-px bg-border" />
            <button
              type="button"
              onClick={() => setQuery(examples[0].text)}
              className="ml-auto inline-flex items-center gap-1.5 text-sm font-bold text-primary"
            >
              <Sparkles className="size-4" />
              Try an example
            </button>
          </div>
          {error ? <p className="mt-2 text-xs font-medium text-destructive">{error}</p> : null}
          {isParsing ? <p className="mt-2 text-xs text-muted-foreground">Understanding your brief...</p> : null}
        </section>

        <section className="mt-4 rounded-2xl bg-muted/60 p-3">
          <h2 className="text-sm font-bold text-secondary-foreground">Example requests</h2>
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
            {examples.map(({ icon: Icon, text }) => (
              <button
                key={text}
                type="button"
                onClick={() => setQuery(text)}
                className="flex shrink-0 items-center gap-2 rounded-xl bg-card px-3 py-2.5 text-left shadow-[var(--shadow-card)]"
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                  <Icon className="size-4" />
                </span>
                <span className="w-28 text-[11px] font-semibold leading-tight text-foreground">{text}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-4 rounded-2xl bg-card p-4 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-3">
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
              <User className="size-8" />
            </span>
            <div>
              <h2 className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
                <span className="grid size-6 place-items-center rounded-full bg-success text-success-foreground">
                  <Check className="size-4" />
                </span>
                AI understood your brief
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">Here&apos;s what we found from your request:</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {parsedChips.map(({ icon: Icon, label, tint }) => (
              <span key={`${label}-${tint}`} className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold ${tint}`}>
                <Icon className="size-4 shrink-0" />
                {label}
              </span>
            ))}
          </div>

          <div className="mt-4 border-t border-border pt-4">
            <h3 className="flex items-center gap-2 text-sm font-extrabold">
              <Target className="size-4 text-primary" />
              Matching criteria
            </h3>
            <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2.5">
              {matchingCriteria.map((criterion) => (
                <li key={criterion} className="flex items-center gap-2 text-xs font-medium text-secondary-foreground">
                  <span className="grid size-4.5 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                    <Check className="size-3" />
                  </span>
                  {criterion}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <button
          type="button"
          onClick={findMatchingTalent}
          disabled={isParsing}
          className="mt-5 flex w-full items-center justify-center gap-3 rounded-full bg-[image:var(--gradient-primary)] py-4 text-base font-extrabold text-primary-foreground shadow-[var(--shadow-card)] transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          <Search className="size-5" />
          {isParsing ? "Finding criteria..." : "Find Matching Talent"}
          <ArrowRight className="size-5" />
        </button>
      </div>
    </div>
  );
}
