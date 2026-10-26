import Link from "next/link";
import { PublicMarketplaceHeader } from "@/components/marketplace/public-marketplace-header";

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted/20">
      <PublicMarketplaceHeader />
      <main className="mx-auto w-full max-w-6xl px-4 py-8">{children}</main>
      <footer className="border-t border-border/60 bg-background">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>RootIn Marketplace — discover vetted service providers.</p>
          <div className="flex gap-4">
            <Link className="hover:text-foreground" href="/services">
              Services
            </Link>
            <Link className="hover:text-foreground" href="/providers">
              Providers
            </Link>
            <Link className="hover:text-foreground" href="/auth/login">
              Log in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
