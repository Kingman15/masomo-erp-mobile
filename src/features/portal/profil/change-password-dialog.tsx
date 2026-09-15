import { Toast } from "@/components/toast";
import { useChangePassword } from "@/hooks/queries/items/account";
import { handleApiError } from "@/lib/handle-api-error";
import { toastNotify } from "@/lib/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from "./change-password-schema";

type ChangePasswordDialogProps = {
  visible: boolean;
  onClose: () => void;
};

const EMPTY_VALUES: ChangePasswordFormValues = {
  currentPassword: "",
  newPassword: "",
  newPasswordConfirmation: "",
};

function PasswordField({
  label,
  value,
  onChangeText,
  onBlur,
  autoComplete,
  error,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur: () => void;
  autoComplete: "current-password" | "new-password";
  error?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <View className="mb-3">
      <Text className="text-sm font-medium text-gray-700 mb-2">{label}</Text>
      <View className="relative justify-center">
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          secureTextEntry={!visible}
          autoComplete={autoComplete}
          autoCapitalize="none"
          className="h-11 border border-gray-300 rounded-lg px-3 pr-10 bg-white"
        />
        <Pressable
          onPress={() => setVisible((v) => !v)}
          hitSlop={8}
          className="absolute right-3"
        >
          <Ionicons
            name={visible ? "eye-off-outline" : "eye-outline"}
            size={18}
            color="#6B7280"
          />
        </Pressable>
      </View>
      {error && <Text className="text-xs text-red-500 mt-1">{error}</Text>}
    </View>
  );
}

export function ChangePasswordDialog({ visible, onClose }: ChangePasswordDialogProps) {
  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (visible) reset(EMPTY_VALUES);
  }, [visible, reset]);

  const { changePassword, changePasswordIsPending } = useChangePassword();

  const onSubmit = async (data: ChangePasswordFormValues) => {
    try {
      await changePassword({
        current_password: data.currentPassword,
        new_password: data.newPassword,
        new_password_confirmation: data.newPasswordConfirmation,
      });
      toastNotify("Mot de passe modifié avec succès.", "success");
      onClose();
    } catch (error) {
      handleApiError(error, {
        setFieldError: (field, message) =>
          setError(field as keyof ChangePasswordFormValues, { message }),
      });
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-white">
        <View className="flex-row items-center justify-between px-4 pt-14 pb-3 border-b border-gray-100">
          <Text className="text-base font-semibold">Changer le mot de passe</Text>
          <Pressable onPress={onClose} hitSlop={8}>
            <Ionicons name="close" size={22} color="#374151" />
          </Pressable>
        </View>

        <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
          <Controller
            control={control}
            name="currentPassword"
            render={({ field: { value, onChange, onBlur } }) => (
              <PasswordField
                label="Mot de passe actuel"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                autoComplete="current-password"
                error={errors.currentPassword?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="newPassword"
            render={({ field: { value, onChange, onBlur } }) => (
              <PasswordField
                label="Nouveau mot de passe"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                autoComplete="new-password"
                error={errors.newPassword?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="newPasswordConfirmation"
            render={({ field: { value, onChange, onBlur } }) => (
              <PasswordField
                label="Confirmer le nouveau mot de passe"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                autoComplete="new-password"
                error={errors.newPasswordConfirmation?.message}
              />
            )}
          />

          <Pressable
            onPress={() => void handleSubmit(onSubmit)()}
            disabled={changePasswordIsPending}
            className={`h-12 rounded-lg items-center justify-center mt-4 ${
              changePasswordIsPending ? "bg-gray-300" : "bg-black"
            }`}
          >
            {changePasswordIsPending ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white font-medium">Valider</Text>
            )}
          </Pressable>
        </ScrollView>
      </View>
      <Toast />
    </Modal>
  );
}
