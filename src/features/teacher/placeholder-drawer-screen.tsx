import { PlaceholderScreen } from "@/components/placeholder-screen";
import { Drawer } from "expo-router/drawer";

export function PlaceholderDrawerScreen({ title }: { title: string }) {
  return (
    <>
      <Drawer.Screen options={{ title }} />
      <PlaceholderScreen title={title} />
    </>
  );
}
