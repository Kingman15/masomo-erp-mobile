export interface SchoolYear {
  id: string;
  code: string;
  startYear: number;
  endYear: number;
  title: string;
  startDate: Date;
  endDate: Date;
  enrollmentStartDate: Date | null;
  enrollmentEndDate: Date | null;
  comments: string | null;
  status: "preparation" | "active" | "closed" | null;
}
