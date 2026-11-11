import { redirect } from "next/navigation";

export default function ProviderServicesPage() {
  redirect("/provider/listings?type=service");
}
