import { apiClient } from "./client";
import type { Paginated } from "./marketplace";

export type ProductStatus = "draft" | "published" | "paused";
export type ProductType = "physical" | "digital";
export type ProductMediaType = "image" | "video";

export interface ProductCategory {
  name: string;
  subcategories: string[];
}

export interface ProductMedia {
  path: string;
  type: ProductMediaType;
  url?: string;
}

export interface ProductVariant {
  attributes: Array<{ name: string; value: string }>;
  price?: number;
  stock_quantity?: number;
  sku?: string;
}

export interface ProductListing {
  id: string;
  title: string;
  description: string;
  short_description: string;
  category: string;
  subcategory: string;
  product_type: ProductType;
  tags: string[];
  media: ProductMedia[];
  pricing: {
    mode: "single" | "variants";
    price?: number;
    original_price?: number;
    currency: string;
    tax_percent?: number;
  };
  variants: ProductVariant[];
  inventory: {
    quantity?: number;
    unlimited: boolean;
    low_stock_threshold?: number;
  };
  delivery: {
    type?: ProductType;
    weight?: number;
    weight_unit?: "kg" | "g";
    shipping_time?: string;
    locations?: string[];
    domestic?: boolean;
    international?: boolean;
    cash_on_delivery?: boolean;
    return_exchange?: boolean;
    digital_delivery?: "instant" | "manual";
    delivery_information?: string;
  };
  status: ProductStatus;
  views_count: number;
  published_at?: string | null;
  created_at?: string;
  updated_at?: string;
  provider?: {
    slug?: string;
    display_name?: string;
    business_name?: string;
    profile_photo?: string;
    average_rating?: number | null;
    review_count?: number;
  } | null;
}

export type ProductPayload = Partial<
  Omit<ProductListing, "id" | "status" | "views_count" | "provider" | "published_at" | "created_at" | "updated_at">
>;

export interface MyProductsQuery {
  status?: "all" | ProductStatus;
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export interface MyProductsResponse extends Paginated<ProductListing> {
  summary: {
    total: number;
    draft: number;
    published: number;
    paused: number;
  };
}

export interface PublicProductsQuery {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export const productsApi = {
  getCategories: async () => {
    const response = await apiClient.get("/products/categories");
    return response.data as ProductCategory[];
  },

  getMine: async (params?: MyProductsQuery) => {
    const response = await apiClient.get("/provider/products", { params });
    return response.data as MyProductsResponse;
  },

  getMineById: async (id: string) => {
    const response = await apiClient.get(
      `/provider/products/${encodeURIComponent(id)}`,
    );
    return response.data as { product: ProductListing };
  },

  create: async (payload: ProductPayload) => {
    const response = await apiClient.post("/provider/products", payload);
    return response.data as { product: ProductListing };
  },

  update: async (id: string, payload: ProductPayload) => {
    const response = await apiClient.patch(
      `/provider/products/${encodeURIComponent(id)}`,
      payload,
    );
    return response.data as { product: ProductListing };
  },

  remove: async (id: string) => {
    const response = await apiClient.delete(
      `/provider/products/${encodeURIComponent(id)}`,
    );
    return response.data as { deleted: boolean };
  },

  publish: async (id: string, acceptedTerms: boolean) => {
    const response = await apiClient.post(
      `/provider/products/${encodeURIComponent(id)}/publish`,
      { accepted_terms: acceptedTerms },
    );
    return response.data as { product: ProductListing };
  },

  pause: async (id: string) => {
    const response = await apiClient.post(
      `/provider/products/${encodeURIComponent(id)}/pause`,
    );
    return response.data as { product: ProductListing };
  },

  duplicate: async (id: string) => {
    const response = await apiClient.post(
      `/provider/products/${encodeURIComponent(id)}/duplicate`,
    );
    return response.data as { product: ProductListing };
  },

  uploadMedia: async (
    file: File,
    onProgress?: (percentage: number) => void,
  ) => {
    const body = new FormData();
    body.append("file", file);
    const response = await apiClient.post("/provider/products/upload/media", body, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (progress) => {
        if (progress.total) {
          onProgress?.(Math.round((progress.loaded / progress.total) * 100));
        }
      },
    });
    return response.data as ProductMedia;
  },

  getPublicListings: async (
    params?: PublicProductsQuery,
    signal?: AbortSignal,
  ) => {
    const response = await apiClient.get("/products", { params, signal });
    return response.data as Paginated<ProductListing>;
  },

  getPublicProduct: async (id: string) => {
    const response = await apiClient.get(
      `/products/${encodeURIComponent(id)}`,
    );
    return response.data as {
      product: ProductListing;
      related_products: ProductListing[];
    };
  },
};
