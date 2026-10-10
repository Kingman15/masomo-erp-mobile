import type { TeachingScheduleDTO } from "@/utils/types/TeachingScheduleDTO";

type DayCourseIdField =
  | "mondayCourseId"
  | "tuesdayCourseId"
  | "wednesdayCourseId"
  | "thursdayCourseId"
  | "fridayCourseId"
  | "saturdayCourseId"
  | "sundayCourseId";

// Jour ISO (1 = lundi … 7 = dimanche), comme teaching_schedules.day_schedule.
const DAY_COURSE_ID_FIELDS: Record<number, DayCourseIdField> = {
  1: "mondayCourseId",
  2: "tuesdayCourseId",
  3: "wednesdayCourseId",
  4: "thursdayCourseId",
  5: "fridayCourseId",
  6: "saturdayCourseId",
  7: "sundayCourseId",
};

// "YYYY-MM-DD" lu en date locale (new Date("YYYY-MM-DD") serait en UTC et pourrait tomber la veille).
function isoWeekday(date: string): number | null {
  const [year, month, day] = date.split("-").map(Number);
  if (!year || !month || !day) return null;

  const weekday = new Date(year, month - 1, day).getDay();
  return weekday === 0 ? 7 : weekday;
}

/**
 * Heures d'une leçon d'après l'horaire hebdomadaire en cache : du début de la première période à la fin de la dernière, pour ce cours dans cette classe ce jour-là.
 * Équivalent local de GET /teaching-schedules/by-lesson-date, utilisé hors ligne.
 */
export function lessonTimesFromWeeklySchedule(
  schedule: TeachingScheduleDTO[],
  {
    schoolClassId,
    courseId,
    lessonDate,
  }: { schoolClassId: string; courseId: string; lessonDate: string },
): { startTime: string; endTime: string } | null {
  const weekday = isoWeekday(lessonDate);
  if (!weekday) return null;

  const field = DAY_COURSE_ID_FIELDS[weekday];
  const periods = schedule
    .filter((row) => row.schoolClassId === schoolClassId && row[field] === courseId)
    .map((row) => row.courseSchedulePeriod)
    .filter((period) => period !== null);

  if (periods.length === 0) return null;

  const startTime = periods.map((period) => period.startTime).sort()[0];
  const endTime = periods.map((period) => period.endTime).sort().at(-1);

  return startTime && endTime ? { startTime, endTime } : null;
}
