import { FilterButton } from "@/components/list/filter-button";
import { SearchBar } from "@/components/list/search-bar";
import { DrawerMenuButton } from "@/features/teacher/drawer-menu-button";
import { useDocuments } from "@/hooks/queries/items/document";
import { useCurrentSchoolYear } from "@/hooks/queries/items/school-year";
import type { Document } from "@/utils/types/Document";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, Stack } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { DocumentFilterPanel } from "./document-filter-panel";
import {
  audienceIdFromFilters,
  emptyDocumentFilters,
  type DocumentFiltersForm,
} from "./document-filters";
import { DocumentRow } from "./document-row";

const UNCATEGORIZED_KEY = "__uncategorized__";

type DocumentGroup = {
  key: string;
  label: string;
  rows: Document[];
};

function groupDocumentsByCategory(documents: Document[]): DocumentGroup[] {
  const map = new Map<string, Document[]>();

  for (const document of documents) {
    const key = document.category?.trim() || UNCATEGORIZED_KEY;
    if (!map.has(key)) map.set(key, []);
    map.get(key)?.push(document);
  }

  const entries = Array.from(map.entries());
  entries.sort(([a], [b]) => {
    if (a === UNCATEGORIZED_KEY) return 1;
    if (b === UNCATEGORIZED_KEY) return -1;
    return a.localeCompare(b);
  });

  return entries.map(([key, rows]) => ({
    key,
    label: key === UNCATEGORIZED_KEY ? "Sans catégorie" : key,
    rows,
  }));
}

export function DocumentsScreen() {

  const [filters, setFilters] = useState<DocumentFiltersForm>(
    emptyDocumentFilters,
  );
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { currentSchoolYear } = useCurrentSchoolYear();
  const effectiveSchoolYearId =
    filters.schoolYearId ?? currentSchoolYear?.id ?? null;

  const {
    documents,
    documentsError,
    documentsIsLoading,
    documentsIsFetching,
    loadDocuments,
  } = useDocuments({
    filters: {
      schoolYearId: effectiveSchoolYearId,
      audienceType: filters.audienceType,
      audienceId: audienceIdFromFilters(filters),
      search: searchTerm,
    },
  });

  const documentGroups = useMemo(
    () => groupDocumentsByCategory(documents),
    [documents],
  );

  const activeFilterCount = useMemo(
    () => Object.values(filters).filter((value) => value !== null).length,
    [filters],
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: "Documents",
          headerLeft: () => <DrawerMenuButton />,
          headerRight: () => (
            <Pressable
              onPress={() => router.push("/teacher/documents/new")}
              hitSlop={8}
            >
              <Ionicons name="add-outline" size={26} color="#000000" />
            </Pressable>
          ),
        }}
      />

      <View className="flex-1 bg-white">
        <View className="flex-row items-center gap-3 px-4 pt-3 pb-2">
          <View className="flex-1">
            <SearchBar
              placeholder="Rechercher un document"
              onChangeText={setSearchTerm}
            />
          </View>
          <FilterButton
            activeCount={activeFilterCount}
            onPress={() => setFiltersOpen((open) => !open)}
          />
        </View>

        {filtersOpen && (
          <DocumentFilterPanel
            value={filters}
            onApply={setFilters}
            onClose={() => setFiltersOpen(false)}
          />
        )}

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 24 }}
          refreshControl={
            <RefreshControl
              refreshing={documentsIsFetching && !documentsIsLoading}
              onRefresh={loadDocuments}
            />
          }
        >
          {documentsIsLoading ? (
            <View className="items-center justify-center py-16">
              <ActivityIndicator />
            </View>
          ) : documentsError ? (
            <View className="items-center justify-center px-6 py-10 gap-3">
              <Text className="text-sm text-gray-500 text-center">
                Impossible de charger les documents.
              </Text>
              <Pressable
                onPress={() => loadDocuments()}
                className="h-10 px-4 rounded-lg bg-black items-center justify-center"
              >
                <Text className="text-white font-medium">Réessayer</Text>
              </Pressable>
            </View>
          ) : documentGroups.length === 0 ? (
            <View className="items-center justify-center px-6 py-16">
              <Text className="text-sm text-gray-400 text-center">
                Aucun document partagé.
              </Text>
            </View>
          ) : (
            documentGroups.map((group) => (
              <View key={group.key}>
                <Text className="px-4 pt-5 pb-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  {group.label}
                </Text>
                {group.rows.map((row, index) => (
                  <DocumentRow key={row.id} item={row} isFirst={index === 0} />
                ))}
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </>
  );
}
