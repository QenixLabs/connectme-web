"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CalendarCheck2,
  CalendarClock,
  CalendarDays,
  CalendarRange,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ExternalLink,
  GripVertical,
  ImagePlus,
  IndianRupee,
  Info,
  Layers,
  Loader2,
  MapPin,
  Package,
  PenLine,
  Pencil,
  Plus,
  Rocket,
  Save,
  Settings2,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  UploadCloud,
  Users,
  UsersRound,
  Wallet,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { providersApi, servicesApi } from "@/lib/api/marketplace";
import type {
  IndicativePrice,
  ServiceDeliveryTime,
  ServiceEquipment,
  ServiceListing,
  ServiceListingPayload,
  ServiceTeamSize,
  ServiceType,
} from "@/lib/api/marketplace";
import { getApiErrorMessage } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { SERVICE_CATALOG, SERVICE_CATEGORIES } from "@/lib/service-catalog";
import { formatAmount } from "@/components/marketplace/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TagInput } from "@/components/ui/tag-input";
import { CropImageModal } from "@/components/ui/crop-image-modal";
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

const MAX_IMAGES = 10;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ACCEPTED_IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];

const STEPS = [
  {
    label: "Basic Details",
    shortLabel: "Basics",
    heading: "Let's introduce your service",
    subtitle:
      "Tell customers what you offer and what makes your service valuable.",
  },
  {
    label: "Media & Details",
    shortLabel: "Media",
    heading: "Show customers what you can do",
    subtitle: "Add your work and explain how you deliver your service.",
  },
  {
    label: "Pricing & Publish",
    shortLabel: "Pricing",
    heading: "Set your service pricing",
    subtitle:
      "Share an indicative price if you have one. You can also discuss pricing directly with customers.",
  },
] as const;

const STEP_FIELDS: string[][] = [
  ["title", "category", "subcategory", "short_description", "description"],
  ["images", "service_areas", "delivery_time", "team_size", "equipment"],
  ["amount"],
];

const FIELD_IDS: Record<string, string> = {
  title: "service-title",
  category: "service-category",
  subcategory: "service-subcategory",
  short_description: "service-short-description",
  description: "service-description",
  images: "service-image-dropzone",
  service_areas: "service-areas",
  delivery_time: "delivery-time-options",
  team_size: "team-size-options",
  equipment: "equipment-options",
  amount: "service-amount",
};

const SERVICE_TYPES: {
  value: ServiceType;
  label: string;
  detail: string;
  icon: LucideIcon;
}[] = [
  {
    value: "one_time",
    label: "One-time service",
    detail: "A single project or booking",
    icon: CalendarCheck2,
  },
  {
    value: "package",
    label: "Service package",
    detail: "A fixed bundle with clear deliverables",
    icon: Package,
  },
  {
    value: "custom",
    label: "Custom service",
    detail: "A tailored quote for every customer",
    icon: Sparkles,
  },
];

const DELIVERY_OPTIONS: {
  value: ServiceDeliveryTime;
  label: string;
  detail: string;
  icon: LucideIcon;
}[] = [
  { value: "1-3_days", label: "1–3 days", detail: "Fast turnaround", icon: Zap },
  { value: "5-10_days", label: "5–10 days", detail: "About one week", icon: Clock3 },
  { value: "2-4_weeks", label: "2–4 weeks", detail: "Multi-week project", icon: CalendarDays },
  {
    value: "1_month_or_more",
    label: "1 month or more",
    detail: "Long-term engagement",
    icon: CalendarRange,
  },
  {
    value: "custom",
    label: "Custom",
    detail: "Agreed with the customer",
    icon: Settings2,
  },
];

const TEAM_OPTIONS: {
  value: ServiceTeamSize;
  label: string;
  detail: string;
  icon: LucideIcon;
}[] = [
  { value: "1-10", label: "1–10", detail: "Solo or small crew", icon: Users },
  { value: "11-50", label: "11–50", detail: "Growing team", icon: UsersRound },
  { value: "51+", label: "51+", detail: "Large production team", icon: Layers },
];

const EQUIPMENT_OPTIONS: {
  value: ServiceEquipment;
  label: string;
  detail: string;
  icon: LucideIcon;
}[] = [
  {
    value: "provider",
    label: "Provided by me",
    detail: "You bring the tools and crew",
    icon: Wrench,
  },
  {
    value: "client",
    label: "Provided by customer",
    detail: "The customer supplies equipment",
    icon: Package,
  },
  {
    value: "both",
    label: "Both",
    detail: "Shared between you and the customer",
    icon: Layers,
  },
];

const UNIT_OPTIONS: {
  value: NonNullable<IndicativePrice["unit"]>;
  label: string;
  icon: LucideIcon;
}[] = [
  { value: "hour", label: "Hour", icon: Clock3 },
  { value: "day", label: "Day", icon: CalendarDays },
  { value: "project", label: "Project", icon: CalendarCheck2 },
  { value: "session", label: "Session", icon: CalendarClock },
  { value: "custom", label: "Custom", icon: Settings2 },
];

interface ImageItem {
  path: string;
  url: string;
}

interface UploadTask {
  id: string;
  fileName: string;
  progress: number;
  error?: string;
}

interface PendingImageCrop {
  file: File;
  task: UploadTask;
}

interface ServiceForm {
  title: string;
  short_description: string;
  description: string;
  category: string;
  subcategory: string;
  service_type: ServiceType;
  service_areas: string[];
  delivery_time: ServiceDeliveryTime | "";
  team_size: ServiceTeamSize | "";
  equipment: ServiceEquipment | "";
  amount: string;
  currency: string;
  unit: NonNullable<IndicativePrice["unit"]>;
  price_note: string;
  images: ImageItem[];
}

const EMPTY_FORM: ServiceForm = {
  title: "",
  short_description: "",
  description: "",
  category: "",
  subcategory: "",
  service_type: "one_time",
  service_areas: [],
  delivery_time: "",
  team_size: "",
  equipment: "",
  amount: "",
  currency: "INR",
  unit: "project",
  price_note: "",
  images: [],
};

const inputClass =
  "h-11 rounded-xl border-input bg-card text-sm shadow-none focus-visible:border-violet-500 focus-visible:ring-violet-500/20";
const textareaClass =
  "rounded-xl border-input bg-card text-sm leading-6 shadow-none focus-visible:border-violet-500 focus-visible:ring-violet-500/20";
const primaryButtonClass =
  "h-11 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-5 text-white shadow-sm hover:from-violet-700 hover:to-purple-700 focus-visible:ring-violet-500/40";
const outlineButtonClass =
  "h-11 rounded-xl border-border bg-card text-foreground hover:border-violet-300 hover:bg-violet-50 hover:text-violet-800";

function isSupportedCategory(value: string): boolean {
  return SERVICE_CATEGORIES.some((category) => category === value);
}

function isSupportedSubcategory(category: string, value: string): boolean {
  return (SERVICE_CATALOG[category as keyof typeof SERVICE_CATALOG] ?? []).some(
    (subcategory) => subcategory === value,
  );
}

