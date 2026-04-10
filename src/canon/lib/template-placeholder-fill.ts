const PLACEHOLDER_REGEX = /(?:\(([^()]{2,120})\)|\[([^\[\]]{2,120})\])/g;

const EMPTY_PLACEHOLDER = "()";
const BRAZILIAN_UF_REGEX = /\b(?:AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO)\b/i;

export interface ExtractedTemplateData {
  nome: string;
  cpf: string;
  rg: string;
  endereco: string;
  logradouro: string;
  numeroEndereco: string;
  bairro: string;
  cnpj: string;
  email: string;
  telefone: string;
  cep: string;
  processo: string;
  data: string;
  valor: string;
  cidade: string;
  cidadeUf: string;
  estado: string;
  estadoCivil: string;
  estadoEmissor: string;
  profissao: string;
  nascimento: string;
}

export function createEmptyExtractedTemplateData(): ExtractedTemplateData {
  return {
    nome: "",
    cpf: "",
    rg: "",
    endereco: "",
    logradouro: "",
    numeroEndereco: "",
    bairro: "",
    cnpj: "",
    email: "",
    telefone: "",
    cep: "",
    processo: "",
    data: "",
    valor: "",
    cidade: "",
    cidadeUf: "",
    estado: "",
    estadoCivil: "",
    estadoEmissor: "",
    profissao: "",
    nascimento: "",
  };
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function unique<T>(values: T[]) {
  return Array.from(new Set(values));
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractFirst(text: string, regex: RegExp) {
  const match = text.match(regex);
  return match?.[0]?.trim() || "";
}

function normalizeLabelAlias(value: string) {
  const normalized = normalize(value);

  if (normalized.startsWith("cpf")) return "cpf";
  if (normalized.includes("rg") || normalized.includes("identidade") || normalized.includes("registro geral")) return "rg";
  if (normalized.includes("cnpj")) return "cnpj";
  if (normalized.includes("telefone") || normalized.includes("celular") || normalized.includes("fone") || normalized.includes("whatsapp")) return "telefone";
  if (normalized.includes("email") || normalized.includes("e mail") || normalized.includes("correio eletronico")) return "email";
  if (normalized.includes("cep")) return "cep";
  if (normalized.includes("processo")) return "processo";
  if (normalized.includes("valor da causa") || normalized === "valor" || normalized.includes("quantia") || normalized.includes("importe")) return "valor";
  if (normalized.includes("data de nascimento") || normalized === "nascimento") return "nascimento";
  if (normalized.includes("data do acidente") || normalized.includes("data do fato") || normalized.includes("data do documento") || normalized === "data") return "data";
  if (normalized.includes("estado civil")) return "estado civil";
  if (normalized.includes("profissao") || normalized.includes("ocupacao") || normalized.includes("funcao")) return "profissao";
  if (normalized.includes("bairro")) return "bairro";
  if (normalized.includes("numero do endereco") || normalized.includes("numero do endereço")) return "numero endereco";
  if (normalized.includes("logradouro") || normalized.includes("rua avenida estrada")) return "logradouro";
  if (normalized.includes("estado emissor") || normalized.includes("uf emissor") || normalized.includes("ssp")) return "estado emissor";
  if (normalized.includes("cidade uf")) return "cidade uf";
  if (normalized.includes("cidade") || normalized.includes("municipio") || normalized.includes("comarca")) return "cidade";
  if (normalized === "estado" || normalized === "uf") return "estado";
  if (normalized.includes("endereco") || normalized.includes("domicilio") || normalized.includes("residente em")) return "endereco";
  if (normalized.includes("nome completo") || normalized === "nome" || normalized.includes("parte autora") || normalized.includes("autor") || normalized.includes("autora") || normalized.includes("requerente") || normalized.includes("cliente") || normalized.includes("outorgante")) return "nome";

  return normalized;
}

function getExplicitValue(explicitPairs: Map<string, string>, labels: string[]) {
  for (const label of labels) {
    const normalized = normalizeLabelAlias(label);
    const exact = explicitPairs.get(normalized)?.trim();
    if (exact) return exact;
  }

  for (const [key, value] of explicitPairs.entries()) {
    if (!value?.trim()) continue;
    for (const label of labels) {
      const normalized = normalizeLabelAlias(label);
      if (normalized.length >= 4 && (key.includes(normalized) || normalized.includes(key))) {
        return value.trim();
      }
    }
  }

  return "";
}

function sanitizeExtractedValue(value: string, maxLen = 140) {
  const cleaned = value
    .replace(/\s+/g, " ")
    .replace(/^[\s,;:.\-]+|[\s,;:.\-]+$/g, "")
    .split(/\s+(?=CPF\b|RG\b|Endere[cç]o\b|Estado Civil\b|Profiss[aã]o\b|Carteira\b|Bairro\b|Cidade\b|Munic[ií]pio\b|CEP\b|Telefone\b|Email\b|E-mail\b|CNPJ\b|Nacionalidade\b|Declaro\b|Representado\b|Outorgados\b|Outorgante\b|Poderes Gerais\b|Poderes Especiais\b|vem\b|respeitosamente\b)/i)[0]
    ?.trim() || "";

  if (!cleaned) return "";
  return cleaned.length <= maxLen ? cleaned : cleaned.slice(0, maxLen).trim();
}

function normalizeUf(value: string) {
  const match = sanitizeExtractedValue(value, 20).match(BRAZILIAN_UF_REGEX);
  return match?.[0]?.toUpperCase() || "";
}

function sanitizeCityValue(value: string) {
  const cleaned = sanitizeExtractedValue(value, 80).replace(/\b(?:CEP|CPF|RG)\b.*$/i, "").trim();
  if (!cleaned) return "";

  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length > 4) {
    return parts.slice(-3).join(" ");
  }

  return cleaned;
}

function splitNeighborhoodAndCity(value: string) {
  const cleaned = sanitizeExtractedValue(value, 100);
  const parts = cleaned.split(/\s+/).filter(Boolean);

  if (parts.length > 4) {
    return {
      bairro: parts.slice(0, -3).join(" "),
      cidade: parts.slice(-3).join(" "),
    };
  }

  return { bairro: "", cidade: cleaned };
}

function extractStreetAndNumber(address: string) {
  const cleaned = sanitizeExtractedValue(address, 160);
  if (!cleaned) return { logradouro: "", numeroEndereco: "" };

  const match = cleaned.match(/^(.*?)(?:,?\s+)(\d+[A-Za-z0-9\-\/]*)$/);
  if (!match) {
    return { logradouro: cleaned, numeroEndereco: "" };
  }

  return {
    logradouro: match[1].trim(),
    numeroEndereco: match[2].trim(),
  };
}

export function cleanScannedText(text: string) {
  return text
    .replace(/\r\n?/g, "\n")
    .replace(/[\t ]+/g, " ")
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.replace(/\s*\n\s*/g, " ").replace(/\s{2,}/g, " ").trim())
    .filter(Boolean)
    .join("\n\n")
    .trim();
}

