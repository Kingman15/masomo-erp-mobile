export interface PortalHouseholdData {
  studentId: string;
  studentName: string | null;
  schoolClassName: string | null;
  needsAttention: boolean;
}

export interface PortalHouseholdMeta {
  canSwitch: boolean;
}

export interface PortalHouseholdResponse {
  data: PortalHouseholdData[];
  meta: PortalHouseholdMeta;
}
