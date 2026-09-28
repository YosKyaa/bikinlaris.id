import { id } from "@/content/id";

export const CHECKLIST_WEEKS = 2;

/** Printable 14-day tick table (2 weeks × 7 days) for an SOP's daily tasks. */
export function ChecklistGrid({ rows }: { rows: { id: string; label: string }[] }) {
  if (rows.length === 0) return null;
  const { days, dayNames } = id.pack.sop;
  return (
    <div>
      <h4 className="mb-2 text-sm font-semibold text-muted-foreground">
        {id.pack.sop.checklistTitle}
      </h4>
      <div className="-mx-1 overflow-x-auto px-1">
        {Array.from({ length: CHECKLIST_WEEKS }, (_, week) => (
          <table key={week} className="mb-3 w-full min-w-[18rem] border-collapse text-sm">
            <caption className="sr-only">
              {id.pack.sop.checklistTitle}, {id.pack.sop.week(week + 1)}
            </caption>
            <thead>
              <tr>
                <th scope="col" className="py-1 pr-2 text-left font-semibold text-muted-foreground">
                  {id.pack.sop.week(week + 1)}
                </th>
                {days.map((day, index) => (
                  <th
                    key={day}
                    scope="col"
                    className="w-8 py-1 text-center font-semibold text-muted-foreground"
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
                <tr key={row.id} className="border-t">
                  <th scope="row" className="py-1.5 pr-2 text-left font-normal">
                    {row.label}
                  </th>
                  {days.map((day) => (
                    <td key={day} className="py-1.5 text-center">
                      <span
                        aria-hidden
                        className="inline-block size-5 rounded border-2 border-border align-middle print:border-black/40"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ))}
      </div>
    </div>
  );
}