function extractExplicitPairs(text: string) {
  const pairs = new Map<string, string>();
  const lines = cleanScannedText(text).split(/\n+/).map((line) => line.trim()).filter(Boolean);

  for (const line of lines) {
    const match = line.match(/^([^:–—\-]{2,60})\s*[:–—\-]\s*(.+)$/);
    if (!match) continue;

    const key = normalizeLabelAlias(match[1]);
    const value = sanitizeExtractedValue(match[2]);
    if (key && value) pairs.set(key, value);
  }

  return pairs;
}

function extractInlinePairs(text: string) {
  const pairs = new Map<string, string>();
  const source = cleanScannedText(text);
  const labelPattern = /(nome completo|nome da parte|nome|profiss[aã]o|estado civil|endere[cç]o|cidade|munic[ií]pio|bairro|cep|cpf(?:\s*(?:n[º°o.]*)?)?|rg|identidade|data de nascimento|nascimento|telefone|celular|e-mail|email|cnpj|uf|estado|processo|n[uú]mero do processo|valor da causa|valor|quantia|logradouro|n[uú]mero do endere[cç]o)\s*[:\-–—]\s*/gi;
  const matches: Array<{ key: string; valueStart: number; nextIndex: number }> = [];
  let match: RegExpExecArray | null;

  while ((match = labelPattern.exec(source)) !== null) {
    matches.push({
      key: normalizeLabelAlias(match[1]),
      valueStart: labelPattern.lastIndex,
      nextIndex: match.index,
    });
  }

  for (let index = 0; index < matches.length; index += 1) {
    const current = matches[index];
    const next = matches[index + 1];
    const rawValue = source.slice(current.valueStart, next?.nextIndex ?? source.length);
    const value = sanitizeExtractedValue(rawValue);
    if (current.key && value) pairs.set(current.key, value);
  }

  return pairs;
}

