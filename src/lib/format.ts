export const CURRENCY_OPTIONS = [
  { code: "usd", label: "USD ($)" },
  { code: "eur", label: "EUR (€)" },
  { code: "gbp", label: "GBP (£)" },
] as const;

const SYMBOLS: Record<string, string> = {
  usd: "$",
  eur: "€",
  gbp: "£",
};

// Formats an integer amount in cents as a currency string, e.g. 4999 -> "$49.99".
export function formatPrice(
  cents: number | null | undefined,
  currency?: string | null
): string | null {
  if (cents == null) return null;
  const symbol = SYMBOLS[(currency ?? "usd").toLowerCase()] ?? "";
  const value = cents / 100;
  const digits = Number.isInteger(value) ? value : value.toFixed(2);
  return `${symbol}${digits}`;
}

// Full display label including the billing interval, e.g. "$19.00/mo" or "$149".
export function priceLabel(
  cents: number | null | undefined,
  currency?: string | null,
  interval?: string | null
): string | null {
  const price = formatPrice(cents, currency);
  if (!price) return null;
  return interval === "month" ? `${price}/mo` : price;
}
