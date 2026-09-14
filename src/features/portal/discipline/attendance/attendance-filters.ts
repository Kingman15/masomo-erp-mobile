export type AttendanceFiltersForm = {
  startDate: string | null;
  endDate: string | null;
  pointingTypeId: string | null;
  justificationStatusId: string | null;
};

function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getDefaultAttendanceFilters(): AttendanceFiltersForm {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  return {
    startDate: toDateString(startOfMonth),
    endDate: toDateString(now),
    pointingTypeId: null,
    justificationStatusId: null,
  };
}
