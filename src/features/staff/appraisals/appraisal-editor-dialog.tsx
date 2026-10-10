import { useThemeColors } from "@/hooks/use-theme-colors";
import type {
  AppraisalMention,
  AppraisalMentionValue,
} from "@/utils/types/StudentPeriodAppraisal";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

export type AppraisalDraft = {
  application: AppraisalMentionValue | null;
  conduct: AppraisalMentionValue | null;
  comments: string | null;
};

type AppraisalEditorDialogProps = {
  studentLabel: string;
  mentions: AppraisalMention[];
  value: AppraisalDraft;
  onApply: (value: AppraisalDraft) => void;
  onClose: () => void;
};

function MentionChoices({
  label,
  mentions,
  value,
  onChange,
}: {
  label: string;
  mentions: AppraisalMention[];
  value: AppraisalMentionValue | null;
  onChange: (value: AppraisalMentionValue | null) => void;
}) {
  return (
    <View className="mt-4">
      <Text className="text-xs font-semibold text-muted-foreground uppercase mb-2">
        {label}
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {mentions.map((mention) => {
          const selected = mention.value === value;
          return (
            <Pressable
              key={mention.value}
              // Toucher la mention choisie la retire.
              onPress={() => onChange(selected ? null : mention.value)}
              className={`px-3 h-9 rounded-full border items-center justify-center ${
                selected ? "bg-foreground border-foreground" : "border-input"
              }`}
            >
              <Text
                className={`text-sm ${selected ? "text-background font-medium" : "text-foreground"}`}
              >
                {mention.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// Édition d'une ligne en mémoire : rien n'est envoyé ici, l'écran enregistre toutes les lignes modifiées d'un coup.
export function AppraisalEditorDialog({
  studentLabel,
  mentions,
  value,
  onApply,
  onClose,
}: AppraisalEditorDialogProps) {
  const colors = useThemeColors();
  const [draft, setDraft] = useState<AppraisalDraft>(value);

  const apply = () => {
    const comments = draft.comments?.trim() ? draft.comments.trim() : null;
    onApply({ ...draft, comments });
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 justify-end bg-black/40"
      >
        <View className="bg-background rounded-t-2xl max-h-[85%]">
          <View className="flex-row items-center justify-between px-4 pt-4 pb-3 border-b border-divider">
            <Text className="flex-1 text-base font-semibold text-foreground" numberOfLines={1}>
              {studentLabel}
            </Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={22} color={colors.foregroundSecondary} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}>
            <MentionChoices
              label="Application"
              mentions={mentions}
              value={draft.application}
              onChange={(application) => setDraft((d) => ({ ...d, application }))}
            />
            <MentionChoices
              label="Conduite"
              mentions={mentions}
              value={draft.conduct}
              onChange={(conduct) => setDraft((d) => ({ ...d, conduct }))}
            />

            <Text className="text-xs font-semibold text-muted-foreground uppercase mb-2 mt-4">
              Commentaire
            </Text>
            <TextInput
              value={draft.comments ?? ""}
              onChangeText={(comments) => setDraft((d) => ({ ...d, comments }))}
              multiline
              maxLength={1000}
              textAlignVertical="top"
              placeholder="Commentaire (optionnel)"
              placeholderTextColor={colors.faint}
              className="min-h-[80px] border border-input rounded-lg px-3 py-2 bg-card text-foreground"
            />
          </ScrollView>

          <View className="flex-row gap-2 p-4 border-t border-divider">
            <Pressable
              onPress={() => setDraft({ application: null, conduct: null, comments: null })}
              className="flex-1 h-12 rounded-lg border border-input items-center justify-center"
            >
              <Text className="text-sm font-medium text-foreground-secondary">Tout effacer</Text>
            </Pressable>
            <Pressable
              onPress={apply}
              className="flex-1 h-12 rounded-lg bg-foreground items-center justify-center"
            >
              <Text className="text-background font-medium">Valider</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
