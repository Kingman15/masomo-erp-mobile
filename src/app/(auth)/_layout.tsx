import { useThemeColors } from "@/hooks/use-theme-colors";
import { useAuthStore } from "@/stores/auth";
import { Redirect, Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AuthLayout() {
  const status = useAuthStore((s) => s.status);
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();

  if (status === "signedIn") {
    return <Redirect href="/" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // Zone de la barre d'état réservée hors du défilement : le formulaire, remonté par le clavier, ne passe plus dessous.
        contentStyle: { paddingTop: insets.top, backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="school-code" />
      <Stack.Screen name="login" />
      <Stack.Screen name="parent-activation" />
    </Stack>
  );
}
