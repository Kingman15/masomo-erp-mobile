import { formatNumber } from "@/lib/format";
import { useThemeColors } from "@/hooks/use-theme-colors";
import type {
  OfficialReportCardDetailsDTO,
  ReportCardCourseRowDTO,
  ReportCardDecisionValue,
  ReportCardDomainGroupDTO,
  ReportCardMaximaCellDTO,
  ReportCardTotalsDTO,
  StudentReportCardDTO,
} from "@/utils/types/objects/StudentReportCardDTO";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState, type ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

const COURSE_PERIOD_TYPE = "period";

const DECISION_TONES: Record<
  ReportCardDecisionValue,
  { container: string; text: string }
> = {
  passes: {
    container: "bg-green-100 dark:bg-green-900/40",
    text: "text-green-700 dark:text-green-300",
  },
  make_up_exam: {
    container: "bg-amber-100 dark:bg-amber-900/40",
    text: "text-amber-700 dark:text-amber-300",
  },
  repeats: {
    container: "bg-red-100 dark:bg-red-900/40",
    text: "text-red-700 dark:text-red-300",
  },
  failed: {
    container: "bg-red-100 dark:bg-red-900/40",
    text: "text-red-700 dark:text-red-300",
  },
};

// Maxima d'un cours, quel que soit le layout (groupe de maxima ou barème propre au cours en layout « domaine »).
type CourseMaxima = {
  perPeriod: Record<string, ReportCardMaximaCellDTO>;
  subdivisions: Record<string, string>;
  grandTotal: string;
};

type CourseSection = {
  key: string;
  title: string | null;
  depth: number;
  rows: { course: ReportCardCourseRowDTO; maxima: CourseMaxima | null }[];
};

function toCourseSections(card: StudentReportCardDTO): CourseSection[] {
  if (card.layout === "maxima") {
    return card.maximaGroups.map((group, index) => ({
      key: `maxima-${index}`,
      title:
        group.maxExam !== null && !group.withoutExam
          ? `Maxima ${formatNumber(group.maxPeriod)} · examen ${formatNumber(group.maxExam)}`
          : `Maxima ${formatNumber(group.maxPeriod)}`,
      depth: 0,
      rows: group.courses.map((course) => ({
        course,
        maxima: {
          perPeriod: group.perPeriodMaxima,
          subdivisions: group.subdivisionMaxima,
          grandTotal: group.grandTotalMaxima,
        },
      })),
    }));
  }

  const sections: CourseSection[] = [];
  const walk = (group: ReportCardDomainGroupDTO, path: string) => {
    sections.push({
      key: path,
      title: group.name,
      depth: group.depth,
      rows: group.courses.map((course) => ({ course, maxima: course.maxima })),
    });
    group.children.forEach((child, index) => walk(child, `${path}-${index}`));
  };
  card.domainGroups.forEach((group, index) => walk(group, `domain-${index}`));

  return sections.filter(
    (section) => section.rows.length > 0 || section.title !== null,
  );
}

function percentageOf(points: string, max: string | null | undefined) {
  const maxValue = Number(max);
  if (!max || !Number.isFinite(maxValue) || maxValue <= 0) return null;
  return (Number(points) / maxValue) * 100;
}

function formatRank(totals: ReportCardTotalsDTO | null | undefined) {
  if (!totals || totals.rank === null) return null;
  return `${totals.rank}${totals.rank === 1 ? "er" : "e"} / ${totals.totalStudents}`;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="gap-2">
      <Text className="px-1 text-xs font-semibold uppercase text-muted-foreground">
        {title}
      </Text>
      {children}
    </View>
  );
}

function Card({ children }: { children: ReactNode }) {
  return (
    <View className="rounded-lg border border-border bg-card p-3 gap-2">
      {children}
    </View>
  );
}

