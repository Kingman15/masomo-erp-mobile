import { ComboBox } from "@/components/list/combo-box";
import { DateField } from "@/components/list/date-field";
import { StudentPicker } from "@/components/list/student-picker";
import { TimeField } from "@/components/list/time-field";
import { useIncidentTypes } from "@/hooks/queries/items/incident-type";
import {
  useCurrentSchoolYear,
  useSchoolYears,
} from "@/hooks/queries/items/school-year";
import { useTeacherReportStudentIncident } from "@/hooks/queries/items/student-incident";
import { handleApiError } from "@/lib/handle-api-error";
import { toastNotify } from "@/lib/toast";
import {
  teacherStudentIncidentSchema,
  type IncidentStudentFormValues,
  type TeacherStudentIncidentFormValues,
} from "@/utils/schemas/teacher-student-incident-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { router, Stack } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { IncidentStudentDialog } from "./incident-student-dialog";
import { IncidentStudentRow } from "./incident-student-row";

function toDateOnly(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function combineDateTime(date: string, time?: string | null): string {
  return `${date}T${time && time.length > 0 ? time : "00:00"}:00`;
}

function createTempId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
}

function emptyIncidentStudent(): IncidentStudentFormValues {
  return {
    tempId: createTempId(),
    studentId: "",
    studentLabel: null,
    role: "involved",
    notes: null,
  };
}

