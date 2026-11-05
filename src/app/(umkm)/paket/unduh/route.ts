import { after, NextResponse, type NextRequest } from "next/server";

import * as id from "@/content/id";
import { NOTICE_PARAM, PDF_FAILED_NOTICE, ROUTES } from "@/lib/auth/constants";
import { data } from "@/lib/data";
import { getOwnerState, joinHref } from "@/lib/data/owner-session";
import { errorMessage, reportError } from "@/lib/monitoring/report";
import { renderPackPdf } from "@/lib/pdf/pack-document";
import { regencyName } from "@/lib/wilayah";

const redirectTo = (path: string, request: NextRequest) =>
  NextResponse.redirect(new URL(path, request.url));

/**
 * "Unduh PDF": the owner's pack as a file, made on the server. A plain link (no browser print
 * dialog), so it works the same on every Android phone. Logged as `unduh_pdf`.
 */
export async function GET(request: NextRequest) {
  const state = await getOwnerState();
  if (!state) return redirectTo(joinHref("tautan"), request);
  const { business, pack } = state;
  if (pack?.status !== "siap") return redirectTo(ROUTES.pack, request);

  let pdf: Buffer;
  try {
    pdf = await renderPackPdf({ business, pack, locationLabel: regencyName(business.location) });
  } catch (error) {
    await reportError({
      source: "server",
      message: errorMessage(error),
      digest: null,
      path: ROUTES.packPdf,
      context: "pdf",
    });
    return redirectTo(`${ROUTES.pack}?${NOTICE_PARAM}=${PDF_FAILED_NOTICE}`, request);
  }

  // Passive research log, written after the file has gone out.
  after(() =>
    data()
      .owner.log(state.token, "unduh_pdf", null)
      .catch(() => undefined),
  );
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${id.pack.pdf.fileName(business.code)}"`,
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
