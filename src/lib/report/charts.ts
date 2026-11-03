import JSZip from "jszip";

import { FONT, HEX } from "./theme";

/**
 * Native Excel bar charts, added to a workbook that exceljs wrote (exceljs has no chart
 * support). The chart parts follow the structure openpyxl writes, which Excel opens without
 * repair; checked by opening the report in Excel (docs/PERUBAHAN.md).
 */

export interface ChartSeries {
  name: string;
  /** Cell with the series name, e.g. 'Dasbor'!$D$11. */
  nameRef: string;
  valuesRef: string;
  values: number[];
  /** One fill for the series, or one per bar (ordered stages). */
  color: string | readonly string[];
  /** Data label colour (must stay readable on the bar or, outside it, on white). */
  labelColor: string;
}

export interface BarChartSpec {
  title: string;
  /** Alternative text for screen readers. */
  description: string;
  categoriesRef: string;
  categories: string[];
  series: ChartSeries[];
  stacked: boolean;
  /** Zero-based cells: the chart spans from (col,row) up to, not including, (toCol,toRow). */
  anchor: { col: number; row: number; toCol: number; toRow: number };
}

const NS = {
  c: "http://schemas.openxmlformats.org/drawingml/2006/chart",
  a: "http://schemas.openxmlformats.org/drawingml/2006/main",
  r: "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
  xdr: "http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing",
  rel: "http://schemas.openxmlformats.org/package/2006/relationships",
  relChart: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/chart",
  relDrawing: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing",
};
const CONTENT_TYPE = {
  chart: "application/vnd.openxmlformats-officedocument.drawingml.chart+xml",
  drawing: "application/vnd.openxmlformats-officedocument.drawing+xml",
};
const XML_HEAD = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
const AXIS = { category: 500001, value: 500002 };
/** Text sizes in hundredths of a point. */
const SIZE = { body: 1000, title: 1300 };
/** Hide zero segments in stacked bars ("0" labels would clutter). */
const HIDE_ZERO = "0;;;";

const esc = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const fill = (hex: string) => `<a:solidFill><a:srgbClr val="${hex}"/></a:solidFill>`;

function textProps(hex: string, size = SIZE.body, bold = false) {
  return `<c:txPr><a:bodyPr/><a:lstStyle/><a:p><a:pPr><a:defRPr sz="${size}" b="${bold ? 1 : 0}">${fill(hex)}<a:latin typeface="${FONT}"/></a:defRPr></a:pPr><a:endParaRPr lang="id-ID"/></a:p></c:txPr>`;
}

function strCache(values: string[]) {
  const points = values.map((v, i) => `<c:pt idx="${i}"><c:v>${esc(v)}</c:v></c:pt>`).join("");
  return `<c:strCache><c:ptCount val="${values.length}"/>${points}</c:strCache>`;
}

function numCache(values: number[]) {
  const points = values.map((v, i) => `<c:pt idx="${i}"><c:v>${v}</c:v></c:pt>`).join("");
  return `<c:numCache><c:formatCode>General</c:formatCode><c:ptCount val="${values.length}"/>${points}</c:numCache>`;
}

function seriesXml(series: ChartSeries, index: number, spec: BarChartSpec) {
  const base = typeof series.color === "string" ? series.color : (series.color[0] ?? HEX.primary);
  const perBar =
    typeof series.color === "string"
      ? ""
      : series.color
          .map(
            (hex, i) =>
              `<c:dPt><c:idx val="${i}"/><c:invertIfNegative val="0"/><c:bubble3D val="0"/><c:spPr>${fill(hex)}<a:ln><a:noFill/></a:ln></c:spPr></c:dPt>`,
          )
          .join("");
  const labels =
    `<c:dLbls>${spec.stacked ? `<c:numFmt formatCode="${HIDE_ZERO}" sourceLinked="0"/>` : ""}` +
    `<c:spPr><a:noFill/><a:ln><a:noFill/></a:ln></c:spPr>${textProps(series.labelColor, SIZE.body, true)}` +
    `<c:dLblPos val="${spec.stacked ? "ctr" : "outEnd"}"/>` +
    `<c:showLegendKey val="0"/><c:showVal val="1"/><c:showCatName val="0"/><c:showSerName val="0"/><c:showPercent val="0"/><c:showBubbleSize val="0"/></c:dLbls>`;
  return (
    `<c:ser><c:idx val="${index}"/><c:order val="${index}"/>` +
    `<c:tx><c:strRef><c:f>${esc(series.nameRef)}</c:f>${strCache([series.name])}</c:strRef></c:tx>` +
    `<c:spPr>${fill(base)}<a:ln><a:noFill/></a:ln></c:spPr><c:invertIfNegative val="0"/>${perBar}${labels}` +
    `<c:cat><c:strRef><c:f>${esc(spec.categoriesRef)}</c:f>${strCache(spec.categories)}</c:strRef></c:cat>` +
    `<c:val><c:numRef><c:f>${esc(series.valuesRef)}</c:f>${numCache(series.values)}</c:numRef></c:val></c:ser>`
  );
}

