import { Fragment } from "react";

import { id } from "@/content/id";

export const CHECKLIST_WEEKS = 2;

/**
 * Printable 14-day tick table (2 weeks × 7 days) for an SOP's daily tasks.
 * Each task label gets its own full-width row so it stays readable at 360px.
 */
export function ChecklistGrid({ rows }: { rows: { id: string; label: string }[] }) {
  if (rows.length === 0) return null;
  const { days, dayNames } = id.pack.sop;
  return (
    <div>
      <h4 className="mb-2 text-sm font-semibold text-muted-foreground">
        {id.pack.sop.checklistTitle}
      </h4>
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: CHECKLIST_WEEKS }, (_, week) => (
          <table key={week} className="w-full table-fixed border-collapse text-sm">
            <caption className="py-1 text-left font-semibold text-muted-foreground">
              {id.pack.sop.week(week + 1)}
            </caption>
            <thead>
              <tr>
                {days.map((day, index) => (
                  <th
                    key={day}
                    scope="col"
                    className="pb-1 text-center font-medium text-muted-foreground"
                  >
                    <abbr title={dayNames[index]} className="no-underline">
                      {day}
                    </abbr>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <Fragment key={row.id}>
                  <tr className="border-t">
                    <th
                      scope="colgroup"
                      colSpan={days.length}
                      className="pt-2 text-left font-normal"
                    >
                      {row.label}
                    </th>
                  </tr>
                  <tr>
                    {days.map((day) => (
                      <td key={day} className="py-1 text-center">
                        <span
                          aria-hidden
                          className="inline-block size-6 rounded border-2 border-border align-middle print:border-black/40"
                        />
                      </td>
                    ))}
                  </tr>
                </Fragment>
              ))}
            </tbody>
          </table>
        ))}
      </div>
    </div>
  );
}
