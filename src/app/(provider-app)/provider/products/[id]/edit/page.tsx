"use client";

import { useParams } from "next/navigation";
import { ProductEditor } from "@/components/provider/product-editor";

export default function EditProviderProductPage() {
  const params = useParams();
  const productId = typeof params.id === "string" ? params.id : "";

  if (!productId) return null;
  return <ProductEditor productId={productId} />;
}