/** Horizontal bars, first category on top, values as labels (no value axis to read off). */
function chartXml(spec: BarChartSpec) {
  const title =
    `<c:title><c:tx><c:rich><a:bodyPr/><a:lstStyle/><a:p><a:pPr><a:defRPr sz="${SIZE.title}" b="1">${fill(HEX.brandDeep)}</a:defRPr></a:pPr>` +
    `<a:r><a:rPr lang="id-ID" sz="${SIZE.title}" b="1">${fill(HEX.brandDeep)}<a:latin typeface="${FONT}"/></a:rPr><a:t>${esc(spec.title)}</a:t></a:r></a:p></c:rich></c:tx><c:overlay val="0"/></c:title>`;
  const bars =
    `<c:barChart><c:barDir val="bar"/><c:grouping val="${spec.stacked ? "stacked" : "clustered"}"/><c:varyColors val="0"/>` +
    spec.series.map((s, i) => seriesXml(s, i, spec)).join("") +
    `<c:gapWidth val="60"/>${spec.stacked ? '<c:overlap val="100"/>' : ""}<c:axId val="${AXIS.category}"/><c:axId val="${AXIS.value}"/></c:barChart>`;
  const categoryAxis =
    `<c:catAx><c:axId val="${AXIS.category}"/><c:scaling><c:orientation val="maxMin"/></c:scaling><c:delete val="0"/><c:axPos val="l"/>` +
    `<c:numFmt formatCode="General" sourceLinked="0"/><c:majorTickMark val="none"/><c:minorTickMark val="none"/><c:tickLblPos val="nextTo"/>` +
    `<c:spPr><a:ln w="9525">${fill(HEX.border)}</a:ln></c:spPr>${textProps(HEX.foreground)}` +
    `<c:crossAx val="${AXIS.value}"/><c:crosses val="autoZero"/><c:auto val="1"/><c:lblAlgn val="ctr"/><c:lblOffset val="100"/><c:noMultiLvlLbl val="0"/></c:catAx>`;
  const valueAxis =
    `<c:valAx><c:axId val="${AXIS.value}"/><c:scaling><c:orientation val="minMax"/><c:min val="0"/></c:scaling><c:delete val="1"/><c:axPos val="b"/>` +
    `<c:numFmt formatCode="General" sourceLinked="1"/><c:majorTickMark val="none"/><c:minorTickMark val="none"/><c:tickLblPos val="nextTo"/>` +
    `<c:crossAx val="${AXIS.category}"/><c:crosses val="autoZero"/><c:crossBetween val="between"/></c:valAx>`;
  const legend =
    spec.series.length > 1
      ? `<c:legend><c:legendPos val="b"/><c:overlay val="0"/>${textProps(HEX.foreground)}</c:legend>`
      : "";
  return (
    `${XML_HEAD}<c:chartSpace xmlns:c="${NS.c}" xmlns:a="${NS.a}" xmlns:r="${NS.r}"><c:roundedCorners val="0"/>` +
    `<c:chart>${title}<c:autoTitleDeleted val="0"/><c:plotArea><c:layout/>${bars}${categoryAxis}${valueAxis}</c:plotArea>` +
    `${legend}<c:plotVisOnly val="1"/><c:dispBlanksAs val="gap"/></c:chart>` +
    `<c:spPr>${fill(HEX.white)}<a:ln w="9525">${fill(HEX.border)}</a:ln></c:spPr>${textProps(HEX.foreground)}</c:chartSpace>`
  );
}

function anchorXml(spec: BarChartSpec, index: number) {
  const { col, row, toCol, toRow } = spec.anchor;
  const at = (c: number, r: number) =>
    `<xdr:col>${c}</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>${r}</xdr:row><xdr:rowOff>0</xdr:rowOff>`;
  return (
    `<xdr:twoCellAnchor editAs="oneCell"><xdr:from>${at(col, row)}</xdr:from><xdr:to>${at(toCol, toRow)}</xdr:to>` +
    `<xdr:graphicFrame macro=""><xdr:nvGraphicFramePr><xdr:cNvPr id="${index + 2}" name="${esc(spec.title)}" descr="${esc(spec.description)}"/><xdr:cNvGraphicFramePr/></xdr:nvGraphicFramePr>` +
    `<xdr:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/></xdr:xfrm><a:graphic><a:graphicData uri="${NS.c}">` +
    `<c:chart xmlns:c="${NS.c}" xmlns:r="${NS.r}" r:id="rIdChart${index + 1}"/></a:graphicData></a:graphic></xdr:graphicFrame><xdr:clientData/></xdr:twoCellAnchor>`
  );
}

