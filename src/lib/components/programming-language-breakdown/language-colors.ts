import type { UserCodeMetricsDto } from '../../utils/wave/types/user';
import colors from './colors.json';

export function getLanguageColor(language: string): string {
  const lang = language.toLowerCase();

  const match = language in colors ? colors[language as keyof typeof colors] : null;

  if (match && match.color) {
    return match.color;
  }

  // else, generate a random color with language as seed
  let hash = 0;
  for (let i = 0; i < lang.length; i++) {
    hash = lang.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color =
    '#' +
    ((hash >> 24) & 0xff).toString(16).padStart(2, '0') +
    ((hash >> 16) & 0xff).toString(16).padStart(2, '0') +
    ((hash >> 8) & 0xff).toString(16).padStart(2, '0');
  return color;
}

export function enrichCodeMetricLanguageBreakdownWithColors(
  languageBreakdown: UserCodeMetricsDto['lifetime_language_profile'],
): (UserCodeMetricsDto['lifetime_language_profile'][number] & { color: string })[] {
  return languageBreakdown.map((entry) => ({
    ...entry,
    color: getLanguageColor(entry.language),
  }));
}