function serviceToForm(service: ServiceListing): ServiceForm {
  return {
    title: service.title,
    short_description: service.short_description ?? "",
    description: service.description,
    category: service.category,
    subcategory: service.subcategory ?? "",
    service_type: service.service_type ?? "one_time",
    service_areas: service.service_areas ?? [],
    delivery_time: service.delivery_time ?? "",
    team_size: service.team_size ?? "",
    equipment: service.equipment ?? "",
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

function arraysEqual(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function unitLabel(unit: NonNullable<IndicativePrice["unit"]>): string {
  return UNIT_OPTIONS.find((option) => option.value === unit)?.label.toLowerCase() ?? unit;
}

function pricePreview(form: ServiceForm): { main: string; sub: string } {
  if (form.service_type === "custom") {
    return {
      main: "Contact for Pricing",
      sub: "Customers will request a quote for their requirements.",
    };
  }

  const amount = Number(form.amount);
  if (!form.amount.trim() || !Number.isFinite(amount)) {
    return {
      main: "Add your price",
      sub: "Shown as an indicative starting price.",
    };
  }

  return {
    main: formatAmount(amount, form.currency.trim().toUpperCase() || "INR"),
    sub: `/ ${unitLabel(form.unit)}`,
  };
}

function buildPayload(form: ServiceForm): ServiceListingPayload {
  const amount = Number(form.amount);
  const hasAmount = form.amount.trim() !== "" && Number.isFinite(amount);

  return {
    title: form.title.trim(),
    description: form.description.trim(),
    short_description: form.short_description.trim() || undefined,
    category: form.category,
    subcategory: form.subcategory.trim() || undefined,
    service_type: form.service_type,
    images: form.images.map((image) => image.path),
    service_areas: form.service_areas,
    delivery_time: form.delivery_time || undefined,
    team_size: form.team_size || undefined,
    equipment: form.equipment || undefined,
    indicative_price:
      form.service_type === "custom" || !hasAmount
        ? null
        : {
            amount,
            currency: form.currency.trim().toUpperCase() || "INR",
            unit: form.unit,
            note: form.price_note.trim() || undefined,
          },
  };
}

export function ServiceEditor({ serviceId }: { serviceId?: string }) {
  const serviceQuery = useQuery({
    queryKey: queryKeys.services.mineDetail(serviceId ?? ""),
    queryFn: () => servicesApi.getMineById(serviceId ?? ""),
    enabled: Boolean(serviceId),
  });

  if (serviceId && serviceQuery.isLoading) {
    return (
      <div className="mx-auto max-w-3xl py-20 text-center text-sm text-muted-foreground">
        <Loader2 className="mx-auto mb-3 size-6 animate-spin text-violet-600" />
        Loading service…
      </div>
    );
  }

  if (serviceId && serviceQuery.isError) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">
        <p>{getApiErrorMessage(serviceQuery.error, "Could not load service.")}</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/provider/listings">Back to My Listings</Link>
        </Button>
      </div>
    );
  }

  return (
    <ServiceEditorForm
      key={serviceId ?? "new-service"}
      serviceId={serviceId}
      initialService={serviceQuery.data?.service}
    />
  );
}

function ServiceEditorForm({
  serviceId,
  initialService,
}: {
  serviceId?: string;
  initialService?: ServiceListing;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [form, setForm] = useState<ServiceForm>(() =>
    initialService ? serviceToForm(initialService) : EMPTY_FORM,
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [step, setStep] = useState(0);
  const [maxStepReached, setMaxStepReached] = useState(0);
  const [savedServiceId, setSavedServiceId] = useState(serviceId);
  const [pendingAction, setPendingAction] = useState<"draft" | "publish" | null>(
    null,
  );
  const [uploads, setUploads] = useState<UploadTask[]>([]);
  const [uploadError, setUploadError] = useState("");
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);
  const [draggedImage, setDraggedImage] = useState<number | null>(null);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [areasInherited, setAreasInherited] = useState(false);
  const [confirmPublishOpen, setConfirmPublishOpen] = useState(false);

  const busyRef = useRef(false);
  const initializedAreasRef = useRef(false);
  const inFlightUploadsRef = useRef(0);
  const uploadSequenceRef = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cropQueueRef = useRef<PendingImageCrop[]>([]);
  const cropImageSrcRef = useRef<string | null>(null);

  useEffect(
    () => () => {
      if (cropImageSrcRef.current) URL.revokeObjectURL(cropImageSrcRef.current);
    },
    [],
  );

  const profileQuery = useQuery({
    queryKey: queryKeys.provider.me(),
    queryFn: providersApi.getMyProfile,
    retry: false,
    staleTime: 60_000,
  });
  const profile = profileQuery.data?.profile;
  const onboardingComplete = Boolean(profile?.onboarding_completed);
  const profileUnavailable = profileQuery.isError;
  const publishBlocked = !profileQuery.isLoading && (!profile || !onboardingComplete);

  const isEditing = Boolean(serviceId || savedServiceId);
  const isAlreadyPublished = initialService?.status === "published";
  const isPaused = initialService?.status === "unpublished";
  const saveLabel = isAlreadyPublished || isPaused ? "Save changes" : "Save as draft";
  const saving = pendingAction !== null;
  const uploading = uploads.some((task) => !task.error && task.progress < 100);

  const canUseProfileAreas = Boolean(profile?.service_areas?.length);
  const profileAreas = profile?.service_areas ?? [];
  const currentProfileAreasMatch =
    canUseProfileAreas && arraysEqual(form.service_areas, profileAreas);
  const price = pricePreview(form);

  useEffect(() => {
    if (serviceId || initializedAreasRef.current || !profile) return;
    initializedAreasRef.current = true;
    if (profile.service_areas?.length && form.service_areas.length === 0) {
      // Profile data arrives asynchronously, so inheriting the areas requires
      // seeding the editable form once it becomes available.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm((current) => ({
        ...current,
        service_areas: [...profile.service_areas],
      }));
      setAreasInherited(true);
    }
  }, [profile, serviceId, form.service_areas.length]);

  function updateForm(patch: Partial<ServiceForm>) {
    setForm((current) => ({ ...current, ...patch }));
    setFieldErrors((current) => {
      const next = { ...current };
      for (const key of Object.keys(patch)) delete next[key];
      return next;
    });
  }

  function getValidationErrors(mode: "draft" | "publish") {
    const errors: Record<string, string> = {};

    if (form.title.trim().length < 3) {
      errors.title = "Enter a service title with at least 3 characters.";
    }
    if (!isSupportedCategory(form.category)) {
      errors.category = "Choose a category from the marketplace list.";
    }
    if (form.description.trim().length < 20) {
      errors.description = "Add at least 20 characters describing your service.";
    }
    if (form.service_type !== "custom" && form.amount.trim()) {
      const amount = Number(form.amount);
      if (!Number.isFinite(amount) || amount < 0 || amount > 100000000) {
        errors.amount = "Enter a valid indicative price between 0 and 100,000,000.";
      }
    }

    if (mode === "draft") return errors;

    if (!form.subcategory.trim()) {
      errors.subcategory = "Add a subcategory to help customers find you.";
    } else if (!isSupportedSubcategory(form.category, form.subcategory)) {
      errors.subcategory = "Choose a subcategory from the selected category.";
    }
    if (!form.short_description.trim()) {
      errors.short_description = "Add a short description for service cards.";
    }
    if (form.images.length === 0) {
      errors.images = "Add at least one image before publishing.";
    }
    if (form.service_areas.length === 0) {
      errors.service_areas = "Add at least one service area.";
    }
    if (!form.delivery_time) {
      errors.delivery_time = "Choose how long delivery usually takes.";
    }
    return errors;
  }

  function errorsForStep(errors: Record<string, string>, index: number) {
    return Object.fromEntries(
      Object.entries(errors).filter(([key]) => STEP_FIELDS[index].includes(key)),
    );
  }

  function stepForError(errors: Record<string, string>): number {
    for (let index = 0; index < STEP_FIELDS.length; index += 1) {
      if (Object.keys(errorsForStep(errors, index)).length > 0) return index;
    }
    return step;
  }

  function focusFirstError(errors: Record<string, string>) {
    const first = [
      "title",
      "category",
      "subcategory",
      "short_description",
      "description",
      "images",
      "service_areas",
      "delivery_time",
      "team_size",
      "equipment",
      "amount",
    ].find((key) => errors[key]);

    if (!first) return;
    const element = document.getElementById(FIELD_IDS[first]);
    if (!element) return;
    element.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => {
      if (element instanceof HTMLElement) element.focus({ preventScroll: true });
    }, 250);
  }

  function validateForSave(mode: "draft" | "publish"): boolean {
    const errors = getValidationErrors(mode);
    setFieldErrors(errors);
    if (Object.keys(errors).length === 0) return true;

    const targetStep = stepForError(errors);
    setFormError(
      mode === "publish"
        ? "Complete the highlighted fields before publishing."
        : "Add a title, category, and at least 20 characters of description to save a draft.",
    );
    if (targetStep !== step) {
      setStep(targetStep);
      setMaxStepReached((current) => Math.max(current, targetStep));
    }
    window.setTimeout(() => focusFirstError(errors), 50);
    return false;
  }

  function goToNextStep() {
    setFormError("");
    const errors = getValidationErrors("publish");
    setFieldErrors(errors);
    const currentErrors = errorsForStep(errors, step);

    if (Object.keys(currentErrors).length > 0) {
      window.setTimeout(() => focusFirstError(errors), 50);
      return;
    }

    const next = Math.min(step + 1, STEPS.length - 1);
    setStep(next);
    setMaxStepReached((current) => Math.max(current, next));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goToStep(index: number) {
    if (index > maxStepReached) return;
    setStep(index);
    setFormError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goBack() {
    if (step === 0) {
      router.push("/provider/listings");
      return;
    }
    setStep((current) => Math.max(0, current - 1));
    setFormError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function requestPublish() {
    if (uploading) {
      setFormError("Wait for your images to finish uploading before publishing.");
      return;
    }
    setFormError("");
    const errors = getValidationErrors("publish");
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      const targetStep = stepForError(errors);
      setStep(targetStep);
      setMaxStepReached((current) => Math.max(current, targetStep));
      window.setTimeout(() => focusFirstError(errors), 50);
      return;
    }
    setConfirmPublishOpen(true);
  }

  function handlePrimaryAction() {
    if (isAlreadyPublished) {
      void handleSave(false);
      return;
    }
    requestPublish();
  }

  async function handleSave(publish: boolean) {
    if (busyRef.current) return;
    if (uploading) {
      setFormError("Wait for your images to finish uploading before saving.");
      return;
    }
    if (!validateForSave(publish ? "publish" : "draft")) return;

    busyRef.current = true;
    setPendingAction(publish ? "publish" : "draft");
    setFormError("");

    const payload = buildPayload(form);
    let currentId = savedServiceId;

    try {
      const result = currentId
        ? await servicesApi.update(currentId, payload)
        : await servicesApi.create(payload);

      currentId = result.service.id;
      setSavedServiceId(currentId);

      if (publish && result.service.status !== "published") {
        try {
          await servicesApi.publish(currentId);
        } catch (error) {
          setFormError(
            `Your service was saved as a draft, but publishing failed: ${getApiErrorMessage(
              error,
              "Please try again from My Services.",
            )} Your work and uploaded images are safe.`,
          );
          await queryClient.invalidateQueries({ queryKey: ["services"] });
          return;
        }
      }

      toast.success(
        publish
          ? isAlreadyPublished
            ? "Service changes saved"
            : "Service published"
          : isEditing
            ? "Service saved"
            : "Draft saved",
      );
      await queryClient.invalidateQueries({ queryKey: ["services"] });
      router.push("/provider/listings");
    } catch (error) {
      setFormError(
        getApiErrorMessage(
          error,
          publish ? "Could not publish service." : "Could not save service.",
        ),
      );
    } finally {
      busyRef.current = false;
      setPendingAction(null);
    }
  }

  function setImages(updater: (images: ImageItem[]) => ImageItem[]) {
    setForm((current) => ({ ...current, images: updater(current.images) }));
    setFieldErrors((current) => ({ ...current, images: "" }));
  }

  function setCoverImage(index: number) {
    if (index <= 0) return;
    setImages((images) => {
      const next = [...images];
      const [selected] = next.splice(index, 1);
      return [selected, ...next];
    });
  }

  function moveImage(index: number, offset: number) {
    const target = index + offset;
    setImages((images) => {
      if (target < 0 || target >= images.length) return images;
      const next = [...images];
      const [moved] = next.splice(index, 1);
      next.splice(target, 0, moved);
      return next;
    });
  }

  function removeImage(index: number) {
    setImages((images) => images.filter((_, imageIndex) => imageIndex !== index));
  }

  function handleImageDrop(event: React.DragEvent<HTMLDivElement>, target: number) {
    const source = Number(event.dataTransfer.getData("text/plain"));
    if (!Number.isInteger(source) || source === target) return;
    event.preventDefault();
    event.stopPropagation();
    setImages((images) => {
      if (source < 0 || source >= images.length) return images;
      const next = [...images];
      const [moved] = next.splice(source, 1);
      next.splice(target, 0, moved);
      return next;
    });
    setDraggedImage(null);
  }

  function showNextCrop() {
    if (cropImageSrcRef.current) return;

    const next = cropQueueRef.current[0];
    if (!next) {
      setCropImageSrc(null);
      setCropModalOpen(false);
      return;
    }

    if (cropImageSrcRef.current) URL.revokeObjectURL(cropImageSrcRef.current);
    const imageSrc = URL.createObjectURL(next.file);
    cropImageSrcRef.current = imageSrc;
    setCropImageSrc(imageSrc);
    setCropModalOpen(true);
  }

  async function uploadCroppedImage(file: File, task: UploadTask) {
    const patchTask = (patch: Partial<UploadTask>) => {
      setUploads((current) =>
        current.map((item) =>
          item.id === task.id ? { ...item, ...patch } : item,
        ),
      );
    };

    try {
      const uploaded = await servicesApi.uploadImage(file, (progress) =>
        patchTask({ progress }),
      );
      setForm((current) => {
        if (current.images.length >= MAX_IMAGES) return current;
        return {
          ...current,
          images: [
            ...current.images,
            { path: uploaded.relativePath, url: uploaded.signedUrl },
          ],
        };
      });
      setFieldErrors((current) => ({ ...current, images: "" }));
      setUploads((current) => current.filter((item) => item.id !== task.id));
    } catch (error) {
      patchTask({
        progress: 0,
        error: getApiErrorMessage(error, "Upload failed. Please try again."),
      });
    } finally {
      inFlightUploadsRef.current = Math.max(0, inFlightUploadsRef.current - 1);
      showNextCrop();
    }
  }

  function handleImageCropped(file: File) {
    const pending = cropQueueRef.current.shift();
    if (!pending) return;

    if (cropImageSrcRef.current) URL.revokeObjectURL(cropImageSrcRef.current);
    cropImageSrcRef.current = null;
    setCropImageSrc(null);
    setCropModalOpen(false);
    void uploadCroppedImage(file, pending.task);
  }

  function handleCropModalChange(open: boolean) {
    if (open) {
      setCropModalOpen(true);
      return;
    }

    if (!cropImageSrcRef.current) {
      setCropModalOpen(false);
      return;
    }

    const cancelled = cropQueueRef.current.shift();
    URL.revokeObjectURL(cropImageSrcRef.current);
    cropImageSrcRef.current = null;
    setCropImageSrc(null);
    if (cancelled) {
      inFlightUploadsRef.current = Math.max(0, inFlightUploadsRef.current - 1);
      setUploads((current) =>
        current.filter((item) => item.id !== cancelled.task.id),
      );
    }
    showNextCrop();
  }

  async function handleFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList);
    if (files.length === 0) return;

    setUploadError("");
    const available =
      MAX_IMAGES - form.images.length - inFlightUploadsRef.current;

    if (available <= 0) {
      setUploadError("You have reached the 10-image limit.");
      return;
    }

    const accepted: File[] = [];
    const problems: string[] = [];

    for (const file of files) {
      if (accepted.length >= available) {
        problems.push(`Only ${available} more image${available === 1 ? "" : "s"} can be added.`);
        break;
      }
      const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
      const validType =
        ACCEPTED_IMAGE_TYPES.includes(file.type) ||
        ACCEPTED_IMAGE_EXTENSIONS.includes(extension);
      if (!validType) {
        problems.push(`${file.name} is not a JPEG, PNG, or WebP image.`);
        continue;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        problems.push(`${file.name} is larger than 5 MB.`);
        continue;
      }
      accepted.push(file);
    }

    if (problems.length > 0) setUploadError(problems.slice(0, 3).join(" "));
    if (accepted.length === 0) return;

    const pendingCrops: PendingImageCrop[] = accepted.map((file) => {
      uploadSequenceRef.current += 1;
      const task = {
        id: `upload-${Date.now()}-${uploadSequenceRef.current}`,
        fileName: file.name,
        progress: 0,
      };
      return { file, task };
    });

    inFlightUploadsRef.current += accepted.length;
    setUploads((current) => [
      ...current,
      ...pendingCrops.map(({ task }) => task),
    ]);
    cropQueueRef.current.push(...pendingCrops);
    if (!cropImageSrcRef.current) showNextCrop();
  }

  function handleFileInput(files: FileList | null) {
    if (files?.length) void handleFiles(files);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleGalleryDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDraggingFiles(false);
    if (event.dataTransfer.files.length > 0) {
      void handleFiles(event.dataTransfer.files);
    }
  }

  function clearUploadError(taskId: string) {
    setUploads((current) => current.filter((task) => task.id !== taskId));
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5 pb-32 text-foreground sm:space-y-6 md:pb-0">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <nav
            aria-label="Breadcrumb"
            className="mb-3 flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground"
          >
            <Link href="/provider/dashboard" className="hover:text-violet-700">
              Dashboard
            </Link>
            <span>/</span>
            <Link href="/provider/listings" className="hover:text-violet-700">
              My Listings
            </Link>
            <span>/</span>
            <span className="text-violet-700">
              {isEditing ? "Edit Service" : "Add New Service"}
            </span>
          </nav>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            {isEditing ? "Edit your service" : "Create a new service"}
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
            Build a clear, trustworthy listing. You can save a draft at any time
            and publish when you are ready.
          </p>
        </div>
        <div className="hidden shrink-0 items-center gap-2 md:flex">
          <Button asChild variant="outline" className={outlineButtonClass}>
            <Link href="/provider/listings">Cancel</Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            className={outlineButtonClass}
            disabled={saving || uploading}
            onClick={() => void handleSave(false)}
          >
            {pendingAction === "draft" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            {saveLabel}
          </Button>
        </div>
      </header>

      <ServiceProgress
        step={step}
        maxStepReached={maxStepReached}
        onStepClick={goToStep}
      />

      <div className="rounded-2xl border border-border bg-card p-5 shadow-[0_18px_50px_-40px_rgba(76,29,149,0.5)] sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
          Step {step + 1} of {STEPS.length}
        </p>
        <h2 className="mt-1 text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
          {STEPS[step].heading}
        </h2>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
          {STEPS[step].subtitle}
        </p>
      </div>

      {formError && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 sm:flex-row sm:items-start"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <div className="min-w-0 flex-1">
            <p>{formError}</p>
            {(formError.toLowerCase().includes("onboarding") ||
              formError.toLowerCase().includes("provider profile")) && (
              <Link
                href="/provider/onboarding"
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-red-900 underline underline-offset-4"
              >
                Complete provider onboarding
                <ExternalLink className="size-3" />
              </Link>
            )}
          </div>
        </div>
      )}

      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (step < STEPS.length - 1) goToNextStep();
        }}
        className="space-y-5"
      >
        {step === 0 && (
          <StepBasics
            form={form}
            fieldErrors={fieldErrors}
            updateForm={updateForm}
          />
        )}

        {step === 1 && (
          <StepMedia
            form={form}
            fieldErrors={fieldErrors}
            uploads={uploads}
            uploadError={uploadError}
            uploading={uploading}
            isDraggingFiles={isDraggingFiles}
            draggedImage={draggedImage}
            fileInputRef={fileInputRef}
            profileAreas={profileAreas}
            canUseProfileAreas={canUseProfileAreas}
            currentProfileAreasMatch={currentProfileAreasMatch}
            areasInherited={areasInherited}
            setAreasInherited={setAreasInherited}
            updateForm={updateForm}
            handleFileInput={handleFileInput}
            handleGalleryDrop={handleGalleryDrop}
            setIsDraggingFiles={setIsDraggingFiles}
            handleImageDrop={handleImageDrop}
            setCoverImage={setCoverImage}
            moveImage={moveImage}
            removeImage={removeImage}
            setDraggedImage={setDraggedImage}
            clearUploadError={clearUploadError}
          />
        )}

        {step === 2 && (
          <StepPricing
            form={form}
            fieldErrors={fieldErrors}
            updateForm={updateForm}
            price={price}
            profileQuery={profileQuery}
            publishBlocked={publishBlocked}
            profileUnavailable={profileUnavailable}
            isAlreadyPublished={Boolean(isAlreadyPublished)}
            isPaused={isPaused}
            saving={saving}
            uploading={uploading}
            onEditStep={goToStep}
            onSaveDraft={() => void handleSave(false)}
            onPublish={handlePrimaryAction}
          />
        )}

        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 px-3 py-3 shadow-[0_-12px_30px_-24px_rgba(30,27,75,0.5)] backdrop-blur-xl md:static md:mt-6 md:flex md:rounded-2xl md:border md:px-4 md:shadow-sm">
          <div className="mx-auto flex max-w-5xl items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={goBack}
              disabled={saving}
              className={cn(outlineButtonClass, "px-3 sm:px-4")}
            >
              <ArrowLeft className="size-4" />
              <span className="hidden sm:inline">
                {step === 0 ? "Cancel" : "Back"}
              </span>
            </Button>

            <div className="ml-auto flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                disabled={saving || uploading}
                onClick={() => void handleSave(false)}
                aria-label={saveLabel}
                className="h-11 rounded-xl px-3 text-sm text-violet-700 hover:bg-violet-50 hover:text-violet-800"
              >
                {pendingAction === "draft" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                <span className="hidden sm:inline">{saveLabel}</span>
              </Button>

              {step < STEPS.length - 1 ? (
                <Button
                  type="button"
                  onClick={goToNextStep}
                  disabled={saving}
                  className={primaryButtonClass}
                >
                  Continue
                  <ArrowRight className="size-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handlePrimaryAction}
                  disabled={saving || uploading}
                  className={primaryButtonClass}
                >
                  {pendingAction === "publish" ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : isAlreadyPublished ? (
                    <Save className="size-4" />
                  ) : (
                    <Rocket className="size-4" />
                  )}
                  {isAlreadyPublished ? "Save changes" : "Publish service"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </form>

      {cropImageSrc && (
        <CropImageModal
          key={cropImageSrc}
          open={cropModalOpen}
          onOpenChange={handleCropModalChange}
          imageSrc={cropImageSrc}
          onCropped={handleImageCropped}
          aspect={4 / 3}
          title="Crop service image"
          description="Drag the image and adjust the zoom to choose how it appears in your service gallery."
        />
      )}

      <Dialog open={confirmPublishOpen} onOpenChange={setConfirmPublishOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {publishBlocked
                ? "Complete onboarding to publish"
                : isPaused
                  ? "Publish this service again?"
                  : "Publish this service?"}
            </DialogTitle>
            <DialogDescription>
              {publishBlocked
                ? "Publishing requires a completed provider profile. Complete onboarding, then return to publish your service."
                : "Your service will become visible in the public marketplace. You can pause it again at any time from My Services."}
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-xl border border-violet-100 bg-violet-50/60 p-4">
            <p className="text-sm font-semibold text-violet-950">
              {form.title || "Untitled service"}
            </p>
            <p className="mt-1 text-xs text-violet-800/75">
              {form.category || "No category"}
              {form.subcategory ? ` · ${form.subcategory}` : ""}
            </p>
            <p className="mt-2 text-sm font-bold text-violet-950">
              {price.main}
              {price.main !== "Contact for Pricing" && (
                <span className="ml-1 text-xs font-normal text-violet-800/75">
                  {price.sub}
                </span>
              )}
            </p>
          </div>

          {publishBlocked && (
            <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>
                {profileUnavailable
                  ? "We could not find your provider profile. Activate provider access and complete onboarding first."
                  : "Your provider onboarding is not complete yet."}
              </span>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmPublishOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            {publishBlocked ? (
              <Button asChild className={primaryButtonClass}>
                <Link href="/provider/onboarding">
                  Complete onboarding
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            ) : (
              <Button
                type="button"
                className={primaryButtonClass}
                disabled={saving}
                onClick={() => {
                  setConfirmPublishOpen(false);
                  void handleSave(true);
                }}
              >
                {saving ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Rocket className="size-4" />
                )}
                {isPaused ? "Publish again" : "Publish service"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ServiceProgress({
  step,
  maxStepReached,
  onStepClick,
}: {
  step: number;
  maxStepReached: number;
  onStepClick: (index: number) => void;
}) {
  return (
    <nav
      aria-label="Service creation progress"
      className="rounded-2xl border border-border bg-card p-2 shadow-sm sm:p-3"
    >
      <ol className="grid grid-cols-3 gap-1">
        {STEPS.map((item, index) => {
          const isCurrent = index === step;
          const isComplete = index < step;
          const isAvailable = index <= maxStepReached;

          return (
            <li key={item.label}>
              <button
                type="button"
                disabled={!isAvailable}
                onClick={() => onStepClick(index)}
                aria-current={isCurrent ? "step" : undefined}
                className={cn(
                  "flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left transition sm:px-3 sm:py-2.5",
                  isCurrent && "bg-violet-50 ring-1 ring-violet-200",
                  !isCurrent && isAvailable && "hover:bg-violet-50/60",
                  !isAvailable && "cursor-not-allowed opacity-60",
                )}
              >
                <span
                  className={cn(
                    "grid size-7 shrink-0 place-items-center rounded-full border text-xs font-bold sm:size-8",
                    isCurrent || isComplete
                      ? "border-violet-600 bg-violet-600 text-white"
                      : "border-border bg-muted text-muted-foreground",
                  )}
                >
                  {isComplete ? <Check className="size-4" strokeWidth={3} /> : index + 1}
                </span>
                <span className="min-w-0">
                  <span
                    className={cn(
                      "block truncate text-[10px] font-semibold leading-4 sm:text-xs",
                      isCurrent || isComplete ? "text-violet-800" : "text-muted-foreground",
                    )}
                  >
                    <span className="sm:hidden">{item.shortLabel}</span>
                    <span className="hidden sm:inline">{item.label}</span>
                  </span>
                  <span className="hidden text-[10px] text-muted-foreground sm:block">
                    {isComplete
                      ? "Completed"
                      : isCurrent
                        ? "In progress"
                        : "Up next"}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function StepBasics({
  form,
  fieldErrors,
  updateForm,
}: {
  form: ServiceForm;
  fieldErrors: Record<string, string>;
  updateForm: (patch: Partial<ServiceForm>) => void;
}) {
  return (
    <>
      <SectionCard
        icon={Sparkles}
        title="Service identity"
        description="Give customers a clear name and place your service in the right category."
      >
        <div className="space-y-5">
          <Field
            label="Service title"
            htmlFor="service-title"
            required
            hint="Use a specific name customers would search for."
            error={fieldErrors.title}
            counter={`${form.title.length}/140`}
          >
            <Input
              id="service-title"
              value={form.title}
              maxLength={140}
              aria-invalid={Boolean(fieldErrors.title)}
              onChange={(event) => updateForm({ title: event.target.value })}
              placeholder="e.g. Wedding film production and editing"
              className={inputClass}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Main category"
              htmlFor="service-category"
              required
              error={fieldErrors.category}
            >
              <Select
                value={form.category || "unselected"}
                onValueChange={(category) =>
                  updateForm({
                    category: category === "unselected" ? "" : category,
                    subcategory: "",
                  })
                }
              >
                <SelectTrigger
                  id="service-category"
                  aria-invalid={Boolean(fieldErrors.category)}
                  className={cn(inputClass, "w-full")}
                >
                  <SelectValue placeholder="Choose a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unselected">Choose a category</SelectItem>
                  {SERVICE_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field
              label="Subcategory"
              htmlFor="service-subcategory"
              required
              hint="A focused niche helps the right customers find you."
              error={fieldErrors.subcategory}
              counter={`${form.subcategory.length}/80`}
            >
              <Select
                value={form.subcategory || "unselected"}
                onValueChange={(subcategory) =>
                  updateForm({ subcategory: subcategory === "unselected" ? "" : subcategory })
                }
              >
                <SelectTrigger
                  id="service-subcategory"
                  aria-invalid={Boolean(fieldErrors.subcategory)}
                  className={cn(inputClass, "w-full")}
                >
                  <SelectValue placeholder={form.category ? "Choose a subcategory" : "Choose a category first"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unselected">Choose a subcategory</SelectItem>
                  {(SERVICE_CATALOG[form.category as keyof typeof SERVICE_CATALOG] ?? []).map((subcategory) => (
                    <SelectItem key={subcategory} value={subcategory}>{subcategory}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <fieldset className="space-y-3">
            <legend className="text-sm font-semibold text-foreground">
              Service type <RequiredMark />
            </legend>
            <p className="-mt-1 text-xs text-muted-foreground">
              This helps us present your pricing in the right context.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {SERVICE_TYPES.map((option) => (
                <OptionCard
                  key={option.value}
                  selected={form.service_type === option.value}
                  onClick={() => updateForm({ service_type: option.value })}
                  icon={option.icon}
                  label={option.label}
                  description={option.detail}
                />
              ))}
            </div>
          </fieldset>
        </div>
      </SectionCard>

      <SectionCard
        icon={PenLine}
        title="Service description"
        description="Explain the value clearly. Short, specific copy performs better than a long sales pitch."
      >
        <div className="space-y-5">
          <Field
            label="Short description"
            htmlFor="service-short-description"
            required
            hint="This appears on service cards and search results."
            error={fieldErrors.short_description}
            counter={`${form.short_description.length}/150`}
          >
            <Textarea
              id="service-short-description"
              value={form.short_description}
              rows={3}
              maxLength={150}
              aria-invalid={Boolean(fieldErrors.short_description)}
              onChange={(event) =>
                updateForm({ short_description: event.target.value })
              }
              placeholder="e.g. Cinematic wedding films that capture the emotion of your day, from prep to reception."
              className={textareaClass}
            />
          </Field>

          <Field
            label="Full description"
            htmlFor="service-description"
            required
            hint="Mention what is included, your process, and who the service is for."
            error={fieldErrors.description}
            counter={`${form.description.length}/5000`}
          >
            <Textarea
              id="service-description"
              value={form.description}
              rows={8}
              maxLength={5000}
              aria-invalid={Boolean(fieldErrors.description)}
              onChange={(event) => updateForm({ description: event.target.value })}
              placeholder="Describe the experience you deliver, what is included, how you work with customers, and what they receive at the end."
              className={cn(textareaClass, "min-h-40")}
            />
          </Field>

          <div className="flex items-start gap-2 rounded-xl border border-violet-100 bg-violet-50/60 p-3 text-xs leading-5 text-violet-900/80">
            <Info className="mt-0.5 size-4 shrink-0 text-violet-600" />
            <p>
              A strong description covers the deliverables, the process, and the
              result. You can refine the wording after saving a draft.
            </p>
          </div>
        </div>
      </SectionCard>
    </>
  );
}

function StepMedia({
  form,
  fieldErrors,
  uploads,
  uploadError,
  uploading,
  isDraggingFiles,
  draggedImage,
  fileInputRef,
  profileAreas,
  canUseProfileAreas,
  currentProfileAreasMatch,
  areasInherited,
  setAreasInherited,
  updateForm,
  handleFileInput,
  handleGalleryDrop,
  setIsDraggingFiles,
  handleImageDrop,
  setCoverImage,
  moveImage,
  removeImage,
  setDraggedImage,
  clearUploadError,
}: {
  form: ServiceForm;
  fieldErrors: Record<string, string>;
  uploads: UploadTask[];
  uploadError: string;
  uploading: boolean;
  isDraggingFiles: boolean;
  draggedImage: number | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  profileAreas: string[];
  canUseProfileAreas: boolean;
  currentProfileAreasMatch: boolean;
  areasInherited: boolean;
  setAreasInherited: (value: boolean) => void;
  updateForm: (patch: Partial<ServiceForm>) => void;
  handleFileInput: (files: FileList | null) => void;
  handleGalleryDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  setIsDraggingFiles: (value: boolean) => void;
  handleImageDrop: (event: React.DragEvent<HTMLDivElement>, index: number) => void;
  setCoverImage: (index: number) => void;
  moveImage: (index: number, offset: number) => void;
  removeImage: (index: number) => void;
  setDraggedImage: (value: number | null) => void;
  clearUploadError: (taskId: string) => void;
}) {
  const imageCount = form.images.length;

  return (
    <>
      <SectionCard
        icon={ImagePlus}
        title="Service image gallery"
        description="Add real examples of your work and crop each image to choose how it appears. The cover image is the first thing customers see."
        action={
          <span className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
            {imageCount}/{MAX_IMAGES} images
          </span>
        }
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(event) => handleFileInput(event.target.files)}
        />

        <div
          id="service-image-dropzone"
          tabIndex={-1}
          onDragOver={(event) => {
            if (event.dataTransfer.types.includes("Files")) {
              event.preventDefault();
              setIsDraggingFiles(true);
            }
          }}
          onDragLeave={() => setIsDraggingFiles(false)}
          onDrop={handleGalleryDrop}
          className={cn(
            "rounded-2xl outline-none transition",
            isDraggingFiles && "ring-2 ring-violet-400 ring-offset-2",
          )}
        >
          {imageCount === 0 ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "flex min-h-52 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed px-5 py-8 text-center transition",
                isDraggingFiles
                  ? "border-violet-500 bg-violet-50"
                  : "border-violet-200 bg-gradient-to-br from-violet-50/70 via-card to-card hover:border-violet-400 hover:bg-violet-50/60",
              )}
            >
              <span className="grid size-14 place-items-center rounded-2xl bg-violet-600 text-white shadow-sm">
                {uploading ? (
                  <Loader2 className="size-6 animate-spin" />
                ) : (
                  <UploadCloud className="size-6" />
                )}
              </span>
              <span className="mt-4 text-sm font-bold text-foreground sm:text-base">
                Drag and drop your work here
              </span>
              <span className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
                JPEG, PNG, or WebP · up to 5 MB each · up to 10 images. Listings
                with real portfolio images get more customer inquiries.
              </span>
              <span className="mt-4 inline-flex h-9 items-center rounded-xl bg-white px-4 text-sm font-semibold text-violet-700 shadow-sm ring-1 ring-violet-200">
                <Plus className="mr-1.5 size-4" />
                Choose images
              </span>
            </button>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
                <div className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={form.images[0].url}
                    alt={`Cover image for ${form.title || "service"}`}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
                    <Star className="size-3 fill-amber-300 text-amber-300" />
                    Cover image
                  </span>
                  <button
                    type="button"
                    aria-label="Remove cover image"
                    onClick={() => removeImage(0)}
                    className="absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-white/95 text-red-600 shadow-sm transition hover:bg-white"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:grid-cols-2">
                  {form.images.slice(1).map((image, index) => {
                    const actualIndex = index + 1;
                    return (
                      <ImageThumbnail
                        key={`${image.path}-${actualIndex}`}
                        image={image}
                        index={actualIndex}
                        total={imageCount}
                        isDragged={draggedImage === actualIndex}
                        onDrop={handleImageDrop}
                        onSetCover={setCoverImage}
                        onMove={moveImage}
                        onRemove={removeImage}
                        onDragStart={setDraggedImage}
                        onDragEnd={() => setDraggedImage(null)}
                      />
                    );
                  })}

                  {imageCount < MAX_IMAGES && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex aspect-square min-h-20 flex-col items-center justify-center rounded-xl border-2 border-dashed border-violet-200 bg-violet-50/50 p-2 text-center text-violet-700 transition hover:border-violet-400 hover:bg-violet-50"
                    >
                      {uploading ? (
                        <Loader2 className="size-5 animate-spin" />
                      ) : (
                        <Plus className="size-5" />
                      )}
                      <span className="mt-1 text-[10px] font-semibold">Add</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">
                  Drag thumbnails to reorder. The first image is always the cover.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploading || imageCount >= MAX_IMAGES}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(outlineButtonClass, "h-9 px-3 text-xs")}
                >
                  <Plus className="size-4" />
                  Add more images
                </Button>
              </div>
            </div>
          )}
        </div>

        {uploads.length > 0 && (
          <div className="mt-3 space-y-2">
            {uploads.map((task) => (
              <div
                key={task.id}
                className={cn(
                  "rounded-xl border px-3 py-2",
                  task.error
                    ? "border-red-200 bg-red-50"
                    : "border-violet-100 bg-violet-50/50",
                )}
              >
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="min-w-0 flex-1 truncate font-medium text-foreground">
                    {task.fileName}
                  </span>
                  {task.error ? (
                    <button
                      type="button"
                      onClick={() => clearUploadError(task.id)}
                      className="shrink-0 text-red-700 hover:text-red-900"
                      aria-label={`Dismiss upload error for ${task.fileName}`}
                    >
                      <X className="size-4" />
                    </button>
                  ) : (
                    <span className="shrink-0 font-semibold text-violet-700">
                      {task.progress}%
                    </span>
                  )}
                </div>
                {task.error ? (
                  <p className="mt-1 text-xs text-red-700">{task.error}</p>
                ) : (
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-violet-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-600 transition-all"
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {(uploadError || fieldErrors.images) && (
          <p className="mt-2 text-xs text-red-600" role="alert">
            {fieldErrors.images || uploadError}
          </p>
        )}

        <div className="mt-4 grid gap-2 rounded-xl border border-border bg-muted/40 p-3 text-xs leading-5 text-muted-foreground sm:grid-cols-3 sm:gap-3">
          <span className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-violet-600" />
            Use bright, high-quality images of real work.
          </span>
          <span className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-violet-600" />
            Show different angles and finished results.
          </span>
          <span className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-violet-600" />
            Keep the cover image focused and uncluttered.
          </span>
        </div>
      </SectionCard>

      <SectionCard
        icon={MapPin}
        title="Service areas"
        description="Tell customers where you can deliver this service. Add up to 30 cities or regions."
        action={
          areasInherited ? (
            <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[11px] font-semibold text-sky-700">
              Inherited from profile
            </span>
          ) : currentProfileAreasMatch ? (
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700">
              Matches profile
            </span>
          ) : null
        }
      >
        <div id="service-areas" tabIndex={-1} className="space-y-3 outline-none">
          <TagInput
            value={form.service_areas}
            onChange={(service_areas) => {
              updateForm({ service_areas });
              setAreasInherited(false);
            }}
            suggestions={profileAreas}
            placeholder="Add a city or region, e.g. Mumbai"
            maxTags={30}
            className={cn(
              fieldErrors.service_areas && "border-destructive ring-destructive/20",
            )}
          />
          {fieldErrors.service_areas && (
            <p className="text-xs text-red-600">{fieldErrors.service_areas}</p>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs text-muted-foreground">
              {form.service_areas.length}/30 areas selected.
            </p>
            {canUseProfileAreas && !currentProfileAreasMatch && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  updateForm({ service_areas: [...profileAreas] });
                  setAreasInherited(true);
                }}
                className="h-7 rounded-lg px-2 text-xs text-violet-700 hover:bg-violet-50 hover:text-violet-800"
              >
                Use my profile areas
              </Button>
            )}
            {form.service_areas.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  updateForm({ service_areas: [] });
                  setAreasInherited(false);
                }}
                className="h-7 rounded-lg px-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                Clear all
              </Button>
            )}
          </div>
        </div>
      </SectionCard>

      <SectionCard
        icon={Clock3}
        title="How you deliver"
        description="Set expectations around timing, team size, and equipment."
      >
        <div className="space-y-6">
          <fieldset id="delivery-time-options" tabIndex={-1} className="space-y-3 outline-none">
            <legend className="text-sm font-semibold text-foreground">
              Delivery time <RequiredMark />
            </legend>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {DELIVERY_OPTIONS.map((option) => (
                <OptionCard
                  key={option.value}
                  selected={form.delivery_time === option.value}
                  onClick={() => updateForm({ delivery_time: option.value })}
                  icon={option.icon}
                  label={option.label}
                  description={option.detail}
                  compact
                />
              ))}
            </div>
            {fieldErrors.delivery_time && (
              <p className="text-xs text-red-600">{fieldErrors.delivery_time}</p>
            )}
          </fieldset>

          <fieldset id="team-size-options" tabIndex={-1} className="space-y-3 outline-none">
            <legend className="text-sm font-semibold text-foreground">
              Team size
            </legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {TEAM_OPTIONS.map((option) => (
                <OptionCard
                  key={option.value}
                  selected={form.team_size === option.value}
                  onClick={() => updateForm({ team_size: option.value })}
                  icon={option.icon}
                  label={option.label}
                  description={option.detail}
                  compact
                />
              ))}
            </div>
            {fieldErrors.team_size && (
              <p className="text-xs text-red-600">{fieldErrors.team_size}</p>
            )}
          </fieldset>

          <fieldset id="equipment-options" tabIndex={-1} className="space-y-3 outline-none">
            <legend className="text-sm font-semibold text-foreground">
              Equipment responsibility
            </legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {EQUIPMENT_OPTIONS.map((option) => (
                <OptionCard
                  key={option.value}
                  selected={form.equipment === option.value}
                  onClick={() => updateForm({ equipment: option.value })}
                  icon={option.icon}
                  label={option.label}
                  description={option.detail}
                  compact
                />
              ))}
            </div>
            {fieldErrors.equipment && (
              <p className="text-xs text-red-600">{fieldErrors.equipment}</p>
            )}
          </fieldset>
        </div>
      </SectionCard>
    </>
  );
}

function StepPricing({
  form,
  fieldErrors,
  updateForm,
  price,
  profileQuery,
  publishBlocked,
  profileUnavailable,
  isAlreadyPublished,
  isPaused,
  saving,
  uploading,
  onEditStep,
  onSaveDraft,
  onPublish,
}: {
  form: ServiceForm;
  fieldErrors: Record<string, string>;
  updateForm: (patch: Partial<ServiceForm>) => void;
  price: { main: string; sub: string };
  profileQuery: {
    isLoading: boolean;
    isError: boolean;
  };
  publishBlocked: boolean;
  profileUnavailable: boolean;
  isAlreadyPublished: boolean;
  isPaused: boolean;
  saving: boolean;
  uploading: boolean;
  onEditStep: (index: number) => void;
  onSaveDraft: () => void;
  onPublish: () => void;
}) {
  const saveLabel = isAlreadyPublished || isPaused ? "Save changes" : "Save as draft";

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-5">
        <SectionCard
          icon={Wallet}
          title="Pricing configuration"
          description="An indicative price is optional. Customers can contact you to discuss scope and pricing."
        >
          {form.service_type === "custom" ? (
            <div className="rounded-2xl border border-violet-200 bg-violet-50/70 p-5">
              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-violet-600 text-white">
                  <Wallet className="size-5" />
                </span>
                <div>
                  <h3 className="font-bold text-violet-950">Custom pricing</h3>
                  <p className="mt-1 text-sm leading-6 text-violet-900/75">
                    Customers will see &ldquo;Contact for Pricing&rdquo; and send you
                    their requirements. You can publish without a fixed amount.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_120px]">
                <Field
                  label="Indicative price"
                  htmlFor="service-amount"
                  optional
                  hint="Leave blank to discuss pricing directly with the customer."
                  error={fieldErrors.amount}
                >
                  <div className="relative">
                    <IndianRupee className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="service-amount"
                      type="number"
                      min={0}
                      step="0.01"
                      inputMode="decimal"
                      value={form.amount}
                      aria-invalid={Boolean(fieldErrors.amount)}
                      onChange={(event) => updateForm({ amount: event.target.value })}
                      placeholder="e.g. 25000"
                      className={cn(inputClass, "pl-9")}
                    />
                  </div>
                </Field>

                <Field
                  label="Currency"
                  htmlFor="service-currency"
                  hint="3-letter code"
                >
                  <Input
                    id="service-currency"
                    value={form.currency}
                    maxLength={3}
                    aria-label="Currency code"
                    onChange={(event) =>
                      updateForm({ currency: event.target.value.toUpperCase() })
                    }
                    className={cn(inputClass, "uppercase")}
                  />
                </Field>
              </div>

              <fieldset className="space-y-2">
                <legend className="text-sm font-semibold text-foreground">
                  Pricing unit
                </legend>
                <div className="flex flex-wrap gap-2">
                  {UNIT_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    const selected = form.unit === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => updateForm({ unit: option.value })}
                        className={cn(
                          "inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-sm font-medium transition",
                          selected
                            ? "border-violet-500 bg-violet-50 text-violet-800 ring-1 ring-violet-500/20"
                            : "border-border bg-card text-muted-foreground hover:border-violet-300 hover:bg-violet-50/50 hover:text-violet-800",
                        )}
                      >
                        <Icon className="size-4" />
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <Field
                label="Pricing note"
                htmlFor="service-price-note"
                optional
                hint="Optional context, e.g. travel or deliverables."
                counter={`${form.price_note.length}/120`}
              >
                <Input
                  id="service-price-note"
                  value={form.price_note}
                  maxLength={120}
                  onChange={(event) => updateForm({ price_note: event.target.value })}
                  placeholder="e.g. Starting price; final quote after the brief"
                  className={inputClass}
                />
              </Field>
            </div>
          )}

          <div className="mt-5 rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 via-card to-card p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-violet-600">
              Customer preview
            </p>
            <div className="mt-2 flex flex-wrap items-end gap-x-2 gap-y-1">
              <p className="text-3xl font-extrabold tracking-tight text-violet-950">
                {price.main}
              </p>
              {price.main !== "Contact for Pricing" && (
                <p className="pb-1 text-sm font-medium text-violet-800/70">{price.sub}</p>
              )}
            </div>
            {form.price_note && (
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                {form.price_note}
              </p>
            )}
            <p className="mt-2 text-xs text-muted-foreground">
              Indicative only. Scope and final pricing are agreed with the customer.
            </p>
          </div>
        </SectionCard>

        <SectionCard
          icon={Rocket}
          title="Publish your service"
          description="Publishing makes your service visible in the public marketplace, subject to provider onboarding requirements."
        >
          <div className="space-y-4">
            <div className="grid gap-2 sm:grid-cols-3">
              <ReadinessItem
                ready={form.images.length > 0}
                label={form.images.length > 0 ? `${form.images.length} image${form.images.length === 1 ? "" : "s"} added` : "Add a cover image"}
              />
              <ReadinessItem
                ready={form.service_areas.length > 0}
                label={form.service_areas.length > 0 ? `${form.service_areas.length} service area${form.service_areas.length === 1 ? "" : "s"}` : "Add service areas"}
              />
              <ReadinessItem
                ready
                label={form.service_type === "custom" ? "Custom pricing" : form.amount ? "Price added" : "Price optional"}
              />
            </div>

            {profileQuery.isLoading ? (
              <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
                <Loader2 className="size-4 animate-spin text-violet-600" />
                Checking your provider profile…
              </div>
            ) : publishBlocked ? (
              <div className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-600" />
                  <div>
                    <p className="font-semibold">Complete onboarding before publishing</p>
                    <p className="mt-0.5 text-xs leading-5 text-amber-900/75">
                      {profileUnavailable
                        ? "We could not find your provider profile. Activate provider access and finish onboarding first."
                        : "Your provider profile is not marked complete yet. Publishing will stay unavailable until you finish onboarding."}
                    </p>
                  </div>
                </div>
                <Button
                  asChild
                  variant="outline"
                  className="h-9 shrink-0 border-amber-300 bg-white text-amber-900 hover:bg-amber-100"
                >
                  <Link href="/provider/onboarding">Complete onboarding</Link>
                </Button>
              </div>
            ) : (
              <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs leading-5 text-emerald-900">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                Your provider profile is ready. Publishing will make this service
                visible immediately.
              </div>
            )}

            {isAlreadyPublished && (
              <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
                This service is currently published. Saved changes will be visible
                to customers immediately.
              </p>
            )}

            {isPaused && (
              <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                This service is paused and hidden from the marketplace. Publish it
                again whenever you are ready.
              </p>
            )}

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={onSaveDraft}
                disabled={saving || uploading}
                className={outlineButtonClass}
              >
                {saving ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                {saveLabel}
              </Button>
              <Button
                type="button"
                onClick={onPublish}
                disabled={saving || uploading || publishBlocked}
                className={primaryButtonClass}
              >
                {saving ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : isAlreadyPublished ? (
                  <Save className="size-4" />
                ) : (
                  <Rocket className="size-4" />
                )}
                {isAlreadyPublished
                  ? "Save changes"
                  : isPaused
                    ? "Publish again"
                    : "Publish service"}
              </Button>
            </div>
          </div>
        </SectionCard>
      </div>

      <aside className="lg:sticky lg:top-24">
        <ServicePreviewCard
          form={form}
          price={price}
          onEditStep={onEditStep}
        />
      </aside>
    </div>
  );
}

function ServicePreviewCard({
  form,
  price,
  onEditStep,
}: {
  form: ServiceForm;
  price: { main: string; sub: string };
  onEditStep: (index: number) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_18px_50px_-40px_rgba(76,29,149,0.5)]">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-600">
          Listing preview
        </p>
        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
          <Sparkles className="size-3" />
          Live preview
        </span>
      </div>

      <div className="aspect-[4/3] bg-gradient-to-br from-violet-100 via-violet-50 to-card">
        {form.images[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={form.images[0].url}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-violet-400">
            <ImagePlus className="size-8" />
            <span className="text-xs font-medium">Your cover image</span>
          </div>
        )}
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-violet-600">
            {form.category || "Service category"}
          </p>
          <button
            type="button"
            onClick={() => onEditStep(0)}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-violet-700 hover:bg-violet-50"
          >
            <Pencil className="size-3" />
            Edit
          </button>
        </div>

        <h2 className="text-lg font-bold leading-snug text-foreground">
          {form.title || "Your service title"}
        </h2>
        {form.subcategory && (
          <p className="text-xs font-medium text-muted-foreground">
            {form.subcategory}
          </p>
        )}
        <p className="line-clamp-3 text-xs leading-5 text-muted-foreground">
          {form.short_description ||
            "Your short description will appear here. Make it clear and specific."}
        </p>

        <div className="border-t border-border pt-3">
          <div className="flex flex-wrap items-end gap-x-2">
            <p className="text-xl font-extrabold text-violet-950">{price.main}</p>
            {price.main !== "Contact for Pricing" && (
              <p className="pb-0.5 text-xs font-medium text-muted-foreground">
                {price.sub}
              </p>
            )}
          </div>
          {form.price_note && (
            <p className="mt-1 text-[11px] leading-4 text-muted-foreground">
              {form.price_note}
            </p>
          )}
        </div>

        <div className="space-y-2 border-t border-border pt-3 text-xs text-muted-foreground">
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 size-3.5 shrink-0 text-violet-500" />
            <span className="line-clamp-2">
              {form.service_areas.length > 0
                ? form.service_areas.slice(0, 4).join(", ") +
                  (form.service_areas.length > 4
                    ? ` +${form.service_areas.length - 4} more`
                    : "")
                : "Service areas not set"}
            </span>
          </div>
          <div className="flex items-start gap-2">
            <Clock3 className="mt-0.5 size-3.5 shrink-0 text-violet-500" />
            <span>
              {DELIVERY_OPTIONS.find((option) => option.value === form.delivery_time)
                ?.label ?? "Delivery time not set"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 border-t border-border bg-muted/30">
        {[
          { label: "Basics", index: 0, icon: PenLine },
          { label: "Media", index: 1, icon: ImagePlus },
          { label: "Pricing", index: 2, icon: Wallet },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => onEditStep(item.index)}
              className="flex items-center justify-center gap-1.5 border-r border-border px-2 py-3 text-[11px] font-semibold text-muted-foreground transition last:border-r-0 hover:bg-violet-50 hover:text-violet-700"
            >
              <Icon className="size-3.5" />
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SectionCard({
  icon: Icon,
  title,
  description,
  action,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-[0_18px_50px_-40px_rgba(76,29,149,0.45)] sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-600">
            <Icon className="size-5" />
          </span>
          <div>
            <h2 className="text-base font-bold text-foreground">{title}</h2>
            <p className="mt-1 max-w-xl text-xs leading-5 text-muted-foreground">
              {description}
            </p>
          </div>
        </div>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  htmlFor,
  required,
  optional,
  hint,
  error,
  counter,
  children,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  optional?: boolean;
  hint?: string;
  error?: string;
  counter?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Label htmlFor={htmlFor} className="text-sm font-semibold text-foreground">
          {label}
          {required && <RequiredMark />}
          {optional && (
            <span className="ml-1 text-xs font-normal text-muted-foreground">
              Optional
            </span>
          )}
        </Label>
        {counter && (
          <span className="text-[11px] tabular-nums text-muted-foreground">
            {counter}
          </span>
        )}
      </div>
      {children}
      <div className="flex flex-wrap items-start justify-between gap-2 text-xs">
        <span className={error ? "text-red-600" : "text-muted-foreground"}>
          {error || hint || " "}
        </span>
      </div>
    </div>
  );
}

function OptionCard({
  selected,
  onClick,
  icon: Icon,
  label,
  description,
  compact = false,
}: {
  selected: boolean;
  onClick: () => void;
  icon: LucideIcon;
  label: string;
  description: string;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "group relative rounded-xl border text-left transition",
        compact ? "p-3" : "p-4",
        selected
          ? "border-violet-500 bg-violet-50 ring-1 ring-violet-500/20"
          : "border-border bg-card hover:border-violet-300 hover:bg-violet-50/40",
      )}
    >
      <span className="flex items-start gap-2.5">
        <span
          className={cn(
            "grid size-8 shrink-0 place-items-center rounded-lg",
            selected
              ? "bg-violet-600 text-white"
              : "bg-muted text-muted-foreground group-hover:bg-violet-100 group-hover:text-violet-700",
          )}
        >
          <Icon className="size-4" />
        </span>
        <span className="min-w-0">
          <span
            className={cn(
              "block text-sm font-semibold",
              selected ? "text-violet-900" : "text-foreground",
            )}
          >
            {label}
          </span>
          <span className="mt-0.5 block text-[11px] leading-4 text-muted-foreground">
            {description}
          </span>
        </span>
      </span>
      {selected && (
        <span className="absolute right-2.5 top-2.5 grid size-5 place-items-center rounded-full bg-violet-600 text-white">
          <Check className="size-3" strokeWidth={3} />
        </span>
      )}
    </button>
  );
}

function ImageThumbnail({
  image,
  index,
  total,
  isDragged,
  onDrop,
  onSetCover,
  onMove,
  onRemove,
  onDragStart,
  onDragEnd,
}: {
  image: ImageItem;
  index: number;
  total: number;
  isDragged: boolean;
  onDrop: (event: React.DragEvent<HTMLDivElement>, index: number) => void;
  onSetCover: (index: number) => void;
  onMove: (index: number, offset: number) => void;
  onRemove: (index: number) => void;
  onDragStart: (index: number) => void;
  onDragEnd: () => void;
}) {
  return (
    <div
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData("text/plain", String(index));
        onDragStart(index);
      }}
      onDragEnd={onDragEnd}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => onDrop(event, index)}
      className={cn(
        "group relative aspect-square overflow-hidden rounded-xl border border-border bg-muted transition",
        isDragged && "opacity-60 ring-2 ring-violet-400",
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image.url}
        alt={`Service image ${index + 1}`}
        className="h-full w-full object-cover"
      />

      <span className="absolute left-1.5 top-1.5 grid size-6 cursor-grab place-items-center rounded-md bg-black/55 text-white/90 backdrop-blur">
        <GripVertical className="size-3.5" />
      </span>

      <button
        type="button"
        aria-label={`Remove image ${index + 1}`}
        onClick={() => onRemove(index)}
        className="absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-md bg-white/95 text-red-600 shadow-sm transition hover:bg-white"
      >
        <X className="size-3.5" />
      </button>

      <div className="absolute inset-x-1.5 bottom-1.5 flex items-center gap-1">
        <button
          type="button"
          onClick={() => onSetCover(index)}
          className="inline-flex h-6 min-w-0 flex-1 items-center justify-center gap-1 rounded-md bg-white/95 px-1 text-[9px] font-semibold text-violet-700 shadow-sm transition hover:bg-white"
          aria-label={`Use image ${index + 1} as cover`}
        >
          <Star className="size-3" />
          Cover
        </button>
        <button
          type="button"
          disabled={index <= 1}
          onClick={() => onMove(index, -1)}
          className="grid size-6 place-items-center rounded-md bg-white/95 text-foreground shadow-sm transition hover:bg-white disabled:opacity-40"
          aria-label={`Move image ${index + 1} earlier`}
        >
          <ChevronLeft className="size-3.5" />
        </button>
        <button
          type="button"
          disabled={index >= total - 1}
          onClick={() => onMove(index, 1)}
          className="grid size-6 place-items-center rounded-md bg-white/95 text-foreground shadow-sm transition hover:bg-white disabled:opacity-40"
          aria-label={`Move image ${index + 1} later`}
        >
          <ChevronRight className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

function ReadinessItem({ ready, label }: { ready: boolean; label: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-xl border px-3 py-2 text-xs",
        ready
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-border bg-muted/40 text-muted-foreground",
      )}
    >
      {ready ? (
        <CheckCircle2 className="size-3.5 shrink-0 text-emerald-600" />
      ) : (
        <Info className="size-3.5 shrink-0" />
      )}
      <span className="truncate">{label}</span>
    </div>
  );
}

function RequiredMark() {
  return <span className="ml-0.5 text-red-500">*</span>;
}
