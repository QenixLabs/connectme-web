"use client";

import { useCallback, useRef, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, Upload, FileCheck, Loader2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { verificationApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/formatters";
import {
  documentSubmissionSchema,
  type DocumentSubmissionInput,
  type DocumentSlotInput,
  type DocumentType,
} from "@/lib/validations/verification-documents.schema";

interface DocumentSubmissionFormProps {
  verificationId?: string;
  verificationType: "talent_id" | "recruiter_company";
  docTypeOptions: DocumentType[];
  docTypeLabels: Record<string, string>;
  title: string;
  description: string;
  maxDocuments?: number;
  onSubmitted: () => void;
  onCancel?: () => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];

export function DocumentSubmissionForm({
  verificationId: initialVerificationId,
  verificationType,
  docTypeOptions,
  docTypeLabels,
  title,
  description,
  maxDocuments = 2,
  onSubmitted,
  onCancel,
}: DocumentSubmissionFormProps) {
  const [verificationId, setVerificationId] = useState<string | undefined>(
    initialVerificationId
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const fileInputRefs = useRef<Map<number, HTMLInputElement>>(new Map());

  const form = useForm<DocumentSubmissionInput>({
    resolver: zodResolver(documentSubmissionSchema),
    defaultValues: {
      documents: [{ docType: docTypeOptions[0], customType: "" }],
    },
    mode: "onSubmit",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "documents",
  });

  const documents = form.watch("documents");
  const addedCount = documents.length;

  const setFileInputRef = useCallback(
    (index: number) => (el: HTMLInputElement | null) => {
      if (el) {
        fileInputRefs.current.set(index, el);
      } else {
        fileInputRefs.current.delete(index);
      }
    },
    []
  );

  const handleFileSelect = useCallback(
    (index: number, file: File | undefined) => {
      if (!file) return;

      if (!ALLOWED_TYPES.includes(file.type)) {
        form.setError(`documents.${index}.file`, {
          type: "manual",
          message: "Only PDF, JPEG, PNG, and WEBP files are allowed",
        });
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        form.setError(`documents.${index}.file`, {
          type: "manual",
          message: "File size must be less than 5MB",
        });
        return;
      }

      form.clearErrors(`documents.${index}.file`);
      form.setValue(`documents.${index}.file`, file, {
        shouldValidate: false,
        shouldDirty: true,
      });
    },
    [form]
  );

  const handleAddSlot = useCallback(() => {
    if (fields.length >= maxDocuments) return;
    append({ docType: docTypeOptions[0], customType: "", file: undefined! } as DocumentSlotInput);
  }, [append, fields.length, maxDocuments, docTypeOptions]);

  const onSubmit = async (values: DocumentSubmissionInput) => {
    setSubmissionError(null);
    setIsSubmitting(true);

    try {
      let currentVerificationId = verificationId;

      if (!currentVerificationId) {
        const record = await verificationApi.createVerification(verificationType);
        currentVerificationId = record._id;
        setVerificationId(currentVerificationId);
      }

      for (const doc of values.documents) {
        if (!doc.file) continue;
        const docTypeLabel =
          doc.docType === "other"
            ? doc.customType!.trim()
            : docTypeLabels[doc.docType];

        await verificationApi.addVerificationDoc(
          currentVerificationId,
          doc.file,
          docTypeLabel
        );
      }

      onSubmitted();
    } catch (err) {
      setSubmissionError(
        getApiErrorMessage(err, "Failed to submit documents. Please try again.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>
        {submissionError && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{submissionError}</AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-muted-foreground">
            {addedCount} of {maxDocuments} added
          </span>
          {addedCount < maxDocuments && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddSlot}
              disabled={isSubmitting}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add another document
            </Button>
          )}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {fields.map((field, index) => {
              const docType = form.watch(`documents.${index}.docType`);
              const file = form.watch(`documents.${index}.file`);

              return (
                <div
                  key={field.id}
                  className="rounded-lg border p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Document {index + 1}
                    </span>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                        disabled={isSubmitting}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <FormField
                    control={form.control}
                    name={`documents.${index}.docType`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Document Type</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={isSubmitting}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select document type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {docTypeOptions.map((type) => (
                              <SelectItem key={type} value={type}>
                                {docTypeLabels[type]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {docType === "other" && (
                    <FormField
                      control={form.control}
                      name={`documents.${index}.customType`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Custom Document Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Passport, Voter ID"
                              {...field}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name={`documents.${index}.file`}
                    render={() => (
                      <FormItem>
                        <FormLabel>Upload File</FormLabel>
                        <FormControl>
                          <div>
                            <input
                              type="file"
                              ref={setFileInputRef(index)}
                              className="hidden"
                              accept=".pdf,.jpg,.jpeg,.png,.webp"
                              onChange={(e) =>
                                handleFileSelect(index, e.target.files?.[0])
                              }
                              disabled={isSubmitting}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() =>
                                fileInputRefs.current.get(index)?.click()
                              }
                              disabled={isSubmitting}
                              className="w-full justify-start"
                            >
                              {file instanceof File ? (
                                <>
                                  <FileCheck className="w-4 h-4 mr-2 text-success" />
                                  <span className="truncate">{file.name}</span>
                                </>
                              ) : (
                                <>
                                  <Upload className="w-4 h-4 mr-2" />
                                  Choose file
                                </>
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              );
            })}

            <div className="flex items-center gap-3 pt-2">
              <Button
                type="submit"
                disabled={isSubmitting || addedCount === 0}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Documents"
                )}
              </Button>
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
