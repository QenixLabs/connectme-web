"use client";

import Link from "next/link";
import { ArrowLeft, HelpCircle } from "lucide-react";
import { MorporfileLogo } from "@/components/MorporfileLogo";

interface SignupHeaderProps {
  onBack?: (() => void) | undefined;
  variant?: "light" | "dark";
  showBack?: boolean;
}

export function SignupHeader({
  onBack,
  variant = "light",
  showBack = true,
}: SignupHeaderProps) {
  const isDark = variant === "dark";

  return (
    <header className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
      <div className="flex min-w-0 justify-start">
        {showBack && onBack ? (
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to previous step"
            className={`grid size-11 place-items-center rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8738FF] focus-visible:ring-offset-2 active:scale-95 motion-reduce:transition-none ${
              isDark
                ? "border border-white/12 bg-white/[0.08] text-white hover:bg-white/[0.14]"
                : "border border-[#E1E7F2] bg-white text-[#101333] shadow-sm hover:border-[#CBD5E1] hover:bg-[#F7F8FC]"
            }`}
          >
            <ArrowLeft className="size-4.5" aria-hidden="true" />
          </button>
        ) : null}
      </div>

      <Link
        href="/"
        aria-label="Morporfile home"
        className={`group flex min-h-11 items-center justify-center transition-opacity hover:opacity-90 ${
          isDark
            ? "rounded-xl bg-white px-2 py-1 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.6)]"
            : ""
        }`}
      >
        <div className="w-[92px] sm:w-[104px]">
          <MorporfileLogo />
        </div>
      </Link>

      <div className="flex min-w-0 justify-end">
        <a
          href="mailto:support@morporfile.com"
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex h-11 items-center gap-1.5 rounded-full border px-3.5 text-xs font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8738FF] focus-visible:ring-offset-2 active:scale-95 motion-reduce:transition-none ${
            isDark
              ? "border-white/12 bg-white/[0.08] text-white/85 hover:bg-white/[0.14] hover:text-white"
              : "border-[#E1E7F2] bg-white text-[#4E5971] shadow-sm hover:border-[#CBD5E1] hover:bg-[#F7F8FC] hover:text-[#101333]"
          }`}
        >
          <span>Help</span>
          <HelpCircle className="size-3.5 opacity-80" aria-hidden="true" />
        </a>
      </div>
    </header>
  );
}
