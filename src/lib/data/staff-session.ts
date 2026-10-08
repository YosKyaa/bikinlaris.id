import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";

import { ROUTES } from "@/lib/auth/constants";

import { data } from "./index";
import type { StaffUser } from "./types";

/** Signed-in research team member for the current request, or null. */
export const getStaffUser = cache(async (): Promise<StaffUser | null> =>
  data().staff.currentUser(),
);

/** For researcher pages: enumerator or admin, otherwise to the team login. */
export async function requireStaffPage(): Promise<StaffUser> {
  const user = await getStaffUser();
  if (!user) redirect(ROUTES.login);
  return user;
}

export async function requireAdminPage(): Promise<StaffUser> {
  const user = await requireStaffPage();
  if (user.role !== "admin") redirect(ROUTES.researcher);
  return user;
}
