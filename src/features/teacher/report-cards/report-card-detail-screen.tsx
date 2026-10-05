import { ReportStateView } from "@/features/teacher/grades/report-state-view";
import { useEnrollmentReportCard } from "@/hooks/queries/items/enrollment";
import { useIsOnline } from "@/lib/offline/use-offline-queue";
import { Stack, useLocalSearchParams } from "expo-router";
import { RefreshControl, ScrollView, View } from "react-native";
import { ReportCardView } from "./report-card-view";

export function ReportCardDetailScreen() {
  const { enrollmentId } = useLocalSearchParams<{ enrollmentId: string }>();
  const isOnline = useIsOnline();

  const {
    reportCard,
    reportCardError,
    reportCardIsLoading,
    reportCardIsFetching,
    loadReportCard,
  } = useEnrollmentReportCard(enrollmentId);

  return (
    <>
      <Stack.Screen options={{ title: "Bulletin" }} />

      <View className="flex-1 bg-background">
        {/* Requête en pause sans réseau (ni chargement ni erreur) : sans ce cas, l'écran resterait vide. */}
        <ReportStateView
          isSelectionComplete={isOnline || Boolean(reportCard)}
          selectionHint="Le bulletin n'est consultable qu'avec une connexion."
          isLoading={reportCardIsLoading}
          error={reportCardError}
          errorLabel="Impossible de charger le bulletin."
          onReload={() => void loadReportCard()}
          isEmpty={!reportCard}
          emptyLabel="Aucune donnée de bulletin."
        >
          {reportCard && (
            <ScrollView
              className="flex-1"
              contentContainerStyle={{ padding: 12, paddingBottom: 32 }}
              refreshControl={
                <RefreshControl
                  refreshing={reportCardIsFetching}
                  onRefresh={() => void loadReportCard()}
                />
              }
            >
              <ReportCardView card={reportCard} />
            </ScrollView>
          )}
        </ReportStateView>
      </View>
    </>
  );
}
