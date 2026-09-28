import { BRAND_PRIMARY } from "@/constants/theme";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { useAuthStore } from "@/stores/auth";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { useColorScheme } from "nativewind";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const LOGO_LIGHT = require("@/assets/images/logo-primary.png");
const LOGO_DARK = require("@/assets/images/logo-primary-dark.png");

export default function BackofficeHomeScreen() {
  const colors = useThemeColors();
  const isDark = useColorScheme().colorScheme === "dark";
  const user = useAuthStore((s) => s.user);
  const school = useAuthStore((s) => s.school);
  const signOut = useAuthStore((s) => s.signOut);

  const displayName = user?.name ?? user?.username;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 justify-between px-6 pt-10 pb-6">
        <View className="items-center">
          <Image
            source={isDark ? LOGO_DARK : LOGO_LIGHT}
            style={{ width: 80, height: 56 }}
            contentFit="contain"
          />
        </View>

        <View className="items-center">
          <View className="w-20 h-20 rounded-3xl items-center justify-center bg-primary/10 dark:bg-primary/25 mb-6">
            <Ionicons
              name="desktop-outline"
              size={36}
              color={isDark ? "#C4B5FD" : BRAND_PRIMARY}
            />
          </View>

          <Text className="text-2xl font-semibold text-foreground text-center">
            Espace administration
          </Text>

          <Text className="text-base leading-6 text-muted-foreground text-center mt-3 max-w-[320px]">
            Bonjour
            {displayName && (
              <Text className="font-semibold text-foreground">{` ${displayName}`}</Text>
            )}
            {", la gestion de l'établissement se fait depuis le portail web Masomo."}
          </Text>

          {school?.name && (
            <View className="flex-row items-center gap-2 mt-5 px-3 py-1.5 rounded-full bg-muted">
              <Ionicons name="school-outline" size={14} color={colors.mutedForeground} />
              <Text className="text-sm font-medium text-foreground-secondary">
                {school.name}
              </Text>
            </View>
          )}

          <View className="w-full flex-row gap-3 mt-8 p-4 rounded-2xl border border-border bg-subtle dark:bg-card">
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={colors.mutedForeground}
            />
            <Text className="flex-1 text-sm leading-5 text-muted-foreground">
              {"Ouvrez le portail web sur un ordinateur avec les mêmes identifiants. L'application mobile est réservée aux enseignants, aux parents et aux élèves."}
            </Text>
          </View>
        </View>

        <View>
          <Pressable
            onPress={signOut}
            className="h-14 rounded-2xl border border-input flex-row items-center justify-center gap-2 active:bg-muted"
          >
            <Ionicons name="log-out-outline" size={18} color={colors.foreground} />
            <Text className="text-base font-semibold text-foreground">Se déconnecter</Text>
          </Pressable>

          <Text className="text-sm font-medium text-center text-primary dark:text-violet-400 mt-5">
            {"Masomo ERP — l'école connectée pour tous."}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
