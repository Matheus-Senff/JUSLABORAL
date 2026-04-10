import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import type { PDFPageProxy } from "pdfjs-dist";
import pdfWorkerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { createWorker, PSM } from "tesseract.js";

export interface DocumentAiOcrResult {
  text: string;
  document: Record<string, unknown> | null;
  mimeType: string;
  pageCount: number;
  pages: string[];
}

GlobalWorkerOptions.workerSrc = pdfWorkerSrc;

const OCR_SUPPORTED_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/bmp",
  "image/tiff",
  "image/gif",
];

let workerPromise: Promise<Awaited<ReturnType<typeof createWorker>>> | null = null;
let progressListener: ((progress: number, status: string) => void) | undefined;

const OCR_MAX_WIDTH = 1500;

function setOcrProgressListener(listener?: (progress: number, status: string) => void) {
  progressListener = listener;
}

async function loadImageElement(file: Blob) {
  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Não foi possível carregar a imagem para OCR local."));
      img.src = objectUrl;
    });

    return image;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function preprocessImageForOcr(source: File | Blob | HTMLCanvasElement) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { willReadFrequently: true });

  if (!context) throw new Error("Canvas 2D indisponível para pré-processamento local.");

  if (source instanceof HTMLCanvasElement) {
    const scale = source.width > OCR_MAX_WIDTH ? OCR_MAX_WIDTH / source.width : 1;
    canvas.width = Math.max(1, Math.round(source.width * scale));
    canvas.height = Math.max(1, Math.round(source.height * scale));
    context.drawImage(source, 0, 0, canvas.width, canvas.height);
  } else {
    const image = await loadImageElement(source);
    const sourceWidth = image.naturalWidth || image.width;
    const sourceHeight = image.naturalHeight || image.height;
    const scale = sourceWidth > OCR_MAX_WIDTH ? OCR_MAX_WIDTH / sourceWidth : 1;
    canvas.width = Math.max(1, Math.round(sourceWidth * scale));
    canvas.height = Math.max(1, Math.round(sourceHeight * scale));
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
  }

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const contrastFactor = 1.45;

  for (let index = 0; index < data.length; index += 4) {
    const grayscale = data[index] * 0.299 + data[index + 1] * 0.587 + data[index + 2] * 0.114;
    const contrasted = Math.max(0, Math.min(255, (grayscale - 128) * contrastFactor + 128));
    data[index] = contrasted;
    data[index + 1] = contrasted;
    data[index + 2] = contrasted;
  }

  context.putImageData(imageData, 0, 0);
  return canvas;
}

async function getOcrWorker() {
  if (!workerPromise) {
    workerPromise = createWorker("por", 1, {
      logger: (message) => progressListener?.(Math.round((message.progress || 0) * 100), message.status || "processando"),
      errorHandler: (error) => console.error("Tesseract OCR error:", error),
    }).then(async (worker) => {
      await worker.setParameters({
        tessedit_pageseg_mode: PSM.AUTO,
        preserve_interword_spaces: "1",
      });
      return worker;
    });
  }

  return workerPromise;
}

export async function warmupDocumentAiOcrWorker() {
  await getOcrWorker();
}

function extractPdfNativeText(items: Array<{ str?: string }>) {
  return items
    .map((item) => item.str || "")
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

async function renderPdfPage(page: PDFPageProxy) {
  const viewport = page.getViewport({ scale: 2 });
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Canvas 2D indisponível para OCR local.");
  await page.render({ canvas, canvasContext: context, viewport }).promise;
  return canvas;
}

async function recognizeImageLocally(image: File | Blob | HTMLCanvasElement, onProgress?: (progress: number, status: string) => void) {
  setOcrProgressListener(onProgress);

  try {
    const worker = await getOcrWorker();
    const processedImage = await preprocessImageForOcr(image);
    const result = await worker.recognize(processedImage, { rotateAuto: true });
    onProgress?.(100, "concluído");
    return result.data.text.replace(/\s+\n/g, "\n").trim();
  } finally {
    setOcrProgressListener(undefined);
  }
}

async function recognizePdfLocally(file: File, onProgress?: (progress: number, status: string) => void) {
  const pdf = await getDocument({ data: await file.arrayBuffer() }).promise;
  const pages: string[] = [];

  for (let pageIndex = 0; pageIndex < pdf.numPages; pageIndex += 1) {
    const page = await pdf.getPage(pageIndex + 1);
    const textContent = await page.getTextContent();
    const nativeText = extractPdfNativeText(textContent.items as Array<{ str?: string }>);

    if (nativeText.length > 24) {
      pages.push(nativeText);
      onProgress?.(Math.round(((pageIndex + 1) / pdf.numPages) * 100), `lendo página ${pageIndex + 1}`);
      continue;
    }

    const canvas = await renderPdfPage(page);
    const ocrText = await recognizeImageLocally(canvas, (pageProgress, status) => {
      const overall = Math.round(((pageIndex + pageProgress / 100) / pdf.numPages) * 100);
      onProgress?.(overall, `${status} • página ${pageIndex + 1}`);
    });
    pages.push(ocrText);
  }

  return pages.filter(Boolean);
}

export function supportsDocumentAiOcr(file: File) {
  return OCR_SUPPORTED_TYPES.includes(file.type) || /\.(pdf|png|jpe?g|webp|bmp|tiff?|gif)$/i.test(file.name);
}

export async function runDocumentAiOcr(file: File, onProgress?: (progress: number, status: string) => void): Promise<DocumentAiOcrResult> {
  const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);
  const pages = isPdf
    ? await recognizePdfLocally(file, onProgress)
    : [await recognizeImageLocally(file, onProgress)].filter(Boolean);
  const text = pages.join("\n\n").trim();

  return {
    text,
    document: null,
    mimeType: file.type || "application/octet-stream",
    pageCount: pages.length,
    pages,
  };
}