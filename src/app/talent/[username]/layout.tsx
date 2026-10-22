/**
 * Layout for public talent profile pages.
 *
 * Metadata is intentionally **not** exported here. The page-level
 * `generateMetadata` in `page.tsx` produces dynamic, per-profile Open Graph
 * and Twitter card tags. A static `metadata` export in the layout would merge
 * with the page metadata and could override the dynamic title, description and
 * images with stale fallback values — breaking the social preview for every
 * profile.
 *
 * Next.js merges metadata bottom-up (layout → page), and the page's dynamic
 * metadata already supplies every field a crawler needs.
 */

export default async function PublicTalentProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#F7F8FC]">
      <main className="flex-1">{children}</main>
    </div>
  );
}
