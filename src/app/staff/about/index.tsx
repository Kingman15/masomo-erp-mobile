import { AboutScreen } from "@/features/about/about-screen";
import { DrawerMenuButton } from "@/features/staff/drawer-menu-button";
import { Stack } from "expo-router";

export default function StaffAboutScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "À propos", headerLeft: () => <DrawerMenuButton /> }} />
      <AboutScreen />
    </>
  );
}
