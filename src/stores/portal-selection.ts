import type { SchoolClass } from "@/utils/types/SchoolClass";
import type { SchoolYear } from "@/utils/types/SchoolYear";
import type { Student } from "@/utils/types/Student";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

const PORTAL_SELECTION_KEY = "portal_selection";

interface PersistedPortalSelection {
  studentId: string | null;
  schoolYearId: string | null;
  schoolClassId: string | null;
}

interface PortalSelectionState {
  selectedStudentId: string | null;
  selectedSchoolYearId: string | null;
  selectedSchoolClassId: string | null;
  isHydrated: boolean;

  hydrate: () => Promise<void>;
  setSelectedStudent: (student: Pick<Student, "id">) => void;
  setSelectedSchoolYear: (schoolYear: Pick<SchoolYear, "id">) => void;
  setSelectedSchoolClass: (schoolClass: Pick<SchoolClass, "id">) => void;
  clearSelection: () => void;
}

function persist(state: PersistedPortalSelection) {
  AsyncStorage.setItem(PORTAL_SELECTION_KEY, JSON.stringify(state)).catch(() => {});
}

export const usePortalSelectionStore = create<PortalSelectionState>((set, get) => ({
  selectedStudentId: null,
  selectedSchoolYearId: null,
  selectedSchoolClassId: null,
  isHydrated: false,

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(PORTAL_SELECTION_KEY);
      const parsed = raw ? (JSON.parse(raw) as PersistedPortalSelection) : null;
      set({
        selectedStudentId: parsed?.studentId ?? null,
        selectedSchoolYearId: parsed?.schoolYearId ?? null,
        selectedSchoolClassId: parsed?.schoolClassId ?? null,
        isHydrated: true,
      });
    } catch {
      set({ isHydrated: true });
    }
  },

  setSelectedStudent: (student) => {
    set({
      selectedStudentId: student.id,
      selectedSchoolYearId: null,
      selectedSchoolClassId: null,
    });
    persist({ studentId: student.id, schoolYearId: null, schoolClassId: null });
  },

  setSelectedSchoolYear: (schoolYear) => {
    set({ selectedSchoolYearId: schoolYear.id, selectedSchoolClassId: null });
    persist({
      studentId: get().selectedStudentId,
      schoolYearId: schoolYear.id,
      schoolClassId: null,
    });
  },

  setSelectedSchoolClass: (schoolClass) => {
    set({ selectedSchoolClassId: schoolClass.id });
    persist({
      studentId: get().selectedStudentId,
      schoolYearId: get().selectedSchoolYearId,
      schoolClassId: schoolClass.id,
    });
  },

  clearSelection: () => {
    set({
      selectedStudentId: null,
      selectedSchoolYearId: null,
      selectedSchoolClassId: null,
    });
    AsyncStorage.removeItem(PORTAL_SELECTION_KEY).catch(() => {});
  },
}));
