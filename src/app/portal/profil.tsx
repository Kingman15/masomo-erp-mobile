import { useAuthStore } from "@/stores/auth";
import { Pressable, Text, View } from "react-native";

export default function PortalProfilScreen() {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);

  return (
    <View className="flex-1 items-center justify-center px-6 bg-white">
      <Text className="text-2xl font-medium mb-2">Profil</Text>
      <Text className="text-sm text-gray-500 mb-6 text-center">
        Bienvenue {user?.name ?? "utilisateur"}, écran à venir.
      </Text>
      <Pressable
        onPress={signOut}
        className="h-11 px-6 bg-black rounded-lg items-center justify-center"
      >
        <Text className="text-white font-medium">Se déconnecter</Text>
      </Pressable>
    </View>
  );
}
