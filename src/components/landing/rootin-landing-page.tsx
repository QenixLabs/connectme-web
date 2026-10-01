"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  Check,
  Clapperboard,
  Crown,
  Film,
  Globe2,
  Image as ImageIcon,
  Play,
  Send,
  Settings,
  TrendingUp,
  UsersRound,
  Wrench,
  X,
  type LucideIcon,
} from "lucide-react";

import { RootInLogo } from "@/components/RootInLogo";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const assetBase = "https://b9310b94-370c-4caa-938f-b1f5f2af54f6.lovableproject.com/__l5e/assets-v1";
const heroImage = `${assetBase}/22cd309f-2dd8-4abb-a810-3cb94df1ff22/rootin-hero.png`;
const bannerImage = `${assetBase}/a7a5e8db-da0b-4a8f-b21f-481cca4b4c50/rootin-banner.png`;

type AudienceTone = "purple" | "blue" | "orange";

type AudienceCardData = {
  id: string;
  tone: AudienceTone;
  image: string;
  imagePosition: string;
  icon: LucideIcon;
  title: string;
  description: string;
  points: string[];
  action: string;
  href: string;
};

const audienceCards: AudienceCardData[] = [
  {
    id: "talent",
    tone: "purple",
    image: `${assetBase}/d6ae5279-839b-458a-ac53-542760bf2a1b/rootin-talent.png`,
    imagePosition: "center 30%",
    icon: UsersRound,
    title: "Talent",
    description: "Showcase your skills, portfolio and personality. Get discovered by top recruiters and brands.",
    points: ["Create Your Profile", "Upload Photos & Videos", "Apply to Auditions & Jobs", "Build Your Personal Brand"],
    action: "Join as Talent",
    href: "/auth/talent/signup",
  },
  {
    id: "recruiters",
    tone: "blue",
    image: `${assetBase}/514f884d-941d-4c11-8575-e11dccd6d308/rootin-recruiter.png`,
    imagePosition: "center 28%",
    icon: BriefcaseBusiness,
    title: "Recruiters",
    description: "Find the right talent faster. Post opportunities, browse verified profiles and collaborate seamlessly.",
    points: ["Post Casting & Jobs", "Search Verified Talent", "Manage Applications", "Build Your Dream Team"],
    action: "Join as Recruiter",
    href: "/auth/recruiter/signup",
  },
  {
    id: "services",
    tone: "orange",
    image: `${assetBase}/03d3e1b3-cb7a-4a01-bc87-7af865fad423/rootin-service.png`,
    imagePosition: "center 32%",
    icon: Settings,
    title: "Services Provider & Marketplace",
    description: "List your professional services and connect with talent, recruiters and production houses.",
    points: ["Create Service Profile", "Showcase Work & Packages", "Get Hired for Projects", "Build Long-term Relationships"],
    action: "Join as Service Provider",
    // Service-provider onboarding is not available yet; use the existing auth entry.
    href: "/auth",
  },
];

const socialAvatars = [
  { src: "/avatars/avatar-1.jpg", alt: "RootIn community member" },
  { src: "/avatars/avatar-2.jpg", alt: "RootIn community member" },
  { src: "/avatars/avatar-3.jpg", alt: "RootIn community member" },
  { src: "/avatars/avatar-user.jpg", alt: "RootIn community member" },
  { src: "/images/avatars/avatar-priya.jpg", alt: "RootIn community member" },
  { src: "/images/avatars/avatar-arjun.jpg", alt: "RootIn community member" },
];

const featureItems: { icon: LucideIcon; lines: string[]; href: string }[] = [
  { icon: Clapperboard, lines: ["Auditions", "& Jobs"], href: "#talent" },
  { icon: UsersRound, lines: ["Collaboration", "& Networking"], href: "#recruiters" },
  { icon: Send, lines: ["Projects", "& Gigs"], href: "#recruiters" },
  { icon: ImageIcon, lines: ["Showcase", "Your Work"], href: "#talent" },
  { icon: BriefcaseBusiness, lines: ["Hire", "Professionals"], href: "#services" },
  { icon: TrendingUp, lines: ["Grow", "Your Career"], href: "#join" },
];

const statItems: { icon: LucideIcon; value: string; lines: string[]; tone: string }[] = [
  { icon: UsersRound, value: "50K+", lines: ["Talented", "Creators"], tone: "purple" },
  { icon: Film, value: "5K+", lines: ["Verified", "Recruiters"], tone: "blue" },
  { icon: Wrench, value: "2K+", lines: ["Service", "Providers"], tone: "orange" },
  { icon: BriefcaseBusiness, value: "10K+", lines: ["Opportunities", "Posted"], tone: "green" },
  { icon: Globe2, value: "50+", lines: ["Cities", "Across India"], tone: "pink" },
];

function LandingActionLink({
  href,
  children,
  tone = "primary",
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  tone?: "primary" | AudienceTone | "outline";
  className?: string;
}) {
  const toneClass = tone === "primary" ? "rootin-button-primary" : `rootin-button-${tone}`;

  return (
    <Link href={href} className={`rootin-button ${toneClass} ${className}`}>
      {children}
    </Link>
  );
}

