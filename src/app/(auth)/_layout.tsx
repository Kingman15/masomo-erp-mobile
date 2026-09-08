import { useAuthStore } from "@/stores/auth";
import { Redirect, Stack } from "expo-router";

export default function AuthLayout() {
  const status = useAuthStore((s) => s.status);

  if (status === "signedIn") {
    return <Redirect href="/" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="school-code" />
      <Stack.Screen name="login" />
    </Stack>
  );
}
