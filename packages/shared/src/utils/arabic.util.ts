/**
 * Normalize Arabic text for consistent search/indexing.
 * Strips diacritics, unifies alef/hamza variants, ى→ي, ة→ه, tatweel.
 * Use before storing to a normalized field and before running a search query.
 */
export function normalizeArabic(text: string): string {
  return text
    .trim()
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670]/g, '') // tashkeel
    .replace(/[أإآٱ]/g, 'ا') // alef / hamza variants → bare alef
    .replace(/ى/g, 'ي') // alef maksura → ya
    .replace(/ة/g, 'ه') // teh marbuta → ha
    .replace(/\u0640/g, ''); // tatweel
}
