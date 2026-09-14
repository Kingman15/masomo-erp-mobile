import api from "@/api/client";
import { index } from "@/api/endpoints/studentAttendancePointingType";
import { studentAttendancePointingTypeKeys } from "@/utils/query-keys/student-attendance-pointing-type";
import { StudentAttendancePointingType } from "@/utils/types/StudentAttendancePointingType";
import { useListQuery } from "../use-list-query";

export function useStudentAttendancePointingTypes() {
  const query = useListQuery<StudentAttendancePointingType>({
    queryKey: studentAttendancePointingTypeKeys.list(),
    queryFn: () => index(api),
    label: "Types de pointage",
  });

  return {
    pointingTypes: query.data,
    pointingTypesError: query.error,
    pointingTypesIsLoading: query.isLoading,
    loadPointingTypes: query.refetch,
    pointingTypesIsFetching: query.isFetching,
  };
}
