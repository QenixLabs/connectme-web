"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  Check,
  Clock3,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useChangeMemberRole,
  useRemoveTeamMember,
  useTeamMember,
  useTeamPermissions,
  useTeamRoles,
  useUpdateTeamMember,
} from "@/hooks/use-team";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
function permissionLabel(value: string) {
  return value
    .split(".")[1]
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
function messageFor(error: unknown) {
  return (
    (error as { response?: { data?: { message?: string } } }).response?.data
      ?.message || "Something went wrong"
  );
}

export default function RecruiterTeamMemberPage() {
  const params = useParams<{ memberId: string }>();
  const router = useRouter();
  const { data, isLoading, isError } = useTeamMember(params.memberId);
  const { data: roles = [] } = useTeamRoles();
  const { data: permissionCatalog } = useTeamPermissions();
  const changeRole = useChangeMemberRole();
  const update = useUpdateTeamMember();
  const remove = useRemoveTeamMember();
  const [confirmAction, setConfirmAction] = useState<
    "deactivate" | "remove" | null
  >(null);
  const [role, setRole] = useState("");
  const member = data?.member;
  const canManage = Boolean(data?.permissions.includes("team.manage_members"));
  const canAssign = Boolean(data?.permissions.includes("team.assign_roles"));
  const isOwner = member?.role?.code === "OWNER";
  const effectivePermissions = member?.role?.permissions || [];

  if (isLoading)
    return (
      <div className="campaigns-theme min-h-screen bg-background">
        <main className="container-page space-y-5 py-8">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </main>
      </div>
    );
  if (isError || !member)
    return (
      <div className="campaigns-theme min-h-screen bg-background">
        <main className="container-page py-16 text-center">
          <p className="font-bold">Team member not found</p>
          <Button className="mt-4" asChild>
            <Link href="/recruiter/team">Back to team</Link>
          </Button>
        </main>
      </div>
    );

  const submitRole = async () => {
    if (!role || !canAssign) return;
    try {
      await changeRole.mutateAsync({ id: member.id, roleId: role });
      toast.success("Role updated");
    } catch (error) {
      toast.error(messageFor(error));
    }
  };
  const confirm = async () => {
    try {
      if (confirmAction === "deactivate")
        await update.mutateAsync({
          id: member.id,
          payload: { status: "DEACTIVATED" },
        });
      if (confirmAction === "remove") await remove.mutateAsync(member.id);
      toast.success(
        confirmAction === "remove" ? "Member removed" : "Member deactivated",
      );
      setConfirmAction(null);
      router.push("/recruiter/team");
    } catch (error) {
      toast.error(messageFor(error));
    }
  };

  return (
    <div className="campaigns-theme min-h-screen bg-background">
      <main className="container-page max-w-5xl py-5 pb-10 sm:py-8">
        <Button variant="ghost" className="mb-4 -ml-2 min-h-10" asChild>
          <Link href="/recruiter/team">
            <ArrowLeft className="size-4" />
            Back to team
          </Link>
        </Button>
        <section className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Avatar size="lg" className="size-20 border-2 border-primary/20">
              <AvatarImage src={member.avatar_url} alt="" />
              <AvatarFallback className="bg-primary/10 text-xl font-bold text-primary">
                {initials(member.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h1 className="flex flex-wrap items-center gap-2 text-2xl font-extrabold">
                {member.name}
                {member.verified && (
                  <ShieldCheck className="size-5 text-primary" />
                )}
              </h1>
              <p className="mt-1 text-sm font-semibold text-primary">
                {member.role?.name}
              </p>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Mail className="size-3.5" />
                  {member.email}
                </span>
                {member.phone && (
                  <span className="inline-flex items-center gap-1">
                    <Phone className="size-3.5" />
                    {member.phone}
                  </span>
                )}
                {member.location?.city && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3.5" />
                    {[member.location.city, member.location.state]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                )}
                <span className="inline-flex items-center gap-1">
                  <Clock3 className="size-3.5" />
                  {member.last_active_at
                    ? `Last active ${new Date(member.last_active_at).toLocaleDateString()}`
                    : "Recently joined"}
                </span>
              </div>
            </div>
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-success/15 px-3 py-1.5 text-xs font-bold text-success">
              <span className="size-2 rounded-full bg-success" />
              {member.status === "ACTIVE" ? "Active" : member.status}
            </span>
          </div>
        </section>
        <Tabs defaultValue="profile" className="mt-5">
          <TabsList className="w-full justify-start overflow-x-auto rounded-xl bg-card p-1 sm:w-fit">
            <TabsTrigger value="profile" className="min-h-10">
              Profile
            </TabsTrigger>
            <TabsTrigger value="permissions" className="min-h-10">
              Permissions
            </TabsTrigger>
            <TabsTrigger value="activity" className="min-h-10">
              Activity
            </TabsTrigger>
            <TabsTrigger value="settings" className="min-h-10">
              Settings
            </TabsTrigger>
          </TabsList>
          <TabsContent value="profile" className="mt-5">
            <div className="grid gap-4 md:grid-cols-2">
              <section className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center gap-2">
                  <UserRound className="size-5 text-primary" />
                  <h2 className="font-bold">Team information</h2>
                </div>
                <dl className="mt-5 space-y-4 text-sm">
                  <div>
                    <dt className="text-xs text-muted-foreground">Role</dt>
                    <dd className="mt-1 font-semibold">{member.role?.name}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">
                      Department
                    </dt>
                    <dd className="mt-1 font-semibold">
                      {member.department || "Not assigned"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Joined</dt>
                    <dd className="mt-1 font-semibold">
                      {member.joined_at
                        ? new Date(member.joined_at).toLocaleDateString()
                        : "Not available"}
                    </dd>
                  </div>
                </dl>
              </section>
              <section className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-5 text-primary" />
                  <h2 className="font-bold">Access summary</h2>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  This member receives access from the {member.role?.name} role.
                  Changes to the role update their effective access immediately.
                </p>
                <p className="mt-4 text-2xl font-extrabold text-primary">
                  {effectivePermissions.length}
                </p>
                <p className="text-xs text-muted-foreground">
                  effective permissions
                </p>
              </section>
            </div>
          </TabsContent>
          <TabsContent value="permissions" className="mt-5">
            <section className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-bold">Effective permissions</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Role permissions applied to this team member.
                  </p>
                </div>
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                  {member.role?.name}
                </span>
              </div>
              <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {(permissionCatalog?.groups || [])
                  .flatMap((group) => group.permissions)
                  .map((permission) => (
                    <div
                      key={permission}
                      className={`flex min-h-11 items-center gap-2 rounded-lg border px-3 text-sm ${effectivePermissions.includes(permission) ? "border-success/30 bg-success/5" : "border-border text-muted-foreground"}`}
                    >
                      {effectivePermissions.includes(permission) ? (
                        <Check className="size-4 text-success" />
                      ) : (
                        <span className="size-4 rounded-full border border-border" />
                      )}
                      {permissionLabel(permission)}
                    </div>
                  ))}
              </div>
            </section>
          </TabsContent>
          <TabsContent value="activity" className="mt-5">
            <section className="rounded-2xl border border-border bg-card">
              <div className="border-b border-border p-5">
                <h2 className="font-bold">Recent activity</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Sensitive changes and actions connected to this membership.
                </p>
              </div>
              {data.activity.length === 0 ? (
                <p className="p-8 text-center text-sm text-muted-foreground">
                  No activity recorded yet.
                </p>
              ) : (
                <div className="divide-y divide-border">
                  {data.activity.map((item) => (
                    <div key={item._id} className="flex gap-3 p-4">
                      <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                        <Clock3 className="size-4" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold">
                          {item.action
                            .replace("team.", "")
                            .replaceAll("_", " ")}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {new Date(item.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </TabsContent>
          <TabsContent value="settings" className="mt-5">
            <div className="space-y-4">
              <section className="rounded-2xl border border-border bg-card p-5">
                <h2 className="font-bold">Role and department</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
                  {canAssign && !isOwner ? (
                    <>
                      <select
                        value={role || member.role?.id || ""}
                        onChange={(event) => setRole(event.target.value)}
                        className="h-11 rounded-md border border-input bg-background px-3 text-sm"
                      >
                        <option value="">Select role</option>
                        {roles
                          .filter((item) => item.code !== "OWNER")
                          .map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name}
                            </option>
                          ))}
                      </select>
                      <Button
                        className="min-h-11"
                        onClick={() => void submitRole()}
                        disabled={!role || changeRole.isPending}
                      >
                        Save role
                      </Button>
                    </>
                  ) : (
                    <p className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                      {isOwner
                        ? "The Owner role is protected."
                        : "You do not have permission to change roles."}
                    </p>
                  )}
                </div>
              </section>
              <section className="rounded-2xl border border-destructive/25 bg-destructive/5 p-5">
                <h2 className="font-bold text-destructive">Danger zone</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  These actions immediately change this member&apos;s access to
                  the company.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {canManage && !isOwner && (
                    <>
                      <Button
                        variant="outline"
                        className="min-h-11"
                        onClick={() => setConfirmAction("deactivate")}
                      >
                        Deactivate membership
                      </Button>
                      <Button
                        variant="destructive"
                        className="min-h-11"
                        onClick={() => setConfirmAction("remove")}
                      >
                        <Trash2 className="size-4" />
                        Remove from team
                      </Button>
                    </>
                  )}
                </div>
              </section>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <Dialog
        open={confirmAction !== null}
        onOpenChange={(open) => !open && setConfirmAction(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmAction === "remove"
                ? "Remove this member?"
                : "Deactivate this member?"}
            </DialogTitle>
            <DialogDescription>
              {confirmAction === "remove"
                ? "They will lose access and be removed from the active team."
                : "They will lose access, but their membership record will be retained."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmAction(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => void confirm()}
              disabled={update.isPending || remove.isPending}
            >
              {update.isPending || remove.isPending
                ? "Working..."
                : confirmAction === "remove"
                  ? "Remove member"
                  : "Deactivate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
