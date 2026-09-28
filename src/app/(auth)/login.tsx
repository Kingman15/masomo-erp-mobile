// app/(auth)/login.tsx
import {
  credentialsSchema,
  type CredentialsForm,
} from "@/features/auth/schemas";
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

export default function LoginScreen() {
  const colors = useThemeColors();
  const isDark = useColorScheme().colorScheme === "dark";
  // En sombre, la bordure standard (zinc-800) disparaît sur le fond : on prend celle des champs.
  const fieldBorder = isDark ? colors.input : colors.border;
  const school = useAuthStore((s) => s.school);
  const changeSchool = useAuthStore((s) => s.changeSchool);
  const signIn = useAuthStore((s) => s.signIn);
  const [serverError, setServerError] = useState<string | null>(null);
  const [usernameFocused, setUsernameFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CredentialsForm>({
    resolver: zodResolver(credentialsSchema),
    defaultValues: { schoolCode: school?.code, username: "", password: "" },
  });

  const onSubmit = async (data: CredentialsForm) => {
    setServerError(null);
    try {
      await signIn(data);
      // La redirection vers (guardian)/(teacher) est gérée par le layout racine
    } catch {
      setServerError("Email ou mot de passe incorrect.");
    }
  };

  return (
    <KeyboardAwareScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
      // Distance gardée sous le champ actif : assez pour laisser voir le bouton « Se connecter » au-dessus du clavier.
      bottomOffset={200}
    >
      <View className="items-center pt-20 pb-8 px-6">
        <Image
          source={isDark ? LOGO_DARK : LOGO_LIGHT}
          style={{ width: 96, height: 67, marginBottom: 20 }}
          contentFit="contain"
        />

        <Text className="text-2xl font-semibold text-foreground text-center">
          Connexion
        </Text>

        <Text className="text-base leading-6 text-muted-foreground text-center mt-2 max-w-[300px]">
          Connectez-vous à votre espace
          {school?.name && (
            <Text className="font-semibold text-foreground">{` ${school.name}`}</Text>
          )}
        </Text>
      </View>

      <View className="flex-1 justify-between px-6 pt-4 pb-8">
        <View>
          <Text className="text-sm font-medium text-foreground-secondary mb-2">
            Nom d'utilisateur / e-mail / téléphone
          </Text>
          <Controller
            control={control}
            name="username"
            render={({ field: { onChange, onBlur, value } }) => (
              <View
                className="flex-row items-center h-14 rounded-2xl px-4 bg-subtle dark:bg-card border"
                style={{
                  borderColor: usernameFocused ? BRAND_PRIMARY : fieldBorder,
                }}
              >
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={usernameFocused ? BRAND_PRIMARY : colors.faint}
                />
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  onFocus={() => setUsernameFocused(true)}
                  onBlur={() => {
                    setUsernameFocused(false);
                    onBlur();
                  }}
                  placeholder="Ex.: tshala.wakanda.01"
                  placeholderTextColor={colors.faint}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  className="flex-1 text-base text-foreground ml-3"
                />
              </View>
            )}
          />
          {errors.username && (
            <Text className="text-red-600 dark:text-red-400 text-xs mt-2">
              {errors.username.message}
            </Text>
          )}

          <Text className="text-sm font-medium text-foreground-secondary mb-2 mt-4">
            Mot de passe
          </Text>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <View
                className="flex-row items-center h-14 rounded-2xl px-4 bg-subtle dark:bg-card border"
                style={{
                  borderColor: passwordFocused ? BRAND_PRIMARY : fieldBorder,
                }}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={passwordFocused ? BRAND_PRIMARY : colors.faint}
                />
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => {
                    setPasswordFocused(false);
                    onBlur();
                  }}
                  secureTextEntry={!showPassword}
                  placeholder="••••••••"
                  placeholderTextColor={colors.faint}
                  autoCapitalize="none"
                  autoCorrect={false}
                  className="flex-1 text-base text-foreground ml-3"
                />
                <Pressable
                  onPress={() => setShowPassword((v) => !v)}
                  hitSlop={8}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={colors.faint}
                  />
                </Pressable>
              </View>
            )}
          />
          {errors.password && (
            <Text className="text-red-600 dark:text-red-400 text-xs mt-2">
              {errors.password.message}
            </Text>
          )}
          {serverError && (
            <Text className="text-red-600 dark:text-red-400 text-xs mt-2">{serverError}</Text>
          )}

          {/* Bouton collé aux champs : le défilement clavier (bottomOffset) le garde visible. */}
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
                  Se connecter
                </Text>
                <Ionicons name="arrow-forward" size={18} color="white" />
              </>
            )}
          </Pressable>

          <Pressable
            onPress={async () => {
              await changeSchool();
              router.replace("/(auth)/school-code");
            }}
            hitSlop={8}
            className="mt-4 flex-row items-center justify-center gap-1.5 self-center active:opacity-60"
          >
            <Ionicons name="swap-horizontal-outline" size={16} color={colors.mutedForeground} />
            <Text className="text-sm font-medium text-muted-foreground">
              Changer d'école
            </Text>
          </Pressable>
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
