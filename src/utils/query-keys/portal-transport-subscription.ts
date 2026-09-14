export const portalTransportSubscriptionKeys = {
  all: ["portalTransportSubscriptions"] as const,
  current: (studentId: string | null | undefined) =>
    [...portalTransportSubscriptionKeys.all, "current", studentId ?? null] as const,
  list: (
    studentId: string | null | undefined,
    filters: {
      schoolYearId?: string | null;
      schoolClassId?: string | null;
      shiftId?: string | null;
      status?: string | null;
    },
  ) => [...portalTransportSubscriptionKeys.all, studentId ?? null, "list", filters] as const,
  detail: (studentId: string | null | undefined, subscriptionId?: string | null) =>
    [...portalTransportSubscriptionKeys.all, studentId ?? null, "detail", subscriptionId ?? null] as const,
};
