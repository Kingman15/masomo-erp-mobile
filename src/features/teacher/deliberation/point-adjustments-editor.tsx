import { useEnrollmentDecisionPoints } from "@/hooks/queries/items/enrollment-decision";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { formatNumber } from "@/lib/format";
import type {
  DeliberationSession,
  EnrollmentDecisionGridRow,
  EnrollmentDecisionPoint,
  EnrollmentPointAdjustment,
} from "@/utils/types/EnrollmentDecision";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";

const REASON_MAX_LENGTH = 255;

type DraftCell = {
  // Saisie brute : "" = pas d'ajustement (le point obtenu s'applique)
  adjusted: string;
  reason: string;
};

const cellKey = (followCourseId: string, schoolPeriodId: string) =>
  `${followCourseId}|${schoolPeriodId}`;

// Point saisi, null si vide ou hors de 0..max
function parseAdjusted(raw: string, maxPoints: number): number | null {
  const trimmed = raw.trim().replace(",", ".");
  if (trimmed === "") return null;
  const value = Number(trimmed);
  return Number.isNaN(value) || value < 0 || value > maxPoints ? null : value;
}

// Ajustements enregistrés, au format envoyé au serveur
function savedAdjustments(points: EnrollmentDecisionPoint[]): EnrollmentPointAdjustment[] {
  return points.flatMap((point) =>
    point.adjustedPoints === null
      ? []
      : [
          {
            followCourseId: point.followCourseId,
            schoolPeriodId: point.schoolPeriodId,
            adjustedPoints: point.adjustedPoints,
            reason: point.adjustmentReason,
          },
        ],
  );
}

function sameAdjustments(a: EnrollmentPointAdjustment[], b: EnrollmentPointAdjustment[]) {
  const byKey = new Map(a.map((adj) => [cellKey(adj.followCourseId, adj.schoolPeriodId), adj]));
  return (
    a.length === b.length &&
    b.every((adj) => {
      const other = byKey.get(cellKey(adj.followCourseId, adj.schoolPeriodId));
      return (
        other !== undefined &&
        other.adjustedPoints === adj.adjustedPoints &&
        (other.reason ?? null) === (adj.reason ?? null)
      );
    })
  );
}

const percentageOf = (value: number, max: number) =>
  max > 0 ? `${formatNumber((value * 100) / max)}%` : "—";

type PointAdjustmentsEditorProps = {
  row: EnrollmentDecisionGridRow;
  schoolClassId: string;
  schoolYearId: string;
  session: DeliberationSession;
  // Décision en cours de saisie : sans décision, rien n'est enregistré pour l'élève
  hasDecision: boolean;
  readOnly: boolean;
  // null = ajustements identiques à ceux enregistrés
  value: EnrollmentPointAdjustment[] | null;
  onChange: (adjustments: EnrollmentPointAdjustment[] | null) => void;
};

/**
 * Points d'un élève par cours et par période, et ajustements du conseil (même règles que l'onglet « Points » du web).
 * Chaque saisie valide est reportée aussitôt dans la fiche ; une valeur hors de 0..max reste affichée en erreur et n'est pas reportée.
 */