function extractValueByKeywords(text: string, labels: string[], maxLen = 120) {
  for (const label of labels) {
    const regex = new RegExp(`${escapeRegex(label)}\\s*[:\\-–—]\\s*([^\\n]{2,${maxLen}})`, "i");
    const match = text.match(regex);
    if (match?.[1]) {
      const cleaned = sanitizeExtractedValue(match[1], maxLen);
      if (cleaned && cleaned.length >= 2) return cleaned;
    }
  }
  return "";
}

function extractPersonName(text: string, labels: string[]) {
  for (const label of labels) {
    const regex = new RegExp(
      `${escapeRegex(label)}\\s*[:\\-–—]?\\s*([A-ZÁÀÂÃÉÈÊÍÏÓÔÕÚÜÇ][a-záàâãéèêíïóôõúüç]+(?:\\s+(?:de|da|do|dos|das|e)?\\s*)*(?:[A-ZÁÀÂÃÉÈÊÍÏÓÔÕÚÜÇ][a-záàâãéèêíïóôõúüç]+\\s*){1,6})`,
      "",
    );
    const match = text.match(regex);
    if (match?.[1]?.trim() && match[1].trim().length >= 4) return sanitizeExtractedValue(match[1], 90);
  }

  for (const label of labels) {
    const regex = new RegExp(
      `${escapeRegex(label)}\\s*[:\\-–—]?\\s*([A-ZÁÀÂÃÉÈÊÍÏÓÔÕÚÜÇ]{2,}(?:\\s+(?:DE|DA|DO|DOS|DAS|E)?\\s*)*(?:[A-ZÁÀÂÃÉÈÊÍÏÓÔÕÚÜÇ]{2,}\\s*){1,6})`,
      "",
    );
    const match = text.match(regex);
    if (match?.[1]?.trim() && match[1].trim().length >= 4) return sanitizeExtractedValue(match[1], 90);
  }

  return "";
}

function extractValueNearLabels(text: string, labels: string[], valueRegex: RegExp) {
  for (const label of labels) {
    const regex = new RegExp(
      `${escapeRegex(label)}\\s*[:\\-–—]?\\s*(${valueRegex.source})`,
      valueRegex.flags.includes("i") ? valueRegex.flags : `${valueRegex.flags}i`,
    );
    const match = text.match(regex);
    if (match?.[1]) return sanitizeExtractedValue(match[1], 120);
  }

  return "";
}

function extractTrailingText(text: string, labels: string[]) {
  for (const label of labels) {
    const regex = new RegExp(`${escapeRegex(label)}\\s*[:\\-–—]?\\s*([^\\n,.]+(?:,[^\\n.]+)?)`, "i");
    const match = text.match(regex);
    if (match?.[1]) return sanitizeExtractedValue(match[1], 160);
  }

  return "";
}

