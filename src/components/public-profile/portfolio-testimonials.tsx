"use client";

import { motion } from "motion/react";
import { Quote, MessageSquare } from "lucide-react";

interface TestimonialItem {
  recruiter_name?: string;
  recruiter_company?: string;
  content?: string;
  is_video?: boolean;
}

interface PortfolioTestimonialsProps {
  testimonials: TestimonialItem[];
}

function EmptyState() {
  return (
    <div className="rounded-2xl bg-card border border-border/60 shadow-luxe p-8 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cream">
        <MessageSquare className="h-6 w-6 text-ink-muted" strokeWidth={1.2} />
      </div>
      <p className="mt-4 text-[14px] font-medium text-ink">No testimonials yet</p>
      <p className="mt-1 text-[12.5px] text-ink-muted leading-relaxed max-w-xs mx-auto">
        Recommendations from recruiters and collaborators will appear here.
      </p>
    </div>
  );
}

function TestimonialCard({ testimonial, index }: { testimonial: TestimonialItem; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="rounded-2xl bg-card border border-border/60 shadow-luxe p-5"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold/10">
          <Quote className="h-4 w-4 text-gold" strokeWidth={1.5} />
        </div>
        <div className="min-w-0">
          {testimonial.content && (
            <p className="text-[13.5px] leading-[1.65] text-ink-soft italic">
              &ldquo;{testimonial.content}&rdquo;
            </p>
          )}
          <div className="mt-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cream border border-border">
              <span className="text-[11px] font-semibold text-ink-muted">
                {(testimonial.recruiter_name || "R")[0].toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-[12.5px] font-semibold text-ink leading-none">
                {testimonial.recruiter_name || "Recruiter"}
              </p>
              {testimonial.recruiter_company && (
                <p className="text-[11px] text-ink-muted mt-0.5">
                  {testimonial.recruiter_company}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function PortfolioTestimonials({ testimonials }: PortfolioTestimonialsProps) {
  if (testimonials.length === 0) {
    return (
      <section className="px-4 mt-5">
        <div className="flex items-center gap-2 mb-3 px-1">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gold/10">
            <Quote className="h-3.5 w-3.5 text-gold" strokeWidth={1.5} />
          </div>
          <h3 className="text-sm font-semibold text-ink tracking-tight">
            Testimonials
          </h3>
        </div>
        <EmptyState />
      </section>
    );
  }

  return (
    <section className="px-4 mt-5">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gold/10">
            <Quote className="h-3.5 w-3.5 text-gold" strokeWidth={1.5} />
          </div>
          <h3 className="text-sm font-semibold text-ink tracking-tight">
            Testimonials
          </h3>
        </div>
        <span className="text-[11px] font-medium text-ink-muted bg-muted px-2.5 py-1 rounded-full tabular-nums">
          {testimonials.length}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {testimonials.map((t, i) => (
          <TestimonialCard key={i} testimonial={t} index={i} />
        ))}
      </div>
    </section>
  );
}
