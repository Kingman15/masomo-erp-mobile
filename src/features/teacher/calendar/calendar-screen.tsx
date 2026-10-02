import { formatDate, isOngoing, todayIso } from "@/features/teacher/calendar/utils";
import { DrawerMenuButton } from "@/features/teacher/drawer-menu-button";
import { useSchoolCalendar } from "@/hooks/queries/items/school-calendar";
import { useCurrentSchoolYear } from "@/hooks/queries/items/school-year";
import { useThemeColors } from "@/hooks/use-theme-colors";
import type { SchoolCalendarPeriod } from "@/utils/types/SchoolCalendar";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Stack } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";

export function CalendarScreen() {
  const [generalClassId, setGeneralClassId] = useState<string | null>(null);

  const { currentSchoolYear, currentSchoolYearIsLoading } = useCurrentSchoolYear();
  const {
    schoolCalendar,
    schoolCalendarError,
    schoolCalendarIsLoading,
    schoolCalendarIsFetching,
    loadSchoolCalendar,
  } = useSchoolCalendar({ schoolYearId: currentSchoolYear?.id });

  const today = todayIso();

  // Classes présentes dans le calendrier (celles où l'enseignant enseigne), pour le filtre.
  const generalClasses = useMemo(() => {
    const byId = new Map<string, string>();
    for (const term of schoolCalendar?.terms ?? []) {
      for (const period of term.periods) {
        for (const gc of period.generalClasses) {
          byId.set(gc.id, gc.abbreviation ?? gc.title ?? "Classe");
        }
      }
    }
    return [...byId.entries()].map(([id, label]) => ({ id, label }));
  }, [schoolCalendar]);

  // Filtre classe : on masque aussi les terms sans période pour la classe.
  const terms = useMemo(
    () =>
      generalClassId
        ? (schoolCalendar?.terms ?? [])
            .map((term) => ({
              ...term,
              periods: term.periods
                .map((period) => ({
                  ...period,
                  generalClasses: period.generalClasses.filter((gc) => gc.id === generalClassId),
                }))
                .filter((period) => period.generalClasses.length > 0),
            }))
            .filter((term) => term.periods.length > 0)
        : (schoolCalendar?.terms ?? []),
    [schoolCalendar, generalClassId],
  );

  const isLoading = currentSchoolYearIsLoading || schoolCalendarIsLoading;
  const isRefreshing = schoolCalendarIsFetching && !schoolCalendarIsLoading;

  const handleRefresh = useCallback(() => {
    void loadSchoolCalendar();
  }, [loadSchoolCalendar]);

  return (
    <>
      <Stack.Screen
        options={{
          title: "Calendrier scolaire",
          headerLeft: () => <DrawerMenuButton />,
        }}
      />

      <View className="flex-1 bg-background">
        {generalClasses.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="grow-0"
            contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10, gap: 8 }}
          >
            <ClassChip label="Toutes" active={generalClassId === null} onPress={() => setGeneralClassId(null)} />
            {generalClasses.map((gc) => (
              <ClassChip
                key={gc.id}
                label={gc.label}
                active={generalClassId === gc.id}
                onPress={() => setGeneralClassId(gc.id)}
              />
            ))}
          </ScrollView>
        )}

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 24 }}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
        >
          {isLoading ? (
            <View className="items-center justify-center py-16">
              <ActivityIndicator />
            </View>
          ) : schoolCalendarError && !schoolCalendar ? (
            <View className="items-center justify-center px-6 py-10 gap-3">
              <Text className="text-sm text-muted-foreground text-center">
                Impossible de charger le calendrier.
              </Text>
              <Pressable
                onPress={handleRefresh}
                className="h-10 px-4 rounded-lg bg-foreground items-center justify-center"
              >
                <Text className="text-background font-medium">Réessayer</Text>
              </Pressable>
            </View>
          ) : terms.length === 0 ? (
            <View className="items-center justify-center px-6 py-16">
              <Text className="text-sm text-faint text-center">
                Aucun calendrier configuré pour cette année scolaire.
              </Text>
            </View>
          ) : (
            terms.map((term) => (
              <View key={term.id}>
                <View className="flex-row items-baseline justify-between px-4 pt-5 pb-1.5">
                  <Text className="text-xs font-bold text-faint uppercase tracking-wider">
                    {term.name}
                  </Text>
                  <Text className="text-xs text-faint">
                    {formatDate(term.startDate)} → {formatDate(term.endDate)}
                  </Text>
                </View>

                {term.periods.length === 0 ? (
                  <Text className="px-4 py-3 text-sm text-faint">Aucune période.</Text>
                ) : (
                  term.periods.map((period, index) => (
                    <PeriodRow
                      key={`${period.schoolPeriodId}-${period.startDate}-${period.endDate}`}
                      period={period}
                      isFirst={index === 0}
                      ongoing={isOngoing(period.startDate, period.endDate, today)}
                      showClasses={generalClassId === null}
                    />
                  ))
                )}
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </>
  );
}

function ClassChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className={`h-8 px-3 rounded-full items-center justify-center ${active ? "bg-foreground" : "bg-muted"}`}
    >
      <Text className={`text-xs font-semibold ${active ? "text-background" : "text-foreground"}`}>{label}</Text>
    </Pressable>
  );
}

function PeriodRow({
  period,
  isFirst,
  ongoing,
  showClasses,
}: {
  period: SchoolCalendarPeriod;
  isFirst: boolean;
  ongoing: boolean;
  showClasses: boolean;
}) {
  const colors = useThemeColors();
  const overridden = period.generalClasses.some((gc) => gc.datesOverridden);

  return (
    <View className={`px-4 py-4 ${isFirst ? "" : "border-t border-divider"} ${ongoing ? "bg-muted" : ""}`}>
      <View className="flex-row items-center justify-between mb-1.5">
        <View className="flex-row items-center gap-1.5">
          <Ionicons name="calendar-outline" size={14} color={colors.foregroundSecondary} />
          <Text className="text-sm font-semibold text-foreground-secondary">
            {formatDate(period.startDate)} → {formatDate(period.endDate)}
          </Text>
        </View>
        {ongoing ? (
          <View className="px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/40">
            <Text className="text-[10px] font-bold uppercase tracking-wide text-green-800 dark:text-green-200">
              En cours
            </Text>
          </View>
        ) : overridden ? (
          <View className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/40">
            <Text className="text-[10px] font-bold uppercase tracking-wide text-amber-800 dark:text-amber-200">
              Dates propres
            </Text>
          </View>
        ) : null}
      </View>

      <Text className="text-lg font-bold text-foreground">{period.name ?? "Période"}</Text>

      {showClasses && (
        <View className="flex-row items-center gap-1 mt-1">
          <Ionicons name="people-outline" size={13} color={colors.faint} />
          <Text className="text-xs text-muted-foreground flex-1">
            {period.generalClasses.map((gc) => gc.abbreviation ?? gc.title ?? "Classe").join(", ")}
          </Text>
        </View>
      )}
    </View>
  );
}
