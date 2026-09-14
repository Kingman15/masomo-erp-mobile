import type { TeachingScheduleDTO } from "@/utils/types/TeachingScheduleDTO";

type DayCourseStrField =
  | "mondayCourseStr"
  | "tuesdayCourseStr"
  | "wednesdayCourseStr"
  | "thursdayCourseStr"
  | "fridayCourseStr"
  | "saturdayCourseStr"
  | "sundayCourseStr";

type DayCourseIdField =
  | "mondayCourseId"
  | "tuesdayCourseId"
  | "wednesdayCourseId"
  | "thursdayCourseId"
  | "fridayCourseId"
  | "saturdayCourseId"
  | "sundayCourseId";

type DayCourseField =
  | "mondayCourse"
  | "tuesdayCourse"
  | "wednesdayCourse"
  | "thursdayCourse"
  | "fridayCourse"
  | "saturdayCourse"
  | "sundayCourse";

export type DayField = {
  day: number;
  label: string;
  short: string;
  strField: DayCourseStrField;
  idField: DayCourseIdField;
  courseField: DayCourseField;
};

export const DAY_FIELDS: DayField[] = [
  { day: 1, label: "Lundi", short: "Lun", strField: "mondayCourseStr", idField: "mondayCourseId", courseField: "mondayCourse" },
  { day: 2, label: "Mardi", short: "Mar", strField: "tuesdayCourseStr", idField: "tuesdayCourseId", courseField: "tuesdayCourse" },
  { day: 3, label: "Mercredi", short: "Mer", strField: "wednesdayCourseStr", idField: "wednesdayCourseId", courseField: "wednesdayCourse" },
  { day: 4, label: "Jeudi", short: "Jeu", strField: "thursdayCourseStr", idField: "thursdayCourseId", courseField: "thursdayCourse" },
  { day: 5, label: "Vendredi", short: "Ven", strField: "fridayCourseStr", idField: "fridayCourseId", courseField: "fridayCourse" },
  { day: 6, label: "Samedi", short: "Sam", strField: "saturdayCourseStr", idField: "saturdayCourseId", courseField: "saturdayCourse" },
  { day: 7, label: "Dimanche", short: "Dim", strField: "sundayCourseStr", idField: "sundayCourseId", courseField: "sundayCourse" },
];

export function jsDayToDayField(jsDay: number): number {
  return jsDay === 0 ? 7 : jsDay;
}

export function getVisibleDays(dtos: TeachingScheduleDTO[]): DayField[] {
  return DAY_FIELDS.filter((day) =>
    dtos.some((dto) => Boolean(dto[day.strField])),
  );
}

export type ScheduleSlotItem = {
  id: string;
  period: NonNullable<TeachingScheduleDTO["courseSchedulePeriod"]>;
  courseId: string;
  courseLabel: string;
  shiftName: string | null;
};

export function getRowsForDay(
  dtos: TeachingScheduleDTO[],
  day: DayField,
): ScheduleSlotItem[] {
  const rows: ScheduleSlotItem[] = [];

  for (const dto of dtos) {
    if (!dto.courseSchedulePeriod) continue;

    const courseLabel = dto[day.strField];
    const courseId = dto[day.idField];
    if (!courseLabel || !courseId) continue;

    rows.push({
      id: `${dto.courseSchedulePeriodId}-${day.day}`,
      period: dto.courseSchedulePeriod,
      courseId,
      courseLabel,
      shiftName: dto.shiftName,
    });
  }

  rows.sort((a, b) => {
    const shiftOrderDiff =
      (a.period.shift?.displayOrder ?? 0) - (b.period.shift?.displayOrder ?? 0);
    if (shiftOrderDiff !== 0) return shiftOrderDiff;

    const orderDiff = a.period.displayOrder - b.period.displayOrder;
    if (orderDiff !== 0) return orderDiff;

    return a.period.startTime.localeCompare(b.period.startTime);
  });

  return rows;
}
