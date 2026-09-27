import api from "@/api/client";
import { index } from "@/api/endpoints/studentAttendancePointingChannel";
import type { QueryDefinition } from "@/lib/offline/offline-queries";
import { studentAttendancePointingChannelKeys } from "@/utils/query-keys/student-attendance-pointing-channel";
import { StudentAttendancePointingChannel } from "@/utils/types/StudentAttendancePointingChannel";
import { useListQuery } from "../use-list-query";

export function studentAttendancePointingChannelsQuery(): QueryDefinition<
  StudentAttendancePointingChannel[]
> {
  return {
    queryKey: studentAttendancePointingChannelKeys.list(),
    queryFn: () => index(api),
    label: "Canaux de pointage",
  };
}

export function useStudentAttendancePointingChannels() {
  const query = useListQuery<StudentAttendancePointingChannel>({
    ...studentAttendancePointingChannelsQuery(),
    offline: true,
  });

  return {
    pointingChannels: query.data,
    pointingChannelsError: query.error,
    pointingChannelsIsLoading: query.isLoading,
    loadPointingChannels: query.refetch,
    pointingChannelsIsFetching: query.isFetching,
  };
}