function buildKnownValues(documentText: string, commandText: string) {
  const cleanedDocumentText = cleanScannedText(documentText);
  const cleanedCommandText = cleanScannedText(commandText);
  const mergedText = [cleanedCommandText, cleanedDocumentText].filter(Boolean).join("\n");
  const explicitPairs = new Map([
    ...extractExplicitPairs(cleanedDocumentText),
    ...extractInlinePairs(cleanedDocumentText),
    ...extractExplicitPairs(cleanedCommandText),
    ...extractInlinePairs(cleanedCommandText),
  ]);

  const enderecoBruto = getExplicitValue(explicitPairs, ["endereço", "endereco", "residente em", "domicílio", "domicilio", "logradouro"])
    || extractValueByKeywords(mergedText, ["endereço", "endereco", "residente em", "domicílio", "domicilio"], 160)
    || extractTrailingText(mergedText, ["residente em", "residente e domiciliado em", "residente e domiciliada em"]);
  const endereco = sanitizeExtractedValue(enderecoBruto, 160);
  const { logradouro, numeroEndereco } = extractStreetAndNumber(endereco);

  const cidadeBruta = getExplicitValue(explicitPairs, ["cidade", "município", "municipio", "comarca"])
    || extractValueByKeywords(mergedText, ["cidade", "município", "municipio", "comarca"], 80)
    || extractValueNearLabels(mergedText, ["cidade", "município", "municipio", "comarca"], /[A-ZÀ-ÚÇa-zà-úç][A-ZÀ-ÚÇa-zà-úç\s]{2,60}/);
  const cidadeDerivada = splitNeighborhoodAndCity(cidadeBruta);

  const bairro = getExplicitValue(explicitPairs, ["bairro"]) || cidadeDerivada.bairro;
  const cidade = sanitizeCityValue(cidadeDerivada.cidade);
  const estado = normalizeUf(getExplicitValue(explicitPairs, ["estado", "uf"]))
    || extractValueNearLabels(mergedText, ["estado", "uf"], BRAZILIAN_UF_REGEX)
    || extractFirst(mergedText, BRAZILIAN_UF_REGEX).toUpperCase();

  const nome = getExplicitValue(explicitPairs, ["nome completo", "nome da parte", "nome", "parte autora", "outorgante"])
    || extractPersonName(mergedText, ["nome completo", "nome", "qualificação", "qualificacao", "requerente", "autor", "autora", "cliente", "parte autora", "outorgante"])
    || extractValueByKeywords(mergedText, ["nome completo", "nome"], 90);

  return {
    explicitPairs,
    values: {
      ...createEmptyExtractedTemplateData(),
      nome,
      cpf:
        getExplicitValue(explicitPairs, ["cpf", "cpf do autor", "cpf da autora", "cpf do requerente"])
        || extractValueNearLabels(mergedText, ["cpf", "cpf do autor", "cpf da autora", "cpf do requerente"], /(?:\d{3}\.?\d{3}\.?\d{3}-?\d{2}|\d{11})\b/)
        || extractFirst(mergedText, /\b(?:\d{3}\.?\d{3}\.?\d{3}-?\d{2}|\d{11})\b/),
      cnpj:
        getExplicitValue(explicitPairs, ["cnpj", "cnpj da empresa", "cnpj da requerida"])
        || extractValueNearLabels(mergedText, ["cnpj", "cnpj da empresa", "cnpj da requerida"], /\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}\b/)
        || extractFirst(mergedText, /\b\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}\b/),
      rg:
        getExplicitValue(explicitPairs, ["rg", "identidade", "registro geral"])
        || extractValueNearLabels(mergedText, ["rg", "identidade", "registro geral"], /(?:\d{1,2}\.?\d{3}\.?\d{3}-?[\dXx]|\d{5,14})\b/)
        || extractFirst(mergedText, /\b\d{1,2}\.?\d{3}\.?\d{3}-?[\dXx]\b/),
      email:
        getExplicitValue(explicitPairs, ["email", "e-mail", "correio eletronico"])
        || extractValueNearLabels(mergedText, ["email", "e-mail", "correio eletronico"], /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)
        || extractFirst(mergedText, /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i),
      telefone:
        getExplicitValue(explicitPairs, ["telefone", "celular", "fone", "whatsapp"])
        || extractValueNearLabels(mergedText, ["telefone", "celular", "fone", "whatsapp"], /(?:\+55\s?)?(?:\(?\d{2}\)?\s?)?(?:9\d{4}|\d{4})-?\d{4}\b/)
        || extractFirst(mergedText, /(?:\+55\s?)?(?:\(?\d{2}\)?\s?)?(?:9\d{4}|\d{4})-?\d{4}\b/),
      cep:
        getExplicitValue(explicitPairs, ["cep"])
        || extractValueNearLabels(mergedText, ["cep"], /\d{5}-?\d{3}\b/)
        || extractFirst(mergedText, /\b\d{5}-?\d{3}\b/),
      processo:
        getExplicitValue(explicitPairs, ["processo", "numero do processo", "n processo", "processo nº"])
        || extractValueNearLabels(mergedText, ["processo", "numero do processo", "n processo", "processo nº"], /\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}\b/)
        || extractFirst(mergedText, /\b\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}\b/),
      data:
        getExplicitValue(explicitPairs, ["data do acidente", "data do fato", "data do documento", "data"])
        || extractValueNearLabels(mergedText, ["data do acidente", "data do fato", "data do documento", "data"], /\d{2}\/\d{2}\/\d{4}\b/)
        || extractFirst(mergedText, /\b\d{2}\/\d{2}\/\d{4}\b/),
      valor:
        getExplicitValue(explicitPairs, ["valor da causa", "valor", "quantia", "importe"])
        || extractValueNearLabels(mergedText, ["valor da causa", "valor", "quantia", "importe"], /R\$\s?\d{1,3}(?:\.\d{3})*(?:,\d{2})?/i)
        || extractFirst(mergedText, /R\$\s?\d{1,3}(?:\.\d{3})*(?:,\d{2})?/i),
      endereco,
      logradouro,
      numeroEndereco,
      bairro: sanitizeExtractedValue(bairro, 80),
      cidade,
      cidadeUf: [cidade, estado].filter(Boolean).join("/") || cidade,
      estado,
      estadoCivil:
        getExplicitValue(explicitPairs, ["estado civil"])
        || extractValueByKeywords(mergedText, ["estado civil"], 40),
      estadoEmissor:
        getExplicitValue(explicitPairs, ["estado emissor", "uf emissor", "ssp"])
        || estado,
      profissao:
        getExplicitValue(explicitPairs, ["profissão", "profissao", "função exercida", "funcao exercida", "ocupação", "ocupacao"])
        || extractValueByKeywords(mergedText, ["profissão", "profissao", "função exercida", "funcao exercida", "ocupação", "ocupacao"], 60),
      nascimento:
        getExplicitValue(explicitPairs, ["data de nascimento", "nascimento"])
        || extractValueNearLabels(mergedText, ["data de nascimento", "nascimento"], /\d{2}\/\d{2}\/\d{4}\b/)
        || extractValueByKeywords(mergedText, ["data de nascimento", "nascimento"], 20),
    },
  };
}

