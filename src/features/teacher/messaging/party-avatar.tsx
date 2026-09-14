import { getInitials } from "@/lib/format";
import { Text, View } from "react-native";

type PartyAvatarProps = {
  name: string | null | undefined;
  size?: number;
};

export function PartyAvatar({ name, size = 40 }: PartyAvatarProps) {
  return (
    <View
      className="rounded-full bg-gray-100 border border-gray-200 items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      <Text
        className="font-semibold text-gray-500"
        style={{ fontSize: size * 0.4 }}
      >
        {getInitials(name) || "?"}
      </Text>
    </View>
  );
}
