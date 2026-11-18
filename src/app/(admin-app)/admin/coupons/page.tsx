"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminApi, type AdminCoupon } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type CouponRedemption = NonNullable<AdminCoupon["redemptions"]>[number];

const isUsedRedemption = (redemption: CouponRedemption) =>
  !redemption.status || redemption.status === "used";

export default function AdminCouponsPage() {
  const client = useQueryClient();
  const [code, setCode] = useState("");
  const [percent, setPercent] = useState("10");
  const [email, setEmail] = useState("");
  const [limit, setLimit] = useState("");
  const [expires, setExpires] = useState("");
  const [selectedCoupon, setSelectedCoupon] = useState<AdminCoupon | null>(null);
  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ["admin", "coupons"],
    queryFn: adminApi.getCoupons,
  });
  const create = useMutation({
    mutationFn: adminApi.createCoupon,
    onSuccess: (coupon) => {
      toast.success("Coupon created", {
        description: email.trim()
          ? `${coupon.code} was assigned to ${email.trim()}; they were notified by email and in-app.`
          : `${coupon.code} is active for eligible users.`,
      });
      setCode("");
      setEmail("");
      setLimit("");
      setExpires("");
      client.invalidateQueries({ queryKey: ["admin", "coupons"] });
    },
    onError: () => toast.error("Could not create coupon. Check code and user email."),
  });
  const deactivate = useMutation({
    mutationFn: adminApi.deactivateCoupon,
    onSuccess: () => {
      toast.success("Coupon deactivated");
      client.invalidateQueries({ queryKey: ["admin", "coupons"] });
    },
    onError: () => toast.error("Could not deactivate coupon"),
  });
  const submit = (event: FormEvent) => {
    event.preventDefault();
    create.mutate({
      code: code.trim(),
      percent_off: Number(percent),
      ...(email.trim() ? { user_email: email.trim() } : {}),
      ...(limit ? { max_redemptions: Number(limit) } : {}),
      ...(expires ? { expires_at: new Date(expires).toISOString() } : {}),
    });
  };

  const openCoupon = (coupon: AdminCoupon) => setSelectedCoupon(coupon);
  const selectedRedemptions = selectedCoupon?.redemptions ?? [];
  const selectedUsedRedemptions = selectedRedemptions.filter(isUsedRedemption);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Coupons</h1>
        <p className="text-sm text-muted-foreground">Create recurring percentage discounts for plan upgrades.</p>
      </header>
      <Card>
        <CardHeader><CardTitle className="text-base">Generate coupon</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2"><Label htmlFor="coupon-code">Code</Label><Input id="coupon-code" required minLength={3} maxLength={32} value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="WELCOME20" /></div>
            <div className="space-y-2"><Label htmlFor="coupon-percent">% off</Label><Input id="coupon-percent" type="number" min={1} max={100} required value={percent} onChange={(e) => setPercent(e.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="coupon-user">User email <span className="text-muted-foreground">(optional)</span></Label><Input id="coupon-user" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Leave blank for general" /></div>
            <div className="space-y-2"><Label htmlFor="coupon-limit">Redemption limit</Label><Input id="coupon-limit" type="number" min={1} value={limit} onChange={(e) => setLimit(e.target.value)} placeholder="Unlimited" /></div>
            <div className="space-y-2"><Label htmlFor="coupon-expires">Expiry</Label><Input id="coupon-expires" type="date" value={expires} onChange={(e) => setExpires(e.target.value)} /></div>
            <div className="sm:col-span-2 lg:col-span-5"><Button type="submit" disabled={create.isPending}>Create coupon</Button></div>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Existing coupons</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <p className="text-sm text-muted-foreground">Loading coupons…</p> : coupons.length === 0 ? <p className="text-sm text-muted-foreground">No coupons yet.</p> : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm">
                <thead><tr className="border-b text-left text-muted-foreground"><th className="p-3">Code</th><th className="p-3">Discount</th><th className="p-3">Audience</th><th className="p-3">Redemptions</th><th className="p-3">Used by</th><th className="p-3">Expiry</th><th className="p-3">Status</th><th className="p-3"></th></tr></thead>
                <tbody>{coupons.map((coupon: AdminCoupon) => <tr key={coupon._id} className="cursor-pointer border-b transition-colors hover:bg-muted/50 last:border-0 focus-visible:bg-muted/50 focus-visible:outline-none" tabIndex={0} onClick={() => openCoupon(coupon)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openCoupon(coupon); } }}>
                  <td className="p-3 font-mono font-semibold">{coupon.code}</td><td className="p-3">{coupon.percent_off}% recurring</td>
                  <td className="p-3">{coupon.user_id?.email ?? "Everyone"}</td>
                  <td className="p-3">{coupon.redemptions?.filter(isUsedRedemption).length ?? 0}{coupon.max_redemptions ? ` / ${coupon.max_redemptions}` : " / ∞"}<span className="block text-xs text-muted-foreground">{coupon.redemptions?.filter((item) => item.status === "pending").length ?? 0} pending checkout(s)</span></td>
                  <td className="p-3">{coupon.redemptions?.length ? <details><summary className="cursor-pointer underline">{coupon.redemptions.filter(isUsedRedemption).length} used · {coupon.redemptions.filter((item) => item.status === "pending").length} pending · {coupon.redemptions.filter((item) => item.status === "released").length} released</summary><ul className="mt-2 space-y-1">{coupon.redemptions.map((redemption, index) => <li key={`${coupon._id}-${index}`} className="text-xs">{typeof redemption.user_id === "object" ? redemption.user_id.email : redemption.user_id} · {isUsedRedemption(redemption) ? `Used ${redemption.used_at ? new Date(redemption.used_at).toLocaleDateString() : ""}` : redemption.status === "released" ? "Checkout cancelled or expired; reservation released" : "Checkout started; payment not confirmed"}</li>)}</ul></details> : "No users yet"}</td>
                  <td className="p-3">{coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString() : "Never"}</td>
                  <td className="p-3">{coupon.active ? "Active" : "Inactive"}</td>
                  <td className="p-3 text-right">{coupon.active && <Button variant="outline" size="sm" disabled={deactivate.isPending} onClick={(event) => { event.stopPropagation(); deactivate.mutate(coupon._id); }}>Deactivate</Button>}</td>
                </tr>)}</tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      <Dialog open={Boolean(selectedCoupon)} onOpenChange={(open) => !open && setSelectedCoupon(null)}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          {selectedCoupon && (
            <>
              <DialogHeader className="border-b pb-5 pr-8">
                <div className="flex flex-wrap items-center gap-3">
                  <DialogTitle className="font-mono text-2xl tracking-tight">{selectedCoupon.code}</DialogTitle>
                  <Badge variant={selectedCoupon.active ? "default" : "secondary"}>{selectedCoupon.active ? "Active" : "Inactive"}</Badge>
                </div>
                <DialogDescription>
                  {selectedCoupon.percent_off}% recurring discount · {selectedCoupon.user_id?.email ?? "Available to everyone"}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-3 sm:grid-cols-4">
                <div className="rounded-lg border bg-muted/30 p-4"><p className="text-xs text-muted-foreground">Used</p><p className="mt-1 text-2xl font-semibold">{selectedUsedRedemptions.length}</p></div>
                <div className="rounded-lg border bg-muted/30 p-4"><p className="text-xs text-muted-foreground">Limit</p><p className="mt-1 text-2xl font-semibold">{selectedCoupon.max_redemptions ?? "∞"}</p></div>
                <div className="rounded-lg border bg-muted/30 p-4"><p className="text-xs text-muted-foreground">Pending</p><p className="mt-1 text-2xl font-semibold">{selectedRedemptions.filter((item) => item.status === "pending").length}</p></div>
                <div className="rounded-lg border bg-muted/30 p-4"><p className="text-xs text-muted-foreground">Expires</p><p className="mt-1 text-sm font-semibold">{selectedCoupon.expires_at ? new Date(selectedCoupon.expires_at).toLocaleDateString() : "Never"}</p></div>
              </div>

              <section className="space-y-3">
                <div>
                  <h3 className="font-semibold">Users who used this coupon</h3>
                  <p className="text-sm text-muted-foreground">Confirmed redemptions and the date each user applied the discount.</p>
                </div>
                {selectedUsedRedemptions.length ? (
                  <div className="overflow-hidden rounded-lg border">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/40 text-left text-muted-foreground"><tr><th className="p-3 font-medium">User</th><th className="p-3 font-medium">Used on</th><th className="p-3 text-right font-medium">Subscription</th></tr></thead>
                      <tbody>{selectedUsedRedemptions.map((redemption, index) => <tr key={`${selectedCoupon._id}-used-${index}`} className="border-t"><td className="p-3">{typeof redemption.user_id === "object" ? <><span className="font-medium">{redemption.user_id.email}</span>{redemption.user_id.username && <span className="block text-xs text-muted-foreground">@{redemption.user_id.username}</span>}</> : redemption.user_id}</td><td className="p-3">{redemption.used_at ? new Date(redemption.used_at).toLocaleString() : "Date unavailable"}</td><td className="p-3 text-right font-mono text-xs">{redemption.razorpay_subscription_id ?? "—"}</td></tr>)}</tbody>
                    </table>
                  </div>
                ) : <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">No users have used this coupon yet.</div>}
              </section>

              {selectedRedemptions.some((item) => !isUsedRedemption(item)) && <section className="space-y-3"><h3 className="font-semibold">Other checkout activity</h3><div className="space-y-2">{selectedRedemptions.filter((item) => !isUsedRedemption(item)).map((redemption, index) => <div key={`${selectedCoupon._id}-other-${index}`} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 text-sm"><span>{typeof redemption.user_id === "object" ? redemption.user_id.email : redemption.user_id}</span><span className="text-muted-foreground">{redemption.status === "released" ? "Released" : "Pending"}{redemption.claimed_at ? ` · ${new Date(redemption.claimed_at).toLocaleString()}` : ""}</span></div>)}</div></section>}

              <DialogFooter className="border-t pt-4"><span className="mr-auto text-xs text-muted-foreground">Created {new Date(selectedCoupon.created_at).toLocaleDateString()}</span><Button variant="outline" onClick={() => setSelectedCoupon(null)}>Close</Button></DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
