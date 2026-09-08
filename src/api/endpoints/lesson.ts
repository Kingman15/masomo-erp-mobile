import { LessonFormValues } from "@/utils/schemas/lesson-schema";
import { Lesson } from "@/utils/types/Lesson";
import { AxiosInstance } from "axios";
import ApiResponse from "../responses/ApiResponse";
import PaginatedApiResponse from "../responses/PaginatedApiResponse";

export interface LessonPayload extends LessonFormValues {
  teacherId?: string | null;
}

function toApiTime(value: string): string {
  return value.length === 5 ? `${value}:00` : value;
}

function toRequestBody(payload: LessonPayload) {
  return {
    file_no: payload.fileNo,
    subject: payload.subject,
    lesson_date: payload.lessonDate,
    start_time: toApiTime(payload.startTime),
    end_time: toApiTime(payload.endTime),
    school_year_id: payload.schoolYearId,
    school_class_id: payload.schoolClassId,
    course_id: payload.courseId,
    teacher_id: payload.teacherId ?? undefined,
    classroom_id: payload.classroomId ?? null,
    comments: payload.comments ?? null,
  };
}

interface LessonFilters {
  schoolYearId?: string | null;
  courseId?: string | null;
  schoolClassId?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  searchTerm?: string | null;
  teacherId?: string | null;
}

export async function index(
  api: AxiosInstance,
  filters: LessonFilters,
  page: number,
  perPage: number | "all",
): Promise<PaginatedApiResponse<Lesson>> {
  const { data } = await api.get<PaginatedApiResponse<Lesson>>("/lessons", {
    params: { ...filters, page, perPage },
  });
  return data;
}

export async function show(api: AxiosInstance, id: string): Promise<Lesson> {
  const { data } = await api.get<ApiResponse<Lesson>>(`/lessons/${id}`);
  return data.data;
}

export async function store(
  api: AxiosInstance,
  payload: LessonPayload,
): Promise<Lesson> {
  const { data } = await api.post<ApiResponse<Lesson>>(
    "/lessons",
    toRequestBody(payload),
  );
  return data.data;
}

export async function update(
  api: AxiosInstance,
  id: string,
  payload: LessonPayload,
): Promise<Lesson> {
  const { data } = await api.put<ApiResponse<Lesson>>(
    `/lessons/${id}`,
    toRequestBody(payload),
  );
  return data.data;
}