export function IncidentReportFormScreen() {
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<TeacherStudentIncidentFormValues>({
    resolver: zodResolver(teacherStudentIncidentSchema),
    defaultValues: {
      incidentTypeId: null,
      mainStudentId: null,
      mainStudentLabel: null,
      occurredAtDate: toDateOnly(new Date()),
      occurredAtTime: null,
      reportedAtDate: null,
      reportedAtTime: null,
      severityLevel: null,
      location: null,
      description: null,
      students: [],
    },
  });

  const { fields, append, update, remove } = useFieldArray({
    control,
    name: "students",
    keyName: "fieldKey",
  });

  const schoolYearId = watch("schoolYearId");
  const mainStudentId = watch("mainStudentId");
  const mainStudentLabel = watch("mainStudentLabel");

  const { schoolYears, schoolYearsIsLoading } = useSchoolYears();
  const { currentSchoolYear } = useCurrentSchoolYear();
  const { incidentTypes, incidentTypesIsLoading } = useIncidentTypes();

  useEffect(() => {
    if (!schoolYearId && currentSchoolYear?.id) {
      setValue("schoolYearId", currentSchoolYear.id);
    }
  }, [currentSchoolYear, schoolYearId, setValue]);

  // --- Élèves concernés ---

  const [studentDialog, setStudentDialog] = useState<{
    visible: boolean;
    index: number | null;
    values: IncidentStudentFormValues;
  }>({ visible: false, index: null, values: emptyIncidentStudent() });

  const openAddStudent = () => {
    setStudentDialog({
      visible: true,
      index: null,
      values: emptyIncidentStudent(),
    });
  };

  const openEditStudent = (index: number) => {
    setStudentDialog({ visible: true, index, values: fields[index] });
  };

  const closeStudentDialog = () => {
    setStudentDialog((state) => ({ ...state, visible: false }));
  };

  const saveStudent = (values: IncidentStudentFormValues) => {
    if (studentDialog.index === null) {
      append(values);
    } else {
      update(studentDialog.index, values);
    }
    closeStudentDialog();
  };

  const deleteStudent = (index: number) => {
    const field = fields[index];
    if (field.studentId && field.studentId === mainStudentId) {
      toastNotify(
        "Vous ne pouvez pas retirer l'élève principal de la liste.",
        "warning",
      );
      return;
    }
    remove(index);
  };

  const handleMainStudentChange = (
    student: { id: string; fullDesignation: string | null } | null,
  ) => {
    setValue("mainStudentId", student?.id ?? null);
    setValue("mainStudentLabel", student?.fullDesignation ?? null);

    if (student) {
      const alreadyPresent = fields.some(
        (field) => field.studentId === student.id,
      );
      if (!alreadyPresent) {
        append({
          tempId: createTempId(),
          studentId: student.id,
          studentLabel: student.fullDesignation,
          role: "involved",
          notes: null,
        });
      }
    }
  };

  // --- Soumission ---

  const { teacherReportStudentIncident, teacherReportStudentIncidentIsPending } =
    useTeacherReportStudentIncident();

  const isBusy = teacherReportStudentIncidentIsPending || isSubmitting;

  const onSubmit = async (data: TeacherStudentIncidentFormValues) => {
    try {
      await teacherReportStudentIncident({
        schoolYearId: data.schoolYearId,
        incidentTypeId: data.incidentTypeId ?? null,
        mainStudentId: data.mainStudentId ?? null,
        occurredAt: combineDateTime(data.occurredAtDate, data.occurredAtTime),
        reportedAt: data.reportedAtDate
          ? combineDateTime(data.reportedAtDate, data.reportedAtTime)
          : null,
        description: data.description ?? null,
        location: data.location ?? null,
        severityLevel: data.severityLevel ?? null,
        students: data.students.map((student) => ({
          studentId: student.studentId,
          role: student.role,
          notes: student.notes ?? null,
        })),
      });

      toastNotify("Incident signalé avec succès.", "success");
      router.back();
    } catch (error) {
      handleApiError(error, {
        setFieldError: (field, message) =>
          setError(field as keyof TeacherStudentIncidentFormValues, {
            message,
          }),
      });
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: "Signaler un incident" }} />

      <ScrollView
        className="flex-1 bg-white"
        contentContainerStyle={{ padding: 16 }}
      >
        <Controller
          control={control}
          name="schoolYearId"
          render={({ field: { value } }) => (
            <ComboBox
              label="Année scolaire"
              options={(schoolYears ?? []).map((year) => ({
                id: year.id,
                label: year.title,
              }))}
              value={value}
              onChange={() => {}}
              loading={schoolYearsIsLoading}
              disabled
            />
          )}
        />
        {errors.schoolYearId && (
          <Text className="text-xs text-red-500 -mt-3 mb-3">
            {errors.schoolYearId.message}
          </Text>
        )}

        <Controller
          control={control}
          name="incidentTypeId"
          render={({ field: { value, onChange } }) => (
            <ComboBox
              label="Type d'incident"
              placeholder="Sélectionner un type"
              options={(incidentTypes ?? []).map((type) => ({
                id: type.id,
                label: type.name,
              }))}
              value={value ?? null}
              onChange={onChange}
              loading={incidentTypesIsLoading}
            />
          )}
        />

        <View className="flex-row gap-3">
          <Controller
            control={control}
            name="occurredAtDate"
            render={({ field: { value, onChange } }) => (
              <DateField
                label="Date de l'incident"
                value={value}
                onChange={(v) => onChange(v ?? "")}
              />
            )}
          />
          <Controller
            control={control}
            name="occurredAtTime"
            render={({ field: { value, onChange } }) => (
              <TimeField label="Heure" value={value} onChange={onChange} />
            )}
          />
        </View>
        {errors.occurredAtDate && (
          <Text className="text-xs text-red-500 mt-1 mb-3">
            {errors.occurredAtDate.message}
          </Text>
        )}

        <Text className="text-sm font-medium text-gray-700 mb-2">
          Gravité (1 à 5)
        </Text>
        <Controller
          control={control}
          name="severityLevel"
          render={({ field: { value, onChange } }) => (
            <TextInput
              value={value === undefined || value === null ? "" : String(value)}
              onChangeText={(text) => onChange(text ? (text as unknown as number) : null)}
              keyboardType="number-pad"
              placeholder="Optionnel"
              placeholderTextColor="#9CA3AF"
              className="h-11 border border-gray-300 rounded-lg px-3 mb-1 bg-white"
            />
          )}
        />
        {errors.severityLevel && (
          <Text className="text-xs text-red-500 mb-3">
            {errors.severityLevel.message}
          </Text>
        )}

        <Text className="text-sm font-medium text-gray-700 mb-2">Lieu</Text>
        <Controller
          control={control}
          name="location"
          render={({ field: { value, onChange } }) => (
            <TextInput
              value={value ?? ""}
              onChangeText={(text) => onChange(text || null)}
              placeholder="Lieu de l'incident (optionnel)"
              placeholderTextColor="#9CA3AF"
              className="h-11 border border-gray-300 rounded-lg px-3 mb-1 bg-white"
            />
          )}
        />
        {errors.location && (
          <Text className="text-xs text-red-500 mb-3">
            {errors.location.message}
          </Text>
        )}

        <View className="flex-row gap-3">
          <Controller
            control={control}
            name="reportedAtDate"
            render={({ field: { value, onChange } }) => (
              <DateField
                label="Date de signalement"
                value={value}
                onChange={onChange}
              />
            )}
          />
          <Controller
            control={control}
            name="reportedAtTime"
            render={({ field: { value, onChange } }) => (
              <TimeField label="Heure" value={value} onChange={onChange} />
            )}
          />
        </View>

        <Text className="text-sm font-medium text-gray-700 mb-2 mt-4">
          Description
        </Text>
        <Controller
          control={control}
          name="description"
          render={({ field: { value, onChange } }) => (
            <TextInput
              value={value ?? ""}
              onChangeText={(text) => onChange(text || null)}
              multiline
              textAlignVertical="top"
              placeholder="Description de l'incident (optionnel)"
              placeholderTextColor="#9CA3AF"
              className="min-h-[80px] border border-gray-300 rounded-lg px-3 py-2 mb-1 bg-white"
            />
          )}
        />
        {errors.description && (
          <Text className="text-xs text-red-500 mb-3">
            {errors.description.message}
          </Text>
        )}

        <StudentPicker
          label="Élève principal"
          value={
            mainStudentId
              ? { id: mainStudentId, fullDesignation: mainStudentLabel ?? null }
              : null
          }
          onChange={handleMainStudentChange}
          schoolYearId={schoolYearId}
        />

        <Text className="text-base font-semibold text-black mt-2 mb-3">
          Élèves concernés
        </Text>

        {fields.map((field, index) => (
          <IncidentStudentRow
            key={field.fieldKey}
            incidentStudent={field}
            onPress={() => openEditStudent(index)}
            onDelete={() => deleteStudent(index)}
          />
        ))}

        {typeof errors.students?.message === "string" && (
          <Text className="text-xs text-red-500 mb-3">
            {errors.students.message}
          </Text>
        )}

        <Pressable
          onPress={openAddStudent}
          className="h-11 rounded-lg border border-dashed border-gray-300 items-center justify-center mb-6"
        >
          <Text className="text-sm font-medium text-gray-600">
            + Ajouter un élève
          </Text>
        </Pressable>

        <Pressable
          onPress={() => void handleSubmit(onSubmit)()}
          disabled={isBusy}
          className={`h-12 rounded-lg items-center justify-center ${
            isBusy ? "bg-gray-300" : "bg-black"
          }`}
        >
          {isBusy ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-white font-medium">Signaler l&apos;incident</Text>
          )}
        </Pressable>
      </ScrollView>

      <IncidentStudentDialog
        visible={studentDialog.visible}
        initialValues={studentDialog.values}
        isEditing={studentDialog.index !== null}
        schoolYearId={schoolYearId}
        onClose={closeStudentDialog}
        onSave={saveStudent}
      />
    </>
  );
}
