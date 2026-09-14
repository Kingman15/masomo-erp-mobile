import { StudentRankingDTO } from "./StudentRankingDTO";

export const PORTAL_STUDENT_RANKING_DISPLAY_MODES = ["full", "own"] as const;

export type PortalStudentRankingDisplayMode =
  (typeof PORTAL_STUDENT_RANKING_DISPLAY_MODES)[number];

export interface PortalStudentRankingResultDTO {
  displayMode: PortalStudentRankingDisplayMode;
  totalStudents: number;
  ranking: StudentRankingDTO[];
}
