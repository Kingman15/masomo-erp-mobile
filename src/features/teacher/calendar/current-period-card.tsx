import { BRAND_PRIMARY } from "@/constants/theme";
import { findCurrentPosition, formatDate, todayIso } from "@/features/teacher/calendar/utils";
import { useSchoolCalendar } from "@/hooks/queries/items/school-calendar";
import { useCurrentSchoolYear } from "@/hooks/queries/items/school-year";
import { useThemeColors } from "@/hooks/use-theme-colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Link } from "expo-router";
import { useColorScheme } from "nativewind";
import { useMemo } from "react";
import { Pressable, Text, View } from "react-native";

/**
 * Encart d'accueil : term et période(s) en cours d'après le calendrier scolaire (classes de l'enseignant).
 * Même requête que l'écran Calendrier (préchargée, disponible hors ligne).
 */
export function CurrentPeriodCard() {
  const isDark = useColorScheme().colorScheme === "dark";
  const colors = useThemeColors();

  const { currentSchoolYear } = useCurrentSchoolYear();
  const { schoolCalendar } = useSchoolCalendar({ schoolYearId: currentSchoolYear?.id });

  const { currentTerm, currentPeriods, nextPeriod } = useMemo(
    () => findCurrentPosition(schoolCalendar, todayIso()),
    [schoolCalendar],
  );

  // Encart discret : rien tant que le calendrier n'est pas disponible (ni en ligne ni en cache).
  if (!schoolCalendar) return null;

  // Plusieurs groupes de dates pour une même période : on précise les classes.
  const showClasses = currentPeriods.length > 1;

  return (
    <Link href="/teacher/calendar" asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Calendrier scolaire"
        className="flex-row items-center gap-3 mt-3 p-4 border border-border rounded-2xl dark:bg-card active:bg-subtle dark:active:bg-muted"
      >
        <View className="w-10 h-10 rounded-full bg-subtle dark:bg-primary/30 items-center justify-center">
          <Ionicons name="calendar-outline" size={20} color={isDark ? "#FFFFFF" : BRAND_PRIMARY} />
        </View>

        <View className="flex-1 gap-0.5">
          <Text className="text-xs text-muted-foreground">
            {currentTerm
              ? `${currentTerm.name} · ${formatDate(currentTerm.startDate)} → ${formatDate(currentTerm.endDate)}`
              : schoolCalendar.schoolYear.title}
          </Text>

          {currentPeriods.length > 0 ? (
            currentPeriods.map(({ period }) => (
              <View key={`${period.schoolPeriodId}-${period.startDate}-${period.endDate}`}>
                <Text className="text-sm font-semibold text-foreground">
                  {period.name ?? "Période"}
                  <Text className="text-xs font-normal text-muted-foreground">
                    {`  jusqu'au ${formatDate(period.endDate)}`}
                  </Text>
                </Text>
                {showClasses && (
                  <Text className="text-xs text-muted-foreground" numberOfLines={1}>
                    {period.generalClasses.map((gc) => gc.abbreviation ?? gc.title ?? "Classe").join(", ")}
                  </Text>
                )}
              </View>
            ))
          ) : (
            <>
              <Text className="text-sm font-semibold text-foreground">Aucune période en cours</Text>
              {nextPeriod && (
                <Text className="text-xs text-muted-foreground">
                  Prochaine : {nextPeriod.period.name ?? "Période"} le {formatDate(nextPeriod.period.startDate)}
                </Text>
              )}
            </>
          )}
        </View>

        <Ionicons name="chevron-forward" size={18} color={colors.faint} />
      </Pressable>
    </Link>
  );
}
