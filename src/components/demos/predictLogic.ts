export const MAX_SUGGESTIONS = 5;

/** Lowercase and strip diacritics, so "Ete" matches "été". */
export function fold(text: string): string {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/** The word being typed: everything after the last space. */
export function currentWord(text: string): string {
  const lastSpace = text.lastIndexOf(" ");
  return text.slice(lastSpace + 1);
}

export function suggest(
  prefix: string,
  words: readonly string[],
  usage: ReadonlyMap<string, number>,
): string[] {
  const folded = fold(prefix);
  if (folded.length === 0) return [];
  return words
    .map((word, rank) => ({ word, rank, uses: usage.get(word) ?? 0 }))
    .filter(({ word }) => fold(word).startsWith(folded) && fold(word) !== folded)
    .sort((a, b) => b.uses - a.uses || a.rank - b.rank)
    .slice(0, MAX_SUGGESTIONS)
    .map(({ word }) => word);
}

/** Replaces the word being typed with `word` followed by a space. */
export function complete(text: string, word: string): string {
  const lastSpace = text.lastIndexOf(" ");
  return `${text.slice(0, lastSpace + 1)}${word} `;
}
