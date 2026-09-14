import { useCurrentStudents } from "@/hooks/queries/items/student";
import { formatShortDate } from "@/lib/format";
import { useAuthStore } from "@/stores/auth";
import type { Student } from "@/utils/types/Student";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Stack } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { ChangePasswordDialog } from "./change-password-dialog";

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

function StudentRow({ student }: { student: Student }) {
  const metaParts = [student.genderStr, formatShortDate(student.birthDate)].filter(
    (part): part is string => Boolean(part) && part !== "—",
  );

  return (
    <View className="flex-row items-center gap-3 py-2.5">
      <View className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center">
        <Ionicons name="person-outline" size={16} color="#6B7280" />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-medium text-black" numberOfLines={1}>
          {student.fullName ?? "Élève"}
        </Text>
        {metaParts.length > 0 && (
          <Text className="text-xs text-gray-400">{metaParts.join(" · ")}</Text>
        )}
      </View>
      {!student.isActive && (
        <View className="px-2 py-0.5 rounded-full bg-gray-100">
          <Text className="text-[10px] font-medium text-gray-500">Inactif</Text>
        </View>
      )}
    </View>
  );
}

export function ProfilScreen() {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);

  const { students = [], studentsIsLoading } = useCurrentStudents();
  const [changePasswordVisible, setChangePasswordVisible] = useState(false);

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: "Profil" }} />

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

          <SectionTitle>Mes enfants</SectionTitle>
          <View className="border-t border-gray-100 pt-1">
            {studentsIsLoading ? (
              <View className="py-4">
                <ActivityIndicator />
              </View>
            ) : students.length === 0 ? (
              <Text className="text-sm text-gray-400 py-2.5">
                Aucun enfant rattaché à ce compte.
              </Text>
            ) : (
              students.map((student) => <StudentRow key={student.id} student={student} />)
            )}
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
