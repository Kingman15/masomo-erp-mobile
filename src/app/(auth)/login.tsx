// app/(auth)/login.tsx
import {
  credentialsSchema,
  type CredentialsForm,
} from "@/features/auth/schemas";
import { useAuthStore } from "@/stores/auth";
import { BRAND_PRIMARY } from "@/constants/theme";
import { zodResolver } from "@hookform/resolvers/zod";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
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

export default function LoginScreen() {
  const school = useAuthStore((s) => s.school);
  const changeSchool = useAuthStore((s) => s.changeSchool);
  const signIn = useAuthStore((s) => s.signIn);
  const [serverError, setServerError] = useState<string | null>(null);
  const [usernameFocused, setUsernameFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const subtitle = school?.name
    ? `Connectez-vous à votre espace ${school.name}`
    : "Connectez-vous à votre espace";

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
      className="flex-1 bg-white"
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
      bottomOffset={20}
    >
      <View className="items-center pt-20 pb-8 px-6">
        <Image
          source={require("@/assets/images/logo-primary.png")}
          style={{ width: 96, height: 67, marginBottom: 20 }}
          contentFit="contain"
        />

        <Text className="text-2xl font-semibold text-black text-center">
          Connexion
        </Text>

        <Text className="text-xl text-gray-500 text-center mt-3 max-w-[280px]">
          {subtitle}
        </Text>
      </View>

      <View className="flex-1 justify-between px-6 pt-4 pb-8">
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Nom d'utilisateur / e-mail / téléphone
          </Text>
          <Controller
            control={control}
            name="username"
            render={({ field: { onChange, onBlur, value } }) => (
              <View
                className="flex-row items-center h-14 rounded-2xl px-4 bg-gray-50 border"
                style={{
                  borderColor: usernameFocused ? BRAND_PRIMARY : "#E5E7EB",
                }}
              >
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={usernameFocused ? BRAND_PRIMARY : "#9CA3AF"}
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
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  className="flex-1 text-base text-black ml-3"
                />
              </View>
            )}
          />
          {errors.username && (
            <Text className="text-red-600 text-xs mt-2">
              {errors.username.message}
            </Text>
          )}

          <Text className="text-sm font-medium text-gray-700 mb-2 mt-4">
            Mot de passe
          </Text>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <View
                className="flex-row items-center h-14 rounded-2xl px-4 bg-gray-50 border"
                style={{
                  borderColor: passwordFocused ? BRAND_PRIMARY : "#E5E7EB",
                }}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={passwordFocused ? BRAND_PRIMARY : "#9CA3AF"}
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
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="none"
                  autoCorrect={false}
                  className="flex-1 text-base text-black ml-3"
                />
                <Pressable
                  onPress={() => setShowPassword((v) => !v)}
                  hitSlop={8}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#9CA3AF"
                  />
                </Pressable>
              </View>
            )}
          />
          {errors.password && (
            <Text className="text-red-600 text-xs mt-2">
              {errors.password.message}
            </Text>
          )}
          {serverError && (
            <Text className="text-red-600 text-xs mt-2">{serverError}</Text>
          )}
        </View>

        <View>
          <Pressable
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="h-14 rounded-2xl items-center justify-center flex-row gap-2"
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

          <Pressable onPress={changeSchool} className="mt-4 items-center">
            <Text className="text-sm text-gray-300 underline">
              Changer d'école
            </Text>
          </Pressable>

          <View className="flex-row items-center my-5">
            <View className="flex-1 h-px bg-gray-200" />
            <Ionicons
              name="school-outline"
              size={14}
              color="#D1D5DB"
              style={{ marginHorizontal: 10 }}
            />
            <View className="flex-1 h-px bg-gray-200" />
          </View>

          <Text
            className="text-sm font-medium text-center"
            style={{ color: BRAND_PRIMARY }}
          >
            Masomo ERP — l'école connectée pour tous.
          </Text>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
}
