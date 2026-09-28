import { useStackScreenOptions } from "@/components/navigation/stack-screen-options";
import { Stack } from "expo-router";

export default function TeacherScheduleLayout() {
  const screenOptions = useStackScreenOptions();
  return <Stack screenOptions={screenOptions} />;
}
