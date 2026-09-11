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
  const [expanded, setExpanded] = useState(true);
  const children = sortArticles(article.childArticles ?? []);
  const hasChildren = children.length > 0;

  return (
    <View className={level > 0 ? "border-l border-gray-100 ml-3" : ""}>
      <Pressable
        onPress={() => setExpanded((prev) => !prev)}
        className="flex-row items-center px-4 py-3 border-b border-gray-100 bg-white"
      >
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            {article.number && (
              <Text className="text-xs font-mono text-gray-500">
                {article.number}
              </Text>
            )}
            <Text
              className="flex-1 text-sm font-medium text-black"
              numberOfLines={expanded ? undefined : 2}
            >
              {article.title ?? "—"}
            </Text>
          </View>
          {!expanded && hasChildren && (
            <Text className="text-xs text-gray-400 mt-1">
              {children.length} sous-article{children.length > 1 ? "s" : ""}
            </Text>
          )}
        </View>
        <Ionicons
          name={expanded ? "chevron-down" : "chevron-forward"}
          size={18}
          color="#9CA3AF"
        />
      </Pressable>

      {expanded && (
        <View className="px-4 py-3 bg-gray-50 border-b border-gray-100">
          {article.content && (
            <Text className="text-sm text-gray-700 leading-relaxed">
              {article.content}
            </Text>
          )}

          {article.comments && (
            <View className="mt-3 pt-3 border-t border-gray-200">
              <Text className="text-xs text-gray-400 mb-1">Commentaires</Text>
              <Text className="text-sm text-gray-600">{article.comments}</Text>
            </View>
          )}

          {hasChildren && (
            <View className="mt-3 rounded-lg border border-gray-200 overflow-hidden bg-white">
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
