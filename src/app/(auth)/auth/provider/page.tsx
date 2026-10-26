"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api/auth";
import { SocialAuthButtons } from "@/components/auth/social-auth-buttons";
import { useAuthStore } from "@/providers/auth-store-provider";

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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await authApi.signup({
        ...formData,
        role: "provider",
      });
      setStep("verify");
    } catch (err: any) {
      setError(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await authApi.verifyOtp(formData.email, otp);
      setAccessToken(result.access_token);
      await fetchUser();
      router.push("/provider/onboarding");
    } catch (err: any) {
      setError(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  if (step === "verify") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <h1 className="text-2xl font-bold">Verify OTP</h1>
          <form onSubmit={handleVerify} className="space-y-4">
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              className="w-full p-2 border rounded"
              required
            />
            {error && <p className="text-red-500">{error}</p>}
            <button type="submit" disabled={loading} className="w-full p-2 bg-primary text-white rounded">
              {loading ? "Verifying..." : "Verify"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold">Provider Signup</h1>
        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Full Name"
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="Email"
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Password"
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="Phone (+91...)"
            className="w-full p-2 border rounded"
            required
          />
          <select
            value={formData.verification_method}
            onChange={(e) => setFormData({ ...formData, verification_method: e.target.value as "email" | "phone" })}
            className="w-full p-2 border rounded"
          >
            <option value="email">Verify via Email</option>
            <option value="phone">Verify via Phone</option>
          </select>
          {error && <p className="text-red-500">{error}</p>}
          <button type="submit" disabled={loading} className="w-full p-2 bg-primary text-white rounded">
            {loading ? "Signing up..." : "Sign Up"}
          </button>
          <SocialAuthButtons mode="signup" role="provider" googleOnly />
        </form>
      </div>
    </div>
  );
}