/** Attribute values of every <Relationship> in a .rels file. */
function relationships(xml: string) {
  return [...xml.matchAll(/<Relationship\b([^>]*)\/?>/g)].map((m) => {
    const attrs = m[1] ?? "";
    const get = (name: string) => new RegExp(`\\b${name}="([^"]*)"`).exec(attrs)?.[1] ?? "";
    return { id: get("Id"), target: get("Target") };
  });
}

/** Parts that must come after <drawing> in a worksheet (ECMA-376 CT_Worksheet order). */
const AFTER_DRAWING = [
  "<legacyDrawing",
  "<legacyDrawingHF",
  "<drawingHF",
  "<picture",
  "<oleObjects",
  "<controls",
  "<webPublishItems",
  "<tableParts",
  "<extLst",
  "</worksheet>",
];

async function readText(zip: JSZip, path: string) {
  const file = zip.file(path);
  if (!file) throw new Error(`xlsx part missing: ${path}`);
  return file.async("string");
}

/** Adds the charts to one sheet of an .xlsx and returns the new file. */
export async function addBarCharts(
  xlsx: ArrayBuffer | Uint8Array,
  sheetName: string,
  charts: BarChartSpec[],
): Promise<Uint8Array> {
  const zip = await JSZip.loadAsync(xlsx);
  const workbook = await readText(zip, "xl/workbook.xml");
  const sheetRid = [...workbook.matchAll(/<sheet\b([^>]*)\/?>/g)]
    .map((m) => m[1] ?? "")
    .find((attrs) => attrs.includes(`name="${esc(sheetName)}"`))
    ?.match(/\br:id="([^"]+)"/)?.[1];
  const target = relationships(await readText(zip, "xl/_rels/workbook.xml.rels")).find(
    (rel) => rel.id === sheetRid,
  )?.target;
  if (!target) throw new Error(`sheet not found: ${sheetName}`);
  const sheetPath = target.startsWith("/") ? target.slice(1) : `xl/${target}`;
  const sheetFile = sheetPath.split("/").at(-1) ?? "";
  const sheetRelsPath = `xl/worksheets/_rels/${sheetFile}.rels`;

  const used = (prefix: string) =>
    Object.keys(zip.files).filter((name) => name.startsWith(prefix)).length;
  const drawingNumber = used("xl/drawings/drawing") + 1;
  const firstChart = used("xl/charts/chart") + 1;
  const drawingPath = `xl/drawings/drawing${drawingNumber}.xml`;
  const chartPaths = charts.map((_, i) => `xl/charts/chart${firstChart + i}.xml`);

  charts.forEach((spec, i) => zip.file(chartPaths[i] ?? "", chartXml(spec)));
  zip.file(
    drawingPath,
    `${XML_HEAD}<xdr:wsDr xmlns:xdr="${NS.xdr}" xmlns:a="${NS.a}">${charts.map(anchorXml).join("")}</xdr:wsDr>`,
  );
  zip.file(
    `xl/drawings/_rels/drawing${drawingNumber}.xml.rels`,
    `${XML_HEAD}<Relationships xmlns="${NS.rel}">${chartPaths
      .map((p, i) => `<Relationship Id="rIdChart${i + 1}" Type="${NS.relChart}" Target="/${p}"/>`)
      .join("")}</Relationships>`,
  );

  const drawingRel = `<Relationship Id="rIdReportDrawing" Type="${NS.relDrawing}" Target="/${drawingPath}"/>`;
  const sheetRels = zip.file(sheetRelsPath)
    ? (await readText(zip, sheetRelsPath)).replace(
        "</Relationships>",
        `${drawingRel}</Relationships>`,
      )
    : `${XML_HEAD}<Relationships xmlns="${NS.rel}">${drawingRel}</Relationships>`;
  zip.file(sheetRelsPath, sheetRels);

  const sheet = await readText(zip, sheetPath);
  const at = Math.min(...AFTER_DRAWING.map((tag) => sheet.indexOf(tag)).filter((i) => i >= 0));
  zip.file(
    sheetPath,
    `${sheet.slice(0, at)}<drawing xmlns:r="${NS.r}" r:id="rIdReportDrawing"/>${sheet.slice(at)}`,
  );

  const overrides =
    `<Override PartName="/${drawingPath}" ContentType="${CONTENT_TYPE.drawing}"/>` +
    chartPaths
      .map((p) => `<Override PartName="/${p}" ContentType="${CONTENT_TYPE.chart}"/>`)
      .join("");
  const types = await readText(zip, "[Content_Types].xml");
  zip.file("[Content_Types].xml", types.replace("</Types>", `${overrides}</Types>`));

  return zip.generateAsync({ type: "uint8array", compression: "DEFLATE" });
}
