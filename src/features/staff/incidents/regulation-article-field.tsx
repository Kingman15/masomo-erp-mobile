import { SearchBar } from "@/components/list/search-bar";
import { useStudentInternalRegulations } from "@/hooks/queries/items/student-internal-regulation";
import { useStudentRegulationArticles } from "@/hooks/queries/items/student-regulation-article";
import { useThemeColors } from "@/hooks/use-theme-colors";
import type { StudentRegulationArticleDTO } from "@/utils/types/StudentRegulationArticleDTO";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

type FlatArticle = {
  article: StudentRegulationArticleDTO;
  depth: number;
  // Titres des articles parents, pour situer un résultat de recherche
  path: string[];
};

function articleLabel(article: StudentRegulationArticleDTO): string {
  return [article.number, article.title].filter(Boolean).join(" ") || "—";
}

function flattenArticles(
  articles: StudentRegulationArticleDTO[],
  depth = 0,
  path: string[] = [],
): FlatArticle[] {
  return [...articles]
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
    .flatMap((article) => [
      { article, depth, path },
      ...flattenArticles(article.childArticles ?? [], depth + 1, [
        ...path,
        articleLabel(article),
      ]),
    ]);
}

// Recherche insensible à la casse et aux accents
function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

type RegulationArticleFieldProps = {
  schoolYearId: string | null;
  value: string | null;
  // Libellé de l'article déjà enregistré (sanction en modification)
  initialLabel?: string | null;
  onChange: (articleId: string | null) => void;
  disabled?: boolean;
  error?: string;
};

/**
 * « Article violé » d'une sanction, comme le sélecteur d'article du web :
 * règlement de l'année (l'actif présélectionné), recherche, puis article dans l'arbre aplati.
 */
