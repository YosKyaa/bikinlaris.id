import type { Instrumentation } from "next";

/**
 * Uncaught server errors (pages, actions, route handlers, proxy) go to the admin's error log
 * (Sistem page) and the server log. Errors that the code catches itself are reported where
 * they are caught (lib/monitoring/report.ts).
 */
export const onRequestError: Instrumentation.onRequestError = async (error, request, context) => {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { errorMessage, reportError } = await import("@/lib/monitoring/report");
  const digest =
    typeof error === "object" && error !== null && "digest" in error ? String(error.digest) : null;
  await reportError({
    source: "server",
    message: errorMessage(error),
    digest,
    path: request.path,
    context: context.routeType,
  });
};
