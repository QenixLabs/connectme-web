"use client";

import { motion, AnimatePresence } from "motion/react";
import { X, BookmarkCheck, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BulkActionBarProps {
  selectedCount: number;
  onClear: () => void;
  onAcceptAll: () => void;
  onRejectAll: () => void;
  onShortlistAll?: () => void;
  isProcessing?: boolean;
}

export function BulkActionBar({
  selectedCount,
  onClear,
  onAcceptAll,
  onRejectAll,
  onShortlistAll,
  isProcessing,
}: BulkActionBarProps) {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-2xl bg-surface-dark px-5 py-3 shadow-luxe-lg border border-white/10"
        >
          <span className="text-sm font-semibold text-on-surface-dark whitespace-nowrap">
            {selectedCount} selected
          </span>
          <div className="w-px h-5 bg-white/20" />
          <div className="flex items-center gap-2">
            {onShortlistAll && (
              <Button
                size="sm"
                variant="ghost"
                className="h-9 rounded-xl text-xs text-white/80 hover:text-white hover:bg-white/10 font-medium"
                onClick={onShortlistAll}
                disabled={isProcessing}
              >
                <BookmarkCheck className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.5} />
                Shortlist
              </Button>
            )}
            <Button
              size="sm"
              className="h-9 rounded-xl text-xs bg-emerald-600 text-white hover:bg-emerald-700 font-semibold"
              onClick={onAcceptAll}
              disabled={isProcessing}
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.5} />
              Accept All
            </Button>
            <Button
              size="sm"
              className="h-9 rounded-xl text-xs bg-rose-600 text-white hover:bg-rose-700 font-semibold"
              onClick={onRejectAll}
              disabled={isProcessing}
            >
              <XCircle className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.5} />
              Reject All
            </Button>
            <button
              onClick={onClear}
              className="ml-1 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-white/60" strokeWidth={2} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