function InfoLine({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <View className="flex-row justify-between gap-3">
      <Text className="text-sm text-muted-foreground">{label}</Text>
      <Text className="flex-1 text-right text-sm text-foreground">{value}</Text>
    </View>
  );
}

function SummaryCard({ card }: { card: StudentReportCardDTO }) {
  const decision = card.official?.decision ?? null;
  const rank = formatRank(card.grandTotal);

  return (
    <Card>
      <View className="flex-row items-end justify-between">
        <View>
          <Text className="text-xs text-muted-foreground">Total annuel</Text>
          <Text className="text-2xl font-semibold text-foreground">
            {formatNumber(card.grandTotal.percentage)}%
          </Text>
          <Text className="text-sm text-muted-foreground">
            {formatNumber(card.grandTotal.points)} /{" "}
            {formatNumber(card.generalMaxima.grand)}
          </Text>
        </View>
        {rank && (
          <View className="items-end">
            <Text className="text-xs text-muted-foreground">Place</Text>
            <Text className="text-lg font-semibold text-foreground">{rank}</Text>
          </View>
        )}
      </View>

      <View className="border-t border-divider pt-2 gap-1">
        <Text className="text-xs text-muted-foreground">
          Décision du conseil de classe
        </Text>
        {decision ? (
          <>
            <View
              className={`self-start rounded-full px-2.5 py-1 ${DECISION_TONES[decision.value].container}`}
            >
              <Text
                className={`text-xs font-semibold ${DECISION_TONES[decision.value].text}`}
              >
                {decision.label}
              </Text>
            </View>
            {decision.reorientationNote && (
              <Text className="text-sm text-foreground">
                Réorientation : {decision.reorientationNote}
              </Text>
            )}
          </>
        ) : (
          <Text className="text-sm text-faint">Pas encore délibéré</Text>
        )}
      </View>
    </Card>
  );
}

function MakeUpCard({
  card,
  official,
}: {
  card: StudentReportCardDTO;
  official: OfficialReportCardDetailsDTO;
}) {
  const names = official.decision?.makeUpCourseNames ?? [];
  const results = toCourseSections(card)
    .flatMap((section) => section.rows)
    .filter(
      ({ course }) =>
        course.followCourseId !== null &&
        course.followCourseId in official.makeUpPercentageByFollowCourseId,
    );

  if (names.length === 0 && results.length === 0) return null;

  return (
    <Section title="Repêchage">
      <Card>
        {results.length > 0
          ? results.map(({ course }) => {
              const percentage =
                official.makeUpPercentageByFollowCourseId[course.followCourseId!];
              return (
                <View
                  key={course.followCourseId}
                  className="flex-row justify-between gap-3"
                >
                  <Text className="flex-1 text-sm text-foreground">
                    {course.courseName}
                  </Text>
                  <Text className="text-sm font-medium text-foreground">
                    {percentage ? `${formatNumber(percentage)}%` : "À passer"}
                  </Text>
                </View>
              );
            })
          : names.map((name) => (
              <Text key={name} className="text-sm text-foreground">
                {name}
              </Text>
            ))}
      </Card>
    </Section>
  );
}

