"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Briefcase,
  CheckCircle2,
  Eye,
  ImagePlus,
  Loader2,
  Pencil,
  Plus,
  Search,
  Send,
  Trash2,
  Undo2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { servicesApi } from "@/lib/api/marketplace";
import type {
  IndicativePrice,
  ServiceListing,
  ServiceListingPayload,
  ServiceStatus,
} from "@/lib/api/marketplace";
import { getApiErrorMessage } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TagInput } from "@/components/ui/tag-input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 12;

type StatusFilter = "all" | ServiceStatus;

interface ImageItem {
  path: string;
  url: string;
}

interface ServiceForm {
  title: string;
  description: string;
  category: string;
  service_areas: string[];
  amount: string;
  currency: string;
  unit: NonNullable<IndicativePrice["unit"]>;
  price_note: string;
  images: ImageItem[];
}

const EMPTY_FORM: ServiceForm = {
  title: "",
  description: "",
  category: "",
  service_areas: [],
  amount: "",
  currency: "INR",
  unit: "project",
  price_note: "",
  images: [],
};

function toForm(service: ServiceListing): ServiceForm {
  return {
    title: service.title,
    description: service.description,
    category: service.category,
    service_areas: service.service_areas ?? [],
    amount:
      service.indicative_price?.amount !== undefined
        ? String(service.indicative_price.amount)
        : "",
    currency: service.indicative_price?.currency ?? "INR",
    unit: service.indicative_price?.unit ?? "project",
    price_note: service.indicative_price?.note ?? "",
    images: (service.images ?? []).map((path, index) => ({
      path,
      url: service.image_urls?.[index] ?? path,
    })),
  };
}

