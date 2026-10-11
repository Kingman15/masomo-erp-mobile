import { ChipSelect } from "@/components/list/chip-select";
import { useCurrentEnrollments } from "@/hooks/queries/items/enrollment";
import {
  usePortalHousehold,
  usePortalStudentSummary,
  usePortalStudentToday,
} from "@/hooks/queries/items/portal-dashboard";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { Enrollment } from "@/utils/types/Enrollment";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Stack } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { PortalSelectionEmpty } from "../portal-selection-empty";
import { usePortalSelection } from "../use-portal-selection";
import { DashboardAcademicSection } from "./dashboard-academic-section";
import { DashboardAlertsSection } from "./dashboard-alerts-section";
import { DashboardAttendanceSection } from "./dashboard-attendance-section";
import { DashboardDisciplineSection } from "./dashboard-discipline-section";
import { DashboardFinanceSection } from "./dashboard-finance-section";
import { DashboardTodaySection } from "./dashboard-today-section";
import { StudentEnrollmentDialog } from "./student-enrollment-dialog";

function SectionTitle({ children }: { children: string }) {
  return (
    <Text className="text-xs font-semibold text-muted-foreground uppercase mb-1 mt-4">
      {children}
    </Text>
  );
}

export function DashboardScreen() {
  const colors = useThemeColors();
  const {
    schoolYears,
    schoolYearsIsLoading,
    selectedStudent,
    selectedSchoolYear,
    selectedSchoolClass,
    setSelectedStudent,
    setSelectedSchoolYear,
    setSelectedSchoolClass,
  } = usePortalSelection();

  // Le chip "Année scolaire" pilote directement la sélection globale (année -> élève -> classe) :
  // l'élève est conservé s'il est inscrit sur la nouvelle année, sinon désélectionné (usePortalSelection).
  const effectiveYearId = selectedSchoolYear?.id ?? null;

  const { enrollments = [], enrollmentsIsLoading, enrollmentsError, loadEnrollments } =
    useCurrentEnrollments({
      filters: { schoolYearId: effectiveYearId },
      enabled: !!effectiveYearId,
    });

  const {
    household,
    householdIsLoading,
    householdError,
    loadHousehold,
    householdIsFetching,
  } = usePortalHousehold();

  // L'élève sélectionné a-t-il une inscription pour l'année choisie en haut ?
  const activeEnrollmentForStudent = selectedStudent
    ? enrollments.find((enrollment) => enrollment.studentId === selectedStudent.id)
    : undefined;

  const studentFiltersAreComplete = Boolean(
    selectedStudent?.id && selectedSchoolYear?.id && activeEnrollmentForStudent,
  );
  const todayFiltersAreComplete = Boolean(
    studentFiltersAreComplete && selectedSchoolClass?.id,
  );

  const { studentSummary, studentSummaryError, loadStudentSummary, studentSummaryIsLoading } =
    usePortalStudentSummary({
      studentId: selectedStudent?.id,
      schoolYearId: selectedSchoolYear?.id,
      enabled: studentFiltersAreComplete,
    });

  const { studentToday, studentTodayError, loadStudentToday, studentTodayIsLoading } =
    usePortalStudentToday({
      studentId: selectedStudent?.id,
      schoolYearId: selectedSchoolYear?.id,
      schoolClassId: selectedSchoolClass?.id,
      enabled: todayFiltersAreComplete,
    });

  const [dialogVisible, setDialogVisible] = useState(false);

  const handleSelectEnrollment = (enrollment: Enrollment) => {
    if (enrollment.schoolYearId !== selectedSchoolYear?.id) {
      setSelectedSchoolYear({ id: enrollment.schoolYearId });
    }
    setSelectedStudent({ id: enrollment.studentId });
    if (enrollment.schoolClassId) {
      setSelectedSchoolClass({ id: enrollment.schoolClassId });
    }
    setDialogVisible(false);
  };

  const studentSubtitle = [
    selectedSchoolYear?.title,
    selectedSchoolClass?.title ?? selectedSchoolClass?.abbreviation,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: "Tableau de bord" }} />

      <View className="flex-1 bg-background">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={householdIsFetching}
              onRefresh={() => {
                void loadHousehold();
                void loadEnrollments();
                void loadStudentSummary();
                void loadStudentToday();
              }}
            />
          }
        >
          <ChipSelect
            label="Année scolaire"
            options={schoolYears.map((sy) => ({ id: sy.id, label: sy.title }))}
            value={effectiveYearId}
            onChange={(id) => id && setSelectedSchoolYear({ id })}
            loading={schoolYearsIsLoading}
          />

          <SectionTitle>Foyer</SectionTitle>
          <View className="border-t border-divider pt-1">
            {householdIsLoading ? (
              <View className="py-4">
                <ActivityIndicator />
              </View>
            ) : householdError ? (
              <View className="py-4 gap-2">
                <Text className="text-sm text-muted-foreground">
                  Impossible de charger le foyer.
                </Text>
                <Pressable onPress={() => loadHousehold()}>
                  <Text className="text-sm font-medium text-foreground">Réessayer</Text>
                </Pressable>
              </View>
            ) : household.length === 0 ? (
              <Text className="text-sm text-faint py-2.5">
                Aucun élève rattaché à ce compte.
              </Text>
            ) : (
              household.map((student, index) => (
                <View
                  key={student.studentId}
                  className={`flex-row items-center justify-between gap-3 py-2.5 ${
                    index > 0 ? "border-t border-divider" : ""
                  }`}
                >
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-foreground" numberOfLines={1}>
                      {student.studentName ?? "Élève"}
                    </Text>
                    <Text className="text-xs text-faint" numberOfLines={1}>
                      {student.schoolClassName ?? "Classe non renseignée"}
                    </Text>
                  </View>
                  {student.needsAttention && (
                    <View className="px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
                      <Text className="text-[10px] font-medium uppercase text-amber-700 dark:text-amber-300">
                        À surveiller
                      </Text>
                    </View>
                  )}
                </View>
              ))
            )}
          </View>

          <SectionTitle>Élève</SectionTitle>
          <Pressable
            onPress={() => setDialogVisible(true)}
            className="flex-row items-center justify-between gap-3 py-2.5 border-t border-divider"
          >
            <View className="flex-1">
              <Text className="text-sm font-medium text-foreground" numberOfLines={1}>
                {selectedStudent?.fullName ?? "Sélectionner un élève"}
              </Text>
              {!!studentSubtitle && (
                <Text className="text-xs text-faint mt-0.5" numberOfLines={1}>
                  {studentSubtitle}
                </Text>
              )}
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.faint} />
          </Pressable>

          {enrollmentsError && (
            <View className="py-3 gap-2">
              <Text className="text-sm text-muted-foreground">
                Impossible de charger les élèves pour cette année.
              </Text>
              <Pressable onPress={() => loadEnrollments()}>
                <Text className="text-sm font-medium text-foreground">Réessayer</Text>
              </Pressable>
            </View>
          )}

          {!studentFiltersAreComplete ? (
            <View className="py-6 mt-2">
              <PortalSelectionEmpty subject="ses statistiques" requiresClass={false} />
            </View>
          ) : (
            <>
              <DashboardAlertsSection
                alerts={studentSummary?.alerts}
                loading={studentSummaryIsLoading}
              />
              {studentSummaryError && (
                <View className="py-3 gap-2">
                  <Text className="text-sm text-muted-foreground">
                    Impossible de charger le sommaire de l'élève.
                  </Text>
                  <Pressable onPress={() => loadStudentSummary()}>
                    <Text className="text-sm font-medium text-foreground">Réessayer</Text>
                  </Pressable>
                </View>
              )}

              <SectionTitle>Aujourd'hui</SectionTitle>
              <View className="border-t border-divider pt-1">
                {!todayFiltersAreComplete ? (
                  <Text className="text-sm text-faint py-2.5">
                    Classe non déterminée pour cet élève.
                  </Text>
                ) : studentTodayError ? (
                  <View className="py-3 gap-2">
                    <Text className="text-sm text-muted-foreground">
                      Impossible de charger la journée de l'élève.
                    </Text>
                    <Pressable onPress={() => loadStudentToday()}>
                      <Text className="text-sm font-medium text-foreground">Réessayer</Text>
                    </Pressable>
                  </View>
                ) : (
                  <DashboardTodaySection today={studentToday} loading={studentTodayIsLoading} />
                )}
              </View>

              <SectionTitle>Présences</SectionTitle>
              <View className="border-t border-divider pt-1">
                <DashboardAttendanceSection
                  attendance={studentSummary?.attendance}
                  loading={studentSummaryIsLoading}
                />
              </View>

              <SectionTitle>Résultats</SectionTitle>
              <View className="border-t border-divider pt-1">
                <DashboardAcademicSection
                  academic={studentSummary?.academic}
                  loading={studentSummaryIsLoading}
                />
              </View>

              <SectionTitle>Discipline</SectionTitle>
              <View className="border-t border-divider pt-1">
                <DashboardDisciplineSection
                  discipline={studentSummary?.discipline}
                  loading={studentSummaryIsLoading}
                />
              </View>

              <SectionTitle>Finances</SectionTitle>
              <View className="border-t border-divider pt-1">
                <DashboardFinanceSection
                  finance={studentSummary?.finance}
                  loading={studentSummaryIsLoading}
                />
              </View>
            </>
          )}
        </ScrollView>
      </View>

      <StudentEnrollmentDialog
        visible={dialogVisible}
        onClose={() => setDialogVisible(false)}
        enrollments={enrollments}
        loading={enrollmentsIsLoading}
        selectedStudentId={selectedStudent?.id}
        onSelect={handleSelectEnrollment}
      />
    </>
  );
}
