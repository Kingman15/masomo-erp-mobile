import { useEnrollmentById } from "@/hooks/queries/items/enrollment";
import { useGuardianAssignments } from "@/hooks/queries/items/guardian";
import { useCan } from "@/hooks/use-can";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { formatShortDate } from "@/lib/format";
import { ENROLLMENT_STATUS_LABELS } from "@/utils/types/Enrollment";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { getEnrollmentLabel, getSchoolClassLabel } from "../attendance/attendance-labels";
import { GuardianContactCard } from "./guardian-contact-card";

type InfoRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | null | undefined;
};

function InfoRow({ icon, label, value }: InfoRowProps) {
  const colors = useThemeColors();
  return (
    <View className="flex-row items-center gap-3 py-2.5">
      <Ionicons name={icon} size={16} color={colors.mutedForeground} />
      <Text className="text-xs text-muted-foreground w-32">{label}</Text>
      <Text className="flex-1 text-sm text-foreground">{value || "—"}</Text>
    </View>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <Text className="text-xs font-semibold text-muted-foreground uppercase mb-1 mt-5">
      {children}
    </Text>
  );
}

// Fiche élève du personnel, à partir de l'inscription (consultation seule).
export function StudentDetailScreen() {
  const colors = useThemeColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { enrollment, enrollmentIsLoading, enrollmentError, loadEnrollment } =
    useEnrollmentById(id);

  const student = enrollment?.student;

  // Tous les tuteurs rattachés si le compte peut les lire ; sinon le tuteur de l'inscription.
  const canViewAssignments = useCan("core.master::guardianAssignments.view");
  const { guardianAssignments, guardianAssignmentsIsLoading } = useGuardianAssignments({
    studentId: enrollment?.studentId,
    enabled: canViewAssignments,
  });
  // Frais : lien vers la situation si le compte peut en lire au moins une partie.
  const canViewSchedule = useCan("schoolFees.payments::schedule.view");
  const canViewPayments = useCan("schoolFees.payments.view");
  const canViewDerogations = useCan("schoolFees.derogations.view");
  const canViewFees = canViewSchedule || canViewPayments || canViewDerogations;

  const activeAssignments = (guardianAssignments ?? []).filter(
    (assignment) => assignment.isActive && assignment.guardian,
  );

  return (
    <>
      <Stack.Screen options={{ title: "Fiche élève" }} />

      <View className="flex-1 bg-background">
        {enrollmentIsLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : enrollmentError || !enrollment ? (
          <View className="flex-1 items-center justify-center px-6 gap-3">
            <Text className="text-sm text-muted-foreground text-center">
              Impossible de charger la fiche de l&apos;élève.
            </Text>
            <Pressable
              onPress={() => loadEnrollment()}
              className="h-10 px-4 rounded-lg bg-foreground items-center justify-center"
            >
              <Text className="text-background font-medium">Réessayer</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
            <Text className="text-xl font-semibold text-foreground">
              {getEnrollmentLabel(enrollment)}
            </Text>
            <Text className="text-sm text-muted-foreground mt-0.5">
              {[getSchoolClassLabel(enrollment.schoolClass), enrollment.schoolYear?.title]
                .filter(Boolean)
                .join(" · ")}
            </Text>

            <SectionTitle>Identité</SectionTitle>
            <View className="border-t border-divider pt-1">
              <InfoRow icon="pricetag-outline" label="Matricule" value={student?.registrationNo} />
              <InfoRow icon="person-outline" label="Sexe" value={student?.genderStr} />
              <InfoRow
                icon="calendar-outline"
                label="Naissance"
                value={[
                  student?.birthDate ? formatShortDate(student.birthDate) : null,
                  student?.birthPlace,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              />
              <InfoRow icon="home-outline" label="Adresse" value={student?.address} />
            </View>

            <SectionTitle>Inscription</SectionTitle>
            <View className="border-t border-divider pt-1">
              <InfoRow icon="document-text-outline" label="N° d'inscription" value={enrollment.enrollmentNumber} />
              <InfoRow
                icon="time-outline"
                label="Date"
                value={enrollment.enrollmentDate ? formatShortDate(enrollment.enrollmentDate) : null}
              />
              <InfoRow
                icon="checkmark-circle-outline"
                label="Statut"
                value={
                  enrollment.status
                    ? (ENROLLMENT_STATUS_LABELS[enrollment.status] ?? enrollment.status)
                    : null
                }
              />
              {enrollment.withdrawnAt && (
                <InfoRow
                  icon="exit-outline"
                  label="Retrait"
                  value={[formatShortDate(enrollment.withdrawnAt), enrollment.withdrawalReason]
                    .filter(Boolean)
                    .join(" · ")}
                />
              )}
            </View>

            {canViewFees && (
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push(`/staff/students/fees/${enrollment.id}`)}
                className="mt-5 h-12 px-4 rounded-xl border border-border bg-card flex-row items-center gap-3 active:bg-subtle"
              >
                <Ionicons name="wallet-outline" size={18} color={colors.foreground} />
                <Text className="flex-1 text-sm font-medium text-foreground">Situation des frais</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
              </Pressable>
            )}

            <SectionTitle>Tuteurs</SectionTitle>
            {canViewAssignments && guardianAssignmentsIsLoading ? (
              <ActivityIndicator className="mt-2" />
            ) : activeAssignments.length > 0 ? (
              activeAssignments.map((assignment) => (
                <GuardianContactCard
                  key={assignment.id}
                  guardian={assignment.guardian!}
                  relationship={assignment.relationship}
                  isPrimary={assignment.isPrimaryGuardian}
                />
              ))
            ) : enrollment.guardian ? (
              <GuardianContactCard guardian={enrollment.guardian} isPrimary />
            ) : (
              <Text className="text-sm text-faint mt-2">Aucun tuteur enregistré.</Text>
            )}
          </ScrollView>
        )}
      </View>
    </>
  );
}
