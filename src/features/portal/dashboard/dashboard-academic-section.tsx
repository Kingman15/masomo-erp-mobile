import { DonutChart } from "@/components/ui/donut-chart";
import { AcademicSummary } from "@/utils/types/PortalStudentDashboard";
import { ActivityIndicator, Text, View } from "react-native";
import { StatBox } from "./stat-box";

type DashboardAcademicSectionProps = {
  academic: AcademicSummary | undefined;
  loading: boolean;
};

export function DashboardAcademicSection({ academic, loading }: DashboardAcademicSectionProps) {
  if (loading || !academic) {
    return (
      <View className="py-4">
        <ActivityIndicator />
      </View>
    );
  }

  const { average, rank, coursesBelowPassMark } = academic;

  if (!average && !rank && coursesBelowPassMark.length === 0) {
    return (
      <Text className="text-sm text-gray-400 py-2.5">
        Aucune évaluation publiée pour l'instant.
      </Text>
    );
  }

  const averageRate = average ? (average.value / average.scale) * 100 : 0;

  return (
    <View className="gap-3">
      {(average || rank) && (
        <View className="flex-row items-center gap-4">
          {average && (
            <DonutChart
              segments={[
                { value: averageRate, color: "#2563EB" },
                { value: 100 - averageRate, color: "#DBEAFE" },
              ]}
              centerLabel={`${average.value.toFixed(1)}/${average.scale}`}
              centerSubLabel="moyenne"
            />
          )}
          <View className="flex-1">
            {average && (
              <Text className="text-xs text-gray-400 mb-1">
                {average.basis.evaluationsPublished} évaluations publiées
              </Text>
            )}
            {rank && (
              <StatBox label="Rang" value={`${rank.position}/${rank.total}`} />
            )}
          </View>
        </View>
      )}

      {coursesBelowPassMark.length > 0 && (
        <View>
          <Text className="text-xs font-semibold text-gray-500 mb-1.5">
            Cours sous la moyenne de passage
          </Text>
          <View className="flex-row flex-wrap gap-1.5">
            {coursesBelowPassMark.map((course) => (
              <View
                key={course.courseId}
                className="px-2 py-1 rounded-full bg-red-50 border border-red-200"
              >
                <Text className="text-[11px] font-medium text-red-700">
                  {course.courseName} · {course.average.toFixed(1)}/{course.passMark}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}
