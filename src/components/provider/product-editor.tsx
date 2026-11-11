"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleAlert,
  GripVertical,
  Loader2,
  Plus,
  Trash2,
  Upload,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api/client";
import {
  productsApi,
  type ProductListing,
  type ProductMedia,
  type ProductPayload,
  type ProductType,
  type ProductVariant,
} from "@/lib/api/products";
import { queryKeys } from "@/lib/api/query-keys";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CropImageModal } from "@/components/ui/crop-image-modal";

const STEPS = [
  "Basic details",
  "Product media",
  "Pricing",
  "Inventory",
  "Shipping",
  "Review",
] as const;

const MAX_MEDIA = 10;
const MAX_VARIANT_ATTRIBUTES = 10;

interface ProductForm {
  title: string;
  short_description: string;
  description: string;
  category: string;
  subcategory: string;
  product_type: ProductType;
  tags: string;
  media: ProductMedia[];
  pricing_mode: "single" | "variants";
  price: string;
  original_price: string;
  currency: string;
  tax_percent: string;
  variants: ProductVariant[];
  quantity: string;
  unlimited: boolean;
  low_stock_threshold: string;
  weight: string;
  weight_unit: "kg" | "g";
  shipping_time: string;
  locations: string;
  domestic: boolean;
  international: boolean;
  cash_on_delivery: boolean;
  return_exchange: boolean;
  digital_delivery: "instant" | "manual";
  delivery_information: string;
  accepted_terms: boolean;
}

const EMPTY_FORM: ProductForm = {
  title: "",
  short_description: "",
  description: "",
  category: "",
  subcategory: "",
  product_type: "physical",
  tags: "",
  media: [],
  pricing_mode: "single",
  price: "",
  original_price: "",
  currency: "INR",
  tax_percent: "",
  variants: [],
  quantity: "",
  unlimited: false,
  low_stock_threshold: "",
  weight: "",
  weight_unit: "kg",
  shipping_time: "3-5 days",
  locations: "",
  domestic: true,
  international: false,
  cash_on_delivery: false,
  return_exchange: false,
  digital_delivery: "instant",
  delivery_information: "",
  accepted_terms: false,
};

function toForm(product: ProductListing): ProductForm {
  return {
    ...EMPTY_FORM,
    title: product.title ?? "",
    short_description: product.short_description ?? "",
    description: product.description ?? "",
    category: product.category ?? "",
    subcategory: product.subcategory ?? "",
    product_type: product.product_type ?? "physical",
    tags: product.tags?.join(", ") ?? "",
    media: product.media ?? [],
    pricing_mode: product.pricing?.mode ?? "single",
    price: product.pricing?.price?.toString() ?? "",
    original_price: product.pricing?.original_price?.toString() ?? "",
    currency: product.pricing?.currency ?? "INR",
    tax_percent: product.pricing?.tax_percent?.toString() ?? "",
    variants: product.variants ?? [],
    quantity: product.inventory?.quantity?.toString() ?? "",
    unlimited: product.inventory?.unlimited ?? false,
    low_stock_threshold: product.inventory?.low_stock_threshold?.toString() ?? "",
    weight: product.delivery?.weight?.toString() ?? "",
    weight_unit: product.delivery?.weight_unit ?? "kg",
    shipping_time: product.delivery?.shipping_time ?? "3-5 days",
    locations: product.delivery?.locations?.join(", ") ?? "",
    domestic: product.delivery?.domestic ?? true,
    international: product.delivery?.international ?? false,
    cash_on_delivery: product.delivery?.cash_on_delivery ?? false,
    return_exchange: product.delivery?.return_exchange ?? false,
    digital_delivery: product.delivery?.digital_delivery ?? "instant",
    delivery_information: product.delivery?.delivery_information ?? "",
  };
}

function productPayload(form: ProductForm): ProductPayload {
  const optionalNumber = (value: string) => (value.trim() ? Number(value) : undefined);
  return {
    title: form.title.trim(),
    short_description: form.short_description.trim(),
    description: form.description.trim(),
    category: form.category,
    subcategory: form.subcategory.trim(),
    product_type: form.product_type,
    tags: form.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
    media: form.media.map(({ path, type }) => ({ path, type })),
    pricing: {
      mode: form.pricing_mode,
      currency: form.currency.trim().toUpperCase() || "INR",
      price: optionalNumber(form.price),
      original_price: optionalNumber(form.original_price),
      tax_percent: optionalNumber(form.tax_percent),
    },
    variants: form.variants,
    inventory: {
      quantity: optionalNumber(form.quantity),
      unlimited: form.unlimited,
      low_stock_threshold: optionalNumber(form.low_stock_threshold),
    },
    delivery:
      form.product_type === "physical"
        ? {
            type: "physical",
            weight: optionalNumber(form.weight),
            weight_unit: form.weight_unit,
            shipping_time: form.shipping_time,
            locations: form.locations
              .split(",")
              .map((location) => location.trim())
              .filter(Boolean),
            domestic: form.domestic,
            international: form.international,
            cash_on_delivery: form.cash_on_delivery,
            return_exchange: form.return_exchange,
          }
        : {
            type: "digital",
            digital_delivery: form.digital_delivery,
            delivery_information: form.delivery_information.trim(),
          },
  };
}

