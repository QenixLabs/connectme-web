"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Pencil,
  Trash2,
  Check,
  Trophy,
  Star,
  Award,
  Film,
  Quote,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { talentApi } from "@/lib/api";
import { usePopup } from "@/hooks/use-popup";
import { getApiErrorMessage } from "@/lib/formatters";
import type { Credit, Testimonial, Award as AwardType } from "@/lib/validations/credit-testimonial.schema";
import { CreditFormDialog } from "@/components/talent/experience/credit-form-dialog";
import { TestimonialFormDialog } from "@/components/talent/experience/testimonial-form-dialog";
import { AwardFormDialog } from "@/components/talent/experience/award-form-dialog";

type TabId = "credits" | "testimonials" | "awards";

function getInitials(name?: string): string {
  if (!name) return "?";
  return name.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function ExperiencePage() {
  const router = useRouter();
  const popup = usePopup();

  const [tab, setTab] = useState<TabId>("credits");
  const [credits, setCredits] = useState<Credit[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [awards, setAwards] = useState<AwardType[]>([]);
  const [loading, setLoading] = useState(true);

  const [creditDialogOpen, setCreditDialogOpen] = useState(false);
  const [testimonialDialogOpen, setTestimonialDialogOpen] = useState(false);
  const [awardDialogOpen, setAwardDialogOpen] = useState(false);
  const [editingCredit, setEditingCredit] = useState<Credit | null>(null);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [editingAward, setEditingAward] = useState<AwardType | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<{ type: TabId; id: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isApproving, setIsApproving] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [cRes, tRes, aRes] = await Promise.all([
        talentApi.listMyCredits({ limit: 100 }),
        talentApi.listMyTestimonials({ limit: 100 }),
        talentApi.listMyAwards({ limit: 100 }),
      ]);
      setCredits((cRes.data as unknown as Credit[]) || []);
      setTestimonials((tRes.data as unknown as Testimonial[]) || []);
      setAwards((aRes.data as unknown as AwardType[]) || []);
    } catch {
      /* failed silently */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      if (deleteTarget.type === "credits") await talentApi.deleteCredit(deleteTarget.id);
      else if (deleteTarget.type === "testimonials") await talentApi.deleteTestimonial(deleteTarget.id);
      else await talentApi.deleteAward(deleteTarget.id);
      popup.show({ title: "Deleted", variant: "success" });
      setDeleteTarget(null);
      loadData();
    } catch (err) {
      popup.show({ title: "Failed to delete", description: getApiErrorMessage(err), variant: "error" });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleApprove = async (id: string) => {
    setIsApproving(id);
    try {
      await talentApi.approveTestimonial(id);
      popup.show({ title: "Testimonial approved", variant: "success" });
      loadData();
    } catch (err) {
      popup.show({ title: "Failed to approve", description: getApiErrorMessage(err), variant: "error" });
    } finally {
      setIsApproving(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    );
  }

  const tabs: { id: TabId; label: string; count: number }[] = [
    { id: "credits", label: "Credits", count: credits.length },
    { id: "testimonials", label: "Testimonials", count: testimonials.length },
    { id: "awards", label: "Awards", count: awards.length },
  ];

  return (
    <div className="space-y-4 p-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border bg-card">
          <ArrowLeft className="h-4 w-4 text-muted-foreground" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-foreground">Experience & Recognition</h1>
          <p className="text-xs text-muted-foreground">Manage your credits, testimonials, and awards</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl bg-muted p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 rounded-lg px-3 py-2 text-center text-sm font-medium transition ${
              tab === t.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber/15 text-xs font-semibold text-amber">
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Credits Tab */}
      {tab === "credits" && (
        <div className="space-y-3">
          <Button
            size="sm"
            className="w-full rounded-xl"
            onClick={() => {
              setEditingCredit(null);
              setCreditDialogOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Credit
          </Button>

          {credits.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center gap-3 py-12">
                <Film className="h-10 w-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No credits added yet</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingCredit(null);
                    setCreditDialogOpen(true);
                  }}
                >
                  Add your first credit
                </Button>
              </CardContent>
            </Card>
          ) : (
            credits.map((c) => (
              <Card key={c._id} className="border-border shadow-card">
                <CardContent className="flex items-start gap-4 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber/15">
                    <Film className="h-5 w-5 text-amber" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">
                          {c.project_name}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {c.role_played}
                          {c.platform && <> &middot; {c.platform}</>}
                          {c.year && <> &middot; {c.year}</>}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingCredit(c);
                            setCreditDialogOpen(true);
                          }}
                          className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget({ type: "credits", id: c._id })}
                          className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    {c.director && (
                      <p className="mt-1 text-xs text-muted-foreground">Director: {c.director}</p>
                    )}
                    {c.credit_url && (
                      <a
                        href={c.credit_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-block text-xs text-amber hover:underline"
                      >
                        View reference →
                      </a>
                    )}
                    {c.verification_status && (
                      <Badge variant="outline" className="mt-2 text-[10px]">
                        {c.verification_status.replace(/_/g, " ")}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Testimonials Tab */}
      {tab === "testimonials" && (
        <div className="space-y-3">
          <Button
            size="sm"
            className="w-full rounded-xl"
            onClick={() => {
              setEditingTestimonial(null);
              setTestimonialDialogOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Testimonial
          </Button>

          {testimonials.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center gap-3 py-12">
                <Quote className="h-10 w-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No testimonials added yet</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingTestimonial(null);
                    setTestimonialDialogOpen(true);
                  }}
                >
                  Add your first testimonial
                </Button>
              </CardContent>
            </Card>
          ) : (
            testimonials.map((t) => (
              <Card key={t._id} className="border-border shadow-card">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                      {getInitials(t.author_name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-semibold text-foreground">{t.author_name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {t.author_role}
                            {t.author_company && <> at {t.author_company}</>}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          {!t.is_approved_by_talent && (
                            <button
                              onClick={() => handleApprove(t._id)}
                              disabled={isApproving === t._id}
                              className="grid h-8 w-8 place-items-center rounded-lg text-green-500 transition hover:bg-green-50"
                              title="Approve testimonial"
                            >
                              {isApproving === t._id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Check className="h-4 w-4" />
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setEditingTestimonial(t);
                              setTestimonialDialogOpen(true);
                            }}
                            className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget({ type: "testimonials", id: t._id })}
                            className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-red-50 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      {t.rating && (
                        <div className="mt-1 flex gap-0.5">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${i < t.rating! ? "fill-amber text-amber" : "text-muted-foreground/30"}`}
                            />
                          ))}
                        </div>
                      )}
                      {t.content && (
                        <p className="mt-2 text-sm text-foreground/90">&ldquo;{t.content}&rdquo;</p>
                      )}
                      <div className="mt-2 flex items-center gap-2">
                        {t.is_approved_by_talent ? (
                          <Badge
                            variant="outline"
                            className="border-green-400/40 bg-green-50 text-[10px] text-green-600"
                          >
                            Approved
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px]">
                            Pending Approval
                          </Badge>
                        )}
                        {t.created_at && (
                          <span className="text-[10px] text-muted-foreground">{formatDate(t.created_at)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Awards Tab */}
      {tab === "awards" && (
        <div className="space-y-3">
          <Button
            size="sm"
            className="w-full rounded-xl"
            onClick={() => {
              setEditingAward(null);
              setAwardDialogOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Award
          </Button>

          {awards.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center gap-3 py-12">
                <Trophy className="h-10 w-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No awards added yet</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingAward(null);
                    setAwardDialogOpen(true);
                  }}
                >
                  Add your first award
                </Button>
              </CardContent>
            </Card>
          ) : (
            awards.map((a) => (
              <Card key={a._id} className="border-border shadow-card">
                <CardContent className="flex items-start gap-4 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber/15">
                    <Award className="h-5 w-5 text-amber" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">{a.title}</h3>
                        <p className="text-xs text-muted-foreground">
                          {a.awarding_body}
                          {a.year && <> &middot; {a.year}</>}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingAward(a);
                            setAwardDialogOpen(true);
                          }}
                          className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget({ type: "awards", id: a._id })}
                          className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    {a.description && (
                      <p className="mt-1 text-xs text-muted-foreground">{a.description}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Delete Confirm Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteTarget?.type.slice(0, -1)}</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this{" "}
              {deleteTarget?.type === "credits"
                ? "credit"
                : deleteTarget?.type === "testimonials"
                  ? "testimonial"
                  : "award"}
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-red-500 hover:bg-red-600">
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Form Dialogs */}
      <CreditFormDialog
        open={creditDialogOpen}
        onOpenChange={(v) => {
          setCreditDialogOpen(v);
          if (!v) setEditingCredit(null);
        }}
        onSaved={loadData}
        edit={editingCredit}
      />
      <TestimonialFormDialog
        open={testimonialDialogOpen}
        onOpenChange={(v) => {
          setTestimonialDialogOpen(v);
          if (!v) setEditingTestimonial(null);
        }}
        onSaved={loadData}
        edit={editingTestimonial}
      />
      <AwardFormDialog
        open={awardDialogOpen}
        onOpenChange={(v) => {
          setAwardDialogOpen(v);
          if (!v) setEditingAward(null);
        }}
        onSaved={loadData}
        edit={editingAward}
      />
    </div>
  );
}
