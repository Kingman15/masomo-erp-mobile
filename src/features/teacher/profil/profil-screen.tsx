import { ChangePasswordDialog } from "@/features/portal/profil/change-password-dialog";
import { useAuthStore } from "@/stores/auth";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Drawer } from "expo-router/drawer";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

type InfoRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | null | undefined;
};

function InfoRow({ icon, label, value }: InfoRowProps) {
  if (!value) return null;

  return (
    <View className="flex-row items-center gap-3 py-2.5">
      <Ionicons name={icon} size={16} color="#6B7280" />
      <Text className="text-xs text-gray-500 w-32">{label}</Text>
      <Text className="flex-1 text-sm text-black">{value}</Text>
    </View>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <Text className="text-xs font-semibold text-gray-500 uppercase mb-1 mt-4">
      {children}
    </Text>
  );
}

export function ProfilScreen() {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);

  const [changePasswordVisible, setChangePasswordVisible] = useState(false);

  return (
    <>
      <Drawer.Screen options={{ title: "Profil" }} />

      <View className="flex-1 bg-white">
        <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
          <View className="flex-row items-center gap-3">
            <View className="w-14 h-14 rounded-full border-2 border-green-500 items-center justify-center bg-white">
              <Ionicons name="person-outline" size={26} color="#6B7280" />
            </View>
            <View>
              <Text className="text-lg font-semibold text-black">
                {user?.name ?? user?.username ?? "Utilisateur"}
              </Text>
              {user?.role?.name && (
                <View className="flex-row items-center gap-1.5">
                  <Ionicons name="shield-checkmark-outline" size={14} color="#6B7280" />
                  <Text className="text-sm text-gray-500">{user.role.name}</Text>
                </View>
              )}
            </View>
          </View>

          <SectionTitle>Informations personnelles</SectionTitle>
          <View className="border-t border-gray-100 pt-1">
            <InfoRow icon="finger-print-outline" label="Utilisateur" value={user?.username} />
            <InfoRow icon="mail-outline" label="Email" value={user?.email} />
            <InfoRow icon="business-outline" label="Rôle" value={user?.role?.name} />
          </View>

          <SectionTitle>Sécurité</SectionTitle>
          <Pressable
            onPress={() => setChangePasswordVisible(true)}
            className="flex-row items-center gap-3 py-2.5"
          >
            <Ionicons name="key-outline" size={16} color="#6B7280" />
            <Text className="flex-1 text-sm text-black">Changer le mot de passe</Text>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </Pressable>

          <Pressable
            onPress={signOut}
            className="h-11 px-6 border border-gray-300 rounded-lg items-center justify-center mt-6"
          >
            <Text className="text-black font-medium">Se déconnecter</Text>
          </Pressable>
        </ScrollView>
      </View>

      <ChangePasswordDialog
        visible={changePasswordVisible}
        onClose={() => setChangePasswordVisible(false)}
      />
    </>
  );
}
