"use client";

import { useState, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import {
  ChevronRight,
  Headphones,
  KeyRound,
  Mail,
  Moon,
  Phone,
  Sun,
  Trash2,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useAuthStore } from "@/providers/auth-store-provider";
import { cn } from "@/lib/utils";
import { ChangePasswordDialog } from "./settings/change-password-dialog";
import { VerifyPhoneDialog } from "./settings/verify-phone-dialog";

const iconToneMap = {
  teal: "icon-teal",
  violet: "icon-violet",
  amber: "icon-amber",
  red: "icon-red",
} as const;

const subscribeToHydration = () => () => {};

function SettingIcon({
  tone,
  children,
}: {
  tone: "teal" | "violet" | "amber" | "red";
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "grid size-12 shrink-0 place-items-center rounded-lg",
        iconToneMap[tone],
      )}
    >
      {children}
    </div>
  );
}

function SettingRow({
  icon,
  title,
  description,
  action,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  onClick?: () => void;
}) {
  const content = (
    <>
      {icon}
      <div className="min-w-0 flex-1 text-left">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <p className="mt-1 max-w-52 text-[11px] leading-4 text-muted-foreground">
          {description}
        </p>
      </div>
      {action ?? (
        <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
      )}
    </>
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:bg-accent/50"
      >
        {content}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
      {content}
    </div>
  );
}

export function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const { theme, setTheme } = useTheme();
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [phoneVerifyOpen, setPhoneVerifyOpen] = useState(false);
  const mounted = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );

  if (!user) {
    return (
      <div className="mx-auto max-w-4xl space-y-5 px-4 pb-28 pt-5 lg:px-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
        <div className="space-y-3">
          <Skeleton className="h-[72px] w-full rounded-xl" />
          <Skeleton className="h-[72px] w-full rounded-xl" />
          <Skeleton className="h-[72px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  const maskedEmail = user.email
    ? user.email.replace(/(.{2})(.*)(@.*)/, "$1***$3")
    : "Not set";
  const maskedPhone = user.phone
    ? user.phone.replace(/(\d{2})\d+(\d{2})/, "$1****$2")
    : "Not set";

  return (
    <div className="mx-auto max-w-4xl space-y-5 px-4 pb-28 pt-5 lg:px-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          Account Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account preferences and security
        </p>
      </div>

      <div className="space-y-2.5">
        <SettingRow
          icon={
            <SettingIcon tone="teal">
              {mounted && theme === "dark" ? (
                <Moon className="size-5" />
              ) : (
                <Sun className="size-5" />
              )}
            </SettingIcon>
          }
          title="Light Theme"
          description="Use a bright surface with softer contrast"
          action={
            <Switch
              checked={mounted ? theme === "light" : true}
              disabled={!mounted}
              onCheckedChange={(checked) => setTheme(checked ? "light" : "dark")}
              aria-label="Toggle light theme"
            />
          }
        />

        <SettingRow
          icon={
            <SettingIcon tone="teal">
              <KeyRound className="size-5" />
            </SettingIcon>
          }
          title="Change Password"
          description="Update your password to keep your account secure"
          onClick={() => setPasswordOpen(true)}
        />

        <SettingRow
          icon={
            <SettingIcon tone="violet">
              <Mail className="size-5" />
            </SettingIcon>
          }
          title="Email"
          description={maskedEmail}
          action={
            user.is_email_verified ? (
              <span className="rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-medium text-success">
                Verified
              </span>
            ) : (
              <Button variant="outline" size="sm">
                Verify
              </Button>
            )
          }
        />

        <SettingRow
          icon={
            <SettingIcon tone="amber">
              <Phone className="size-5" />
            </SettingIcon>
          }
          title="Phone Number"
          description={maskedPhone}
          action={
            user.is_phone_verified ? (
              <span className="rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-medium text-success">
                Verified
              </span>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPhoneVerifyOpen(true)}
              >
                Verify
              </Button>
            )
          }
        />

        <SettingRow
          icon={
            <SettingIcon tone="red">
              <Trash2 className="size-5" />
            </SettingIcon>
          }
          title="Delete Account"
          description="Permanently delete your account and all data"
          action={
            <span className="text-xs text-muted-foreground">Coming soon</span>
          }
        />
      </div>

      <Card className="flex items-center gap-3 border-border bg-card p-3">
        <SettingIcon tone="teal">
          <Headphones className="size-5" />
        </SettingIcon>
        <div className="min-w-0 flex-1">
          <h2 className="text-xs font-semibold text-primary">Need Help?</h2>
          <p className="mt-1 text-[11px] leading-4 text-muted-foreground">
            Our support team is here to help with your account.
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <a href="mailto:support@connectme.app">Contact Support</a>
        </Button>
      </Card>

      <ChangePasswordDialog open={passwordOpen} onOpenChange={setPasswordOpen} />
      <VerifyPhoneDialog
        open={phoneVerifyOpen}
        onOpenChange={setPhoneVerifyOpen}
        phone={user.phone ?? ""}
      />
    </div>
  );
}
