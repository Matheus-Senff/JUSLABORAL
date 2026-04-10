export interface DocumentChunk {
  id: string;
  label: string;
  content: string;
}

export interface PreprocessedImageResult {
  dataUrl: string;
  notes: string[];
  detectedSkewDeg: number;
}

const MAX_IMAGE_SIDE = 1600;
const MAX_DESKEW_ANGLE = 4;
const DESKEW_STEP = 0.5;

function isCanvasSupported() {
  return typeof document !== "undefined";
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function createCanvas(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  return canvas;
}

function drawImageContained(image: CanvasImageSource, width: number, height: number) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas 2D indisponível");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  return canvas;
}

function rotateCanvas(source: HTMLCanvasElement, angleDeg: number) {
  if (Math.abs(angleDeg) < 0.01) return drawImageContained(source, source.width, source.height);

  const radians = (angleDeg * Math.PI) / 180;
  const sin = Math.abs(Math.sin(radians));
  const cos = Math.abs(Math.cos(radians));
  const width = source.width * cos + source.height * sin;
  const height = source.width * sin + source.height * cos;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas 2D indisponível");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(radians);
  ctx.drawImage(source, -source.width / 2, -source.height / 2);

  return canvas;
}

function downscaleImage(image: HTMLImageElement) {
  const ratio = Math.min(1, MAX_IMAGE_SIDE / Math.max(image.width, image.height));
  return drawImageContained(image, image.width * ratio, image.height * ratio);
}

function getOtsuThreshold(grayValues: Uint8ClampedArray) {
  const histogram = new Array<number>(256).fill(0);
  for (let i = 0; i < grayValues.length; i += 1) histogram[grayValues[i]] += 1;

  const total = grayValues.length;
  let sum = 0;
  for (let i = 0; i < 256; i += 1) sum += i * histogram[i];

  let sumBackground = 0;
  let weightBackground = 0;
  let maxVariance = 0;
  let threshold = 160;

  for (let i = 0; i < 256; i += 1) {
    weightBackground += histogram[i];
    if (!weightBackground) continue;

    const weightForeground = total - weightBackground;
    if (!weightForeground) break;

    sumBackground += i * histogram[i];
    const meanBackground = sumBackground / weightBackground;
    const meanForeground = (sum - sumBackground) / weightForeground;
    const variance = weightBackground * weightForeground * (meanBackground - meanForeground) ** 2;

    if (variance > maxVariance) {
      maxVariance = variance;
      threshold = i;
    }
  }

  return threshold;
}

function applyBinaryCleanup(source: HTMLCanvasElement) {
  const canvas = drawImageContained(source, source.width, source.height);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas 2D indisponível");

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const grayscale = new Uint8ClampedArray(canvas.width * canvas.height);

  for (let i = 0, index = 0; i < data.length; i += 4, index += 1) {
    const gray = Math.min(255, Math.max(0, data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114));
    const contrasted = Math.min(255, Math.max(0, (gray - 128) * 1.8 + 128));
    grayscale[index] = contrasted;
  }

  const threshold = getOtsuThreshold(grayscale);

  for (let i = 0, index = 0; i < data.length; i += 4, index += 1) {
    const value = grayscale[index] > threshold ? 255 : 0;
    data[i] = value;
    data[i + 1] = value;
    data[i + 2] = value;
    data[i + 3] = 255;
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

function calculateProjectionScore(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return 0;

  const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const rowTotals = new Array<number>(height).fill(0);

  for (let y = 0; y < height; y += 1) {
    let total = 0;
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      total += 255 - data[index];
    }
    rowTotals[y] = total;
  }

  const mean = rowTotals.reduce((acc, value) => acc + value, 0) / Math.max(1, rowTotals.length);
  return rowTotals.reduce((acc, value) => acc + (value - mean) ** 2, 0);
}

function estimateDeskewAngle(source: HTMLCanvasElement) {
  const sampleRatio = Math.min(1, 900 / Math.max(source.width, source.height));
  const sample = applyBinaryCleanup(drawImageContained(source, source.width * sampleRatio, source.height * sampleRatio));

  let bestAngle = 0;
  let bestScore = -Infinity;

  for (let angle = -MAX_DESKEW_ANGLE; angle <= MAX_DESKEW_ANGLE; angle += DESKEW_STEP) {
    const rotated = rotateCanvas(sample, angle);
    const cleaned = applyBinaryCleanup(rotated);
    const score = calculateProjectionScore(cleaned);

    if (score > bestScore) {
      bestScore = score;
      bestAngle = angle;
    }
  }

  return Number(bestAngle.toFixed(2));
}

export function isImageFile(file: File) {
  return file.type.startsWith("image/") || /\.(png|jpe?g|webp|bmp|tiff?)$/i.test(file.name);
}

export async function preprocessImageForAi(file: File): Promise<PreprocessedImageResult> {
  if (!isCanvasSupported()) {
    return {
      dataUrl: await fileToDataUrl(file),
      notes: ["Pré-processamento visual indisponível neste ambiente; imagem original mantida."],
      detectedSkewDeg: 0,
    };
  }

  const originalDataUrl = await fileToDataUrl(file);
  const image = await loadImage(originalDataUrl);
  const baseCanvas = downscaleImage(image);
  const detectedSkewDeg = estimateDeskewAngle(baseCanvas);
  const deskewed = rotateCanvas(baseCanvas, -detectedSkewDeg);
  const cleaned = applyBinaryCleanup(deskewed);

  return {
    dataUrl: cleaned.toDataURL("image/jpeg", 0.92),
    detectedSkewDeg,
    notes: [
      "Grayscale e threshold aplicados para remover sombras e ruídos.",
      `Deskew aplicado com correção aproximada de ${Math.abs(detectedSkewDeg).toFixed(1)}°.`,
      "Contraste reforçado para destacar texto sobre o fundo.",
    ],
  };
}

export function buildOverlappingChunks(documentName: string, pages: string[], chunkSize = 2600, overlapSize = 320) {
  const chunks: DocumentChunk[] = [];
  const normalizedPages = pages.map((page) => page.replace(/\s+/g, " ").trim()).filter(Boolean);

  normalizedPages.forEach((pageContent, pageIndex) => {
    const previousTail = normalizedPages[pageIndex - 1]?.slice(-overlapSize).trim();

    if (pageContent.length <= chunkSize) {
      chunks.push({
        id: `${documentName}-${pageIndex + 1}-1`,
        label: `Página ${pageIndex + 1}`,
        content: [
          previousTail ? `[Sobreposição da página anterior]\n${previousTail}` : "",
          `[Conteúdo principal]\n${pageContent}`,
        ].filter(Boolean).join("\n\n"),
      });
      return;
    }

    let start = 0;
    let partIndex = 1;
    while (start < pageContent.length) {
      const end = Math.min(pageContent.length, start + chunkSize);
      const mainSlice = pageContent.slice(start, end).trim();
      chunks.push({
        id: `${documentName}-${pageIndex + 1}-${partIndex}`,
        label: `Página ${pageIndex + 1} • trecho ${partIndex}`,
        content: [
          partIndex === 1 && previousTail ? `[Sobreposição da página anterior]\n${previousTail}` : "",
          `[Conteúdo principal]\n${mainSlice}`,
        ].filter(Boolean).join("\n\n"),
      });

      if (end >= pageContent.length) break;
      start = Math.max(end - overlapSize, start + 1);
      partIndex += 1;
    }
  });

  return chunks;
}
