// Publication, audience and search are independent decisions. These rules apply
// only to the repository's explicitly allowed, versioned study sources.
export const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
export const pilot = {
  topic: '/temas/transacoes-idempotencia.html',
  foundation: '/technical-knowledge/01-fundamentals/06-databases-transactions-consistency.html#idempotencia-concorrencia',
  case: '/cases/01-payment-processing-pix.html#s08',
  practice: '/interview/simulations/04-troubleshooting/02-pedido-durante-falha-do-banco/candidato.html'
};
const instructorPaths = new Set([
  'interview/simulations/04-troubleshooting/guia-do-instrutor.md',
  'interview/simulations/04-troubleshooting/diagnostico-inicial.md',
  'interview/simulations/04-troubleshooting/rubrica.md',
  'interview/simulations/01-behavioral/mock-script.md',
  'interview/simulations/02-technical/mock-script.md'
]);
export function metadataFor(source) {
  const audience = source.endsWith('/instrutor.md') || instructorPaths.has(source) ? 'instructor' : 'student';
  return {
    id: source.replace(/\.md$/, ''), sourcePath: source,
    type: source.endsWith('/candidato.md') ? 'practice' : audience === 'instructor' ? 'instructor-guide' : source.startsWith('cases/') ? 'case' : 'reading',
    audience, publication: 'public', search: audience === 'student',
    topics: /06-databases|01-payment-processing|02-pedido-durante/.test(source) ? ['transacoes-idempotencia'] : [],
    tracks: [], prerequisites: [], relatedPractice: /06-databases|01-payment-processing/.test(source) ? [pilot.practice] : []
  };
}
const text = value => value.replace(/<[^>]*>/g, '').replace(/[*_`]/g, '').trim();
export function detailsPolicy(summary, surroundingHeading, source) {
  const label = normalize(text(summary));
  if (/^(?:(?:ver|abrir) )?(?:resposta|solucao|gabarito)\b|sample answer|optional for the teacher/.test(label)) return 'answer';
  // Numbered questions in the curated case interview sections wrap their
  // answers in details. Keep the summary (the question), omit only the body.
  if (source.startsWith('cases/') && /perguntas.*respostas comentadas/.test(normalize(surroundingHeading)) && /^\d+\./.test(label)) return 'answer';
  return 'explanation';
}
export function studentSearchMarkdown(markdown, source) {
  // Tags described inside Markdown code are examples, not disclosure blocks.
  const structure = markdown.replace(/```[\s\S]*?```|`[^`\n]*`/g, value => value.replace(/[^\n]/g, ' '));
  let result = '';
  let cursor = 0;
  const opening = /<details\b[^>]*>/gi;
  let match;
  while ((match = opening.exec(structure))) {
    result += markdown.slice(cursor, match.index);
    const tags = /<details\b[^>]*>|<\/details\s*>/gi;
    tags.lastIndex = opening.lastIndex;
    let depth = 1, end;
    while ((end = tags.exec(structure))) {
      depth += /^<\/details/i.test(end[0]) ? -1 : 1;
      if (!depth) break;
    }
    if (!end) throw new Error(`Bloc details incomplet: ${source}`);
    const block = markdown.slice(match.index, tags.lastIndex);
    const summary = block.match(/<summary\b[^>]*>([\s\S]*?)<\/summary>/i)?.[1] || '';
    const headings = [...markdown.slice(0, match.index).matchAll(/^##\s+(.+)$/gm)];
    const policy = detailsPolicy(summary, headings.at(-1)?.[1] || '', source);
    result += policy === 'answer' ? `\n${text(summary).replace(/Vitória/g, 'the candidate')}\n` : block;
    cursor = tags.lastIndex;
    opening.lastIndex = cursor;
  }
  result += markdown.slice(cursor);
  // Explicit answer sections outside details (e.g. the worked case opening).
  const lines = result.split('\n');
  let excludedLevel = 0;
  result = lines.filter(line => {
    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      if (excludedLevel && level <= excludedLevel) excludedLevel = 0;
      if (/^(?:\d+(?:\.\d+)*[.)]?\s+)?(?:resposta (?:esperada|de abertura|modelo|exemplo)|solucao(?: comentada)?|gabarito)\b/.test(normalize(text(heading[2])))) { excludedLevel = level; return true; }
    }
    return !excludedLevel;
  }).join('\n');
  // Paths/link labels for deliberate instructor access are not search material.
  result = result.replace(/\[([^\]]*)\]\(([^)]*(?:instrutor|diagnostico-inicial|rubrica|mock-script)[^)]*)\)/gi, '');
  return result.replace(/Vitória(?:'s)?/g, 'the candidate');
}

// Explicit section mapping for the long cases; the full H2/H3 TOC remains.
export const caseGroups = [
  { label: 'Contexto e decisões', anchors: ['s01', 's02', 's03', 's04', 's05'] },
  { label: 'Arquitetura e funcionamento', anchors: ['s06', 's07', 's08', 's09', 's10', 's11'] },
  { label: 'Trade-offs e operação', anchors: ['s12', 's13', 's14', 's15', 's16', 's17', 's18'] },
  { label: 'Prática e referências', anchors: ['s19', 's20', 's21', 's22', 's23'] }
];

// Curated against the current headings, independently for each case. A renamed
// or moved heading falls back to the complete TOC instead of being mislabelled.
export const caseSectionContracts = {
  "cases/01-payment-processing-pix.md": {
    "s01": "1. Problema de negócio e escopo",
    "s06": "6. Visão geral em Mermaid",
    "s12": "12. Trade-offs que precisam ser defendidos",
    "s19": "19. Roteiro de laboratório e testes"
  },
  "cases/02-open-finance-apis.md": {
    "s01": "1. Problema de negócio e escopo",
    "s06": "6. Visão geral e jornada em Mermaid",
    "s12": "12. Trade-offs que precisam ser defendidos",
    "s19": "19. Roteiro de laboratório e testes"
  },
  "cases/03-event-driven-banking.md": {
    "s01": "1. Problema de negócio e escopo",
    "s06": "6. Arquiteturas em Mermaid",
    "s12": "12. Trade-offs que precisam ser defendidos",
    "s19": "19. Roteiro de laboratório e testes"
  },
  "cases/04-kyc-account-opening.md": {
    "s01": "1. Problema de negócio e escopo",
    "s06": "6. Arquitetura e workflow em Mermaid",
    "s12": "12. Trade-offs que precisam ser defendidos",
    "s19": "19. Roteiro de laboratório e testes"
  },
  "cases/05-core-banking-modernization.md": {
    "s01": "1. Problema de negócio e escopo",
    "s06": "6. Arquitetura e ondas em Mermaid",
    "s12": "12. Trade-offs que precisam ser defendidos",
    "s19": "19. Roteiro de laboratório e testes"
  },
  "cases/06-genai-financial-advisor.md": {
    "s01": "1. Problema de negócio e escopo",
    "s06": "6. Arquitetura e jornadas em Mermaid",
    "s12": "12. Trade-offs que precisam ser defendidos",
    "s19": "19. Roteiro de laboratório e testes"
  },
  "cases/07-real-time-fraud-detection.md": {
    "s01": "1. Problema de negócio e escopo",
    "s06": "6. Arquitetura e dois caminhos em Mermaid",
    "s12": "12. Trade-offs que precisam ser defendidos",
    "s19": "19. Roteiro de laboratório e testes"
  },
  "cases/08-financial-data-lake.md": {
    "s01": "1. Problema de negócio e escopo",
    "s06": "6. Arquitetura e fronteiras em Mermaid",
    "s12": "12. Trade-offs que precisam ser defendidos",
    "s19": "19. Roteiro de laboratório e testes"
  },
  "cases/09-multi-region-internet-banking.md": {
    "s01": "1. Problema de negócio e escopo",
    "s06": "6. Arquitetura e recuperação em Mermaid",
    "s12": "12. Trade-offs que precisam ser defendidos",
    "s19": "19. Roteiro de laboratório e testes"
  },
  "cases/10-card-authorization-platform.md": {
    "s01": "1. Problema de negócio e escopo",
    "s06": "6. Arquitetura e cadeia de cartões em Mermaid",
    "s12": "12. Trade-offs que precisam ser defendidos",
    "s19": "19. Roteiro de laboratório e testes"
  }
};
