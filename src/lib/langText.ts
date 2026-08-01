import type { Lang } from './translations';
import type { LocalizedText } from '../types';

export function pickText(value: LocalizedText | undefined, lang: Lang): string {
  if (typeof value === 'string') return value || '';
  return (value && (value[lang] || value.en || value.fr)) || '';
}
