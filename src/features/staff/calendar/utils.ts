import type { SchoolCalendar } from "@/utils/types/SchoolCalendar";

const DATE_FORMATTER = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
});

/** "2026-09-01" → "01 sept." ; "—" si absente. */
export function formatDate(date: string | null): string {
  if (!date) return "—";
  const [year, month, day] = date.slice(0, 10).split("-").map(Number);
  return DATE_FORMATTER.format(new Date(year, month - 1, day));
}

/** Date locale du jour au format "YYYY-MM-DD", comparable aux dates du calendrier. */
export function todayIso(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function isOngoing(startDate: string | null, endDate: string | null, today: string) {
  return !!startDate && !!endDate && startDate <= today && today <= endDate;
}

/**
 * Où en est l'année : term en cours, périodes en cours (plusieurs si les classes n'ont pas les mêmes dates),
 * et à défaut la prochaine période à venir.
 */
export function findCurrentPosition(calendar: SchoolCalendar | null | undefined, today: string) {
  const terms = calendar?.terms ?? [];

  const currentTerm = terms.find((term) => isOngoing(term.startDate, term.endDate, today)) ?? null;
  const currentPeriods = terms.flatMap((term) =>
    term.periods
      .filter((period) => isOngoing(period.startDate, period.endDate, today))
      .map((period) => ({ term, period })),
  );
  const nextPeriod =
    terms
      .flatMap((term) =>
        term.periods
          .filter((period) => !!period.startDate && period.startDate > today)
          .map((period) => ({ term, period })),
      )
      .sort((a, b) => (a.period.startDate ?? "").localeCompare(b.period.startDate ?? ""))[0] ?? null;

  return { currentTerm, currentPeriods, nextPeriod };
}
