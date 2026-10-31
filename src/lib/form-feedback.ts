import { toast } from "sonner";

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  Object.prototype.toString.call(value) === "[object Object]";

/**
 * Pulls the first human-readable validation message out of a react-hook-form
 * errors object (handles nested `types` entries as well).
 */
export function firstErrorMessage(errors: unknown): string | undefined {
  if (!isPlainObject(errors)) return undefined;

  for (const value of Object.values(errors)) {
    if (!isPlainObject(value)) continue;
    const message = value.message;
    if (typeof message === "string" && message.trim()) return message;
    const nested = firstErrorMessage(value);
    if (nested) return nested;
  }

  return undefined;
}

/** Shows a toast for the first validation error, so failures are never just a red mark. */
export function toastFormError(
  errors: unknown,
  fallback = "Please fix the highlighted fields and try again.",
): string {
  const message = firstErrorMessage(errors) ?? fallback;
  toast.error(message);
  return message;
}
