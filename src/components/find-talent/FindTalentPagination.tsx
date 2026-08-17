import { ChevronLeft, ChevronRight } from "lucide-react";

interface FindTalentPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function PageButton({
  children,
  onClick,
  disabled,
  active,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={`grid size-10 place-items-center rounded-xl text-sm font-medium transition-all active:scale-[0.96] ${
        active
           ? "bg-primary font-semibold text-primary-foreground shadow-button"
          : "border border-border bg-surface/60 text-muted-foreground hover:border-border-hover hover:bg-surface hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
      }`}
    >
      {children}
    </button>
  );
}

export function FindTalentPagination({
  currentPage,
  totalPages,
  onPageChange,
}: FindTalentPaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | "...")[] = [];
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <nav
      aria-label="Pagination"
      className="mt-10 flex items-center justify-center gap-2 text-sm"
    >
      <PageButton
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        label="Previous page"
      >
        <ChevronLeft className="size-4" />
      </PageButton>
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className="px-1 text-muted-foreground">
            ...
          </span>
        ) : (
          <PageButton
            key={p}
            onClick={() => onPageChange(p)}
            active={p === currentPage}
            label={`Page ${p}`}
          >
            {p}
          </PageButton>
        ),
      )}
      <PageButton
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        label="Next page"
      >
        <ChevronRight className="size-4" />
      </PageButton>
    </nav>
  );
}
