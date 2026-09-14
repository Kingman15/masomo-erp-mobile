export interface SchoolYearSubdivision {
  id: string;
  code: string;
  systemName: string;
  displayName: string;
  abbreviation: string | null;
  displayOrder: number | null;
  isActive: boolean;
  isSystem: boolean;
  description: string | null;
  comments: string | null;
}
