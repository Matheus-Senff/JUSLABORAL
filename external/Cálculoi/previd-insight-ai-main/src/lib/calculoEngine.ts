import { FormData } from "@/contexts/CalculoContext";

// ======== TABELAS OFICIAIS (FONTES: BCB, IBGE, CJF, MPS, FGV) ========

// Salários mínimos históricos (valores mensais) - Fonte: Decretos Presidenciais
const SALARIOS_MINIMOS: Record<number, number> = {
  1996: 112.0, 1997: 120.0, 1998: 130.0, 1999: 136.0, 2000: 151.0,
  2001: 180.0, 2002: 200.0, 2003: 240.0, 2004: 260.0, 2005: 300.0,
  2006: 350.0, 2007: 380.0, 2008: 415.0, 2009: 465.0, 2010: 510.0,
  2011: 545.0, 2012: 622.0, 2013: 678.0, 2014: 724.0, 2015: 788.0,
  2016: 880.0, 2017: 937.0, 2018: 954.0, 2019: 998.0, 2020: 1045.0,
  2021: 1100.0, 2022: 1212.0, 2023: 1320.0, 2024: 1412.0, 2025: 1518.0,
  2026: 1600.0,
};

// ======== IGP-DI MENSAL (%) - Fonte: FGV/IBRE ========
// Aplicado de 05/1996 a 08/2006 conforme Lei 9.711/98 e Res. CJF 963/2025
const IGP_DI_MENSAL: Record<number, number[]> = {
  // [jan, fev, mar, abr, mai, jun, jul, ago, set, out, nov, dez]
  1996: [1.79, 0.29, 0.22, 0.70, 1.68, 1.22, 1.09, 0.00, 0.13, 0.22, 0.28, 0.88],
  1997: [1.58, 0.42, 1.16, 0.59, 0.30, 0.70, 0.09, -0.04, 0.59, 0.34, 0.83, 0.69],
  1998: [0.88, 0.02, 0.23, -0.13, 0.23, 0.28, -0.38, -0.17, -0.02, -0.03, -0.18, 0.98],
  1999: [1.15, 4.44, 1.98, 0.03, -0.34, 1.02, 1.59, 1.45, 1.47, 1.89, 2.53, 1.23],
  2000: [1.02, 0.19, 0.18, 0.13, 0.67, 0.93, 2.26, 1.82, 0.69, 0.37, 0.39, 0.76],
  2001: [0.49, 0.34, 0.80, 1.13, 0.44, 1.46, 1.62, 0.90, 0.38, 1.45, 0.76, 0.18],
  2002: [0.19, 0.18, 0.11, 0.70, 1.11, 1.74, 2.05, 2.36, 2.64, 4.21, 5.84, 2.70],
  2003: [2.17, 1.59, 1.66, 0.41, -0.67, -0.70, -0.20, 0.62, 0.83, 0.44, 0.48, 0.60],
  2004: [0.80, 1.08, 0.93, 1.15, 1.46, 1.29, 1.14, 1.31, 0.42, 0.53, 0.82, 0.52],
  2005: [0.33, 0.40, 0.99, 0.51, -0.25, -0.45, -0.40, -0.79, -0.13, 0.63, 0.33, 0.07],
  2006: [0.72, 0.23, -0.45, 0.02, 0.38, 0.67, 0.17, 0.41, 0.24, 0.81, 0.57, 0.26],
};

