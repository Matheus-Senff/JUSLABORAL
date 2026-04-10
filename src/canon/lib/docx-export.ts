import {
  Document,
  Header,
  HorizontalPositionAlign,
  HorizontalPositionRelativeFrom,
  ImageRun,
  Packer,
  Paragraph,
  TextRun,
  TextWrappingType,
  VerticalPositionAlign,
  VerticalPositionRelativeFrom,
} from "docx";

const SECTION_TITLES = [
  "ENDEREÇAMENTO",
  "QUALIFICAÇÃO DAS PARTES",
  "DOS FATOS",
  "DO DIREITO",
  "DOS PEDIDOS",
  "FECHAMENTO",
];

const A4_PAGE = {
  width: 11906,
  height: 16838,
};

export interface ExportMargins {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

interface CreatePetitionDocxBlobOptions {
  content: string;
  fontFamily: string;
  fontSize: number;
  margins: ExportMargins;
  watermarkBlob?: Blob | null;
  watermarkMimeType?: string | null;
  watermarkName?: string;
}

export function cmToTwip(value: number) {
  return Math.round((value / 2.54) * 1440);
}

function buildRunsFromLine(line: string, forceBold = false) {
  const segments = line.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return segments.map((segment) => {
    const isBoldSegment = segment.startsWith("**") && segment.endsWith("**");
    return new TextRun({
      text: isBoldSegment ? segment.slice(2, -2) : segment,
      bold: forceBold || isBoldSegment,
    });
  });
}

function buildDocxParagraphs(content: string) {
  return content.split(/\n/).map((rawLine) => {
    const line = rawLine.replace(/«/g, "").replace(/»/g, "");
    const normalized = line.replace(/^#+\s*/, "").replace(/\*\*/g, "").trim().replace(/:$/, "");
    const isSectionTitle = SECTION_TITLES.includes(normalized.toUpperCase());

    if (!line.trim()) {
      return new Paragraph({ text: "" });
    }

    return new Paragraph({
      spacing: { after: isSectionTitle ? 140 : 90, line: 360 },
      children: buildRunsFromLine(line, isSectionTitle),
    });
  });
}

function inferImageType(mimeType?: string | null) {
  if (mimeType?.includes("png")) return "png" as const;
  return "jpg" as const;
}

async function getImageSize(blob: Blob) {
  const objectUrl = URL.createObjectURL(blob);

  try {
    const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve({ width: image.naturalWidth || 1, height: image.naturalHeight || 1 });
      image.onerror = () => reject(new Error("Não foi possível ler a imagem do template."));
      image.src = objectUrl;
    });

    return dimensions;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function fitImageToPage(imageWidth: number, imageHeight: number) {
  const scale = Math.min(A4_PAGE.width / imageWidth, A4_PAGE.height / imageHeight);

  return {
    width: Math.max(1, Math.round(imageWidth * scale)),
    height: Math.max(1, Math.round(imageHeight * scale)),
  };
}

async function buildHeaderWithWatermark(blob: Blob, mimeType?: string | null, watermarkName?: string) {
  const imageBytes = new Uint8Array(await blob.arrayBuffer());
  const imageSize = await getImageSize(blob);
  const fittedSize = fitImageToPage(imageSize.width, imageSize.height);

  return new Header({
    children: [
      new Paragraph({
        children: [
          new ImageRun({
            type: inferImageType(mimeType),
            data: imageBytes,
            transformation: fittedSize,
            altText: {
              title: watermarkName || "Template visual",
              description: watermarkName || "Template visual",
              name: watermarkName || "Template visual",
            },
            floating: {
              behindDocument: true,
              allowOverlap: true,
              horizontalPosition: {
                relative: HorizontalPositionRelativeFrom.PAGE,
                align: HorizontalPositionAlign.CENTER,
              },
              verticalPosition: {
                relative: VerticalPositionRelativeFrom.PAGE,
                align: VerticalPositionAlign.CENTER,
              },
              wrap: {
                type: TextWrappingType.NONE,
              },
            },
          }),
        ],
      }),
    ],
  });
}

export async function createPetitionDocxBlob({
  content,
  fontFamily,
  fontSize,
  margins,
  watermarkBlob,
  watermarkMimeType,
  watermarkName,
}: CreatePetitionDocxBlobOptions) {
  const cleanContent = content.replace(/«/g, "").replace(/»/g, "");
  const header = watermarkBlob ? await buildHeaderWithWatermark(watermarkBlob, watermarkMimeType, watermarkName) : undefined;

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: fontFamily,
            size: fontSize * 2,
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: A4_PAGE,
            margin: {
              top: cmToTwip(margins.top),
              right: cmToTwip(margins.right),
              bottom: cmToTwip(margins.bottom),
              left: cmToTwip(margins.left),
            },
          },
        },
        headers: header ? { default: header } : undefined,
        children: buildDocxParagraphs(cleanContent),
      },
    ],
  });

  return Packer.toBlob(doc);
}
