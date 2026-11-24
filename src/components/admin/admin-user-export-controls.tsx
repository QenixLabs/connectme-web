"use client";

import { useMemo, useState } from "react";
import { Download, FileSpreadsheet, Loader2 } from "lucide-react";
import { adminApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuthStore } from "@/providers/auth-store-provider";

type Role = "talent" | "provider" | "recruiter";
export type UserExportFilters = { search?: string; status?: string; verification_tier?: string; availability?: string; auth_provider?: string; is_email_verified?: string; is_phone_verified?: string; city?: string };

const EXPORT_FIELDS = [
  { label: "User ID", value: "_id", group: "Identity" },
  { label: "Name", value: "display_name", group: "Identity" },
  { label: "Username", value: "username", group: "Identity" },
  { label: "Role", value: "role", group: "Identity" },
  { label: "Email", value: "email", group: "Contact" },
  { label: "Phone", value: "phone", group: "Contact" },
  { label: "Location", value: "location", group: "Profile" },
  { label: "Profile photo URL", value: "profile_photo", group: "Profile" },
  { label: "Professions / specialties", value: "professions", group: "Profile" },
  { label: "Skills", value: "skills", group: "Profile" },
  { label: "Languages", value: "languages", group: "Profile" },
  { label: "Accents", value: "accents", group: "Profile" },
  { label: "Gender", value: "gender", group: "Profile" },
  { label: "Availability", value: "availability", group: "Profile" },
  { label: "Company / business", value: "company_name", group: "Profile" },
  { label: "Company size", value: "company_size", group: "Profile" },
  { label: "Provider type", value: "provider_type", group: "Profile" },
  { label: "Categories / provider type", value: "categories", group: "Profile" },
  { label: "Verification status", value: "verification_status", group: "Profile" },
  { label: "Accepting inquiries", value: "accepting_inquiries", group: "Profile" },
  { label: "Onboarding completed", value: "onboarding_completed", group: "Profile" },
  { label: "Status", value: "status", group: "Account" },
  { label: "Auth provider", value: "auth_provider", group: "Account" },
  { label: "Email verified", value: "is_email_verified", group: "Account" },
  { label: "Phone verified", value: "is_phone_verified", group: "Account" },
  { label: "Verification tier", value: "verification_tier", group: "Account" },
  { label: "Trust score", value: "trust_score", group: "Account" },
  { label: "Report count", value: "report_count", group: "Account" },
  { label: "Warning count", value: "warning_count", group: "Account" },
  { label: "Ban count", value: "ban_count", group: "Account" },
  { label: "Message quota", value: "message_quota", group: "Account" },
  { label: "Campaign quota", value: "campaign_quota", group: "Account" },
  { label: "Created date", value: "created_at", group: "Activity" },
  { label: "Last active date", value: "last_active_at", group: "Activity" },
  { label: "Analytics", value: "analytics", group: "Activity" },
  { label: "Application count", value: "application_count", group: "Applications" },
  { label: "Pending applications", value: "pending_application_count", group: "Applications" },
  { label: "Accepted applications", value: "accepted_application_count", group: "Applications" },
  { label: "Rejected applications", value: "rejected_application_count", group: "Applications" },
  { label: "Subscription", value: "subscription", group: "Billing" },
] as const;

