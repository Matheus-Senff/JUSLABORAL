import mammoth from "mammoth/mammoth.browser";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import pdfWorkerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";

GlobalWorkerOptions.workerSrc = pdfWorkerSrc;

const textDecoder = new TextDecoder("utf-8");

export interface ExtractedDocumentText {
  kind: "pdf" | "docx" | "text" | "unsupported";
  text: string;
  pages: string[];
}

async function extractPdfPages(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await getDocument({ data: arrayBuffer }).promise;
  return Promise.all(
    Array.from({ length: pdf.numPages }, async (_, index) => {
      const page = await pdf.getPage(index + 1);
      const textContent = await page.getTextContent();

      return textContent.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
    }),
  );
}

async function extractDocxText(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const { value } = await mammoth.extractRawText({ arrayBuffer });
  return value.replace(/\n{3,}/g, "\n\n").trim();
}

async function extractPlainText(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  return textDecoder.decode(arrayBuffer).trim();
}

export async function extractStructuredTextFromFile(file: File): Promise<ExtractedDocumentText> {
  const lowerName = file.name.toLowerCase();

  if (lowerName.endsWith(".pdf")) {
    const pages = (await extractPdfPages(file)).filter(Boolean);
    return {
      kind: "pdf",
      pages,
      text: pages.join("\n\n"),
    };
  }

  if (lowerName.endsWith(".docx") || lowerName.endsWith(".dotx") || lowerName.endsWith(".doc")) {
    const text = await extractDocxText(file);
    return {
      kind: "docx",
      pages: text ? [text] : [],
      text,
    };
  }

  if (lowerName.endsWith(".txt") || lowerName.endsWith(".md")) {
    const text = await extractPlainText(file);
    return {
      kind: "text",
      pages: text ? [text] : [],
      text,
    };
  }

  return {
    kind: "unsupported",
    pages: [],
    text: "",
  };
}

export async function extractTextFromFile(file: File) {
  const extracted = await extractStructuredTextFromFile(file);
  return extracted.text;
}