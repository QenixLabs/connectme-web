import { AxiosError } from 'axios';

export function getApiErrorMessage(err: unknown, fallback = "Something went wrong"): string {
  const error = err as AxiosError<{ message?: string }> | { message?: string } | null;
  if (error && 'response' in error) {
    return error.response?.data?.message || error.message || fallback;
  }
  return (error as { message?: string })?.message || fallback;
}

export function sanitizeDigits(value: string, maxLength?: number): string {
  const digits = value.replace(/\D/g, "");
  return maxLength ? digits.slice(0, maxLength) : digits;
}
