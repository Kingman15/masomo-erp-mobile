import { useThemeColors } from "@/hooks/use-theme-colors";
import { Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

export type DonutSegment = {
  value: number;
  color: string;
};

type DonutChartProps = {
  segments: DonutSegment[];
  size?: number;
  strokeWidth?: number;
  trackColor?: string;
  centerLabel?: string;
  centerSubLabel?: string;
};

export function DonutChart({
  segments,
  size = 88,
  strokeWidth = 10,
  trackColor,
  centerLabel,
  centerSubLabel,
}: DonutChartProps) {
  const colors = useThemeColors();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  const total = segments.reduce((sum, segment) => sum + segment.value, 0) || 1;

  // Chaque arc démarre là où s'arrêtent les précédents.
  const visibleSegments = segments.filter((segment) => segment.value > 0);
  const arcs = visibleSegments.map((segment, index) => {
    const before = visibleSegments
      .slice(0, index)
      .reduce((sum, previous) => sum + previous.value, 0);
    return {
      color: segment.color,
      dashLength: (segment.value / total) * circumference,
      dashOffset: -((before / total) * circumference),
    };
  });

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={trackColor ?? colors.muted}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {arcs.map((arc, index) => (
          <Circle
            key={index}
            cx={center}
            cy={center}
            r={radius}
            stroke={arc.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arc.dashLength} ${circumference - arc.dashLength}`}
            strokeDashoffset={arc.dashOffset}
            strokeLinecap="butt"
            fill="none"
            rotation={-90}
            origin={`${center}, ${center}`}
          />
        ))}
      </Svg>
      {(centerLabel || centerSubLabel) && (
        <View
          className="items-center justify-center"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        >
          {!!centerLabel && (
            <Text className="text-sm font-semibold text-foreground">{centerLabel}</Text>
          )}
          {!!centerSubLabel && (
            <Text className="text-[10px] text-faint">{centerSubLabel}</Text>
          )}
        </View>
      )}
    </View>
  );
}
