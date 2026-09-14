import { ChipSelect } from "@/components/list/chip-select";
import { usePortalTransportInvoices } from "@/hooks/queries/items/portal-transport-invoice";
import type {
  PortalTransportInvoiceDTO,
  PortalTransportInvoiceStatus,
} from "@/utils/types/objects/PortalTransportInvoiceDTO";
import { Stack, router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { usePortalSelection } from "../../use-portal-selection";
import { InvoicePaymentsList } from "./invoice-payments-list";
import { TRANSPORT_INVOICE_PORTAL_STATUS_OPTIONS } from "./transport-invoice-status";
import { TransportInvoiceRow } from "./transport-invoice-row";

type Section = "invoices" | "payments";

const SECTION_OPTIONS: { id: Section; label: string }[] = [
  { id: "invoices", label: "Factures" },
  { id: "payments", label: "Paiements" },
];

function SectionTabs({
  value,
  onChange,
}: {
  value: Section;
  onChange: (section: Section) => void;
}) {
  return (
    <View className="flex-row bg-gray-100 rounded-lg p-1 mb-3">
      {SECTION_OPTIONS.map((option) => {
        const active = value === option.id;
        return (
          <Pressable
            key={option.id}
            onPress={() => onChange(option.id)}
            className={`flex-1 h-9 rounded-md items-center justify-center ${
              active ? "bg-white shadow-sm" : ""
            }`}
          >
            <Text
              className={`text-sm font-medium ${active ? "text-black" : "text-gray-500"}`}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function InvoicesPaymentsScreen() {
  const { selectedStudent, selectedSchoolYear, selectedSchoolClass } =
    usePortalSelection();

  const filtersAreComplete = Boolean(
    selectedStudent?.id && selectedSchoolYear?.id && selectedSchoolClass?.id,
  );

  const [section, setSection] = useState<Section>("invoices");
  const [status, setStatus] = useState<PortalTransportInvoiceStatus | null>(null);

  const {
    portalTransportInvoices,
    portalTransportInvoicesError,
    portalTransportInvoicesIsLoading,
    portalTransportInvoicesIsFetching,
    loadPortalTransportInvoices,
  } = usePortalTransportInvoices({
    studentId: selectedStudent?.id,
    filters: {
      schoolYearId: selectedSchoolYear?.id,
      status,
    },
    enabled: filtersAreComplete,
  });

  const handlePressInvoice = (invoice: PortalTransportInvoiceDTO) => {
    router.push(`/portal/menu/transport/invoices-payments/${invoice.id}`);
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Factures & paiements",
        }}
      />

      <View className="flex-1 bg-gray-50">
        {!filtersAreComplete ? (
          <View className="flex-1 items-center justify-center px-6 gap-1">
            <Text className="text-sm font-medium text-gray-700 text-center">
              Aucun élève sélectionné
            </Text>
            <Text className="text-sm text-gray-400 text-center">
              Sélectionnez un élève pour afficher ses factures de transport.
            </Text>
          </View>
        ) : portalTransportInvoicesIsLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : portalTransportInvoicesError ? (
          <View className="flex-1 items-center justify-center px-6 gap-3">
            <Text className="text-sm text-gray-500 text-center">
              Impossible de charger les factures de transport.
            </Text>
            <Pressable
              onPress={() => loadPortalTransportInvoices()}
              className="h-10 px-4 rounded-lg bg-black items-center justify-center"
            >
              <Text className="text-white font-medium">Réessayer</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 24 }}
            refreshControl={
              <RefreshControl
                refreshing={portalTransportInvoicesIsFetching}
                onRefresh={() => void loadPortalTransportInvoices()}
              />
            }
          >
            <View className="px-4 pt-3">
              <SectionTabs value={section} onChange={setSection} />

              {section === "invoices" && (
                <ChipSelect
                  label="Statut"
                  options={TRANSPORT_INVOICE_PORTAL_STATUS_OPTIONS.map((option) => ({
                    id: option.value,
                    label: option.label,
                  }))}
                  value={status}
                  onChange={(id) => setStatus(id as PortalTransportInvoiceStatus | null)}
                />
              )}
            </View>

            {section === "invoices" ? (
              portalTransportInvoices.length === 0 ? (
                <View className="items-center justify-center px-6 py-16">
                  <Text className="text-sm text-gray-400 text-center">
                    Aucune facture de transport n&apos;a été enregistrée pour cet
                    élève.
                  </Text>
                </View>
              ) : (
                portalTransportInvoices.map((invoice) => (
                  <TransportInvoiceRow
                    key={invoice.id}
                    invoice={invoice}
                    onPress={handlePressInvoice}
                  />
                ))
              )
            ) : (
              <InvoicePaymentsList invoices={portalTransportInvoices} />
            )}
          </ScrollView>
        )}
      </View>
    </>
  );
}
