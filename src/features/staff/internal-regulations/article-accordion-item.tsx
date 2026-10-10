import { useThemeColors } from "@/hooks/use-theme-colors";
import type { StudentRegulationArticleDTO } from "@/utils/types/StudentRegulationArticleDTO";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

function sortArticles(
  articles: StudentRegulationArticleDTO[],
): StudentRegulationArticleDTO[] {
  return [...articles].sort(
    (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0),
  );
}

type ArticleAccordionItemProps = {
  article: StudentRegulationArticleDTO;
  level?: number;
};

export function ArticleAccordionItem({
  article,
  level = 0,
}: ArticleAccordionItemProps) {
  const colors = useThemeColors();
  const [expanded, setExpanded] = useState(true);
  const children = sortArticles(article.childArticles ?? []);
  const hasChildren = children.length > 0;

  return (
    <View className={level > 0 ? "border-l border-divider ml-3" : ""}>
      <Pressable
        onPress={() => setExpanded((prev) => !prev)}
        className="flex-row items-center px-4 py-3 border-b border-divider bg-card"
      >
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            {article.number && (
              <Text className="text-xs font-mono text-muted-foreground">
                {article.number}
              </Text>
            )}
            <Text
              className="flex-1 text-sm font-medium text-foreground"
              numberOfLines={expanded ? undefined : 2}
            >
              {article.title ?? "—"}
            </Text>
          </View>
          {!expanded && hasChildren && (
            <Text className="text-xs text-faint mt-1">
              {children.length} sous-article{children.length > 1 ? "s" : ""}
            </Text>
          )}
        </View>
        <Ionicons
          name={expanded ? "chevron-down" : "chevron-forward"}
          size={18}
          color={colors.faint}
        />
      </Pressable>

      {expanded && (
        <View className="px-4 py-3 bg-subtle border-b border-divider">
          {article.content && (
            <Text className="text-sm text-foreground-secondary leading-relaxed">
              {article.content}
            </Text>
          )}

          {article.comments && (
            <View className="mt-3 pt-3 border-t border-border">
              <Text className="text-xs text-faint mb-1">Commentaires</Text>
              <Text className="text-sm text-gray-600 dark:text-zinc-400">{article.comments}</Text>
            </View>
          )}

          {hasChildren && (
            <View className="mt-3 rounded-lg border border-border overflow-hidden bg-card">
              {children.map((child) => (
                <ArticleAccordionItem
                  key={child.id}
                  article={child}
                  level={level + 1}
                />
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
}
