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
  excused: { bg: "#F9FAFB", text: "#374151" },
  authorized: { bg: "#FAF5FF", text: "#7E22CE" },
  unexcused: { bg: "#FEF2F2", text: "#991B1B" },
  pending: { bg: "#FEF2F2", text: "#B91C1C" },
};
const DEFAULT_JUSTIFICATION_BADGE_COLOR = { bg: "#F9FAFB", text: "#374151" };

export function AttendanceSummaryStats({
  summary,
}: AttendanceSummaryStatsProps) {
  const { present, absent } = summary;

  const tiles: StatTile[] = [
    {
      key: "total",
      label: "Total pointages",
      dotColor: "#9CA3AF",
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
            className="flex-1 min-w-[45%] gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2.5"
          >
            <View className="flex-row items-center gap-1.5">
              <View
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: tile.dotColor }}
              />
              <Text className="text-xs text-gray-500">{tile.label}</Text>
            </View>
            <Text className="text-xl font-semibold text-black">
              {formatNumber(tile.value)}
            </Text>
            {tile.sublabel && (
              <Text className="text-xs text-gray-400">{tile.sublabel}</Text>
            )}
          </View>
        ))}
      </View>

      {absent.count > 0 && (
        <View className="flex-row flex-wrap items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2.5">
          <Text className="text-xs font-medium text-gray-500">
            Détail des absences
          </Text>

          <View className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5">
            <Text className="text-xs text-gray-700">
              Justifiées {formatNumber(absent.justifiedCount)}
            </Text>
          </View>
          <View className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5">
            <Text className="text-xs text-red-800">
              Non justifiées {formatNumber(absent.unjustifiedCount)}
            </Text>
          </View>

          {absent.byJustificationStatus.map((item) => {
            const colors =
              JUSTIFICATION_BADGE_COLORS[item.code] ??
              DEFAULT_JUSTIFICATION_BADGE_COLOR;
            return (
              <View
                key={item.code}
                className="rounded-full border border-gray-200 px-2 py-0.5"
                style={{ backgroundColor: colors.bg }}
              >
                <Text
                  className="text-xs"
                  style={{ color: colors.text }}
                >
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
