import Link from "next/link";
import { motion } from "motion/react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthLayoutProps {
  children: React.ReactNode;
  subtitle?: string;
  showGlow?: boolean;
}

export function AuthLayout({ children, subtitle, showGlow }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-page flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {showGlow && (
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 50% -5%, var(--glow) 0%, transparent 60%)",
          }}
        />
      )}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
        className={cn("w-full max-w-md", showGlow && "relative z-10")}
      >
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <motion.span
              whileHover={{ rotate: -8, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Sparkles className="w-5 h-5 text-brand" strokeWidth={1.5} />
            </motion.span>
            <span className="text-2xl font-serif font-bold tracking-tight text-text-primary">
              Connect<span className="text-brand">Me</span>
            </span>
          </Link>
          {subtitle && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="mt-2.5 text-sm text-text-tertiary font-light tracking-wide"
            >
              {subtitle}
            </motion.p>
          )}
        </div>

        {children}
      </motion.div>
    </div>
  );
}
