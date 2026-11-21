import {
  AuthButton,
  AuthField,
  AuthFooter,
  AuthHeader,
  AuthLink,
  SchoolCard,
} from "@/features/auth/components";
import { credentialsSchema, type CredentialsForm } from "@/features/auth/schemas";
import { useAuthStore } from "@/stores/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Redirect, router } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

export default function LoginScreen() {
  const school = useAuthStore((s) => s.school);
  const signIn = useAuthStore((s) => s.signIn);
  const [serverError, setServerError] = useState<string | null>(null);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CredentialsForm>({
    resolver: zodResolver(credentialsSchema),
    defaultValues: { username: "", password: "" },
  });

  // École retirée depuis le sélecteur : plus rien à quoi se connecter
  if (!school) return <Redirect href="/(auth)/school-code" />;

  const onSubmit = async (data: CredentialsForm) => {
    setServerError(null);
    try {
      // École lue au moment de l'envoi : elle a pu changer via « Changer » depuis l'ouverture de l'écran
      await signIn({ ...data, schoolCode: school.code });
      // La redirection vers (guardian)/(teacher) est gérée par le layout racine
    } catch {
      // Le store fournit le motif (identifiants, école suspendue, trop de tentatives…)
      setServerError(useAuthStore.getState().error);
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
      <AuthHeader title="Connexion" subtitle="Connectez-vous avec vos identifiants." />

      <View className="flex-1 justify-between px-6 pt-2 pb-8">
        <View>
          <SchoolCard
            code={school.code}
            name={school.name}
            logoUrl={school.logoUrl}
            onChange={() => router.push("/(auth)/school-code")}
          />

          <Controller
            control={control}
            name="username"
            render={({ field: { onChange, onBlur, value } }) => (
              <AuthField
                label="Téléphone, e-mail ou nom d'utilisateur"
                icon="person-outline"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Ex.: 0812 345 678 ou tshala_01"
                autoCapitalize="none"
                keyboardType="email-address"
                error={errors.username?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <AuthField
                label="Mot de passe"
                icon="lock-closed-outline"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="••••••••"
                autoCapitalize="none"
                secret
                error={errors.password?.message}
              />
            )}
          />

          {/* Pas encore de libre-service (aucun envoi e-mail/SMS) : réinitialisation par l'école */}
          <Pressable
            onPress={() => setForgotPasswordOpen((open) => !open)}
            accessibilityRole="button"
            accessibilityState={{ expanded: forgotPasswordOpen }}
            hitSlop={8}
            className="self-end mb-3"
          >
            <Text className="text-sm font-medium text-primary dark:text-violet-400">Mot de passe oublié ?</Text>
          </Pressable>

          {forgotPasswordOpen && (
            <Text className="text-sm text-muted-foreground mb-3">
              Contactez le secrétariat de votre école : il vous remettra un mot de passe temporaire, que vous changerez à la connexion.
            </Text>
          )}

          {serverError && (
            <Text className="text-red-600 dark:text-red-400 text-sm">{serverError}</Text>
          )}

          {/* Bouton collé aux champs : le défilement clavier (bottomOffset) le garde visible. */}
          <AuthButton label="Se connecter" onPress={handleSubmit(onSubmit)} loading={isSubmitting} />

          <AuthLink
            prefix="Parent d'élève ?"
            label="Activer mon compte avec un code"
            onPress={() => router.push("/(auth)/parent-activation")}
          />
        </View>

        <AuthFooter />
      </View>
    </KeyboardAwareScrollView>
  );
}