function PeriodsSection({ card }: { card: StudentReportCardDTO }) {
  const appraisals = card.official?.appraisalsByPeriodId ?? {};

  return (
    <Section title="Résultats par période">
      {card.subdivisions.map((subdivision) => (
        <Card key={subdivision.id}>
          {subdivision.periods.map((period) => {
            const appraisal =
              period.type === COURSE_PERIOD_TYPE ? appraisals[period.id] : undefined;
            const max = card.generalMaxima.periods[period.id];
            const rank = formatRank(period.total);

            return (
              <View key={period.id} className="gap-0.5">
                <View className="flex-row items-center gap-2">
                  <Text numberOfLines={1} className="flex-1 text-sm font-medium text-foreground">
                    {period.label}
                  </Text>
                  <Text className="text-right text-sm text-muted-foreground">
                    {period.total
                      ? `${formatNumber(period.total.points)} / ${formatNumber(max)}`
                      : "—"}
                  </Text>
                  <Text className="w-16 text-right text-sm font-semibold text-foreground">
                    {period.total ? `${formatNumber(period.total.percentage)}%` : ""}
                  </Text>
                  <Text className="w-14 text-right text-xs text-muted-foreground">
                    {rank ?? ""}
                  </Text>
                </View>
                {appraisal && (appraisal.application || appraisal.conduct) && (
                  <Text className="text-xs text-faint">
                    Application {appraisal.application ?? "—"} · Conduite{" "}
                    {appraisal.conduct ?? "—"}
                  </Text>
                )}
              </View>
            );
          })}

          <View className="flex-row items-center gap-2 border-t border-divider pt-2">
            <Text numberOfLines={1} className="flex-1 text-sm font-semibold text-foreground">
              {subdivision.label}
            </Text>
            <Text className="text-right text-sm text-muted-foreground">
              {formatNumber(subdivision.total.points)} /{" "}
              {formatNumber(card.generalMaxima.subdivisions[subdivision.id])}
            </Text>
            <Text className="w-16 text-right text-sm font-semibold text-foreground">
              {formatNumber(subdivision.total.percentage)}%
            </Text>
            <Text className="w-14 text-right text-xs text-muted-foreground">
              {formatRank(subdivision.total) ?? ""}
            </Text>
          </View>
        </Card>
      ))}
    </Section>
  );
}

