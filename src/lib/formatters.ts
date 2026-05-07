export function getApiErrorMessage(err: any, fallback = "Something went wrong"): string {
  return err?.response?.data?.message || err?.message || fallback;
}

export function sanitizeDigits(value: string, maxLength?: number): string {
  const digits = value.replace(/\D/g, "");
  return maxLength ? digits.slice(0, maxLength) : digits;
}
