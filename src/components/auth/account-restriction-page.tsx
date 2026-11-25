import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Ban, CheckCircle2, Clock3, Mail, ShieldAlert } from "lucide-react";
import logo from "@/assets/morporfile-logo-orange.png";

type RestrictionKind = "suspended" | "banned";

const content = {
  suspended: {
    eyebrow: "Temporary restriction", title: "Your account is suspended",
    description: "Weâ€™ve temporarily limited access to your Morporfile account while we review recent activity. You wonâ€™t be able to use account features until the suspension ends.",
    icon: Clock3, iconClass: "bg-amber-100 text-amber-700", accent: "border-amber-200 bg-amber-50/70", action: "Request a review", detailTitle: "What happens next",
    details: ["Our team will review the activity that led to this restriction.", "If you believe this was a mistake, contact support and include the email on your account.", "Weâ€™ll email you when the review is complete or when access is restored."],
  },
  banned: {
    eyebrow: "Permanent restriction", title: "Your account has been banned",
    description: "This account can no longer access Morporfile because it was found to violate our Community Guidelines or Terms of Service.",
    icon: Ban, iconClass: "bg-rose-100 text-rose-700", accent: "border-rose-200 bg-rose-50/70", action: "Appeal this decision", detailTitle: "If you think this is an error",
    details: ["You may appeal this decision by contacting our support team.", "Please use the email address associated with your Morporfile account so we can find your case.", "Appeals are reviewed by a member of our team and may take a few business days."],
  },
} satisfies Record<RestrictionKind, object>;

export function AccountRestrictionPage({ kind }: { kind: RestrictionKind }) {
  const item = content[kind] as (typeof content)[RestrictionKind];
  const Icon = item.icon;
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f7f8fc] px-4 py-10 text-[#17213b] sm:px-6">
      <div className="pointer-events-none absolute -left-32 -top-40 h-96 w-96 rounded-full bg-[#f9b233]/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-48 -right-28 h-[30rem] w-[30rem] rounded-full bg-[#1a5bdb]/10 blur-3xl" />
      <section className="relative w-full max-w-5xl overflow-hidden rounded-[2rem] border border-[#e5e8f0] bg-white shadow-[0_24px_80px_rgba(20,34,72,0.10)] lg:grid lg:grid-cols-[0.9fr_1.1fr]">
        <div className="flex flex-col justify-between bg-[#16213d] p-8 text-white sm:p-12 lg:p-14">
          <Link href="/" aria-label="Morporfile home" className="block w-fit"><Image src={logo} alt="Morporfile" width={164} height={52} className="h-auto w-36 brightness-0 invert sm:w-40" priority /></Link>
          <div className="mt-16 max-w-sm lg:mt-24">
            <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15"><ShieldAlert className="h-7 w-7 text-[#f9b233]" aria-hidden="true" /></div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#aeb9d6]">Account safety</p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.03em] sm:text-4xl">Weâ€™re here to keep Morporfile trusted.</h2>
            <p className="mt-5 text-sm leading-7 text-[#c5cee3]">Every account review helps keep opportunities, conversations, and profiles safe for the whole community.</p>
          </div>
          <p className="mt-16 text-xs text-[#8490b0]">Need help? Our support team is ready to listen.</p>
        </div>
        <div className="p-7 sm:p-12 lg:p-14">
          <div className={`mb-8 flex items-center gap-3 rounded-2xl border px-4 py-3 ${item.accent}`}><div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${item.iconClass}`}><Icon className="h-4 w-4" aria-hidden="true" /></div><p className="text-sm font-semibold text-[#3b4662]">{item.eyebrow}</p></div>
          <h1 className="max-w-lg text-3xl font-bold leading-tight tracking-[-0.035em] text-[#17213b] sm:text-4xl">{item.title}</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-[#66708b]">{item.description}</p>
          <div className="mt-9 border-t border-[#e8ebf2] pt-8"><h2 className="text-sm font-bold uppercase tracking-[0.12em] text-[#17213b]">{item.detailTitle}</h2><ul className="mt-5 space-y-4">{item.details.map((detail) => <li key={detail} className="flex gap-3 text-sm leading-6 text-[#66708b]"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#1a5bdb]" aria-hidden="true" /><span>{detail}</span></li>)}</ul></div>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center"><a href="mailto:support@morporfile.app?subject=Account%20review%20request" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#1a5bdb] px-5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(26,91,219,0.22)] transition hover:bg-[#144dbb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a5bdb] focus-visible:ring-offset-2"><Mail className="h-4 w-4" aria-hidden="true" />{item.action}</a><Link href="/auth/login" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-[#44506d] transition hover:bg-[#f2f5fb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a5bdb] focus-visible:ring-offset-2"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Back to sign in</Link></div>
          <p className="mt-8 text-xs leading-5 text-[#8a93a9]">By contacting support, you agree that Morporfile may review account activity related to your request.</p>
        </div>
      </section>
    </main>
  );
}
