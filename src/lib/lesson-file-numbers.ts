export interface LessonFileNumber {
  id: string;
  fileNo: string;
  lessonDate: string;
}

const normalize = (fileNo: string) => fileNo.trim().toLowerCase();

/**
 * Numéro proposé pour la prochaine fiche du cours : le plus grand numéro entier + 1.
 * Les numéros non entiers (ex. « 12bis ») sont ignorés ; null si aucun n'est exploitable.
 */
export function nextLessonFileNo(
  fileNumbers: LessonFileNumber[],
): string | null {
  if (fileNumbers.length === 0) return "1";

  const numbers = fileNumbers
    .map(({ fileNo }) => fileNo.trim())
    .filter((fileNo) => /^\d+$/.test(fileNo));
  if (numbers.length === 0) return null;

  return String(Math.max(...numbers.map(Number)) + 1);
}

/** Leçon du cours portant déjà ce numéro (hors leçon en cours de modification). */
export function findLessonWithFileNo(
  fileNumbers: LessonFileNumber[],
  fileNo: string | undefined,
  excludedLessonId?: string,
): LessonFileNumber | undefined {
  if (!fileNo?.trim()) return undefined;

  const target = normalize(fileNo);
  return fileNumbers.find(
    (item) => item.id !== excludedLessonId && normalize(item.fileNo) === target,
  );
}
