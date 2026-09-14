export interface AbsencesBreakdown {
  justified: number;
  unjustified: number;
}

export interface AttendanceAnnual {
  presenceRate: number | null;
  sessionsRecorded: number;
  absences: AbsencesBreakdown;
}

export interface AttendanceMonthly {
  period: string;
  presenceRate: number;
  sessionsRecorded: number;
  absences: AbsencesBreakdown;
  deltaPoints: number;
  comparedTo: string;
}

export interface DashboardAttendance {
  annual: AttendanceAnnual;
  monthly: AttendanceMonthly | null;
}

export interface CourseBelowPassMark {
  courseId: string;
  courseName: string;
  average: number;
  passMark: number;
}

export interface AcademicSummary {
  average: {
    value: number;
    scale: number;
    basis: { evaluationsPublished: number };
  } | null;
  rank: { position: number; total: number } | null;
  coursesBelowPassMark: CourseBelowPassMark[];
}

export interface DisciplineAnnual {
  incidents: number;
  sanctions: number;
  activeSanctions: number;
}

export interface DisciplineMonthly {
  period: string;
  incidents: number;
  sanctions: number;
  delta: { incidents: number; sanctions: number };
  comparedTo: string;
}

export interface DisciplineSummary {
  annual: DisciplineAnnual;
  monthly: DisciplineMonthly;
}

export interface FinanceBlock {
  currency: string;
  totalDue: number;
  totalPaid: number;
  remaining: number;
  paidRate: number;
}

export interface FinanceSummary {
  schoolFees: FinanceBlock[];
  transport: FinanceBlock[];
}

export interface CurrencyAmount {
  currency: string;
  amount: number;
}

export interface UpcomingInstallment {
  id: string;
  label: string;
  dueDate: string;
  currency: string;
  amount: number;
  isBeyondWindow: boolean;
}

export interface AlertsSummary {
  unreadConversations: number;
  unreadAnnouncements: number;
  overdueInstallments: { count: number; amounts: CurrencyAmount[] };
  upcomingInstallments: UpcomingInstallment[];
  pendingTransportInvoices: { count: number; amounts: CurrencyAmount[] };
}

export interface StudentDashboardData {
  attendance: DashboardAttendance;
  academic: AcademicSummary;
  discipline: DisciplineSummary;
  finance: FinanceSummary;
  alerts: AlertsSummary;
}

export interface StudentDashboardMeta {
  generatedAt: string;
  unavailable: string[];
  cachedBlocks: string[];
}

export interface StudentDashboardSummaryResponse {
  data: StudentDashboardData;
  meta: StudentDashboardMeta;
}
