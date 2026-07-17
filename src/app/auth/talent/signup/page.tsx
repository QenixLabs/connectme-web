"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronRight,
  Check,
  X,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  User,
  Mail,
  Phone,
  LockKeyhole,
  Globe,
  Clapperboard,
  Camera,
  Music4,
  Mic2,
  Video,
  PenTool,
  Sparkles,
} from "lucide-react";
import { authApi, talentApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/formatters";
import { PROFESSIONS } from "@/lib/professions";
import { getSpecialtiesForProfession, INFLUENCER_SPECIALTIES } from "@/lib/profession-fields";
import { AuthLayout } from "@/components/layout/auth-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TagInput } from "@/components/ui/tag-input";

import { PhoneInput } from "@/components/ui/phone-input";
import { PasswordStrength } from "@/components/ui/password-strength";
import { PasswordRules } from "@/components/ui/password-rules";
import { Switch } from "@/components/ui/switch";
import { StepIndicator } from "@/components/ui/step-indicator";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

type Step = 1 | 2 | 3;

const PROFESSION_ICONS: Record<string, React.ReactNode> = {
  Actor: <Clapperboard className="w-5 h-5" strokeWidth={1.5} />,
  Model: <Camera className="w-5 h-5" strokeWidth={1.5} />,
  Dancer: <Music4 className="w-5 h-5" strokeWidth={1.5} />,
  Musician: <Music4 className="w-5 h-5" strokeWidth={1.5} />,
  "Voice Artist": <Mic2 className="w-5 h-5" strokeWidth={1.5} />,
  Photographer: <Camera className="w-5 h-5" strokeWidth={1.5} />,
  Influencer: <Video className="w-5 h-5" strokeWidth={1.5} />,
  "Extra / Background": <PenTool className="w-5 h-5" strokeWidth={1.5} />,
  Other: <Sparkles className="w-5 h-5" strokeWidth={1.5} />,
};

const STEP_LABELS = [
  { label: "Profession", description: "Who are you?" },
  { label: "Details", description: "About you" },
  { label: "Security", description: "Set password" },
];

const schema = z
  .object({
    profession: z.string().min(1, "Please select your profession"),
    customProfession: z.string().optional(),
    creatorLink: z
      .string()
      .url("Enter a valid URL")
      .optional()
      .or(z.literal("")),
    username: z
      .string()
      .min(6, "Username must be at least 6 characters")
      .max(20, "Username must be 20 characters or fewer")
      .regex(/^[a-zA-Z0-9]+$/, "Username can only contain letters and numbers"),
    email: z.string().min(1, "Email is required").email("Enter a valid email address"),
    phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/\d/, "Password must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    specialties: z.array(z.string()).optional(),
    is_influencer: z.boolean().optional(),
    influencer_speciality: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => {
      if (data.profession === "Influencer") {
        return data.creatorLink && data.creatorLink.length > 0;
      }
      return true;
    },
    { message: "Creator link is required for influencers", path: ["creatorLink"] },
  )
  .refine(
    (data) => {
      const needsSpeciality = data.is_influencer || data.profession === "Influencer";
      if (needsSpeciality) {
        return data.influencer_speciality && data.influencer_speciality.length > 0;
      }
      return true;
    },
    { message: "Influencer speciality is required", path: ["influencer_speciality"] },
  );

type FormValues = z.input<typeof schema>;

const stepVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

export default function TalentSignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [usernameStatus, setUsernameStatus] = useState<
    "idle" | "checking" | "available" | "taken"
  >("idle");
  const usernameCheckTimeout = useRef<NodeJS.Timeout | null>(null);
  const [verificationMethod, setVerificationMethod] = useState<"email" | "phone">("email");

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      profession: "",
      customProfession: "",
      creatorLink: "",
      username: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      specialties: [],
      is_influencer: false,
      influencer_speciality: "",
    },
    mode: "onChange",
  });

  const password = form.watch("password");
  const usernameValue = form.watch("username");
  const selectedProfession = form.watch("profession");

  const checkUsername = async (username: string) => {
    if (!username || username.length < 6 || username.length > 20) {
      setUsernameStatus("idle");
      return;
    }
    if (!/^[a-zA-Z0-9]+$/.test(username)) {
      setUsernameStatus("idle");
      return;
    }

    setUsernameStatus("checking");
    try {
      const available = await talentApi.checkUsernameAvailability(username);
      setUsernameStatus(available ? "available" : "taken");
      if (!available) {
        form.setError("username", { message: "This username is already taken" });
      } else {
        form.clearErrors("username");
      }
    } catch {
      setUsernameStatus("idle");
    }
  };

  const handleUsernameChange = (value: string) => {
    form.setValue("username", value, { shouldValidate: true });
    setUsernameStatus("idle");
    form.clearErrors("username");

    if (usernameCheckTimeout.current) {
      clearTimeout(usernameCheckTimeout.current);
    }
    if (value.length >= 6) {
      usernameCheckTimeout.current = setTimeout(() => {
        checkUsername(value);
      }, 2000);
    }
  };

  const handleUsernameBlur = () => {
    if (usernameCheckTimeout.current) {
      clearTimeout(usernameCheckTimeout.current);
    }
    if (usernameValue.length >= 6) {
      checkUsername(usernameValue);
    }
  };

  useEffect(() => {
    return () => {
      if (usernameCheckTimeout.current) {
        clearTimeout(usernameCheckTimeout.current);
      }
    };
  }, []);

  const goToStep = (next: Step) => {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  };

  const handleNext = async () => {
    setServerError(null);
    if (step === 1) {
      const ok = await form.trigger(["profession", "creatorLink"]);
      const profession = form.getValues("profession");
      if (profession === "Influencer" && !form.getValues("creatorLink")?.trim()) {
        form.setError("creatorLink", { message: "Creator link is required for influencers" });
        return;
      }
      if (profession === "Other" && !form.getValues("customProfession")?.trim()) {
        form.setError("customProfession", { message: "Please enter your profession" });
        return;
      }
      if (!ok) return;
      goToStep(2);
    } else if (step === 2) {
      const ok = await form.trigger(["username", "email", "phone"]);
      if (usernameStatus === "taken") {
        form.setError("username", { message: "This username is already taken" });
        return;
      }
      if (!ok) return;
      goToStep(3);
    }
  };

  const handleBack = () => {
    setServerError(null);
    goToStep(Math.max(step - 1, 1) as Step);
  };

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    setServerError(null);

    try {
      const finalProfession =
        values.profession === "Other" ? values.customProfession : values.profession;
      await authApi.signup({
        role: "talent",
        email: values.email,
        phone: `+91${values.phone}`,
        password: values.password,
        auth_provider: "credentials",
        username: values.username,
        profession: finalProfession,
        creator_link: values.creatorLink || undefined,
        verification_method: verificationMethod,
        specialties: values.specialties?.length ? values.specialties : undefined,
        is_influencer: values.is_influencer || undefined,
        influencer_speciality: values.influencer_speciality || undefined,
      });
      router.push(
        `/auth/verify-email?email=${encodeURIComponent(values.email)}&method=${verificationMethod}`,
      );
    } catch (err: unknown) {
      setServerError(getApiErrorMessage(err, "Registration failed"));
    } finally {
      setLoading(false);
    }
  };

  const passwordRules = [
    { ok: password.length >= 8, text: "At least 8 characters" },
    { ok: /[A-Z]/.test(password), text: "One uppercase letter" },
    { ok: /\d/.test(password), text: "One number" },
  ];

  return (
    <AuthLayout subtitle="Create your talent account" showGlow>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.45, ease: [0.25, 0.4, 0.25, 1] }}
      >
        <div className="mb-6">
          <StepIndicator steps={STEP_LABELS} current={step - 1} className="justify-center" />
        </div>

        <Card>
          <CardContent className="px-8 py-8">
            <div>
              <h2 className="text-xl font-serif font-bold text-text-primary text-center tracking-tight">
                {step === 1 ? "What do you do?" : step === 2 ? "Tell us about you" : "Secure your account"}
              </h2>
              <p className="text-sm text-text-tertiary font-light text-center mt-1">
                {step === 1
                  ? "Select your primary profession to get started"
                  : step === 2
                    ? "Set up your profile details"
                    : "Choose a strong password"}
              </p>
            </div>

            {serverError && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={step}
                    custom={direction}
                    variants={stepVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.35, ease: [0.25, 0.4, 0.25, 1] }}
                  >
                    {/* STEP 1: Profession */}
                    {step === 1 && (
                      <div className="mt-6 space-y-5">
                        <div className="grid grid-cols-2 gap-3">
                          {[...PROFESSIONS, "Other"].map((p) => {
                            const isSelected = selectedProfession === p;
                            return (
                              <motion.button
                                key={p}
                                type="button"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                  form.setValue("profession", p, { shouldValidate: true });
                                  form.clearErrors("profession");
                                  form.clearErrors("customProfession");
                                  form.clearErrors("creatorLink");
                                }}
                                className={`relative rounded-xl border-2 p-4 text-center transition-all duration-200 ${
                                  isSelected
                                    ? "border-brand bg-brand-light/50 shadow-sm shadow-brand/5"
                                    : "border-border/60 bg-card hover:border-brand/20 hover:bg-card-hover"
                                }`}
                              >
                                <div
                                  className={`mx-auto mb-2 w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-200 ${
                                    isSelected
                                      ? "bg-brand/10 text-brand"
                                      : "bg-muted-bg text-text-muted"
                                  }`}
                                >
                                  {PROFESSION_ICONS[p] ?? <Sparkles className="w-5 h-5" strokeWidth={1.5} />}
                                </div>
                                <div className="font-medium text-sm text-text-primary">
                                  {p}
                                </div>
                                {isSelected && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute top-2 right-2 w-5 h-5 rounded-full bg-brand flex items-center justify-center"
                                  >
                                    <Check className="w-3 h-3 text-white" strokeWidth={2.5} />
                                  </motion.div>
                                )}
                              </motion.button>
                            );
                          })}
                        </div>
                        <FormMessage>
                          {form.formState.errors.profession?.message}
                        </FormMessage>

                        {selectedProfession === "Other" && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                          >
                            <FormField
                              control={form.control}
                              name="customProfession"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Your Profession</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Enter your profession"
                                      className="h-11 rounded-xl"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </motion.div>
                        )}

                        {selectedProfession && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                          >
                            <FormField
                              control={form.control}
                              name="creatorLink"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>
                                    Creator link
                                    {selectedProfession === "Influencer" ? (
                                      <span className="text-rose-500"> *</span>
                                    ) : (
                                      <span className="text-text-muted font-normal">
                                        {" "}
                                        (optional)
                                      </span>
                                    )}
                                  </FormLabel>
                                  <FormControl>
                                    <div className="relative group">
                                      <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center text-text-muted group-focus-within:text-brand transition-colors duration-200">
                                        <Globe className="w-4 h-4" strokeWidth={1.5} />
                                      </div>
                                      <Input
                                        placeholder="https://instagram.com/yourhandle"
                                        className="pl-10 h-11 rounded-xl"
                                        {...field}
                                      />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </motion.div>
                        )}

                        {selectedProfession &&
                          selectedProfession !== "Other" &&
                          getSpecialtiesForProfession(selectedProfession).length > 0 && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                            >
                              <div className="border-t border-border/40 pt-4 mt-2">
                                <FormField
                                  control={form.control}
                                  name="specialties"
                                  render={({ field: rhfField }) => (
                                    <FormItem>
                                      <FormLabel className="text-sm font-medium text-text-primary">
                                        Specialties
                                      </FormLabel>
                                      <TagInput
                                        value={rhfField.value ?? []}
                                        onChange={rhfField.onChange}
                                        suggestions={getSpecialtiesForProfession(
                                          selectedProfession,
                                        )}
                                        placeholder="Add specialty..."
                                        containerClassName="[&>div]:rounded-xl [&>div]:border-border [&>div]:focus-within:border-gold/50 [&>div]:focus-within:ring-2 [&>div]:focus-within:ring-gold/25 [&>div]:bg-cream-pale/80"
                                      />
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </motion.div>
                          )}

                        {(selectedProfession === "Influencer" || form.watch("is_influencer")) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                          >
                            <div className="border-t border-border/40 pt-4 space-y-4">
                              {selectedProfession !== "Influencer" && (
                                <div className="flex items-center justify-between rounded-xl border border-border/60 bg-cream-pale/80 p-3">
                                  <div className="flex items-center gap-3">
                                    <Sparkles className="size-4 text-gold" />
                                    <div>
                                      <p className="text-sm font-medium">Influencer</p>
                                      <p className="text-xs text-ink/50">
                                        Mark as influencer even if it's not your main profession
                                      </p>
                                    </div>
                                  </div>
                                  <FormField
                                    control={form.control}
                                    name="is_influencer"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormControl>
                                          <Switch
                                            checked={field.value ?? false}
                                            onCheckedChange={field.onChange}
                                          />
                                        </FormControl>
                                      </FormItem>
                                    )}
                                  />
                                </div>
                              )}
                              <FormField
                                control={form.control}
                                name="influencer_speciality"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-sm font-medium text-text-primary">
                                      Influencer Speciality <span className="text-rose-500">*</span>
                                    </FormLabel>
                                    <Select
                                      onValueChange={field.onChange}
                                      value={field.value || ""}
                                    >
                                      <FormControl>
                                        <SelectTrigger className="h-10 text-sm rounded-xl border-border bg-cream-pale/80">
                                          <SelectValue placeholder="Choose speciality..." />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {INFLUENCER_SPECIALTIES.map((s) => (
                                          <SelectItem key={s} value={s}>{s}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </motion.div>
                        )}

                        <Button
                          type="button"
                          variant="dark"
                          size="lg"
                          className="w-full h-11 rounded-xl text-sm font-semibold"
                          onClick={handleNext}
                          disabled={
                            !selectedProfession ||
                            (selectedProfession === "Other" &&
                              !form.watch("customProfession")?.trim())
                          }
                        >
                          Continue
                          <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                        </Button>
                      </div>
                    )}

                    {/* STEP 2: Details */}
                    {step === 2 && (
                      <div className="mt-6 space-y-4">
                        <FormField
                          control={form.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-medium uppercase tracking-widest text-text-muted">
                                Username
                              </FormLabel>
                              <FormControl>
                                <div className="relative group">
                                  <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center text-text-muted group-focus-within:text-brand transition-colors duration-200">
                                    <User className="w-4 h-4" strokeWidth={1.5} />
                                  </div>
                                  <Input
                                    placeholder="alphanumeric (6-20)"
                                    className="pl-10 h-11 rounded-xl"
                                    {...field}
                                    onChange={(e) => handleUsernameChange(e.target.value)}
                                    onBlur={handleUsernameBlur}
                                  />
                                </div>
                              </FormControl>
                              <div className="flex items-center gap-2 mt-1.5 min-h-[18px]">
                                {usernameStatus === "checking" && (
                                  <span className="text-xs text-text-muted">
                                    Checking availability...
                                  </span>
                                )}
                                {usernameStatus === "available" && (
                                  <span className="text-xs text-success flex items-center gap-1 font-medium">
                                    <Check className="w-3 h-3" /> Available
                                  </span>
                                )}
                                {usernameStatus === "taken" && (
                                  <span className="text-xs text-destructive flex items-center gap-1 font-medium">
                                    <X className="w-3 h-3" /> Already taken
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-text-muted mt-0.5 font-light">
                                6-20 characters, letters and numbers only
                              </p>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-medium uppercase tracking-widest text-text-muted">
                                Email Address
                              </FormLabel>
                              <FormControl>
                                <div className="relative group">
                                  <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center text-text-muted group-focus-within:text-brand transition-colors duration-200">
                                    <Mail className="w-4 h-4" strokeWidth={1.5} />
                                  </div>
                                  <Input
                                    type="email"
                                    placeholder="you@example.com"
                                    className="pl-10 h-11 rounded-xl"
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-medium uppercase tracking-widest text-text-muted">
                                Mobile Number
                              </FormLabel>
                              <FormControl>
                                <div className="relative group">
                                  <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center text-text-muted z-10">
                                    <Phone className="w-4 h-4" strokeWidth={1.5} />
                                  </div>
                                  <div className="pl-10">
                                    <PhoneInput
                                      value={field.value}
                                      onChange={field.onChange}
                                      showFlag
                                      placeholder="9876543210"
                                    />
                                  </div>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="space-y-3 pt-1">
                          <label className="text-xs font-medium uppercase tracking-widest text-text-muted">
                            Receive OTP via
                          </label>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setVerificationMethod("email")}
                              className={`flex-1 py-2.5 px-4 rounded-xl border-2 text-sm font-medium transition-all duration-200 ${
                                verificationMethod === "email"
                                  ? "border-brand bg-brand-light/50 text-text-primary"
                                  : "border-border/60 bg-card text-text-muted hover:border-border"
                              }`}
                            >
                              Email
                            </button>
                            <button
                              type="button"
                              onClick={() => setVerificationMethod("phone")}
                              className={`flex-1 py-2.5 px-4 rounded-xl border-2 text-sm font-medium transition-all duration-200 ${
                                verificationMethod === "phone"
                                  ? "border-brand bg-brand-light/50 text-text-primary"
                                  : "border-border/60 bg-card text-text-muted hover:border-border"
                              }`}
                            >
                              Phone
                            </button>
                          </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                          <Button
                            type="button"
                            variant="secondary"
                            size="lg"
                            className="h-11 rounded-xl"
                            onClick={handleBack}
                          >
                            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
                            Back
                          </Button>
                          <Button
                            type="button"
                            variant="dark"
                            size="lg"
                            className="flex-1 h-11 rounded-xl text-sm font-semibold"
                            onClick={handleNext}
                          >
                            Continue
                            <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* STEP 3: Security */}
                    {step === 3 && (
                      <div className="mt-6 space-y-4">
                        <FormField
                          control={form.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-medium uppercase tracking-widest text-text-muted">
                                Password
                              </FormLabel>
                              <FormControl>
                                <div className="relative group">
                                  <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center text-text-muted group-focus-within:text-brand transition-colors duration-200">
                                    <LockKeyhole className="w-4 h-4" strokeWidth={1.5} />
                                  </div>
                                  <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Min. 8 characters"
                                    className="pl-10 pr-10 h-11 rounded-xl"
                                    {...field}
                                  />
                                  <button
                                    type="button"
                                    tabIndex={-1}
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-text-muted hover:text-text-secondary hover:bg-muted-bg transition-colors"
                                  >
                                    {showPassword ? (
                                      <EyeOff className="w-4 h-4" strokeWidth={1.3} />
                                    ) : (
                                      <Eye className="w-4 h-4" strokeWidth={1.3} />
                                    )}
                                  </button>
                                </div>
                              </FormControl>
                              <PasswordStrength password={password} />
                              <PasswordRules rules={passwordRules} />
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-medium uppercase tracking-widest text-text-muted">
                                Confirm Password
                              </FormLabel>
                              <FormControl>
                                <div className="relative group">
                                  <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center text-text-muted group-focus-within:text-brand transition-colors duration-200">
                                    <LockKeyhole className="w-4 h-4" strokeWidth={1.5} />
                                  </div>
                                  <Input
                                    type={showConfirm ? "text" : "password"}
                                    placeholder="Re-enter your password"
                                    className="pl-10 pr-10 h-11 rounded-xl"
                                    {...field}
                                  />
                                  <button
                                    type="button"
                                    tabIndex={-1}
                                    onClick={() => setShowConfirm((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-text-muted hover:text-text-secondary hover:bg-muted-bg transition-colors"
                                  >
                                    {showConfirm ? (
                                      <EyeOff className="w-4 h-4" strokeWidth={1.3} />
                                    ) : (
                                      <Eye className="w-4 h-4" strokeWidth={1.3} />
                                    )}
                                  </button>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex gap-3 pt-4">
                          <Button
                            type="button"
                            variant="secondary"
                            size="lg"
                            className="h-11 rounded-xl"
                            onClick={handleBack}
                          >
                            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
                            Back
                          </Button>
                          <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            className="flex-1 h-11 rounded-xl text-sm font-semibold"
                            disabled={loading}
                            isLoading={loading}
                            loadingLabel="Creating account..."
                          >
                            Create account
                          </Button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </form>
            </Form>

            {step === 1 && (
              <div className="mt-6 pt-6 border-t border-border/40">
                <p className="text-center text-xs text-text-muted font-light mb-3">
                  Already have an account?
                </p>
                <Link
                  href="/auth/login"
                  className="block w-full h-11 rounded-xl border border-border/60 bg-card text-text-primary text-sm font-medium hover:border-brand/30 hover:bg-brand-light/30 active:scale-[0.98] transition-all duration-200 flex items-center justify-center"
                >
                  Sign in instead
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-text-muted mt-6 font-light">
          By creating an account you agree to our{" "}
          <Link
            href="/terms"
            className="text-text-tertiary hover:text-text-primary underline underline-offset-2 transition-colors"
          >
            Terms
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="text-text-tertiary hover:text-text-primary underline underline-offset-2 transition-colors"
          >
            Privacy Policy
          </Link>
        </p>
      </motion.div>
    </AuthLayout>
  );
}
