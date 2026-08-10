import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { verificationApi } from "@/lib/api/verification";

export const verificationKeys = {
  all: ["verification"] as const,
  user: (userId: string) => [...verificationKeys.all, userId] as const,
};

export function useVerification(userId: string | undefined) {
  return useQuery({
    queryKey: verificationKeys.user(userId ?? ""),
    queryFn: () => verificationApi.getForUser(userId!),
    enabled: !!userId,
  });
}

export function useCreateVerification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (type: "talent_id" | "recruiter_company") =>
      verificationApi.create(type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: verificationKeys.all });
    },
  });
}

export function useUploadVerificationDoc() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      verificationId,
      file,
      docType,
    }: {
      verificationId: string;
      file: File;
      docType: string;
    }) => verificationApi.uploadDoc(verificationId, file, docType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: verificationKeys.all });
    },
  });
}

export function useRemoveVerificationDoc() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      verificationId,
      docIndex,
    }: {
      verificationId: string;
      docIndex: number;
    }) => verificationApi.removeDoc(verificationId, docIndex),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: verificationKeys.all });
    },
  });
}
