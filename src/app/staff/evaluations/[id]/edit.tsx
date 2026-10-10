import { EvaluationFormScreen } from "@/features/staff/evaluations/evaluation-form-screen";
import { useLocalSearchParams } from "expo-router";

export default function TeacherEvaluationEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <EvaluationFormScreen evaluationId={id} />;
}
