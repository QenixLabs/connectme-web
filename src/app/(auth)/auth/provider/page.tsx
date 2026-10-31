"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Store,
  Users,
} from "lucide-react";
import { authApi } from "@/lib/api/auth";
import { getApiErrorMessage } from "@/lib/api/client";
import { SocialAuthButtons } from "@/components/auth/social-auth-buttons";
import { RootInLogo } from "@/components/RootInLogo";
import { useAuthStore } from "@/providers/auth-store-provider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OtpInput } from "@/components/ui/otp-input";

export default function ProviderAuthPage() {
  const router = useRouter();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const fetchUser = useAuthStore((state) => state.fetchUser);
  const [step, setStep] = useState<"signup" | "verify">("signup");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    verification_method: "email" as "email" | "phone",
  });
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [cooldown, setCooldown] = useState(60);

  useEffect(() => {
    if (step !== "verify" || cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown, step]);

  const handleSignup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await authApi.signup({
        ...formData,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        role: "provider",
      });
      setOtp("");
      setCooldown(60);
      setStep("verify");
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Could not create your account. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await authApi.verifyOtp(formData.email.trim(), otp);
      setAccessToken(result.access_token);
      await fetchUser();
      router.push("/provider/onboarding");
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Verification failed. Check your code and try again."));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setError("");
    try {
      await authApi.resendOtp(formData.email.trim());
      setOtp("");
      setCooldown(60);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Could not resend your verification code."));
    } finally {
      setLoading(false);
    }
  };

  const isEmailVerification = formData.verification_method === "email";
  const verificationContact = isEmailVerification ? formData.email : formData.phone;

  return (
    <main className="min-h-dvh bg-[#F8FAFF] text-[#080B2B]">
      <div className="mx-auto flex min-h-dvh max-w-[1440px] flex-col px-4 py-4 sm:px-7 lg:px-10">
        <header className="flex items-center justify-between">
          <Link href="/" aria-label="RootIn home" className="w-[112px]">
            <RootInLogo />
          </Link>
          <p className="text-sm text-[#66728F]">
            Already a provider?{" "}
            <Link href="/auth/login" className="font-semibold text-[#7C35FF] hover:underline">
              Sign in
            </Link>
          </p>
        </header>

        <div className="grid flex-1 items-center gap-8 py-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:py-10">
          <section className="relative hidden min-h-[660px] overflow-hidden rounded-[30px] bg-[#07111B] shadow-2xl shadow-[#17223D]/15 lg:block">
            <Image
              src="/provider-signup-hero.png"
              alt=""
              fill
              priority
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#00060C] via-[#00060C]/50 to-[#00060C]/10" />
            <div className="absolute inset-x-8 top-8 flex items-center justify-between rounded-2xl border border-white/15 bg-black/20 p-4 text-white backdrop-blur-md">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-white/10">
                  <Store className="size-5 text-blue-200" />
                </span>
                <div>
                  <p className="font-semibold">RootIn Provider Studio</p>
                  <p className="text-xs text-white/65">Your creative business, in one place</p>
                </div>
              </div>
              <ShieldCheck className="size-5 text-emerald-300" />
            </div>
            <div className="absolute inset-x-8 bottom-8 text-white">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold backdrop-blur">
                <Sparkles className="size-3.5 text-amber-300" />
                Made for independent talent
              </span>
              <h1 className="mt-5 max-w-xl text-4xl font-extrabold leading-tight tracking-tight xl:text-5xl">
                Turn your craft into your next opportunity.
              </h1>
              <p className="mt-4 max-w-lg text-base leading-7 text-white/75">
                Build a profile clients can trust, showcase your services, and keep every new
                inquiry moving.
              </p>
              <div className="mt-7 grid grid-cols-3 gap-3 border-t border-white/15 pt-5">
                {[
                  { icon: BriefcaseBusiness, text: "Showcase your services" },
                  { icon: Users, text: "Reach new clients" },
                  { icon: MapPin, text: "Grow your network" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2 text-xs text-white/80">
                    <Icon className="size-4 shrink-0 text-blue-200" />
                    {text}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mx-auto w-full max-w-[500px] rounded-[28px] border border-[#E5E9F2] bg-white p-5 shadow-[0_20px_60px_rgba(40,48,90,0.08)] sm:p-8 lg:p-9">
            {step === "verify" ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setStep("signup");
                  }}
                  className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#66728F] transition hover:text-[#7C35FF]"
                >
                  <ArrowLeft className="size-4" />
                  Back to account details
                </button>
                <div className="mb-7">
                  <span className="mb-4 grid size-12 place-items-center rounded-2xl bg-[#F0ECFF] text-[#7C35FF]">
                    {isEmailVerification ? <Mail className="size-5" /> : <Phone className="size-5" />}
                  </span>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7C35FF]">
                    One last step
                  </p>
                  <h2 className="mt-2 text-3xl font-extrabold tracking-tight">
                    Verify your {isEmailVerification ? "email" : "phone"}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[#66728F]">
                    Enter the 6-digit code we sent to{" "}
                    <span className="font-semibold text-[#080B2B]">{verificationContact}</span>.
                  </p>
                </div>
                <form onSubmit={handleVerify} className="space-y-5">
                  {error && (
                    <Alert variant="destructive" role="alert">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <OtpInput value={otp} onChange={setOtp} />
                  <p className="text-center text-sm text-[#66728F]">
                    {cooldown > 0 ? (
                      <>Resend code in <span className="font-semibold text-[#080B2B]">{cooldown}s</span></>
                    ) : (
                      <button
                        type="button"
                        disabled={loading}
                        onClick={handleResend}
                        className="font-semibold text-[#7C35FF] hover:underline disabled:opacity-50"
                      >
                        Resend code
                      </button>
                    )}
                  </p>
                  <Button
                    type="submit"
                    size="lg"
                    disabled={loading || otp.length !== 6}
                    className="h-12 w-full rounded-xl bg-[#7C35FF] text-sm font-bold hover:bg-[#6B2EE0]"
                  >
                    {loading ? <Loader2 className="size-4 animate-spin" /> : "Verify & continue"}
                    {!loading && <ArrowRight className="size-4" />}
                  </Button>
                </form>
              </>
            ) : (
              <>
                <div className="mb-7">
                  <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#7C35FF]/15 bg-[#F4F0FF] px-3 py-1.5 text-xs font-bold text-[#7C35FF]">
                    <Store className="size-3.5" />
                    Provider account
                  </span>
                  <h1 className="text-3xl font-extrabold tracking-tight sm:text-[2.1rem]">
                    Let&apos;s grow your business.
                  </h1>
                  <p className="mt-2 text-sm leading-6 text-[#66728F]">
                    Create your provider account and get discovered by people looking for your
                    services.
                  </p>
                </div>

                <SocialAuthButtons className="mb-5" mode="signup" role="provider" googleOnly />
                <div className="mb-5 flex items-center gap-3 text-[11px] font-medium text-[#8993AA]">
                  <span className="h-px flex-1 bg-[#E2E7F0]" />
                  <span>or sign up with email</span>
                  <span className="h-px flex-1 bg-[#E2E7F0]" />
                </div>

                <form onSubmit={handleSignup} className="space-y-4">
                  {error && (
                    <Alert variant="destructive" role="alert">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-1.5">
                    <label htmlFor="provider-name" className="text-xs font-semibold text-[#34405C]">
                      Your name
                    </label>
                    <Input
                      id="provider-name"
                      type="text"
                      autoComplete="name"
                      value={formData.name}
                      onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                      placeholder="Full name"
                      required
                      className="h-12 rounded-xl border-[#E2E7F0] px-4"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="provider-email" className="text-xs font-semibold text-[#34405C]">
                      Email address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#8993AA]" />
                      <Input
                        id="provider-email"
                        type="email"
                        autoComplete="email"
                        value={formData.email}
                        onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                        placeholder="you@example.com"
                        required
                        className="h-12 rounded-xl border-[#E2E7F0] pl-11"
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label htmlFor="provider-phone" className="text-xs font-semibold text-[#34405C]">
                        Phone number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#8993AA]" />
                        <Input
                          id="provider-phone"
                          type="tel"
                          autoComplete="tel"
                          value={formData.phone}
                          onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
                          placeholder="+91 98765 43210"
                          required
                          className="h-12 rounded-xl border-[#E2E7F0] pl-11"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="provider-verification" className="text-xs font-semibold text-[#34405C]">
                        Verify with
                      </label>
                      <select
                        id="provider-verification"
                        value={formData.verification_method}
                        onChange={(event) =>
                          setFormData({
                            ...formData,
                            verification_method: event.target.value as "email" | "phone",
                          })
                        }
                        className="h-12 w-full rounded-xl border border-[#E2E7F0] bg-white px-3 text-sm text-[#080B2B] outline-none focus-visible:border-[#7C35FF] focus-visible:ring-2 focus-visible:ring-[#7C35FF]/10"
                      >
                        <option value="email">Email</option>
                        <option value="phone">Phone</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="provider-password" className="text-xs font-semibold text-[#34405C]">
                      Password
                    </label>
                    <div className="relative">
                      <Input
                        id="provider-password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        value={formData.password}
                        onChange={(event) => setFormData({ ...formData, password: event.target.value })}
                        placeholder="Create a password"
                        required
                        className="h-12 rounded-xl border-[#E2E7F0] px-4 pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#8993AA] hover:text-[#7C35FF]"
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    disabled={loading}
                    className="h-12 w-full rounded-xl bg-[#7C35FF] text-sm font-bold hover:bg-[#6B2EE0]"
                  >
                    {loading ? <Loader2 className="size-4 animate-spin" /> : "Create provider account"}
                    {!loading && <ArrowRight className="size-4" />}
                  </Button>
                  <p className="text-center text-xs leading-5 text-[#8993AA]">
                    By continuing, you agree to RootIn&apos;s{" "}
                    <Link href="/terms" className="font-medium text-[#66728F] underline underline-offset-2">Terms</Link>
                    {" "}and{" "}
                    <Link href="/privacy" className="font-medium text-[#66728F] underline underline-offset-2">Privacy Policy</Link>.
                  </p>
                </form>

                <div className="mt-5 flex items-center justify-center gap-2 text-xs text-[#66728F]">
                  <Check className="size-3.5 text-emerald-600" />
                  Free to join. You control what clients see.
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
