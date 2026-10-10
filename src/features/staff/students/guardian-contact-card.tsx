import { useGuardianContacts } from "@/hooks/queries/items/guardian";
import { useCan } from "@/hooks/use-can";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { toastNotify } from "@/lib/toast";
import { CONTACT_LABELS, type Contact } from "@/utils/types/Contact";
import type { Guardian } from "@/utils/types/Guardian";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ActivityIndicator, Linking, Pressable, Text, View } from "react-native";

type ContactAction = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  url: string;
};

// wa.me attend le numéro international sans « + » ni séparateurs.
function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

// Téléphone et WhatsApp d'abord (contact privilégié des familles), l'e-mail ensuite.
function actionsFor(contact: Contact): ContactAction[] {
  const value = contact.value?.trim();
  if (!value) return [];

  switch (contact.contactType) {
    case "phone":
      return [
        { key: "call", label: "Appeler", icon: "call-outline", url: `tel:${value}` },
        { key: "wa", label: "WhatsApp", icon: "logo-whatsapp", url: `https://wa.me/${digitsOnly(value)}` },
      ];
    case "whatsapp":
      return [
        { key: "wa", label: "WhatsApp", icon: "logo-whatsapp", url: `https://wa.me/${digitsOnly(value)}` },
        { key: "call", label: "Appeler", icon: "call-outline", url: `tel:${value}` },
      ];
    case "email":
      return [{ key: "mail", label: "E-mail", icon: "mail-outline", url: `mailto:${value}` }];
    default:
      return [];
  }
}

async function open(url: string) {
  try {
    await Linking.openURL(url);
  } catch {
    toastNotify("Impossible d'ouvrir ce contact sur cet appareil.", "error");
  }
}

type GuardianContactCardProps = {
  guardian: Guardian;
  relationship?: string | null;
  isPrimary?: boolean;
};

export function GuardianContactCard({ guardian, relationship, isPrimary }: GuardianContactCardProps) {
  const colors = useThemeColors();
  const canViewContacts = useCan("core.master::guardians.view");
  const { contacts, contactsIsLoading } = useGuardianContacts({
    guardianId: guardian.id,
    enabled: canViewContacts,
  });

  const activeContacts = (contacts ?? []).filter((contact) => contact.isActive !== false);
  const subtitle = [relationship, isPrimary ? "Tuteur principal" : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <View className="rounded-xl border border-border bg-card p-4 mb-3">
      <Text className="text-base font-semibold text-foreground">
        {guardian.fullDesignation ?? guardian.fullName ?? "Tuteur"}
      </Text>
      {subtitle ? (
        <Text className="text-xs text-muted-foreground mt-0.5">{subtitle}</Text>
      ) : null}

      {!canViewContacts ? null : contactsIsLoading ? (
        <ActivityIndicator className="mt-3" />
      ) : activeContacts.length === 0 ? (
        <Text className="text-sm text-faint mt-3">Aucun contact enregistré.</Text>
      ) : (
        activeContacts.map((contact) => {
          const actions = actionsFor(contact);
          return (
            <View key={contact.id} className="mt-3 pt-3 border-t border-divider">
              <Text className="text-xs text-muted-foreground">
                {contact.label ||
                  (contact.contactType ? CONTACT_LABELS[contact.contactType] : "Contact")}
                {contact.isPrimary ? " · principal" : ""}
              </Text>
              <Text className="text-sm text-foreground mt-0.5" selectable>
                {contact.value}
              </Text>
              {actions.length > 0 && (
                <View className="flex-row flex-wrap gap-2 mt-2">
                  {actions.map((action) => (
                    <Pressable
                      key={action.key}
                      accessibilityRole="button"
                      accessibilityLabel={`${action.label} ${contact.value ?? ""}`}
                      onPress={() => void open(action.url)}
                      className="h-9 px-3 rounded-lg border border-input flex-row items-center gap-1.5 active:bg-muted"
                    >
                      <Ionicons name={action.icon} size={16} color={colors.foreground} />
                      <Text className="text-sm font-medium text-foreground">{action.label}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          );
        })
      )}
    </View>
  );
}
