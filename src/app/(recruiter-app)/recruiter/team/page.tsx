"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState, type FormEvent } from "react";
import {
  BriefcaseBusiness,
  ChevronRight,
  Clock3,
  EllipsisVertical,
  KeyRound,
  Mail,
  MapPin,
  Plus,
  Search,
  ShieldCheck,
  UserRoundPlus,
  Users,
  UsersRound,
  X,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCancelTeamInvitation,
  useChangeMemberRole,
  useInviteTeamMember,
  useRemoveTeamMember,
  useResendTeamInvitation,
  useTeam,
  useTeamInvitations,
  useTeamRoles,
  useUpdateTeamMember,
  useVerifyTeamMemberAccount,
} from "@/hooks/use-team";
import { useRecruiterProfile } from "@/hooks/use-recruiter-profile";
import type { TeamInvitation, TeamMember, TeamRole } from "@/lib/api/team";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function locationLabel(location?: TeamMember["location"]) {
  return [location?.city, location?.state, location?.country]
    .filter(Boolean)
    .join(", ");
}

function errorMessage(error: unknown, fallback: string) {
  const value = error as { response?: { data?: { message?: string } } };
  return value.response?.data?.message || fallback;
}

function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  destructive = false,
  pending = false,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  destructive?: boolean;
  pending?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button
            variant={destructive ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={pending}
          >
            {pending ? "Working..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function InviteDialog({
  open,
  onOpenChange,
  roles,
  onVerificationRequired,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roles: TeamRole[];
  onVerificationRequired: (verification: {
    token: string;
    email: string;
    password: string;
  }) => void;
}) {
  const invite = useInviteTeamMember();
  const [form, setForm] = useState({
    email: "",
    first_name: "",
    last_name: "",
    role_id: "",
    department: "",
    message: "",
    create_login: false,
    password: "",
    confirm_password: "",
  });
  const availableRoles = roles.filter((role) => role.code !== "OWNER");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.email || !form.role_id) return;
    if (form.create_login && form.password !== form.confirm_password) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      const result = await invite.mutateAsync({
        email: form.email,
        role_id: form.role_id,
        first_name: form.first_name || undefined,
        last_name: form.last_name || undefined,
        department: form.department || undefined,
        message: form.message || undefined,
        password: form.create_login ? form.password : undefined,
      });
      if ("verification_required" in result) {
        onVerificationRequired({
          token: result.verification_token,
          email: result.email,
          password: form.password,
        });
        toast.success("Verification code sent");
      } else {
        toast.success("Invitation sent");
      }
      setForm({
        email: "",
        first_name: "",
        last_name: "",
        role_id: "",
        department: "",
        message: "",
        create_login: false,
        password: "",
        confirm_password: "",
      });
      onOpenChange(false);
    } catch (error) {
      toast.error(errorMessage(error, "Could not send invitation"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto rounded-b-none sm:rounded-lg max-sm:top-auto max-sm:bottom-0 max-sm:translate-y-0">
        <DialogHeader>
          <DialogTitle>Invite a teammate</DialogTitle>
          <DialogDescription>
            Give a teammate the access they need. They can accept after signing
            in to RootIn.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label
              htmlFor="team-email"
              className="mb-1.5 block text-sm font-semibold"
            >
              Email *
            </label>
            <Input
              id="team-email"
              type="email"
              required
              value={form.email}
              onChange={(event) =>
                setForm({ ...form, email: event.target.value })
              }
              placeholder="name@agency.com"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="team-first"
                className="mb-1.5 block text-sm font-semibold"
              >
                First name
              </label>
              <Input
                id="team-first"
                value={form.first_name}
                onChange={(event) =>
                  setForm({ ...form, first_name: event.target.value })
                }
              />
            </div>
            <div>
              <label
                htmlFor="team-last"
                className="mb-1.5 block text-sm font-semibold"
              >
                Last name
              </label>
              <Input
                id="team-last"
                value={form.last_name}
                onChange={(event) =>
                  setForm({ ...form, last_name: event.target.value })
                }
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="team-role"
              className="mb-1.5 block text-sm font-semibold"
            >
              Role *
            </label>
            <select
              id="team-role"
              required
              value={form.role_id}
              onChange={(event) =>
                setForm({ ...form, role_id: event.target.value })
              }
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
            >
              <option value="">Select a role</option>
              {availableRoles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="team-department"
              className="mb-1.5 block text-sm font-semibold"
            >
              Department
            </label>
            <Input
              id="team-department"
              value={form.department}
              onChange={(event) =>
                setForm({ ...form, department: event.target.value })
              }
              placeholder="Casting, Operations..."
            />
          </div>
          <div>
            <label
              htmlFor="team-message"
              className="mb-1.5 block text-sm font-semibold"
            >
              Personal message
            </label>
            <textarea
              id="team-message"
              value={form.message}
              onChange={(event) =>
                setForm({ ...form, message: event.target.value })
              }
              className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
              placeholder="Welcome to the team..."
            />
          </div>
          <div className="rounded-xl border border-border bg-muted/40 p-3">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={form.create_login}
                onChange={(event) =>
                  setForm({ ...form, create_login: event.target.checked })
                }
                className="mt-1 size-4 accent-primary"
              />
              <span>
                <span className="flex items-center gap-1.5 text-sm font-semibold">
                  <KeyRound className="size-4 text-primary" />
                  Create login credentials now
                </span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  An OTP will be sent to this email. The account is only created
                  after the code is verified.
                </span>
              </span>
            </label>
            {form.create_login && (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="team-password"
                    className="mb-1.5 block text-sm font-semibold"
                  >
                    Password *
                  </label>
                  <Input
                    id="team-password"
                    type="password"
                    required
                    minLength={8}
                    value={form.password}
                    onChange={(event) =>
                      setForm({ ...form, password: event.target.value })
                    }
                    placeholder="At least 8 characters"
                  />
                </div>
                <div>
                  <label
                    htmlFor="team-confirm-password"
                    className="mb-1.5 block text-sm font-semibold"
                  >
                    Confirm password *
                  </label>
                  <Input
                    id="team-confirm-password"
                    type="password"
                    required
                    minLength={8}
                    value={form.confirm_password}
                    onChange={(event) =>
                      setForm({ ...form, confirm_password: event.target.value })
                    }
                  />
                </div>
                <p className="text-xs text-muted-foreground sm:col-span-2">
                  Include an uppercase letter, lowercase letter, and number.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="submit"
              className="w-full sm:w-auto"
              disabled={invite.isPending || availableRoles.length === 0}
            >
              {invite.isPending
                ? form.create_login
                  ? "Creating login..."
                  : "Sending..."
                : form.create_login
                  ? "Create team login"
                  : "Send invitation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function VerifyTeamAccountDialog({
  verification,
  onVerified,
  onOpenChange,
}: {
  verification: { token: string; email: string; password: string } | null;
  onVerified: (credentials: { email: string; password: string }) => void;
  onOpenChange: (open: boolean) => void;
}) {
  const verify = useVerifyTeamMemberAccount();
  const [otp, setOtp] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!verification || otp.length !== 6) return;
    try {
      await verify.mutateAsync({
        verification_token: verification.token,
        otp,
      });
      onOpenChange(false);
      onVerified({
        email: verification.email,
        password: verification.password,
      });
      setOtp("");
      toast.success("Team login created");
    } catch (error) {
      toast.error(errorMessage(error, "Could not verify the email"));
    }
  };

  return (
    <Dialog
      open={verification !== null}
      onOpenChange={(open) => !open && onOpenChange(false)}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Verify team member email</DialogTitle>
          <DialogDescription>
            Enter the 6-digit code sent to {verification?.email}. The login will
            not be created until this code is verified.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <Input
            value={otp}
            onChange={(event) =>
              setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
            }
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="000000"
            className="h-12 text-center text-lg tracking-[0.35em]"
            required
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={verify.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={verify.isPending || otp.length !== 6}>
              {verify.isPending ? "Verifying..." : "Verify and create login"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CredentialsDialog({
  credentials,
  onOpenChange,
}: {
  credentials: { email: string; password: string } | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog
      open={credentials !== null}
      onOpenChange={(open) => !open && onOpenChange(false)}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Team login created</DialogTitle>
          <DialogDescription>
            Share these credentials with the teammate through a secure channel.
            The password will not be shown again here.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 rounded-xl bg-muted p-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Email</p>
            <p className="mt-1 break-all font-semibold">{credentials?.email}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Password</p>
            <p className="mt-1 break-all font-mono font-semibold">
              {credentials?.password}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MemberRow({
  member,
  canManage,
  onRole,
  onDeactivate,
  onRemove,
}: {
  member: TeamMember;
  canManage: boolean;
  onRole: (member: TeamMember) => void;
  onDeactivate: (member: TeamMember) => void;
  onRemove: (member: TeamMember) => void;
}) {
  const router = useRouter();
  return (
    <article className="group flex min-w-0 items-center gap-3 border-t border-border/70 px-3 py-3 first:border-t-0 sm:px-4">
      <button
        type="button"
        className="min-w-0 flex-1 text-left"
        onClick={() => router.push(`/recruiter/team/${member.id}`)}
      >
        <div className="flex items-center gap-3">
          <Avatar size="lg" className="border border-border">
            {member.avatar_url && (
              <AvatarImage src={member.avatar_url} alt="" />
            )}
            <AvatarFallback className="bg-primary/10 font-bold text-primary">
              {initials(member.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="truncate text-sm font-bold text-foreground">
                {member.name}
              </span>
              {member.verified && (
                <ShieldCheck
                  className="size-3.5 text-primary"
                  aria-label="Verified"
                />
              )}
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                {member.role?.name}
              </span>
            </div>
            <p className="mt-1 flex items-center gap-1 truncate text-xs text-muted-foreground">
              <Mail className="size-3.5 shrink-0" />
              {member.email}
            </p>
            <p className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Clock3 className="size-3" />
                {member.last_active_at
                  ? `Active ${new Date(member.last_active_at).toLocaleDateString()}`
                  : "Recently joined"}
              </span>
              {locationLabel(member.location) && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3" />
                  {locationLabel(member.location)}
                </span>
              )}
            </p>
          </div>
        </div>
      </button>
      <span className="hidden shrink-0 items-center gap-1.5 text-xs text-success sm:inline-flex">
        <span className="size-2 rounded-full bg-success" />
        Active
      </span>
      {canManage && member.role?.code !== "OWNER" && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-10 shrink-0"
              aria-label={`Actions for ${member.name}`}
            >
              <EllipsisVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onSelect={() => router.push(`/recruiter/team/${member.id}`)}
            >
              View profile
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onRole(member)}>
              Change role
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/recruiter/team/roles">Manage permissions</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => onDeactivate(member)}>
              Deactivate
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={() => onRemove(member)}
            >
              Remove from team
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      {member.role?.code === "OWNER" && (
        <span className="hidden text-xs font-semibold text-muted-foreground sm:block">
          Owner
        </span>
      )}
      <ChevronRight className="size-4 shrink-0 text-muted-foreground sm:hidden" />
    </article>
  );
}

function InvitationRow({
  invitation,
  canManage,
}: {
  invitation: TeamInvitation;
  canManage: boolean;
}) {
  const resend = useResendTeamInvitation();
  const cancel = useCancelTeamInvitation();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const isPending = invitation.status === "PENDING";
  return (
    <div className="flex items-center gap-3 border-t border-border/70 px-3 py-3 first:border-t-0">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-warning/15 text-warning">
        <Mail className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{invitation.email}</p>
        <p className="text-xs text-muted-foreground">
          {invitation.role?.name || "Team role"} ·{" "}
          {invitation.status.toLowerCase()}
        </p>
      </div>
      {canManage && isPending && (
        <div className="flex shrink-0 gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-9 px-2 text-xs"
            onClick={async () => {
              try {
                await resend.mutateAsync(invitation.id);
                toast.success("Invitation resent");
              } catch (error) {
                toast.error(errorMessage(error, "Could not resend invitation"));
              }
            }}
          >
            Resend
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-9 text-muted-foreground hover:text-destructive"
            onClick={() => setConfirmOpen(true)}
            aria-label="Cancel invitation"
          >
            <X className="size-4" />
          </Button>
        </div>
      )}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Cancel invitation?"
        description={`The invitation for ${invitation.email} will no longer work.`}
        confirmLabel="Cancel invitation"
        destructive
        pending={cancel.isPending}
        onConfirm={async () => {
          try {
            await cancel.mutateAsync(invitation.id);
            setConfirmOpen(false);
            toast.success("Invitation cancelled");
          } catch (error) {
            toast.error(errorMessage(error, "Could not cancel invitation"));
          }
        }}
      />
    </div>
  );
}

export default function RecruiterTeamPage() {
  const { data, isLoading, isError, refetch } = useTeam();
  const { data: recruiterProfile } = useRecruiterProfile();
  const { data: roles = [] } = useTeamRoles();
  const { data: invitations = [] } = useTeamInvitations();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [verification, setVerification] = useState<{
    token: string;
    email: string;
    password: string;
  } | null>(null);
  const [credentials, setCredentials] = useState<{
    email: string;
    password: string;
  } | null>(null);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<TeamMember | null>(null);
  const [roleOpen, setRoleOpen] = useState(false);
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const changeRole = useChangeMemberRole();
  const updateMember = useUpdateTeamMember();
  const removeMember = useRemoveTeamMember();
  const canInvite = Boolean(data?.permissions.includes("team.invite"));
  const canManage = Boolean(data?.permissions.includes("team.manage_members"));
  const canAssign = Boolean(data?.permissions.includes("team.assign_roles"));
  const bannerUrl = recruiterProfile?.banner_image_url;
  const logoUrl = recruiterProfile?.profile_photo;

  const filtered = useMemo(
    () =>
      (data?.members || []).filter((member) => {
        const matchesFilter = filter === "ALL" || member.role?.id === filter;
        const value =
          `${member.name} ${member.email || ""} ${member.role?.name || ""}`.toLowerCase();
        return matchesFilter && value.includes(search.toLowerCase().trim());
      }),
    [data?.members, filter, search],
  );
  const groups = useMemo(
    () =>
      roles
        .map((role) => ({
          role,
          members: filtered.filter((member) => member.role?.id === role.id),
        }))
        .filter((group) => group.members.length > 0),
    [filtered, roles],
  );

  const perform = async (
    action: () => Promise<unknown>,
    success: string,
    close: () => void,
  ) => {
    try {
      await action();
      close();
      toast.success(success);
    } catch (error) {
      toast.error(errorMessage(error, "Could not update team"));
    }
  };

  if (isLoading)
    return (
      <div className="campaigns-theme min-h-screen bg-background">
        <main className="container-page space-y-5 py-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </main>
      </div>
    );
  if (isError || !data)
    return (
      <div className="campaigns-theme min-h-screen bg-background">
        <main className="container-page py-16 text-center">
          <UsersRound className="mx-auto size-10 text-muted-foreground" />
          <h1 className="mt-4 text-xl font-bold">Team unavailable</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We could not load your team right now.
          </p>
          <Button className="mt-5" onClick={() => refetch()}>
            Try again
          </Button>
        </main>
      </div>
    );
  const statItems: Array<{ icon: LucideIcon; value: number; label: string }> = [
    { icon: Users, value: data.stats.team_members, label: "Team members" },
    {
      icon: BriefcaseBusiness,
      value: data.stats.active_projects,
      label: "Active projects",
    },
    {
      icon: UserRoundPlus,
      value: data.stats.pending_invitations,
      label: "Pending invitations",
    },
    { icon: UsersRound, value: data.stats.roles, label: "Roles" },
  ];

  return (
    <div className="campaigns-theme min-h-screen bg-background">
      <main className="container-page max-w-7xl space-y-5 py-5 pb-10 sm:py-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
              People and access
            </p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
              Your Team
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your agency team members, roles and permissions.
            </p>
          </div>
        </header>

        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="relative h-36 overflow-hidden bg-primary/10 sm:h-44">
            {bannerUrl && (
              <Image
                src={bannerUrl}
                alt=""
                fill
                unoptimized
                className="absolute inset-0 size-full object-cover"
              />
            )}
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/45 to-transparent" />
          </div>
          <div className="relative px-4 pb-4 sm:px-6 sm:pb-5">
            <div className="-mt-10 flex items-end gap-3 sm:-mt-11">
              <Avatar
                size="lg"
                className="size-20 rounded-full border-4 border-card bg-card shadow-md"
              >
                <AvatarImage
                  src={logoUrl}
                  alt={`${data.company.name} profile`}
                  className="object-cover"
                />
                <AvatarFallback className="rounded-full bg-slate-950 text-lg font-bold text-white">
                  {initials(data.company.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 pb-1">
                <h2 className="flex items-center gap-1.5 truncate text-lg font-extrabold sm:text-xl">
                  {data.company.name}
                  {data.company.verified && (
                    <ShieldCheck className="size-4 shrink-0 text-primary" />
                  )}
                </h2>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {data.company.type || "Recruiter agency"}
                </p>
                <p className="mt-1 flex items-center gap-1 truncate text-xs text-muted-foreground">
                  <MapPin className="size-3.5 shrink-0" />
                  {locationLabel(data.company.location) || "Location not added"}
                </p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 divide-x divide-y divide-border sm:grid-cols-4 sm:divide-y-0">
            {statItems.map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex items-center gap-2.5 px-3 py-2.5 sm:p-3.5">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-4" />
                </span>
                <div>
                  <p className="text-lg font-extrabold leading-none">{value}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="h-10 min-w-0 flex-1 px-3 text-xs sm:h-11 sm:flex-none sm:px-4 sm:text-sm"
            asChild
          >
            <Link href="/recruiter/team/roles">
              <ShieldCheck className="size-4" />
              Roles & access
            </Link>
          </Button>
          {canInvite && (
            <Button
              className="h-10 min-w-0 flex-[1.15] px-3 text-xs sm:h-11 sm:flex-none sm:px-4 sm:text-sm"
              onClick={() => setInviteOpen(true)}
            >
              <Plus className="size-4" />
              Invite team member
            </Button>
          )}
        </div>

        <section className="space-y-3">
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {[
              { id: "ALL", label: `All (${data.members.length})` },
              ...roles.map((role) => ({
                id: role.id,
                label: `${role.name} (${data.members.filter((member) => member.role?.id === role.id).length})`,
              })),
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id)}
                className={`min-h-10 shrink-0 rounded-full px-3 text-xs font-bold transition-colors ${filter === item.id ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"}`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-11 bg-card pl-10"
              placeholder="Search team members"
            />
          </div>
        </section>

        {groups.length === 0 ? (
          <section className="rounded-2xl border border-dashed border-border bg-card px-5 py-14 text-center">
            <UsersRound className="mx-auto size-10 text-primary/70" />
            <h2 className="mt-4 text-lg font-bold">
              {data.members.length === 0
                ? "Build your team"
                : "No team members found"}
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              {data.members.length === 0
                ? "Invite teammates and assign roles so everyone has the access they need."
                : "Try a different search or role filter."}
            </p>
            {data.members.length === 0 && canInvite && (
              <Button
                className="mt-5 min-h-11"
                onClick={() => setInviteOpen(true)}
              >
                <Plus className="size-4" />
                Invite team member
              </Button>
            )}
          </section>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {groups.map(({ role, members }) => (
              <section
                key={role.id}
                className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
              >
                <div className="flex items-start gap-3 bg-primary/5 px-4 py-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <UsersRound className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-extrabold">{role.name}</h2>
                      <span className="rounded-full bg-background px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                        {members.length}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {role.description}
                    </p>
                  </div>
                </div>
                {members.map((member) => (
                  <MemberRow
                    key={member.id}
                    member={member}
                    canManage={canManage}
                    onRole={(value) => {
                      setSelected(value);
                      setRoleOpen(true);
                    }}
                    onDeactivate={(value) => {
                      setSelected(value);
                      setDeactivateOpen(true);
                    }}
                    onRemove={(value) => {
                      setSelected(value);
                      setRemoveOpen(true);
                    }}
                  />
                ))}
              </section>
            ))}
          </div>
        )}
        {invitations.some((invitation) => invitation.status === "PENDING") && (
          <section className="rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <div>
                <h2 className="text-sm font-extrabold">Pending invitations</h2>
                <p className="text-xs text-muted-foreground">
                  People who have not joined yet.
                </p>
              </div>
              <span className="rounded-full bg-warning/15 px-2 py-1 text-xs font-bold text-warning">
                {
                  invitations.filter(
                    (invitation) => invitation.status === "PENDING",
                  ).length
                }
              </span>
            </div>
            <div>
              {invitations
                .filter((invitation) => invitation.status === "PENDING")
                .map((invitation) => (
                  <InvitationRow
                    key={invitation.id}
                    invitation={invitation}
                    canManage={canInvite}
                  />
                ))}
            </div>
          </section>
        )}
      </main>
      <InviteDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        roles={roles}
        onVerificationRequired={setVerification}
      />
      <VerifyTeamAccountDialog
        verification={verification}
        onOpenChange={(open) => !open && setVerification(null)}
        onVerified={setCredentials}
      />
      <CredentialsDialog
        credentials={credentials}
        onOpenChange={(open) => !open && setCredentials(null)}
      />
      <Dialog open={roleOpen} onOpenChange={setRoleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change role</DialogTitle>
            <DialogDescription>
              Choose the role that should control {selected?.name}&apos;s
              access.
            </DialogDescription>
          </DialogHeader>
          <select
            defaultValue={selected?.role?.id}
            className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
            onChange={(event) => {
              if (!selected || !canAssign) return;
              void perform(
                () =>
                  changeRole.mutateAsync({
                    id: selected.id,
                    roleId: event.target.value,
                  }),
                "Role updated",
                () => setRoleOpen(false),
              );
            }}
            disabled={changeRole.isPending || !canAssign}
          >
            {roles
              .filter((role) => role.code !== "OWNER")
              .map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
          </select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={deactivateOpen}
        onOpenChange={setDeactivateOpen}
        title={`Deactivate ${selected?.name || "member"}?`}
        description="They will lose access to this company while their membership is retained."
        confirmLabel="Deactivate"
        destructive
        pending={updateMember.isPending}
        onConfirm={() =>
          selected &&
          void perform(
            () =>
              updateMember.mutateAsync({
                id: selected.id,
                payload: { status: "DEACTIVATED" },
              }),
            "Member deactivated",
            () => setDeactivateOpen(false),
          )
        }
      />
      <ConfirmDialog
        open={removeOpen}
        onOpenChange={setRemoveOpen}
        title={`Remove ${selected?.name || "member"}?`}
        description="This removes their active membership and cannot be undone from this screen."
        confirmLabel="Remove member"
        destructive
        pending={removeMember.isPending}
        onConfirm={() =>
          selected &&
          void perform(
            () => removeMember.mutateAsync(selected.id),
            "Member removed",
            () => setRemoveOpen(false),
          )
        }
      />
    </div>
  );
}
