import { ChipSelect } from "@/components/list/chip-select";
import { ComboBox } from "@/components/list/combo-box";
import { DrawerMenuButton } from "@/features/staff/drawer-menu-button";
import {
  useFeeCollectionAvailableFees,
  useFeeCollectionList,
} from "@/hooks/queries/items/fee-payment";
import { useSchoolClasses } from "@/hooks/queries/items/school-class";
import { useCurrentSchoolYear } from "@/hooks/queries/items/school-year";
import { formatShortDate } from "@/lib/format";
import type {
  FeeCollectionStatus,
  FeeCollectionStudentDTO,
} from "@/utils/types/objects/FeeCollectionListDTO";
import { FlashList } from "@shopify/flash-list";
import { router, Stack } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { getSchoolClassLabel } from "../attendance/attendance-labels";

const STATUS_LABELS: Record<FeeCollectionStatus, string> = {
  unpaid: "Aucun paiement",
  partial: "Partiel",
  derogation: "Délai accordé",
  upToDate: "À jour",
};

const STATUS_STYLES: Record<FeeCollectionStatus, { bg: string; fg: string }> = {
  unpaid: { bg: "bg-red-100 dark:bg-red-900/40", fg: "text-red-700 dark:text-red-300" },
  partial: { bg: "bg-amber-100 dark:bg-amber-900/40", fg: "text-amber-700 dark:text-amber-300" },
  derogation: { bg: "bg-blue-100 dark:bg-blue-900/40", fg: "text-blue-700 dark:text-blue-300" },
  upToDate: { bg: "bg-green-100 dark:bg-green-900/40", fg: "text-green-700 dark:text-green-300" },
};

function CollectionRow({ student }: { student: FeeCollectionStudentDTO }) {
  const style = STATUS_STYLES[student.status];
  // Solde exigible par devise (négatif = reste à payer), comme la liste de contrôle du web.
  const balances = student.amounts.map((amount) => amount.balanceStr).join(" · ");

  return (
    <Pressable
      onPress={() => router.push(`/staff/students/fees/${student.enrollmentId}`)}
      className="px-4 py-3 border-b border-divider bg-card active:bg-subtle"
    >
      <View className="flex-row items-center justify-between gap-2">
        <Text className="flex-1 text-base font-semibold text-foreground" numberOfLines={1}>
          {student.studentName}
        </Text>
        <View className={`px-2.5 py-1 rounded-full ${style.bg}`}>
          <Text className={`text-xs font-medium ${style.fg}`}>{student.statusLabel}</Text>
        </View>
      </View>
      <Text className="text-sm text-muted-foreground mt-0.5" numberOfLines={1}>
        {[
          balances ? `Solde ${balances}` : null,
          student.oldestUnpaidDueDate
            ? `impayé depuis le ${formatShortDate(student.oldestUnpaidDueDate)}`
            : null,
        ]
          .filter(Boolean)
          .join(" · ")}
      </Text>
    </Pressable>
  );
}

