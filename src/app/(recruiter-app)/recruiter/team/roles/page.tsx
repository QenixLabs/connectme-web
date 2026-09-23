"use client";

import { Fragment, useState } from "react";
import {
  Copy,
  Edit3,
  KeyRound,
  LockKeyhole,
  Plus,
  ScrollText,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useCreateRole,
  useDeleteRole,
  usePermissionMatrix,
  useTeamAuditLogs,
  useTeamPermissions,
  useTeamRoles,
  useUpdateRole,
} from "@/hooks/use-team";
import type { TeamRole } from "@/lib/api/team";

function labelForPermission(permission: string) {
  return permission
    .split(".")[1]
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function RoleForm({
  open,
  onOpenChange,
  role,
  permissions,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role?: TeamRole | null;
  permissions: string[];
}) {
  const create = useCreateRole();
  const update = useUpdateRole();
  const [name, setName] = useState(role?.name || "");
  const [description, setDescription] = useState(role?.description || "");
  const [selected, setSelected] = useState<string[]>(role?.permissions || []);
  const isEdit = Boolean(role?.id && role.code !== "OWNER");
  const submit = async () => {
    try {
      if (isEdit && role)
        await update.mutateAsync({
          id: role.id,
          payload: { name, description, permissions: selected },
        });
      else
        await create.mutateAsync({ name, description, permissions: selected });
      toast.success(isEdit ? "Role updated" : "Custom role created");
      onOpenChange(false);
    } catch (error) {
      const value = error as { response?: { data?: { message?: string } } };
      toast.error(value.response?.data?.message || "Could not save role");
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit role" : "Create custom role"}
          </DialogTitle>
          <DialogDescription>
            Give this role only the access it needs. Permissions are enforced by
            the server.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold">
              Role name
            </label>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Talent Coordinator"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold">
              Description
            </label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="What this role is responsible for"
            />
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold">Permissions</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {permissions.map((permission) => (
                <label
                  key={permission}
                  className="flex min-h-11 items-center gap-2 rounded-lg border border-border px-3 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(permission)}
                    onChange={(event) =>
                      setSelected((current) =>
                        event.target.checked
                          ? [...current, permission]
                          : current.filter((item) => item !== permission),
                      )
                    }
                    className="size-4 accent-primary"
                  />
                  {labelForPermission(permission)}
                </label>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => void submit()}
            disabled={!name.trim() || create.isPending || update.isPending}
          >
            {create.isPending || update.isPending ? "Saving..." : "Save role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function TeamRolesPage() {
  const { data: roles = [], isLoading: loadingRoles } = useTeamRoles();
  const { data: permissions } = useTeamPermissions();
  const { data: matrix, isLoading: loadingMatrix } = usePermissionMatrix();
  const { data: audit } = useTeamAuditLogs();
  const remove = useDeleteRole();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TeamRole | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TeamRole | null>(null);
  const [replacement, setReplacement] = useState("");
  const [updatingCell, setUpdatingCell] = useState<string | null>(null);
  const [optimisticPermissions, setOptimisticPermissions] = useState<
    Record<string, boolean>
  >({});
  const updateRole = useUpdateRole();
  const customRoles = roles.filter((role) => !role.is_system);
  const allPermissions = permissions?.permissions || matrix?.permissions || [];
  const groups = permissions?.groups || matrix?.groups || [];
  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (role: TeamRole) => {
    setEditing(role);
    setFormOpen(true);
  };
  const duplicate = async (role: TeamRole) => {
    setEditing({ ...role, id: "", name: `${role.name} copy`, is_system: true });
    setFormOpen(true);
  };
  const deleteRole = async () => {
    if (!deleteTarget) return;
    try {
      await remove.mutateAsync({
        id: deleteTarget.id,
        replacementRoleId: replacement || undefined,
      });
      setDeleteTarget(null);
      setReplacement("");
      toast.success("Role deleted");
    } catch (error) {
      const value = error as { response?: { data?: { message?: string } } };
      toast.error(value.response?.data?.message || "Could not delete role");
    }
  };
  const isPermissionEnabled = (role: TeamRole, permission: string) =>
    optimisticPermissions[`${role.id}-${permission}`] ??
    role.permissions.includes(permission);
  const toggleMatrixPermission = async (role: TeamRole, permission: string) => {
    if (role.code === "OWNER") return;
    const key = `${role.id}-${permission}`;
    const nextValue = !isPermissionEnabled(role, permission);
    setUpdatingCell(key);
    setOptimisticPermissions((current) => ({ ...current, [key]: nextValue }));
    try {
      const rolePermissions = isPermissionEnabled(role, permission)
        ? role.permissions.filter((item) => item !== permission)
        : [...role.permissions, permission];
      await updateRole.mutateAsync({
        id: role.id,
        payload: { permissions: rolePermissions },
      });
    } catch (error) {
      setOptimisticPermissions((current) => {
        const next = { ...current };
        delete next[key];
        return next;
      });
      const value = error as { response?: { data?: { message?: string } } };
      toast.error(
        value.response?.data?.message || "Could not update permission",
      );
    } finally {
      setUpdatingCell(null);
    }
  };

  if (loadingRoles)
    return (
      <div className="campaigns-theme min-h-screen bg-background">
        <main className="container-page space-y-5 py-8">
          <Skeleton className="h-12 w-72" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </main>
      </div>
    );
  return (
    <div className="campaigns-theme min-h-screen bg-background">
      <main className="container-page max-w-7xl py-5 pb-10 sm:py-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
              Team governance
            </p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
              Roles & permissions
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Set clear access boundaries for every person in your agency.
            </p>
          </div>
          <Button className="min-h-11" onClick={openCreate}>
            <Plus className="size-4" />
            Create custom role
          </Button>
        </header>
        <Tabs defaultValue="roles" className="mt-6">
          <TabsList className="w-full justify-start overflow-x-auto rounded-xl bg-card p-1 sm:w-fit">
            <TabsTrigger value="roles" className="min-h-10">
              Roles
            </TabsTrigger>
            <TabsTrigger value="matrix" className="min-h-10">
              Matrix
            </TabsTrigger>
            <TabsTrigger value="custom" className="min-h-10">
              Custom roles
            </TabsTrigger>
            <TabsTrigger value="logs" className="min-h-10">
              Access logs
            </TabsTrigger>
          </TabsList>
          <TabsContent value="roles" className="mt-5">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {roles.map((role) => (
                <article
                  key={role.id}
                  className="rounded-2xl border border-border bg-card p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                        {role.code === "OWNER" ? (
                          <LockKeyhole className="size-5" />
                        ) : (
                          <KeyRound className="size-5" />
                        )}
                      </span>
                      <div className="min-w-0">
                        <h2 className="truncate font-bold">{role.name}</h2>
                        <p className="text-xs text-muted-foreground">
                          {role.member_count} member
                          {role.member_count === 1 ? "" : "s"}
                        </p>
                      </div>
                    </div>
                    {role.is_system && role.code === "OWNER" ? (
                      <span className="rounded-full bg-muted px-2 py-1 text-[10px] font-bold text-muted-foreground">
                        Protected
                      </span>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-9"
                        onClick={() => openEdit(role)}
                        aria-label={`Edit ${role.name}`}
                      >
                        <Edit3 className="size-4" />
                      </Button>
                    )}
                  </div>
                  <p className="mt-4 min-h-10 text-sm text-muted-foreground">
                    {role.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {role.permissions.slice(0, 4).map((permission) => (
                      <span
                        key={permission}
                        className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-semibold text-primary"
                      >
                        {labelForPermission(permission)}
                      </span>
                    ))}
                    {role.permissions.length > 4 && (
                      <span className="rounded-full bg-muted px-2 py-1 text-[10px] font-semibold text-muted-foreground">
                        +{role.permissions.length - 4} more
                      </span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="matrix" className="mt-5">
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="flex items-center gap-2 border-b border-border p-4">
                <ShieldCheck className="size-5 text-primary" />
                <div>
                  <h2 className="font-bold">Permission matrix</h2>
                  <p className="text-xs text-muted-foreground">
                    Toggle any permission for each role. Owner access is
                    protected.
                  </p>
                </div>
              </div>
              {loadingMatrix ? (
                <div className="space-y-3 p-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-[720px] w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/40">
                        <th className="sticky left-0 z-10 min-w-48 bg-muted/40 px-4 py-3 font-bold">
                          Permission
                        </th>
                        {matrix?.roles.map((role) => (
                          <th
                            key={role.id}
                            className="min-w-28 px-3 py-3 text-center font-bold"
                          >
                            {role.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {groups.map((group) => (
                        <Fragment key={group.key}>
                          {
                            <tr
                              key={`${group.key}-heading`}
                              className="bg-primary/5"
                            >
                              <td
                                colSpan={(matrix?.roles.length || 0) + 1}
                                className="px-4 py-2 text-xs font-extrabold uppercase tracking-wide text-primary"
                              >
                                {group.label}
                              </td>
                            </tr>
                          }
                          {group.permissions.map((permission) => (
                            <tr
                              key={permission}
                              className="border-b border-border/70 last:border-0"
                            >
                              <td className="sticky left-0 bg-card px-4 py-3 font-medium">
                                {labelForPermission(permission)}
                              </td>
                              {matrix?.roles.map((role) => (
                                <td
                                  key={`${role.id}-${permission}`}
                                  className="px-3 py-3 text-center"
                                >
                                  <button
                                    type="button"
                                    className={`mx-auto grid size-8 cursor-pointer place-items-center rounded-full transition-colors ${
                                      role.code === "OWNER"
                                        ? "cursor-not-allowed bg-muted/60 text-muted-foreground"
                                        : isPermissionEnabled(role, permission)
                                          ? "bg-success/15 text-success hover:bg-success/25"
                                          : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
                                    }`}
                                    disabled={
                                      role.code === "OWNER" ||
                                      updatingCell ===
                                        `${role.id}-${permission}`
                                    }
                                    onClick={() =>
                                      void toggleMatrixPermission(
                                        role,
                                        permission,
                                      )
                                    }
                                    title={
                                      role.code === "OWNER"
                                        ? "Owner permissions are protected"
                                        : "Click to toggle permission"
                                    }
                                    aria-label={`${isPermissionEnabled(role, permission) ? "Remove" : "Grant"} ${labelForPermission(permission)} for ${role.name}`}
                                    aria-pressed={isPermissionEnabled(
                                      role,
                                      permission,
                                    )}
                                  >
                                    {isPermissionEnabled(role, permission) ? (
                                      <CheckIcon />
                                    ) : (
                                      <span className="text-base leading-none">
                                        -
                                      </span>
                                    )}
                                  </button>
                                </td>
                              ))}
                            </tr>
                          ))}
                        </Fragment>
                      ))}{" "}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="custom" className="mt-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-bold">Custom roles</h2>
                <p className="text-sm text-muted-foreground">
                  Shape access around the way your agency works.
                </p>
              </div>
              <Button variant="outline" onClick={openCreate}>
                <Plus className="size-4" />
                New role
              </Button>
            </div>
            {customRoles.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card px-5 py-14 text-center">
                <KeyRound className="mx-auto size-9 text-primary" />
                <h2 className="mt-3 font-bold">No custom roles yet</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Create focused access for coordinators, project leads, or
                  interns.
                </p>
                <Button className="mt-4" onClick={openCreate}>
                  <Plus className="size-4" />
                  Create custom role
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border rounded-2xl border border-border bg-card">
                {customRoles.map((role) => (
                  <div
                    key={role.id}
                    className="flex flex-wrap items-center gap-3 p-4"
                  >
                    <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                      <KeyRound className="size-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold">{role.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {role.member_count} members · {role.permissions.length}{" "}
                        permissions
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-10"
                      onClick={() => void duplicate(role)}
                      aria-label={`Duplicate ${role.name}`}
                    >
                      <Copy className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-10"
                      onClick={() => openEdit(role)}
                      aria-label={`Edit ${role.name}`}
                    >
                      <Edit3 className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-10 text-destructive"
                      onClick={() => setDeleteTarget(role)}
                      aria-label={`Delete ${role.name}`}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="logs" className="mt-5">
            <div className="rounded-2xl border border-border bg-card">
              <div className="flex items-center gap-2 border-b border-border p-4">
                <ScrollText className="size-5 text-primary" />
                <div>
                  <h2 className="font-bold">Access logs</h2>
                  <p className="text-xs text-muted-foreground">
                    Sensitive team changes made in your company.
                  </p>
                </div>
              </div>
              {!audit?.logs.length ? (
                <p className="p-8 text-center text-sm text-muted-foreground">
                  No team activity yet.
                </p>
              ) : (
                <div className="divide-y divide-border">
                  {audit.logs.map((log) => (
                    <div key={log._id} className="flex gap-3 p-4">
                      <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                        <ScrollText className="size-4" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold">
                          {log.action
                            .replaceAll("team.", "")
                            .replaceAll("_", " ")}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {new Date(log.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <RoleForm
        key={`${editing?.id || "new"}-${formOpen}`}
        open={formOpen}
        onOpenChange={setFormOpen}
        role={editing}
        permissions={allPermissions}
      />
      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {deleteTarget?.name}?</DialogTitle>
            <DialogDescription>
              Members must be moved to a replacement role before this role can
              be deleted.
            </DialogDescription>
          </DialogHeader>
          {deleteTarget?.member_count ? (
            <select
              value={replacement}
              onChange={(event) => setReplacement(event.target.value)}
              className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Select replacement role</option>
              {roles
                .filter((role) => role.id !== deleteTarget.id)
                .map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
            </select>
          ) : (
            <p className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
              No active members use this role.
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Keep role
            </Button>
            <Button
              variant="destructive"
              disabled={
                Boolean(deleteTarget?.member_count && !replacement) ||
                remove.isPending
              }
              onClick={() => void deleteRole()}
            >
              {remove.isPending ? "Deleting..." : "Delete role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="size-3.5 fill-none stroke-current stroke-2"
    >
      <path d="m3 8 3 3 7-7" />
    </svg>
  );
}
