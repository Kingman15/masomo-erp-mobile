export const staffAnnouncementKeys = {
  all: ["staffAnnouncements"] as const,

  list: (schoolYearId: string | undefined | null) =>
    [
      ...staffAnnouncementKeys.all,
      "list",
      { schoolYearId: schoolYearId ?? null },
    ] as const,

  detail: (
    schoolYearId: string | undefined | null,
    announcementId: string | undefined | null,
  ) =>
    [
      ...staffAnnouncementKeys.all,
      "detail",
      {
        schoolYearId: schoolYearId ?? null,
        announcementId: announcementId ?? null,
      },
    ] as const,
};