export function extractTemplateData({
  documentText,
  commandText = "",
}: {
  documentText: string;
  commandText?: string;
}): ExtractedTemplateData {
  const { values } = buildKnownValues(documentText, commandText);
  return {
    ...createEmptyExtractedTemplateData(),
    ...values,
  };
}

function resolvePlaceholder(
  label: string,
  documentText: string,
  commandText: string,
  fieldValues: Partial<ExtractedTemplateData> = {},
) {
  const normalizedLabel = normalizeLabelAlias(label);
  const { explicitPairs, values } = buildKnownValues(documentText, commandText);
  const manualValues = new Map(
    Object.entries(fieldValues)
      .filter(([, value]) => typeof value === "string")
      .map(([key, value]) => [normalizeLabelAlias(key), value?.trim() || ""]),
  );

  if (manualValues.has(normalizedLabel)) {
    return manualValues.get(normalizedLabel) || "";
  }

  const manualMatch = Array.from(manualValues.entries()).find(([key]) =>
    key.length >= 3 && (normalizedLabel.includes(key) || key.includes(normalizedLabel)),
  );
  if (manualMatch?.[1]) return manualMatch[1];

  if (explicitPairs.has(normalizedLabel)) {
    return explicitPairs.get(normalizedLabel) || "";
  }

  const explicitMatch = Array.from(explicitPairs.entries()).find(([key, value]) =>
    key.length >= 4 && value.length <= 200 && (normalizedLabel.includes(key) || key.includes(normalizedLabel)),
  );
  if (explicitMatch?.[1]) return explicitMatch[1];

  const resolvedValues: ExtractedTemplateData = {
    ...createEmptyExtractedTemplateData(),
    ...values,
    ...fieldValues,
  };

  const keywordGroups: Array<{ match: string[]; value: string }> = [
    { match: ["nome", "nome completo", "nome do autor", "parte autora", "requerente", "autor", "autora", "cliente"], value: resolvedValues.nome },
    { match: ["cpf", "numero do cpf", "número do cpf"], value: resolvedValues.cpf },
    { match: ["rg", "identidade", "numero da identidade", "número da identidade", "documento"], value: resolvedValues.rg },
    { match: ["profissao", "profissão", "funcao", "função", "ocupacao", "ocupação"], value: resolvedValues.profissao },
    { match: ["estado civil"], value: resolvedValues.estadoCivil },
    { match: ["email", "e mail"], value: resolvedValues.email },
    { match: ["telefone", "celular", "fone", "whatsapp"], value: resolvedValues.telefone },
    { match: ["cep"], value: resolvedValues.cep },
    { match: ["processo", "numero do processo", "n processo"], value: resolvedValues.processo },
    { match: ["valor da causa", "valor", "quantia"], value: resolvedValues.valor },
    { match: ["nascimento", "data de nascimento"], value: resolvedValues.nascimento || resolvedValues.data },
    { match: ["data do acidente", "data do fato", "data do documento", "data"], value: resolvedValues.data },
    { match: ["cidade uf"], value: resolvedValues.cidadeUf },
    { match: ["municipio", "município", "cidade", "comarca"], value: resolvedValues.cidade },
    { match: ["estado emissor", "uf emissor", "ssp"], value: resolvedValues.estadoEmissor || resolvedValues.estado },
    { match: ["estado", "uf"], value: resolvedValues.estado },
    { match: ["bairro"], value: resolvedValues.bairro },
    { match: ["numero do endereco", "numero do endereço", "número do endereço"], value: resolvedValues.numeroEndereco },
    { match: ["logradouro", "rua avenida estrada"], value: resolvedValues.logradouro || resolvedValues.endereco },
    { match: ["endereco", "endereço", "residencia", "residência"], value: resolvedValues.endereco },
    { match: ["cnpj"], value: resolvedValues.cnpj },
  ];

  const matched = keywordGroups.find((group) =>
    group.value?.trim() && group.match.some((keyword) => normalizedLabel.includes(normalizeLabelAlias(keyword)) || normalizeLabelAlias(keyword).includes(normalizedLabel)),
  );
  const value = matched?.value?.trim() || "";
  return value.length <= 300 ? value : "";
}

