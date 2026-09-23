"use client";

import { useState } from "react";
import {
  Loader2,
  Mail,
  UserRound,
  UserRoundPlus,
  UserRoundX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCampaignTeam,
  useInviteCampaignTeamMember,
  useRemoveCampaignTeamMember,
  useUpdateCampaignTeamMemberRole,
} from "@/hooks/use-campaigns";
import type { CampaignTeamMember } from "@/lib/api/campaigns";

function nameOf(member: CampaignTeamMember) {
  return typeof member.user_id === "object"
    ? member.user_id.full_legal_name ||
        member.user_id.username ||
        member.user_id.email
    : "Team member";
}

export function CampaignTeamSection({ campaignId }: { campaignId: string }) {
  const { data, isLoading, isError } = useCampaignTeam(campaignId);
  const invite = useInviteCampaignTeamMember();
  const updateRole = useUpdateCampaignTeamMemberRole();
  const remove = useRemoveCampaignTeamMember();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"editor" | "viewer">("editor");
  if (isLoading)
    return (
      <Panel>
        <Loader2 className="mx-auto size-6 animate-spin text-primary" />
      </Panel>
    );
  if (isError)
    return (
      <Panel>
        <p className="text-sm text-muted-foreground">
          Team collaboration is unavailable for this campaign or plan.
        </p>
      </Panel>
    );
  const members = data?.members ?? [];
  return (
    <Panel>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold">Campaign team</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Give trusted teammates access to review and manage this campaign.
          </p>
        </div>
        <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
          {members.length} members
        </span>
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (email.trim())
            invite.mutate(
              { campaignId, email: email.trim(), role },
              { onSuccess: () => setEmail("") },
            );
        }}
        className="mt-6 grid gap-2 rounded-lg border border-border bg-secondary/30 p-3 sm:grid-cols-[1fr_140px_auto]"
      >
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="teammate@example.com"
            className="pl-9"
          />
        </div>
        <Select
          value={role}
          onValueChange={(value) => setRole(value as "editor" | "viewer")}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="editor">Editor</SelectItem>
            <SelectItem value="viewer">Viewer</SelectItem>
          </SelectContent>
        </Select>
        <Button type="submit" disabled={invite.isPending}>
          <UserRoundPlus className="size-4" />
          Add member
        </Button>
      </form>
      <div className="mt-5 divide-y divide-border rounded-lg border border-border">
        {members.length === 0 ? (
          <p className="p-6 text-center text-sm text-muted-foreground">
            No teammates have been added yet.
          </p>
        ) : (
          members.map((member) => (
            <div
              key={member._id}
              className="flex flex-wrap items-center gap-3 p-4"
            >
              <div className="grid size-10 shrink-0 place-items-center rounded-full bg-primary-soft text-primary">
                <UserRound className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">
                  {nameOf(member)}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {typeof member.user_id === "object"
                    ? member.user_id.email
                    : ""}
                </p>
              </div>
              {member.role === "owner" ? (
                <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium">
                  Owner
                </span>
              ) : (
                <>
                  <Select
                    value={member.role}
                    onValueChange={(value) =>
                      updateRole.mutate({
                        campaignId,
                        memberId: member._id,
                        role: value as "editor" | "viewer",
                      })
                    }
                  >
                    <SelectTrigger className="w-[110px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Remove ${nameOf(member)}`}
                    onClick={() =>
                      remove.mutate({ campaignId, memberId: member._id })
                    }
                    disabled={remove.isPending}
                  >
                    <UserRoundX className="size-4 text-destructive" />
                  </Button>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </Panel>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <section className="mt-4 rounded-lg border border-border bg-card p-5 shadow-card">
      {children}
    </section>
  );
}
