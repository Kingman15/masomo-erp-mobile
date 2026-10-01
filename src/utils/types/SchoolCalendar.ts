/** Calendrier scolaire d'une année (GET /school-calendar) : terms datés, puis périodes des classes regroupées par dates communes. */
export interface SchoolCalendar {
  schoolYear: {
    id: string;
    title: string;
    startDate: string | null;
    endDate: string | null;
  };
  terms: SchoolCalendarTerm[];
}

export interface SchoolCalendarTerm {
  id: string;
  name: string;
  subdivisionNo: number;
  startDate: string | null;
  endDate: string | null;
  periods: SchoolCalendarPeriod[];
}

export interface SchoolCalendarPeriod {
  schoolPeriodId: string;
  name: string | null;
  displayOrder: number | null;
  startDate: string | null;
  endDate: string | null;
  generalClasses: {
    id: string;
    title: string | null;
    abbreviation: string | null;
    /** Dates propres à la classe (exception au calendrier de sa section) */
    datesOverridden: boolean;
  }[];
}
