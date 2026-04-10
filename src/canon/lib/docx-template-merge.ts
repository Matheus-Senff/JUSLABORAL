import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import { richHtmlToWordXml } from "@canon/lib/rich-text";

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
  let zip: PizZip;
  try {
    const templateBuffer = await templateBlob.arrayBuffer();
    zip = new PizZip(templateBuffer);
  } catch (e) {
    console.error("[DOCX] Falha ao carregar o arquivo do modelo:", e);
    await autoDiagnosticarDocxErro(e, templateBlob);
    throw new Error("Erro ao ler o arquivo do modelo Word (.docx). Verifique se o arquivo está íntegro.");
  }

  const contentXml = richHtmlToWordXml(contentHtml);
  const originalDocumentXml = zip.file("word/document.xml")?.asText();
  if (!originalDocumentXml) {
    await autoDiagnosticarDocxErro("Estrutura Word inválida", templateBlob);
    throw new Error("O template selecionado não possui uma estrutura Word válida.");
  }

  let docxtemplaterApplied = false;
  try {
    const document = new Docxtemplater(zip, {
      linebreaks: true,
      paragraphLoop: true,
      nullGetter: () => "",
    });
    document.render({ document_content: contentXml });
    const renderedZip = document.getZip();
    const renderedDocumentXml = renderedZip.file("word/document.xml")?.asText() || "";
    if (renderedDocumentXml !== originalDocumentXml && !renderedDocumentXml.includes("&lt;w:p")) {
      zip = renderedZip;
      docxtemplaterApplied = true;
    }
  } catch (err: any) {
    docxtemplaterApplied = false;
    // Log detalhado do erro do Docxtemplater
    console.error("[DOCX] Erro ao renderizar modelo:", err);
    if (err && err.properties && err.properties.errors) {
      err.properties.errors.forEach((e: any, idx: number) => {
        console.error(`[DOCX] Erro ${idx}:`, e);
      });
    }
    try {
      const brokenXml = zip.file("word/document.xml")?.asText();
      if (brokenXml) {
        console.error("[DOCX] XML atual do modelo:", brokenXml.slice(0, 1000));
      }
    } catch (xmlErr) {
      console.error("[DOCX] Falha ao ler XML para diagnóstico:", xmlErr);
    }
    await autoDiagnosticarDocxErro(err, templateBlob);
  }

  if (!docxtemplaterApplied) {
    zip.file("word/document.xml", replaceBodyKeepingTemplateStructure(originalDocumentXml, contentXml));
  }

  return zip.generate({ type: "blob", mimeType: DOCX_MIME_TYPE });
}

// Função auxiliar: diagnóstico automático de erro em modelo DOCX
async function autoDiagnosticarDocxErro(erro: any, templateBlob: Blob) {
  console.error('[DOCX][AUTO-DIAG] Diagnóstico automático iniciado.');
  if (erro) console.error('[DOCX][AUTO-DIAG] Erro capturado:', erro);
  try {
    // Tenta ler o início do arquivo como texto para detectar caracteres nulos ou problemas de encoding
    const arrBuf = await templateBlob.slice(0, 2048).arrayBuffer();
    const arr = new Uint8Array(arrBuf);
    let texto = '';
    for (let i = 0; i < arr.length; i++) {
      texto += String.fromCharCode(arr[i]);
    }
    if (texto.includes('\u0000')) {
      console.error('[DOCX][AUTO-DIAG] Null character detectado no início do arquivo.');
    }
    if (!texto.includes('PK')) {
      console.error('[DOCX][AUTO-DIAG] Arquivo não parece ser um ZIP válido (.docx).');
    }
    // Loga os primeiros bytes para inspeção
    console.error('[DOCX][AUTO-DIAG] Bytes iniciais:', texto.slice(0, 120));
  } catch (e) {
    console.error('[DOCX][AUTO-DIAG] Falha ao ler bytes iniciais:', e);
  }
  // Sugestão automática
  console.error('[DOCX][AUTO-DIAG] Sugestão: Verifique se o modelo foi salvo como DOCX (Word 2007+), sem proteção por senha, e sem campos inválidos.');
}
