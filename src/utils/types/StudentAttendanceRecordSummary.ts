export interface StudentAttendanceJustificationBreakdown {
  code: string;
  label: string;
  count: number;
}

export interface StudentAttendanceRecordSummary {
  period: {
    startDate: string | null;
    endDate: string | null;
  };

  totalRecords: number;

  present: {
    count: number;
    rate: number;
    lateCount: number;
    partialCount: number;
  };

  absent: {
    count: number;
    rate: number;
    justifiedCount: number;
    unjustifiedCount: number;
    byJustificationStatus: StudentAttendanceJustificationBreakdown[];
  };
}
