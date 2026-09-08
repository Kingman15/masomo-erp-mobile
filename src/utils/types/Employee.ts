import { BankAccount } from "./BankAccount";
import { Contact } from "./Contact";
import { EmployeeType } from "./EmployeeType";
import { User } from "./User";

// -----------------------------------------------------------------------
// Enums
// -----------------------------------------------------------------------

export const EMPLOYEE_GENDERS = ["male", "female", "other"] as const;
export const EMPLOYEE_MARITAL_STATUSES = [
  "single",
  "married",
  "divorced",
  "widowed",
] as const;
export const EMPLOYEE_BLOOD_GROUPS = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
] as const;
export const EMPLOYEE_STATUSES = [
  "draft",
  "active",
  "inactive",
  "on_leave",
  "suspended",
  "terminated",
] as const;

export const QUALIFICATION_LEVELS = [
  "none",
  "certificate",
  "diploma",
  "bachelor",
  "master",
  "doctorate",
  "other",
] as const;
export const SKILL_LEVELS = [
  "beginner",
  "intermediate",
  "advanced",
  "expert",
] as const;
export const LANGUAGE_PROFICIENCY_LEVELS = [
  "basic",
  "conversational",
  "fluent",
  "native",
] as const;
export const SPECIALIZATION_LEVELS = [
  "junior",
  "intermediate",
  "senior",
  "expert",
] as const;
export const EMPLOYMENT_TYPES = [
  "full_time",
  "part_time",
  "contract",
  "internship",
  "freelance",
  "temporary",
] as const;

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

export type EmployeeGender = (typeof EMPLOYEE_GENDERS)[number];
export type EmployeeMaritalStatus = (typeof EMPLOYEE_MARITAL_STATUSES)[number];
export type EmployeeBloodGroup = (typeof EMPLOYEE_BLOOD_GROUPS)[number];
export type EmployeeStatus = (typeof EMPLOYEE_STATUSES)[number];

export type QualificationLevel = (typeof QUALIFICATION_LEVELS)[number];
export type SkillLevel = (typeof SKILL_LEVELS)[number];
export type LanguageProficiencyLevel =
  (typeof LANGUAGE_PROFICIENCY_LEVELS)[number];
export type SpecializationLevel = (typeof SPECIALIZATION_LEVELS)[number];
export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number];

// -----------------------------------------------------------------------
// JSON-cast value objects
// -----------------------------------------------------------------------

export interface ProfessionalExperienceSkill {
  name?: string | null;
  level?: SkillLevel | null;
}

// ---

export interface Qualification {
  type?: string | null;
  title?: string | null;
  institution?: string | null;
  level?: QualificationLevel | null;
  fieldOfStudy?: string | null;
  dateObtained?: string | null;
  expiryDate?: string | null;
  grade?: string | null;
  notes?: string | null;
}

export interface ProfessionalExperience {
  companyName?: string | null;
  jobTitle?: string | null;
  employmentType?: EmploymentType | null;
  sector?: string | null;
  location?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  isCurrent?: boolean | null;
  achievements?: string | null;
  skills?: ProfessionalExperienceSkill[] | null;
  reference?: {
    name?: string | null;
    phone?: string | null;
    email?: string | null;
  } | null;
}

export interface TrainingCourse {
  title?: string | null;
  description?: string | null;
  institution?: string | null;
  category?: string | null;
  durationHours?: number | null;
  isCertified?: boolean | null;
  dateObtained?: string | null;
  expiryDate?: string | null;
  notes?: string | null;
}

export interface Certification {
  title?: string | null;
  issuingBody?: string | null;
  credentialId?: string | null;
  description?: string | null;
  dateObtained?: string | null;
  expiryDate?: string | null;
  grade?: string | null;
  isRenewable?: boolean | null;
  verifyUrl?: string | null;
}

export interface Skill {
  name?: string | null;
  category?: string | null;
  level?: SkillLevel | null;
  notes?: string | null;
}

export interface Language {
  language?: string | null;
  proficiency?: LanguageProficiencyLevel | null;
}

export interface Specialization {
  type?: string | null;
  label?: string | null;
  level?: SpecializationLevel | null;
  notes?: string | null;
}

// -----------------------------------------------------------------------
// Resource
// -----------------------------------------------------------------------

export interface Employee {
  id: string;
  code: string | null;

  employeeTypeId: string | null;
  userId?: string | null;

  registrationNo?: string | null;
  officialMatricule?: string | null;

  lastName: string | null;
  middleName?: string | null;
  firstName?: string | null;

  dateOfBirth?: string | null;
  gender?: EmployeeGender | null;

  nationality?: string | null;
  maritalStatus?: EmployeeMaritalStatus | null;
  bloodGroup?: EmployeeBloodGroup | null;
  dependantsCount?: number | null;
  address?: string | null;

  hireDate?: string | null;
  terminationDate?: string | null;
  status: EmployeeStatus | null;

  additionalResponsibilities?: string | null;

  // Champs JSON castés
  qualifications?: Qualification[] | null;
  professionalExperiences?: ProfessionalExperience[] | null;
  trainingCourses?: TrainingCourse[] | null;
  certifications?: Certification[] | null;
  skills?: Skill[] | null;
  languages?: Language[] | null;
  specializations?: Specialization[] | null;

  notes?: string | null;

  createdAt: string | null;
  updatedAt: string | null;

  // assignment
  assignment?: {
    role: string | null;
    isPrimary: boolean | null;
    startDate: string | null;
    endDate: string | null;
  };

  // Relations
  employeeType?: EmployeeType | null;
  contacts?: Contact[] | null;
  bankAccounts?: BankAccount[] | null;
  user?: User | null;

  // Appends
  fullName: string | null;
  fullDesignation: string | null;
  genderStr: string | null;
}
