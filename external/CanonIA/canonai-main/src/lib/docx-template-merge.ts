import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import { richHtmlToWordXml } from "@/lib/rich-text";

const DOCX_MIME_TYPE = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

interface MergeDocxTemplateOptions {
  contentHtml: string;
  templateBlob: Blob;
}

function replaceBodyKeepingTemplateStructure(documentXml: string, bodyXml: string) {
  const bodyMatch = documentXml.match(/<w:body>([\s\S]*?)<\/w:body>/);
  if (!bodyMatch) throw new Error("Não foi possível localizar o corpo do template Word.");
  const sectPrMatch = bodyMatch[1].match(/(<w:sectPr[\s\S]*<\/w:sectPr>)\s*$/);
  const sectionProperties = sectPrMatch?.[1] || "";
  return documentXml.replace(bodyMatch[0], `<w:body>${bodyXml}${sectionProperties}</w:body>`);
}

export async function mergeContentIntoDocxTemplate({ contentHtml, templateBlob }: MergeDocxTemplateOptions) {
  const contentXml = richHtmlToWordXml(contentHtml);
  const templateBuffer = await templateBlob.arrayBuffer();
  let zip = new PizZip(templateBuffer);
  const originalDocumentXml = zip.file("word/document.xml")?.asText();
  if (!originalDocumentXml) throw new Error("O template selecionado não possui uma estrutura Word válida.");

  let docxtemplaterApplied = false;
  try {
    const document = new Docxtemplater(zip, { linebreaks: true, paragraphLoop: true });
    document.render({ document_content: contentXml });
    const renderedZip = document.getZip();
    const renderedDocumentXml = renderedZip.file("word/document.xml")?.asText() || "";
    if (renderedDocumentXml !== originalDocumentXml && !renderedDocumentXml.includes("&lt;w:p")) {
      zip = renderedZip;
      docxtemplaterApplied = true;
    }
  } catch {
    docxtemplaterApplied = false;
  }

  if (!docxtemplaterApplied) {
    zip.file("word/document.xml", replaceBodyKeepingTemplateStructure(originalDocumentXml, contentXml));
  }

  return zip.generate({ type: "blob", mimeType: DOCX_MIME_TYPE });
}