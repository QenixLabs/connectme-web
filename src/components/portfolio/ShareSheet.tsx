"use client";

import { Copy, Check, Share2 } from "lucide-react";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ShareSheetProps {
  url: string;
  title: string;
  open: boolean;
  onClose: () => void;
}

export function ShareSheet({ url, title, open, onClose }: ShareSheetProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // fall through to copy
      }
    }
    await copy();
  };

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="h-auto rounded-t-3xl border-border bg-card">
        <SheetHeader className="pb-2">
          <SheetTitle>Share Work</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 py-4">
          <div className="flex gap-2">
            <Input value={url} readOnly className="flex-1" />
            <Button variant="outline" onClick={copy}>
              {copied ? (
                <Check className="size-4 text-success" />
              ) : (
                <Copy className="size-4" />
              )}
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Button
              variant="outline"
              className="flex-col gap-1 h-auto py-3"
              onClick={shareNative}
            >
              <Share2 className="size-5" />
              <span className="text-xs">More</span>
            </Button>
            <Button
              variant="outline"
              className="flex-col gap-1 h-auto py-3"
              asChild
            >
              <a href={whatsappUrl} target="_blank" rel="noreferrer">
                WhatsApp
              </a>
            </Button>
            <Button
              variant="outline"
              className="flex-col gap-1 h-auto py-3"
              asChild
            >
              <a href={linkedinUrl} target="_blank" rel="noreferrer">
                LinkedIn
              </a>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
