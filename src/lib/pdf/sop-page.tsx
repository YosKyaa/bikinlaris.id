import { Text, View } from "@react-pdf/renderer";
import { Fragment } from "react";

import type { Problem, Sop, Task } from "@/content/diagnosis.types";
import * as id from "@/content/id";

import { styles } from "./styles";

/** Two weeks of seven days, like the printed tick table (molecules/checklist-grid.tsx). */
const WEEKS = 2;

export interface PdfSop {
  sop: Sop;
  problems: Problem[];
  whyText: string | null;
  taskTexts: Record<string, string> | null;
}

function TaskGroup({
  title,
  hint,
  tasks,
  texts,
}: {
  title: string;
  hint: string;
  tasks: Task[];
  texts: PdfSop["taskTexts"];
}) {
  if (tasks.length === 0) return null;
  return (
    <View style={styles.section} wrap={false}>
      <Text style={styles.h3}>{title}</Text>
      <Text style={[styles.small, { marginBottom: 4 }]}>{hint}</Text>
      {tasks.map((task) => (
        <View key={task.id} style={styles.task}>
          <View style={styles.box} />
          <Text style={styles.grow}>
            {texts?.[task.id] ?? task.text}
            {task.kind === "siapkan" ? (
              <Text style={styles.muted}> · {id.pack.pdf.minutes(task.minutes)}</Text>
            ) : null}
            {task.kind !== "siapkan" && task.onlyWhenPresent ? (
              <Text style={styles.muted}> · {id.pack.sop.onlyWhenPresent}</Text>
            ) : null}
          </Text>
        </View>
      ))}
    </View>
  );
}

/** The 14-day tick table for the daily tasks: one block per week, a row of boxes per task. */
function TickTable({ rows }: { rows: { id: string; label: string }[] }) {
  if (rows.length === 0) return null;
  const { days, week, checklistTitle } = id.pack.sop;
  return (
    <View style={styles.section}>
      <Text style={styles.h3}>{checklistTitle}</Text>
      {Array.from({ length: WEEKS }, (_, index) => (
        <View key={index} style={styles.week} wrap={false}>
          <View style={styles.gridRow}>
            <Text style={[styles.gridLabel, { fontWeight: 600 }]}>{week(index + 1)}</Text>
            {days.map((day) => (
              <Text key={day} style={styles.gridDay}>
                {day}
              </Text>
            ))}
          </View>
          {rows.map((row) => (
            <View key={row.id} style={[styles.gridRow, styles.gridDivider]}>
              <Text style={styles.gridLabel}>{row.label}</Text>
              {days.map((day) => (
                <View key={day} style={styles.gridCell}>
                  <View style={styles.gridBox} />
                </View>
              ))}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

/** One SOP: number, title, goal, why (from the answers), tasks, then the tick table. */
export function SopPage({
  item,
  number,
  businessName,
}: {
  item: PdfSop;
  number: number;
  businessName: string;
}) {
  const { sop, problems, whyText, taskTexts } = item;
  const copy = id.pack.sop;
  const byKind = (kind: Task["kind"]) => sop.tasks.filter((t) => t.kind === kind);
  const why = whyText ?? problems.map((p) => p.rootCause).join(" ");

  return (
    <Fragment>
      <View wrap={false}>
        <Text style={styles.sopNumber}>{id.pack.sops.number(number)}</Text>
        <Text style={styles.sopTitle}>{sop.title}</Text>
        <Text style={styles.sopGoal}>{sop.goal}</Text>
      </View>
      {problems.length > 0 ? (
        <View style={styles.tileMuted} wrap={false}>
          <Text style={styles.h3}>{copy.why(businessName)}</Text>
          <Text>
            {copy.fromAnswers}{" "}
            <Text style={{ fontWeight: 600 }}>
              {problems.map((p) => p.title.toLowerCase()).join(", ")}
            </Text>
            . {why}
          </Text>
        </View>
      ) : null}
      <TaskGroup
        title={copy.setup}
        hint={copy.hints.siapkan}
        tasks={byKind("siapkan")}
        texts={taskTexts}
      />
      <TaskGroup
        title={copy.daily}
        hint={copy.hints.harian}
        tasks={byKind("harian")}
        texts={taskTexts}
      />
      <TaskGroup
        title={copy.weekly}
        hint={copy.hints.mingguan}
        tasks={byKind("mingguan")}
        texts={taskTexts}
      />
      <TickTable
        rows={byKind("harian").map((t) => ({ id: t.id, label: taskTexts?.[t.id] ?? t.text }))}
      />
    </Fragment>
  );
}
