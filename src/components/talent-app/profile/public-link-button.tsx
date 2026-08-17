"use client";

import { useState } from "react";
import { Link2, Check, ExternalLink } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PublicLinkButtonProps {
  username: string;
}

export function PublicLinkButton({ username }: PublicLinkButtonProps) {
  const [copied, setCopied] = useState(false);
  const href = `/talent/${username}`;
  const fullUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${href}`
      : href;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      toast.success("Public profile link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1.5"
              onClick={handleCopy}
            >
              {copied ? (
                <Check className="size-3.5 text-success" />
              ) : (
                <Link2 className="size-3.5" />
              )}
              <span className="hidden sm:inline">
                {copied ? "Copied" : "Copy link"}
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Copy public profile URL</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Button
        variant="outline"
        size="sm"
        className="h-9 gap-1.5"
        asChild
      >
        <a href={href} target="_blank" rel="noopener noreferrer">
          <ExternalLink className="size-3.5" />
          <span className="hidden sm:inline">Preview</span>
        </a>
      </Button>
    </div>
  );
}
