export interface DashboardTodayScheduleSession {
  startsAt: string | null;
  endsAt: string | null;
  courseName: string | null;
  roomName: string | null;
  attendanceStatus: "present" | "absent" | "late" | "excused" | null;
}

export interface DashboardTodayEvaluation {
  id: string;
  courseName: string | null;
  title: string | null;
  startsAt: string | null;
}

export interface DashboardTodayAttendance {
  status: "present" | "absent" | "partial" | null;
  sessionsScheduled: number | null;
  sessionsRecorded: number | null;
  present: number | null;
  absent: number | null;
}

export interface PortalDashboardToday {
  date: string | null;
  isSchoolDay: boolean | null;
  attendance: DashboardTodayAttendance | null;
  schedule: DashboardTodayScheduleSession[] | null;
  evaluations: DashboardTodayEvaluation[] | null;
}
