"use client";

import Link from "next/link";
import { Briefcase, Check, Users, ArrowRight } from "lucide-react";
import type { StepProps } from "../types";
import { SignupHeader } from "../signup-header";
import { Stepper } from "../stepper";

const ROLES = [
  {
    id: "Service Provider" as const,
    icon: Briefcase,
    title: "Service Provider",
    desc: "I offer my skills, services, gear or studio facilities on Morporfile.",
    badge: "Recommended for you",
  },
  {
    id: "Client / Recruiter" as const,
    icon: Users,
    title: "Client / Recruiter",
    desc: "I hire creative talent or book services for productions and projects.",
    badge: null,
  },
];

export function RoleStep({ data, update, onNext }: StepProps) {
  const isProvider = data.role === "Service Provider";

  return (
    <div className="flex flex-col min-h-[640px]">
      <SignupHeader showBack={false} />

      <div className="mt-5 px-4 sm:px-6">
        <Stepper current={1} />
      </div>

      <div className="px-5 pb-8 pt-6 sm:px-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#8738FF]/20 bg-[#F6F1FF] px-3 py-1 text-xs font-bold text-[#8738FF] dark:bg-[#8738FF]/15">
          <Briefcase className="size-3.5" />
          Step 1 of 5
        </div>

        <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold leading-tight text-[#101333] dark:text-white">
          Choose Your Role
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[#7885A3] dark:text-white/70">
          Tell us what brings you to Morporfile. You can easily expand your profile capabilities later.
        </p>

        <div className="mt-6 space-y-3.5">
          {ROLES.map((role) => {
            const selected = data.role === role.id;
            const Icon = role.icon;
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => update({ role: role.id })}
                className={`group flex w-full items-start gap-4 rounded-2xl border p-4 sm:p-5 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8738FF] ${
                  selected
                    ? "border-[#8738FF] bg-[#F7F3FF] shadow-sm ring-1 ring-[#8738FF] dark:bg-[#8738FF]/10 dark:border-[#8738FF]"
                    : "border-[#E1E7F2] bg-white hover:border-[#CBD5E1] hover:bg-[#F7F8FC] dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]"
                }`}
              >
                <span
                  className={`flex size-12 shrink-0 items-center justify-center rounded-2xl transition-colors ${
                    selected
                      ? "bg-[#8738FF] text-white shadow-sm"
                      : "bg-[#F7F8FC] text-[#7885A3] group-hover:text-[#101333] dark:bg-white/10 dark:text-white/80"
                  }`}
                >
                  <Icon className="size-5.5 stroke-[2.2]" />
                </span>

                <span className="flex-1 min-w-0">
                  <span className="flex items-center gap-2 flex-wrap">
                    <span className="block text-base font-extrabold text-[#101333] dark:text-white">
                      {role.title}
                    </span>
                    {role.badge && (
                      <span className="rounded-full bg-[#8738FF]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#8738FF] dark:bg-[#8738FF]/20">
                        {role.badge}
                      </span>
                    )}
                  </span>
                  <span className="mt-1 block text-xs sm:text-sm leading-snug text-[#7885A3] dark:text-white/70">
                    {role.desc}
                  </span>
                </span>

                <span
                  className={`mt-1 flex size-5.5 shrink-0 items-center justify-center rounded-full transition-colors ${
                    selected
                      ? "bg-[#8738FF] text-white"
                      : "border-2 border-[#CBD5E1] dark:border-white/20"
                  }`}
                >
                  {selected ? <Check className="size-3.5 stroke-[3]" /> : null}
                </span>
              </button>
            );
          })}
        </div>

        {!isProvider && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200">
            Looking to recruit talent exclusively? You can also{" "}
            <Link
              href="/auth/recruiter/signup"
              className="font-bold underline underline-offset-2 hover:text-amber-950"
            >
              go to the dedicated Recruiter Signup
            </Link>
            .
          </div>
        )}

        <button
          type="button"
          onClick={onNext}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-[#8738FF] py-4 text-sm font-bold text-white shadow-lg shadow-[#8738FF]/20 transition-all hover:bg-[#6C2BE8] active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8738FF]"
        >
          <span>Continue</span>
          <ArrowRight className="size-4.5" />
        </button>

        <p className="mt-6 text-center text-xs text-[#8A96AC]">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="font-bold text-[#8738FF] hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