function LandingHeader() {
  return (
    <header className="landing-header">
      <Link className="brand" href="#top" aria-label="Rootin home">
        <RootInLogo className="brand-logo" />
      </Link>

      <div className="nav-actions">
        <Button asChild variant="rootinOutline">
          <Link href="/auth/login">Sign In</Link>
        </Button>
        <Button asChild variant="rootin">
          <Link href="/auth">Sign Up</Link>
        </Button>
      </div>
    </header>
  );
}

function SocialProof() {
  return (
    <div className="social-proof">
      <div className="avatar-stack" aria-label="RootIn members">
        {socialAvatars.map((avatar) => (
          <Image
            key={avatar.src}
            src={avatar.src}
            alt={avatar.alt}
            width={38}
            height={38}
            sizes="38px"
          />
        ))}
      </div>
      <div>
        <strong>50K+</strong>
        <span>Talents already on RootIn</span>
      </div>
    </div>
  );
}

function RoleSwitcher() {
  const roles = [
    { label: "Talent", href: "#talent", icon: UsersRound, tone: "purple" },
    { label: "Recruiters", href: "#recruiters", icon: BriefcaseBusiness, tone: "blue" },
    { label: "Services", href: "#services", icon: Settings, tone: "orange" },
  ] as const;

  return (
    <nav className="role-switcher" aria-label="Choose your RootIn path">
      {roles.map(({ label, href, icon: Icon, tone }) => (
        <a href={href} key={label}>
          <span className={`role-switcher-icon ${tone}`}>
            <Icon size={20} aria-hidden="true" />
          </span>
          <span>{label}</span>
        </a>
      ))}
    </nav>
  );
}

function HeroSection({ onWatchVideo }: { onWatchVideo: () => void }) {
  return (
    <section className="hero-section" id="top">
      <div className="hero-copy">
        <div className="eyebrow">
          <Crown size={15} fill="currentColor" aria-hidden="true" />
          INDIA&apos;S #1 ENTERTAINMENT TALENT ECOSYSTEM
        </div>
        <h1>
          <span>Where</span>
          <span className="hero-highlight">Talent</span>
          <span className="hero-highlight">Connects</span>
          <span className="hero-last">with Opportunities.</span>
        </h1>
        <p>
          For talent, recruiters and creative service providers. Create. Collaborate. Get Discovered.
        </p>
        <div className="hero-actions">
          <LandingActionLink href="/auth" className="hero-primary-action">
            Get Started <ArrowRight size={20} />
          </LandingActionLink>
          <button className="rootin-button rootin-button-outline hero-video-action" type="button" onClick={onWatchVideo}>
            <span className="play-round">
              <Play size={16} fill="currentColor" aria-hidden="true" />
            </span>
            Watch Video
          </button>
        </div>
        <SocialProof />
      </div>

      <div className="hero-stage">
        <div className="hero-visual">
          <div className="hero-glow" aria-hidden="true" />
          <Image
            className="hero-art"
            src={heroImage}
            alt="Entertainment talent, a performer and a filmmaker"
            fill
            priority
            sizes="(min-width: 1024px) 58vw, 100vw"
          />
          <div className="hero-note" aria-hidden="true">
            Same
            <br />
            Passion.
            <br />
            Bigger
            <br />
            Opportunities.
          </div>
          <div className="hero-scribble" aria-hidden="true">
            ↗ One Platform
            <br />
            Endless Possibilities
          </div>
        </div>
        <RoleSwitcher />
      </div>
    </section>
  );
}

function FeatureStrip() {
  return (
    <section className="feature-section" id="opportunities" aria-label="What you can do on RootIn">
      <nav className="feature-strip">
        {featureItems.map(({ icon: Icon, lines, href }) => (
          <a href={href} key={lines.join("-")}>
            <Icon aria-hidden="true" />
            <span>
              {lines[0]}
              <br />
              {lines[1]}
            </span>
          </a>
        ))}
      </nav>
    </section>
  );
}

