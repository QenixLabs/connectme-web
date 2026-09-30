"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "motion/react";
import { KeyRound, Loader2, Send, CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { adminApi, type SendTestOtpResponse } from "@/lib/api";

function getApiErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (error && typeof error === "object" && "response" in error) {
    const res = (error as { response?: { data?: { message?: unknown } } }).response;
    if (typeof res?.data?.message === "string") return res.data.message;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

const testOtpSchema = z
  .object({
    channel: z.enum(["email", "sms"]),
    email: z.string().trim().optional(),
    phone: z.string().trim().optional(),
  })
  .superRefine((values, ctx) => {
    if (values.channel === "email") {
      if (!values.email) {
        ctx.addIssue({ code: "custom", path: ["email"], message: "Email is required" });
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
        ctx.addIssue({ code: "custom", path: ["email"], message: "Enter a valid email address" });
      }
    } else {
      if (!values.phone) {
        ctx.addIssue({ code: "custom", path: ["phone"], message: "Phone number is required" });
      } else if (!/^\+?91[6-9]\d{9}$|^\+?[6-9]\d{9}$/.test(values.phone.replace(/[\s\-()]/g, ""))) {
        ctx.addIssue({
          code: "custom",
          path: ["phone"],
          message: "Enter a valid Indian mobile number (e.g. +919876543210)",
        });
      }
    }
  });

type TestOtpFormValues = z.infer<typeof testOtpSchema>;

export default function OtpTestPage() {
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<SendTestOtpResponse | null>(null);

  const form = useForm<TestOtpFormValues>({
    resolver: zodResolver(testOtpSchema),
    defaultValues: { channel: "email", email: "", phone: "" },
  });

  const channel = form.watch("channel");

  const onSubmit = async (values: TestOtpFormValues) => {
    setSending(true);
    setResult(null);
    try {
      const payload =
        values.channel === "email"
          ? { channel: values.channel, email: values.email?.trim() }
          : { channel: values.channel, phone: values.phone?.trim() };
      const data = await adminApi.sendTestOtp(payload);
      setResult(data);
      toast.success(data.message);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Failed to send test OTP"));
    } finally {
      setSending(false);
    }
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ staggerChildren: 0.05 } as never}
    >
      <div>
        <h1 className="text-2xl font-bold tracking-tight">OTP Test</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Send a test OTP to an email address or phone number to verify delivery (Brevo / MSG91).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-muted-foreground" />
            Send test OTP
          </CardTitle>
          <CardDescription>
            Limited to 3 sends per minute per destination. Sends are audit-logged.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="channel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Channel</FormLabel>
                    <FormControl>
                      <RadioGroup
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          setResult(null);
                        }}
                        className="flex gap-4"
                      >
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="email" id="channel-email" />
                          <Label htmlFor="channel-email" className="cursor-pointer">
                            Email
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="sms" id="channel-sms" />
                          <Label htmlFor="channel-sms" className="cursor-pointer">
                            SMS
                          </Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {channel === "email" ? (
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="user@example.com"
                          autoComplete="off"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone number</FormLabel>
                      <FormControl>
                        <Input placeholder="+919876543210" autoComplete="off" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <Button type="submit" disabled={sending} className="gap-1.5">
                {sending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send OTP
                  </>
                )}
              </Button>
            </form>
          </Form>

          {result && (
            <Alert className="mt-5 border-emerald-500/30 bg-emerald-500/5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <AlertDescription className="text-sm">
                <span className="font-medium">{result.message}</span>
                <span className="block text-muted-foreground mt-1">
                  Channel: {result.channel} · Expires in {Math.round(result.expires_in_seconds / 60)}{" "}
                  minutes.
                </span>
                {result.preview_otp && (
                  <span className="mt-2 flex items-center gap-1.5 text-foreground">
                    <Info className="h-3.5 w-3.5 text-muted-foreground" />
                    Dev preview OTP:{" "}
                    <code className="font-mono font-semibold tracking-widest">
                      {result.preview_otp}
                    </code>
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}

          <Alert className="mt-5">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-xs text-muted-foreground">
              Test OTPs are stored separately from signup/login OTPs and cannot be used to verify
              accounts. In production the OTP value is not returned — check the recipient inbox or
              phone.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </motion.div>
  );
}