// ======== INPC MENSAL (%) - Fonte: IBGE ========
// Aplicado de 09/2006 a 11/2021 conforme Lei 8.213/91, Tema 905/STJ, Res. CJF 963/2025
const INPC_MENSAL: Record<number, number[]> = {
  2003: [2.47, 1.46, 1.37, 0.97, 0.99, -0.06, 0.18, 0.18, 0.82, 0.39, 0.37, 0.54],
  2004: [0.83, 0.39, 0.56, 0.41, 0.4, 0.5, 0.52, 0.5, 0.17, 0.14, 0.44, 0.86],
  2005: [0.57, 0.44, 0.73, 0.91, 0.49, -0.11, 0.03, -0.04, 0.15, 0.59, 0.54, 0.4],
  2006: [0.34, 0.23, 0.27, 0.12, 0.13, -0.07, 0.11, 0.04, 0.17, 0.35, 0.42, 0.62],
  2007: [0.49, 0.43, 0.37, 0.21, 0.25, 0.19, 0.24, 0.59, 0.26, 0.21, 0.38, 0.97],
  2008: [0.69, 0.48, 0.51, 0.64, 0.96, 0.79, 0.58, 0.18, 0.16, 0.45, 0.38, 0.27],
  2009: [0.64, 0.31, 0.2, 0.55, 0.6, 0.42, 0.23, 0.08, 0.16, 0.24, 0.37, 0.24],
  2010: [0.88, 0.7, 0.71, 0.73, 0.43, 0.11, 0.01, 0.07, 0.54, 0.92, 1.03, 0.6],
  2011: [0.94, 0.54, 0.66, 0.72, 0.57, 0.22, 0.0, 0.42, 0.45, 0.32, 0.57, 0.51],
  2012: [0.51, 0.39, 0.18, 0.64, 0.55, 0.26, 0.43, 0.42, 0.63, 0.6, 0.54, 0.74],
  2013: [0.92, 0.52, 0.6, 0.59, 0.35, 0.26, 0.13, 0.16, 0.27, 0.61, 0.54, 0.72],
  2014: [0.63, 0.64, 0.82, 0.78, 0.6, 0.26, 0.13, 0.18, 0.49, 0.38, 0.53, 0.62],
  2015: [1.48, 1.16, 1.51, 0.71, 0.99, 0.77, 0.58, 0.25, 0.51, 0.77, 1.11, 0.85],
  2016: [1.51, 0.95, 0.44, 0.64, 0.98, 0.47, 0.64, 0.31, 0.08, 0.17, 0.07, 0.14],
  2017: [0.42, 0.24, 0.32, 0.08, 0.36, -0.09, 0.17, 0.03, -0.02, 0.37, 0.18, 0.26],
  2018: [0.23, 0.18, 0.07, 0.21, 0.43, 1.43, 0.25, -0.03, 0.3, 0.4, -0.25, 0.14],
  2019: [0.36, 0.54, 0.77, 0.65, 0.13, -0.01, 0.1, 0.14, -0.05, 0.04, 0.54, 1.22],
  2020: [0.19, 0.17, 0.18, -0.23, -0.38, 0.3, 0.44, 0.36, 0.87, 0.89, 0.95, 1.46],
  2021: [0.27, 0.82, 0.86, 0.38, 0.44, 0.6, 1.02, 0.88, 1.2, 1.16, 0.37, 0.0],
};

// ======== IPCA MENSAL (%) - Fonte: IBGE ========
// Usado para precatórios conforme EC 136/2025
const IPCA_MENSAL: Record<number, number[]> = {
  2020: [0.21, 0.25, 0.07, -0.31, -0.38, 0.26, 0.36, 0.24, 0.64, 0.86, 0.89, 1.35],
  2021: [0.25, 0.86, 0.93, 0.31, 0.83, 0.53, 0.96, 0.87, 1.16, 1.25, 0.95, 0.73],
  2022: [0.54, 1.01, 1.62, 1.06, 0.47, 0.67, -0.68, -0.36, -0.29, 0.59, 0.41, 0.62],
  2023: [0.53, 0.84, 0.71, 0.61, 0.23, -0.08, 0.12, -0.02, 0.26, 0.24, 0.28, 0.56],
  2024: [0.42, 0.83, 0.16, 0.38, 0.46, 0.21, 0.38, -0.02, 0.44, 0.56, 0.39, 0.52],
  2025: [0.16, 1.31, 0.56, 0.43, 0.40, 0.40, 0.40, 0.40, 0.40, 0.40, 0.40, 0.40],
};

// ======== TAXA SELIC MENSAL (%) - Fonte: BCB ========
// A partir de 12/2021 conforme EC 113/2021, a SELIC engloba correção monetária E juros de mora
const SELIC_MENSAL: Record<string, number> = {
  "2021-12": 0.77,
  "2022-01": 0.73, "2022-02": 0.76, "2022-03": 0.93, "2022-04": 0.83,
  "2022-05": 1.03, "2022-06": 1.02, "2022-07": 1.03, "2022-08": 1.17,
  "2022-09": 1.07, "2022-10": 1.02, "2022-11": 1.02, "2022-12": 1.12,
  "2023-01": 1.12, "2023-02": 0.92, "2023-03": 1.17, "2023-04": 0.92,
  "2023-05": 1.12, "2023-06": 1.07, "2023-07": 1.07, "2023-08": 1.14,
  "2023-09": 0.97, "2023-10": 1.0, "2023-11": 0.92, "2023-12": 0.89,
  "2024-01": 0.97, "2024-02": 0.8, "2024-03": 0.83, "2024-04": 0.89,
  "2024-05": 0.83, "2024-06": 0.79, "2024-07": 0.91, "2024-08": 0.87,
  "2024-09": 0.84, "2024-10": 0.93, "2024-11": 0.79, "2024-12": 0.93,
  "2025-01": 1.01, "2025-02": 1.0, "2025-03": 0.96, "2025-04": 0.94,
  "2025-05": 0.94, "2025-06": 0.94, "2025-07": 0.94, "2025-08": 0.94,
  "2025-09": 0.94, "2025-10": 0.94, "2025-11": 0.94, "2025-12": 0.94,
  "2026-01": 0.94, "2026-02": 0.94, "2026-03": 0.94, "2026-04": 0.94,
};

