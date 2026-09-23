"use client";

import { UploadDialog } from "./upload-dialog";

export function AddVideoDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return <UploadDialog open={open} onOpenChange={onOpenChange} type="video" />;
}
