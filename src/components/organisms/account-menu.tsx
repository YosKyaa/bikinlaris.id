"use client";

import { ChevronDownIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { id } from "@/content/id";
import { logoutAction } from "@/lib/actions/auth";
import { redoDiagnosisAction } from "@/lib/actions/diagnosis";
import { ROUTES } from "@/lib/auth/constants";

interface AccountMenuProps {
  label: string;
  /** Business profile rows for the sheet; omitted for researchers. */
  profile?: { label: string; value: string }[];
  allowRedo?: boolean;
}

export function AccountMenu({ label, profile, allowRedo = false }: AccountMenuProps) {
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const [redoOpen, setRedoOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function redo() {
    startTransition(async () => {
      const result = await redoDiagnosisAction();
      if (!result.ok) {
        toast.error(id.pack.redo.failed);
        return;
      }
      setRedoOpen(false);
      router.push(ROUTES.start);
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="max-w-56"
            aria-label={`${id.nav.accountMenu}: ${label}`}
          >
            <span className="truncate">{label}</span>
            <ChevronDownIcon aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-52">
          {profile ? (
            <DropdownMenuItem className="min-h-11 text-base" onSelect={() => setProfileOpen(true)}>
              {id.pack.menu.profile}
            </DropdownMenuItem>
          ) : null}
          {allowRedo ? (
            <DropdownMenuItem className="min-h-11 text-base" onSelect={() => setRedoOpen(true)}>
              {id.pack.menu.redo}
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem
            className="min-h-11 text-base"
            onSelect={() => startTransition(() => logoutAction())}
          >
            {id.pack.menu.logout}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {profile ? (
        <Sheet open={profileOpen} onOpenChange={setProfileOpen}>
          <SheetContent side="bottom" className="mx-auto max-w-xl rounded-t-xl">
            <SheetHeader>
              <SheetTitle>{id.pack.profileSheet.title}</SheetTitle>
              <SheetDescription>{id.pack.profileSheet.description}</SheetDescription>
            </SheetHeader>
            <dl className="grid grid-cols-2 gap-3 px-4 pb-6">
              {profile.map((row) => (
                <div key={row.label} className="rounded-lg bg-muted p-3">
                  <dt className="text-sm text-muted-foreground">{row.label}</dt>
                  <dd className="font-semibold">{row.value}</dd>
                </div>
              ))}
            </dl>
          </SheetContent>
        </Sheet>
      ) : null}

      <AlertDialog open={redoOpen} onOpenChange={(open) => !pending && setRedoOpen(open)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{id.pack.redo.title}</AlertDialogTitle>
            <AlertDialogDescription>{id.pack.redo.body}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>{id.pack.redo.cancel}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={pending}
              onClick={(event) => {
                event.preventDefault();
                redo();
              }}
            >
              {id.pack.redo.confirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
