import { PROFESSIONS } from '@/lib/professions';
import { INFLUENCER_SPECIALTIES } from '@/lib/profession-fields';

export type Option = { value: string; label: string };

const opt = (value: string, label?: string): Option => ({ value, label: label ?? value });

export const GENDER_OPTIONS: Option[] = [
  opt('male', 'Male'),
  opt('female', 'Female'),
  opt('non_binary', 'Non-binary'),
  opt('prefer_not_to_say', 'Prefer not to say'),
];

export const BODY_TYPES: Option[] = [
  opt('slim', 'Slim'),
  opt('athletic', 'Athletic'),
  opt('average', 'Average'),
  opt('muscular', 'Muscular'),
  opt('plus_size', 'Plus size'),
];

export const COMPLEXIONS: Option[] = [
  opt('fair', 'Fair'),
  opt('wheatish', 'Wheatish'),
  opt('olive', 'Olive'),
  opt('brown', 'Brown'),
  opt('dark', 'Dark'),
];

export const HAIR_COLORS: Option[] = [
  opt('black', 'Black'),
  opt('brown', 'Brown'),
  opt('blonde', 'Blonde'),
  opt('red', 'Red'),
  opt('grey', 'Grey'),
  opt('white', 'White'),
  opt('other', 'Other'),
];

export const HAIR_LENGTHS: Option[] = [
  opt('bald', 'Bald'),
  opt('short', 'Short'),
  opt('medium', 'Medium'),
  opt('long', 'Long'),
];

export const EYE_COLORS: Option[] = [
  opt('black', 'Black'),
  opt('brown', 'Brown'),
  opt('hazel', 'Hazel'),
  opt('green', 'Green'),
  opt('blue', 'Blue'),
  opt('grey', 'Grey'),
];

export const FLUENCIES: Option[] = [
  opt('basic', 'Basic'),
  opt('conversational', 'Conversational'),
  opt('fluent', 'Fluent'),
  opt('native', 'Native'),
];

export const VISIBILITIES: Option[] = [
  opt('public', 'Public'),
  opt('private', 'Private'),
];

export const AVAILABILITY_OPTIONS: Option[] = [
  opt('available', 'Available'),
  opt('busy', 'Busy'),
  opt('not_available', 'Not available'),
];

export const PRIVACY_MODE_OPTIONS: Option[] = [
  opt('public', 'Public'),
  opt('private', 'Private'),
];

export const PROFICIENCY_OPTIONS: Option[] = [
  opt('beginner', 'Beginner'),
  opt('intermediate', 'Intermediate'),
  opt('expert', 'Expert'),
];

export const PROFESSION_SUGGESTIONS: string[] = [...PROFESSIONS];

export const SOCIAL_PLATFORMS: Option[] = [
  opt('instagram', 'Instagram'),
  opt('youtube', 'YouTube'),
  opt('linkedin', 'LinkedIn'),
  opt('twitter', 'Twitter / X'),
  opt('facebook', 'Facebook'),
  opt('tiktok', 'TikTok'),
  opt('website', 'Website'),
  opt('github', 'GitHub'),
  opt('behance', 'Behance'),
  opt('dribbble', 'Dribbble'),
  opt('vimeo', 'Vimeo'),
  opt('spotify', 'Spotify'),
  opt('snapchat', 'Snapchat'),
  opt('threads', 'Threads'),
  opt('other', 'Other'),
];

export function dynamicOptions(currentValue: string | undefined, options: Option[]): Option[] {
  if (!currentValue) return options;
  if (options.some((o) => o.value === currentValue)) return options;
  return [...options, { value: currentValue, label: currentValue }];
}

export const INFLUENCER_SPECIALTY_OPTIONS: Option[] = INFLUENCER_SPECIALTIES.map((s) => opt(s, s));
