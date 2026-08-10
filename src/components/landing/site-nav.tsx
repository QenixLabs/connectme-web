import Link from "next/link";
import logo from "@/assets/rootin-logo-orange.png";

const links = [
  { label: "For talent", href: "#for-talent" },
  { label: "For recruiters", href: "#for-recruiters" },
  { label: "How it works", href: "#how-it-works" },
];

export function SiteNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/85 backdrop-blur">
      <div className="container-page flex h-[88px] items-center justify-between gap-4">
        <a href="#top" className="flex items-center gap-2">
          <img src={logo.src} alt="RootIn logo" className="h-[78px] w-auto" width={116} height={78} />
        </a>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-text-secondary transition-colors duration-150 hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/auth/login"
            className="hidden text-sm text-text-secondary transition-colors duration-150 hover:text-foreground sm:block"
          >
            Sign in
          </Link>
          <Link
            href="/auth/talent/signup"
            className="btn-gold inline-flex h-9 items-center rounded-full px-4 text-sm font-semibold"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
