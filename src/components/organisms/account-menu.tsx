"use client";

import { ChevronDownIcon } from "lucide-react";
import Link from "next/link";
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
  DropdownMenuSeparator,
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
import { redoDiagnosisAction } from "@/lib/actions/owner";
import { ROUTES } from "@/lib/auth/constants";

const ITEM_CLASS = "min-h-11 text-base";

interface AccountMenuProps {
  label: string;
  /** Navigation entries (researcher panel). */
  links?: { label: string; href: string }[];
  /** Business profile rows for the sheet (owner). */
  profile?: { label: string; value: string }[];
  /** "Ulang cek usaha" (owner). */
  allowRedo?: boolean;
  logoutLabel: string;
  /** Server action that ends the session and redirects. */
  logout: () => Promise<void>;
}

export function AccountMenu({
  label,
  links = [],
  profile,
  allowRedo = false,
  logoutLabel,
  logout,
}: AccountMenuProps) {
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const [redoOpen, setRedoOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function redo() {
    startTransition(async () => {
      const result = await redoDiagnosisAction();
      if (!result.ok) {
        toast.error(result.error);
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
            className="h-11 max-w-56"
            aria-label={`${id.nav.accountMenu}: ${label}`}
          >
            <span className="truncate">{label}</span>
            <ChevronDownIcon aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-56">
          {links.map((link) => (
            <DropdownMenuItem key={link.href} asChild className={ITEM_CLASS}>
              <Link href={link.href}>{link.label}</Link>
            </DropdownMenuItem>
          ))}
          {profile ? (
            <DropdownMenuItem className={ITEM_CLASS} onSelect={() => setProfileOpen(true)}>
              {id.pack.menu.profile}
            </DropdownMenuItem>
          ) : null}
          {allowRedo ? (
            <DropdownMenuItem className={ITEM_CLASS} onSelect={() => setRedoOpen(true)}>
              {id.pack.menu.redo}
            </DropdownMenuItem>
          ) : null}
          {links.length > 0 || profile || allowRedo ? <DropdownMenuSeparator /> : null}
          <DropdownMenuItem className={ITEM_CLASS} onSelect={() => startTransition(logout)}>
            {logoutLabel}
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
                  <dd className="font-semibold break-words">{row.value}</dd>
                </div>
              ))}
            </dl>
          </SheetContent>
        </Sheet>
      ) : null}

      {allowRedo ? (
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
      ) : null}
    </>
  );
}
