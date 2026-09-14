import { StudentAttendanceRecord } from "@/utils/types/StudentAttendanceRecord";

export type AttendanceBadgeInfo = {
  dotColor: string;
  textColor: string;
  bgColor: string;
  label: string;
};

export function getAttendanceBadgeInfo(
  record: StudentAttendanceRecord,
): AttendanceBadgeInfo {
  const pointingCode = record.pointingType?.code;

  if (pointingCode === "absent") {
    switch (record.justificationStatus?.code) {
      case "excused":
        return {
          dotColor: "#9CA3AF",
          textColor: "#374151",
          bgColor: "#F9FAFB",
          label: "Absent justifié",
        };
      case "authorized":
        return {
          dotColor: "#A855F7",
          textColor: "#7E22CE",
          bgColor: "#FAF5FF",
          label: "Absent autorisé",
        };
      case "unexcused":
        return {
          dotColor: "#DC2626",
          textColor: "#991B1B",
          bgColor: "#FEF2F2",
          label: "Absent non justifié",
        };
      case "pending":
      default:
        return {
          dotColor: "#F87171",
          textColor: "#B91C1C",
          bgColor: "#FEF2F2",
          label: "Absent",
        };
    }
  }

  if (record.isLate) {
    return {
      dotColor: "#F59E0B",
      textColor: "#92400E",
      bgColor: "#FFFBEB",
      label: "En retard",
    };
  }

  if (record.isPartial) {
    return {
      dotColor: "#3B82F6",
      textColor: "#1D4ED8",
      bgColor: "#EFF6FF",
      label: "Partiel",
    };
  }

  return {
    dotColor: "#4ADE80",
    textColor: "#15803D",
    bgColor: "#F0FDF4",
    label: "Présent",
  };
}
