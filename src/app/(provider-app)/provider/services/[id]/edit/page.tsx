"use client";

import { useParams } from "next/navigation";
import { ServiceEditor } from "@/components/provider/service-editor";

export default function EditProviderServicePage() {
  const params = useParams();
  const serviceId = typeof params.id === "string" ? params.id : "";

  if (!serviceId) return null;
  return <ServiceEditor serviceId={serviceId} />;
}
