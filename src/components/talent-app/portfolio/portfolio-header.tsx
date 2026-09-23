"use client";

import { ArrowUpRight, Eye, FileText, Image, Link2, Video } from "lucide-react";
import Link from "next/link";

export type PortfolioUploadType = "image" | "video" | "document" | "link";

export function PortfolioHeader({
  onAddMedia,
}: {
  onAddMedia: (type: PortfolioUploadType) => void;
}) {
  const actions = [
    { type: "image" as const, label: "Upload Photo", detail: "JPG, PNG or WebP", Icon: Image, tone: "bg-[#f0edff] text-[#6556c8]" },
    { type: "video" as const, label: "Upload Video", detail: "MP4, MOV or WebM", Icon: Video, tone: "bg-[#eaf3ff] text-[#3476c9]" },
    { type: "document" as const, label: "Resume / Document", detail: "PDF, DOC or DOCX", Icon: FileText, tone: "bg-[#f8efff] text-[#a04bc0]" },
    { type: "link" as const, label: "External Link", detail: "YouTube, Vimeo or web", Icon: Link2, tone: "bg-[#e8f8f8] text-[#2d8b91]" },
  ];

  return (
    <div className="space-y-3">
      <section className="relative isolate min-h-[220px] overflow-hidden rounded-[18px] border border-[#e9e7f8] bg-gradient-to-br from-white via-[#fbfaff] to-[#edf3ff] px-5 py-5 shadow-[0_14px_40px_-28px_rgba(55,48,125,0.45)] sm:min-h-[224px] sm:px-7 sm:py-7">
        <div className="relative z-10 max-w-[55%] sm:max-w-[52%]">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary/75">Portfolio</p>
          <h1 className="mt-2 text-[27px] font-bold leading-[1.05] tracking-[-0.035em] text-[#172653] sm:text-[34px]">Media Library</h1>
          <p className="mt-3 max-w-xs text-[13px] leading-5 text-[#5d6680]">Manage your photos, videos and documents.<br />Showcase your best work.</p>
          <Link href="/talent/profile" className="mt-5 inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-white/80 px-3 text-[11px] font-bold text-[#33458c] shadow-sm ring-1 ring-[#dfe3f5] transition-colors hover:bg-white">
            <Eye className="size-3.5" /> View profile <ArrowUpRight className="size-3" />
          </Link>
        </div>
        <div className="pointer-events-none absolute bottom-0 right-[-20px] z-0 h-[92%] w-[130%] sm:h-[135%] sm:w-[70%]">
          <img src="/assets/recruiter-dashboard/portfolio-hero.png" alt="" className="h-full w-full object-contain object-right-bottom" />
        </div>
      </section>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {actions.map(({ type, label, detail, Icon, tone }) => (
          <button key={type} type="button" onClick={() => onAddMedia(type)} className="group flex min-h-[92px] items-start gap-2.5 rounded-[14px] border border-border/70 bg-card p-3 text-left shadow-[0_8px_24px_-22px_rgba(35,43,91,0.7)] transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
            <span className={`grid size-8 shrink-0 place-items-center rounded-[10px] ${tone}`}><Icon className="size-4" /></span>
            <span className="min-w-0 pt-0.5"><span className="block truncate text-[11px] font-bold text-foreground">{label}</span><span className="mt-1 block text-[10px] leading-4 text-muted-foreground">{detail}</span></span>
          </button>
        ))}
      </div>
    </div>
  );
}
