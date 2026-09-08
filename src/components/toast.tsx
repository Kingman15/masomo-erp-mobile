import { useToastStore } from "@/stores/toast";
import { useEffect, useState } from "react";
import { Animated, Text } from "react-native";

const VARIANT_CLASSES = {
  success: "bg-green-600",
  error: "bg-red-600",
  warning: "bg-amber-600",
  info: "bg-gray-900",
} as const;

export function Toast() {
  const { message, variant, token, hide } = useToastStore();
  const [opacity] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!message) return;

    opacity.setValue(0);
    Animated.timing(opacity, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start(() => hide());
    }, 2500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (!message) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        opacity,
        position: "absolute",
        left: 16,
        right: 16,
        bottom: 40,
      }}
      className={`rounded-lg px-4 py-3 ${VARIANT_CLASSES[variant]}`}
    >
      <Text className="text-white text-sm text-center">{message}</Text>
    </Animated.View>
  );
}