export function RegulationArticleField({
  schoolYearId,
  value,
  initialLabel,
  onChange,
  disabled,
  error,
}: RegulationArticleFieldProps) {
  const colors = useThemeColors();
  const [open, setOpen] = useState(false);
  const [pickedLabel, setPickedLabel] = useState<string | null>(null);
  const [chosenRegulationId, setChosenRegulationId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Tous les règlements de l'année (global, section, option, classe) : chargés à l'ouverture seulement.
  const { studentInternalRegulations, studentInternalRegulationsIsLoading } =
    useStudentInternalRegulations({
      filters: { schoolYearId },
      enabled: open,
    });

  // Comme le web : le dernier règlement actif, le règlement global d'abord.
  const defaultRegulationId = useMemo(() => {
    const active = studentInternalRegulations
      .filter((regulation) => regulation.isActive)
      .sort((a, b) => b.id.localeCompare(a.id));
    // Un règlement global est enregistré sans cible (targetType null).
    const global = active.find(
      (regulation) => !regulation.targetType || regulation.targetType === "global",
    );
    return (global ?? active[0])?.id ?? null;
  }, [studentInternalRegulations]);

  const regulationId = chosenRegulationId ?? defaultRegulationId;

  const { studentRegulationArticles, studentRegulationArticlesIsLoading } =
    useStudentRegulationArticles({
      filters: { regulationId },
      enabled: open,
    });

  const allArticles = useMemo(
    () => flattenArticles(studentRegulationArticles),
    [studentRegulationArticles],
  );

  const visibleArticles = useMemo(() => {
    const term = normalize(searchTerm.trim());
    if (!term) return allArticles;
    return allArticles.filter(({ article }) =>
      normalize(
        [article.number, article.title, article.content].filter(Boolean).join(" "),
      ).includes(term),
    );
  }, [allArticles, searchTerm]);

  const isSearching = searchTerm.trim().length > 0;
  const label = value ? (pickedLabel ?? initialLabel ?? "Article sélectionné") : null;
  const isDisabled = disabled || !schoolYearId;

  const close = () => {
    setOpen(false);
    setSearchTerm("");
  };

  const select = (article: StudentRegulationArticleDTO | null) => {
    setPickedLabel(article ? articleLabel(article) : null);
    onChange(article?.id ?? null);
    close();
  };

  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-foreground-secondary mb-2">
        Article violé
      </Text>

      <View
        className={`flex-row items-center h-11 border rounded-lg ${
          isDisabled ? "bg-subtle border-border" : "bg-card border-input"
        }`}
      >
        <Pressable
          onPress={() => !isDisabled && setOpen(true)}
          className="flex-1 flex-row items-center h-full px-3"
        >
          <Text
            className={`flex-1 text-base ${label ? "text-foreground" : "text-faint"}`}
            numberOfLines={1}
          >
            {label ?? "Choisir dans le règlement"}
          </Text>
          {!value && <Ionicons name="book-outline" size={18} color={colors.faint} />}
        </Pressable>
        {value && !isDisabled && (
          <Pressable onPress={() => select(null)} hitSlop={8} className="px-3">
            <Ionicons name="close" size={18} color={colors.faint} />
          </Pressable>
        )}
      </View>
      {error && <Text className="text-xs text-red-500 mt-1">{error}</Text>}

      <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
        <Pressable className="flex-1 bg-black/40 justify-center px-4" onPress={close}>
          <Pressable className="bg-card rounded-xl max-h-[85%] overflow-hidden">
            <View className="flex-row items-center justify-between px-4 py-3 border-b border-divider">
              <Text className="text-base font-semibold text-foreground">
                Article du règlement
              </Text>
              <Pressable onPress={close} hitSlop={8}>
                <Ionicons name="close" size={20} color={colors.foregroundSecondary} />
              </Pressable>
            </View>

            {studentInternalRegulations.length > 1 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="flex-grow-0 border-b border-divider"
                contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 8, gap: 8 }}
              >
                {studentInternalRegulations.map((regulation) => {
                  const isCurrent = regulation.id === regulationId;
                  return (
                    <Pressable
                      key={regulation.id}
                      onPress={() => setChosenRegulationId(regulation.id)}
                      className={`px-3 py-1.5 rounded-full border ${
                        isCurrent ? "bg-foreground border-foreground" : "bg-card border-input"
                      }`}
                    >
                      <Text
                        className={`text-sm ${isCurrent ? "text-background" : "text-foreground-secondary"}`}
                        numberOfLines={1}
                      >
                        {[regulation.title, regulation.targetStr].filter(Boolean).join(" · ") ||
                          "Règlement"}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            )}

            <View className="px-3 pt-3 pb-2">
              <SearchBar placeholder="Rechercher un article" onChangeText={setSearchTerm} />
            </View>

            {studentInternalRegulationsIsLoading || studentRegulationArticlesIsLoading ? (
              <View className="py-10 items-center">
                <ActivityIndicator />
              </View>
            ) : (
              <FlatList
                data={visibleArticles}
                keyExtractor={(item) => item.article.id}
                keyboardShouldPersistTaps="handled"
                ItemSeparatorComponent={() => <View className="h-px bg-divider" />}
                ListEmptyComponent={
                  <Text className="text-sm text-muted-foreground text-center px-6 py-10">
                    {!regulationId
                      ? "Aucun règlement actif pour cette année scolaire."
                      : isSearching
                        ? "Aucun article ne correspond à la recherche."
                        : "Ce règlement ne contient aucun article."}
                  </Text>
                }
                renderItem={({ item }) => {
                  const isSelected = item.article.id === value;
                  return (
                    <Pressable
                      onPress={() => select(item.article)}
                      className="flex-row items-center px-4 py-3"
                      style={{ paddingLeft: 16 + (isSearching ? 0 : item.depth * 16) }}
                    >
                      <View className="flex-1">
                        {isSearching && item.path.length > 0 && (
                          <Text className="text-xs text-faint mb-0.5" numberOfLines={1}>
                            {item.path.join(" › ")}
                          </Text>
                        )}
                        <View className="flex-row gap-2">
                          {item.article.number && (
                            <Text className="text-xs font-mono text-muted-foreground mt-0.5">
                              {item.article.number}
                            </Text>
                          )}
                          <Text
                            className={`flex-1 text-sm ${
                              isSelected ? "font-semibold text-foreground" : "text-foreground-secondary"
                            }`}
                          >
                            {item.article.title ?? "—"}
                          </Text>
                        </View>
                      </View>
                      {isSelected && (
                        <Ionicons name="checkmark" size={18} color={colors.foreground} />
                      )}
                    </Pressable>
                  );
                }}
              />
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
