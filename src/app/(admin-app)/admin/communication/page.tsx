"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Megaphone, Eye, Pencil, Archive, Send } from "lucide-react";
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
  Communication,
  CommunicationDraft,
  CommunicationKind,
  ContentRole,
} from "@/lib/api/admin-content";
import { getApiErrorMessage } from "@/lib/api/client";
import {
  ContentError,
  ContentLoading,
  ContentPagination,
  contentDate,
} from "@/components/admin/content-shared";
import { safeActionLink } from "@/components/content/formatted-content";

const tabs = {
  notice: "Notices",
  notification: "Notifications",
  announcement: "Announcements",
};
const statuses = [
  "draft",
  "published",
  "sending",
  "sent",
  "failed",
  "archived",
];

function CommunicationPreview({ item }: { item: CommunicationDraft }) {
  const href = safeActionLink(item.action_link);
  return (
    <article className="space-y-3 rounded-lg border bg-muted/20 p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {item.kind}
      </p>
      <h3 className="break-words text-lg font-semibold">
        {item.title || "Untitled"}
      </h3>
      <p className="whitespace-pre-wrap break-words text-sm leading-6">
        {item.message || "No message yet."}
      </p>
      {href && (
        <a
          className="text-sm text-primary underline"
          href={href}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open action link ↗
        </a>
      )}
      <p className="border-t pt-3 text-xs text-muted-foreground">
        Audience: {item.audience.join(", ") || "Select at least one role"}
      </p>
    </article>
  );
}

