import { useStackScreenOptions } from "@/components/navigation/stack-screen-options";
import { Stack } from "expo-router";

export default function PortalMenuLayout() {
  const screenOptions = useStackScreenOptions();
  // En-tête affiché écran par écran (Stack.Screen headerShown: true).
  return <Stack screenOptions={{ ...screenOptions, headerShown: false }} />;
}
