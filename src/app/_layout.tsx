import "../global.css";

import { checkHealth } from "@/api/endpoints/health";
import { Toast } from "@/components/toast";
import { ThemeColors } from "@/constants/colors";
import { BRAND_PRIMARY } from "@/constants/theme";
import { startOfflinePersistence } from "@/lib/offline/persistence";
import { queryClient } from "@/lib/queryClient";
import { useAuthStore } from "@/stores/auth";
import { usePortalSelectionStore } from "@/stores/portal-selection";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { QueryClientProvider } from "@tanstack/react-query";
import {
  DarkTheme,
  DefaultTheme,
  Redirect,
  Stack,
  ThemeProvider,
  useSegments,
} from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";

const ROLE_HOME = {
  backoffice: "/backoffice",
  teacher: "/teacher",
  portal: "/portal",
} as const;

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = ThemeColors[isDark ? "dark" : "light"];
  const baseTheme = isDark ? DarkTheme : DefaultTheme;

  // Fonds des écrans, en-têtes et tiroirs react-navigation alignés sur les tokens du thème.
  const navigationTheme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: BRAND_PRIMARY,
      background: colors.background,
      card: colors.card,
      text: colors.foreground,
      border: colors.border,
    },
  };

  return (
    <KeyboardProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={navigationTheme}>
          <StatusBar style="auto" />
          <RootNavigation />
        </ThemeProvider>
      </QueryClientProvider>
    </KeyboardProvider>
  );
}

function RootNavigation() {
  const { status, user, school, hydrate } = useAuthStore();
  const segments = useSegments();

  useEffect(() => {
    hydrate();
    usePortalSelectionStore.getState().hydrate();

    checkHealth()
      .then(() => console.log("[health] serveur joignable"))
      .catch((err) => console.log("[health] serveur injoignable", err));
  }, []);

  // Cache et file d'envois hors ligne propres au compte connecté : restaurés au démarrage (y compris sans réseau), puis sauvegardés en continu.
  // L'arrêt (sauvegarde + vidage) est fait par signOut.
  const userId = user?.id;
  const schoolCode = school?.code;
  useEffect(() => {
    if (status !== "signedIn" || !userId || !schoolCode) return;

    startOfflinePersistence(queryClient, { schoolCode, userId }).catch((err) =>
      console.log("[offline] restauration impossible", err),
    );
  }, [status, userId, schoolCode]);

  if (status === "loading") return null; // splash screen ici. TODO.

  const inAuthGroup = segments[0] === "(auth)";

  // École déjà connue (conservée à la déconnexion) : directement l'écran de connexion.
  if (status !== "signedIn" && !inAuthGroup) {
    return (
      <Redirect
        href={status === "needsCredentials" ? "/(auth)/login" : "/(auth)/school-code"}
      />
    );
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
