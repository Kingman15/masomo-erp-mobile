import { GuardianPicker } from "@/components/list/guardian-picker";
import { StudentPicker } from "@/components/list/student-picker";
import type { ConversationPartyKind } from "@/utils/types/Conversation";
import type { ServiceDesk } from "@/utils/types/ServiceDesk";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

export type SelectedParty = {
  kind: ConversationPartyKind;
  partyId: string;
  partyUserId: string | null;
  partyLabel: string;
};

type PartyPickerProps = {
  serviceDesk: ServiceDesk;
  schoolYearId: string | null | undefined;
  value: SelectedParty | null;
  onChange: (party: SelectedParty | null) => void;
};

export function PartyPicker({
  serviceDesk,
  schoolYearId,
  value,
  onChange,
}: PartyPickerProps) {
  const canToggleKind = serviceDesk.acceptsGuardians && serviceDesk.acceptsStudents;
  const [kind, setKind] = useState<ConversationPartyKind>(
    () => value?.kind ?? (serviceDesk.acceptsGuardians ? "guardian" : "student"),
  );

  const handleKindChange = (nextKind: ConversationPartyKind) => {
    if (nextKind === kind) return;
    setKind(nextKind);
    onChange(null);
  };

  return (
    <View className="mb-1">
      {canToggleKind && (
        <View className="flex-row bg-gray-100 rounded-lg p-1 mb-4">
          {(
            [
              { id: "guardian", label: "Parent" },
              { id: "student", label: "Élève" },
            ] as const
          ).map((option) => {
            const selected = kind === option.id;
            return (
              <Pressable
                key={option.id}
                onPress={() => handleKindChange(option.id)}
                className={`flex-1 h-9 rounded-md items-center justify-center ${
                  selected ? "bg-white" : ""
                }`}
              >
                <Text
                  className={`text-sm ${
                    selected ? "font-semibold text-black" : "text-gray-500"
                  }`}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {kind === "guardian" ? (
        <GuardianPicker
          label="Destinataire"
          value={value ? { id: value.partyId, fullDesignation: value.partyLabel } : null}
          onChange={(guardian) =>
            onChange(
              guardian
                ? {
                    kind: "guardian",
                    partyId: guardian.id,
                    partyUserId: guardian.userId,
                    partyLabel: guardian.fullDesignation ?? "",
                  }
                : null,
            )
          }
          schoolYearId={schoolYearId}
        />
      ) : (
        <StudentPicker
          label="Destinataire"
          value={value ? { id: value.partyId, fullDesignation: value.partyLabel } : null}
          onChange={(student) =>
            onChange(
              student
                ? {
                    kind: "student",
                    partyId: student.id,
                    partyUserId: student.userId,
                    partyLabel: student.fullDesignation ?? "",
                  }
                : null,
            )
          }
          schoolYearId={schoolYearId}
        />
      )}

      {value && !value.partyUserId && (
        <Text className="text-xs text-red-500 -mt-3 mb-3">
          {value.kind === "guardian"
            ? "Ce parent n&apos;a pas encore de compte utilisateur : il ne peut pas recevoir de message."
            : "Cet élève n&apos;a pas encore de compte utilisateur : il ne peut pas recevoir de message."}
        </Text>
      )}
    </View>
  );
}
