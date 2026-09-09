import {
  useDeleteTeachingCourseEvaluationDocument,
  useTeachingCourseEvaluationDocuments,
  useUploadTeachingCourseEvaluationDocument,
} from "@/hooks/queries/items/teaching-course-evaluation-document";
import { useConfirm } from "@/hooks/use-confirm";
import { handleApiError } from "@/lib/handle-api-error";
import { toastNotify } from "@/lib/toast";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import {
  EvaluationDocumentUploadDialog,
  type EvaluationDocumentUploadPayload,
} from "./evaluation-document-upload-dialog";
import { EvaluationDocumentRow } from "./evaluation-document-row";

type EvaluationDocumentsSectionProps = {
  evaluationId: string;
};

export function EvaluationDocumentsSection({
  evaluationId,
}: EvaluationDocumentsSectionProps) {
  const {
    teachingCourseEvaluationDocuments,
    teachingCourseEvaluationDocumentsIsLoading,
    teachingCourseEvaluationDocumentsError,
    loadTeachingCourseEvaluationDocuments,
    teachingCourseEvaluationDocumentsIsFetching,
  } = useTeachingCourseEvaluationDocuments(evaluationId);

  const {
    uploadTeachingCourseEvaluationDocument,
    uploadTeachingCourseEvaluationDocumentIsPending,
  } = useUploadTeachingCourseEvaluationDocument(evaluationId);
  const { deleteTeachingCourseEvaluationDocument } =
    useDeleteTeachingCourseEvaluationDocument(evaluationId);

  const { confirm, ConfirmDialog } = useConfirm();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const handleUpload = async (payload: EvaluationDocumentUploadPayload) => {
    try {
      await uploadTeachingCourseEvaluationDocument(payload);
      toastNotify("Document ajouté avec succès.", "success");
      setUploadDialogOpen(false);
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleDelete = async (linkId: string, name: string) => {
    const ok = await confirm({
      title: "Supprimer le document",
      description: `Voulez-vous vraiment supprimer le document "${name}" ? Cette action est irréversible.`,
      confirmText: "Supprimer",
      variant: "destructive",
    });
    if (!ok) return;

    try {
      await deleteTeachingCourseEvaluationDocument(linkId);
      toastNotify("Document supprimé avec succès.", "success");
    } catch (error) {
      handleApiError(error);
    }
  };

  return (
    <View className="mb-6">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-base font-semibold text-black">Documents</Text>
        <Pressable
          onPress={() => loadTeachingCourseEvaluationDocuments()}
          hitSlop={8}
        >
          {teachingCourseEvaluationDocumentsIsFetching ? (
            <ActivityIndicator size="small" />
          ) : (
            <Ionicons name="refresh-outline" size={18} color="#374151" />
          )}
        </Pressable>
      </View>

      {teachingCourseEvaluationDocumentsIsLoading ? (
        <Text className="text-sm text-gray-400 mb-3">Chargement ...</Text>
      ) : teachingCourseEvaluationDocumentsError ? (
        <Text className="text-sm text-gray-500 mb-3">
          Impossible de charger les documents.
        </Text>
      ) : teachingCourseEvaluationDocuments &&
        teachingCourseEvaluationDocuments.length > 0 ? (
        teachingCourseEvaluationDocuments.map((document) => (
          <EvaluationDocumentRow
            key={document.linkId}
            document={document}
            onDelete={() =>
              void handleDelete(document.linkId, document.originalName)
            }
          />
        ))
      ) : (
        <Text className="text-sm text-gray-400 mb-3">Aucun document.</Text>
      )}

      <Pressable
        onPress={() => setUploadDialogOpen(true)}
        className="h-11 rounded-lg border border-dashed border-gray-300 items-center justify-center"
      >
        <Text className="text-sm font-medium text-gray-600">
          + Ajouter un document
        </Text>
      </Pressable>

      {uploadDialogOpen && (
        <EvaluationDocumentUploadDialog
          isPending={uploadTeachingCourseEvaluationDocumentIsPending}
          onClose={() => setUploadDialogOpen(false)}
          onUpload={(payload) => void handleUpload(payload)}
        />
      )}

      <ConfirmDialog />
    </View>
  );
}
