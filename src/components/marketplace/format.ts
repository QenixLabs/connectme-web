import type { IndicativePrice } from "@/lib/api/marketplace";

const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
};

export function formatAmount(amount: number, currency?: string): string {
  const symbol = CURRENCY_SYMBOLS[(currency ?? "INR").toUpperCase()];
  const value = amount.toLocaleString("en-IN");
  return symbol ? `${symbol}${value}` : `${(currency ?? "INR").toUpperCase()} ${value}`;
}

export function formatIndicativePrice(price?: IndicativePrice | null): string {
  if (!price) return "Price on request";
  return `${formatAmount(price.amount, price.currency)} / ${price.unit ?? "project"}`;
}

export function formatShortPrice(price?: IndicativePrice | null): string {
  if (!price) return "Price on request";
  return `From ${formatAmount(price.amount, price.currency)}`;
}
