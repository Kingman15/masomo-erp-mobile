import { useCurrentStudents } from "@/hooks/queries/items/student";
import { useThemeColors } from "@/hooks/use-theme-colors";
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
  const colors = useThemeColors();
  if (!value) return null;

  return (
    <View className="flex-row items-center gap-3 py-2.5">
      <Ionicons name={icon} size={16} color={colors.mutedForeground} />
      <Text className="text-xs text-muted-foreground w-32">{label}</Text>
      <Text className="flex-1 text-sm text-foreground">{value}</Text>
    </View>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <Text className="text-xs font-semibold text-muted-foreground uppercase mb-1 mt-4">
      {children}
    </Text>
  );
}

function StudentRow({ student }: { student: Student }) {
  const colors = useThemeColors();
  const metaParts = [student.genderStr, formatShortDate(student.birthDate)].filter(
    (part): part is string => Boolean(part) && part !== "—",
  );

  return (
    <View className="flex-row items-center gap-3 py-2.5">
      <View className="w-9 h-9 rounded-full bg-muted items-center justify-center">
        <Ionicons name="person-outline" size={16} color={colors.mutedForeground} />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-medium text-foreground" numberOfLines={1}>
          {student.fullName ?? "Élève"}
        </Text>
        {metaParts.length > 0 && (
          <Text className="text-xs text-faint">{metaParts.join(" · ")}</Text>
        )}
      </View>
      {!student.isActive && (
        <View className="px-2 py-0.5 rounded-full bg-muted">
          <Text className="text-[10px] font-medium text-muted-foreground">Inactif</Text>
        </View>
      )}
    </View>
  );
}

export function ProfilScreen() {
  const colors = useThemeColors();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);

  const { students = [], studentsIsLoading } = useCurrentStudents();
  const [changePasswordVisible, setChangePasswordVisible] = useState(false);

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: "Profil" }} />

      <View className="flex-1 bg-background">
        <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
          <View className="flex-row items-center gap-3">
            <View className="w-14 h-14 rounded-full border-2 border-green-500 items-center justify-center bg-card">
              <Ionicons name="person-outline" size={26} color={colors.mutedForeground} />
            </View>
            <View>
              <Text className="text-lg font-semibold text-foreground">
                {user?.name ?? user?.username ?? "Utilisateur"}
              </Text>
              {user?.role?.name && (
                <View className="flex-row items-center gap-1.5">
                  <Ionicons name="shield-checkmark-outline" size={14} color={colors.mutedForeground} />
                  <Text className="text-sm text-muted-foreground">{user.role.name}</Text>
                </View>
              )}
            </View>
          </View>

          <SectionTitle>Informations personnelles</SectionTitle>
          <View className="border-t border-divider pt-1">
            <InfoRow icon="finger-print-outline" label="Utilisateur" value={user?.username} />
            <InfoRow icon="mail-outline" label="Email" value={user?.email} />
            <InfoRow icon="business-outline" label="Rôle" value={user?.role?.name} />
          </View>

          <SectionTitle>Mes enfants</SectionTitle>
          <View className="border-t border-divider pt-1">
            {studentsIsLoading ? (
              <View className="py-4">
                <ActivityIndicator />
              </View>
            ) : students.length === 0 ? (
              <Text className="text-sm text-faint py-2.5">
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
            <Ionicons name="key-outline" size={16} color={colors.mutedForeground} />
            <Text className="flex-1 text-sm text-foreground">Changer le mot de passe</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.faint} />
          </Pressable>

          <Pressable
            onPress={signOut}
            className="h-11 px-6 border border-input rounded-lg items-center justify-center mt-6"
          >
            <Text className="text-foreground font-medium">Se déconnecter</Text>
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
