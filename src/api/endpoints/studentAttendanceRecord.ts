import { StudentAttendanceBulkRecordFormValues } from "@/utils/schemas/student-attendance-bulk-record-schema";
import { StudentAttendanceRecordFormValues } from "@/utils/schemas/student-attendance-record-schema";
import { StudentAttendanceRecord } from "@/utils/types/StudentAttendanceRecord";
import { StudentAttendanceRecordSummary } from "@/utils/types/StudentAttendanceRecordSummary";
import { AxiosInstance } from "axios";
import { toRequestConfig, type WriteRequestOptions } from "../idempotency";
import ApiResponse from "../responses/ApiResponse";

interface StudentAttendanceRecordFilters {
  sessionId?: string;
  startDate?: string;
  endDate?: string;
  studentId?: string;
  schoolYearId?: string;
  pointingTypeId?: string;
  pointingChannelId?: string;
  justificationStatusId?: string;
  sectionId?: string;
  schoolClassId?: string;
}

export interface StudentAttendanceRecordPayload
  extends StudentAttendanceRecordFormValues {
  pointedById?: string | null;
  entryPointedAt?: Date | string | null;
  exitPointedAt?: Date | string | null;
}

export interface StudentAttendanceBulkRecordItem {
  enrollmentId: string;
  isPresent: boolean;
  isLate: boolean;
  isPartial: boolean;
  justificationNote: string | null;
}

// reject : 409 ATTENDANCE_CONFLICT et rien d'écrit si un élève est déjà pointé différemment ; skip_existing : ces élèves sont laissés tels quels, les autres enregistrés.
export type AttendanceConflictStrategy = "reject" | "skip_existing";

export interface StudentAttendanceBulkRecordPayload
  extends StudentAttendanceBulkRecordFormValues {
  records: StudentAttendanceBulkRecordItem[];
  conflictStrategy?: AttendanceConflictStrategy;
}

export interface StudentAttendanceBulkRecordResult {
  created: { enrollment_id: string; id: string }[];
  // Déjà pointés à l'identique.
  unchanged: { enrollment_id: string }[];
  // Déjà pointés différemment, laissés tels quels (skip_existing).
  skipped: { enrollment_id: string }[];
}

function toRequestBody(payload: StudentAttendanceRecordPayload) {
  return {
    session_id: payload.sessionId,
    enrollment_id: payload.enrollmentId,
    pointing_type_id: payload.pointingTypeId,
    entry_time: payload.entryTime ?? null,
    entry_pointed_at: payload.entryPointedAt ?? null,
    exit_time: payload.exitTime ?? null,
    exit_pointed_at: payload.exitPointedAt ?? null,
    pointed_by_id: payload.pointedById ?? null,
    is_late: payload.isLate ?? false,
    is_partial: payload.isPartial ?? false,
    justification_status_id: payload.justificationStatusId ?? null,
    justification_note: payload.justificationNote ?? null,
    justification_date: payload.justificationDate ?? null,
    pointing_channel_id: payload.pointingChannelId ?? null,
    location: payload.location ?? null,
    note: payload.note ?? null,
  };
}

function toBulkRequestBody(payload: StudentAttendanceBulkRecordPayload) {
  return {
    session_id: payload.sessionId,
    school_class_id: payload.schoolClassId,
    pointed_by_id: payload.pointedById ?? null,
    pointing_channel_id: payload.pointingChannelId ?? null,
    location: payload.location ?? null,
    conflict_strategy: payload.conflictStrategy,
    records: payload.records.map((record) => ({
      enrollment_id: record.enrollmentId,
      is_present: record.isPresent,
      is_late: record.isLate,
      is_partial: record.isPartial,
      justification_note: record.justificationNote,
    })),
  };
}

export async function index(
  api: AxiosInstance,
  filters: StudentAttendanceRecordFilters,
): Promise<StudentAttendanceRecord[]> {
  const { data } = await api.get<ApiResponse<StudentAttendanceRecord[]>>(
    "/student-attendance-records",
    { params: filters },
  );
  return data.data;
}

export async function show(
  api: AxiosInstance,
  id: string,
): Promise<StudentAttendanceRecord> {
  const { data } = await api.get<ApiResponse<StudentAttendanceRecord>>(
    `/student-attendance-records/${id}`,
  );
  return data.data;
}

export async function summary(
  api: AxiosInstance,
  filters: StudentAttendanceRecordFilters,
): Promise<StudentAttendanceRecordSummary> {
  const { data } = await api.get<ApiResponse<StudentAttendanceRecordSummary>>(
    "/student-attendance-records/attendance-summary",
    { params: filters },
  );
  return data.data;
}

export async function store(
  api: AxiosInstance,
  payload: StudentAttendanceRecordPayload,
): Promise<StudentAttendanceRecord> {
  const { data } = await api.post<ApiResponse<StudentAttendanceRecord>>(
    "/student-attendance-records",
    toRequestBody(payload),
  );
  return data.data;
}

export async function update(
  api: AxiosInstance,
  id: string,
  payload: StudentAttendanceRecordPayload,
): Promise<StudentAttendanceRecord> {
  const { data } = await api.put<ApiResponse<StudentAttendanceRecord>>(
    `/student-attendance-records/${id}`,
    toRequestBody(payload),
  );
  return data.data;
}

export async function destroy(api: AxiosInstance, id: string): Promise<void> {
  await api.delete(`/student-attendance-records/${id}`);
}

export async function bulkStore(
  api: AxiosInstance,
  payload: StudentAttendanceBulkRecordPayload,
  options?: WriteRequestOptions,
): Promise<StudentAttendanceBulkRecordResult> {
  const { data } = await api.post<
    ApiResponse<StudentAttendanceBulkRecordResult>
  >(
    "/student-attendance-records/bulk",
    toBulkRequestBody(payload),
    toRequestConfig(options),
  );
  return data.data;
}
