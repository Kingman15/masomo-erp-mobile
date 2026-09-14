import { ChipSelect } from "@/components/list/chip-select";
import { useCurrentEnrollments } from "@/hooks/queries/items/enrollment";
import {
  usePortalHousehold,
  usePortalStudentSummary,
  usePortalStudentToday,
} from "@/hooks/queries/items/portal-dashboard";
import { useCurrentSchoolYear, useSchoolYears } from "@/hooks/queries/items/school-year";
import { Enrollment } from "@/utils/types/Enrollment";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
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
    <Text className="text-xs font-semibold text-gray-500 uppercase mb-1 mt-4">
      {children}
    </Text>
  );
}

export function DashboardScreen() {
  const {
    selectedStudent,
    selectedSchoolYear,
    selectedSchoolClass,
    setSelectedStudent,
    setSelectedSchoolYear,
    setSelectedSchoolClass,
  } = usePortalSelection();

  const { schoolYears = [], schoolYearsIsLoading } = useSchoolYears();
  const { currentSchoolYear } = useCurrentSchoolYear();

  const [selectedYearId, setSelectedYearId] = useState<string | null>(null);
  const effectiveYearId = selectedYearId ?? currentSchoolYear?.id ?? null;

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
  // Sert à re-synchroniser automatiquement la sélection globale (même élève,
  // nouvelle année) quand on change le chip "Année scolaire" sans repasser
  // par le dialogue de sélection d'élève.
  const activeEnrollmentForStudent = selectedStudent
    ? enrollments.find((enrollment) => enrollment.studentId === selectedStudent.id)
    : undefined;

  useEffect(() => {
    if (!selectedStudent || !activeEnrollmentForStudent) return;
    if (selectedSchoolYear?.id === activeEnrollmentForStudent.schoolYearId) return;

    setSelectedSchoolYear({ id: activeEnrollmentForStudent.schoolYearId });
    if (activeEnrollmentForStudent.schoolClassId) {
      setSelectedSchoolClass({ id: activeEnrollmentForStudent.schoolClassId });
    }
  }, [
    activeEnrollmentForStudent,
    selectedStudent,
    selectedSchoolYear,
    setSelectedSchoolYear,
    setSelectedSchoolClass,
  ]);

  const yearInSync = !effectiveYearId || selectedSchoolYear?.id === effectiveYearId;
  const studentFiltersAreComplete = Boolean(
    selectedStudent?.id && selectedSchoolYear?.id && yearInSync,
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
    setSelectedStudent({ id: enrollment.studentId });
    setSelectedSchoolYear({ id: enrollment.schoolYearId });
    if (enrollment.schoolClassId) {
      setSelectedSchoolClass({ id: enrollment.schoolClassId });
    }
    setSelectedYearId(enrollment.schoolYearId);
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

      <View className="flex-1 bg-white">
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
            onChange={(id) => id && setSelectedYearId(id)}
            loading={schoolYearsIsLoading}
          />

          <SectionTitle>Foyer</SectionTitle>
          <View className="border-t border-gray-100 pt-1">
            {householdIsLoading ? (
              <View className="py-4">
                <ActivityIndicator />
              </View>
            ) : householdError ? (
              <View className="py-4 gap-2">
                <Text className="text-sm text-gray-500">
                  Impossible de charger le foyer.
                </Text>
                <Pressable onPress={() => loadHousehold()}>
                  <Text className="text-sm font-medium text-black">Réessayer</Text>
                </Pressable>
              </View>
            ) : household.length === 0 ? (
              <Text className="text-sm text-gray-400 py-2.5">
                Aucun élève rattaché à ce compte.
              </Text>
            ) : (
              household.map((student, index) => (
                <View
                  key={student.studentId}
                  className={`flex-row items-center justify-between gap-3 py-2.5 ${
                    index > 0 ? "border-t border-gray-100" : ""
                  }`}
                >
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-black" numberOfLines={1}>
                      {student.studentName ?? "Élève"}
                    </Text>
                    <Text className="text-xs text-gray-400" numberOfLines={1}>
                      {student.schoolClassName ?? "Classe non renseignée"}
                    </Text>
                  </View>
                  {student.needsAttention && (
                    <View className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200">
                      <Text className="text-[10px] font-medium uppercase text-amber-700">
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
            className="flex-row items-center justify-between gap-3 py-2.5 border-t border-gray-100"
          >
            <View className="flex-1">
              <Text className="text-sm font-medium text-black" numberOfLines={1}>
                {selectedStudent?.fullName ?? "Sélectionner un élève"}
              </Text>
              {!!studentSubtitle && (
                <Text className="text-xs text-gray-400 mt-0.5" numberOfLines={1}>
                  {studentSubtitle}
                </Text>
              )}
            </View>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </Pressable>

          {enrollmentsError && (
            <View className="py-3 gap-2">
              <Text className="text-sm text-gray-500">
                Impossible de charger les élèves pour cette année.
              </Text>
              <Pressable onPress={() => loadEnrollments()}>
                <Text className="text-sm font-medium text-black">Réessayer</Text>
              </Pressable>
            </View>
          )}

          {!studentFiltersAreComplete ? (
            <Text className="text-sm text-gray-400 py-4 mt-2">
              {selectedStudent && effectiveYearId && !enrollmentsIsLoading && !activeEnrollmentForStudent
                ? `${selectedStudent.fullName ?? "Cet élève"} n'a pas d'inscription pour cette année scolaire.`
                : "Sélectionnez un élève pour afficher ses statistiques."}
            </Text>
          ) : (
            <>
              <DashboardAlertsSection
                alerts={studentSummary?.alerts}
                loading={studentSummaryIsLoading}
              />
              {studentSummaryError && (
                <View className="py-3 gap-2">
                  <Text className="text-sm text-gray-500">
                    Impossible de charger le sommaire de l'élève.
                  </Text>
                  <Pressable onPress={() => loadStudentSummary()}>
                    <Text className="text-sm font-medium text-black">Réessayer</Text>
                  </Pressable>
                </View>
              )}

              <SectionTitle>Aujourd'hui</SectionTitle>
              <View className="border-t border-gray-100 pt-1">
                {!todayFiltersAreComplete ? (
                  <Text className="text-sm text-gray-400 py-2.5">
                    Classe non déterminée pour cet élève.
                  </Text>
                ) : studentTodayError ? (
                  <View className="py-3 gap-2">
                    <Text className="text-sm text-gray-500">
                      Impossible de charger la journée de l'élève.
                    </Text>
                    <Pressable onPress={() => loadStudentToday()}>
                      <Text className="text-sm font-medium text-black">Réessayer</Text>
                    </Pressable>
                  </View>
                ) : (
                  <DashboardTodaySection today={studentToday} loading={studentTodayIsLoading} />
                )}
              </View>

              <SectionTitle>Présences</SectionTitle>
              <View className="border-t border-gray-100 pt-1">
                <DashboardAttendanceSection
                  attendance={studentSummary?.attendance}
                  loading={studentSummaryIsLoading}
                />
              </View>

              <SectionTitle>Résultats</SectionTitle>
              <View className="border-t border-gray-100 pt-1">
                <DashboardAcademicSection
                  academic={studentSummary?.academic}
                  loading={studentSummaryIsLoading}
                />
              </View>

              <SectionTitle>Discipline</SectionTitle>
              <View className="border-t border-gray-100 pt-1">
                <DashboardDisciplineSection
                  discipline={studentSummary?.discipline}
                  loading={studentSummaryIsLoading}
                />
              </View>

              <SectionTitle>Finances</SectionTitle>
              <View className="border-t border-gray-100 pt-1">
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