// ======== JUROS DE POUPANÇA MENSAL (%) - Fonte: BCB ========
const JUROS_POUPANCA_MENSAL: Record<string, number> = {
  "2009-07": 0.5495, "2009-08": 0.5495, "2009-09": 0.5495, "2009-10": 0.5495, "2009-11": 0.5495, "2009-12": 0.5495,
  "2010-01": 0.5495, "2010-02": 0.5495, "2010-03": 0.5495, "2010-04": 0.5495, "2010-05": 0.5495, "2010-06": 0.5495,
  "2010-07": 0.5495, "2010-08": 0.5495, "2010-09": 0.5495, "2010-10": 0.5495, "2010-11": 0.5495, "2010-12": 0.5495,
  "2011-01": 0.5495, "2011-02": 0.5495, "2011-03": 0.5495, "2011-04": 0.5495, "2011-05": 0.5495, "2011-06": 0.5495,
  "2011-07": 0.5495, "2011-08": 0.5495, "2011-09": 0.5495, "2011-10": 0.5495, "2011-11": 0.5495, "2011-12": 0.5495,
  "2012-01": 0.5495, "2012-02": 0.5495, "2012-03": 0.5495, "2012-04": 0.5495,
  "2012-05": 0.4273, "2012-06": 0.3994, "2012-07": 0.3994, "2012-08": 0.3715,
  "2012-09": 0.3715, "2012-10": 0.3715, "2012-11": 0.3436, "2012-12": 0.3436,
  "2013-01": 0.3436, "2013-02": 0.3436, "2013-03": 0.3436, "2013-04": 0.3715,
  "2013-05": 0.3715, "2013-06": 0.3715, "2013-07": 0.3994, "2013-08": 0.3994,
  "2013-09": 0.3994, "2013-10": 0.4273, "2013-11": 0.4273, "2013-12": 0.4553,
  "2014-01": 0.4553, "2014-02": 0.4553, "2014-03": 0.4553, "2014-04": 0.4833,
  "2014-05": 0.4833, "2014-06": 0.5112, "2014-07": 0.5112, "2014-08": 0.5112,
  "2014-09": 0.5112, "2014-10": 0.5112, "2014-11": 0.5391, "2014-12": 0.5391,
  "2015-01": 0.5495, "2015-02": 0.5495, "2015-03": 0.5495, "2015-04": 0.5495,
  "2015-05": 0.5495, "2015-06": 0.5495, "2015-07": 0.5495, "2015-08": 0.5495,
  "2015-09": 0.5495, "2015-10": 0.5495, "2015-11": 0.5495, "2015-12": 0.5495,
  "2016-01": 0.5495, "2016-02": 0.5495, "2016-03": 0.5495, "2016-04": 0.5495,
  "2016-05": 0.5495, "2016-06": 0.5495, "2016-07": 0.5495, "2016-08": 0.5495,
  "2016-09": 0.5495, "2016-10": 0.5495, "2016-11": 0.5495, "2016-12": 0.5495,
  "2017-01": 0.5495, "2017-02": 0.5495, "2017-03": 0.5495, "2017-04": 0.5495,
  "2017-05": 0.5495, "2017-06": 0.5495, "2017-07": 0.5495, "2017-08": 0.5495,
  "2017-09": 0.4553, "2017-10": 0.4273, "2017-11": 0.3994, "2017-12": 0.3994,
  "2018-01": 0.3715, "2018-02": 0.3715, "2018-03": 0.3436, "2018-04": 0.3436,
  "2018-05": 0.3436, "2018-06": 0.3436, "2018-07": 0.3436, "2018-08": 0.3436,
  "2018-09": 0.3436, "2018-10": 0.3436, "2018-11": 0.3436, "2018-12": 0.3436,
  "2019-01": 0.3436, "2019-02": 0.3436, "2019-03": 0.3436, "2019-04": 0.3436,
  "2019-05": 0.3436, "2019-06": 0.3436, "2019-07": 0.3436, "2019-08": 0.3157,
  "2019-09": 0.2878, "2019-10": 0.2878, "2019-11": 0.2598, "2019-12": 0.2598,
  "2020-01": 0.2598, "2020-02": 0.2319, "2020-03": 0.204, "2020-04": 0.176,
  "2020-05": 0.176, "2020-06": 0.1481, "2020-07": 0.1481, "2020-08": 0.1201,
  "2020-09": 0.1201, "2020-10": 0.1201, "2020-11": 0.1201, "2020-12": 0.1201,
  "2021-01": 0.1201, "2021-02": 0.1201, "2021-03": 0.1201, "2021-04": 0.1481,
  "2021-05": 0.176, "2021-06": 0.204, "2021-07": 0.2319, "2021-08": 0.2878,
  "2021-09": 0.3157, "2021-10": 0.3436, "2021-11": 0.3994,
};

