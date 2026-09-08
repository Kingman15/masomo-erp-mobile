import { Employee } from "./Employee";

// -----------------------------------------------------------------------
// Enums
// -----------------------------------------------------------------------

export const SCHOOL_BUILDING_TYPES = [
  "administrative",
  "academic",
  "residential",
  "sports",
  "library",
  "cafeteria",
  "other",
] as const;
export const SCHOOL_BUILDING_STATUSES = [
  "operational",
  "under_maintenance",
  "closed",
  "planned",
] as const;

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

export type SchoolBuildingType = (typeof SCHOOL_BUILDING_TYPES)[number];

export type SchoolBuildingStatus = (typeof SCHOOL_BUILDING_STATUSES)[number];

// -----------------------------------------------------------------------
// Resource
// -----------------------------------------------------------------------

export interface SchoolBuilding {
  id: string;
  code: string | null;
  name: string | null;
  abbreviation: string | null;
  buildingType: SchoolBuildingType | null;
  status: SchoolBuildingStatus | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  principalId: string | null;
  latitude: number | null;
  longitude: number | null;
  dateOpened: Date | null;
  dateClosed: Date | null;
  isActive: boolean | null;
  displayOrder: number | null;
  description: string | null;
  facilities: string | null;
  notes: string | null;

  // --- Relations

  principal?: Employee | null;
}
