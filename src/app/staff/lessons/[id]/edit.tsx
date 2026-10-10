import { LessonFormScreen } from "@/features/staff/lessons/lesson-form-screen";
import { useLocalSearchParams } from "expo-router";

export default function TeacherLessonEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <LessonFormScreen lessonId={id} />;
}