export function PointAdjustmentsEditor({
  row,
  schoolClassId,
  schoolYearId,
  session,
  hasDecision,
  readOnly,
  value,
  onChange,
}: PointAdjustmentsEditorProps) {
  const colors = useThemeColors();
  const { decisionPoints, decisionPointsError, decisionPointsIsLoading, loadDecisionPoints } =
    useEnrollmentDecisionPoints({
      schoolClassId,
      schoolYearId,
      session,
      enrollmentId: row.enrollmentId,
    });

  const [draft, setDraft] = useState<Map<string, DraftCell> | null>(null);
  // Cours dépliés ; au départ, les cours en échec et ceux qui portent des ajustements
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // Initialisation au rendu, une fois les points reçus : saisie en cours de la fiche, sinon ajustements enregistrés
  if (decisionPoints && draft === null) {
    const source = value ?? savedAdjustments(decisionPoints);
    const bySource = new Map(source.map((adj) => [cellKey(adj.followCourseId, adj.schoolPeriodId), adj]));

    setExpanded(
      new Set([
        ...row.failedCourses.map((course) => course.followCourseId),
        ...source.map((adj) => adj.followCourseId),
      ]),
    );
    setDraft(
      new Map(
        decisionPoints.map((point) => {
          const adj = bySource.get(cellKey(point.followCourseId, point.schoolPeriodId));
          return [
            cellKey(point.followCourseId, point.schoolPeriodId),
            { adjusted: adj ? String(adj.adjustedPoints) : "", reason: adj?.reason ?? "" },
          ];
        }),
      ),
    );
  }

  const editable = !readOnly && hasDecision;
  const points = decisionPoints ?? [];

  const cellOf = (point: EnrollmentDecisionPoint): DraftCell =>
    draft?.get(cellKey(point.followCourseId, point.schoolPeriodId)) ?? { adjusted: "", reason: "" };

  const isInvalid = (point: EnrollmentDecisionPoint) => {
    const { adjusted } = cellOf(point);
    return adjusted.trim() !== "" && parseAdjusted(adjusted, point.maxPoints) === null;
  };

  const effectivePoints = (point: EnrollmentDecisionPoint) =>
    parseAdjusted(cellOf(point).adjusted, point.maxPoints) ?? point.actualPoints;

  const updateCell = (point: EnrollmentDecisionPoint, patch: Partial<DraftCell>) => {
    if (!draft || !decisionPoints) return;

    const key = cellKey(point.followCourseId, point.schoolPeriodId);
    const next = new Map(draft);
    next.set(key, { ...(next.get(key) ?? { adjusted: "", reason: "" }), ...patch });
    setDraft(next);

    const adjustments = decisionPoints.flatMap((p) => {
      const cell = next.get(cellKey(p.followCourseId, p.schoolPeriodId));
      const adjusted = cell ? parseAdjusted(cell.adjusted, p.maxPoints) : null;
      return adjusted === null || !cell
        ? []
        : [
            {
              followCourseId: p.followCourseId,
              schoolPeriodId: p.schoolPeriodId,
              adjustedPoints: adjusted,
              reason: cell.reason.trim() || null,
            },
          ];
    });

    onChange(sameAdjustments(adjustments, savedAdjustments(decisionPoints)) ? null : adjustments);
  };

  const toggleCourse = (followCourseId: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(followCourseId)) next.delete(followCourseId);
      else next.add(followCourseId);
      return next;
    });
  };

  // Points groupés par cours (déjà triés par cours puis par période)
  const groups = points.reduce<
    { followCourseId: string; courseName: string | null; points: EnrollmentDecisionPoint[] }[]
  >((acc, point) => {
    const last = acc.length > 0 ? acc[acc.length - 1] : null;
    if (last?.followCourseId === point.followCourseId) last.points.push(point);
    else acc.push({ followCourseId: point.followCourseId, courseName: point.courseName, points: [point] });
    return acc;
  }, []);

  const failedCourseIds = new Set(row.failedCourses.map((course) => course.followCourseId));

  const totals = {
    max: points.reduce((sum, point) => sum + point.maxPoints, 0),
    actual: points.reduce((sum, point) => sum + point.actualPoints, 0),
    effective: points.reduce((sum, point) => sum + effectivePoints(point), 0),
  };
  const invalidCount = points.filter(isInvalid).length;

  if (decisionPointsIsLoading || (decisionPoints && draft === null)) {
    return (
      <View className="items-center py-10">
        <ActivityIndicator />
      </View>
    );
  }

  if (decisionPointsError) {
    return (
      <View className="items-center py-10 gap-3">
        <Text className="text-sm text-muted-foreground text-center">
          {"Impossible de charger les points de l'élève."}
        </Text>
        <Pressable
          onPress={() => void loadDecisionPoints()}
          className="h-10 px-4 rounded-lg bg-foreground items-center justify-center"
        >
          <Text className="text-background font-medium">Réessayer</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="gap-2 pt-3">
      <Text className="text-xs text-muted-foreground">
        Le point ajusté remplace le point obtenu sur le bulletin, dans les totaux et le classement. Laissez vide pour garder
        le point obtenu.
        {session === 2 ? " En 2ème session, les ajustements de la 1ère session sont repris et restent modifiables." : ""}
      </Text>

      {!readOnly && !hasDecision && (
        <Text className="text-xs text-amber-700 dark:text-amber-300">
          {"Choisissez d'abord une décision pour cet élève : les ajustements sont enregistrés avec elle."}
        </Text>
      )}

      <View className="rounded-lg bg-muted px-3 py-2">
        <Text className="text-xs text-foreground">
          Total obtenu : {formatNumber(totals.actual)} / {formatNumber(totals.max)} (
          {percentageOf(totals.actual, totals.max)})
        </Text>
        {totals.effective !== totals.actual && (
          <Text className="text-xs font-semibold text-foreground">
            Retenu : {formatNumber(totals.effective)} ({percentageOf(totals.effective, totals.max)})
          </Text>
        )}
        {invalidCount > 0 && (
          <Text className="text-xs text-red-500">{invalidCount} valeur(s) hors limites ignorée(s)</Text>
        )}
      </View>

      {groups.length === 0 && (
        <Text className="text-sm text-faint text-center py-6">Aucun point pour cet élève.</Text>
      )}

      {groups.length > 0 && (
        <View className="flex-row justify-end gap-4">
          <Pressable onPress={() => setExpanded(new Set(groups.map((group) => group.followCourseId)))} hitSlop={6}>
            <Text className="text-xs text-primary">Tout déplier</Text>
          </Pressable>
          <Pressable onPress={() => setExpanded(new Set())} hitSlop={6}>
            <Text className="text-xs text-primary">Tout replier</Text>
          </Pressable>
        </View>
      )}

      {groups.map((group) => {
        const isOpen = expanded.has(group.followCourseId);
        const max = group.points.reduce((sum, p) => sum + p.maxPoints, 0);
        const actual = group.points.reduce((sum, p) => sum + p.actualPoints, 0);
        const effective = group.points.reduce((sum, p) => sum + effectivePoints(p), 0);
        const adjustedCount = group.points.filter((p) => cellOf(p).adjusted.trim() !== "" && !isInvalid(p)).length;
        const groupInvalid = group.points.some(isInvalid);
        const failed = failedCourseIds.has(group.followCourseId);

        return (
          <View key={group.followCourseId} className="rounded-lg border border-border bg-card">
            <Pressable onPress={() => toggleCourse(group.followCourseId)} className="flex-row items-center gap-2 px-3 py-2.5">
              <Ionicons name={isOpen ? "chevron-down" : "chevron-forward"} size={16} color={colors.faint} />
              <View className="flex-1">
                <Text
                  className={`text-sm font-medium ${failed ? "text-red-600 dark:text-red-300" : "text-foreground"}`}
                >
                  {group.courseName ?? "Cours"}
                </Text>
                <Text className="text-xs text-muted-foreground">
                  {formatNumber(actual)} / {formatNumber(max)} ({percentageOf(actual, max)})
                  {effective !== actual ? ` → retenu ${formatNumber(effective)} (${percentageOf(effective, max)})` : ""}
                </Text>
                {(adjustedCount > 0 || groupInvalid) && (
                  <Text className="text-xs">
                    {adjustedCount > 0 && (
                      <Text className="text-amber-700 dark:text-amber-300">{adjustedCount} ajusté(s)</Text>
                    )}
                    {adjustedCount > 0 && groupInvalid ? " · " : ""}
                    {groupInvalid && <Text className="text-red-500">valeur hors limites</Text>}
                  </Text>
                )}
              </View>
            </Pressable>

            {isOpen &&
              group.points.map((point) => {
                const cell = cellOf(point);
                const invalid = isInvalid(point);
                const adjusted = cell.adjusted.trim() !== "" && !invalid;

                return (
                  <View
                    key={cellKey(point.followCourseId, point.schoolPeriodId)}
                    className="border-t border-divider px-3 py-2 gap-1.5"
                  >
                    <View className="flex-row items-center gap-2">
                      <Text className="flex-1 text-sm text-foreground">{point.periodName ?? "—"}</Text>
                      <Text
                        className={`text-sm ${adjusted ? "line-through text-faint" : "text-foreground"}`}
                      >
                        {formatNumber(point.actualPoints)}
                      </Text>
                      <Text className="text-sm text-muted-foreground">/ {formatNumber(point.maxPoints)}</Text>
                      <TextInput
                        value={cell.adjusted}
                        onChangeText={(text) => updateCell(point, { adjusted: text })}
                        editable={editable}
                        keyboardType="decimal-pad"
                        placeholder="Ajusté"
                        placeholderTextColor={colors.faint}
                        textAlignVertical="center"
                        className={`w-20 h-11 border rounded-lg px-2 py-0 bg-background text-foreground ${
                          invalid ? "border-red-500" : "border-input"
                        } ${editable ? "" : "opacity-60"}`}
                      />
                    </View>
                    {invalid && (
                      <Text className="text-xs text-red-500 text-right">
                        Entre 0 et {formatNumber(point.maxPoints)}
                      </Text>
                    )}
                    {cell.adjusted.trim() !== "" && (
                      <TextInput
                        value={cell.reason}
                        onChangeText={(reason) => updateCell(point, { reason })}
                        editable={editable}
                        maxLength={REASON_MAX_LENGTH}
                        placeholder="Motif (optionnel)"
                        placeholderTextColor={colors.faint}
                        textAlignVertical="center"
                        className="h-11 border border-input rounded-lg px-2 py-0 bg-background text-foreground"
                      />
                    )}
                  </View>
                );
              })}
          </View>
        );
      })}
    </View>
  );
}
