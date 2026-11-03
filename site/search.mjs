// Shared whole-term matching prevents STAR from matching "estar".
export const normalize = value => String(value).normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('pt-BR');
export const tokenize = value => (normalize(value).match(/[\p{L}\p{N}]+/gu) || [])
  // The material uses both grammatical forms of this Portuguese term. Keep
  // this correction narrow so technical names and acronyms retain exact terms.
  .map(term => term === 'retentativas' ? 'retentativa' : term);
export function rankSearch(items, query) {
  const terms = [...new Set(tokenize(query))];
  if (!terms.length) return [];
  return items.map(item => {
    const title = new Set(tokenize(item.title));
    const section = new Set(tokenize(item.section));
    const body = new Set(tokenize(`${item.description || ''} ${item.text || ''}`));
    if (!terms.every(term => title.has(term) || section.has(term) || body.has(term))) return { item, score: 0 };
    const score = terms.reduce((sum, term) => sum + (title.has(term) ? 20 : 0) + (section.has(term) ? 5 : 0) + (body.has(term) ? 1 : 0), 0);
    return { item, score: score + (normalize(item.title).includes(normalize(query).trim()) ? 10 : 0) };
  }).filter(match => match.score > 0).sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title, 'pt-BR'));
}
