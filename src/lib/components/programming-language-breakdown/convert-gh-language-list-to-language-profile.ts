export default function convertGhLanguageListToLanguageProfile(
  ghLanguageList: Record<string, number> | null,
): Array<{ language: string; pct: number }> {
  if (!ghLanguageList) return [];

  const total = Object.values(ghLanguageList).reduce((acc, curr) => acc + curr, 0);
  return Object.entries(ghLanguageList).map(([language, count]) => ({
    language,
    pct: (count / total) * 100,
  }));
}
