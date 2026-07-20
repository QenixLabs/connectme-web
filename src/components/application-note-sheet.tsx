"use client";

import { useState, useEffect } from "react";
import { Star, Trash2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { EnrichedApplication } from "./campaign-application-card";

interface ApplicationNoteSheetProps {
  open: boolean;
  onClose: () => void;
  application: EnrichedApplication | null;
  onSave: (noteText: string, rating: number) => void;
  onDelete?: () => void;
  isSaving?: boolean;
  isDeleting?: boolean;
}

export function ApplicationNoteSheet({
  open,
  onClose,
  application,
  onSave,
  onDelete,
  isSaving,
  isDeleting,
}: ApplicationNoteSheetProps) {
  const [noteText, setNoteText] = useState("");
  const [rating, setRating] = useState(0);

  const note = application?.note;
  const hasExistingNote = note && (note.note_text || (note.rating && note.rating > 0));

  useEffect(() => {
    if (open) {
      setNoteText(note?.note_text || "");
      setRating(note?.rating || 0);
    }
  }, [open, note]);

  const talent =
    application &&
    typeof application.talent_id === "object" &&
    application.talent_id !== null
      ? application.talent_id
      : null;
  const displayName = talent?.full_legal_name || talent?.email || "Unknown";

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-[400px] sm:w-[480px] flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-base font-serif">
            {hasExistingNote ? "Edit Note" : "Add Note"}
          </SheetTitle>
          <SheetDescription className="text-sm">
            {displayName}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 flex flex-col gap-5 mt-4">
          {/* Star rating */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Rating
            </label>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setRating(rating === i + 1 ? 0 : i + 1)}
                  className="p-0.5 transition-transform hover:scale-110"
                >
                  <Star
                    className={cn(
                      "w-6 h-6 transition-colors",
                      i < rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-300 hover:text-amber-300"
                    )}
                    strokeWidth={1.5}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm text-text-muted font-medium">
                  {rating}/5
                </span>
              )}
            </div>
          </div>

          {/* Note text */}
          <div className="flex-1 space-y-2">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Note
            </label>
            <Textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Write a note about this applicant..."
              rows={8}
              className="resize-none text-sm bg-card rounded-xl border-border placeholder:text-text-muted/50"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-border">
            {hasExistingNote && onDelete ? (
              <Button
                size="sm"
                variant="ghost"
                className="h-9 text-xs rounded-lg text-rose-600 hover:bg-rose-50 px-3"
                onClick={() => {
                  onDelete();
                  onClose();
                }}
                disabled={isDeleting}
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.5} />
                Delete
              </Button>
            ) : (
              <div />
            )}
            <Button
              size="sm"
              className="h-9 text-xs rounded-lg bg-ink text-white hover:bg-ink-soft px-5 font-medium"
              onClick={() => onSave(noteText, rating)}
              disabled={isSaving}
            >
              <Check className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.5} />
              {isSaving ? "Saving..." : "Save Note"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