// Índices de reajuste anual do INSS - Fonte: Portarias MPS
const REAJUSTE_INSS: Record<number, number> = {
  1997: 7.76, 1998: 4.81, 1999: 4.61, 2000: 5.81, 2001: 7.66,
  2002: 9.20, 2003: 19.71, 2004: 4.53, 2005: 6.36, 2006: 5.01,
  2007: 3.3, 2008: 5.0, 2009: 5.92, 2010: 6.14, 2011: 6.47,
  2012: 6.08, 2013: 6.2, 2014: 5.56, 2015: 6.23, 2016: 11.28,
  2017: 6.58, 2018: 2.07, 2019: 3.43, 2020: 4.48, 2021: 5.45,
  2022: 10.16, 2023: 5.93, 2024: 3.71, 2025: 4.77, 2026: 4.5,
};

// Índices de reajuste Judiciário (INPC acumulado) - Fonte: IBGE/TRF
const REAJUSTE_JUDICIARIO: Record<number, number> = {
  1997: 9.20, 1998: 4.81, 1999: 2.49, 2000: 5.81, 2001: 9.44,
  2002: 9.44, 2003: 19.71, 2004: 10.38, 2005: 7.4, 2006: 5.05,
  2007: 3.3, 2008: 5.15, 2009: 5.92, 2010: 6.47, 2011: 6.47,
  2012: 6.08, 2013: 6.2, 2014: 5.56, 2015: 6.23, 2016: 11.28,
  2017: 6.58, 2018: 2.07, 2019: 3.43, 2020: 4.48, 2021: 5.45,
  2022: 10.16, 2023: 5.93, 2024: 3.71, 2025: 4.77, 2026: 4.5,
};

// ======== FUNÇÕES AUXILIARES ========

function parseDate(dateStr: string): Date | null {
  if (!dateStr || dateStr.length < 10) return null;
  const [d, m, y] = dateStr.split("/").map(Number);
  if (!d || !m || !y) return null;
  return new Date(y, m - 1, d);
}

function parseCurrency(value: string): number {
  if (!value) return 0;
  const clean = value.replace(/[R$\s.]/g, "").replace(",", ".");
  return parseFloat(clean) || 0;
}

function getSalarioMinimo(year: number): number {
  return SALARIOS_MINIMOS[year] || SALARIOS_MINIMOS[2026] || 1600;
}

function getSalarioMinimoAtual(): number {
  return getSalarioMinimo(new Date().getFullYear());
}

