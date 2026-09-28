import { useStackScreenOptions } from "@/components/navigation/stack-screen-options";
import { Stack } from "expo-router";

export default function TeacherEvaluationsLayout() {
  const screenOptions = useStackScreenOptions();
  return <Stack screenOptions={screenOptions} />;
}
