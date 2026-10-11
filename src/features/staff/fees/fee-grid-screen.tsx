import { ComboBox } from "@/components/list/combo-box";
import { DrawerMenuButton } from "@/features/staff/drawer-menu-button";
import { useFeeInstallments } from "@/hooks/queries/items/fee-installment";
import { useGeneralClasses } from "@/hooks/queries/items/general-class";
import { useCurrentSchoolYear } from "@/hooks/queries/items/school-year";
import { formatShortDate } from "@/lib/format";
import type { FeeInstallment } from "@/utils/types/FeeInstallment";
import { Stack } from "expo-router";
import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";

type FeeGroup = {
  feeAssignmentId: string;
  installments: FeeInstallment[];
};

function FeeCard({ group }: { group: FeeGroup }) {
  const assignment = group.installments[0].feeAssignment;
  const fee = assignment?.fee;

  return (
    <View className="mx-4 mb-3 rounded-xl border border-border bg-card">
      <View className="px-4 py-3 flex-row items-start justify-between gap-3 border-b border-divider">
        <View className="flex-1">
          <Text className="text-base font-semibold text-foreground">
            {fee?.designation ?? "Frais sans titre"}
          </Text>
          {fee?.feeType?.title && (
            <Text className="text-sm text-muted-foreground mt-0.5">{fee.feeType.title}</Text>
          )}
        </View>
        <Text className="text-base font-semibold text-foreground">{assignment?.amountStr}</Text>
      </View>

      {group.installments.map((installment) => (
        <View key={installment.id} className="px-4 py-2.5 flex-row items-center justify-between gap-3">
          <Text className="flex-1 text-sm text-foreground-secondary">
            {[
              `Tranche ${installment.installmentNumber}`,
              installment.dueDate ? `avant le ${formatShortDate(installment.dueDate)}` : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </Text>
          <Text className="text-sm font-medium text-foreground">{installment.amountDueStr}</Text>
        </View>
      ))}
    </View>
  );
}

// Grille des frais d'une classe (consultation) : pour renseigner un parent, même avant l'inscription.
export function FeeGridScreen() {
  const [generalClassId, setGeneralClassId] = useState<string | null>(null);

  const { currentSchoolYear } = useCurrentSchoolYear();
  const schoolYearId = currentSchoolYear?.id ?? null;

  const { generalClasses, generalClassesIsLoading } = useGeneralClasses();

  const {
    feeInstallments,
    feeInstallmentsError,
    feeInstallmentsIsLoading,
    feeInstallmentsIsRefetching,
    loadFeeInstallments,
  } = useFeeInstallments({ schoolYearId, generalClassId });

  // Tranches regroupées par frais, dans l'ordre de l'API (type de frais, frais, numéro de tranche).
  const groups = useMemo(() => {
    const byAssignment = new Map<string, FeeGroup>();
    for (const installment of feeInstallments ?? []) {
      const group = byAssignment.get(installment.feeAssignmentId);
      if (group) group.installments.push(installment);
      else byAssignment.set(installment.feeAssignmentId, { feeAssignmentId: installment.feeAssignmentId, installments: [installment] });
    }
    return [...byAssignment.values()];
  }, [feeInstallments]);

  return (
    <>
      <Stack.Screen options={{ title: "Grille des frais", headerLeft: () => <DrawerMenuButton /> }} />

      <View className="flex-1 bg-background">
        <View className="px-4 pt-3">
          <ComboBox
            label="Classe"
            placeholder="Sélectionner une classe"
            options={generalClasses.map((generalClass) => ({
              id: generalClass.id,
              label: generalClass.title ?? generalClass.code ?? "",
            }))}
            value={generalClassId}
            onChange={setGeneralClassId}
            loading={generalClassesIsLoading}
          />
        </View>

        {!generalClassId ? (
          <View className="flex-1 items-center justify-center px-6">
            <Text className="text-sm text-faint text-center">
              Choisissez une classe pour voir ses frais, ses tranches et leurs échéances.
            </Text>
          </View>
        ) : feeInstallmentsIsLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : feeInstallmentsError ? (
          <View className="flex-1 items-center justify-center px-6 gap-3">
            <Text className="text-sm text-muted-foreground text-center">
              Impossible de charger la grille des frais.
            </Text>
            <Pressable
              onPress={() => loadFeeInstallments()}
              className="h-10 px-4 rounded-lg bg-foreground items-center justify-center"
            >
              <Text className="text-background font-medium">Réessayer</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={{ paddingTop: 4, paddingBottom: 12 }}
            refreshControl={
              <RefreshControl refreshing={feeInstallmentsIsRefetching} onRefresh={loadFeeInstallments} />
            }
          >
            {currentSchoolYear && (
              <Text className="px-4 py-2 text-xs text-faint">
                Année {currentSchoolYear.title} · montants de base, hors dérogations et réductions
              </Text>
            )}
            {groups.length === 0 ? (
              <Text className="px-6 py-16 text-sm text-faint text-center">
                Aucun frais attribué à cette classe.
              </Text>
            ) : (
              groups.map((group) => <FeeCard key={group.feeAssignmentId} group={group} />)
            )}
          </ScrollView>
        )}
      </View>
    </>
  );
}
