"use client";

import Link from "next/link";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { id } from "@/content/id";
import { NOTICE_PARAM, ROUTES } from "@/lib/auth/constants";

/**
 * "Keluar, lanjut nanti": answers are already saved. The private link stays on this phone,
 * so opening the WhatsApp link (or the site) again resumes at this section.
 */
export function ExitLaterDialog() {
  const copy = id.diagnosis.exit;
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-11 text-muted-foreground">
          {copy.trigger}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{copy.title}</AlertDialogTitle>
          <AlertDialogDescription>{copy.body}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{copy.cancel}</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Link href={`${ROUTES.join}?${NOTICE_PARAM}=tersimpan`}>{copy.confirm}</Link>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
