import { redirect } from "next/navigation";

export default function ProviderProductsPage() {
  redirect("/provider/listings?type=product");
}
