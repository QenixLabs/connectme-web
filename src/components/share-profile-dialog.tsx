"use client";

import React, { useEffect, useState } from "react";
import { Share2, Copy, Check, X, MessageCircle } from "lucide-react";
import QRCode from "qrcode";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ShareProfileDialogProps {
  username?: string;
  profilePhoto?: string | null;
  name?: string;
  url?: string;
  triggerClassName?: string;
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ShareProfileDialog({
  username,
  profilePhoto,
  name,
  url: urlProp,
  triggerClassName,
  children,
  open: controlledOpen,
  onOpenChange,
}: ShareProfileDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const url =
    urlProp ||
    `${typeof window !== "undefined" ? window.location.origin : ""}/talent/${username}`;

  const getCssVar = (name: string, fallback: string): string => {
    if (typeof window === "undefined") return fallback;
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim();
    return value || fallback;
  };

  useEffect(() => {
    if (!open || !url) return;
    QRCode.toDataURL(url, {
      width: 148,
      margin: 2,
      errorCorrectionLevel: "H",
      color: {
        dark: getCssVar("--color-ink-deep", "#1a160f"),
        light: getCssVar("--color-white", "#ffffff"),
      },
    })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(""));
  }, [open, url]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2000);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      showToast("Link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleShareWA = () => {
    const text = encodeURIComponent(
      `Check out this profile on ConnectMe: ${url}`,
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const handleCopyForIG = () => {
    navigator.clipboard.writeText(url).catch(() => {});
    showToast("Copied — paste in your Instagram bio!");
  };

  const initials =
    name
      ?.split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {controlledOpen !== undefined ? null : children ? (
        <DialogTrigger asChild>
          {children as React.ReactElement}
        </DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn("gap-1.5", triggerClassName)}
          >
            <Share2 className="w-4 h-4" strokeWidth={1.5} />
            Share
          </Button>
        </DialogTrigger>
      )}

      <DialogContent
        className="sm:max-w-[400px] p-0 overflow-hidden border-0 bg-cream-light"
        showCloseButton={false}
      >
        {/* Top Section */}
        <div className="relative bg-ink-deep px-7 pt-7 pb-6 overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at 70% -20%, var(--color-msg-gold) 0%, transparent 65%)",
              opacity: 0.18,
            }}
          />

          {/* Custom close */}
          <button
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 z-10 w-7 h-7 rounded-full flex items-center justify-center text-white/70 transition-colors hover:bg-white/20 bg-white/10"
            aria-label="Close"
          >
            <X className="w-3.5 h-3.5" strokeWidth={2} />
          </button>

          <div className="relative z-[1] flex items-center gap-3.5">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-lg text-white font-semibold shrink-0 border-2 border-msg-gold/40 overflow-hidden"
              style={{
                background: "linear-gradient(135deg, var(--color-msg-gold), var(--color-gold-dark))",
                fontFamily: "var(--font-playfair), Georgia, serif",
              }}
            >
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
            <div>
              <div
                className="text-[17px] font-semibold text-cream-light leading-tight"
                style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
              >
                {name || "User"}
              </div>
              <div className="text-xs text-cream-light/50 mt-0.5 font-light tracking-wide">
                {username ? `@${username}` : ""}
              </div>
            </div>
          </div>

          <div className="relative z-[1] mt-5 text-[10px] font-medium tracking-[0.12em] uppercase text-msg-gold/80">
            Share profile
          </div>
        </div>

        {/* Body */}
        <div className="px-7 pt-6 pb-7">
          {/* QR Code */}
          <div className="flex justify-center mb-5">
            <div className="relative inline-block bg-white rounded-[14px] p-3.5 border border-msg-gold/20">
              {/* Corner accents */}
              <div className="absolute top-2 left-2 w-[18px] h-[18px] border-t-[2.5px] border-l-[2.5px] border-msg-gold rounded-tl-[3px]" />
              <div className="absolute top-2 right-2 w-[18px] h-[18px] border-t-[2.5px] border-r-[2.5px] border-msg-gold rounded-tr-[3px]" />
              <div className="absolute bottom-2 left-2 w-[18px] h-[18px] border-b-[2.5px] border-l-[2.5px] border-msg-gold rounded-bl-[3px]" />
              <div className="absolute bottom-2 right-2 w-[18px] h-[18px] border-b-[2.5px] border-r-[2.5px] border-msg-gold rounded-br-[3px]" />

              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="QR Code"
                  className="w-[148px] h-[148px] block rounded"
                />
              ) : (
                <div className="w-[148px] h-[148px] bg-cream-muted rounded flex items-center justify-center animate-pulse" />
              )}
            </div>
          </div>

          <p className="text-center text-[11px] text-ink-pale mb-5 font-light tracking-wide">
            Scan to view full profile
          </p>

          {/* URL Row */}
          <div className="flex items-center gap-2 bg-cream-muted rounded-[10px] px-3 py-2.5 mb-4 border border-msg-gold/15">
            <span className="flex-1 text-xs text-ink-faded truncate font-normal tracking-wide">
              {url}
            </span>
            <button
              onClick={handleCopy}
              className={cn(
                "shrink-0 flex items-center gap-1.5 rounded-[7px] px-3 py-1.5 text-[11px] font-medium tracking-wide transition-colors cursor-pointer",
                copied
                  ? "bg-success-dark text-success-pale"
                  : "bg-ink-deep text-msg-gold hover:bg-ink-deep-hover",
              )}
            >
              {copied ? (
                <Check className="w-3.5 h-3.5" strokeWidth={2} />
              ) : (
                <Copy className="w-3.5 h-3.5" strokeWidth={2} />
              )}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex-1 h-px bg-msg-gold/15" />
            <span className="text-[10px] text-ink-light font-normal tracking-[0.08em] uppercase">
              also share via
            </span>
            <div className="flex-1 h-px bg-msg-gold/15" />
          </div>

          {/* Social Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handleShareWA}
              className="flex flex-col items-center gap-1.5 bg-white border border-msg-gold/20 rounded-[10px] py-2.5 px-2 cursor-pointer transition-all hover:bg-cream-hover hover:border-msg-gold/50 hover:-translate-y-0.5"
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm bg-green-light text-green">
                <MessageCircle className="w-4 h-4" strokeWidth={2} />
              </div>
              <span className="text-[10px] text-ink-faded font-medium tracking-wide">
                WhatsApp
              </span>
            </button>

            <button
              onClick={handleCopyForIG}
              className="flex flex-col items-center gap-1.5 bg-white border border-msg-gold/20 rounded-[10px] py-2.5 px-2 cursor-pointer transition-all hover:bg-cream-hover hover:border-msg-gold/50 hover:-translate-y-0.5"
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm bg-rose-light text-rose">
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </div>
              <span className="text-[10px] text-ink-faded font-medium tracking-wide">
                Instagram
              </span>
            </button>

            <button
              onClick={handleCopy}
              className="flex flex-col items-center gap-1.5 bg-white border border-msg-gold/20 rounded-[10px] py-2.5 px-2 cursor-pointer transition-all hover:bg-cream-hover hover:border-msg-gold/50 hover:-translate-y-0.5"
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm bg-blue-light text-blue">
                <Copy className="w-4 h-4" strokeWidth={2} />
              </div>
              <span className="text-[10px] text-ink-faded font-medium tracking-wide">
                Copy link
              </span>
            </button>
          </div>
        </div>

        {/* Toast */}
        {toastMsg && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-ink-deep text-msg-gold text-xs px-4 py-1.5 rounded-full font-medium whitespace-nowrap pointer-events-none animate-in fade-in slide-in-from-bottom-2 duration-300">
            {toastMsg}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
