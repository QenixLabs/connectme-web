"use client";

import {
  Aperture,
  Brush,
  Building2,
  Camera,
  Clapperboard,
  MessageSquare,
  MonitorPlay,
  Sparkles,
} from "lucide-react";

const SERVICES = [
  { label: "Photography", icon: Camera },
  { label: "Videography", icon: Clapperboard },
  { label: "Editing", icon: MonitorPlay },
  { label: "Makeup", icon: Brush },
  { label: "Studios", icon: Building2 },
  { label: "Equipment", icon: Aperture },
];

const MOBILE_SERVICES = SERVICES.slice(0, 4);

const AVATARS = [
  "from-[#8738FF] to-[#B66BFF]",
  "from-[#2875E8] to-[#5BA4FF]",
  "from-[#E06D9C] to-[#FFA7C4]",
  "from-[#1FA37C] to-[#27D9A0]",
];

/**
 * Decorative composition that communicates the creative-services marketplace.
 * Rendered with icons instead of stock imagery so it stays crisp, on-brand and
 * lightweight on every viewport.
 */
export function ProviderStudioVisual() {
  return (
    <>
      {/* Compact composition for mobile / tablet */}
      <div className="lg:hidden">
        <div className="grid grid-cols-4 gap-1.5">
          {MOBILE_SERVICES.map(({ label, icon: Icon }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.06] px-1 py-2.5"
            >
              <Icon className="size-4 text-[#C7A4FF]" aria-hidden="true" />
              <span className="text-[9px] font-semibold leading-none text-white/75">
                {label}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-2 text-center text-[10px] font-medium text-white/45">
          For photographers, editors, studios &amp; production crews
        </p>
      </div>

      {/* Rich composition for the desktop brand panel */}
      <div className="relative hidden lg:block">
        <div
          aria-hidden="true"
          className="absolute -inset-8 rounded-[40px] bg-[radial-gradient(circle_at_50%_45%,rgba(135,56,255,0.28),transparent_68%)] blur-2xl"
        />

        <div className="relative overflow-hidden rounded-[26px] border border-white/12 bg-white/[0.065] p-4 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.8)] backdrop-blur-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded-xl bg-white/10 text-[#D6C1FF] ring-1 ring-white/10">
                <Sparkles className="size-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/45">
                  Creative services
                </p>
                <p className="text-xs font-semibold text-white">
                  Built for every craft
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full border border-[#27D9A0]/25 bg-[#27D9A0]/10 px-2 py-1 text-[9px] font-semibold text-[#7CF0C9]">
              <span className="size-1.5 rounded-full bg-[#27D9A0]" />
              Profile live
            </span>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            {SERVICES.map(({ label, icon: Icon }) => (
              <div
                key={label}
                className="group flex flex-col gap-2 rounded-xl border border-white/10 bg-[#080B2A]/35 p-2.5 transition-colors duration-300 hover:border-white/20 hover:bg-white/[0.08]"
              >
                <Icon
                  className="size-4 text-[#C7A4FF] transition-transform duration-300 group-hover:-translate-y-0.5"
                  aria-hidden="true"
                />
                <span className="text-[10px] font-semibold text-white/80">
                  {label}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center gap-2.5 rounded-xl border border-white/10 bg-[#080B2A]/45 px-3 py-2.5">
            <div className="flex -space-x-2" aria-hidden="true">
              {AVATARS.map((gradient) => (
                <span
                  key={gradient}
                  className={`grid size-6 place-items-center rounded-full border-2 border-[#11143A] bg-gradient-to-br ${gradient} text-[8px] font-bold text-white`}
                >
                  <Sparkles className="size-2.5" />
                </span>
              ))}
            </div>
            <p className="text-[9.5px] leading-snug text-white/55">
              Directors, recruiters &amp; studios discover you here
            </p>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            {[
              { label: "Portrait", icon: Camera },
              { label: "Short film", icon: Clapperboard },
              { label: "Studio set", icon: Building2 },
            ].map(({ label, icon: Icon }) => (
              <div
                key={label}
                className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-[#8738FF]/25 via-[#3B2A72]/25 to-[#2875E8]/15 p-2"
              >
                <Icon className="size-3.5 text-white/75" aria-hidden="true" />
                <p className="mt-3 text-[8.5px] font-semibold text-white/65">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute -right-4 -top-3 flex items-center gap-1.5 rounded-lg border border-white/12 bg-[#151845] px-2.5 py-1.5 text-[9.5px] font-semibold text-white/80 shadow-lg">
          <MessageSquare className="size-3 text-[#B66BFF]" aria-hidden="true" />
          New inquiry
        </div>

        <div className="absolute -bottom-4 -left-4 flex items-center gap-1.5 rounded-lg border border-white/12 bg-[#151845] px-2.5 py-1.5 text-[9.5px] font-semibold text-white/80 shadow-lg">
          <span className="size-1.5 rounded-full bg-[#27D9A0]" />
          Portfolio ready
        </div>
      </div>
    </>
  );
}
