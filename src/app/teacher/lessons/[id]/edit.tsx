import { LessonFormScreen } from "@/features/teacher/lessons/lesson-form-screen";
import { useLocalSearchParams } from "expo-router";

export default function TeacherLessonEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <LessonFormScreen lessonId={id} />;
}
