import { User } from "./User";

// -----------------------------------------------------------------------
// Enums
// -----------------------------------------------------------------------

export const STUDENT_GENDERS = ["male", "female", "other"] as const;
export const STUDENT_BLOOD_GROUPS = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
] as const;

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

export type StudentGender = (typeof STUDENT_GENDERS)[number];
export type StudentBloodGroup = (typeof STUDENT_BLOOD_GROUPS)[number];

// -----------------------------------------------------------------------
// Ressource
// -----------------------------------------------------------------------

export interface Student {
  id: string;
  code: string;
  registrationNo: string | null;
  externalRef: string | null;
  lastName: string | null;
  middleName: string | null;
  firstName: string | null;
  gender: StudentGender | null;
  bloodGroup: StudentBloodGroup | null;
  birthDate: string | null;
  birthPlace: string | null;
  nationality: string | null;
  address: string | null;
  isActive: boolean;
  receivesNotifications: boolean;
  notes: string | null;
  userId: string | null;

  // ---

  user: User | null;

  // ---

  fullName: string | null;
  fullDesignation: string | null;
  genderStr: string | null;
}
