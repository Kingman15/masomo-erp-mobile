import { schoolCodeSchema, type SchoolCodeForm } from "@/features/auth/schemas";
import { useAuthStore } from "@/stores/auth";
import { BRAND_PRIMARY } from "@/constants/theme";
import { zodResolver } from "@hookform/resolvers/zod";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { router } from "expo-router";
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

export default function SchoolCodeScreen() {
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
          Rejoindre votre école
        </Text>

        <Text className="text-sm text-gray-500 text-center mt-3 max-w-[280px]">
          Veuillez saisir le code système de votre établissement scolaire pour
          continuer.
        </Text>
      </View>

      <View className="flex-1 justify-between px-6 pt-4 pb-8">
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Ecole, code système
          </Text>
          <Controller
            control={control}
            name="code"
            render={({ field: { onChange, onBlur, value } }) => (
              <View
                className="flex-row items-center h-14 rounded-2xl px-4 bg-gray-50 border"
                style={{ borderColor: codeFocused ? BRAND_PRIMARY : "#E5E7EB" }}
              >
                <Ionicons
                  name="school-outline"
                  size={20}
                  color={codeFocused ? BRAND_PRIMARY : "#9CA3AF"}
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
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="characters"
                  autoCorrect={false}
                  className="flex-1 text-base text-black ml-3 tracking-wide"
                />
              </View>
            )}
          />
          {errors.code && (
            <Text className="text-red-600 text-xs mt-2">
              {errors.code.message}
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
                  Continuer
                </Text>
                <Ionicons name="arrow-forward" size={18} color="white" />
              </>
            )}
          </Pressable>

          <Text className="text-xs text-gray-400 text-center mt-4">
            Vous ne connaissez pas le code de votre établissement ? Contactez
            l'administration.
          </Text>

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
