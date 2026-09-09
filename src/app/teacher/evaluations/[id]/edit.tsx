import { EvaluationFormScreen } from "@/features/teacher/evaluations/evaluation-form-screen";
import { useLocalSearchParams } from "expo-router";

export default function TeacherEvaluationEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <EvaluationFormScreen evaluationId={id} />;
}
