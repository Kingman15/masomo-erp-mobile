export type AttendanceFiltersForm = {
  pointingTypeId: string | null;
  pointingChannelId: string | null;
  justificationStatusId: string | null;
};

export const emptyAttendanceFilters: AttendanceFiltersForm = {
  pointingTypeId: null,
  pointingChannelId: null,
  justificationStatusId: null,
};
