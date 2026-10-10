import type { Enrollment } from "@/utils/types/Enrollment";
import type { SchoolClass } from "@/utils/types/SchoolClass";
import type { StudentAttendanceSession } from "@/utils/types/StudentAttendanceSession";

export function formatAttendanceDate(
  value: Date | string | null | undefined,
  format: "short" | "long" = "short",
) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(
    "fr-FR",
    format === "long"
      ? { weekday: "long", day: "2-digit", month: "long", year: "numeric" }
      : { weekday: "short", day: "2-digit", month: "short" },
  );
}

export function toHoursMinutes(value: string | null | undefined) {
  return value ? value.slice(0, 5) : null;
}

export function toDateOnly(value: Date | string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getSessionLabel(session: StudentAttendanceSession) {
  const date = formatAttendanceDate(session.attendanceDate);
  if (session.title && date) return `${session.title} · ${date}`;
  return session.title ?? date ?? session.code ?? "Session";
}

export function getSchoolClassLabel(schoolClass: SchoolClass | null | undefined) {
  return schoolClass?.title ?? schoolClass?.abbreviation ?? "Classe";
}

export function getEnrollmentLabel(enrollment: Enrollment | null | undefined) {
  const student = enrollment?.student;
  return (
    student?.fullName ||
    student?.fullDesignation ||
    [student?.lastName, student?.firstName].filter(Boolean).join(" ") ||
    "Élève"
  );
}
