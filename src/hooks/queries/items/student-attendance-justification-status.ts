import api from "@/api/client";
import { index } from "@/api/endpoints/studentAttendanceJustificationStatus";
import { studentAttendanceJustificationStatusKeys } from "@/utils/query-keys/student-attendance-justification-status";
import { StudentAttendanceJustificationStatus } from "@/utils/types/StudentAttendanceJustificationStatus";
import { useListQuery } from "../use-list-query";

export function useStudentAttendanceJustificationStatuses() {
  const query = useListQuery<StudentAttendanceJustificationStatus>({
    queryKey: studentAttendanceJustificationStatusKeys.list(),
    queryFn: () => index(api),
    label: "Statuts de justification",
  });

  return {
    statuses: query.data,
    statusesError: query.error,
    statusesIsLoading: query.isLoading,
    loadStatuses: query.refetch,
    statusesIsFetching: query.isFetching,
  };
}