function CourseRow({
  card,
  course,
  maxima,
  makeUpPercentage,
  isLast,
}: {
  card: StudentReportCardDTO;
  course: ReportCardCourseRowDTO;
  maxima: CourseMaxima | null;
  isLast: boolean;
  // undefined = pas de repêchage pour ce cours ; null = examen pas encore passé
  makeUpPercentage: string | null | undefined;
}) {
  const colors = useThemeColors();
  const [open, setOpen] = useState(false);
  const percentage = percentageOf(course.grandTotal, maxima?.grandTotal);

  return (
    <View className={isLast ? "" : "border-b border-divider"}>
      <Pressable
        onPress={() => setOpen((value) => !value)}
        className="flex-row items-center gap-2 py-2.5"
      >
        <View className="flex-1 gap-0.5">
          <Text className="text-sm text-foreground">{course.courseName}</Text>
          {makeUpPercentage !== undefined && (
            <Text className="text-xs text-amber-700 dark:text-amber-300">
              Repêchage :{" "}
              {makeUpPercentage ? `${formatNumber(makeUpPercentage)}%` : "à passer"}
            </Text>
          )}
        </View>
        <View className="items-end">
          <Text className="text-sm font-medium text-foreground">
            {formatNumber(course.grandTotal)}
            {maxima ? ` / ${formatNumber(maxima.grandTotal)}` : ""}
          </Text>
          {percentage !== null && (
            <Text className="text-xs text-muted-foreground">
              {formatNumber(percentage)}%
            </Text>
          )}
        </View>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={16}
          color={colors.faint}
        />
      </Pressable>

      {open && (
        <View className="gap-1.5 pb-3">
          {card.subdivisions.map((subdivision) => (
            <View key={subdivision.id} className="rounded-md bg-muted px-2.5 py-2 gap-1">
              <View className="flex-row flex-wrap gap-x-4 gap-y-1">
                {subdivision.periods.map((period) => {
                  const cell = course.cellsByPeriodId[period.id];
                  const max = maxima?.perPeriod[period.id];
                  const blacked = cell?.isBlacked || max?.isBlacked;
                  return (
                    <Text key={period.id} className="text-xs text-foreground">
                      <Text className="text-muted-foreground">{period.label} </Text>
                      {blacked || !cell
                        ? "—"
                        : `${formatNumber(cell.points)}${max?.value ? `/${formatNumber(max.value)}` : ""}`}
                    </Text>
                  );
                })}
              </View>
              <Text className="text-xs font-medium text-foreground">
                {subdivision.label} : {formatNumber(course.subdivisionTotals[subdivision.id])}
                {maxima?.subdivisions[subdivision.id]
                  ? ` / ${formatNumber(maxima.subdivisions[subdivision.id])}`
                  : ""}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function CoursesSection({ card }: { card: StudentReportCardDTO }) {
  const sections = toCourseSections(card);
  const makeUps = card.official?.hasMakeUpExams
    ? card.official.makeUpPercentageByFollowCourseId
    : {};

  return (
    <Section title="Cours">
      {sections.map((section) => (
        <View key={section.key} style={{ marginLeft: section.depth * 12 }}>
          {section.title && (
            <Text className="px-1 pb-1 text-sm font-semibold text-foreground">
              {section.title}
            </Text>
          )}
          {section.rows.length > 0 && (
            <View className="rounded-lg border border-border bg-card px-3">
              {section.rows.map(({ course, maxima }, index) => (
                <CourseRow
                  key={course.followCourseId ?? `${section.key}-${index}`}
                  card={card}
                  course={course}
                  maxima={maxima}
                  isLast={index === section.rows.length - 1}
                  makeUpPercentage={
                    course.followCourseId !== null &&
                    course.followCourseId in makeUps
                      ? (makeUps[course.followCourseId] ?? null)
                      : undefined
                  }
                />
              ))}
            </View>
          )}
        </View>
      ))}
    </Section>
  );
}

function NationalExamCard({
  exam,
}: {
  exam: NonNullable<OfficialReportCardDetailsDTO["nationalExam"]>;
}) {
  return (
    <Section title={exam.shortName ?? exam.name}>
      <Card>
        <InfoLine label="Résultat" value={exam.resultLabel} />
        <InfoLine
          label="Pourcentage"
          value={exam.percentage ? `${formatNumber(exam.percentage)}%` : null}
        />
        <InfoLine label="Centre" value={exam.centerCode} />
        <InfoLine label="N° candidat" value={exam.candidateNumber} />
        {!exam.resultLabel && !exam.percentage && (
          <Text className="text-sm text-faint">Résultat pas encore publié</Text>
        )}
      </Card>
    </Section>
  );
}

function IdentityCard({ card }: { card: StudentReportCardDTO }) {
  const student = card.official?.student;
  const birth = [student?.birthPlace, student?.birthDate]
    .filter(Boolean)
    .join(", le ");

  return (
    <Section title="Élève">
      <Card>
        <InfoLine label="N° d'inscription" value={card.enrollmentNumber} />
        <InfoLine label="N° permanent" value={student?.permanentNumber ?? null} />
        <InfoLine
          label="Sexe"
          value={
            student?.gender === "M"
              ? "Masculin"
              : student?.gender === "F"
                ? "Féminin"
                : null
          }
        />
        <InfoLine label="Né(e) à" value={birth || null} />
      </Card>
    </Section>
  );
}

// Vue de consultation du bulletin : synthèse en haut, puis le détail par période et par cours.
// Même contenu que l'aperçu web (repêchage, appréciations, décision, épreuve nationale), sans la mise en page imprimée.
export function ReportCardView({ card }: { card: StudentReportCardDTO }) {
  const official = card.official;

  return (
    <View className="gap-4">
      <View className="px-1">
        <Text className="text-lg font-semibold text-foreground">
          {card.studentName}
        </Text>
        <Text className="text-sm text-muted-foreground">
          {card.schoolClassTitle} · {card.schoolYearName}
        </Text>
      </View>

      <SummaryCard card={card} />
      {official?.hasMakeUpExams && <MakeUpCard card={card} official={official} />}
      {official?.nationalExam && <NationalExamCard exam={official.nationalExam} />}
      <PeriodsSection card={card} />
      <CoursesSection card={card} />
      <IdentityCard card={card} />
    </View>
  );
}
