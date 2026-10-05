// Contrat JSON de StudentReportCardResource (GET /enrollments/{id}/report-card), même forme que côté web.
// Nombres sérialisés en string (précision).

export type ReportCardLayout = "maxima" | "domain";

export interface ReportCardTotalsDTO {
  points: string;
  maxPoints: string;
  percentage: string;
  rank: number | null;
  totalStudents: number;
}

export interface ReportCardPeriodDTO {
  id: string;
  label: string;
  type: string;
  total: ReportCardTotalsDTO | null;
}

export interface ReportCardSubdivisionDTO {
  id: string;
  label: string;
  periods: ReportCardPeriodDTO[];
  total: ReportCardTotalsDTO;
}

export interface ReportCardMaximaCellDTO {
  value: string | null;
  isBlacked: boolean;
}

export interface ReportCardCourseCellDTO {
  points: string;
  isBlacked: boolean;
}

// Maxima propres à un cours (layout « domaine »)
export interface ReportCardCourseMaximaDTO {
  perPeriod: Record<string, ReportCardMaximaCellDTO>;
  subdivisions: Record<string, string>;
  grandTotal: string;
}

export interface ReportCardCourseRowDTO {
  followCourseId: string | null;
  courseName: string;
  cellsByPeriodId: Record<string, ReportCardCourseCellDTO>;
  subdivisionTotals: Record<string, string>;
  grandTotal: string;
  maxima: ReportCardCourseMaximaDTO | null;
}

export interface ReportCardSubtotalDTO {
  maximaByPeriodId: Record<string, string>;
  maximaBySubdivisionId: Record<string, string>;
  grandTotalMaxima: string;
  pointsByPeriodId: Record<string, string>;
  pointsBySubdivisionId: Record<string, string>;
  grandTotalPoints: string;
}

export interface ReportCardDomainGroupDTO {
  // null = cours sans domaine
  id: string | null;
  name: string | null;
  depth: number;
  courses: ReportCardCourseRowDTO[];
  children: ReportCardDomainGroupDTO[];
  subtotal: ReportCardSubtotalDTO;
}

export interface ReportCardMaximaGroupDTO {
  maxPeriod: string;
  maxExam: string | null;
  withoutExam: boolean;
  perPeriodMaxima: Record<string, ReportCardMaximaCellDTO>;
  subdivisionMaxima: Record<string, string>;
  grandTotalMaxima: string;
  courses: ReportCardCourseRowDTO[];
}

export type ReportCardDecisionValue =
  | "passes"
  | "repeats"
  | "failed"
  | "make_up_exam";

export interface OfficialReportCardDetailsDTO {
  student: {
    gender: "M" | "F" | null;
    birthPlace: string | null;
    birthDate: string | null; // jj/mm/aaaa
    permanentNumber: string | null;
  };
  // Sinon : pas de repêchage pour cette classe et cette année
  hasMakeUpExams: boolean;
  // Abréviations des mentions (TB, B…) par période
  appraisalsByPeriodId: Partial<
    Record<string, { application: string | null; conduct: string | null }>
  >;
  // Décision de la dernière session ; makeUpCourseNames vient de la session 1 et reste affiché après la session 2
  decision: {
    value: ReportCardDecisionValue;
    label: string;
    reorientationNote: string | null;
    makeUpCourseNames: string[];
  } | null;
  // Cours à repêcher => % obtenu (null tant que l'examen n'est pas passé)
  makeUpPercentageByFollowCourseId: Partial<Record<string, string | null>>;
  nationalExam: {
    name: string;
    shortName: string | null;
    centerCode: string | null;
    centerHeadName: string | null;
    candidateNumber: string | null;
    result: string | null;
    resultLabel: string | null;
    percentage: string | null;
  } | null;
}

export interface StudentReportCardDTO {
  enrollmentId: string;
  enrollmentNumber: string;
  studentName: string;
  schoolClassTitle: string;
  schoolYearName: string;
  subdivisions: ReportCardSubdivisionDTO[];
  maximaGroups: ReportCardMaximaGroupDTO[];
  grandTotal: ReportCardTotalsDTO;
  // Maxima généraux tirés des barèmes (les maxPoints des totaux valent 0 pour un élève absent d'un classement)
  generalMaxima: {
    periods: Record<string, string>;
    subdivisions: Record<string, string>;
    grand: string;
  };
  layout: ReportCardLayout;
  domainGroups: ReportCardDomainGroupDTO[];
  official: OfficialReportCardDetailsDTO | null;
}