function download(buffer: Blob, role: Role) {
  const url = URL.createObjectURL(buffer);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `rootin-${role}-users.xlsx`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function AdminUserExportControls({ role, filters, selectedIds, visibleIds, total, onFiltersChange, onSelectVisible }: {
  role: Role; filters: UserExportFilters; selectedIds: string[]; visibleIds: string[]; total: number;
  onFiltersChange: (filters: UserExportFilters) => void; onSelectVisible: (checked: boolean) => void;
}) {
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState<"selected" | "filtered" | null>(null);
  const [selectedFields, setSelectedFields] = useState<string[]>(() => EXPORT_FIELDS.map((field) => field.value));
  const groups = useMemo(() => Array.from(new Set(EXPORT_FIELDS.map((field) => field.group))), []);
  const params = { role, ...filters, selected_ids: selectedIds.length ? selectedIds.join(",") : undefined, fields: selectedFields.join(",") };
  const canExport = user?.admin_level === "super_admin" || user?.admin_permissions?.includes("users.export");
  const runExport = async (scope: "selected" | "filtered") => {
    if (scope === "selected" && selectedIds.length === 0) { toast.error("Select at least one user first"); return; }
    if (selectedFields.length === 0) { toast.error("Select at least one data field first"); return; }
    setLoading(scope);
    try { download(await adminApi.exportUsers(scope === "selected" ? params : { role, ...filters, fields: selectedFields.join(",") }), role); toast.success("Excel export downloaded"); }
    catch { toast.error("Could not create the Excel export"); }
    finally { setLoading(null); }
  };

  if (!canExport) return null;

  return <div className="space-y-3 rounded-xl border bg-card p-3">
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Checkbox checked={visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id))} onCheckedChange={(checked) => onSelectVisible(checked === true)} aria-label="Select all visible users" />
        Select visible
      </div>
      <span className="text-sm text-muted-foreground">{selectedIds.length} selected · {total.toLocaleString()} matching</span>
      <div className="ml-auto flex flex-wrap gap-2">
        <Button size="sm" variant="outline" disabled={loading !== null} onClick={() => void runExport("selected")}><FileSpreadsheet className="mr-1.5 size-4" />{loading === "selected" ? <Loader2 className="size-4 animate-spin" /> : "Export selected"}</Button>
        <Button size="sm" disabled={loading !== null} onClick={() => void runExport("filtered")}><Download className="mr-1.5 size-4" />{loading === "filtered" ? <Loader2 className="size-4 animate-spin" /> : "Export all matching"}</Button>
      </div>
    </div>
    <div className="border-t pt-3">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium">Data to include in Excel <span className="font-normal text-muted-foreground">({selectedFields.length}/{EXPORT_FIELDS.length} fields)</span></p>
        <div className="flex gap-2"><Button type="button" variant="ghost" size="sm" onClick={() => setSelectedFields(EXPORT_FIELDS.map((field) => field.value))}>Select all</Button><Button type="button" variant="ghost" size="sm" onClick={() => setSelectedFields([])}>Clear</Button></div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {groups.map((group) => <div key={group} className="space-y-1.5"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{group}</p>{EXPORT_FIELDS.filter((field) => field.group === group).map((field) => <label key={field.value} className="flex items-center gap-2 text-sm"><Checkbox checked={selectedFields.includes(field.value)} onCheckedChange={(checked) => setSelectedFields((current) => checked === true ? Array.from(new Set([...current, field.value])) : current.filter((value) => value !== field.value))} />{field.label}</label>)}</div>)}
      </div>
    </div>
    <div className="flex flex-wrap gap-2 border-t pt-3">
      <Select value={filters.status || "all"} onValueChange={(value) => onFiltersChange({ ...filters, status: value === "all" ? undefined : value })}><SelectTrigger className="w-36" size="sm"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="warning">Warning</SelectItem><SelectItem value="suspended">Suspended</SelectItem><SelectItem value="banned">Banned</SelectItem></SelectContent></Select>
      <Select value={filters.verification_tier || "all"} onValueChange={(value) => onFiltersChange({ ...filters, verification_tier: value === "all" ? undefined : value })}><SelectTrigger className="w-40" size="sm"><SelectValue placeholder="Verification tier" /></SelectTrigger><SelectContent><SelectItem value="all">All tiers</SelectItem><SelectItem value="1">Tier 1</SelectItem><SelectItem value="2">Tier 2</SelectItem><SelectItem value="3">Tier 3</SelectItem></SelectContent></Select>
      <Select value={filters.is_email_verified || "all"} onValueChange={(value) => onFiltersChange({ ...filters, is_email_verified: value === "all" ? undefined : value })}><SelectTrigger className="w-40" size="sm"><SelectValue placeholder="Email verified" /></SelectTrigger><SelectContent><SelectItem value="all">Any email state</SelectItem><SelectItem value="true">Email verified</SelectItem><SelectItem value="false">Email unverified</SelectItem></SelectContent></Select>
      <Select value={filters.is_phone_verified || "all"} onValueChange={(value) => onFiltersChange({ ...filters, is_phone_verified: value === "all" ? undefined : value })}><SelectTrigger className="w-40" size="sm"><SelectValue placeholder="Phone verified" /></SelectTrigger><SelectContent><SelectItem value="all">Any phone state</SelectItem><SelectItem value="true">Phone verified</SelectItem><SelectItem value="false">Phone unverified</SelectItem></SelectContent></Select>
      <Select value={filters.auth_provider || "all"} onValueChange={(value) => onFiltersChange({ ...filters, auth_provider: value === "all" ? undefined : value })}><SelectTrigger className="w-36" size="sm"><SelectValue placeholder="Auth provider" /></SelectTrigger><SelectContent><SelectItem value="all">Any provider</SelectItem><SelectItem value="credentials">Credentials</SelectItem><SelectItem value="google">Google</SelectItem><SelectItem value="linkedin">LinkedIn</SelectItem></SelectContent></Select>
      {role === "talent" && <Select value={filters.availability || "all"} onValueChange={(value) => onFiltersChange({ ...filters, availability: value === "all" ? undefined : value })}><SelectTrigger className="w-36" size="sm"><SelectValue placeholder="Availability" /></SelectTrigger><SelectContent><SelectItem value="all">Any availability</SelectItem><SelectItem value="available">Available</SelectItem><SelectItem value="busy">Busy</SelectItem><SelectItem value="not_available">Not available</SelectItem></SelectContent></Select>}
      <Input className="h-8 w-36" placeholder="City" value={filters.city || ""} onChange={(e) => onFiltersChange({ ...filters, city: e.target.value || undefined })} />
    </div>
  </div>;
}
