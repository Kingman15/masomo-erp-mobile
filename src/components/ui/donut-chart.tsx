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
  trackColor = "#F3F4F6",
  centerLabel,
  centerSubLabel,
}: DonutChartProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  const total = segments.reduce((sum, segment) => sum + segment.value, 0) || 1;

  let cumulative = 0;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {segments
          .filter((segment) => segment.value > 0)
          .map((segment, index) => {
            const fraction = segment.value / total;
            const dashLength = fraction * circumference;
            const dashOffset = -((cumulative / total) * circumference);
            cumulative += segment.value;

            return (
              <Circle
                key={index}
                cx={center}
                cy={center}
                r={radius}
                stroke={segment.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                strokeDashoffset={dashOffset}
                strokeLinecap="butt"
                fill="none"
                rotation={-90}
                origin={`${center}, ${center}`}
              />
            );
          })}
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
            <Text className="text-sm font-semibold text-black">{centerLabel}</Text>
          )}
          {!!centerSubLabel && (
            <Text className="text-[10px] text-gray-400">{centerSubLabel}</Text>
          )}
        </View>
      )}
    </View>
  );
}
