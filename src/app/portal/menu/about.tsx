import { AboutScreen } from "@/features/about/about-screen";
import { Stack } from "expo-router";

export default function PortalAboutScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: "À propos" }} />
      <AboutScreen />
    </>
  );
}
