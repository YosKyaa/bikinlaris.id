import "server-only";

import { id } from "@/content/id";
import { ownerLinkUrl, surveyLink } from "@/lib/app-url";
import type { Participant } from "@/lib/data/types";
import { whatsAppUrl } from "@/lib/diagnosis/whatsapp";
import { isMockData } from "@/lib/env";

/**
 * WhatsApp messages from the research team to an owner. In demo mode the number is left out,
 * so a test message never reaches a real person who happens to own a sample number.
 */

interface Recipient {
  code: string;
  ownerName: string;
  businessName: string;
  whatsapp: string;
}

const numberFor = (recipient: Recipient) => (isMockData ? null : recipient.whatsapp);

/** Day-30 questionnaire message, or null while SURVEY_URL is not configured. */
export function questionnaireHref(recipient: Recipient): string | null {
  const survey = surveyLink(recipient.code);
  if (!survey) return null;
  const text = id.researcher.messages.questionnaire(
    recipient.ownerName,
    recipient.businessName,
    survey,
    recipient.code,
  );
  return whatsAppUrl(text, numberFor(recipient));
}

export interface ParticipantLinks {
  /** Absolute private link (secret: owner only). */
  ownerUrl: string;
  sendLink: string;
  sendPack: string;
  sendQuestionnaire: string | null;
}

export async function participantLinks({
  business,
  token,
}: Participant): Promise<ParticipantLinks> {
  const recipient: Recipient = {
    code: business.code,
    ownerName: business.ownerName,
    businessName: business.name,
    whatsapp: business.whatsapp,
  };
  const ownerUrl = await ownerLinkUrl(token);
  const messages = id.researcher.messages;
  const args = [business.ownerName, business.name, ownerUrl, business.code] as const;
  return {
    ownerUrl,
    sendLink: whatsAppUrl(messages.link(...args), numberFor(recipient)),
    sendPack: whatsAppUrl(messages.pack(...args), numberFor(recipient)),
    sendQuestionnaire: questionnaireHref(recipient),
  };
}
