export interface ProviderSignupData {
  role: "Service Provider" | "Client / Recruiter";
  firstName: string;
  lastName: string;
  email: string;
  phoneCountry: string;
  phone: string;
  password: string;
  providerType: "individual" | "company" | "studio" | "agency" | "equipment" | "other" | string;
  identityTab: "individual" | "company";
  fullName: string;
  businessName: string;
  tagline: string;
  about: string;
  categories: string[];
  logoFile?: File | null;
  logoPreview?: string | null;
}

export interface StepProps {
  data: ProviderSignupData;
  update: (patch: Partial<ProviderSignupData>) => void;
  onBack?: () => void;
  onNext: () => void;
  loading?: boolean;
  error?: string | null;
}
