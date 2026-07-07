import type {
  UpdateRecruiterProfileInput,
  RecruiterProfile,
} from '@/lib/validations/recruiter-profile.schema';

export const DEFAULT_VALUES: UpdateRecruiterProfileInput = {
  company_name: '',
  company_website: '',
  linkedin_company_url: '',
  company_size: '',
  specialties: [],
  position: '',
  profile_photo: '',
};

export function hydrateFromServer(profile: RecruiterProfile): UpdateRecruiterProfileInput {
  return {
    company_name: profile.company_name ?? '',
    company_website: profile.company_website ?? '',
    linkedin_company_url: profile.linkedin_company_url ?? '',
    company_size: profile.company_size ?? '',
    specialties: profile.specialties ?? [],
    position: profile.position ?? '',
    profile_photo: profile.profile_photo ?? '',
  };
}

export function buildPayload(values: UpdateRecruiterProfileInput): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(values)) {
    if (val === undefined || val === null) continue;
    if (typeof val === 'string' && val !== '') {
      out[key] = val;
    }
    if (Array.isArray(val) && val.length > 0) {
      out[key] = val;
    }
  }
  if (values.profile_photo !== undefined) {
    out.profile_photo = values.profile_photo;
  }
  return out;
}
