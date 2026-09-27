import { useStudents } from "@/hooks/queries/items/student";
import { useCachedStudents } from "@/lib/offline/cached-students";
import { useIsOnline } from "@/lib/offline/use-offline-queue";
import type { Student } from "@/utils/types/Student";
import Ionicons from "@expo/vector-icons/Ionicons";
import { FlashList } from "@shopify/flash-list";
import { useState } from "react";
import { ActivityIndicator, Modal, Pressable, Text, View } from "react-native";
import { SearchBar } from "./search-bar";

export type PickedStudent = Pick<Student, "id" | "fullDesignation">;

type StudentPickerProps = {
  label: string;
  placeholder?: string;
  value: PickedStudent | null;
  onChange: (student: Student | null) => void;
  schoolYearId?: string | null;
  disabled?: boolean;
};

export function StudentPicker({
  label,
  placeholder = "Sélectionner un élève",
  value,
  onChange,
  schoolYearId,
  disabled,
}: StudentPickerProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const isDisabled = disabled || !schoolYearId;

  const {
    students,
    studentsError,
    studentsIsLoading,
    studentsIsFetchingNextPage,
    studentsHasNextPage,
    fetchNextStudents,
    loadStudents,
  } = useStudents({
    filters: { schoolYearId, searchTerm },
    enabled: open && Boolean(schoolYearId),
  });

  // Hors ligne, serveur injoignable (erreur) ou pas encore de réponse : recherche locale parmi les élèves gardés sur l'appareil.
  // La réponse du serveur prend la place dès qu'elle arrive.
  const isOnline = useIsOnline();
  const serverAnswered = isOnline && !studentsIsLoading && !studentsError;
  const cachedStudents = useCachedStudents({
    schoolYearId,
    searchTerm,
    enabled: open && !serverAnswered,
  });
  const listedStudents = serverAnswered ? students : cachedStudents;
  const serverUnreachable = isOnline && Boolean(studentsError);

  const handleClose = () => {
    setOpen(false);
    setSearchTerm("");
  };

  const handleSelect = (student: Student) => {
    onChange(student);
    handleClose();
  };

  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-gray-700 mb-2">{label}</Text>

      <View className="flex-row items-center gap-2">
        <Pressable
          onPress={() => !isDisabled && setOpen(true)}
          className={`flex-1 flex-row items-center justify-between h-11 border rounded-lg px-3 ${
            isDisabled
              ? "bg-gray-50 border-gray-200"
              : "bg-white border-gray-300"
          }`}
        >
          <Text
            className={`flex-1 text-base ${value ? "text-black" : "text-gray-400"}`}
            numberOfLines={1}
          >
            {value
              ? value.fullDesignation
              : isDisabled
                ? "Sélectionnez une année scolaire"
                : placeholder}
          </Text>
          <Ionicons name="chevron-down" size={18} color="#9CA3AF" />
        </Pressable>

        {value && (
          <Pressable onPress={() => onChange(null)} hitSlop={8} className="p-1">
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </Pressable>
        )}
      </View>

      <Modal visible={open} animationType="slide" onRequestClose={handleClose}>
        <View className="flex-1 bg-white">
          <View className="flex-row items-center justify-between px-4 pt-14 pb-3 border-b border-gray-100">
            <Text className="text-base font-semibold">{label}</Text>
            <Pressable onPress={handleClose} hitSlop={8}>
              <Ionicons name="close" size={22} color="#374151" />
            </Pressable>
          </View>

          <View className="px-4 pt-3 pb-2">
            <SearchBar
              placeholder="Rechercher un élève"
              onChangeText={setSearchTerm}
            />
          </View>

          {serverUnreachable && (
            <View className="flex-row items-center justify-between gap-3 mx-4 mb-2 px-3 py-2 rounded-lg bg-amber-50">
              <Text className="flex-1 text-xs text-amber-700">
                Serveur injoignable : recherche parmi les élèves de vos classes.
              </Text>
              <Pressable onPress={() => loadStudents()} hitSlop={8}>
                <Text className="text-xs font-medium text-amber-800">
                  Réessayer
                </Text>
              </Pressable>
            </View>
          )}

          {studentsIsLoading && listedStudents.length === 0 ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator />
            </View>
          ) : (
            <FlashList
              data={listedStudents}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => handleSelect(item)}
                  className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100"
                >
                  <View className="flex-1">
                    <Text className="text-base text-black" numberOfLines={1}>
                      {item.fullDesignation}
                    </Text>
                    {item.registrationNo && (
                      <Text className="text-xs text-gray-400 mt-0.5">
                        {item.registrationNo}
                      </Text>
                    )}
                  </View>
                  {value?.id === item.id && (
                    <Ionicons name="checkmark" size={18} color="#000000" />
                  )}
                </Pressable>
              )}
              ListEmptyComponent={
                <View className="items-center justify-center px-6 py-16">
                  <Text className="text-sm text-gray-400 text-center">
                    {serverAnswered
                      ? "Aucun élève trouvé."
                      : "Aucun élève de vos classes gardé sur l'appareil ne correspond."}
                  </Text>
                </View>
              }
              ListFooterComponent={
                studentsIsFetchingNextPage ? (
                  <View className="py-4">
                    <ActivityIndicator />
                  </View>
                ) : null
              }
              onEndReached={() => {
                if (
                  serverAnswered &&
                  studentsHasNextPage &&
                  !studentsIsFetchingNextPage
                ) {
                  fetchNextStudents();
                }
              }}
              onEndReachedThreshold={0.4}
            />
          )}
        </View>
      </Modal>
    </View>
  );
}