function diasNoMes(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

// ======== DETERMINAÇÃO DO ÍNDICE POR PERÍODO (Res. CJF 963/2025) ========

type IndiceAplicavel = "igp_di" | "inpc" | "selic";

/**
 * Determina qual índice de correção monetária aplicar conforme a competência:
 * - 05/1996 a 08/2006: IGP-DI (Lei 9.711/98)
 * - 09/2006 a 11/2021: INPC (Lei 8.213/91, STJ Tema 905)
 * - 12/2021 em diante: SELIC (EC 113/2021) — engloba correção + juros
 */
function getIndiceParaCompetencia(year: number, month: number): IndiceAplicavel {
  // month is 0-indexed (0=jan)
  const ym = year * 100 + (month + 1); // ex: 200609 = set/2006
  if (ym < 199605) return "igp_di"; // antes de mai/1996, usa IGP-DI como fallback
  if (ym <= 200608) return "igp_di"; // até ago/2006
  if (ym <= 202111) return "inpc";   // até nov/2021
  return "selic";                     // a partir de dez/2021
}

/**
 * Retorna a taxa mensal do índice correto para um dado mês/ano.
 */
function getTaxaMensalCorrecao(year: number, month: number): { indice: IndiceAplicavel; taxa: number } {
  const tipo = getIndiceParaCompetencia(year, month);

  if (tipo === "selic") {
    const key = `${year}-${String(month + 1).padStart(2, "0")}`;
    return { indice: "selic", taxa: SELIC_MENSAL[key] ?? 0 };
  }

  if (tipo === "igp_di") {
    const rates = IGP_DI_MENSAL[year];
    return { indice: "igp_di", taxa: rates?.[month] ?? 0 };
  }

  // INPC
  const rates = INPC_MENSAL[year];
  return { indice: "inpc", taxa: rates?.[month] ?? 0 };
}

// ======== CORREÇÃO MONETÁRIA ========

/**
 * Calcula correção monetária composta com cadeia de índices (IGP-DI → INPC → SELIC).
 * Res. CJF 963/2025 — encadeamento automático conforme período.
 */
function getCorrecaoTotal(
  fromDate: Date,
  toDate: Date,
  modoPrecatorio: boolean = false,
): {
  factorTotal: number;
  igpDiFactor: number;
  igpDiPercent: number;
  inpcFactor: number;
  inpcPercent: number;
  selicFactor: number;
  selicPercent: number;
  ipcaFactor: number;
  ipcaPercent: number;
  indiceNome: string;
} {
  let igpDiFactor = 1.0;
  let inpcFactor = 1.0;
  let selicFactor = 1.0;
  let ipcaFactor = 1.0;

  const current = new Date(fromDate.getFullYear(), fromDate.getMonth(), 1);
  const endMonth = new Date(toDate.getFullYear(), toDate.getMonth(), 1);

  if (modoPrecatorio) {
    // EC 136/2025: usa IPCA para correção de precatórios
    while (current < endMonth) {
      const year = current.getFullYear();
      const month = current.getMonth();
      const rates = IPCA_MENSAL[year];
      const taxa = rates?.[month] ?? 0;
      ipcaFactor *= 1 + taxa / 100;
      current.setMonth(current.getMonth() + 1);
    }
    return {
      factorTotal: ipcaFactor,
      igpDiFactor: 1, igpDiPercent: 0,
      inpcFactor: 1, inpcPercent: 0,
      selicFactor: 1, selicPercent: 0,
      ipcaFactor, ipcaPercent: (ipcaFactor - 1) * 100,
      indiceNome: "IPCA (EC 136/2025)",
    };
  }

  // Cadeia normal: IGP-DI → INPC → SELIC
  while (current < endMonth) {
    const year = current.getFullYear();
    const month = current.getMonth();
    const { indice, taxa } = getTaxaMensalCorrecao(year, month);
    const fator = 1 + taxa / 100;

    if (indice === "igp_di") igpDiFactor *= fator;
    else if (indice === "inpc") inpcFactor *= fator;
    else selicFactor *= fator;

    current.setMonth(current.getMonth() + 1);
  }

  const factorTotal = igpDiFactor * inpcFactor * selicFactor;

  // Build description
  const partes: string[] = [];
  if (igpDiFactor > 1.0001) partes.push("IGP-DI");
  if (inpcFactor > 1.0001) partes.push("INPC");
  if (selicFactor > 1.0001) partes.push("SELIC");
  const indiceNome = partes.join(" → ") || "—";

  return {
    factorTotal,
    igpDiFactor, igpDiPercent: (igpDiFactor - 1) * 100,
    inpcFactor, inpcPercent: (inpcFactor - 1) * 100,
    selicFactor, selicPercent: (selicFactor - 1) * 100,
    ipcaFactor: 1, ipcaPercent: 0,
    indiceNome,
  };
}

// ======== JUROS DE MORA ========

/**
 * Calcula juros moratórios conforme Lei 11.960/09:
 * - Até 06/2009: 1% a.m. (simples) — CC art. 406
 * - 07/2009 a 11/2021: juros de poupança (Lei 11.960/09, art. 1°-F)
 * - A partir de 12/2021: 0% (SELIC já engloba juros — EC 113/2021)
 *
 * Para precatórios (EC 136/2025): 2% ao ano
 */
function calcularJurosMoratorios(
  parcelaDate: Date,
  atualizacaoDate: Date,
  dataCitacao: Date | null,
  modoPrecatorio: boolean = false,
): { percentual: number; valor_sobre_principal: number } {
  const limiteEC113 = new Date(2021, 11, 1);
  const inicioLei11960 = new Date(2009, 6, 1);

  if (modoPrecatorio) {
    // EC 136/2025: juros de 2% ao ano para precatórios
    const inicioCitacao = dataCitacao || parcelaDate;
    const inicioContagem = parcelaDate > inicioCitacao ? parcelaDate : inicioCitacao;
    const diffMs = atualizacaoDate.getTime() - inicioContagem.getTime();
    const meses = diffMs / (1000 * 60 * 60 * 24 * 30.44);
    const percentual = (2 / 12) * meses; // 2% a.a. = ~0.1667% a.m.
    return { percentual, valor_sobre_principal: percentual / 100 };
  }

  if (parcelaDate >= limiteEC113) return { percentual: 0, valor_sobre_principal: 0 };

  const inicioCitacao = dataCitacao || parcelaDate;
  const inicioContagem = parcelaDate > inicioCitacao ? parcelaDate : inicioCitacao;
  const fimJuros = atualizacaoDate < limiteEC113 ? atualizacaoDate : limiteEC113;

  if (inicioContagem >= fimJuros) return { percentual: 0, valor_sobre_principal: 0 };

  let totalJurosPercent = 0;
  const current = new Date(inicioContagem.getFullYear(), inicioContagem.getMonth(), 1);
  const endMonth = new Date(fimJuros.getFullYear(), fimJuros.getMonth(), 1);

  while (current < endMonth) {
    const key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}`;

    if (current < inicioLei11960) {
      totalJurosPercent += 1.0; // 1% a.m.
    } else {
      const taxaPoupanca = JUROS_POUPANCA_MENSAL[key];
      totalJurosPercent += taxaPoupanca ?? 0.5;
    }

    current.setMonth(current.getMonth() + 1);
  }

  return { percentual: totalJurosPercent, valor_sobre_principal: totalJurosPercent / 100 };
}

// ======== REAJUSTE DA RMI ========

function getValorReajustado(
  rmiBase: number,
  anoBase: number,
  anoAtual: number,
  sistematica: "judiciario" | "inss",
  fixarSM: boolean,
): number {
  if (fixarSM) return getSalarioMinimo(anoAtual);

  let valor = rmiBase;
  const tabela = sistematica === "judiciario" ? REAJUSTE_JUDICIARIO : REAJUSTE_INSS;

  for (let ano = anoBase + 1; ano <= anoAtual; ano++) {
    const percentual = tabela[ano];
    if (percentual !== undefined) {
      valor *= 1 + percentual / 100;
    }
  }

  return valor;
}

// ======== INTERFACES ========

export interface ParcelaMensal {
  competencia: string;
  mes: number;
  ano: number;
  diasNoMes: number;
  diasTrabalhados: number;
  valorDevido: number;
  valorPago: number;
  diferenca: number;
  // Índice aplicado nesta competência
  indiceAplicado: string; // "IGP-DI", "INPC", "SELIC", "IPCA"
  // Correção monetária detalhada
  igpDiPercent: number;
  igpDiValor: number;
  inpcPercent: number;
  inpcValor: number;
  selicPercent: number;
  selicValor: number;
  ipcaPercent: number;
  ipcaValor: number;
  // Juros moratórios
  jurosMoratoriosPercent: number;
  jurosMoratoriosValor: number;
  // Totais
  valorCorrigido: number;
  valorTotal: number;
  tipo: "mensal" | "13_salario" | "vincenda" | "13_vincenda";
}

export interface ResultadoCalculo {
  parcelas: ParcelaMensal[];
  totalDevido: number;
  totalPago: number;
  totalDiferenca: number;
  totalCorrigido: number;
  totalJurosSelic: number;
  totalJurosIgpDi: number;
  totalJurosInpc: number;
  totalJurosMoratorios: number;
  totalGeral: number;
  totalVincendas: number;
  dataCalculo: string;
  modo: string;
  autor: string;
  especie: string;
  rmi: number;
  dib: string;
  dip: string;
  periodoInicio: string;
  periodoFim: string;
  correcaoAplicada: string;
  indiceCorrecaoNome: string;
  sistematicaReajuste: string;
  incluiu12Vincendas: boolean;
  incluiu13Vincendas: boolean;
  limitou60SM: boolean;
  valorCausa: number;
  teto60SM: number;
  modoPrecatorio: boolean;
}

// ======== MOTOR DE CÁLCULO ========

function criarParcela(
  competencia: string,
  mes: number,
  ano: number,
  valorBase: number,
  atualizacao: Date | null,
  dataCitacao: Date | null,
  correcaoAtiva: boolean,
  tipo: ParcelaMensal["tipo"],
  modoPrecatorio: boolean = false,
  diasTrab?: number,
): ParcelaMensal {
  const parcelaDate = new Date(ano, mes - 1, 1);
  const totalDiasMes = tipo === "13_salario" || tipo === "13_vincenda" ? 30 : diasNoMes(ano, mes - 1);
  const diasEfetivos = diasTrab ?? totalDiasMes;

  const valorDiario = valorBase / 30;
  const valorDevido = valorDiario * diasEfetivos;
  const diferenca = valorDevido;

  let igpDiPercent = 0, igpDiValor = 0;
  let inpcPercent = 0, inpcValor = 0;
  let selicPercent = 0, selicValor = 0;
  let ipcaPercent = 0, ipcaValor = 0;
  let jurosMoraPercent = 0, jurosMoraValor = 0;
  let valorCorrigido = diferenca;

  // Determine which index applies to this competence
  const indiceComp = getIndiceParaCompetencia(ano, mes - 1);
  let indiceAplicado = indiceComp === "igp_di" ? "IGP-DI" : indiceComp === "inpc" ? "INPC" : "SELIC";
  if (modoPrecatorio) indiceAplicado = "IPCA";

  if (correcaoAtiva && atualizacao && (tipo === "mensal" || tipo === "13_salario")) {
    const correcao = getCorrecaoTotal(parcelaDate, atualizacao, modoPrecatorio);

    igpDiPercent = correcao.igpDiPercent;
    inpcPercent = correcao.inpcPercent;
    selicPercent = correcao.selicPercent;
    ipcaPercent = correcao.ipcaPercent;

    if (modoPrecatorio) {
      valorCorrigido = diferenca * correcao.ipcaFactor;
      ipcaValor = valorCorrigido - diferenca;
      indiceAplicado = "IPCA";
    } else {
      // Cadeia encadeada: IGP-DI → INPC → SELIC
      const valorAposIgpDi = diferenca * correcao.igpDiFactor;
      igpDiValor = valorAposIgpDi - diferenca;

      const valorAposInpc = valorAposIgpDi * correcao.inpcFactor;
      inpcValor = valorAposInpc - valorAposIgpDi;

      const valorAposSelic = valorAposInpc * correcao.selicFactor;
      selicValor = valorAposSelic - valorAposInpc;

      valorCorrigido = valorAposSelic;
    }

    // Juros moratórios: apenas para parcelas ANTERIORES a 12/2021
    // Pós 12/2021 a SELIC já engloba correção + juros (EC 113/2021)
    const limiteEC113 = new Date(2021, 11, 1);
    if (parcelaDate < limiteEC113 || modoPrecatorio) {
      const juros = calcularJurosMoratorios(parcelaDate, atualizacao, dataCitacao, modoPrecatorio);
      jurosMoraPercent = juros.percentual;
      jurosMoraValor = diferenca * juros.valor_sobre_principal;
    }
  }

  const valorTotal = valorCorrigido + jurosMoraValor;

  return {
    competencia, mes, ano,
    diasNoMes: totalDiasMes, diasTrabalhados: diasEfetivos,
    valorDevido, valorPago: 0, diferenca,
    indiceAplicado,
    igpDiPercent, igpDiValor,
    inpcPercent, inpcValor,
    selicPercent, selicValor,
    ipcaPercent, ipcaValor,
    jurosMoratoriosPercent: jurosMoraPercent,
    jurosMoratoriosValor: jurosMoraValor,
    valorCorrigido, valorTotal, tipo,
  };
}

export function executarCalculo(formData: FormData): ResultadoCalculo {
  const inicio = parseDate(formData.dataInicioCalculo);
  const termino = parseDate(formData.dataTerminoCalculo);
  const atualizacao = parseDate(formData.dataAtualizacao) || termino;
  const dataCitacao = parseDate(formData.dataCitacao);

  if (!inicio || !termino) {
    throw new Error("Datas de início e término são obrigatórias");
  }

  const rmiBase = formData.fixarSalarioMinimo ? getSalarioMinimo(inicio.getFullYear()) : parseCurrency(formData.rmi);

  if (rmiBase <= 0 && !formData.fixarSalarioMinimo) {
    throw new Error("RMI deve ser informada ou fixar em Salário Mínimo");
  }

  const modoPrecatorio = formData.modoPrecatorio || false;

  const anoBaseRMI = inicio.getFullYear();
  const parcelas: ParcelaMensal[] = [];
  const current = new Date(inicio.getFullYear(), inicio.getMonth(), 1);
  const endDate = new Date(termino.getFullYear(), termino.getMonth(), 1);
  const previousDecemberDone: Set<number> = new Set();

  while (current <= endDate) {
    const year = current.getFullYear();
    const month = current.getMonth();

    const valorMensal = getValorReajustado(
      rmiBase, anoBaseRMI, year,
      formData.sistematicaReajuste, formData.fixarSalarioMinimo,
    );

    let diasTrab = diasNoMes(year, month);
    const isPrimeiroMes = current.getFullYear() === inicio.getFullYear() && current.getMonth() === inicio.getMonth();
    const isUltimoMes = current.getFullYear() === endDate.getFullYear() && current.getMonth() === endDate.getMonth();

    if (isPrimeiroMes && inicio.getDate() > 1) {
      diasTrab = diasNoMes(year, month) - inicio.getDate() + 1;
    }
    if (isUltimoMes && termino.getDate() < diasNoMes(year, month)) {
      diasTrab = termino.getDate();
    }

    parcelas.push(criarParcela(
      `${String(month + 1).padStart(2, "0")}/${year}`,
      month + 1, year, valorMensal,
      atualizacao, dataCitacao, formData.correcaoMonetaria,
      "mensal", modoPrecatorio, diasTrab,
    ));

    // 13° salário em dezembro
    if (formData.calcular13Dezembro && month === 11 && !previousDecemberDone.has(year)) {
      previousDecemberDone.add(year);
      const valor13 = getValorReajustado(rmiBase, anoBaseRMI, year, formData.sistematicaReajuste, formData.fixarSalarioMinimo);
      parcelas.push(criarParcela(
        `13°/${year}`, 13, year, valor13,
        atualizacao, dataCitacao, formData.correcaoMonetaria,
        "13_salario", modoPrecatorio,
      ));
    }

    // 13° proporcional no último ano
    if (isUltimoMes && month !== 11 && formData.incluir13UltimoAno && !previousDecemberDone.has(year)) {
      const mesesTrabalhados = month + 1;
      const valorBase13 = getValorReajustado(rmiBase, anoBaseRMI, year, formData.sistematicaReajuste, formData.fixarSalarioMinimo);
      const proporcional = formData.integral13UltimoAno ? valorBase13 : (valorBase13 / 12) * mesesTrabalhados;
      parcelas.push(criarParcela(
        `13° prop./${year}`, 13, year, proporcional,
        atualizacao, dataCitacao, formData.correcaoMonetaria,
        "13_salario", modoPrecatorio,
      ));
    }

    current.setMonth(current.getMonth() + 1);
  }

  // ---- Vincendas ----
  let totalVincendas = 0;
  if (formData.incluir12Vincendas) {
    for (let i = 1; i <= 12; i++) {
      const vincDate = new Date(termino.getFullYear(), termino.getMonth() + i, 1);
      const vincYear = vincDate.getFullYear();
      const vincMonth = vincDate.getMonth();
      const valorVinc = getValorReajustado(rmiBase, anoBaseRMI, vincYear, formData.sistematicaReajuste, formData.fixarSalarioMinimo);
      parcelas.push(criarParcela(
        `${String(vincMonth + 1).padStart(2, "0")}/${vincYear} (vinc.)`,
        vincMonth + 1, vincYear, valorVinc,
        null, null, false, "vincenda", false,
      ));
      totalVincendas += valorVinc;
    }

    if (formData.incluir13Vincendas) {
      const ultimoAno = termino.getFullYear();
      const ultimaRMI = getValorReajustado(rmiBase, anoBaseRMI, ultimoAno, formData.sistematicaReajuste, formData.fixarSalarioMinimo);
      parcelas.push(criarParcela(`13° vincendas`, 13, ultimoAno, ultimaRMI, null, null, false, "13_vincenda", false));
      totalVincendas += ultimaRMI;
    }
  }

  // ---- Totais ----
  const parcelasVencidas = parcelas.filter((p) => p.tipo === "mensal" || p.tipo === "13_salario");
  const totalDevido = parcelasVencidas.reduce((s, p) => s + p.valorDevido, 0);
  const totalPago = parcelasVencidas.reduce((s, p) => s + p.valorPago, 0);
  const totalDiferenca = parcelasVencidas.reduce((s, p) => s + p.diferenca, 0);
  const totalCorrigido = parcelasVencidas.reduce((s, p) => s + p.valorCorrigido, 0);
  const totalJurosSelic = parcelasVencidas.reduce((s, p) => s + p.selicValor, 0);
  const totalJurosIgpDi = parcelasVencidas.reduce((s, p) => s + p.igpDiValor, 0);
  const totalJurosInpc = parcelasVencidas.reduce((s, p) => s + p.inpcValor, 0);
  const totalJurosMoratorios = parcelasVencidas.reduce((s, p) => s + p.jurosMoratoriosValor, 0);
  const totalGeral = parcelasVencidas.reduce((s, p) => s + p.valorTotal, 0) + totalVincendas;

  const teto60SM = getSalarioMinimoAtual() * 60;
  let valorCausa = totalGeral;
  if (formData.limitar60SM) {
    valorCausa = Math.min(totalGeral, teto60SM);
  }

  // Build correction description
  let correcaoStr = "Sem correção";
  if (formData.correcaoMonetaria) {
    if (modoPrecatorio) {
      correcaoStr = "IPCA (EC 136/2025) + Juros 2% a.a. (Precatórios)";
    } else {
      const partes: string[] = [];
      if (totalJurosIgpDi > 0) partes.push("IGP-DI (Lei 9.711/98, até 08/2006)");
      if (totalJurosInpc > 0) partes.push("INPC (Lei 8.213/91, STJ Tema 905, 09/2006 a 11/2021)");
      if (totalJurosSelic > 0) partes.push("SELIC (EC 113/2021, a partir de 12/2021)");
      correcaoStr = partes.length > 0
        ? partes.join(" → ")
        : "IGP-DI → INPC → SELIC (Res. CJF 963/2025)";
    }
  }

  return {
    parcelas, totalDevido, totalPago, totalDiferenca, totalCorrigido,
    totalJurosSelic, totalJurosIgpDi, totalJurosInpc, totalJurosMoratorios,
    totalGeral, totalVincendas,
    dataCalculo: new Date().toLocaleDateString("pt-BR"),
    modo: modoPrecatorio ? "Expedição de Requisitório (Precatório)" : "Cálculo Inicial (Concessão)",
    autor: formData.autor || "Não informado",
    especie: formData.especie || "Não informada",
    rmi: rmiBase,
    dib: formData.dib || "Não informada",
    dip: formData.dip || "Não informada",
    periodoInicio: formData.dataInicioCalculo,
    periodoFim: formData.dataTerminoCalculo,
    correcaoAplicada: correcaoStr,
    indiceCorrecaoNome: modoPrecatorio ? "IPCA" : "IGP-DI → INPC → SELIC",
    sistematicaReajuste: formData.sistematicaReajuste === "judiciario" ? "Judiciário (INPC)" : "INSS (Portarias MPS)",
    incluiu12Vincendas: formData.incluir12Vincendas,
    incluiu13Vincendas: formData.incluir13Vincendas,
    limitou60SM: formData.limitar60SM,
    valorCausa, teto60SM, modoPrecatorio,
  };
}
