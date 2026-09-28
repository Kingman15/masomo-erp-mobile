import { useThemeColors } from "@/hooks/use-theme-colors";
import { formatNumber } from "@/lib/format";
import { StudentAttendanceRecordSummary } from "@/utils/types/StudentAttendanceRecordSummary";
import { Text, View } from "react-native";

type AttendanceSummaryStatsProps = {
  summary: StudentAttendanceRecordSummary;
};

type StatTile = {
  key: string;
  label: string;
  dotColor: string;
  value: number;
  sublabel?: string;
};

const formatRate = (value: number) =>
  `${formatNumber(value, { maximumFractionDigits: 1 })}% du total`;

const JUSTIFICATION_BADGE_COLORS: Record<
  string,
  { bg: string; text: string }
> = {
  excused: { bg: "bg-subtle", text: "text-foreground-secondary" },
  authorized: { bg: "bg-purple-50 dark:bg-purple-950", text: "text-purple-700 dark:text-purple-300" },
  unexcused: { bg: "bg-red-50 dark:bg-red-950", text: "text-red-800 dark:text-red-200" },
  pending: { bg: "bg-red-50 dark:bg-red-950", text: "text-red-700 dark:text-red-300" },
};
const DEFAULT_JUSTIFICATION_BADGE_COLOR = { bg: "bg-subtle", text: "text-foreground-secondary" };

export function AttendanceSummaryStats({
  summary,
}: AttendanceSummaryStatsProps) {
  const colors = useThemeColors();
  const { present, absent } = summary;

  const tiles: StatTile[] = [
    {
      key: "total",
      label: "Total pointages",
      dotColor: colors.faint,
      value: summary.totalRecords,
    },
    {
      key: "present",
      label: "Présences",
      dotColor: "#4ADE80",
      value: present.count,
      sublabel: formatRate(present.rate),
    },
    {
      key: "late",
      label: "Retards",
      dotColor: "#FBBF24",
      value: present.lateCount,
    },
    {
      key: "partial",
      label: "Partiels",
      dotColor: "#60A5FA",
      value: present.partialCount,
    },
    {
      key: "absent",
      label: "Absences",
      dotColor: "#F87171",
      value: absent.count,
      sublabel: formatRate(absent.rate),
    },
  ];

  return (
    <View className="gap-3">
      <View className="flex-row flex-wrap gap-2">
        {tiles.map((tile) => (
          <View
            key={tile.key}
            className="flex-1 min-w-[45%] gap-1.5 rounded-lg border border-border bg-card px-3 py-2.5"
          >
            <View className="flex-row items-center gap-1.5">
              <View
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: tile.dotColor }}
              />
              <Text className="text-xs text-muted-foreground">{tile.label}</Text>
            </View>
            <Text className="text-xl font-semibold text-foreground">
              {formatNumber(tile.value)}
            </Text>
            {tile.sublabel && (
              <Text className="text-xs text-faint">{tile.sublabel}</Text>
            )}
          </View>
        ))}
      </View>

      {absent.count > 0 && (
        <View className="flex-row flex-wrap items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5">
          <Text className="text-xs font-medium text-muted-foreground">
            Détail des absences
          </Text>

          <View className="rounded-full border border-border bg-subtle px-2 py-0.5">
            <Text className="text-xs text-foreground-secondary">
              Justifiées {formatNumber(absent.justifiedCount)}
            </Text>
          </View>
          <View className="rounded-full border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 px-2 py-0.5">
            <Text className="text-xs text-red-800 dark:text-red-200">
              Non justifiées {formatNumber(absent.unjustifiedCount)}
            </Text>
          </View>

          {absent.byJustificationStatus.map((item) => {
            const badge =
              JUSTIFICATION_BADGE_COLORS[item.code] ??
              DEFAULT_JUSTIFICATION_BADGE_COLOR;
            return (
              <View
                key={item.code}
                className={`rounded-full border border-border px-2 py-0.5 ${badge.bg}`}
              >
                <Text className={`text-xs ${badge.text}`}>
                  {item.label} {formatNumber(item.count)}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}
