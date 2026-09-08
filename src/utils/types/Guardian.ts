import { Contact } from "./Contact";
import { GuardianAssignment } from "./GuardianAssignment";
import { User } from "./User";

// -----------------------------------------------------------------------
// Enums
// -----------------------------------------------------------------------

export const GUARDIAN_GENDERS = ["male", "female", "other"] as const;
export const GUARDIAN_MARITAL_STATUSES = [
  "single",
  "married",
  "divorced",
  "widowed",
] as const;
export const GUARDIAN_BLOOD_GROUPS = [
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

export type GuardianGender = (typeof GUARDIAN_GENDERS)[number];
export type GuardianMaritalStatus = (typeof GUARDIAN_MARITAL_STATUSES)[number];
export type GuardianBloodGroup = (typeof GUARDIAN_BLOOD_GROUPS)[number];

// -----------------------------------------------------------------------
// Ressource
// -----------------------------------------------------------------------

export interface Guardian {
  id: string;
  code: string;
  registrationNo: string | null;
  fullName: string | null;
  title: string | null;
  suffix: string | null;
  gender: GuardianGender | null;
  maritalStatus: GuardianMaritalStatus | null;
  bloodGroup: GuardianBloodGroup | null;
  birthDate: string | null;
  birthPlace: string | null;
  nationality: string | null;
  occupation: string | null;
  employer: string | null;
  workAddress: string | null;
  address: string | null;
  isActive: boolean | null;
  receivesNotifications: boolean | null;
  comments: string | null;
  userId: string | null;

  // ---

  fullDesignation: string | null;
  allContacts: string | null;

  // ---

  user: User | null;
  contacts: Contact[] | null;
  assignments: GuardianAssignment[] | null;
}
