"use client";

interface SocialAuthButtonsProps {
  className?: string;
  googleOnly?: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

function GoogleIcon() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

export function SocialAuthButtons({ className, googleOnly = false }: SocialAuthButtonsProps) {
  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  if (googleOnly) {
    return (
      <div className={className}>
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="flex h-14 w-full items-center justify-center gap-3 rounded-[17px] border border-[#E2E7F0] bg-white text-[15px] font-semibold text-[#080B2B] shadow-[0_5px_16px_rgba(40,48,90,0.05)] transition-colors hover:border-[#7C35FF]/35 hover:bg-[#FCFBFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C35FF]/10 active:scale-[0.99]"
        >
          <GoogleIcon />
          Continue with Google
        </button>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="relative mb-2.5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border/50" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-2.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="flex h-10 items-center justify-center gap-2 rounded-[11px] border border-border bg-card text-xs font-medium text-foreground/70 transition-all duration-200 hover:border-primary/30 hover:bg-primary/5 active:scale-[0.98]"
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
          className="flex h-10 items-center justify-center gap-2 rounded-[11px] border border-border bg-card text-xs font-medium text-foreground/70 transition-all duration-200 hover:border-primary/30 hover:bg-primary/5 active:scale-[0.98]"
        >
          <svg className="size-4" viewBox="0 0 24 24" fill="none">
            <path
              d="M17.05 12.5c-.02-2.1 1.72-3.12 1.8-3.17-.98-1.43-2.5-1.63-3.04-1.65-1.29-.14-2.54.77-3.2.77-.67 0-1.68-.75-2.76-.73-1.42.02-2.73.83-3.46 2.09-1.49 2.58-.38 6.37 1.05 8.46.72 1.02 1.55 2.16 2.65 2.12 1.07-.04 1.47-.68 2.75-.68 1.28 0 1.64.68 2.76.65 1.15-.02 1.87-1.03 2.57-2.06.81-1.17 1.15-2.3 1.17-2.36-.03-.01-2.26-.87-2.28-3.44Z"
              fill="currentColor"
            />
            <path d="M15.02 6.43c.57-.69.95-1.64.85-2.59-.82.03-1.81.55-2.4 1.23-.52.6-.98 1.57-.86 2.49.91.07 1.84-.46 2.41-1.13Z" fill="currentColor" />
          </svg>
          Apple
        </button>
      </div>
    </div>
  );
}
