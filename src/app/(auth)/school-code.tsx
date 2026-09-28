import { schoolCodeSchema, type SchoolCodeForm } from "@/features/auth/schemas";
import { useAuthStore } from "@/stores/auth";
import { BRAND_PRIMARY } from "@/constants/theme";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { zodResolver } from "@hookform/resolvers/zod";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

const LOGO_LIGHT = require("@/assets/images/logo-primary.png");
const LOGO_DARK = require("@/assets/images/logo-primary-dark.png");

export default function SchoolCodeScreen() {
  const colors = useThemeColors();
  const isDark = useColorScheme().colorScheme === "dark";
  // En sombre, la bordure standard (zinc-800) disparaît sur le fond : on prend celle des champs.
  const fieldBorder = isDark ? colors.input : colors.border;
  const submitSchoolCode = useAuthStore((s) => s.submitSchoolCode);
  const [serverError, setServerError] = useState<string | null>(null);
  const [codeFocused, setCodeFocused] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SchoolCodeForm>({
    resolver: zodResolver(schoolCodeSchema),
    defaultValues: { code: "" },
  });

  const onSubmit = async (data: SchoolCodeForm) => {
    setServerError(null);
    try {
      await submitSchoolCode(data.code);
      router.replace("/(auth)/login");
    } catch {
      setServerError(
        "Code école introuvable. Veuillez vérifier auprès de votre établissement.",
      );
    }
  };

  return (
    <KeyboardAwareScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
      // Distance gardée sous le champ actif : assez pour laisser voir le bouton « Continuer » au-dessus du clavier.
      bottomOffset={120}
    >
      <View className="items-center pt-20 pb-8 px-6">
        <Image
          source={isDark ? LOGO_DARK : LOGO_LIGHT}
          style={{ width: 96, height: 67, marginBottom: 20 }}
          contentFit="contain"
        />

        <Text className="text-2xl font-semibold text-foreground text-center">
          Rejoindre votre école
        </Text>

        <Text className="text-sm text-muted-foreground text-center mt-3 max-w-[280px]">
          Veuillez saisir le code système de votre établissement scolaire pour
          continuer.
        </Text>
      </View>

      <View className="flex-1 justify-between px-6 pt-4 pb-8">
        <View>
          <Text className="text-sm font-medium text-foreground-secondary mb-2">
            Ecole, code système
          </Text>
          <Controller
            control={control}
            name="code"
            render={({ field: { onChange, onBlur, value } }) => (
              <View
                className="flex-row items-center h-14 rounded-2xl px-4 bg-subtle dark:bg-card border"
                style={{ borderColor: codeFocused ? BRAND_PRIMARY : fieldBorder }}
              >
                <Ionicons
                  name="school-outline"
                  size={20}
                  color={codeFocused ? BRAND_PRIMARY : colors.faint}
                />
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  onFocus={() => setCodeFocused(true)}
                  onBlur={() => {
                    setCodeFocused(false);
                    onBlur();
                  }}
                  placeholder="Code système de l'école"
                  placeholderTextColor={colors.faint}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  className="flex-1 text-base text-foreground ml-3 tracking-wide"
                />
              </View>
            )}
          />
          {errors.code && (
            <Text className="text-red-600 dark:text-red-400 text-xs mt-2">
              {errors.code.message}
            </Text>
          )}
          {serverError && (
            <Text className="text-red-600 dark:text-red-400 text-xs mt-2">{serverError}</Text>
          )}

          {/* Bouton collé au champ : le défilement clavier (bottomOffset) le garde visible. */}
          <Pressable
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="h-14 rounded-2xl items-center justify-center flex-row gap-2 mt-8"
            style={{
              backgroundColor: BRAND_PRIMARY,
              opacity: isSubmitting ? 0.7 : 1,
            }}
          >
            {isSubmitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text className="text-white font-semibold text-base">
                  Continuer
                </Text>
                <Ionicons name="arrow-forward" size={18} color="white" />
              </>
            )}
          </Pressable>

          <Text className="text-xs text-faint text-center mt-4">
            Vous ne connaissez pas le code de votre établissement ? Contactez
            l'administration.
          </Text>
        </View>

        <View className="mt-10">
          <View className="flex-row items-center mb-5">
            <View className="flex-1 h-px bg-border" />
            <Ionicons
              name="school-outline"
              size={14}
              color={colors.input}
              style={{ marginHorizontal: 10 }}
            />
            <View className="flex-1 h-px bg-border" />
          </View>

          <Text className="text-sm font-medium text-center text-primary dark:text-violet-400">
            Masomo ERP — l'école connectée pour tous.
          </Text>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
}
