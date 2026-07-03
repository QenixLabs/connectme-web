"use client";

import React, { useEffect, useState } from "react";
import { Share2, Copy, Check } from "lucide-react";
import QRCode from "qrcode";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface ShareProfileDialogProps {
  username?: string;
  profilePhoto?: string | null;
  name?: string;
  url?: string;
  triggerClassName?: string;
  children?: React.ReactNode;
}

export function ShareProfileDialog({
  username,
  profilePhoto,
  name,
  url: urlProp,
  triggerClassName,
  children,
}: ShareProfileDialogProps) {
  const [open, setOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const url =
    urlProp ||
    `${typeof window !== "undefined" ? window.location.origin : ""}/talent/${username}`;

  useEffect(() => {
    if (!open || !url) return;
    QRCode.toDataURL(url, {
      width: 240,
      margin: 2,
      errorCorrectionLevel: "H",
      color: {
        dark: "#1e1a14",
        light: "#ffffff",
      },
    })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(""));
  }, [open, url]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children ? (
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
      <DialogContent className="sm:max-w-sm p-6">
        <DialogHeader className="text-center">
          <DialogTitle className="text-base font-semibold">
            Share Profile
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-5">
          {/* QR Code with Avatar */}
          <div className="relative w-[200px] h-[200px]">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="QR Code" className="w-full h-full" />
            ) : (
              <div className="w-full h-full bg-muted rounded-lg animate-pulse" />
            )}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white p-1.5 rounded-full shadow-sm">
                <Avatar
                  name={name || username || "User"}
                  src={profilePhoto}
                  size="md"
                  className="w-14 h-14 text-lg"
                />
              </div>
            </div>
          </div>

          {/* URL + Copy */}
          <div className="w-full flex items-center gap-2">
            <div className="flex-1 rounded-md border border-border bg-muted px-3 py-2 text-sm text-text-secondary truncate">
              {url}
            </div>
            <Button
              size="sm"
              variant="outline"
              className="shrink-0 gap-1.5"
              onClick={handleCopy}
            >
              {copied ? (
                <Check className="w-4 h-4" strokeWidth={1.5} />
              ) : (
                <Copy className="w-4 h-4" strokeWidth={1.5} />
              )}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
