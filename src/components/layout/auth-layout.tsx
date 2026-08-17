"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import rootinLogo from "@/assets/rootin-logo-orange.png";

interface AuthLayoutProps {
  children: React.ReactNode;
  subtitle?: string;
  showGlow?: boolean;
}

export function AuthLayout({ children, subtitle, showGlow }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-y-auto bg-background px-4 py-12">
      {showGlow && (
        <div
          className="pointer-events-none fixed inset-0 opacity-15"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 50% -5%, var(--accent) 0%, transparent 60%)",
          }}
        />
      )}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
        className={cn("w-full max-w-md", showGlow && "relative z-10")}
      >
        <div className="mb-10 text-center">
          <Link href="/" className="group inline-flex items-center">
            <motion.div
              whileHover={{ scale: 1.04 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Image
                src={rootinLogo}
                alt="RootIn logo"
                height={56}
                width={180}
                priority
                unoptimized
                className="h-14 w-auto"
              />
            </motion.div>
          </Link>
          {subtitle && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="mt-2.5 text-sm font-light tracking-wide text-muted-foreground"
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