export default function ProviderServicesPage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceListing | null>(null);
  const [form, setForm] = useState<ServiceForm>(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [banner, setBanner] = useState("");

  const filters = useMemo(
    () => ({ status, search: search.trim(), page, limit: PAGE_SIZE }),
    [status, search, page],
  );
  const servicesQuery = useQuery({
    queryKey: queryKeys.services.mine(filters),
    queryFn: () => servicesApi.getMine(filters),
  });

  const services = servicesQuery.data?.data ?? [];
  const total = servicesQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFieldErrors({});
    setFormError("");
    setDialogOpen(true);
  }

  function openEdit(service: ServiceListing) {
    setEditing(service);
    setForm(toForm(service));
    setFieldErrors({});
    setFormError("");
    setDialogOpen(true);
  }

  function validate(): boolean {
    const errors: Record<string, string> = {};
    if (form.title.trim().length < 3) {
      errors.title = "Title must be at least 3 characters";
    }
    if (form.description.trim().length < 20) {
      errors.description = "Description must be at least 20 characters";
    }
    if (!form.category.trim()) {
      errors.category = "Category is required";
    }
    if (form.amount && Number.isNaN(Number(form.amount))) {
      errors.amount = "Enter a valid amount";
    }
    if (form.amount && Number(form.amount) < 0) {
      errors.amount = "Amount cannot be negative";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setFormError("");
    if (!validate()) return;

    const payload: ServiceListingPayload = {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category.trim(),
      service_areas: form.service_areas,
      images: form.images.map((image) => image.path),
      indicative_price: form.amount
        ? {
            amount: Number(form.amount),
            currency: form.currency.trim().toUpperCase() || "INR",
            unit: form.unit,
            note: form.price_note.trim() || undefined,
          }
        : undefined,
    };

    setSaving(true);
    try {
      if (editing) {
        await servicesApi.update(editing.id, payload);
        setBanner("Service updated.");
        toast.success("Service updated");
      } else {
        await servicesApi.create(payload);
        setBanner("Service created as a draft. Publish it when you are ready.");
        toast.success("Service created");
      }
      setDialogOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["services", "mine"] });
    } catch (err) {
      setFormError(getApiErrorMessage(err, "Could not save service"));
    } finally {
      setSaving(false);
    }
  }

  async function handleUpload(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const uploaded = await servicesApi.uploadImage(file);
      setForm((current) => ({
        ...current,
        images: [...current.images, { path: uploaded.relativePath, url: uploaded.signedUrl }],
      }));
    } catch (err) {
      setFormError(getApiErrorMessage(err, "Could not upload image"));
    } finally {
      setUploading(false);
    }
  }

  const publishMutation = useMutation({
    mutationFn: (id: string) => servicesApi.publish(id),
    onSuccess: async () => {
      setBanner("Service published and now visible in the marketplace.");
      toast.success("Service published");
      await queryClient.invalidateQueries({ queryKey: ["services", "mine"] });
    },
    onError: (err) => {
      setBanner(getApiErrorMessage(err, "Could not publish service"));
      toast.error(getApiErrorMessage(err, "Could not publish service"));
    },
  });

  const unpublishMutation = useMutation({
    mutationFn: (id: string) => servicesApi.unpublish(id),
    onSuccess: async () => {
      setBanner("Service unpublished and hidden from the marketplace.");
      toast.success("Service unpublished");
      await queryClient.invalidateQueries({ queryKey: ["services", "mine"] });
    },
    onError: (err) => {
      setBanner(getApiErrorMessage(err, "Could not unpublish service"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => servicesApi.remove(id),
    onSuccess: async () => {
      setBanner("Service deleted.");
      toast.success("Service deleted");
      await queryClient.invalidateQueries({ queryKey: ["services", "mine"] });
    },
    onError: (err) => {
      setBanner(getApiErrorMessage(err, "Could not delete service"));
    },
  });

  function handleDelete(service: ServiceListing) {
    if (
      typeof window !== "undefined" &&
      !window.confirm(`Delete "${service.title}"? This cannot be undone.`)
    ) {
      return;
    }
    setActionId(service.id);
    deleteMutation.mutate(service.id, { onSettled: () => setActionId(null) });
  }

  function runAction(service: ServiceListing, action: "publish" | "unpublish") {
    setActionId(service.id);
    const mutation = action === "publish" ? publishMutation : unpublishMutation;
    mutation.mutate(service.id, { onSettled: () => setActionId(null) });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Service catalogue</p>
          <h1 className="text-3xl font-bold tracking-tight">Your services</h1>
          <p className="mt-1 text-muted-foreground">
            Create, publish, and manage the services clients can discover.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 size-4" />
          New service
        </Button>
      </div>

      {banner && (
        <Alert
          className={cn(
            banner.toLowerCase().includes("could not") || banner.toLowerCase().includes("before publishing")
              ? "border-amber-300 bg-amber-50 text-amber-900"
              : "border-emerald-300 bg-emerald-50 text-emerald-900",
          )}
        >
          {banner.toLowerCase().includes("could not") ? (
            <AlertCircle className="size-4" />
          ) : (
            <CheckCircle2 className="size-4" />
          )}
          <AlertTitle>{banner.toLowerCase().includes("could not") ? "Action failed" : "Saved"}</AlertTitle>
          <AlertDescription>{banner}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-3 rounded-xl border bg-background p-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search your services"
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {(["all", "draft", "published", "unpublished"] as StatusFilter[]).map((value) => (
            <Button
              key={value}
              type="button"
              size="sm"
              variant={status === value ? "default" : "outline"}
              onClick={() => {
                setStatus(value);
                setPage(1);
              }}
              className="capitalize"
            >
              {value}
            </Button>
          ))}
        </div>
      </div>

      {servicesQuery.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-44" />
          <Skeleton className="h-44" />
          <Skeleton className="h-44" />
          <Skeleton className="h-44" />
        </div>
      ) : servicesQuery.isError ? (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Could not load services</AlertTitle>
          <AlertDescription>
            {getApiErrorMessage(servicesQuery.error, "Please try again.")}
          </AlertDescription>
        </Alert>
      ) : services.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center p-10 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Briefcase className="size-6" />
            </span>
            <h2 className="mt-4 text-xl font-semibold">
              {search || status !== "all" ? "No matching services" : "No services yet"}
            </h2>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              {search || status !== "all"
                ? "Try a different search or status filter."
                : "Create your first listing, add clear pricing, then publish it to the marketplace."}
            </p>
            {search || status !== "all" ? (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearch("");
                  setStatus("all");
                }}
              >
                Clear filters
              </Button>
            ) : (
              <Button className="mt-4" onClick={openCreate}>
                <Plus className="mr-2 size-4" />
                Create a service
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {services.map((service) => (
            <Card key={service.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex gap-4 p-4">
                  <div className="h-24 w-28 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {service.image_urls?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={service.image_urls[0]}
                        alt={service.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <ImagePlus className="size-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="line-clamp-2 font-semibold">{service.title}</h3>
                      <StatusBadge status={service.status} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{service.category}</p>
                    <p className="mt-1 text-sm font-medium">
                      {service.indicative_price
                        ? `${service.indicative_price.currency ?? "INR"} ${service.indicative_price.amount.toLocaleString()} / ${service.indicative_price.unit ?? "project"}`
                        : "Price on request"}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 border-t bg-muted/30 px-4 py-3">
                  <Button size="sm" variant="outline" onClick={() => openEdit(service)}>
                    <Pencil className="mr-2 size-4" />
                    Edit
                  </Button>
                  {service.status === "published" ? (
                    <>
                      <Button size="sm" variant="outline" asChild>
                        <a href={`/services/${service.id}`} target="_blank" rel="noreferrer">
                          <Eye className="mr-2 size-4" />
                          View
                        </a>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => runAction(service, "unpublish")}
                        disabled={actionId === service.id}
                      >
                        {actionId === service.id ? (
                          <Loader2 className="mr-2 size-4 animate-spin" />
                        ) : (
                          <Undo2 className="mr-2 size-4" />
                        )}
                        Unpublish
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => runAction(service, "publish")}
                      disabled={actionId === service.id}
                    >
                      {actionId === service.id ? (
                        <Loader2 className="mr-2 size-4 animate-spin" />
                      ) : (
                        <Send className="mr-2 size-4" />
                      )}
                      Publish
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="ml-auto text-destructive hover:text-destructive"
                    onClick={() => handleDelete(service)}
                    disabled={actionId === service.id}
                  >
                    <Trash2 className="size-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages} · {total} services
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit service" : "New service"}</DialogTitle>
            <DialogDescription>
              {editing
                ? "Update the details clients see on your public listing."
                : "Draft a service now. You can publish it when onboarding is complete."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            {formError && (
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="service-title">Title *</Label>
              <Input
                id="service-title"
                value={form.title}
                maxLength={140}
                aria-invalid={Boolean(fieldErrors.title)}
                onChange={(event) =>
                  setForm((current) => ({ ...current, title: event.target.value }))
                }
                placeholder="Brand identity package"
              />
              {fieldErrors.title && (
                <p className="text-xs text-destructive">{fieldErrors.title}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="service-description">Description *</Label>
              <Textarea
                id="service-description"
                value={form.description}
                rows={5}
                maxLength={5000}
                aria-invalid={Boolean(fieldErrors.description)}
                onChange={(event) =>
                  setForm((current) => ({ ...current, description: event.target.value }))
                }
                placeholder="What is included, who it is for, and what clients receive."
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{fieldErrors.description ?? "Minimum 20 characters"}</span>
                <span>{form.description.length}/5000</span>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="service-category">Category *</Label>
                <Input
                  id="service-category"
                  value={form.category}
                  maxLength={80}
                  aria-invalid={Boolean(fieldErrors.category)}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, category: event.target.value }))
                  }
                  placeholder="Design"
                />
                {fieldErrors.category && (
                  <p className="text-xs text-destructive">{fieldErrors.category}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Service areas</Label>
                <TagInput
                  value={form.service_areas}
                  onChange={(service_areas) =>
                    setForm((current) => ({ ...current, service_areas }))
                  }
                  placeholder="Mumbai, Remote"
                  maxTags={30}
                />
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <p className="mb-3 text-sm font-medium">Indicative price (optional)</p>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="service-amount">Amount</Label>
                  <Input
                    id="service-amount"
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.amount}
                    aria-invalid={Boolean(fieldErrors.amount)}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, amount: event.target.value }))
                    }
                    placeholder="25000"
                  />
                  {fieldErrors.amount && (
                    <p className="text-xs text-destructive">{fieldErrors.amount}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label>Currency</Label>
                  <Input
                    value={form.currency}
                    maxLength={3}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, currency: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Unit</Label>
                  <Select
                    value={form.unit}
                    onValueChange={(unit) =>
                      setForm((current) => ({
                        ...current,
                        unit: unit as ServiceForm["unit"],
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hour">Per hour</SelectItem>
                      <SelectItem value="day">Per day</SelectItem>
                      <SelectItem value="project">Per project</SelectItem>
                      <SelectItem value="session">Per session</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-3 space-y-1.5">
                <Label htmlFor="price-note">Pricing note</Label>
                <Input
                  id="price-note"
                  value={form.price_note}
                  maxLength={120}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, price_note: event.target.value }))
                  }
                  placeholder="Starting price; final quote after brief"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Images</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById("service-image-input")?.click()}
                  disabled={uploading || form.images.length >= 10}
                >
                  {uploading ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : (
                    <ImagePlus className="mr-2 size-4" />
                  )}
                  Upload
                </Button>
                <input
                  id="service-image-input"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(event) => {
                    void handleUpload(event.target.files?.[0]);
                    event.target.value = "";
                  }}
                />
              </div>
              {form.images.length === 0 ? (
                <div className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
                  Add up to 10 images. The first image is used on cards.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {form.images.map((image, index) => (
                    <div
                      key={`${image.path}-${index}`}
                      className="group relative h-20 w-24 overflow-hidden rounded-md border"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image.url}
                        alt={`Service image ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        aria-label="Remove image"
                        onClick={() =>
                          setForm((current) => ({
                            ...current,
                            images: current.images.filter((_, i) => i !== index),
                          }))
                        }
                        className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
                {editing ? "Save changes" : "Create draft"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatusBadge({ status }: { status: ServiceStatus }) {
  if (status === "published") {
    return <Badge className="bg-emerald-600 hover:bg-emerald-600">Published</Badge>;
  }
  if (status === "unpublished") {
    return <Badge variant="secondary">Unpublished</Badge>;
  }
  return <Badge variant="outline">Draft</Badge>;
}
