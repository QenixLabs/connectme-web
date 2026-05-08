import Link from "next/link";
import { cn } from "@/lib/utils";

interface AuthLayoutProps {
  children: React.ReactNode;
  subtitle?: string;
  showGlow?: boolean;
}

export function AuthLayout({
  children,
  subtitle,
  showGlow,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-page flex items-center justify-center px-4 py-12">
      {showGlow && (
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 50% -5%, var(--glow) 0%, transparent 60%)",
          }}
        />
      )}
      <div className={cn("w-full max-w-md", showGlow && "relative")}>
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-block text-2xl font-bold text-text-primary"
          >
            Connect<span className="text-brand">Me</span>
          </Link>
          {subtitle && (
            <p className="mt-2 text-sm text-text-tertiary font-light">
              {subtitle}
            </p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
