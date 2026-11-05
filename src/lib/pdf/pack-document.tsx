import { Document, Page, renderToBuffer, Text, View } from "@react-pdf/renderer";

import * as id from "@/content/id";
import type { Business, Pack } from "@/lib/data/types";
import { getProblem, getSop } from "@/lib/diagnosis/bank";
import { formatDate } from "@/lib/format";

import { registerPdfFonts } from "./fonts";
import { SopPage, type PdfSop } from "./sop-page";
import { styles } from "./styles";

export interface PackPdfInput {
  business: Business;
  pack: Pack;
  /** Regency name, resolved by the caller. */
  locationLabel: string;
}

function Footer({ businessName }: { businessName: string }) {
  return (
    <View style={styles.footer} fixed>
      <Text>{id.pack.pdf.footer(businessName)}</Text>
      <Text render={({ pageNumber, totalPages }) => id.pack.pdf.page(pageNumber, totalPages)} />
    </View>
  );
}

/** Page 1: who it is for, how to use it, what is inside, and when the questionnaire comes. */
function CoverPage({ input, sops }: { input: PackPdfInput; sops: PdfSop[] }) {
  const { business, pack, locationLabel } = input;
  const copy = id.pack.pdf;
  const later = pack.laterSopIds.map(getSop);
  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.cover}>
        <Text style={styles.brand}>{copy.brand}</Text>
        <Text style={styles.coverTitle}>{copy.title(business.name)}</Text>
        <Text style={styles.coverMeta}>
          {copy.meta(business.product, locationLabel, formatDate(pack.createdOn))}
        </Text>
        <Text style={styles.coverCode}>{copy.code(business.code)}</Text>
      </View>

      <View style={styles.tile}>
        <Text style={styles.h2}>{copy.howToTitle}</Text>
        {copy.howTo.map((line, index) => (
          <View key={line} style={styles.row}>
            <Text style={styles.number}>{index + 1}.</Text>
            <Text style={styles.grow}>{line}</Text>
          </View>
        ))}
      </View>

      {sops.length > 0 ? (
        <View style={styles.tile}>
          <Text style={styles.h2}>{copy.contents}</Text>
          {sops.map(({ sop }, index) => (
            <View key={sop.id} style={styles.row}>
              <Text style={styles.number}>{index + 1}.</Text>
              <View style={styles.grow}>
                <Text style={{ fontWeight: 600 }}>{sop.title}</Text>
                <Text style={styles.muted}>{sop.goal}</Text>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.tile}>
          <Text style={styles.h2}>{id.pack.empty.title}</Text>
          <Text>{id.pack.empty.body}</Text>
        </View>
      )}

      {later.length > 0 ? (
        <View style={styles.tileMuted}>
          <Text style={styles.h3}>{id.pack.later.title}</Text>
          <Text>{later.map((sop) => sop.title).join(" · ")}</Text>
          <Text style={styles.small}>{id.pack.later.body}</Text>
        </View>
      ) : null}

      <Text style={[styles.muted, { marginTop: 14 }]}>
        {copy.followUp(formatDate(pack.followUpOn))}
      </Text>
      <Footer businessName={business.name} />
    </Page>
  );
}

/** The owner's pack as an A4 document: a cover page, then one page (or more) per SOP. */
export function PackPdfDocument({ input }: { input: PackPdfInput }) {
  const { business, pack } = input;
  const sops: PdfSop[] = pack.sops.map((packSop) => ({
    sop: getSop(packSop.sopId),
    problems: packSop.problemIds.map(getProblem),
    whyText: packSop.whyText,
    taskTexts: packSop.taskTexts,
  }));
  return (
    <Document
      title={id.pack.pdf.docTitle(business.name)}
      author={id.app.domain}
      creator={id.app.domain}
      producer={id.app.domain}
      language="id"
    >
      <CoverPage input={input} sops={sops} />
      {sops.map((item, index) => (
        <Page key={item.sop.id} size="A4" style={styles.page}>
          <SopPage item={item} number={index + 1} businessName={business.name} />
          <Footer businessName={business.name} />
        </Page>
      ))}
    </Document>
  );
}

/** The finished PDF file. */
export async function renderPackPdf(input: PackPdfInput): Promise<Buffer> {
  registerPdfFonts();
  return renderToBuffer(<PackPdfDocument input={input} />);
}
