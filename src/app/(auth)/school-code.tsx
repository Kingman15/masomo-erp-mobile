import { schoolCodeSchema, type SchoolCodeForm } from "@/features/auth/schemas";
import { useAuthStore } from "@/stores/auth";
import { zodResolver } from "@hookform/resolvers/zod";
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
export default function SchoolCodeScreen() {
  const submitSchoolCode = useAuthStore((s) => s.submitSchoolCode);
  const [serverError, setServerError] = useState<string | null>(null);

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
      setServerError("Code école introuvable. Vérifie avec ton établissement.");
    }
  };

  return (
    <View className="flex-1 justify-center px-6 bg-white">
      <Text className="text-2xl font-medium mb-2">Rejoindre ton école</Text>
      <Text className="text-sm text-gray-500 mb-6">
        Saisis le code fourni par ton établissement.
      </Text>

      <Controller
        control={control}
        name="code"
        render={({ field: { onChange, onBlur, value } }) => (
          <View className="mb-1">
            <Text className="text-sm font-medium mb-1">Code école</Text>
            <View className="h-11 border border-gray-300 rounded-lg px-3 justify-center">
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                className="text-base"
                autoCapitalize="characters"
                autoCorrect={false}
              />
            </View>
          </View>
        )}
      />
      {errors.code && (
        <Text className="text-red-600 text-xs mb-2">{errors.code.message}</Text>
      )}
      {serverError && (
        <Text className="text-red-600 text-xs mb-2">{serverError}</Text>
      )}

      <Pressable
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
        className="h-11 bg-black rounded-lg items-center justify-center mt-4"
      >
        {isSubmitting ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-medium">Continuer</Text>
        )}
      </Pressable>
    </View>
  );
}
