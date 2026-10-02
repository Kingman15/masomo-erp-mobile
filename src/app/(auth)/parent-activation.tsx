import {
  activateGuardianAccount,
  checkActivationCode,
  type ActivationStatus,
} from "@/api/endpoints/guardian-access";
import {
  AuthButton,
  AuthField,
  AuthFooter,
  AuthHeader,
  SchoolCard,
} from "@/features/auth/components";
import {
  formatParentCode,
  parentActivationSchema,
  parentCodeCheckSchema,
  type ParentActivationForm,
  type ParentCodeCheckForm,
} from "@/features/auth/schemas";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { handleApiError } from "@/lib/handle-api-error";
import { useAuthStore } from "@/stores/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import Ionicons from "@expo/vector-icons/Ionicons";
import { isAxiosError } from "axios";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

interface CheckedCode {
  schoolCode: string;
  activationCode: string;
  accountHolderName: string;
  suggestedUsername: string;
}

/**
 * Erreur d'API : 403 = école non active, le serveur donne le motif à afficher (le toast générique parlerait de droits) ;
 * le reste suit la gestion commune (erreurs de champ, 429, réseau…).
 */
function applyApiError(
  err: unknown,
  setFieldError: (field: string, message: string) => void,
  setServerError: (message: string) => void,
) {
  if (isAxiosError<{ message?: string }>(err) && err.response?.status === 403) {
    setServerError(err.response.data?.message ?? "Votre école n'est pas accessible pour le moment.");
    return;
  }

  handleApiError(err, { setFieldError });
}

export default function ParentActivationScreen() {
  const [checked, setChecked] = useState<CheckedCode | null>(null);
  const [result, setResult] = useState<ActivationStatus | null>(null);

  return (
    <KeyboardAwareScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
      bottomOffset={160}
    >
      {result && checked ? (
        <ActivationDone result={result} schoolCode={checked.schoolCode} />
      ) : checked ? (
        <AccountStep checked={checked} onBack={() => setChecked(null)} onDone={setResult} />
      ) : (
        <CodeStep onChecked={setChecked} />
      )}
    </KeyboardAwareScrollView>
  );
}

// Étape 1 : école + code d'activation ===

function CodeStep({ onChecked }: { onChecked: (checked: CheckedCode) => void }) {
  // École déjà sélectionnée (connexion, sélecteur) : affichée comme au login ; sinon champ libre
  const school = useAuthStore((s) => s.school);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ParentCodeCheckForm>({
    resolver: zodResolver(parentCodeCheckSchema),
    defaultValues: { schoolCode: school?.code ?? "", activationCode: "" },
  });

  // Retour du sélecteur d'école (« Changer ») : le formulaire suit l'école choisie
  useEffect(() => {
    if (school) setValue("schoolCode", school.code, { shouldValidate: false });
  }, [school, setValue]);

  const onSubmit = async (values: ParentCodeCheckForm) => {
    setServerError(null);
    const schoolCode = values.schoolCode.trim().toUpperCase();

    try {
      const res = await checkActivationCode(schoolCode, values.activationCode);
      onChecked({ schoolCode, activationCode: values.activationCode, ...res });
    } catch (err) {
      applyApiError(
        err,
        (field, message) => setError(field as keyof ParentCodeCheckForm, { message }),
        setServerError,
      );
    }
  };

  return (
    <>
      <AuthHeader
        title="Activer mon compte parent"
        subtitle="Saisissez le code remis par l'école de votre enfant."
      />

      <View className="flex-1 justify-between px-6 pt-2 pb-8">
        <View>
          {school ? (
            <>
              <SchoolCard
                code={school.code}
                name={school.name}
                logoUrl={school.logoUrl}
                onChange={() => router.push("/(auth)/school-code")}
              />
              {errors.schoolCode && (
                <Text className="text-red-600 dark:text-red-400 text-xs -mt-3 mb-4">
                  {errors.schoolCode.message}
                </Text>
              )}
            </>
          ) : (
            <Controller
              control={control}
              name="schoolCode"
              render={({ field: { onChange, onBlur, value } }) => (
                <AuthField
                  label="Code école"
                  icon="school-outline"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Ex.: ET123"
                  autoCapitalize="characters"
                  error={errors.schoolCode?.message}
                />
              )}
            />
          )}

          <Controller
            control={control}
            name="activationCode"
            render={({ field: { onChange, onBlur, value } }) => (
              <AuthField
                label="Code d'activation"
                icon="key-outline"
                value={value}
                onChangeText={(text) => onChange(formatParentCode(text))}
                onBlur={onBlur}
                placeholder="0000-0000"
                keyboardType="number-pad"
                maxLength={9}
                textContentType="oneTimeCode"
                hint="Les 8 chiffres inscrits sur votre fiche d'accès ou votre reçu d'inscription."
                error={errors.activationCode?.message}
              />
            )}
          />

          {serverError && (
            <Text className="text-red-600 dark:text-red-400 text-sm">{serverError}</Text>
          )}

          <AuthButton label="Continuer" onPress={handleSubmit(onSubmit)} loading={isSubmitting} />

          <Pressable onPress={() => router.back()} hitSlop={8} className="mt-5 self-center active:opacity-60">
            <Text className="text-sm text-muted-foreground">
              {"Déjà un compte ? "}
              <Text className="font-medium text-primary dark:text-violet-400">Se connecter</Text>
            </Text>
          </Pressable>
        </View>

        <AuthFooter />
      </View>
    </>
  );
}

// Étape 2 : téléphone, mot de passe, identifiant de secours ===