function AudienceCard({ card }: { card: AudienceCardData }) {
  const Icon = card.icon;
  const actionTone = card.tone === "purple" ? "primary" : card.tone;

  if (card.id === "services") {
    return (
      <article className={`audience-card ${card.tone}`} id={card.id}>
        <div className="audience-card-image">
          <Image
            src={card.image}
            alt={`${card.title} on RootIn`}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="audience-card-art"
            style={{ objectPosition: card.imagePosition }}
          />
          <span className="audience-card-icon">
            <Icon size={24} fill="currentColor" aria-hidden="true" />
          </span>
        </div>
        <div className="audience-card-content">
          <div className="audience-card-copy">
            <span className="audience-card-eyebrow">For</span>
            <h2>{card.title}</h2>
            <p>{card.description}</p>
            <ul>
              {card.points.map((point) => (
                <li key={point}>
                  <Check size={13} strokeWidth={3} aria-hidden="true" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
          <button
            type="button"
            onClick={() => toast.info("Service provider onboarding is coming soon")}
            className={`rootin-button rootin-button-${actionTone} audience-card-cta w-full`}
          >
            {card.action} <ArrowRight size={18} />
          </button>
        </div>
      </article>
    );
  }

  return (
    <article className={`audience-card ${card.tone}`} id={card.id}>
      <div className="audience-card-image">
        <Image
          src={card.image}
          alt={`${card.title} on RootIn`}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="audience-card-art"
          style={{ objectPosition: card.imagePosition }}
        />
        <span className="audience-card-icon">
          <Icon size={24} fill="currentColor" aria-hidden="true" />
        </span>
      </div>
      <div className="audience-card-content">
        <div className="audience-card-copy">
          <span className="audience-card-eyebrow">For</span>
          <h2>{card.title}</h2>
          <p>{card.description}</p>
          <ul>
            {card.points.map((point) => (
              <li key={point}>
                <Check size={13} strokeWidth={3} aria-hidden="true" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
        <LandingActionLink href={card.href} tone={actionTone} className="audience-card-cta w-full">
          {card.action} <ArrowRight size={18} />
        </LandingActionLink>
      </div>
    </article>
  );
}

function AudienceCards() {
  return (
    <section className="audience-section" aria-label="Join the RootIn community">
      <div className="audience-grid">
        {audienceCards.map((card) => (
          <AudienceCard card={card} key={card.id} />
        ))}
      </div>
    </section>
  );
}

function PlatformStats() {
  return (
    <section className="stats-panel" aria-label="RootIn community numbers">
      {statItems.map(({ icon: Icon, value, lines, tone }) => (
        <div className={`stat-item ${tone}`} key={value}>
          <Icon aria-hidden="true" />
          <strong>{value}</strong>
          <span>
            {lines[0]}
            <br />
            {lines[1]}
          </span>
        </div>
      ))}
    </section>
  );
}

function TrustedBrands() {
  return (
    <section className="trusted-section" aria-label="Trusted by leading brands and productions">
      <h2>TRUSTED BY LEADING BRANDS &amp; PRODUCTIONS</h2>
      <div className="brand-row">
        <span className="brand-netflix">NETFLIX</span>
        <span className="brand-hotstar">
          Disney+
          <b>hotstar</b>
        </span>
        <span className="brand-prime">prime video <small>⌣</small></span>
        <span className="brand-zee">ZEE</span>
        <span className="brand-sony">SONY</span>
        <span className="brand-viacom">viacom<small>18</small></span>
        <span className="brand-tseries">T<small>Series</small></span>
        <span className="brand-dharma">◌ DHARMA<small>PRODUCTIONS</small></span>
        <span className="brand-more">&amp; More</span>
      </div>
    </section>
  );
}

function BottomCta() {
  return (
    <section className="bottom-cta hero-card" id="join">
      <div className="bottom-cta-copy hero-content">
        <div className="bottom-cta-kicker">JOIN ROOTIN TODAY</div>
        <h2>
          Create. Collaborate.
          <br />
          Grow Beyond Borders.
        </h2>
        <p>
          Be part of a thriving entertainment community where talent, ideas and opportunities come together.
        </p>
        <div className="bottom-cta-actions">
          <LandingActionLink href="/auth">
            Sign Up Now <ArrowRight size={18} />
          </LandingActionLink>
          <a className="rootin-button rootin-button-outline" href="#opportunities">
            Learn More
          </a>
        </div>
      </div>
      <div className="bottom-cta-artwork hero-artwork">
        <Image
          src={bannerImage}
          alt="RootIn creative talent community with an actress, cameras and lights"
          width={1942}
          height={809}
          sizes="(min-width: 640px) 50vw, 100vw"
          className="bottom-cta-art object-contain object-bottom-right"
        />
      </div>
    </section>
  );
}

function WatchVideoModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="video-modal-backdrop" role="presentation" onClick={onClose}>
      <div className="video-modal" role="dialog" aria-modal="true" aria-labelledby="rootin-video-title" onClick={(event) => event.stopPropagation()}>
        <button className="video-modal-close" type="button" aria-label="Close video" onClick={onClose}>
          <X size={22} />
        </button>
        <div className="video-player">
          <video controls playsInline preload="metadata" poster={heroImage} aria-label="RootIn introduction video">
            <track kind="captions" />
          </video>
          <div className="video-player-empty">RootIn brand film coming soon.</div>
        </div>
        <h2 id="rootin-video-title">Meet the RootIn community</h2>
        <p>See how talent, recruiters and service providers create better work together.</p>
      </div>
    </div>
  );
}

export function RootinLandingPage() {
  const [videoOpen, setVideoOpen] = useState(false);

  return (
    <main className="rootin-page">
      <div className="landing-container">
        <LandingHeader />
        <HeroSection onWatchVideo={() => setVideoOpen(true)} />
        <FeatureStrip />
        <AudienceCards />
        <PlatformStats />
        <TrustedBrands />
        <BottomCta />
      </div>
      {videoOpen && <WatchVideoModal onClose={() => setVideoOpen(false)} />}
    </main>
  );
}
