import { Course } from "./Course";
import { GeneralClass } from "./GeneralClass";
import { SchoolYear } from "./SchoolYear";

export interface FollowCourse {
  id: string;
  code: string;
  courseId: string;
  generalClassId: string;
  schoolYearId: string;
  maxPeriod: number;
  maxExam: number | null;

  courseType: "compulsory" | "elective" | "optional" | "other" | null;

  deliveryType:
    | "theoretical"
    | "practical"
    | "lecture"
    | "seminar"
    | "tutoring"
    | "laboratory"
    | "workshop"
    | "online"
    | "internship"
    | "electiveCourse"
    | "selfStudyCourse"
    | "intensiveCourse"
    | "conference"
    | "simulation"
    | "project"
    | null;

  difficultyLevel: "beginner" | "intermediate" | "advanced" | "expert" | null;

  isActive: boolean;
  withoutExam: boolean;
  isOptionWeighted: boolean;
  isFeatured: boolean;
  isSystem: boolean;

  prerequisites: string | null;
  description: string | null;
  comments: string | null;

  // Relations ===

  course: Course | null;
  generalClass: GeneralClass | null;
  schoolYear: SchoolYear | null;

  // Appends ===

  courseTypeStr: string | null;
  deliveryTypeStr: string | null;
  difficultyLevelStr: string | null;
}
