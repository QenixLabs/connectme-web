"use client";

import { useRef, useState } from "react";
import { FileText, Trash2, Upload, X } from "lucide-react";
import { EditorShell } from "./EditorShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { talentApi } from "@/lib/api/talent";
import { toast } from "sonner";
import type { Profile, DocumentItem } from "../profile-types";

interface EditorProps {
  profile: Profile;
  onBack: () => void;
  onUpdate: (patch: Partial<Profile>) => void;
}

type DocumentCategory = "Resume" | "Portfolio PDF" | "Measurements";

const CATEGORIES: { key: DocumentCategory; field: keyof DocumentItem; apiType: "resume" | "portfolio_pdf" | "measurements_sheet" }[] = [
  { key: "Resume", field: "resume_url", apiType: "resume" },
  { key: "Portfolio PDF", field: "portfolio_pdf_url", apiType: "portfolio_pdf" },
  { key: "Measurements", field: "measurements_sheet_url", apiType: "measurements_sheet" },
];

export function DocumentsEditor({ profile, onBack, onUpdate }: EditorProps) {
  const [uploading, setUploading] = useState<DocumentCategory | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [pendingCategory, setPendingCategory] = useState<DocumentCategory | null>(
    null,
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !pendingCategory) return;

    const category = pendingCategory;
    setUploading(category);
    try {
      const cat = CATEGORIES.find((c) => c.key === category)!;
      const data = await talentApi.uploadDocument(file, cat.apiType);
      onUpdate({
        documents: { ...profile.documents, [cat.field]: data.relativePath },
      });
      toast.success(`${category} uploaded`);
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(null);
      setPendingCategory(null);
      e.target.value = "";
    }
  };

  const clearDocument = (field: keyof DocumentItem) => {
    onUpdate({ documents: { ...profile.documents, [field]: "" } });
  };

  const startUpload = (category: DocumentCategory) => {
    setPendingCategory(category);
    inputRef.current?.click();
  };

  return (
    <EditorShell
      title="Documents"
      onBack={onBack}
      action={
        <Button variant="ghost" size="sm" className="font-semibold" disabled>
          Add
        </Button>
      }
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="space-y-3">
        {CATEGORIES.map(({ key, field }) => {
          const url = profile.documents[field];
          return (
            <Card key={key}>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <FileText className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{key}</p>
                    {url ? (
                      <p className="truncate text-xs text-muted-foreground">
                        {url.split("/").pop() || url}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        No file uploaded
                      </p>
                    )}
                  </div>
                  {url ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => clearDocument(field)}
                      aria-label={`Remove ${key}`}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  ) : null}
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => startUpload(key)}
                  disabled={uploading === key}
                >
                  {uploading === key ? (
                    <>Uploading... <span className="ml-2 animate-spin">↻</span></>
                  ) : (
                    <>
                      <Upload className="mr-2 size-4" />
                      {url ? "Replace" : "Upload"} {key}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="rounded-2xl border bg-muted/40 p-4">
        <p className="text-sm font-medium">Accepted formats</p>
        <p className="mt-1 text-xs text-muted-foreground">
          PDF, DOC or DOCX up to 10 MB. Measurement sheets help stylists prep
          ahead of a shoot.
        </p>
      </div>
    </EditorShell>
  );
}