function priceText(product: ProductForm): string {
  if (product.pricing_mode === "variants") {
    const price = product.variants[0]?.price;
    return price === undefined ? "Add variant pricing" : `${product.currency} ${price}`;
  }
  return product.price ? `${product.currency} ${product.price}` : "Set a price";
}

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required && <span className="ml-1 text-red-600">*</span>}
      </Label>
      {children}
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-3">
      <div>
        <p className="text-sm font-medium text-slate-900">{label}</p>
        {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function VariantRow({
  variant,
  index,
  onChange,
  onRemove,
}: {
  variant: ProductVariant;
  index: number;
  onChange: (value: ProductVariant) => void;
  onRemove: () => void;
}) {
  return (
    <div className="space-y-3 rounded-xl border border-slate-200 p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-900">Variant {index + 1}</p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label={`Remove variant ${index + 1}`}
          className="text-red-600"
          onClick={onRemove}
        >
          <Trash2 className="mr-1.5 size-4" />
          Remove
        </Button>
      </div>
      <div className="space-y-2">
        <p className="text-xs font-medium text-slate-600">Options</p>
        {variant.attributes.map((attribute, attributeIndex) => (
          <div key={attributeIndex} className="grid grid-cols-[1fr_1fr_auto] gap-2">
            <Input
              aria-label={`Variant ${index + 1} option ${attributeIndex + 1} name`}
              maxLength={40}
              value={attribute.name}
              onChange={(event) => {
                const attributes = [...variant.attributes];
                attributes[attributeIndex] = { ...attribute, name: event.target.value };
                onChange({ ...variant, attributes });
              }}
              placeholder="Option name (e.g. Color)"
            />
            <Input
              aria-label={`Variant ${index + 1} option ${attributeIndex + 1} value`}
              maxLength={80}
              value={attribute.value}
              onChange={(event) => {
                const attributes = [...variant.attributes];
                attributes[attributeIndex] = { ...attribute, value: event.target.value };
                onChange({ ...variant, attributes });
              }}
              placeholder="Value (e.g. Blue)"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Remove option ${attributeIndex + 1} from variant ${index + 1}`}
              className="text-slate-500"
              disabled={variant.attributes.length === 1}
              onClick={() =>
                onChange({
                  ...variant,
                  attributes: variant.attributes.filter((_, itemIndex) => itemIndex !== attributeIndex),
                })
              }
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={variant.attributes.length >= MAX_VARIANT_ATTRIBUTES}
          onClick={() =>
            onChange({
              ...variant,
              attributes: [...variant.attributes, { name: "", value: "" }],
            })
          }
        >
          <Plus className="mr-1.5 size-4" />
          Add option
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField label="Variant price" required>
          <Input
            aria-label={`Variant ${index + 1} price`}
            type="number"
            min="0"
            step="0.01"
            value={variant.price ?? ""}
            onChange={(event) =>
              onChange({
                ...variant,
                price: event.target.value ? Number(event.target.value) : undefined,
              })
            }
            placeholder="0.00"
          />
        </FormField>
      </div>
    </div>
  );
}

export function ProductEditor({ productId }: { productId?: string }) {
  const productQuery = useQuery({
    queryKey: productId
      ? queryKeys.products.mineDetail(productId)
      : ["products", "mine", "new"],
    queryFn: () => productsApi.getMineById(productId ?? ""),
    enabled: Boolean(productId),
  });

  if (productId && productQuery.isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 py-10">
        <Skeleton className="h-16 rounded-2xl" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }
  if (productId && productQuery.isError) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">
        <p>{getApiErrorMessage(productQuery.error, "Could not load product.")}</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/provider/listings">Back to My Listings</Link>
        </Button>
      </div>
    );
  }
  return (
    <ProductEditorForm
      key={productId ?? "new-product"}
      productId={productId}
      initialProduct={productQuery.data?.product}
    />
  );
}

function ProductEditorForm({
  productId,
  initialProduct,
}: {
  productId?: string;
  initialProduct?: ProductListing;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const categoryQuery = useQuery({
    queryKey: queryKeys.products.categories(),
    queryFn: productsApi.getCategories,
  });
  const [form, setForm] = useState<ProductForm>(
    initialProduct ? toForm(initialProduct) : EMPTY_FORM,
  );
  const [step, setStep] = useState(() => {
    if (typeof window === "undefined") return 1;
    const requested = Number(new URLSearchParams(window.location.search).get("step"));
    return Number.isInteger(requested)
      ? Math.min(STEPS.length, Math.max(1, requested))
      : 1;
  });
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const uploadQueueRef = useRef<File[]>([]);
  const cropImageSrcRef = useRef<string | null>(null);
  const cropFileRef = useRef<File | null>(null);
  const categories = categoryQuery.data ?? [];
  const currentCategory = categories.find((category) => category.name === form.category);
  const estimatedDiscount = useMemo(() => {
    const original = Number(form.original_price);
    const price = Number(form.price);
    if (!original || !price || original <= price) return null;
    return Math.round(((original - price) / original) * 100);
  }, [form.original_price, form.price]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  useEffect(
    () => () => {
      if (cropImageSrcRef.current) URL.revokeObjectURL(cropImageSrcRef.current);
    },
    [],
  );

  function update<K extends keyof ProductForm>(key: K, value: ProductForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setDirty(true);
    setError("");
  }

  function showError(message: string) {
    setError(message);
    toast.error(message);
  }

  function validateStep(targetStep: number, publishing = false): string | null {
    if (targetStep === 1) {
      if (form.title.trim().length < 3) return "Product title must be at least 3 characters.";
      if (!form.category) return "Choose a product category.";
      if (form.short_description.trim().length < 10) return "Add a short description of at least 10 characters.";
      if (form.description.trim().length < 20) return "Add a description of at least 20 characters.";
    }
    if (targetStep === 2) {
      if (!form.media.some((media) => media.type === "image")) return "Upload at least one product image.";
      if (publishing && form.media.length > MAX_MEDIA) return "A maximum of 10 media files is allowed.";
    }
    if (targetStep === 3) {
      if (form.pricing_mode === "single") {
        const price = Number(form.price);
        if (!form.price || !Number.isFinite(price) || price <= 0) return "Enter a selling price greater than zero.";
        if (form.original_price && Number(form.original_price) < price) return "Original price must be greater than or equal to selling price.";
      } else {
        if (!form.variants.length) return "Add at least one product variant.";
        if (
          form.variants.some(
            (variant) =>
              variant.attributes.length === 0 ||
              variant.attributes.some(
                (attribute) =>
                  !attribute.name.trim() ||
                  !attribute.value.trim(),
              ) ||
              !variant.price ||
              variant.price <= 0,
          )
        ) {
          return "Every variant needs a first attribute and a price greater than zero.";
        }
      }
    }
    if (targetStep === 4 && form.product_type === "physical" && !form.unlimited) {
      if (form.pricing_mode === "single" && (!form.quantity || Number(form.quantity) < 0)) {
        return "Enter a stock quantity or enable unlimited stock.";
      }
      if (form.pricing_mode === "variants" && form.variants.some((variant) => variant.stock_quantity === undefined)) {
        return "Add stock for every variant.";
      }
    }
    if (targetStep === 5 && form.product_type === "physical" && !form.shipping_time.trim()) {
      return "Choose an estimated shipping time.";
    }
    return null;
  }

  async function saveDraft(): Promise<string> {
    setError("");
    setSaving(true);
    try {
      const payload = productPayload(form);
      const result = productId
        ? await productsApi.update(productId, payload)
        : await productsApi.create(payload);
      await queryClient.invalidateQueries({ queryKey: ["products", "mine"] });
      await queryClient.invalidateQueries({ queryKey: ["products", "public"] });
      setDirty(false);
      return result.product.id;
    } catch (saveError) {
      const message = getApiErrorMessage(saveError, "Could not save product draft.");
      setError(message);
      throw saveError;
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveDraft() {
    try {
      const id = await saveDraft();
      toast.success("Draft saved");
      router.push(`/provider/products/${encodeURIComponent(id)}/edit`);
    } catch (saveError) {
      toast.error(getApiErrorMessage(saveError, "Could not save product draft."));
    }
  }

  async function handlePublish() {
    for (let index = 1; index <= 5; index += 1) {
      const validationError = validateStep(index, index === 2);
      if (validationError) {
        setStep(index);
        showError(validationError);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
    }
    if (!form.accepted_terms) {
      setStep(6);
      showError("Accept the listing terms before publishing.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setError("");
    try {
      const id = await saveDraft();
      setSaving(true);
      await productsApi.publish(id, form.accepted_terms);
      await queryClient.invalidateQueries({ queryKey: ["products", "mine"] });
      await queryClient.invalidateQueries({ queryKey: ["products", "public"] });
      setDirty(false);
      toast.success("Product published");
      router.push("/provider/listings");
    } catch (publishError) {
      showError(getApiErrorMessage(publishError, "Could not publish product."));
    } finally {
      setSaving(false);
    }
  }

  function next() {
    const validationError = validateStep(step);
    if (validationError) {
      showError(validationError);
      return;
    }
    setError("");
    setStep((current) => Math.min(STEPS.length, current + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function previous() {
    setError("");
    setStep((current) => Math.max(1, current - 1));
  }

  function showNextMediaCrop() {
    const nextFile = uploadQueueRef.current.shift();
    if (!nextFile) {
      setCropImageSrc(null);
      setCropModalOpen(false);
      setUploading(false);
      setUploadPercent(0);
      return;
    }

    if (nextFile.type.startsWith("image/")) {
      const imageSrc = URL.createObjectURL(nextFile);
      cropImageSrcRef.current = imageSrc;
      cropFileRef.current = nextFile;
      setCropImageSrc(imageSrc);
      setCropModalOpen(true);
      return;
    }

    void (async () => {
      try {
        setUploadPercent(0);
        const media = await productsApi.uploadMedia(nextFile, setUploadPercent);
        setForm((current) => ({ ...current, media: [...current.media, media] }));
        setDirty(true);
        showNextMediaCrop();
      } catch (uploadError) {
        uploadQueueRef.current = [];
        setUploading(false);
        setUploadPercent(0);
        showError(getApiErrorMessage(uploadError, "Media upload failed. Try again."));
      }
    })();
  }

  async function handleImageCropped(croppedFile: File) {
    const originalFile = cropFileRef.current;
    if (!originalFile) return;

    if (cropImageSrcRef.current) URL.revokeObjectURL(cropImageSrcRef.current);
    cropImageSrcRef.current = null;
    cropFileRef.current = null;
    setCropImageSrc(null);
    setCropModalOpen(false);

    const filename = `${originalFile.name.replace(/\.[^.]+$/, "")}.jpg`;
    const file = new File([croppedFile], filename, { type: "image/jpeg" });
    try {
      setUploadPercent(0);
      const media = await productsApi.uploadMedia(file, setUploadPercent);
      setForm((current) => ({ ...current, media: [...current.media, media] }));
      setDirty(true);
      showNextMediaCrop();
    } catch (uploadError) {
      uploadQueueRef.current = [];
      setUploading(false);
      setUploadPercent(0);
      showError(getApiErrorMessage(uploadError, "Image upload failed. Try again."));
    }
  }

  function handleCropModalChange(open: boolean) {
    setCropModalOpen(open);
    if (open || !cropFileRef.current) return;

    if (cropImageSrcRef.current) URL.revokeObjectURL(cropImageSrcRef.current);
    cropImageSrcRef.current = null;
    cropFileRef.current = null;
    setCropImageSrc(null);
    showNextMediaCrop();
  }

  async function uploadFiles(files: FileList | null) {
    if (!files?.length) return;
    const incoming = Array.from(files);
    if (form.media.length + uploadQueueRef.current.length + (cropFileRef.current ? 1 : 0) + incoming.length > MAX_MEDIA) {
      showError(`You can upload a maximum of ${MAX_MEDIA} media files.`);
      return;
    }
    for (const file of incoming) {
      const validImage = ["image/jpeg", "image/png", "image/webp"].includes(file.type);
      const validVideo = ["video/mp4", "video/webm"].includes(file.type);
      const maxSize = validImage ? 5 * 1024 * 1024 : 50 * 1024 * 1024;
      if (!validImage && !validVideo) {
        showError(`${file.name}: use JPEG, PNG, WEBP, MP4, or WEBM.`);
        return;
      }
      if (file.size > maxSize) {
        showError(`${file.name}: file exceeds the ${validImage ? "5 MB" : "50 MB"} limit.`);
        return;
      }
    }
    setError("");
    setUploading(true);
    uploadQueueRef.current.push(...incoming);
    showNextMediaCrop();
  }

  function moveMedia(index: number, offset: -1 | 1) {
    const nextIndex = index + offset;
    if (nextIndex < 0 || nextIndex >= form.media.length) return;
    const media = [...form.media];
    [media[index], media[nextIndex]] = [media[nextIndex], media[index]];
    update("media", media);
  }

  function changeVariant(index: number, variant: ProductVariant) {
    const variants = [...form.variants];
    variants[index] = variant;
    update("variants", variants);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (step === 6) {
      await handlePublish();
      return;
    }
    next();
  }

  return (
    <>
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-4xl pb-28 sm:pb-10">
      <header className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-violet-700">
            {productId ? "Edit product" : "My listings"}
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            {productId ? "Update your listing" : "Add a new listing"}
          </h1>
        </div>
        <Button asChild type="button" variant="outline" className="rounded-xl">
          <Link href="/provider/listings">Exit</Link>
        </Button>
      </header>

      <section aria-label="Listing progress" className="mb-5 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-5">
        <div className="mb-3 flex items-center justify-between text-xs font-medium text-slate-500 sm:hidden">
          <span>Step {step} of {STEPS.length}</span>
          <span className="text-violet-800">{STEPS[step - 1]}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          {STEPS.map((label, index) => {
            const stepNumber = index + 1;
            const active = step === stepNumber;
            const done = step > stepNumber;
            return (
              <button
                type="button"
                key={label}
                aria-current={active ? "step" : undefined}
                aria-label={`Step ${stepNumber}: ${label}${done ? ", completed" : active ? ", current step" : ""}`}
                onClick={() => {
                  if (stepNumber <= step) setStep(stepNumber);
                }}
                className={`flex min-w-0 flex-col items-center gap-1.5 text-[10px] font-medium sm:text-xs ${
                  active ? "text-violet-800" : done ? "text-emerald-700" : "text-slate-400"
                }`}
              >
                <span className={`grid size-7 place-items-center rounded-full border text-xs font-bold sm:size-8 ${
                  active
                    ? "border-violet-700 bg-violet-700 text-white"
                    : done
                      ? "border-emerald-600 bg-emerald-600 text-white"
                      : "border-slate-300 bg-white"
                }`}>
                  {done ? <Check className="size-4" /> : stepNumber}
                </span>
                <span className="hidden max-w-20 truncate sm:block">{label}</span>
              </button>
            );
          })}
        </div>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-100 sm:hidden">
          <div
            className="h-full rounded-full bg-violet-700 transition-[width]"
            style={{ width: `${(step / STEPS.length) * 100}%` }}
          />
        </div>
      </section>

      {error && (
        <Alert variant="destructive" className="mb-4 rounded-xl border-red-200 bg-red-50">
          <CircleAlert />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-7">
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-bold text-slate-950">Basic product information</h2>
              <p className="mt-1 text-sm text-slate-600">Give customers the details they need to understand your product.</p>
            </div>
            <FormField label="Product title" required>
              <Input maxLength={140} value={form.title} onChange={(event) => update("title", event.target.value)} placeholder="e.g. Designer Wedding Outfit" />
              <p className="flex justify-between text-xs text-slate-400">
                <span>Use at least 3 characters.</span>
                <span>{form.title.length}/140</span>
              </p>
            </FormField>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Category" required>
                <Select
                  value={form.category || undefined}
                  onValueChange={(value) => {
                    update("category", value);
                    update("subcategory", "");
                  }}
                  disabled={categoryQuery.isLoading || categoryQuery.isError}
                >
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue placeholder={categoryQuery.isLoading ? "Loading categories..." : "Choose category"} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.name} value={category.name}>{category.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {categoryQuery.isError && (
                  <p className="text-sm text-red-700" role="status">
                    Categories could not be loaded.{" "}
                    <button type="button" className="font-semibold underline" onClick={() => void categoryQuery.refetch()}>
                      Try again
                    </button>
                  </p>
                )}
              </FormField>
              <FormField label="Subcategory">
                <Select
                  value={form.subcategory || undefined}
                  onValueChange={(value) => update("subcategory", value)}
                  disabled={!currentCategory}
                >
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue placeholder="Choose subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentCategory?.subcategories.map((subcategory) => (
                      <SelectItem key={subcategory} value={subcategory}>{subcategory}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>
            <FormField label="Product type">
              <div className="flex gap-2">
                {(["physical", "digital"] as const).map((type) => (
                  <Button
                    key={type}
                    type="button"
                    variant={form.product_type === type ? "default" : "outline"}
                    className={form.product_type === type ? "bg-violet-700 hover:bg-violet-800" : ""}
                    onClick={() => update("product_type", type)}
                  >
                    {type === "physical" ? "Physical product" : "Digital product"}
                  </Button>
                ))}
              </div>
            </FormField>
            <FormField label="Short description" required>
              <Textarea maxLength={150} value={form.short_description} onChange={(event) => update("short_description", event.target.value)} placeholder="A short overview for the product card." />
              <p className="flex justify-between text-xs text-slate-400">
                <span>Write at least 10 characters for the product card.</span>
                <span>{form.short_description.length}/150</span>
              </p>
            </FormField>
            <FormField label="Full description" required>
              <Textarea rows={5} maxLength={5000} value={form.description} onChange={(event) => update("description", event.target.value)} placeholder="Describe the product, its materials, fit, condition, or included items." />
              <p className="text-xs text-slate-400">Add at least 20 characters with useful product details.</p>
            </FormField>
            <FormField label="Tags">
              <Input value={form.tags} onChange={(event) => update("tags", event.target.value)} placeholder="Add comma-separated tags" />
            </FormField>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-bold text-slate-950">Product media</h2>
              <p className="mt-1 text-sm text-slate-600">Upload up to 10 images or videos. The first image is the cover.</p>
            </div>
            <label className="grid min-h-40 cursor-pointer place-items-center rounded-2xl border-2 border-dashed border-violet-200 bg-violet-50/40 p-5 text-center hover:bg-violet-50">
              <input
                type="file"
                className="sr-only"
                accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
                multiple
                disabled={uploading || form.media.length >= MAX_MEDIA}
                onChange={(event) => {
                  void uploadFiles(event.target.files);
                  event.target.value = "";
                }}
              />
              <span>
                {uploading ? <Loader2 className="mx-auto size-7 animate-spin text-violet-700" /> : <Upload className="mx-auto size-7 text-violet-700" />}
                <span className="mt-2 block font-semibold text-slate-900">
                  {uploading ? (cropModalOpen ? "Crop your image to continue" : `Uploading media… ${uploadPercent}%`) : "Choose images or videos"}
                </span>
                <span className="mt-1 block text-xs text-slate-500">Crop each image before upload · JPEG, PNG, WEBP up to 5 MB · MP4 or WEBM up to 50 MB</span>
              </span>
            </label>
            {uploading && <div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-violet-700 transition-[width]" style={{ width: `${uploadPercent}%` }} /></div>}
            {form.media.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {form.media.map((media, index) => (
                  <div key={`${media.path}-${index}`} className="overflow-hidden rounded-xl border border-slate-200">
                    <div className="relative aspect-square bg-slate-100">
                      {media.type === "image" && media.url ? (
                        <Image src={media.url} alt={`Product media ${index + 1}`} fill unoptimized className="object-cover" />
                      ) : (
                        <div className="grid size-full place-items-center text-slate-500"><Video className="size-8" /></div>
                      )}
                      {media.type === "image" && form.media.find((item) => item.type === "image") === media && <span className="absolute left-2 top-2 rounded-full bg-violet-700 px-2 py-1 text-[10px] font-bold text-white">Cover</span>}
                    </div>
                    <div className="flex items-center justify-between gap-1 p-2">
                      <span className="inline-flex min-w-0 items-center gap-1 truncate text-xs text-slate-500"><GripVertical className="size-3 shrink-0" />{media.type === "image" ? "Image" : "Video"} {index + 1}</span>
                      <div className="flex shrink-0">
                        <Button type="button" variant="ghost" size="icon" className="size-8" aria-label="Move media earlier" disabled={index === 0} onClick={() => moveMedia(index, -1)}><ArrowLeft className="size-3.5" /></Button>
                        <Button type="button" variant="ghost" size="icon" className="size-8" aria-label="Move media later" disabled={index === form.media.length - 1} onClick={() => moveMedia(index, 1)}><ArrowRight className="size-3.5" /></Button>
                        <Button type="button" variant="ghost" size="icon" className="size-8 text-red-600" aria-label="Remove media" onClick={() => update("media", form.media.filter((_, itemIndex) => itemIndex !== index))}><Trash2 className="size-3.5" /></Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-slate-500">360-degree media upload is not available in the current storage API.</p>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-bold text-slate-950">Pricing and variants</h2>
              <p className="mt-1 text-sm text-slate-600">Set a price or add options with different prices.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {(["single", "variants"] as const).map((mode) => (
                <button
                  type="button"
                  key={mode}
                  onClick={() => update("pricing_mode", mode)}
                  className={`rounded-xl border p-4 text-left ${form.pricing_mode === mode ? "border-violet-300 bg-violet-50" : "border-slate-200"}`}
                >
                  <span className="font-semibold text-slate-900">{mode === "single" ? "Single price" : "Variant pricing"}</span>
                  <span className="mt-1 block text-sm text-slate-500">{mode === "single" ? "One price for all customers" : "Set your own option names, like Color, Brand, or Model"}</span>
                </button>
              ))}
            </div>
            {form.pricing_mode === "single" ? (
              <>
                <div className="grid gap-4 sm:grid-cols-3">
                  <FormField label="Selling price" required><Input type="number" min="0" step="0.01" value={form.price} onChange={(event) => update("price", event.target.value)} placeholder="0.00" /></FormField>
                  <FormField label="Original price / MRP"><Input type="number" min="0" step="0.01" value={form.original_price} onChange={(event) => update("original_price", event.target.value)} placeholder="Optional" /></FormField>
                  <FormField label="Currency"><Input maxLength={3} value={form.currency} onChange={(event) => update("currency", event.target.value.toUpperCase())} /></FormField>
                </div>
                {estimatedDiscount !== null && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">{estimatedDiscount}% discount</p>}
              </>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-slate-600">
                  Add only the options that distinguish each variant. Stock quantities are entered once in the Inventory step.
                </p>
                {form.variants.map((variant, index) => (
                  <VariantRow key={index} index={index} variant={variant} onChange={(value) => changeVariant(index, value)} onRemove={() => update("variants", form.variants.filter((_, itemIndex) => itemIndex !== index))} />
                ))}
                <Button type="button" variant="outline" className="w-full border-dashed" onClick={() => update("variants", [...form.variants, { attributes: [{ name: "", value: "" }], price: undefined }])}><Plus className="mr-2 size-4" />Add variant</Button>
              </div>
            )}
            <FormField label="Tax / GST percentage"><Input type="number" min="0" max="100" step="0.01" value={form.tax_percent} onChange={(event) => update("tax_percent", event.target.value)} placeholder="Optional" /></FormField>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-bold text-slate-950">Inventory and stock</h2>
              <p className="mt-1 text-sm text-slate-600">Help buyers know what is available.</p>
            </div>
            {form.product_type === "digital" ? (
              <div className="rounded-xl border border-violet-100 bg-violet-50 p-4 text-sm text-violet-900">Digital products do not require physical stock tracking.</div>
            ) : form.pricing_mode === "variants" ? (
              <div className="space-y-3">
                <ToggleRow label="Unlimited stock" description="Apply to every variant and skip per-variant quantities." checked={form.unlimited} onCheckedChange={(checked) => update("unlimited", checked)} />
                {!form.unlimited && form.variants.map((variant, index) => (
                  <div key={index} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3">
                    <span className="text-sm font-medium">{variant.attributes.map(({ name, value }) => `${name}: ${value}`).filter(Boolean).join(" · ") || `Variant ${index + 1}`}</span>
                    <Input className="max-w-32" aria-label={`Stock for variant ${index + 1}`} type="number" min="0" step="1" value={variant.stock_quantity ?? ""} onChange={(event) => changeVariant(index, { ...variant, stock_quantity: event.target.value ? Number(event.target.value) : undefined })} placeholder="Quantity" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                <ToggleRow label="Unlimited stock" description="Keep the listing available without a stock limit." checked={form.unlimited} onCheckedChange={(checked) => update("unlimited", checked)} />
                {!form.unlimited && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField label="Stock quantity" required><Input type="number" min="0" step="1" value={form.quantity} onChange={(event) => update("quantity", event.target.value)} placeholder="0" /></FormField>
                    <FormField label="Low-stock alert threshold"><Input type="number" min="0" step="1" value={form.low_stock_threshold} onChange={(event) => update("low_stock_threshold", event.target.value)} placeholder="Optional" /></FormField>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {step === 5 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-bold text-slate-950">Shipping and availability</h2>
              <p className="mt-1 text-sm text-slate-600">Choose how customers receive your product.</p>
            </div>
            {form.product_type === "physical" ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Product weight"><Input type="number" min="0" step="0.01" value={form.weight} onChange={(event) => update("weight", event.target.value)} placeholder="Optional" /></FormField>
                  <FormField label="Weight unit">
                    <Select value={form.weight_unit} onValueChange={(value) => {
                      if (value === "kg" || value === "g") update("weight_unit", value);
                    }}>
                      <SelectTrigger className="h-10 w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">Kilograms (kg)</SelectItem>
                        <SelectItem value="g">Grams (g)</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                </div>
                <FormField label="Estimated shipping time" required><Input value={form.shipping_time} onChange={(event) => update("shipping_time", event.target.value)} placeholder="e.g. 3-5 days" /></FormField>
                <FormField label="Available locations"><Input value={form.locations} onChange={(event) => update("locations", event.target.value)} placeholder="Comma-separated states, cities, or regions" /></FormField>
                <ToggleRow label="Domestic delivery" checked={form.domestic} onCheckedChange={(checked) => update("domestic", checked)} />
                <ToggleRow label="International delivery" checked={form.international} onCheckedChange={(checked) => update("international", checked)} />
                <ToggleRow label="Cash on delivery" checked={form.cash_on_delivery} onCheckedChange={(checked) => update("cash_on_delivery", checked)} />
                <ToggleRow label="Returns and exchanges" checked={form.return_exchange} onCheckedChange={(checked) => update("return_exchange", checked)} />
              </>
            ) : (
              <>
                <FormField label="Digital delivery method">
                  <Select value={form.digital_delivery} onValueChange={(value) => {
                    if (value === "instant" || value === "manual") update("digital_delivery", value);
                  }}>
                    <SelectTrigger className="h-10 w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instant">Instant access</SelectItem>
                      <SelectItem value="manual">Manual delivery</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Delivery information"><Textarea rows={4} value={form.delivery_information} onChange={(event) => update("delivery_information", event.target.value)} placeholder="Explain how the buyer will receive the download or access details." /></FormField>
                <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">The current platform does not provide protected file delivery. Add delivery instructions here; do not upload private digital files.</p>
              </>
            )}
          </div>
        )}

        {step === 6 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-950">Review and publish</h2>
              <p className="mt-1 text-sm text-slate-600">Check your listing before it becomes visible in the marketplace.</p>
            </div>
            <ReviewSection title="Basic details" onEdit={() => setStep(1)}>
              <p className="font-semibold text-slate-900">{form.title || "Untitled product"}</p>
              <p className="text-sm text-slate-600">{form.category}{form.subcategory ? ` · ${form.subcategory}` : ""} · {form.product_type === "physical" ? "Physical" : "Digital"}</p>
              <p className="text-sm text-slate-600">{form.short_description || "No short description yet"}</p>
            </ReviewSection>
            <ReviewSection title="Media" onEdit={() => setStep(2)}>
              <p className="text-sm text-slate-600">{form.media.length} file{form.media.length === 1 ? "" : "s"} · {form.media.find((item) => item.type === "image") ? "Cover image added" : "Cover image missing"}</p>
            </ReviewSection>
            <ReviewSection title="Pricing and variants" onEdit={() => setStep(3)}>
              <p className="text-sm text-slate-600">{priceText(form)}{form.pricing_mode === "variants" ? ` · ${form.variants.length} variant(s)` : ""}</p>
            </ReviewSection>
            <ReviewSection title="Inventory" onEdit={() => setStep(4)}>
              <p className="text-sm text-slate-600">{form.product_type === "digital" ? "Digital product" : form.unlimited ? "Unlimited stock" : form.pricing_mode === "variants" ? `${form.variants.length} variants` : `${form.quantity || 0} units`}</p>
            </ReviewSection>
            <ReviewSection title="Shipping and availability" onEdit={() => setStep(5)}>
              <p className="text-sm text-slate-600">{form.product_type === "physical" ? `${form.shipping_time || "Shipping time not set"} · ${form.domestic ? "Domestic" : ""}${form.international ? " · International" : ""}` : `${form.digital_delivery === "instant" ? "Instant access" : "Manual delivery"}`}</p>
            </ReviewSection>
            <div className="space-y-2">
              <label className="flex items-start gap-3 rounded-xl border border-slate-200 p-3 text-sm text-slate-700">
                <input type="checkbox" className="mt-0.5 size-4 accent-violet-700" checked={form.accepted_terms} onChange={(event) => update("accepted_terms", event.target.checked)} />
                <span>I agree to the listing terms and confirm the product information is accurate.</span>
              </label>
              {!form.accepted_terms && (
                <p className="text-xs text-slate-500">Required before you can publish this listing.</p>
              )}
            </div>
          </div>
        )}
      </section>

      <footer className="fixed inset-x-0 bottom-[78px] z-30 border-t border-slate-200 bg-white/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur sm:static sm:mt-4 sm:border-0 sm:bg-transparent sm:p-0 sm:pb-0 sm:backdrop-blur-none">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-2">
          <Button type="button" variant="outline" disabled={step === 1 || saving || uploading} onClick={previous} className="min-h-11 rounded-xl">
            <ArrowLeft className="mr-1.5 size-4" />
            Previous
          </Button>
          <Button type="button" variant="outline" disabled={saving || uploading} onClick={() => void handleSaveDraft()} className="min-h-11 rounded-xl">
            {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
            Save draft
          </Button>
          {step === STEPS.length ? (
            <Button type="submit" disabled={saving || uploading || !form.accepted_terms} className="min-h-11 rounded-xl bg-violet-700 px-4 text-white hover:bg-violet-800 sm:px-6">
              {saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Check className="mr-2 size-4" />}
              Publish
            </Button>
          ) : (
            <Button type="submit" disabled={saving || uploading} className="min-h-11 rounded-xl bg-violet-700 px-4 text-white hover:bg-violet-800 sm:px-6">
              Continue
              <ArrowRight className="ml-1.5 size-4" />
            </Button>
          )}
        </div>
      </footer>
    </form>
    {cropImageSrc && (
      <CropImageModal
        key={cropImageSrc}
        open={cropModalOpen}
        onOpenChange={handleCropModalChange}
        imageSrc={cropImageSrc}
        onCropped={handleImageCropped}
        aspect={1}
        title="Crop product image"
        description="Drag and zoom to frame your image. Choose Crop & Use to upload it, or cancel to skip this image."
      />
    )}
    </>
  );
}

function ReviewSection({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 p-4">
      <div className="min-w-0 space-y-1">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        {children}
      </div>
      <Button type="button" variant="ghost" size="sm" onClick={onEdit} className="shrink-0 text-violet-700">Edit</Button>
    </section>
  );
}
