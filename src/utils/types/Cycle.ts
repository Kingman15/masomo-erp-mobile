import { Section } from "./Section";

export interface Cycle {
  id: string;
  code: string | null;

  title: string | null;
  abbreviation: string | null;

  sectionId: string | null;
  isActive?: boolean | null;
  duration?: number | null; // nombre d'années
  displayOrder: number | null;
  description?: string | null;
  comments?: string | null;

  // --- Relations ---

  section?: Section | null;
}
