import type { SchoolClass } from "@/utils/types/SchoolClass";

// Titulaires en vigueur, principal en premier (ordre de l'API).
export function getHomeroomTeachersLabel(schoolClass: SchoolClass | null | undefined) {
  return (schoolClass?.homeroomTeachers ?? [])
    .map((homeroomTeacher) => homeroomTeacher.teacher?.fullDesignation)
    .filter(Boolean)
    .join(", ");
}
