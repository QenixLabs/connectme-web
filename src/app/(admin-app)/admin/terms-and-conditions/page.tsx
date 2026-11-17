"use client";

import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Save, ShieldCheck, History } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  adminContentApi,
  ContentTeamRole,
  LegalContent,
  LegalDocument,
  LegalKey,
  LegalVersion,
  PermissionModel,
  PlatformSettings,
} from "@/lib/api/admin-content";
import { getApiErrorMessage } from "@/lib/api/client";
import {
  ContentError,
  ContentLoading,
  contentDate,
} from "@/components/admin/content-shared";
import { FormattedContent } from "@/components/content/formatted-content";

function LegalPreview({ value }: { value: LegalContent }) {
  return (
    <article className="space-y-4 rounded-lg border p-5">
      <h2 className="break-words text-xl font-semibold">
        {value.title || "Untitled document"}
      </h2>
      <p className="text-xs text-muted-foreground">
        Effective:{" "}
        {value.effective_at
          ? contentDate(value.effective_at)
          : "Choose an effective date"}
      </p>
      <FormattedContent content={value.content} />
    </article>
  );
}

function LegalEditor({ document }: { document: LegalDocument }) {
  const client = useQueryClient();
  const initial = document.draft || document.versions.at(-1);
  const [title, setTitle] = useState(initial?.title || "");
  const [content, setContent] = useState(initial?.content || "");
  const [date, setDate] = useState(initial?.effective_at.slice(0, 10) || "");
  const [preview, setPreview] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [history, setHistory] = useState<LegalVersion | null>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const effective_at = date ? `${date}T00:00:00.000Z` : "";
  const draft = { title, content, effective_at };
  const dirty =
    !document.draft ||
    title !== document.draft.title ||
    content !== document.draft.content ||
    date !== document.draft.effective_at.slice(0, 10);
  const save = useMutation({
    mutationFn: () =>
      adminContentApi.saveLegal(document.key, document.revision, draft),
    onSuccess: (result) => {
      client.setQueryData(["legal-admin", document.key], result);
      toast.success("Draft saved.");
    },
  });
  const publish = useMutation({
    mutationFn: () =>
      adminContentApi.publishLegal(document.key, document.revision),
    onSuccess: (result) => {
      client.setQueryData(["legal-admin", document.key], result);
      void client.invalidateQueries({
        queryKey: ["legal-public", document.key],
      });
      toast.success(
        "Version published. It becomes public on its effective date.",
      );
    },
  });
  function format(before: string, after = "") {
    const field = textarea.current;
    if (!field) return;
    const start = field.selectionStart,
      end = field.selectionEnd;
    setContent(
      content.slice(0, start) +
        before +
        content.slice(start, end) +
        after +
        content.slice(end),
    );
    field.focus();
  }
  const busy = save.isPending || publish.isPending;
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
      <section className="min-w-0 space-y-5 rounded-lg border p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold">
            {document.key === "terms" ? "Terms & Conditions" : "Privacy Policy"}
          </h2>
          <Badge variant="secondary">
            {document.draft
              ? "Draft saved"
              : document.versions.length
                ? "Published history available"
                : "Not published"}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Supply approved content. Drafts remain private. Published versions are
          immutable; edit a new draft to make changes.
        </p>
        <a
          href={document.key === "terms" ? "/terms" : "/privacy"}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-sm text-primary underline"
        >
          View public page ↗
        </a>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate();
          }}
        >
          <fieldset disabled={busy} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="legal-title">Document title</Label>
              <Input
                id="legal-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={160}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="legal-date">Effective date (00:00 UTC)</Label>
              <Input
                id="legal-date"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="legal-content">Formatted content</Label>
              <div
                role="toolbar"
                aria-label="Content formatting"
                className="flex flex-wrap gap-1 rounded-md border p-1"
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => format("## ")}
                >
                  Heading
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => format("**", "**")}
                >
                  <strong>Bold</strong>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => format("*", "*")}
                >
                  <em>Italic</em>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => format("- ")}
                >
                  Bullet
                </Button>
              </div>
              <Textarea
                ref={textarea}
                id="legal-content"
                className="min-h-80 font-mono text-sm"
                required
                maxLength={50000}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                aria-describedby="format-help"
              />
              <p id="format-help" className="text-xs text-muted-foreground">
                Markdown: # / ## / ### headings, **bold**, *italic*, and -
                bullet lists. HTML is displayed as text.
              </p>
            </div>
          </fieldset>
          {save.error && (
            <p role="alert" className="text-sm text-destructive">
              {getApiErrorMessage(save.error, "Could not save draft.")}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <Button
              type="submit"
              disabled={busy || !title.trim() || !content.trim()}
            >
              <Save className="size-4" />
              {save.isPending ? "Saving…" : "Save draft"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPreview(!preview)}
            >
              <Eye className="size-4" />
              {preview ? "Hide preview" : "Preview"}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={busy || dirty}
              onClick={() => setConfirm(true)}
            >
              Publish saved draft
            </Button>
          </div>
          {dirty && (
            <p className="text-xs text-muted-foreground">
              Save this draft before publishing.
            </p>
          )}
        </form>
        {preview && <LegalPreview value={draft} />}
      </section>
      <aside className="space-y-3">
        <h2 className="flex items-center gap-2 font-semibold">
          <History className="size-4" />
          Version history
        </h2>
        {!document.versions.length ? (
          <p className="rounded-lg border border-dashed p-5 text-sm text-muted-foreground">
            No published versions. Approved legal wording and effective dates
            are required.
          </p>
        ) : (
          [...document.versions].reverse().map((version) => (
            <button
              key={version.version}
              className="w-full space-y-2 rounded-lg border p-4 text-left hover:bg-muted/30"
              onClick={() => setHistory(version)}
            >
              <span className="font-medium">Version {version.version}</span>
              <span className="block text-xs text-muted-foreground">
                Effective: {contentDate(version.effective_at)}
                <br />
                Published: {contentDate(version.published_at)}
              </span>
              <span className="block text-xs text-primary">
                Preview version
              </span>
            </button>
          ))
        )}
      </aside>
      <Dialog
        open={confirm}
        onOpenChange={(open) => {
          if (!publish.isPending) setConfirm(open);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Publish saved version?</DialogTitle>
            <DialogDescription>
              This content becomes public at its effective date. Existing
              versions remain in history. The most recent effective date takes
              precedence.
            </DialogDescription>
          </DialogHeader>
          {document.draft && <LegalPreview value={document.draft} />}
          {publish.error && (
            <p role="alert" className="text-sm text-destructive">
              {getApiErrorMessage(publish.error, "Could not publish.")}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              disabled={publish.isPending}
              onClick={() => setConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              disabled={publish.isPending}
              onClick={() => publish.mutate()}
            >
              {publish.isPending ? "Publishing…" : "Confirm publication"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!history}
        onOpenChange={(open) => {
          if (!open) setHistory(null);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Version {history?.version}</DialogTitle>
            <DialogDescription>
              Published {contentDate(history?.published_at)}. Historical
              versions cannot be edited.
            </DialogDescription>
          </DialogHeader>
          {history && <LegalPreview value={history} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function LegalPanel({ documentKey }: { documentKey: LegalKey }) {
  const query = useQuery({
    queryKey: ["legal-admin", documentKey],
    queryFn: () => adminContentApi.legal(documentKey),
  });
  if (query.isPending) return <ContentLoading />;
  if (query.error)
    return (
      <ContentError error={query.error} retry={() => void query.refetch()} />
    );
  return (
    query.data && (
      <LegalEditor
        key={`${documentKey}-${query.data.revision}`}
        document={query.data}
      />
    )
  );
}

function SettingsForm({
  settings,
  rules,
}: {
  settings: PlatformSettings;
  rules: boolean;
}) {
  const client = useQueryClient();
  const [enabled, setEnabled] = useState(settings.renewal_reminders_enabled);
  const [days, setDays] = useState(String(settings.renewal_reminder_days));
  const mutation = useMutation({
    mutationFn: () =>
      rules
        ? adminContentApi.rule(settings.revision, enabled)
        : adminContentApi.configure(settings.revision, Number(days)),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["platform-settings"] });
      toast.success(rules ? "Rule updated." : "Configuration saved.");
    },
  });
  return (
    <form
      className="max-w-2xl space-y-5 rounded-lg border p-6"
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate();
      }}
    >
      <div>
        <h2 className="font-semibold">
          {rules ? "Subscription renewal reminders" : "Renewal reminder window"}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {rules
            ? "Enable or disable the existing daily job that sends upcoming-renewal notifications to active and trialing subscribers. Existing reminders are not recalled."
            : "Number of days before a subscription ends during which the daily renewal job can send a reminder. Applied on the next job run."}
        </p>
      </div>
      {rules ? (
        <label className="flex items-center gap-3 text-sm font-medium">
          <input
            type="checkbox"
            checked={enabled}
            disabled={mutation.isPending}
            onChange={(e) => setEnabled(e.target.checked)}
          />
          {enabled ? "Enabled" : "Disabled"}
        </label>
      ) : (
        <div className="max-w-xs space-y-2">
          <Label htmlFor="reminder-days">Days before renewal (1–30)</Label>
          <Input
            id="reminder-days"
            type="number"
            min={1}
            max={30}
            step={1}
            required
            value={days}
            disabled={mutation.isPending}
            onChange={(e) => setDays(e.target.value)}
          />
          {!settings.renewal_reminders_enabled && (
            <p className="text-xs text-muted-foreground">
              Reminders are currently disabled in Rules.
            </p>
          )}
        </div>
      )}
      {mutation.error && (
        <p role="alert" className="text-sm text-destructive">
          {getApiErrorMessage(mutation.error, "Could not save settings.")}
        </p>
      )}
      <Button disabled={mutation.isPending}>
        {mutation.isPending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}

function SettingsPanel({ rules }: { rules: boolean }) {
  const query = useQuery({
    queryKey: ["platform-settings"],
    queryFn: adminContentApi.settings,
  });
  if (query.isPending) return <ContentLoading />;
  if (query.error)
    return (
      <ContentError error={query.error} retry={() => void query.refetch()} />
    );
  return (
    query.data && (
      <SettingsForm
        key={`${rules}-${query.data.revision}`}
        settings={query.data}
        rules={rules}
      />
    )
  );
}

function RoleEditor({
  role,
  model,
}: {
  role: ContentTeamRole;
  model: PermissionModel;
}) {
  const client = useQueryClient();
  const [permissions, setPermissions] = useState(role.permissions);
  const protectedRole = ["OWNER", "ADMIN"].includes(role.code);
  const mutation = useMutation({
    mutationFn: () => adminContentApi.savePermissions(role, permissions),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["content-permissions"] });
      toast.success(
        "Permissions updated. Server checks apply on the next request.",
      );
    },
  });
  return (
    <form
      className="space-y-5 rounded-lg border p-5"
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate();
      }}
    >
      <header>
        <h3 className="font-semibold">{role.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{role.description}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          {role.is_system
            ? "Shared system role · changes affect all teams using this role."
            : `Company-scoped role · ${role.company_id}`}
        </p>
      </header>
      {protectedRole && (
        <p className="flex gap-2 rounded-md bg-muted p-3 text-sm">
          <ShieldCheck className="size-5 shrink-0" />
          Owner and administrator permissions are protected to preserve access.
        </p>
      )}
      <fieldset
        disabled={protectedRole || mutation.isPending}
        className="grid gap-5 sm:grid-cols-2"
      >
        {model.groups.map((group) => (
          <fieldset key={group.key} className="space-y-2">
            <legend className="mb-2 text-sm font-semibold">
              {group.label}
            </legend>
            {group.permissions.map((permission) => (
              <label
                key={permission}
                className="flex items-start gap-2 break-all text-xs"
              >
                <input
                  type="checkbox"
                  checked={permissions.includes(permission)}
                  onChange={(e) =>
                    setPermissions(
                      e.target.checked
                        ? [...permissions, permission]
                        : permissions.filter((p) => p !== permission),
                    )
                  }
                />
                {permission}
              </label>
            ))}
          </fieldset>
        ))}
      </fieldset>
      {mutation.error && (
        <p role="alert" className="text-sm text-destructive">
          {getApiErrorMessage(mutation.error, "Could not update permissions.")}
        </p>
      )}
      {!protectedRole && (
        <Button disabled={mutation.isPending}>
          {mutation.isPending ? "Saving…" : "Save permissions"}
        </Button>
      )}
    </form>
  );
}

function PermissionsPanel() {
  const query = useQuery({
    queryKey: ["content-permissions"],
    queryFn: adminContentApi.permissions,
  });
  const [selected, setSelected] = useState("");
  const [search, setSearch] = useState("");
  if (query.isPending) return <ContentLoading />;
  if (query.error)
    return (
      <ContentError error={query.error} retry={() => void query.refetch()} />
    );
  const model = query.data;
  if (!model) return null;
  const role = model.roles.find((r) => r._id === selected);
  return (
    <div className="space-y-5">
      <section className="space-y-3 rounded-lg border bg-muted/20 p-5">
        <h2 className="font-semibold">Existing access model</h2>
        <div className="flex flex-wrap gap-2">
          {model.platform_roles.map((r) => (
            <Badge variant="outline" key={r}>
              {r}
            </Badge>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          {model.platform_admin_access} Team permissions below are enforced
          through the existing team permission guard.
        </p>
      </section>
      <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="space-y-3">
          <Input
            aria-label="Search roles"
            placeholder="Search team roles…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="max-h-[65vh] space-y-2 overflow-y-auto">
            {model.roles
              .filter((r) =>
                `${r.name} ${r.company_id || ""}`
                  .toLowerCase()
                  .includes(search.toLowerCase()),
              )
              .map((r) => (
                <button
                  key={r._id}
                  className={`w-full rounded-lg border p-3 text-left text-sm ${selected === r._id ? "border-primary bg-primary/5" : "hover:bg-muted/30"}`}
                  onClick={() => setSelected(r._id)}
                >
                  <span className="font-medium">{r.name}</span>
                  <span className="mt-1 block break-all text-xs text-muted-foreground">
                    {r.is_system ? "System role" : r.company_id}
                  </span>
                </button>
              ))}
          </div>
          {!model.roles.length && (
            <p className="text-sm text-muted-foreground">
              No team roles available.
            </p>
          )}
        </aside>
        {role ? (
          <RoleEditor
            key={`${role._id}-${role.permissions.join(",")}`}
            role={role}
            model={model}
          />
        ) : (
          <div className="grid min-h-64 place-items-center rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
            Select a team role to view its permissions.
          </div>
        )}
      </div>
    </div>
  );
}

export default function TermsAndConditionsPage() {
  const [tab, setTab] = useState("terms");
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">
          Terms &amp; Conditions
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage published documents, platform behavior, and existing role
          permissions.
        </p>
      </header>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="h-auto flex-wrap justify-start">
          {[
            ["terms", "Terms & Conditions"],
            ["rules", "Rules"],
            ["permissions", "Permissions"],
            ["configuration", "Configuration"],
            ["policies", "Policies"],
          ].map(([value, label]) => (
            <TabsTrigger key={value} value={value}>
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      {tab === "terms" && <LegalPanel documentKey="terms" />}
      {tab === "policies" && <LegalPanel documentKey="privacy" />}
      {tab === "rules" && <SettingsPanel rules />}
      {tab === "configuration" && <SettingsPanel rules={false} />}
      {tab === "permissions" && <PermissionsPanel />}
      <p className="text-xs text-muted-foreground">
        Business decisions required: approved terms and privacy wording,
        effective dates, and any additional platform rules or policies.
      </p>
    </div>
  );
}
