export type DocumentAudienceType =
  | "school"
  | "section"
  | "option"
  | "generalClass"
  | "schoolClass";

export const AUDIENCE_TYPE_OPTIONS: {
  id: DocumentAudienceType;
  label: string;
}[] = [
  { id: "school", label: "École entière" },
  { id: "section", label: "Section" },
  { id: "option", label: "Option" },
  { id: "generalClass", label: "Classe générale" },
  { id: "schoolClass", label: "Classe scolaire" },
];
