import { BentoTile } from "@/components/atoms/bento-tile";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { id } from "@/content/id";
import { formatDateTime } from "@/lib/format";
import type { ErrorReport } from "@/lib/monitoring/types";

import { ClearErrorsButton } from "./clear-errors-button";

/**
 * Newest application errors (server and browsers). The digest links a browser error to the
 * matching line in the server log (Vercel > Logs).
 */
export function ErrorLog({ errors, logging }: { errors: ErrorReport[]; logging: boolean }) {
  const copy = id.system.errors;
  return (
    <BentoTile as="section" aria-labelledby="galat-terbaru" className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 id="galat-terbaru" className="text-xl font-semibold">
            {copy.title}
          </h2>
          <p className="text-muted-foreground">{copy.body}</p>
        </div>
        {errors.length > 0 ? <ClearErrorsButton /> : null}
      </div>
      {logging ? null : (
        <p className="rounded-lg bg-warning-soft p-3 text-sm text-warning">{copy.noKey}</p>
      )}
      {errors.length === 0 ? (
        <div className="rounded-xl bg-muted p-4">
          <p className="font-semibold">{copy.emptyTitle}</p>
          <p className="text-muted-foreground">{copy.emptyBody}</p>
        </div>
      ) : (
        <div className="rounded-xl border">
          <Table scrollLabel={copy.tableLabel}>
            <TableHeader>
              <TableRow>
                <TableHead>{copy.time}</TableHead>
                <TableHead>{copy.where}</TableHead>
                <TableHead>{copy.message}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {errors.map((error, index) => (
                <TableRow key={`${error.at}-${index}`}>
                  <TableCell className="align-top whitespace-nowrap tabular-nums">
                    {formatDateTime(error.at)}
                  </TableCell>
                  <TableCell className="space-y-1 align-top">
                    <Badge variant={error.source === "browser" ? "secondary" : "outline"}>
                      {copy.source[error.source]}
                    </Badge>
                    <p className="font-mono text-sm break-all">
                      {error.path ?? id.common.notAvailable}
                    </p>
                    {error.context ? (
                      <p className="text-sm text-muted-foreground">{error.context}</p>
                    ) : null}
                  </TableCell>
                  <TableCell className="align-top">
                    <p className="min-w-56 font-mono text-sm break-words">{error.message}</p>
                    {error.digest ? (
                      <p className="text-sm text-muted-foreground">{copy.digest(error.digest)}</p>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </BentoTile>
  );
}
