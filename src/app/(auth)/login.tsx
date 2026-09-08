// app/(auth)/login.tsx
import {
  credentialsSchema,
  type CredentialsForm,
} from "@/features/auth/schemas";
import { useAuthStore } from "@/stores/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

export default function LoginScreen() {
  const school = useAuthStore((s) => s.school);
  const changeSchool = useAuthStore((s) => s.changeSchool);
  const signIn = useAuthStore((s) => s.signIn);
  const [serverError, setServerError] = useState<string | null>(null);

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
    <View className="flex-1 justify-center px-6 bg-white">
      <Text className="text-sm text-gray-500 mb-1">{school?.name}</Text>
      <Text className="text-2xl font-medium mb-6">Connexion</Text>

      <Controller
        control={control}
        name="username"
        render={({ field: { onChange, onBlur, value } }) => (
          <View className="mb-3">
            <Text className="text-sm font-medium mb-1">
              Nom d'utilisateur / adresse e-mail
            </Text>
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              autoCapitalize="none"
              keyboardType="email-address"
              className="h-11 border border-gray-300 rounded-lg px-3"
            />
            {errors.username && (
              <Text className="text-red-600 text-xs mt-1">
                {errors.username.message}
              </Text>
            )}
          </View>
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <View className="mb-1">
            <Text className="text-sm font-medium mb-1">Mot de passe</Text>
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry
              className="h-11 border border-gray-300 rounded-lg px-3"
            />
            {errors.password && (
              <Text className="text-red-600 text-xs mt-1">
                {errors.password.message}
              </Text>
            )}
          </View>
        )}
      />

      {serverError && (
        <Text className="text-red-600 text-xs mt-2">{serverError}</Text>
      )}

      <Pressable
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
        className="h-11 bg-black rounded-lg items-center justify-center mt-4"
      >
        {isSubmitting ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-medium">Se connecter</Text>
        )}
      </Pressable>

      <Pressable onPress={changeSchool} className="mt-4 items-center">
        <Text className="text-sm text-gray-500">Changer d'école</Text>
      </Pressable>
    </View>
  );
}
