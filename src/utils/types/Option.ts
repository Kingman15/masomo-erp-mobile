import { Section } from "./Section";

export interface Option {
  id: string;
  code: string | null;

  title: string | null;
  abbreviation: string | null;

  sectionId: string | null;
  isActive?: boolean | null;
  description?: string | null;
  prerequisites?: string | null;
  programs?: string | null;

  // --- Relations ---

  section?: Section | null;
}
