import { collectionMetadataFor, isStandaloneReference } from './collection-policy.mjs';
import { isAuthoredStory } from './story-policy.mjs';
// Explicitly retired by the owner. Keep the lifecycle list central so old Git
// entries cannot republish them and route audits exempt only these removals.
export const retiredDocuments = [
  'interview/checklist.md',
  'interview/common-questions.md',
  'interview/interview-preparation-plan.md'
].map(source => ({ source, url: `/${source.replace(/\.md$/, '.html')}` }));
const retiredSources = new Set(retiredDocuments.map(doc => doc.source));
const retiredUrls = new Set(retiredDocuments.map(doc => doc.url));
export const isRetiredSource = source => retiredSources.has(source);
export const isRetiredUrl = value => {
  const pathname = String(value).split(/[?#]/, 1)[0];
  return retiredUrls.has(pathname.startsWith('/') ? pathname : `/${pathname}`);
};
// Publication, audience and search are independent decisions. These rules apply
// only to the repository's explicitly allowed, versioned study sources.
export const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
export const pilot = {
  topic: '/temas/transacoes-idempotencia.html',
  foundation: '/technical-knowledge/01-fundamentals/06-databases-transactions-consistency.html#idempotencia-concorrencia',
  practice: '/interview/simulations/04-troubleshooting/02-pedido-durante-falha-do-banco/candidato.html'
};
// A path within Fundamentos, using the original documents exactly once.
// Its order is explicit so lab READMEs never interrupt the ten lessons.
export const acidCourse = {
  id: 'acid-do-zero',
  label: 'Transações e ACID do zero',
  prefix: 'technical-knowledge/01-fundamentals/acid/',
  lessons: [
    ['README.md', 'Visão geral da trilha'],
    ['00-transacoes-do-zero.md', '00 — Introdução às transações'],
    ['01-atomicidade.md', '01 — Atomicidade'],
    ['02-consistencia.md', '02 — Consistência'],
    ['03-isolamento.md', '03 — Isolamento'],
    ['04-anomalias-e-niveis.md', '04 — Anomalias e níveis'],
    ['05-locks-concorrencia-deadlocks.md', '05 — Locks e concorrência'],
    ['06-durabilidade.md', '06 — Durabilidade'],
    ['07-timeout-idempotencia.md', '07 — Idempotência'],
    ['08-acid-base-sql-nosql.md', '08 — ACID, BASE e SQL/NoSQL'],
    ['09-revisao-e-desafio.md', '09 — Revisão e desafio']
  ],
  support: [
    ['glossario.md', 'Glossário'],
    ['referencias-e-revisao-tecnica.md', 'Referências e revisão técnica'],
    ['laboratorio/README.md', 'Laboratório: escolha do roteiro'],
    ['laboratorio/postgresql/README.md', 'PostgreSQL: ambiente e execução'],
    ['laboratorio/postgresql/roteiro.md', 'PostgreSQL: roteiro em duas sessões'],
    ['laboratorio/postgresql/sql-executavel.md', 'PostgreSQL: SQL completo'],
    ['laboratorio/mysql-comparativo/README.md', 'MySQL: comparativo']
  ]
};
export const redesCourse = {
  id: 'redes-do-zero',
  label: 'Redes do zero',
  prefix: 'technical-knowledge/01-fundamentals/redes/',
  lessons: [
    ['README.md', 'Visão geral da trilha'],
    ['00-clique-resposta.md', '00 — Do clique à resposta'],
    ['01-ip-cidr-subnets.md', '01 — IP, CIDR e sub-redes'],
    ['02-rotas-ida-volta.md', '02 — Rotas de ida e volta'],
    ['03-dns-nomes.md', '03 — DNS e nomes'],
    ['04-transportes-portas-http.md', '04 — Transportes, portas e HTTP'],
    ['05-https-tls.md', '05 — HTTPS e TLS'],
    ['06-vpc-subnets-saida.md', '06 — VPC, subnets e saída'],
    ['07-sg-nacl.md', '07 — SG e NACL'],
    ['08-publicar-aplicacao.md', '08 — Publicar uma aplicação'],
    ['09-investigacao-evidencias.md', '09 — Investigar com evidências'],
    ['10-peering-tgw.md', '10 — Peering, TGW e segmentação'],
    ['11-conectividade-hibrida.md', '11 — Rede local, VPN, DX e BGP'],
    ['12-falha-recuperacao-dns.md', '12 — Falha, recuperação e DNS'],
    ['13-revisao-desafios.md', '13 — Revisão e desafios']
  ],
  support: [
    ['glossario.md', 'Glossário'],
    ['equivocos-correcoes.md', 'Equívocos e correções'],
    ['referencias-e-revisao-tecnica.md', 'Referências e revisão técnica'],
    ['laboratorio/README.md', 'Laboratórios: visão geral'],
    ['laboratorio/l1-cidr-rotas.md', 'L1 — CIDR e rotas'],
    ['laboratorio/l2-processo-porta.md', 'L2 — Processo e porta'],
    ['laboratorio/l3-conectou-demorou.md', 'L3 — Conectou e demorou'],
    ['laboratorio/l4-nome-certificado.md', 'L4 — Nome e certificado'],
    ['laboratorio/l5-topologias-registros.md', 'L5 — Topologias e registros'],
    ['simulados/README.md', 'Simulados da trilha']
  ]
};
export const courses = [redesCourse, acidCourse];
export const isAcidSource = source => typeof source === 'string' && source.startsWith(acidCourse.prefix);
export const isRedesSource = source => typeof source === 'string' && source.startsWith(redesCourse.prefix);
// The owner approved this supplied assessment for named publication, separately
// from the ten authored stories. Other assessments and local records stay private.
export const phoneScreenReview = Object.freeze({
  source: 'interview/phone-screen/instrutor.md',
  url: '/interview/phone-screen/instrutor.html'
});
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
    type: source.endsWith('/candidato.md') ? 'practice' : audience === 'instructor' ? 'instructor-guide' : isStandaloneReference(source) ? 'case' : 'reading',
    audience, publication: 'public', ...collectionMetadataFor(source, audience),
    ...(['interview/simulations/05-mentoria-transacoes/candidato.md', 'interview/simulations/07-mentoria-redes/candidato.md'].includes(source) ? { readingLabel: 'Revisão da conversa · próximos passos' } : {}),
    ...(source === 'interview/simulations/05-mentoria-transacoes/instrutor.md' ? { instructorNotice: 'Apoio de revisão com perguntas e fichas em branco. Material público; mantenha respostas preenchidas e evidências internas em uma cópia privada.' } : {}),
    ...(source === phoneScreenReview.source ? {
      readingLabel: 'Revisão do Phone Screen · plano de treino',
      instructorNotice: 'Análise do Phone Screen publicada com autorização do proprietário, com nomes e detalhes do insumo. Acesso público, sem autenticação. Registros de novos ensaios continuam privados; esta revisão fica fora da busca e do progresso de estudo.'
    } : {}),
    topics: !isStandaloneReference(source) && /06-databases|02-pedido-durante/.test(source) ? ['transacoes-idempotencia'] : [],
    tracks: isAcidSource(source) ? [acidCourse.id] : isRedesSource(source) && audience === 'student' ? [redesCourse.id] : [], prerequisites: [], relatedPractice: !isStandaloneReference(source) && /06-databases/.test(source) ? [pilot.practice] : []
  };
}
const text = value => value.replace(/<[^>]*>/g, '').replace(/[*_`]/g, '').trim();
export function detailsPolicy(summary, surroundingHeading, source) {
  const label = normalize(text(summary));
  if (/^(?:(?:ver|abrir) )?(?:resposta|solucao|gabarito)\b|^(?:(?:view|show|read|open) )?(?:prepared answer|answer)\b|sample answer|optional for the teacher/.test(label)) return 'answer';
  // Numbered questions in the curated case interview sections wrap their
  // answers in details. Keep the summary (the question), omit only the body.
  if (isStandaloneReference(source) && /perguntas.*respostas comentadas/.test(normalize(surroundingHeading)) && /^\d+\./.test(label)) return 'answer';
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
    result += policy === 'answer' ? `\n${isAuthoredStory(source) ? text(summary) : text(summary).replace(/Vitória/g, 'the candidate')}\n` : block;
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
  return isAuthoredStory(source) ? result : result.replace(/Vitória(?:'s)?/g, 'the candidate');
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