function AccountStep({
  checked,
  onBack,
  onDone,
}: {
  checked: CheckedCode;
  onBack: () => void;
  onDone: (result: ActivationStatus) => void;
}) {
  const colors = useThemeColors();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showUsername, setShowUsername] = useState(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ParentActivationForm>({
    resolver: zodResolver(parentActivationSchema),
    defaultValues: {
      phone: "",
      username: checked.suggestedUsername,
      password: "",
      passwordConfirmation: "",
    },
  });

  const onSubmit = async (values: ParentActivationForm) => {
    setServerError(null);
    try {
      const status = await activateGuardianAccount({
        ...values,
        schoolCode: checked.schoolCode,
        activationCode: checked.activationCode,
      });
      onDone(status);
    } catch (err) {
      applyApiError(
        err,
        (field, message) => {
          // Code devenu inutilisable entre les deux étapes : message général
          if (field === "schoolCode" || field === "activationCode") {
            setServerError(message);
            return;
          }
          if (field === "username") setShowUsername(true);
          setError(field as keyof ParentActivationForm, { message });
        },
        setServerError,
      );
    }
  };

  return (
    <>
      <AuthHeader
        title={`Bonjour ${checked.accountHolderName}`}
        subtitle="Choisissez comment vous vous connecterez."
      />

      <View className="flex-1 justify-between px-6 pt-2 pb-8">
        <View>
          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <AuthField
                label="Numéro de téléphone"
                icon="call-outline"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Ex.: 0812 345 678"
                keyboardType="phone-pad"
                textContentType="telephoneNumber"
                autoComplete="tel"
                hint="Vous vous connecterez avec ce numéro."
                error={errors.phone?.message}
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
                placeholder="6 caractères, une majuscule, un chiffre"
                autoCapitalize="none"
                textContentType="newPassword"
                secret
                error={errors.password?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="passwordConfirmation"
            render={({ field: { onChange, onBlur, value } }) => (
              <AuthField
                label="Confirmation du mot de passe"
                icon="lock-closed-outline"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Retapez votre mot de passe"
                autoCapitalize="none"
                textContentType="newPassword"
                secret
                error={errors.passwordConfirmation?.message}
              />
            )}
          />

          {/* Identifiant de secours, proposé d'après le nom : replié par défaut */}
          <View className="rounded-2xl border border-border mb-2">
            <Pressable
              onPress={() => setShowUsername((v) => !v)}
              className="flex-row items-center gap-3 p-4 active:opacity-70"
            >
              <View className="flex-1">
                <Text className="text-sm font-medium text-foreground">{"Nom d'utilisateur (facultatif)"}</Text>
                <Text className="text-xs text-muted-foreground mt-0.5">
                  Autre façon de vous connecter, si vous changez de numéro.
                </Text>
              </View>
              <Ionicons
                name={showUsername || errors.username ? "chevron-up" : "chevron-down"}
                size={18}
                color={colors.mutedForeground}
              />
            </Pressable>

            {(showUsername || errors.username) && (
              <View className="border-t border-border px-4 pt-4">
                <Controller
                  control={control}
                  name="username"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <AuthField
                      label="Nom d'utilisateur"
                      icon="person-outline"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      autoCapitalize="none"
                      error={errors.username?.message}
                    />
                  )}
                />
              </View>
            )}
          </View>

          {serverError && (
            <Text className="text-red-600 dark:text-red-400 text-sm mt-2">{serverError}</Text>
          )}

          <AuthButton
            label="Activer mon compte"
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
            icon={null}
          />

          <Pressable
            onPress={onBack}
            hitSlop={8}
            className="mt-5 flex-row items-center justify-center gap-1.5 self-center active:opacity-60"
          >
            <Ionicons name="arrow-back" size={14} color={colors.mutedForeground} />
            <Text className="text-sm text-muted-foreground">Modifier le code</Text>
          </Pressable>
        </View>

        <AuthFooter />
      </View>
    </>
  );
}

// Résultat ===

function ActivationDone({ result, schoolCode }: { result: ActivationStatus; schoolCode: string }) {
  const colors = useThemeColors();
  const selectSchool = useAuthStore((s) => s.selectSchool);
  const pending = result === "pending";

  return (
    <View className="flex-1 justify-between px-6 pt-24 pb-8">
      <View className="items-center">
        <View
          className={`w-16 h-16 rounded-full items-center justify-center ${
            pending ? "bg-amber-100 dark:bg-amber-900/30" : "bg-green-100 dark:bg-green-900/30"
          }`}
        >
          <Ionicons
            name={pending ? "time-outline" : "checkmark-circle-outline"}
            size={32}
            color={pending ? colors.warning : colors.success}
          />
        </View>

        <Text className="text-2xl font-semibold text-foreground text-center mt-6">
          {pending ? "Demande envoyée" : "Compte activé"}
        </Text>

        <Text className="text-base leading-6 text-muted-foreground text-center mt-3 max-w-[320px]">
          {pending
            ? "L'école doit valider votre compte avant votre première connexion. Vous pourrez alors vous connecter avec votre numéro de téléphone et votre mot de passe."
            : "Vous pouvez vous connecter dès maintenant avec votre numéro de téléphone et votre mot de passe."}
        </Text>

        <View className="w-full mt-6">
          <AuthButton
            label="Aller à la connexion"
            onPress={() => {
              // Code validé par l'activation : sélectionné sans nouvelle vérification ; nom et logo viendront du login
              selectSchool(schoolCode);
              router.replace("/(auth)/login");
            }}
          />
        </View>
      </View>

      <AuthFooter />
    </View>
  );
}
