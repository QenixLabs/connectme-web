import { ProviderShell } from "@/components/provider/provider-shell";

export default function ProviderAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProviderShell>{children}</ProviderShell>;
}