function Editor({
  kind,
  item,
  roles,
  close,
  saved,
}: {
  kind: CommunicationKind;
  item?: Communication;
  roles: ContentRole[];
  close: () => void;
  saved: () => void;
}) {
  const editing = item?.status === "draft" ? item : undefined;
  const [draft, setDraft] = useState<CommunicationDraft>({
    kind,
    title: item?.title || "",
    message: item?.message || "",
    audience: item?.audience || [],
    action_link: item?.action_link || "",
  });
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState("");
  const mutation = useMutation({
    mutationFn: () => adminContentApi.save(draft, editing),
    onSuccess: () => {
      toast.success("Draft saved.");
      saved();
      close();
    },
    onError: (err) =>
      setError(getApiErrorMessage(err, "Could not save draft.")),
  });
  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!draft.title.trim() || !draft.message.trim())
      return setError("Title and message are required.");
    if (!draft.audience.length)
      return setError("Select at least one audience role.");
    if (draft.action_link && !safeActionLink(draft.action_link))
      return setError("Use an internal path or valid HTTPS URL.");
    setError("");
    mutation.mutate();
  }
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !mutation.isPending) close();
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit draft" : "Create draft"}</DialogTitle>
          <DialogDescription>
            {item && !editing
              ? "Create a new draft from this item. Review its audience before publishing."
              : "Save a draft, then preview and confirm its audience before publishing."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <fieldset disabled={mutation.isPending} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="communication-title">Title</Label>
              <Input
                id="communication-title"
                required
                maxLength={160}
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="communication-message">Message</Label>
              <Textarea
                id="communication-message"
                required
                maxLength={10000}
                rows={8}
                value={draft.message}
                onChange={(e) =>
                  setDraft({ ...draft, message: e.target.value })
                }
              />
            </div>
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">Audience roles</legend>
              <div className="flex flex-wrap gap-4">
                {roles.map((role) => (
                  <label
                    key={role}
                    className="flex items-center gap-2 text-sm capitalize"
                  >
                    <input
                      type="checkbox"
                      checked={draft.audience.includes(role)}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          audience: e.target.checked
                            ? [...draft.audience, role]
                            : draft.audience.filter((r) => r !== role),
                        })
                      }
                    />
                    {role}
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="space-y-2">
              <Label htmlFor="communication-link">Action link (optional)</Label>
              <Input
                id="communication-link"
                maxLength={2048}
                placeholder="/talent/dashboard or https://…"
                value={draft.action_link}
                onChange={(e) =>
                  setDraft({ ...draft, action_link: e.target.value })
                }
              />
            </div>
          </fieldset>
          {preview && <CommunicationPreview item={draft} />}
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              disabled={mutation.isPending}
              onClick={close}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPreview(!preview)}
            >
              <Eye className="size-4" />
              {preview ? "Hide preview" : "Preview"}
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving…" : "Save draft"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function PublishDialog({
  item,
  close,
  saved,
}: {
  item: Communication;
  close: () => void;
  saved: () => void;
}) {
  const audience = useQuery({
    queryKey: ["communication-audience", item._id, item.revision],
    queryFn: () => adminContentApi.audience(item._id),
    staleTime: 0,
  });
  const mutation = useMutation({
    mutationFn: () => {
      if (!audience.data || audience.data.revision !== item.revision)
        throw new Error("Item changed. Close and reload before confirming.");
      return adminContentApi.publish(item, audience.data);
    },
    onSuccess: () => {
      toast.success(
        item.kind === "notification"
          ? "Delivery queued. Progress updates automatically."
          : "Published.",
      );
      saved();
      close();
    },
  });
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !mutation.isPending) close();
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {item.kind === "notification"
              ? item.status === "failed"
                ? "Retry notification delivery?"
                : "Send notification?"
              : "Publish this item?"}
          </DialogTitle>
          <DialogDescription>
            Review the saved content and selected audience.
          </DialogDescription>
        </DialogHeader>
        <CommunicationPreview item={item} />
        {audience.isPending ? (
          <ContentLoading />
        ) : audience.error ? (
          <ContentError
            error={audience.error}
            retry={() => void audience.refetch()}
          />
        ) : (
          audience.data && (
            <div className="rounded-lg bg-primary/5 p-4 text-sm">
              <p className="font-semibold">
                Audience: {audience.data.audience.join(", ")}
              </p>
              <p>{audience.data.count} active accounts currently match.</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {item.kind === "notification"
                  ? audience.data.note
                  : "Visible to signed-in users in these roles, including future accounts, until archived."}
              </p>
              {item.kind === "notification" && (
                <p className="mt-2 text-xs">
                  User notification preferences apply. Delivered notifications
                  cannot be recalled. Retries resume the same send.
                </p>
              )}
            </div>
          )
        )}
        {mutation.error && (
          <p role="alert" className="text-sm text-destructive">
            {getApiErrorMessage(mutation.error, "Could not publish.")}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            disabled={mutation.isPending}
            onClick={close}
          >
            Cancel
          </Button>
          <Button
            disabled={
              !audience.data || audience.isFetching || mutation.isPending
            }
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending
              ? "Submitting…"
              : item.kind === "notification"
                ? "Confirm send"
                : "Confirm publication"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function CommunicationPage() {
  const client = useQueryClient();
  const [kind, setKind] = useState<CommunicationKind>("notice");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);
  const [editor, setEditor] = useState<{ item?: Communication } | null>(null);
  const [preview, setPreview] = useState<Communication | null>(null);
  const [publish, setPublish] = useState<Communication | null>(null);
  const [archive, setArchive] = useState<Communication | null>(null);
  const roles = useQuery({
    queryKey: ["content-roles"],
    queryFn: adminContentApi.roles,
  });
  const list = useQuery({
    queryKey: ["admin-communications", kind, search, status, role, page],
    queryFn: () =>
      adminContentApi.list({
        kind,
        search: search || undefined,
        status: status || undefined,
        audience: role || undefined,
        page,
      }),
    refetchInterval: 10000,
  });
  const refresh = () => {
    void client.invalidateQueries({ queryKey: ["admin-communications"] });
    void client.invalidateQueries({ queryKey: ["communications-feed"] });
  };
  const archiving = useMutation({
    mutationFn: () => adminContentApi.archive(archive!),
    onSuccess: () => {
      toast.success("Archived.");
      setArchive(null);
      refresh();
    },
  });
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Communication
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage audience-specific updates and in-app notifications.
          </p>
        </div>
        <Button disabled={!roles.data} onClick={() => setEditor({})}>
          <Plus className="size-4" />
          Create {kind}
        </Button>
      </header>
      <Tabs
        value={kind}
        onValueChange={(value) => {
          setKind(value as CommunicationKind);
          setPage(1);
          setStatus("");
        }}
      >
        <TabsList className="h-auto flex-wrap">
          {Object.entries(tabs).map(([value, label]) => (
            <TabsTrigger key={value} value={value}>
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <Input
          aria-label="Search communications"
          placeholder="Search title or message…"
          value={search}
          maxLength={160}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <select
          aria-label="Filter status"
          className="rounded-md border bg-background px-3 py-2 text-sm"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter audience"
          className="rounded-md border bg-background px-3 py-2 text-sm"
          value={role}
          onChange={(e) => {
            setRole(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All audiences</option>
          {roles.data?.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>
      {roles.error && (
        <ContentError error={roles.error} retry={() => void roles.refetch()} />
      )}
      {list.isPending ? (
        <ContentLoading />
      ) : list.error ? (
        <ContentError error={list.error} retry={() => void list.refetch()} />
      ) : (
        list.data && (
          <>
            {!list.data.items.length ? (
              <div className="rounded-xl border border-dashed p-12 text-center">
                <Megaphone className="mx-auto mb-3 size-8 text-muted-foreground" />
                <h2 className="font-medium">
                  No {tabs[kind].toLowerCase()} found
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Create a draft or adjust the filters to see more items.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {list.data.items.map((item) => (
                  <article
                    key={item._id}
                    className="rounded-lg border p-4 sm:p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="break-words font-semibold">
                            {item.title}
                          </h2>
                          <Badge
                            variant={
                              item.status === "failed"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {item.status}
                          </Badge>
                        </div>
                        <p className="mt-2 line-clamp-2 whitespace-pre-wrap break-words text-sm text-muted-foreground">
                          {item.message}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
                      <span>Audience: {item.audience.join(", ")}</span>
                      <span>Created: {contentDate(item.created_at)}</span>
                      {item.published_at && (
                        <span>Published: {contentDate(item.published_at)}</span>
                      )}
                      {item.sent_at && (
                        <span>Sent: {contentDate(item.sent_at)}</span>
                      )}
                      {item.queued_at && (
                        <span>
                          Delivered: {item.delivered} · Queued:{" "}
                          {contentDate(item.queued_at)}
                        </span>
                      )}
                    </div>
                    {item.last_error && item.status === "failed" && (
                      <p className="mt-2 text-sm text-destructive">
                        {item.last_error}
                      </p>
                    )}
                    {!!item.suppressed && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Skipped by notification preferences: {item.suppressed}
                      </p>
                    )}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPreview(item)}
                      >
                        <Eye className="size-3.5" />
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={!roles.data}
                        onClick={() => setEditor({ item })}
                      >
                        <Pencil className="size-3.5" />
                        {item.status === "draft" ? "Edit" : "Copy to draft"}
                      </Button>
                      {["draft", "failed"].includes(item.status) && (
                        <Button size="sm" onClick={() => setPublish(item)}>
                          <Send className="size-3.5" />
                          {item.kind === "notification"
                            ? item.status === "failed"
                              ? "Retry send"
                              : "Send"
                            : "Publish"}
                        </Button>
                      )}
                      {!["archived", "sending"].includes(item.status) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            archiving.reset();
                            setArchive(item);
                          }}
                        >
                          <Archive className="size-3.5" />
                          Archive
                        </Button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
            <ContentPagination
              page={page}
              pages={list.data.total_pages}
              total={list.data.total}
              onChange={setPage}
            />
          </>
        )
      )}
      {editor && (
        <Editor
          kind={kind}
          item={editor.item}
          roles={roles.data || []}
          close={() => setEditor(null)}
          saved={refresh}
        />
      )}
      {publish && (
        <PublishDialog
          item={publish}
          close={() => setPublish(null)}
          saved={refresh}
        />
      )}
      <Dialog
        open={!!preview}
        onOpenChange={(open) => {
          if (!open) setPreview(null);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preview</DialogTitle>
            <DialogDescription>Saved content and audience.</DialogDescription>
          </DialogHeader>
          {preview && <CommunicationPreview item={preview} />}
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!archive}
        onOpenChange={(open) => {
          if (!open && !archiving.isPending) setArchive(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archive this item?</DialogTitle>
            <DialogDescription>
              “{archive?.title}” will leave user-facing notice and announcement
              areas. Notifications already delivered remain in recipients’
              inboxes.
            </DialogDescription>
          </DialogHeader>
          {archiving.error && (
            <p role="alert" className="text-sm text-destructive">
              {getApiErrorMessage(archiving.error, "Could not archive.")}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              disabled={archiving.isPending}
              onClick={() => setArchive(null)}
            >
              Cancel
            </Button>
            <Button
              disabled={archiving.isPending}
              onClick={() => archiving.mutate()}
            >
              {archiving.isPending ? "Archiving…" : "Archive"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
