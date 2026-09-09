export type TeachingCourseEvaluationDocumentType =
  | "subject"
  | "correction"
  | "scale";

export interface TeachingCourseEvaluationDocument {
  linkId: string;
  documentType: TeachingCourseEvaluationDocumentType | null;
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  category: string;
  url: string;
}
