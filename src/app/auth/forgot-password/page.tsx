"use client";

import { useState } from "react";
import Link from "next/link";
import { authApi } from "@/lib/api";

type Step = "email" | "otp" | "success";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await authApi.forgotPassword(email);
      setStep("otp");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    try {
      await authApi.resetPassword(email, otp, newPassword);
      setStep("success");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/\d/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    const levels = [
      { label: "", color: "bg-slate-200" },
      { label: "Weak", color: "bg-red-400" },
      { label: "Fair", color: "bg-amber-400" },
      { label: "Good", color: "bg-emerald-400" },
      { label: "Strong", color: "bg-emerald-500" },
    ];
    return { score, ...levels[score] };
  };

  const strength = passwordStrength(newPassword);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block text-2xl font-bold text-slate-900">
            Connect<span className="text-amber-500">Me</span>
          </Link>
          <p className="mt-2 text-sm text-slate-500">
            {step === "email" && "Enter your email to reset password"}
            {step === "otp" && "Enter the OTP sent to your email"}
            {step === "success" && "Your password has been reset"}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-8 py-8">
            {error && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-5">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M8 5v3.5M8 11v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                {error}
              </div>
            )}

            {step === "email" && (
              <form onSubmit={handleRequestOtp} className="space-y-5">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5 tracking-wide uppercase">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    placeholder="you@example.com"
                    className="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" />
                        <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                      Sending...
                    </>
                  ) : (
                    "Send OTP"
                  )}
                </button>
              </form>
            )}

            {step === "otp" && (
              <form onSubmit={handleResetPassword} className="space-y-5">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5 tracking-wide uppercase">
                    OTP Code
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => { setOtp(e.target.value); setError(""); }}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    className="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5 tracking-wide uppercase">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => { setNewPassword(e.target.value); setError(""); }}
                      placeholder="At least 6 characters"
                      className="w-full h-11 px-4 pr-11 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      tabIndex={-1}
                    >
                      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                        <path d="M2 8s2.5-4 6-4 6 4 6 4-2.5 4-6 4-6-4-6-4z" stroke="currentColor" strokeWidth="1.3" />
                        <circle cx="8" cy="8" r="1.5" stroke="currentColor" strokeWidth="1.3" />
                      </svg>
                    </button>
                  </div>

                  {newPassword.length > 0 && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-all ${
                              i < strength.score ? strength.color : "bg-slate-200"
                            }`}
                          />
                        ))}
                      </div>
                      {strength.label && (
                        <p className="text-xs text-slate-400">
                          Strength: <span className="font-medium text-slate-600">{strength.label}</span>
                        </p>
                      )}
                    </div>
                  )}

                  <ul className="mt-2 space-y-0.5">
                    {[
                      { ok: newPassword.length >= 8, text: "At least 8 characters" },
                      { ok: /[A-Z]/.test(newPassword), text: "One uppercase letter" },
                      { ok: /\d/.test(newPassword), text: "One number" },
                    ].map((r) => (
                      <li key={r.text} className={`flex items-center gap-1.5 text-xs transition-colors ${r.ok ? "text-emerald-600" : "text-slate-400"}`}>
                        <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                          {r.ok ? (
                            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          ) : (
                            <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.2" />
                          )}
                        </svg>
                        {r.text}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5 tracking-wide uppercase">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                    placeholder="Re-enter new password"
                    className="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" />
                        <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                      Resetting...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </button>
              </form>
            )}

            {step === "success" && (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <p className="text-slate-600 mb-6">
                  Your password has been reset successfully. You can now sign in with your new password.
                </p>
                <Link
                  href="/auth/login"
                  className="block w-full h-11 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 active:scale-[0.98] transition-all flex items-center justify-center"
                >
                  Go to Login
                </Link>
              </div>
            )}
          </div>
        </div>

        {step !== "success" && (
          <p className="text-center text-sm text-slate-500 mt-6">
            Remember your password?{" "}
            <Link href="/auth/login" className="text-amber-600 hover:text-amber-700 font-medium">
              Sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}