import Link from "next/link";
import logo from "@/assets/rootin-logo-orange.png";

const columns = [
  {
    title: "Talent",
    links: ["Create a profile", "Discover opportunities", "Applications", "Tasks"],
  },
  {
    title: "Recruiters",
    links: ["Discover talent", "Create a campaign", "Shortlists", "Collaboration"],
  },
  { title: "Company", links: ["About", "Careers", "Contact"] },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface py-12">
      <div className="container-page grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <img src={logo.src} alt="RootIn logo" className="h-7 w-auto" width={42} height={28} />
          <p className="mt-4 max-w-xs text-xs leading-relaxed text-text-muted">
            Connecting talent with opportunities, and recruiters with the right people.
          </p>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-text-muted">
              {col.title}
            </h3>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((link) => (
                <li key={link}>
                  <Link
                    href="#"
                    className="text-xs text-text-secondary transition-colors duration-150 hover:text-foreground"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="container-page mt-10 border-t border-border pt-6">
        <p className="text-[11px] text-text-disabled">© 2026 RootIn. All rights reserved.</p>
      </div>
    </footer>
  );
}
