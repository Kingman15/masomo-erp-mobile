import { BRAND_PRIMARY } from "@/constants/theme";
import { useThemeColors } from "@/hooks/use-theme-colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { useColorScheme } from "nativewind";
import { useState, type ComponentProps, type ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";

const LOGO_LIGHT = require("@/assets/images/logo-primary.png");
const LOGO_DARK = require("@/assets/images/logo-primary-dark.png");

type IconName = ComponentProps<typeof Ionicons>["name"];

export function AuthHeader({ title, subtitle }: { title: string; subtitle?: ReactNode }) {
  const isDark = useColorScheme().colorScheme === "dark";

  return (
    <View className="items-center pt-12 pb-8 px-6">
      <Image
        source={isDark ? LOGO_DARK : LOGO_LIGHT}
        style={{ width: 96, height: 67, marginBottom: 20 }}
        contentFit="contain"
      />

      <Text className="text-2xl font-semibold text-foreground text-center">{title}</Text>

      {subtitle && (
        <Text className="text-base leading-6 text-muted-foreground text-center mt-2 max-w-[300px]">
          {subtitle}
        </Text>
      )}
    </View>
  );
}

interface AuthFieldProps extends Omit<TextInputProps, "className"> {
  label: string;
  icon: IconName;
  error?: string;
  hint?: string;
  /** Champ mot de passe : masqué, avec bouton afficher/masquer */
  secret?: boolean;
}

export function AuthField({ label, icon, error, hint, secret, onFocus, onBlur, ...input }: AuthFieldProps) {
  const colors = useThemeColors();
  const isDark = useColorScheme().colorScheme === "dark";
  // En sombre, la bordure standard (zinc-800) disparaît sur le fond : on prend celle des champs.
  const fieldBorder = isDark ? colors.input : colors.border;
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);

  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-foreground-secondary mb-2">{label}</Text>
      <View
        className="flex-row items-center h-14 rounded-2xl px-4 bg-subtle dark:bg-card border"
        style={{ borderColor: focused ? BRAND_PRIMARY : error ? "#DC2626" : fieldBorder }}
      >
        <Ionicons name={icon} size={20} color={focused ? BRAND_PRIMARY : colors.faint} />
        <TextInput
          {...input}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          secureTextEntry={secret && !revealed}
          placeholderTextColor={colors.faint}
          autoCorrect={false}
          className="flex-1 text-base text-foreground ml-3"
        />
        {secret && (
          <Pressable onPress={() => setRevealed((v) => !v)} hitSlop={8}>
            <Ionicons name={revealed ? "eye-off-outline" : "eye-outline"} size={20} color={colors.faint} />
          </Pressable>
        )}
      </View>
      {error ? (
        <Text className="text-red-600 dark:text-red-400 text-xs mt-2">{error}</Text>
      ) : hint ? (
        <Text className="text-faint text-xs mt-2">{hint}</Text>
      ) : null}
    </View>
  );
}

export function AuthButton({
  label,
  onPress,
  loading,
  icon = "arrow-forward",
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  icon?: IconName | null;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      className="h-14 rounded-2xl items-center justify-center flex-row gap-2 mt-4"
      style={{ backgroundColor: BRAND_PRIMARY, opacity: loading ? 0.7 : 1 }}
    >
      {loading ? (
        <ActivityIndicator color="white" />
      ) : (
        <>
          <Text className="text-white font-semibold text-base">{label}</Text>
          {icon && <Ionicons name={icon} size={18} color="white" />}
        </>
      )}
    </Pressable>
  );
}

/** Lien texte secondaire (« Parent d'élève ? Activer mon compte… ») */
export function AuthLink({ prefix, label, onPress }: { prefix?: string; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={8} className="mt-5 self-center active:opacity-60">
      <Text className="text-sm text-muted-foreground text-center">
        {prefix ? `${prefix} ` : ""}
        <Text className="font-medium text-primary dark:text-violet-400">{label}</Text>
      </Text>
    </Pressable>
  );
}

export function SchoolLogo({ logoUrl }: { logoUrl: string | null }) {
  const colors = useThemeColors();
  const [broken, setBroken] = useState(false);

  if (logoUrl && !broken) {
    return (
      <Image
        source={{ uri: logoUrl }}
        style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: colors.background }}
        contentFit="contain"
        onError={() => setBroken(true)}
      />
    );
  }

  return (
    <View className="w-11 h-11 rounded-xl items-center justify-center bg-violet-500/10">
      <Ionicons name="school-outline" size={22} color={BRAND_PRIMARY} />
    </View>
  );
}

/**
 * École sélectionnée : nom et logo si une connexion y a déjà réussi sur cet appareil, sinon le code saisi
 * (le serveur ne révèle l'identité de l'école qu'après le login).
 */
export function SchoolCard({
  code,
  name,
  logoUrl,
  onChange,
}: {
  code: string;
  name: string | null;
  logoUrl: string | null;
  onChange?: () => void;
}) {
  return (
    <View className="flex-row items-center gap-3 rounded-2xl border border-border bg-subtle dark:bg-card p-3 mb-5">
      <SchoolLogo logoUrl={logoUrl} />
      <View className="flex-1">
        <Text numberOfLines={1} className="text-base font-semibold text-foreground">
          {name ?? `École ${code}`}
        </Text>
        <Text className="text-xs text-muted-foreground mt-0.5">
          {name ? `Code ${code}` : "Première connexion sur cet appareil"}
        </Text>
      </View>
      {onChange && (
        <Pressable onPress={onChange} hitSlop={8} className="px-2 py-1 active:opacity-60">
          <Text className="text-sm font-semibold text-primary dark:text-violet-400">Changer</Text>
        </Pressable>
      )}
    </View>
  );
}

export function AuthFooter() {
  const colors = useThemeColors();

  return (
    <View className="mt-10">
      <View className="flex-row items-center mb-5">
        <View className="flex-1 h-px bg-border" />
        <Ionicons name="school-outline" size={14} color={colors.input} style={{ marginHorizontal: 10 }} />
        <View className="flex-1 h-px bg-border" />
      </View>

      <Text className="text-sm font-medium text-center text-primary dark:text-violet-400">
        {"Masomo ERP — l'école connectée pour tous."}
      </Text>
    </View>
  );
}
