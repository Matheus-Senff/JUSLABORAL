const SECTION_TITLES = [
  "ENDEREÇAMENTO",
  "QUALIFICAÇÃO DAS PARTES",
  "DOS FATOS",
  "DO DIREITO",
  "DOS PEDIDOS",
  "FECHAMENTO",
];

const WORD_NAMESPACE = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function applyInlineMarkdown(value: string) {
  const segments = value.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return segments
    .map((segment) => {
      const isBold = segment.startsWith("**") && segment.endsWith("**");
      const content = isBold ? segment.slice(2, -2) : segment;
      const safe = escapeHtml(content);
      return isBold ? `<strong>${safe}</strong>` : safe;
    })
    .join("");
}

export function markdownToRichHtml(markdown: string) {
  const normalized = markdown.replace(/«/g, "").replace(/»/g, "").replace(/\r/g, "");
  const lines = normalized.split("\n");
  const blocks: string[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const currentLine = lines[index]?.trim();
    if (!currentLine) continue;

    if (/^\d+\.\s+/.test(currentLine)) {
      const items: string[] = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index].trim())) {
        items.push(`<li>${applyInlineMarkdown(lines[index].trim().replace(/^\d+\.\s+/, ""))}</li>`);
        index += 1;
      }
      index -= 1;
      blocks.push(`<ol>${items.join("")}</ol>`);
      continue;
    }

    if (/^[-*]\s+/.test(currentLine)) {
      const items: string[] = [];
      while (index < lines.length && /^[-*]\s+/.test(lines[index].trim())) {
        items.push(`<li>${applyInlineMarkdown(lines[index].trim().replace(/^[-*]\s+/, ""))}</li>`);
        index += 1;
      }
      index -= 1;
      blocks.push(`<ul>${items.join("")}</ul>`);
      continue;
    }

    const lineWithoutHashes = currentLine.replace(/^#+\s*/, "").replace(/:$/, "");
    const normalizedTitle = lineWithoutHashes.replace(/\*\*/g, "").trim().toUpperCase();
    const html = applyInlineMarkdown(lineWithoutHashes);

    if (SECTION_TITLES.includes(normalizedTitle)) {
      blocks.push(`<p><strong>${html}</strong></p>`);
      continue;
    }

    blocks.push(`<p>${applyInlineMarkdown(currentLine)}</p>`);
  }

  return blocks.length > 0 ? blocks.join("") : "<p></p>";
}

export function richHtmlToPlainText(html: string) {
  if (typeof window === "undefined") return html.replace(/<[^>]+>/g, " ").trim();
  const parser = new DOMParser();
  const document = parser.parseFromString(html || "<p></p>", "text/html");
  return document.body.textContent?.replace(/\s+/g, " ").trim() || "";
}

export function isRichHtmlEmpty(html: string) {
  return richHtmlToPlainText(html).length === 0;
}

function createRunXml(text: string, options?: { bold?: boolean; italic?: boolean; underline?: boolean }) {
  if (!text) return "";
  const preserveWhitespace = /^\s|\s$/.test(text);
  const formatting: string[] = [
    '<w:rFonts w:ascii="Arial Narrow" w:hAnsi="Arial Narrow" w:cs="Arial Narrow"/>',
    '<w:sz w:val="24"/><w:szCs w:val="24"/>',
  ];
  if (options?.bold) formatting.push("<w:b/>");
  if (options?.italic) formatting.push("<w:i/>");
  if (options?.underline) formatting.push('<w:u w:val="single"/>');
  return `<w:r><w:rPr>${formatting.join("")}</w:rPr><w:t${preserveWhitespace ? ' xml:space="preserve"' : ""}>${escapeXml(text)}</w:t></w:r>`;
}

function serializeInlineNode(node: ChildNode, formatting: { bold?: boolean; italic?: boolean; underline?: boolean } = {}) {
  if (node.nodeType === Node.TEXT_NODE) return createRunXml(node.textContent || "", formatting);
  if (node.nodeType !== Node.ELEMENT_NODE) return "";
  const element = node as HTMLElement;
  const tagName = element.tagName.toLowerCase();
  if (tagName === "br") return "<w:r><w:br/></w:r>";

  const nextFormatting = {
    bold: formatting.bold || tagName === "strong" || tagName === "b",
    italic: formatting.italic || tagName === "em" || tagName === "i",
    underline: formatting.underline || tagName === "u",
  };

  return Array.from(element.childNodes).map((child) => serializeInlineNode(child, nextFormatting)).join("");
}

function paragraphXml(innerXml: string) {
  return `<w:p><w:pPr><w:spacing w:after="160" w:line="360"/></w:pPr>${innerXml || createRunXml("")}</w:p>`;
}

function serializeParagraphElement(element: HTMLElement) {
  return paragraphXml(Array.from(element.childNodes).map((child) => serializeInlineNode(child)).join(""));
}

function serializeListElement(element: HTMLOListElement | HTMLUListElement) {
  const isOrdered = element.tagName.toLowerCase() === "ol";
  return Array.from(element.children)
    .filter((child): child is HTMLLIElement => child.tagName.toLowerCase() === "li")
    .map((item, index) => {
      const prefix = isOrdered ? `${index + 1}. ` : "• ";
      const itemXml = Array.from(item.childNodes).map((child) => serializeInlineNode(child)).join("");
      return paragraphXml(createRunXml(prefix) + itemXml);
    })
    .join("");
}

export function richHtmlToWordXml(html: string) {
  const parser = new DOMParser();
  const document = parser.parseFromString(html || "<p></p>", "text/html");
  const bodyXml = Array.from(document.body.childNodes)
    .map((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim();
        return text ? paragraphXml(createRunXml(text)) : "";
      }
      if (node.nodeType !== Node.ELEMENT_NODE) return "";
      const element = node as HTMLElement;
      const tagName = element.tagName.toLowerCase();
      if (tagName === "ol" || tagName === "ul") return serializeListElement(element as HTMLOListElement | HTMLUListElement);
      return serializeParagraphElement(element);
    })
    .filter(Boolean)
    .join("");

  const xml = bodyXml || paragraphXml(createRunXml(""));
  const namespacedDocument = `<root xmlns:w="${WORD_NAMESPACE}">${xml}</root>`;
  return namespacedDocument.replace(/^<root[^>]*>/, "").replace(/<\/root>$/, "");
}
