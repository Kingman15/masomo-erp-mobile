import { useThemeColors } from "@/hooks/use-theme-colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import Constants from "expo-constants";
import { Image } from "expo-image";
import { openBrowserAsync, WebBrowserPresentationStyle } from "expo-web-browser";
import { useColorScheme } from "nativewind";
import { Pressable, ScrollView, Text, View } from "react-native";

const LOGO_LIGHT = require("@/assets/images/logo-landscape-primary.png");
const LOGO_DARK = require("@/assets/images/logo-landscape-primary-dark.png");

// Pages publiques du web (routes.about.terms / routes.about.privacy) et site de l'éditeur, comme le pied de page web.
const WEB_URL = "https://masomo.app";
const EDITOR_URL = "https://www.elkonceptservices.com";

const LEGAL_LINKS = [
  { label: "Conditions d'utilisation", icon: "document-text-outline", url: `${WEB_URL}/about/terms` },
  { label: "Politique de confidentialité", icon: "shield-checkmark-outline", url: `${WEB_URL}/about/privacy` },
] as const;

function openUrl(url: string) {
  void openBrowserAsync(url, { presentationStyle: WebBrowserPresentationStyle.AUTOMATIC });
}

function LinkRow({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  const colors = useThemeColors();
  return (
    <Pressable
      accessibilityRole="link"
      onPress={onPress}
      className="h-12 px-4 rounded-xl border border-border bg-card flex-row items-center gap-3 active:bg-subtle"
    >
      <Ionicons name={icon} size={18} color={colors.foreground} />
      <Text className="flex-1 text-sm font-medium text-foreground">{label}</Text>
      <Ionicons name="open-outline" size={16} color={colors.mutedForeground} />
    </Pressable>
  );
}

function SectionTitle({ children }: { children: string }) {
  return <Text className="text-xs font-semibold text-muted-foreground uppercase mb-2 mt-6">{children}</Text>;
}

// À propos de l'application (personnel et portail) : éditeur, comme la page web /about/app, et liens vers les pages légales du web.
export function AboutScreen() {
  const isDark = useColorScheme().colorScheme === "dark";
  const version = Constants.expoConfig?.version;

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 16 }}>
      <View className="items-center gap-1.5 px-6 py-7 rounded-2xl border border-border bg-card">
        <Image source={isDark ? LOGO_DARK : LOGO_LIGHT} style={{ width: 150, height: 40 }} contentFit="contain" />
        <Text className="mt-3 text-lg font-medium text-foreground">Masomo ERP</Text>
        {version && <Text className="text-xs text-muted-foreground">Version {version}</Text>}
        <Text className="mt-2 text-xs text-foreground-secondary">By Koncept @ Obinasom Project</Text>
        <Text className="mt-3 text-[11px] text-muted-foreground">
          {new Date().getFullYear()} © Koncept · Tous droits réservés
        </Text>
      </View>

      <SectionTitle>Éditeur</SectionTitle>
      <LinkRow icon="globe-outline" label="Koncept" onPress={() => openUrl(EDITOR_URL)} />

      <SectionTitle>Informations légales</SectionTitle>
      <View className="gap-2">
        {LEGAL_LINKS.map((link) => (
          <LinkRow key={link.url} icon={link.icon} label={link.label} onPress={() => openUrl(link.url)} />
        ))}
      </View>
    </ScrollView>
  );
}
