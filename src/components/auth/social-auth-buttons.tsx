"use client";

interface SocialAuthButtonsProps {
  className?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

export function SocialAuthButtons({ className }: SocialAuthButtonsProps) {
  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  return (
    <div className={className}>
      <div className="relative mb-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border/50" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-3 text-[11px] uppercase tracking-widest text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="flex h-11 items-center justify-center gap-2.5 rounded-xl border border-border bg-card text-sm font-medium text-foreground/70 transition-all duration-200 hover:border-primary/30 hover:bg-primary/5 active:scale-[0.98]"
        >
          <svg className="size-4" viewBox="0 0 24 24" fill="none">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Google
        </button>
        <button
          type="button"
          className="flex h-11 items-center justify-center gap-2.5 rounded-xl border border-border bg-card text-sm font-medium text-foreground/70 transition-all duration-200 hover:border-primary/30 hover:bg-primary/5 active:scale-[0.98]"
        >
          <svg className="size-4" viewBox="0 0 24 24" fill="none">
            <path
              d="M20.5 2h-17A1.5 1.5 0 0 0 2 3.5v17A1.5 1.5 0 0 0 3.5 22h17a1.5 1.5 0 0 0 1.5-1.5v-17A1.5 1.5 0 0 0 20.5 2z"
              fill="#0A66C2"
            />
            <path
              d="M8 10v9H5v-9h3zm.5-3.5A1.75 1.75 0 1 0 6.75 8.25 1.75 1.75 0 0 0 8.5 6.5zM19 14.37V19h-3v-4.37c0-1.25-.5-2.13-1.62-2.13a1.75 1.75 0 0 0-1.63 1.17 2.27 2.27 0 0 0-.12.87V19h-3v-9h3v1.25a3.5 3.5 0 0 1 3-1.63c2.25 0 3.87 1.5 3.87 4.75z"
              fill="#fff"
            />
          </svg>
          LinkedIn
        </button>
      </div>
    </div>
  );
}
