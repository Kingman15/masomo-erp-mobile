import "../global.css";

import { checkHealth } from "@/api/endpoints/health";
import { Toast } from "@/components/toast";
import { queryClient } from "@/lib/queryClient";
import { useAuthStore } from "@/stores/auth";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { QueryClientProvider } from "@tanstack/react-query";
import { Redirect, Stack, useSegments } from "expo-router";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const ROLE_HOME = {
  backoffice: "/backoffice",
  teacher: "/teacher",
  portal: "/portal",
} as const;

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <RootNavigation />
    </QueryClientProvider>
  );
}

function RootNavigation() {
  const { status, user, hydrate } = useAuthStore();
  const segments = useSegments();

  useEffect(() => {
    hydrate();

    checkHealth()
      .then(() => console.log("[health] serveur joignable"))
      .catch((err) => console.log("[health] serveur injoignable", err));
  }, []);

  if (status === "loading") return null; // splash screen ici. TODO.

  const inAuthGroup = segments[0] === "(auth)";

  if (status !== "signedIn" && !inAuthGroup) {
    return <Redirect href="/(auth)/school-code" />;
  }

  if (status === "signedIn" && user && segments[0] !== user.role.roleCategory) {
    return <Redirect href={ROLE_HOME[user.role.roleCategory]} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <Stack screenOptions={{ headerShown: false }} />
        <Toast />
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
