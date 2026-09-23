import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { campaignsApi } from "@/lib/api/campaigns";
import { campaignKeys } from "@/hooks/use-campaigns";

export const campaignTaskKeys = {
  all: ["campaign-task"] as const,
  document: (campaignId: string) =>
    [...campaignTaskKeys.all, "document", campaignId] as const,
};

/* -------------------------------------------------------------------------- */
/*              Shared task-brief attachment helpers (wizard +                */
/*              audition tab) — must match backend TASK_DOCUMENT_MIME_TYPES   */
/* -------------------------------------------------------------------------- */

export const TASK_DOCUMENT_ACCEPT =
  ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.csv,.rtf,.odt,.odp,.ods,.jpg,.jpeg,.png,.webp";

const TASK_DOCUMENT_EXTENSIONS = new Set([
  "pdf",
  "doc",
  "docx",
  "ppt",
  "pptx",
  "xls",
  "xlsx",
  "txt",
  "csv",
  "rtf",
  "odt",
  "odp",
  "ods",
  "jpg",
  "jpeg",
  "png",
  "webp",
]);

export const TASK_DOCUMENT_MAX_BYTES = 50 * 1024 * 1024;

export function isAllowedTaskDocument(file: File): boolean {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return TASK_DOCUMENT_EXTENSIONS.has(ext);
}

export function taskDocumentKindLabel(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf") return "PDF";
  if (ext === "doc" || ext === "docx") return "Word";
  if (ext === "ppt" || ext === "pptx" || ext === "odp") return "PowerPoint";
  if (ext === "xls" || ext === "xlsx" || ext === "ods" || ext === "csv")
    return "Spreadsheet";
  if (["jpg", "jpeg", "png", "webp"].includes(ext)) return "Image";
  if (ext === "txt" || ext === "rtf" || ext === "odt") return "Document";
  return ext ? ext.toUpperCase() : "File";
}

export function formatTaskFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  const mb = bytes / 1024 / 1024;
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
}

export function useTaskDocument(campaignId: string) {
  return useQuery({
    queryKey: campaignTaskKeys.document(campaignId),
    queryFn: () => campaignsApi.getTaskDocument(campaignId),
    enabled: !!campaignId,
  });
}

export function useUploadTaskDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      campaignId,
      file,
    }: {
      campaignId: string;
      file: File;
    }) => campaignsApi.uploadTaskDocument(campaignId, file),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: campaignTaskKeys.document(variables.campaignId),
      });
      // campaign.task.document is also served via the campaign detail query
      queryClient.invalidateQueries({
        queryKey: campaignKeys.detail(variables.campaignId),
      });
    },
  });
}

export function useDeleteTaskDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (campaignId: string) =>
      campaignsApi.deleteTaskDocument(campaignId),
    onSuccess: (_data, campaignId) => {
      queryClient.invalidateQueries({
        queryKey: campaignTaskKeys.document(campaignId),
      });
      queryClient.invalidateQueries({
        queryKey: campaignKeys.detail(campaignId),
      });
    },
  });
}

export function useUpsertTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      campaignId,
      payload,
    }: {
      campaignId: string;
      payload: Parameters<typeof campaignsApi.upsertTask>[1];
    }) => campaignsApi.upsertTask(campaignId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: campaignTaskKeys.document(variables.campaignId),
      });
    },
  });
}
