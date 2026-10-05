// Mêmes valeurs que App\Enums\Academics\Appraisal\AppraisalMention (et web/src/utils/types/StudentPeriodAppraisal.ts).
export const APPRAISAL_MENTIONS = [
  "elite",
  "very_good",
  "good",
  "fairly_good",
  "poor",
  "bad",
] as const;

export type AppraisalMentionValue = (typeof APPRAISAL_MENTIONS)[number];

export interface AppraisalMention {
  value: AppraisalMentionValue;
  label: string;
  // Abréviation imprimée dans les cellules du bulletin
  abbreviation: string;
}

/**
 * Ligne de la grille de saisie : une inscription active de la classe + son appréciation sur la période (champs nuls si pas encore saisie).
 */
export interface StudentPeriodAppraisalGridRow {
  enrollmentId: string;
  enrollmentNumber: string | null;
  studentId: string;
  studentName: string | null;

  appraisalId: string | null;
  application: AppraisalMention | null;
  conduct: AppraisalMention | null;
  comments: string | null;
  // Version lue, renvoyée dans expected_updated_at (contrôle de conflit).
  updatedAt: string | null;
}

export interface StudentPeriodAppraisalBulkResult {
  saved: number;
  deleted: number;
  // Nouvelle version de chaque ligne écrite (null : supprimée).
  written: { enrollment_id: string; updated_at: string | null }[];
  // Modifiées sur le serveur depuis le chargement, laissées telles quelles (skip_conflicts).
  skipped: { enrollment_id: string }[];
}
