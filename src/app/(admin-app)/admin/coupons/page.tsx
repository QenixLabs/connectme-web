"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminApi, type AdminCoupon } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminCouponsPage() {
  const client = useQueryClient();
  const [code, setCode] = useState("");
  const [percent, setPercent] = useState("10");
  const [email, setEmail] = useState("");
  const [limit, setLimit] = useState("");
  const [expires, setExpires] = useState("");
  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ["admin", "coupons"],
    queryFn: adminApi.getCoupons,
  });
  const create = useMutation({
    mutationFn: adminApi.createCoupon,
    onSuccess: () => {
      toast.success("Coupon created");
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
              <table className="w-full min-w-[700px] text-sm">
                <thead><tr className="border-b text-left text-muted-foreground"><th className="p-3">Code</th><th className="p-3">Discount</th><th className="p-3">Audience</th><th className="p-3">Redemptions</th><th className="p-3">Expiry</th><th className="p-3">Status</th><th className="p-3"></th></tr></thead>
                <tbody>{coupons.map((coupon: AdminCoupon) => <tr key={coupon._id} className="border-b last:border-0">
                  <td className="p-3 font-mono font-semibold">{coupon.code}</td><td className="p-3">{coupon.percent_off}% recurring</td>
                  <td className="p-3">{coupon.user_id?.email ?? "Everyone"}</td>
                  <td className="p-3">{coupon.redemption_count}{coupon.max_redemptions ? ` / ${coupon.max_redemptions}` : " / ∞"}</td>
                  <td className="p-3">{coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString() : "Never"}</td>
                  <td className="p-3">{coupon.active ? "Active" : "Inactive"}</td>
                  <td className="p-3 text-right">{coupon.active && <Button variant="outline" size="sm" disabled={deactivate.isPending} onClick={() => deactivate.mutate(coupon._id)}>Deactivate</Button>}</td>
                </tr>)}</tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
