export interface VSICLine {
  code: string;
  name: string;
  keywords: string[];
  isConditional: boolean;
  conditionNote?: string;
}

import rawVsic from "./vsic-2007-full.json";

const stripDiacritics = (str: string) =>
  str.normalize("NFD").replace(/\p{Diacritic}/gu, "");

const buildKeywords = (name: string) => {
  const noAccent = stripDiacritics(name);
  const tokens = name.split(/[^A-Za-zÀ-ỹ0-9]+/).filter(Boolean);
  const tokenNoAccent = tokens.map(stripDiacritics);
  const set = new Set<string>([
    name.toUpperCase(),
    noAccent.toUpperCase(),
    ...tokens.map((t) => t.toUpperCase()),
    ...tokenNoAccent.map((t) => t.toUpperCase()),
  ]);
  return Array.from(set);
};

/**
 * VSIC 2007 full dataset (461 mã ngành)
 * Nguồn: file Excel “Bảng chuyển đổi VSIC.xls” (đã convert thành JSON).
 * Tạm thời không gắn điều kiện kinh doanh; có thể bổ sung map riêng nếu cần.
 */
export const VSIC_CODES: VSICLine[] = (rawVsic as { code: string; name: string }[]).map(
  (item) => ({
    code: item.code,
    name: item.name,
    keywords: buildKeywords(item.name),
    isConditional: false,
  })
);
