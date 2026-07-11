"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Lock, Mail, AlertTriangle, EyeOff } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/lib/api";
import { toast } from "sonner";
import { useAuthStore } from "@/providers/auth-store-provider";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function TalentSettingsPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const changePasswordMutation = useMutation({
    mutationFn: () => authApi.changePassword(currentPassword, newPassword),
    onSuccess: () => {
      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (err: unknown) => {
      const msg =
        err instanceof Error ? err.message : "Failed to change password";
      toast.error(msg);
    },
  });

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    changePasswordMutation.mutate();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pt-5 pb-24 space-y-6">
      <header className="flex items-center justify-between py-1">
        <button
          onClick={() => router.push("/talent/profile")}
          className="text-ink-muted hover:text-ink transition-colors"
          aria-label="Back"
        >
          <ChevronLeft size={24} strokeWidth={1.5} />
        </button>
        <h1 className="text-[18px] font-medium text-ink font-serif">
          Account Settings
        </h1>
        <div className="w-6" />
      </header>

      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-full bg-gold-soft grid place-items-center">
            <Lock className="h-4 w-4 text-gold-ink" />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-ink">
              Change Password
            </h2>
            <p className="text-[12px] text-ink-soft">
              Must be at least 8 characters with uppercase, lowercase, and
              number
            </p>
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-3">
          <Input
            type="password"
            placeholder="Current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <Button
            type="submit"
            disabled={
              changePasswordMutation.isPending ||
              !currentPassword ||
              !newPassword ||
              !confirmPassword
            }
            className="w-full"
          >
            {changePasswordMutation.isPending
              ? "Updating..."
              : "Update Password"}
          </Button>
        </form>
      </Card>

      <Card className="p-5 space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-full bg-blue-light grid place-items-center">
            <Mail className="h-4 w-4 text-blue" />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-ink">Email</h2>
            <p className="text-[12px] text-ink-soft">{user?.email}</p>
          </div>
        </div>
        <p className="text-[13px] text-ink-muted">
          To change your email, please contact support.
        </p>
      </Card>

      <Card className="p-5 space-y-3 border-destructive/30">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-full bg-error-light grid place-items-center">
            <AlertTriangle className="h-4 w-4 text-error-text" />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-ink">Danger Zone</h2>
            <p className="text-[12px] text-ink-soft">
              Irreversible account actions
            </p>
          </div>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={() =>
            toast.error("Account deletion is not yet available")
          }
        >
          <EyeOff className="w-4 h-4 mr-1.5" strokeWidth={1.5} />
          Deactivate Account
        </Button>
      </Card>
    </div>
  );
}
