import type { Metadata } from "next";
import {
  ShieldCheck,
  Lock,
  Eye,
  UserCheck,
  AlertTriangle,
  Mail,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Safety Center | ConnectMe",
  description:
    "Learn how ConnectMe keeps your data safe and connection requests secure.",
};

const sections = [
  {
    icon: ShieldCheck,
    title: "Verified Profiles",
    description:
      "Every profile on ConnectMe is manually reviewed by our team before it can reach your inbox. We verify identity, professional background, and intentions to ensure you only receive genuine connection requests.",
  },
  {
    icon: Lock,
    title: "Data Privacy",
    description:
      "We never share your personal data with third parties. Your contact information, portfolio content, and communication are kept strictly between you and your connections.",
  },
  {
    icon: Eye,
    title: "Profile Visibility Control",
    description:
      "You control who sees your profile. Adjust your visibility settings at any time to limit who can send you connection requests or view your portfolio.",
  },
  {
    icon: UserCheck,
    title: "Safe Connections",
    description:
      "Every connection request shows you who is reaching out and why. You can review their profile, company, and intent before choosing to accept or decline.",
  },
  {
    icon: AlertTriangle,
    title: "Report & Block",
    description:
      "If you encounter suspicious or inappropriate behavior, you can immediately block and report the user. Our team reviews all reports within 24 hours.",
  },
  {
    icon: Mail,
    title: "Secure Messaging",
    description:
      "All messages on ConnectMe are encrypted and stored securely. Your conversations remain private and are never used for advertising or data mining.",
  },
];

export default function TalentSafetyPage() {
  return (
    <div className="page-gradient min-h-screen">
      <main className="mx-auto max-w-3xl px-5 py-12 lg:px-8">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-teal/10">
            <ShieldCheck className="size-8 text-teal" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight lg:text-4xl">
            Safety Center
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Your safety is our top priority. Here&apos;s how we protect you.
          </p>
        </div>

        <div className="space-y-5">
          {sections.map((section) => (
            <div
              key={section.title}
              className="card-surface rounded-2xl p-6"
            >
              <div className="flex items-start gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-teal/10">
                  <section.icon className="size-5 text-teal" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{section.title}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {section.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-teal/25 bg-teal/5 p-6 text-center">
          <h3 className="text-lg font-semibold">Have a concern?</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            If you ever feel unsafe or encounter a problem, reach out to our
            support team directly.
          </p>
          <a
            href="mailto:safety@connectme.app"
            className="mt-3 inline-block text-sm font-medium text-teal transition-colors hover:text-teal/80"
          >
            Contact Safety Team →
          </a>
        </div>
      </main>
    </div>
  );
}
