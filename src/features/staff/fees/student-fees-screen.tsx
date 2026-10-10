import { FeeScheduleCard } from "@/features/portal/finance/fees/fee-schedule-card";
import { FeeScheduleSummaryCard } from "@/features/portal/finance/fees/fee-schedule-summary-card";
import { FeePaymentStatusPill } from "@/features/portal/finance/payments/fee-payment-status-pill";
import { useEnrollmentById } from "@/hooks/queries/items/enrollment";
import {
  useEnrollmentDerogations,
  useEnrollmentFeePayments,
  useFeeSchedules,
  useFeeScheduleSummary,
} from "@/hooks/queries/items/fee-payment";
import { useCan } from "@/hooks/use-can";
import { formatShortDate } from "@/lib/format";
import type { FeePaymentStatus } from "@/utils/types/objects/PortalFeePaymentDTO";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { getEnrollmentLabel, getSchoolClassLabel } from "../attendance/attendance-labels";

function SectionTitle({ children }: { children: string }) {
  return (
    <Text className="px-4 text-xs font-semibold text-muted-foreground uppercase mt-6 mb-1">
      {children}
    </Text>
  );
}

function EmptyLine({ children }: { children: string }) {
  return <Text className="px-4 text-sm text-faint mt-2">{children}</Text>;
}

// Situation des frais d'un élève (consultation) : synthèse, échéancier, paiements par tranche, dérogations.
// Chaque bloc n'apparaît qu'avec la permission correspondante.
export function StudentFeesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { enrollment, enrollmentIsLoading } = useEnrollmentById(id);

  const canViewSchedule = useCan("schoolFees.payments::schedule.view");
  const canViewPayments = useCan("schoolFees.payments.view");
  const canViewDerogations = useCan("schoolFees.derogations.view");

  const scheduleFilters = {
    studentId: enrollment?.studentId ?? null,
    schoolYearId: enrollment?.schoolYearId ?? null,
    schoolClassId: enrollment?.schoolClassId ?? null,
  };

  const { feeScheduleSummary, feeScheduleSummaryIsLoading } = useFeeScheduleSummary({
    filters: scheduleFilters,
    enabled: canViewSchedule,
  });
  const { feeSchedules, feeSchedulesIsLoading } = useFeeSchedules({
    filters: { ...scheduleFilters, sortBy: "dueDate" },
    enabled: canViewSchedule,
  });
  const { feePayments, feePaymentsIsLoading } = useEnrollmentFeePayments({
    enrollmentId: enrollment?.id,
    enabled: canViewPayments,
  });
  const { derogations, derogationsIsLoading } = useEnrollmentDerogations({
    enrollmentId: enrollment?.id,
    schoolYearId: enrollment?.schoolYearId,
    enabled: canViewDerogations,
  });

  // Seules les tranches ayant reçu au moins un versement ont un reçu à consulter.
  const paidPayments = (feePayments ?? []).filter(
    (payment) => (payment.feePaymentRecords ?? []).length > 0,
  );

  return (
    <>
      <Stack.Screen options={{ title: "Frais de l'élève" }} />

      {enrollmentIsLoading || !enrollment ? (
        <View className="flex-1 items-center justify-center bg-background">
          <ActivityIndicator />
        </View>
      ) : (
        <ScrollView className="flex-1 bg-background" contentContainerStyle={{ paddingVertical: 16 }}>
          <View className="px-4">
            <Text className="text-xl font-semibold text-foreground">
              {getEnrollmentLabel(enrollment)}
            </Text>
            <Text className="text-sm text-muted-foreground mt-0.5">
              {[getSchoolClassLabel(enrollment.schoolClass), enrollment.schoolYear?.title]
                .filter(Boolean)
                .join(" · ")}
            </Text>
          </View>

          {canViewSchedule && (
            <>
              <SectionTitle>Situation</SectionTitle>
              <FeeScheduleSummaryCard
                summary={feeScheduleSummary}
                isLoading={feeScheduleSummaryIsLoading}
              />

              <SectionTitle>Échéancier</SectionTitle>
              {feeSchedulesIsLoading ? (
                <ActivityIndicator className="mt-3" />
              ) : (feeSchedules ?? []).length === 0 ? (
                <EmptyLine>Aucun frais attribué.</EmptyLine>
              ) : (
                (feeSchedules ?? []).map((schedule, index) => (
                  <FeeScheduleCard
                    key={schedule.feeInstallmentId ?? `${schedule.label}-${index}`}
                    schedule={schedule}
                  />
                ))
              )}
            </>
          )}

          {canViewPayments && (
            <>
              <SectionTitle>Paiements</SectionTitle>
              {feePaymentsIsLoading ? (
                <ActivityIndicator className="mt-3" />
              ) : paidPayments.length === 0 ? (
                <EmptyLine>Aucun paiement enregistré.</EmptyLine>
              ) : (
                paidPayments.map((payment) => (
                  <Pressable
                    key={payment.id}
                    onPress={() => router.push(`/staff/students/fee-payment/${payment.id}`)}
                    className="mx-4 mt-3 px-4 py-3 rounded-xl border border-border bg-card active:bg-subtle"
                  >
                    <View className="flex-row items-center justify-between gap-3">
                      <Text className="flex-1 text-sm font-medium text-foreground" numberOfLines={1}>
                        {payment.feeInstallment?.fullDesignation ?? "Frais"}
                      </Text>
                      <FeePaymentStatusPill
                        status={payment.paymentStatus as FeePaymentStatus | null}
                        label={payment.paymentStatusStr}
                      />
                    </View>
                    <Text className="text-xs text-faint mt-1.5">
                      {payment.amountPaidStr ?? "—"} / {payment.amountDueStr ?? "—"}
                      {payment.lastPaymentDate
                        ? ` · dernier versement le ${formatShortDate(payment.lastPaymentDate)}`
                        : ""}
                    </Text>
                  </Pressable>
                ))
              )}
            </>
          )}

          {canViewDerogations && (
            <>
              <SectionTitle>Dérogations</SectionTitle>
              {derogationsIsLoading ? (
                <ActivityIndicator className="mt-3" />
              ) : (derogations ?? []).length === 0 ? (
                <EmptyLine>Aucune dérogation.</EmptyLine>
              ) : (
                (derogations ?? []).map((derogation) => (
                  <View
                    key={derogation.id}
                    className="mx-4 mt-3 px-4 py-3 rounded-xl border border-border bg-card"
                  >
                    <View className="flex-row items-center justify-between gap-3">
                      <Text className="flex-1 text-sm font-medium text-foreground" numberOfLines={1}>
                        {derogation.feeInstallment?.fullDesignation ?? "Frais"}
                      </Text>
                      <Text className="text-xs font-medium text-muted-foreground">
                        {derogation.statusStr ?? derogation.status ?? "—"}
                      </Text>
                    </View>
                    <Text className="text-xs text-faint mt-1.5">
                      {derogation.expirationDate
                        ? `Délai jusqu'au ${formatShortDate(derogation.expirationDate)}`
                        : `Demandée le ${formatShortDate(derogation.requestDate)}`}
                    </Text>
                    {derogation.reason ? (
                      <Text className="text-xs text-muted-foreground mt-1" numberOfLines={2}>
                        {derogation.reason}
                      </Text>
                    ) : null}
                  </View>
                ))
              )}
            </>
          )}
        </ScrollView>
      )}
    </>
  );
}
