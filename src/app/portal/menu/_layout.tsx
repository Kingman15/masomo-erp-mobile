import { Stack } from "expo-router";

export default function PortalMenuLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerTintColor: "#000000",
        headerTitleStyle: { fontWeight: "600" },
      }}
    />
  );
}