export function extractTemplatePlaceholders(template: string) {
  return unique(
    Array.from(template.matchAll(PLACEHOLDER_REGEX), (match) => (match[1] || match[2] || "").trim()).filter(Boolean),
  );
}

export function fillTemplatePlaceholders({
  template,
  documentText,
  commandText = "",
  fieldValues = {},
}: {
  template: string;
  documentText: string;
  commandText?: string;
  fieldValues?: Partial<ExtractedTemplateData>;
}) {
  const replacements = new Map<string, string>();
  const unresolvedDetails = new Map<string, string>();

  for (const placeholder of extractTemplatePlaceholders(template)) {
    const value = resolvePlaceholder(placeholder, documentText, commandText, fieldValues);
    if (value) {
      replacements.set(placeholder, value);
    } else {
      unresolvedDetails.set(placeholder, EMPTY_PLACEHOLDER);
    }
  }

  const content = template.replace(PLACEHOLDER_REGEX, (fullMatch, parenLabel, bracketLabel) => {
    const normalizedLabel = String(parenLabel || bracketLabel || "").trim();
    const replacement = replacements.get(normalizedLabel);
    if (replacement) return replacement;
    if (unresolvedDetails.has(normalizedLabel)) {
      return fullMatch.startsWith("[") ? "[]" : EMPTY_PLACEHOLDER;
    }
    return fullMatch;
  });

  return {
    content,
    replacements: Object.fromEntries(replacements),
    unresolved: Array.from(unresolvedDetails.keys()),
    unresolvedDetails: Object.fromEntries(unresolvedDetails),
  };
}
