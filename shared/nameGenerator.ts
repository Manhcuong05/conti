/**
 * Utility for generating creative and professional company name suggestions
 * based on a user-provided keyword, grouped by branding style.
 */
export interface GroupedCompanyNames {
  modern: string[];
  corporate: string[];
  vietnamese: string[];
}
export function generateCompanyNames(keyword: string): GroupedCompanyNames {
  if (!keyword || keyword.trim().length < 2) {
    return { modern: [], corporate: [], vietnamese: [] };
  }
  const cleanKeyword = keyword.trim();
  const modernSuffixes = ['Global', 'Solutions', 'System', 'Network', 'Labs', 'Logic'];
  const corporateSuffixes = ['Group', 'Holdings', 'Corporation', 'Venture', 'Capital', 'Corp'];
  const vnSuffixes = ['VN', 'Thương Mại', 'Đầu Tư', 'Việt Nam'];
  const initials = cleanKeyword
    .split(' ')
    .map(word => word[0])
    .filter(char => /[a-zA-Z]/.test(char))
    .join('')
    .toUpperCase();
  const modernSet = new Set<string>();
  const corporateSet = new Set<string>();
  const vietnameseSet = new Set<string>();
  // Pattern Modern: keyword + suffixes
  modernSuffixes.forEach(suf => modernSet.add(`${cleanKeyword} ${suf}`));
  // Pattern Corporate: initials + suffixes OR keyword + 'Group'
  corporateSuffixes.forEach(suf => {
    if (initials.length >= 2) corporateSet.add(`${initials} ${suf}`);
    corporateSet.add(`${cleanKeyword} ${suf}`);
  });
  // Pattern Vietnamese: keyword + VN/Thương Mại/Đầu Tư
  vnSuffixes.forEach(suf => vietnameseSet.add(`${cleanKeyword} ${suf}`));
  if (initials.length >= 2) {
    vietnameseSet.add(`${initials} VN`);
  }
  const finalize = (set: Set<string>, limit: number) =>
    Array.from(set)
      .map(name => name.toUpperCase())
      .sort(() => 0.5 - Math.random())
      .slice(0, limit);
  return {
    modern: finalize(modernSet, 6),
    corporate: finalize(corporateSet, 6),
    vietnamese: finalize(vietnameseSet, 6),
  };
}