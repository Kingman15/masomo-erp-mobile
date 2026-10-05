// Délibération : même contrat que côté web (GET /enrollment-decisions, POST /enrollment-decisions/bulk).

export type EnrollmentDecisionTypeValue =
  | "passes"
  | "repeats"
  | "failed"
  | "make_up_exam";

// 1 = fin d'année, 2 = après les examens de repêchage (pas de second repêchage)
export type DeliberationSession = 1 | 2;

export interface Deliberation {
  id: string;
  session: DeliberationSession;
  sessionLabel: string;
  heldOn: string | null; // AAAA-MM-JJ
  comments: string | null;
}

export interface EnrollmentDecisionType {
  value: EnrollmentDecisionTypeValue;
  label: string;
}

export interface EnrollmentFailedCourse {
  followCourseId: string;
  courseName: string | null;
  percentage: number;
}

export interface EnrollmentMakeUpExam {
  id: string;
  followCourseId: string;
  courseName: string | null;
  percentage: number | null;
  passed: boolean | null;
  comments: string | null;
}

export interface EnrollmentDecision {
  id: string;
  session: DeliberationSession | null;
  value: EnrollmentDecisionTypeValue;
  label: string;
  reorientationNote: string | null;
  decidedAt: string | null;
  decidedBy: string | null;
  comments: string | null;
  // Points ajustés par le conseil dans la grille figée de la décision
  adjustedPointsCount: number;
  makeUpExams: EnrollmentMakeUpExam[];
}

export interface EnrollmentDecisionGridRow {
  enrollmentId: string;
  enrollmentNumber: string | null;
  studentId: string;
  studentName: string | null;

  percentage: number | null;
  rank: number | null;
  totalStudents: number;
  failedCourses: EnrollmentFailedCourse[];

  proposedDecision: EnrollmentDecisionType | null;
  // Décision de la session affichée
  decision: EnrollmentDecision | null;
  // En 2ème session : décision de 1ère session (repêchage et ses résultats)
  firstSessionDecision: EnrollmentDecision | null;
}

export interface EnrollmentDecisionGridMeta {
  // Repêchage possible pour la classe, l'année et la session (jamais en 2ème session)
  hasMakeUpExams: boolean;
  deliberation: Deliberation | null;
  firstSessionHeld: boolean;
  // 2ème session déjà tenue : l'écran s'y ouvre directement
  secondSessionHeld: boolean;
  // Cours pouvant être mis en repêchage, y compris ceux d'autres enseignants (contrairement à GET /follow-courses pour un enseignant)
  courses: EnrollmentClassCourse[];
}

export interface EnrollmentClassCourse {
  followCourseId: string;
  courseName: string | null;
}

export interface EnrollmentDecisionGrid {
  rows: EnrollmentDecisionGridRow[];
  meta: EnrollmentDecisionGridMeta;
}

export interface EnrollmentMakeUpCourse {
  followCourseId: string;
  courseName: string | null;
  percentage: number | null;
  // null = déduit du pourcentage et de la note de passage côté serveur
  passed: boolean | null;
  comments: string | null;
}

export interface EnrollmentDecisionBulkItem {
  enrollment_id: string;
  // null = supprime la décision existante (ses points et ses cours à repêcher)
  decision: EnrollmentDecisionTypeValue | null;
  reorientation_note: string | null;
  comments: string | null;
  make_up_courses: {
    follow_course_id: string;
    percentage: number | null;
    passed: boolean | null;
    comments: string | null;
  }[];
  // Absent = ajustements inchangés côté serveur ; fourni (même vide) : remplace tous les ajustements de l'élève
  adjustments?: {
    follow_course_id: string;
    school_period_id: string;
    adjusted_points: number;
    reason: string | null;
  }[];
}

export interface EnrollmentDecisionBulkPayload {
  school_class_id: string;
  school_year_id: string;
  session: DeliberationSession;
  held_on: string | null;
  comments: string | null;
  // Seuls les élèves listés sont touchés
  decisions: EnrollmentDecisionBulkItem[];
}

export interface EnrollmentDecisionBulkResult {
  saved: number;
  deleted: number;
}

// Point d'un élève pour un cours et une période : réel (figé à la délibération) et ajustement éventuel du conseil.
export interface EnrollmentDecisionPoint {
  followCourseId: string;
  courseName: string | null;
  schoolPeriodId: string;
  periodName: string | null;
  maxPoints: number;
  actualPoints: number;
  adjustedPoints: number | null;
  adjustmentReason: string | null;
}

export interface EnrollmentPointAdjustment {
  followCourseId: string;
  schoolPeriodId: string;
  adjustedPoints: number;
  reason: string | null;
}
