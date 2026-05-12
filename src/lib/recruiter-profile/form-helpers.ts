import type {
  UpdateRecruiterProfileInput,
  RecruiterProfile,
} from '@/lib/validations/recruiter-profile.schema';

export const DEFAULT_VALUES: UpdateRecruiterProfileInput = {
  company_name: '',
  company_website: '',
  linkedin_company_url: '',
  company_size: '',
  industry: '',
  position: '',
};

export function hydrateFromServer(profile: RecruiterProfile): UpdateRecruiterProfileInput {
  return {
    company_name: profile.company_name ?? '',
    company_website: profile.company_website ?? '',
    linkedin_company_url: profile.linkedin_company_url ?? '',
    company_size: profile.company_size ?? '',
    industry: profile.industry ?? '',
    position: profile.position ?? '',
  };
}

export function buildPayload(values: UpdateRecruiterProfileInput): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(values)) {
    if (val === undefined || val === null) continue;
    if (typeof val === 'string' && val !== '') {
      out[key] = val;
    }
  }
  return out;
}
