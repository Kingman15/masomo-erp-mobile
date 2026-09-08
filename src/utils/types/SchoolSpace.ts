import { SchoolBuilding } from "./SchoolBuilding";

// -----------------------------------------------------------------------
// Enums
// -----------------------------------------------------------------------

export const SCHOOL_SPACE_TYPES = [
  "traditional",
  "u_shaped",
  "circle",
  "cluster",
  "conference",
  "laboratory",
  "studio",
  "flexible",
  "auditorium",
  "outdoor",
] as const;

export const SCHOOL_SPACE_STATUSES = [
  "operational",
  "under_maintenance",
  "closed",
  "in_preparation",
  "reserved",
  "out_of_service",
] as const;

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

export type SchoolSpaceType = (typeof SCHOOL_SPACE_TYPES)[number];
export type SchoolSpaceStatus = (typeof SCHOOL_SPACE_STATUSES)[number];

// -----------------------------------------------------------------------
// Resource
// -----------------------------------------------------------------------

export interface SchoolSpace {
  id: string;
  code: string;
  schoolBuildingId: string;
  designation: string;
  capacity: number | null;
  floor: number | null;
  spaceType: SchoolSpaceType | null;
  status: SchoolSpaceStatus | null;
  isActive: boolean;
  resources: string[] | null;
  description: string | null;

  schoolBuilding?: SchoolBuilding | null;
}
