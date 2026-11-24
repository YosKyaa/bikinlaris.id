import { BentoTile } from "@/components/atoms/bento-tile";
import { EmptyState } from "@/components/molecules/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import * as id from "@/content/id";
import type { TextEditHistoryItem } from "@/lib/diagnosis/edits";
import { formatDateTime } from "@/lib/format";

/** "Riwayat": every text change, newest first, with the version number it created. */
export function TextHistory({ items }: { items: TextEditHistoryItem[] }) {
  const copy = id.questionBank;
  const headers = copy.history.headers;
  return (
    <BentoTile as="section" className="space-y-3">
      <h2 className="text-lg font-semibold">{copy.history.title}</h2>
      <p className="text-muted-foreground">{copy.history.body}</p>
      {items.length === 0 ? (
        <EmptyState title={copy.history.emptyTitle} body={copy.history.empty} />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{headers.version}</TableHead>
              <TableHead>{headers.at}</TableHead>
              <TableHead>{headers.by}</TableHead>
              <TableHead>{headers.what}</TableHead>
              <TableHead>{headers.change}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id} className="align-top">
                <TableCell className="tabular-nums">{item.id}</TableCell>
                <TableCell className="whitespace-nowrap">{formatDateTime(item.at)}</TableCell>
                <TableCell>{item.byName ?? copy.history.unknown}</TableCell>
                <TableCell className="whitespace-normal">
                  {copy.history.what(
                    copy.kinds[item.kind],
                    item.key,
                    copy.fields[item.field],
                    copy.variants[item.variant],
                  )}
                </TableCell>
                <TableCell className="min-w-64 space-y-1 whitespace-normal">
                  <p className="text-muted-foreground line-through">
                    {item.oldValue ?? copy.history.original}
                  </p>
                  <p>{item.newValue ?? copy.history.original}</p>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </BentoTile>
  );
}
