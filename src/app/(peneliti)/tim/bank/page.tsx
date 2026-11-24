import type { Metadata } from "next";

import { QuestionBank } from "@/components/organisms/bank/question-bank";
import { ScoringGuide } from "@/components/organisms/bank/scoring-guide";
import { SopBank } from "@/components/organisms/bank/sop-bank";
import { TextHistory } from "@/components/organisms/bank/text-history";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import * as id from "@/content/id";
import { data } from "@/lib/data";
import { requireStaffPage } from "@/lib/data/staff-session";

export const metadata: Metadata = { title: id.questionBank.title };

/**
 * "Bank pertanyaan": how the check is scored, every text of the check and the SOPs, and the
 * history of text changes. Every team member reads it; only admins edit texts. Reads the edits
 * fresh (not the owners' cache), so an admin sees their change at once.
 */
export default async function QuestionBankPage() {
  const user = await requireStaffPage();
  const staff = data().staff;
  const [edits, history] = await Promise.all([
    data()
      .texts.listEdits()
      .catch(() => null),
    staff.listTextHistory().catch(() => []),
  ]);
  // Without the bank_teks table (migration not run yet) the texts can be read but not edited.
  const ready = edits !== null;
  const canEdit = user.role === "admin" && ready;
  const copy = id.questionBank;

  return (
    <div className="mx-auto max-w-5xl space-y-4 sm:space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">{copy.title}</h1>
        <p className="text-muted-foreground">{copy.subtitle}</p>
      </header>

      <Alert className="rounded-2xl">
        <AlertDescription className="text-foreground">
          {!ready ? copy.notReady : canEdit ? copy.rulesAdmin : copy.rulesTeam}
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="penilaian" className="space-y-4">
        <TabsList className="h-auto w-full flex-wrap justify-start sm:w-auto">
          <TabsTrigger value="penilaian" className="min-h-11">
            {copy.tabs.scoring}
          </TabsTrigger>
          <TabsTrigger value="pertanyaan" className="min-h-11">
            {copy.tabs.questions}
          </TabsTrigger>
          <TabsTrigger value="sop" className="min-h-11">
            {copy.tabs.sops}
          </TabsTrigger>
          <TabsTrigger value="riwayat" className="min-h-11">
            {copy.tabs.history}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="penilaian">
          <ScoringGuide />
        </TabsContent>
        <TabsContent value="pertanyaan">
          <QuestionBank edits={edits ?? []} canEdit={canEdit} />
        </TabsContent>
        <TabsContent value="sop">
          <SopBank edits={edits ?? []} canEdit={canEdit} />
        </TabsContent>
        <TabsContent value="riwayat">
          <TextHistory items={history} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
