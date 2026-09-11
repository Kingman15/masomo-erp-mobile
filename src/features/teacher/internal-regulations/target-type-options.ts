import type { StudentInternalRegulationTargetType } from "@/utils/types/StudentInternalRegulation";

export const TARGET_TYPE_OPTIONS: {
  id: StudentInternalRegulationTargetType;
  label: string;
}[] = [
  { id: "global", label: "Global" },
  { id: "section", label: "Section" },
  { id: "option", label: "Option" },
  { id: "generalClass", label: "Classe générale" },
  { id: "schoolClass", label: "Classe scolaire" },
];
