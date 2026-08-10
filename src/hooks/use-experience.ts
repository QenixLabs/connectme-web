import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { talentApi, type Credit, type Testimonial, type Award } from "@/lib/api/talent";

// ── Query Key Factory ──────────────────────────────────────
export const experienceKeys = {
  all: ["experience"] as const,
  credits: () => [...experienceKeys.all, "credits"] as const,
  testimonials: () => [...experienceKeys.all, "testimonials"] as const,
  awards: () => [...experienceKeys.all, "awards"] as const,
};

// ── Query Hooks ────────────────────────────────────────────
export function useMyCredits() {
  return useQuery({
    queryKey: experienceKeys.credits(),
    queryFn: () => talentApi.getMyCredits(),
  });
}

export function useMyTestimonials() {
  return useQuery({
    queryKey: experienceKeys.testimonials(),
    queryFn: () => talentApi.getMyTestimonials(),
  });
}

export function useMyAwards() {
  return useQuery({
    queryKey: experienceKeys.awards(),
    queryFn: () => talentApi.getMyAwards(),
  });
}

// ── Credit Mutations ───────────────────────────────────────
export function useCreateCredit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof talentApi.createCredit>[0]) =>
      talentApi.createCredit(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: experienceKeys.credits() }),
  });
}

export function useUpdateCredit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof talentApi.updateCredit>[1] }) =>
      talentApi.updateCredit(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: experienceKeys.credits() }),
  });
}

export function useDeleteCredit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => talentApi.deleteCredit(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: experienceKeys.credits() }),
  });
}

// ── Testimonial Mutations ──────────────────────────────────
export function useCreateTestimonial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof talentApi.createTestimonial>[0]) =>
      talentApi.createTestimonial(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: experienceKeys.testimonials() }),
  });
}

export function useUpdateTestimonial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof talentApi.updateTestimonial>[1] }) =>
      talentApi.updateTestimonial(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: experienceKeys.testimonials() }),
  });
}

export function useDeleteTestimonial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => talentApi.deleteTestimonial(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: experienceKeys.testimonials() }),
  });
}

export function useApproveTestimonial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => talentApi.approveTestimonial(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: experienceKeys.testimonials() }),
  });
}

// ── Award Mutations ────────────────────────────────────────
export function useCreateAward() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof talentApi.createAward>[0]) =>
      talentApi.createAward(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: experienceKeys.awards() }),
  });
}

export function useUpdateAward() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof talentApi.updateAward>[1] }) =>
      talentApi.updateAward(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: experienceKeys.awards() }),
  });
}

export function useDeleteAward() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => talentApi.deleteAward(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: experienceKeys.awards() }),
  });
}
