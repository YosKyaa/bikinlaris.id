import { Fragment } from "react";

import { SelectGroup, SelectItem, SelectLabel, SelectSeparator } from "@/components/ui/select";

interface ProfileSelectItemsProps {
  /** Option values per group, in order (e.g. LOCATION_GROUPS). */
  groups: Record<string, readonly string[]>;
  labels: Record<string, string>;
  /** Group headings; a group without a heading (e.g. "Lainnya") gets only a separator. */
  groupLabels?: Record<string, string>;
}

/** Options of a profile dropdown, grouped with headings so long lists stay easy to scan. */
export function ProfileSelectItems({ groups, labels, groupLabels }: ProfileSelectItemsProps) {
  return Object.entries(groups).map(([group, values], index) => {
    const heading = groupLabels?.[group];
    return (
      <Fragment key={group}>
        {index > 0 ? <SelectSeparator /> : null}
        <SelectGroup>
          {heading ? <SelectLabel>{heading}</SelectLabel> : null}
          {values.map((value) => (
            <SelectItem key={value} value={value}>
              {labels[value]}
            </SelectItem>
          ))}
        </SelectGroup>
      </Fragment>
    );
  });
}