// Contrôle des frais d'une classe (consultation) : qui est à jour, en retard ou sous délai accordé.
export function FeeCollectionScreen() {
  const [schoolClassId, setSchoolClassId] = useState<string | null>(null);
  const [excludedFeeIds, setExcludedFeeIds] = useState<string[]>([]);
  const [status, setStatus] = useState<FeeCollectionStatus | null>(null);

  const { currentSchoolYear } = useCurrentSchoolYear();
  const schoolYearId = currentSchoolYear?.id ?? null;

  const { schoolClasses, schoolClassesIsLoading } = useSchoolClasses({
    filters: { schoolYearId },
    enabled: Boolean(schoolYearId),
  });

  const { availableFees, availableFeesIsLoading } = useFeeCollectionAvailableFees({
    schoolYearId,
    schoolClassId,
  });

  // Tous les frais de la classe par défaut ; l'utilisateur en retire au besoin (remis à zéro au changement de classe).
  const changeSchoolClass = (id: string | null) => {
    setSchoolClassId(id);
    setExcludedFeeIds([]);
    setStatus(null);
  };
  const feeIds = useMemo(
    () =>
      (availableFees ?? [])
        .map((fee) => fee.feeId)
        .filter((feeId) => !excludedFeeIds.includes(feeId)),
    [availableFees, excludedFeeIds],
  );

  const { collection, collectionError, collectionIsLoading, collectionIsRefetching, loadCollection } =
    useFeeCollectionList({ schoolYearId, schoolClassId, feeIds });

  const students = useMemo(
    () => (collection?.students ?? []).filter((student) => !status || student.status === status),
    [collection, status],
  );

  const toggleFee = (feeId: string) =>
    setExcludedFeeIds((current) =>
      current.includes(feeId) ? current.filter((id) => id !== feeId) : [...current, feeId],
    );

  const renderStudent = useCallback(
    ({ item }: { item: FeeCollectionStudentDTO }) => <CollectionRow student={item} />,
    [],
  );

  const counts = collection?.summary.countsByStatus;

  return (
    <>
      <Stack.Screen
        options={{ title: "Contrôle des frais", headerLeft: () => <DrawerMenuButton /> }}
      />

      <View className="flex-1 bg-background">
        <View className="px-4 pt-3">
          <ComboBox
            label="Classe"
            placeholder="Sélectionner une classe"
            options={(schoolClasses ?? []).map((schoolClass) => ({
              id: schoolClass.id,
              label: getSchoolClassLabel(schoolClass),
            }))}
            value={schoolClassId}
            onChange={changeSchoolClass}
            loading={schoolClassesIsLoading}
          />

          {schoolClassId && (
            <>
              <Text className="text-sm font-medium text-foreground-secondary mb-2">Frais</Text>
              {availableFeesIsLoading ? (
                <ActivityIndicator className="mb-3" />
              ) : (availableFees ?? []).length === 0 ? (
                <Text className="text-sm text-faint mb-3">Aucun frais attribué à cette classe.</Text>
              ) : (
                <View className="flex-row flex-wrap gap-2 mb-3">
                  {(availableFees ?? []).map((fee) => {
                    const selected = !excludedFeeIds.includes(fee.feeId);
                    return (
                      <Pressable
                        key={fee.feeAssignmentId}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: selected }}
                        onPress={() => toggleFee(fee.feeId)}
                        className={`px-3 py-1.5 rounded-full border ${
                          selected ? "bg-foreground border-foreground" : "border-input"
                        }`}
                      >
                        <Text
                          className={`text-xs font-medium ${
                            selected ? "text-background" : "text-foreground-secondary"
                          }`}
                        >
                          {fee.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}

              {collection && (
                <ChipSelect
                  label="Situation"
                  options={(Object.keys(STATUS_LABELS) as FeeCollectionStatus[]).map((key) => ({
                    id: key,
                    label: `${STATUS_LABELS[key]} (${counts?.[key] ?? 0})`,
                  }))}
                  value={status}
                  onChange={(next) => setStatus(next as FeeCollectionStatus | null)}
                />
              )}
            </>
          )}
        </View>

        {!schoolClassId ? (
          <View className="flex-1 items-center justify-center px-6">
            <Text className="text-sm text-faint text-center">
              Choisissez une classe pour voir la situation des frais de ses élèves.
            </Text>
          </View>
        ) : feeIds.length === 0 ? (
          <View className="flex-1 items-center justify-center px-6">
            <Text className="text-sm text-faint text-center">Sélectionnez au moins un frais.</Text>
          </View>
        ) : collectionIsLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : collectionError ? (
          <View className="flex-1 items-center justify-center px-6 gap-3">
            <Text className="text-sm text-muted-foreground text-center">
              Impossible de charger le contrôle des frais.
            </Text>
            <Pressable
              onPress={() => loadCollection()}
              className="h-10 px-4 rounded-lg bg-foreground items-center justify-center"
            >
              <Text className="text-background font-medium">Réessayer</Text>
            </Pressable>
          </View>
        ) : (
          <FlashList
            data={students}
            keyExtractor={(item) => item.enrollmentId}
            renderItem={renderStudent}
            contentContainerStyle={{ paddingBottom: 12 }}
            ListHeaderComponent={
              collection ? (
                <Text className="px-4 py-2 text-xs text-faint">
                  {students.length} élève{students.length > 1 ? "s" : ""} · situation au{" "}
                  {formatShortDate(collection.asOfDate)}
                </Text>
              ) : null
            }
            ListEmptyComponent={
              <View className="items-center justify-center px-6 py-16">
                <Text className="text-sm text-faint text-center">
                  Aucun élève dans cette situation.
                </Text>
              </View>
            }
            refreshing={collectionIsRefetching}
            onRefresh={loadCollection}
          />
        )}
      </View>
    </>
  );
}
