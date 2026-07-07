export type Option = { value: string; label: string };

const opt = (value: string, label?: string): Option => ({ value, label: label ?? value });

export const COMPANY_SIZE_OPTIONS: Option[] = [
  opt('1-10', '1-10 employees'),
  opt('11-50', '11-50 employees'),
  opt('51-200', '51-200 employees'),
  opt('201-500', '201-500 employees'),
  opt('501-1000', '501-1000 employees'),
  opt('1001-5000', '1001-5000 employees'),
  opt('5001-10000', '5001-10000 employees'),
  opt('10001+', '10001+ employees'),
];

export const POSITION_OPTIONS: Option[] = [
  opt('casting_director', 'Casting Director'),
  opt('talent_agent', 'Talent Agent'),
  opt('producer', 'Producer'),
  opt('director', 'Director'),
  opt('hiring_manager', 'Hiring Manager'),
  opt('recruiter', 'Recruiter'),
  opt('talent_scout', 'Talent Scout'),
  opt('production_manager', 'Production Manager'),
  opt('owner_founder', 'Owner / Founder'),
  opt('other', 'Other'),
];

export function dynamicOptions(currentValue: string | undefined, options: Option[]): Option[] {
  if (!currentValue) return options;
  if (options.some((o) => o.value === currentValue)) return options;
  return [...options, { value: currentValue, label: currentValue }];
}
