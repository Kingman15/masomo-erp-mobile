import type { TeachingScheduleDTO } from "@/utils/types/TeachingScheduleDTO";

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
  courseField: DayCourseField;
};

export const DAY_FIELDS: DayField[] = [
  { day: 1, label: "Lundi", courseField: "mondayCourse" },
  { day: 2, label: "Mardi", courseField: "tuesdayCourse" },
  { day: 3, label: "Mercredi", courseField: "wednesdayCourse" },
  { day: 4, label: "Jeudi", courseField: "thursdayCourse" },
  { day: 5, label: "Vendredi", courseField: "fridayCourse" },
  { day: 6, label: "Samedi", courseField: "saturdayCourse" },
  { day: 7, label: "Dimanche", courseField: "sundayCourse" },
];

export type ScheduleRowItem = {
  id: string;
  day: number;
  period: NonNullable<TeachingScheduleDTO["courseSchedulePeriod"]>;
  schoolClass: NonNullable<TeachingScheduleDTO["schoolClass"]>;
  course: NonNullable<TeachingScheduleDTO["mondayCourse"]>;
  shiftName: string | null;
};

export type ScheduleDayGroup = {
  day: number;
  label: string;
  rows: ScheduleRowItem[];
};

export function flattenTeachingScheduleDTOs(
  dtos: TeachingScheduleDTO[],
): ScheduleDayGroup[] {
  const groups: ScheduleDayGroup[] = DAY_FIELDS.map(({ day, label }) => ({
    day,
    label,
    rows: [],
  }));

  for (const dto of dtos) {
    if (!dto.schoolClass || !dto.courseSchedulePeriod) continue;

    for (const { day, courseField } of DAY_FIELDS) {
      const course = dto[courseField];
      if (!course) continue;

      const group = groups.find((g) => g.day === day);
      if (!group) continue;

      group.rows.push({
        id: `${dto.schoolClassId}-${dto.courseSchedulePeriodId}-${day}`,
        day,
        period: dto.courseSchedulePeriod,
        schoolClass: dto.schoolClass,
        course,
        shiftName: dto.shiftName,
      });
    }
  }

  for (const group of groups) {
    group.rows.sort((a, b) => {
      const shiftOrderDiff =
        (a.period.shift?.displayOrder ?? 0) -
        (b.period.shift?.displayOrder ?? 0);
      if (shiftOrderDiff !== 0) return shiftOrderDiff;

      const orderDiff = a.period.displayOrder - b.period.displayOrder;
      if (orderDiff !== 0) return orderDiff;

      return a.period.startTime.localeCompare(b.period.startTime);
    });
  }

  return groups.filter((group) => group.rows.length > 0);
}
