export function formatShortDate(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-CD", { dateStyle: "short" }).format(date);
}

export function formatDateTime(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-CD", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

export function formatNumber(
  value: number | string | null | undefined,
  options: Intl.NumberFormatOptions = {},
): string {
  if (value === null || value === undefined) return "";
  const num = typeof value === "string" ? Number(value.trim()) : value;
  if (!Number.isFinite(num)) return "";
  return new Intl.NumberFormat("fr-CD", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options,
  }).format(num);
}

export function formatCurrency(
  value: number | string | null | undefined,
  currency = "USD",
): string {
  if (value === null || value === undefined) return "—";
  const num = typeof value === "string" ? Number(value.trim()) : value;
  if (!Number.isFinite(num)) return "—";
  try {
    return new Intl.NumberFormat("fr-CD", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num === 0 ? 0 : num);
  } catch {
    return `${formatNumber(num)} ${currency}`;
  }
}

export function getInitials(
  name: string | null | undefined,
  count = 2,
): string {
  if (!name?.trim()) return "";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, count)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
