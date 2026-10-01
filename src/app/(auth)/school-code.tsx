import {
  AuthButton,
  AuthField,
  AuthFooter,
  AuthHeader,
  AuthLink,
  SchoolLogo,
} from "@/features/auth/components";
import { schoolCodeSchema, type SchoolCodeForm } from "@/features/auth/schemas";
import { useConfirm } from "@/hooks/use-confirm";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { useAuthStore } from "@/stores/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

/**
 * Choix de l'école : parmi celles où une connexion a déjà réussi sur cet appareil, ou par un nouveau code.
 * Ouvert d'office sans école connue, ou depuis « Changer » (connexion, activation parent) : on y revient alors.
 */
export default function SchoolCodeScreen() {
  const colors = useThemeColors();
  const school = useAuthStore((s) => s.school);
  const knownSchools = useAuthStore((s) => s.knownSchools);
  const submitSchoolCode = useAuthStore((s) => s.submitSchoolCode);
  const selectSchool = useAuthStore((s) => s.selectSchool);
  const forgetSchool = useAuthStore((s) => s.forgetSchool);
  const { confirm, ConfirmDialog } = useConfirm();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SchoolCodeForm>({
    resolver: zodResolver(schoolCodeSchema),
    defaultValues: { code: "" },
  });

  // Retour à l'écran appelant s'il y en a un, sinon la connexion
  const done = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/(auth)/login");
  };

  const onSubmit = async (data: SchoolCodeForm) => {
    setServerError(null);
    try {
      await submitSchoolCode(data.code.trim().toUpperCase());
      done();
    } catch {
      // Le store fournit le motif (code introuvable, trop de tentatives…)
      setServerError(useAuthStore.getState().error);
    }
  };

  const hasSchools = knownSchools.length > 0;

  return (
    <KeyboardAwareScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
      // Distance gardée sous le champ actif : assez pour laisser voir le bouton « Continuer » au-dessus du clavier.
      bottomOffset={120}
    >
      <AuthHeader
        title={hasSchools ? "Choisir une école" : "Rejoindre votre école"}
        subtitle={
          hasSchools
            ? "Sélectionnez votre école ou ajoutez-en une."
            : "Saisissez le code système remis par votre établissement."
        }
      />

      <View className="flex-1 justify-between px-6 pt-2 pb-8">
        <View>
          {hasSchools && (
            <View className="gap-2 mb-6">
              {knownSchools.map((known) => {
                const selected = school?.code.toUpperCase() === known.code.toUpperCase();

                return (
                  <Pressable
                    key={known.code}
                    onPress={() => {
                      selectSchool(known.code);
                      done();
                    }}
                    className="flex-row items-center gap-3 rounded-2xl border bg-subtle dark:bg-card p-3 active:opacity-70"
                    style={{ borderColor: selected ? colors.foreground : colors.border }}
                  >
                    <SchoolLogo logoUrl={known.logoUrl} />
                    <View className="flex-1">
                      <Text numberOfLines={1} className="text-base font-semibold text-foreground">
                        {known.name}
                      </Text>
                      <Text className="text-xs text-muted-foreground mt-0.5">Code {known.code}</Text>
                    </View>
                    <Pressable
                      hitSlop={10}
                      accessibilityLabel={`Retirer ${known.name} de cet appareil`}
                      onPress={async () => {
                        const ok = await confirm({
                          title: "Retirer cette école ?",
                          description: `${known.name} ne sera plus proposée sur cet appareil. Vous pourrez la rajouter avec son code.`,
                          confirmText: "Retirer",
                          variant: "destructive",
                        });
                        if (ok) await forgetSchool(known.code);
                      }}
                      className="p-1 active:opacity-60"
                    >
                      <Ionicons name="close" size={18} color={colors.faint} />
                    </Pressable>
                  </Pressable>
                );
              })}
            </View>
          )}

          <Controller
            control={control}
            name="code"
            render={({ field: { onChange, onBlur, value } }) => (
              <AuthField
                label={hasSchools ? "Ajouter une école" : "École, code système"}
                icon="school-outline"
                value={value}
                onChangeText={(text) => {
                  onChange(text);
                  setServerError(null);
                }}
                onBlur={onBlur}
                placeholder="Ex.: ET123"
                autoCapitalize="characters"
                error={errors.code?.message ?? serverError ?? undefined}
              />
            )}
          />

          <AuthButton label="Continuer" onPress={handleSubmit(onSubmit)} loading={isSubmitting} />

          <Text className="text-xs text-faint text-center mt-4">
            Vous ne connaissez pas le code de votre établissement ? Contactez
            {" l'administration."}
          </Text>

          <AuthLink
            prefix="Parent d'élève ?"
            label="Activer mon compte avec un code"
            onPress={() => router.push("/(auth)/parent-activation")}
          />

          {school && router.canGoBack() && (
            <Pressable onPress={() => router.back()} hitSlop={8} className="mt-4 self-center active:opacity-60">
              <Text className="text-sm font-medium text-muted-foreground">Annuler</Text>
            </Pressable>
          )}
        </View>

        <AuthFooter />
      </View>

      <ConfirmDialog />
    </KeyboardAwareScrollView>
  );
}
