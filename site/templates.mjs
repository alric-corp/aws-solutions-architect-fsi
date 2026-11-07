import { siteName, sections, libraryGroups } from './content.mjs';
import { caseCollection, isStandalone, mainSections, participatesInMainStudy } from './collection-policy.mjs';
const learningSections = mainSections(sections).filter(section => section.description);
import { pilot, caseGroups, caseSectionContracts, courses } from './content-policy.mjs';
import { focusHub } from './focus-policy.mjs';
import { renderStudyPlan } from './study-plan.mjs';
export const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const icons = {
  route: '<path d="M5 5h10a4 4 0 0 1 0 8H9a3 3 0 0 0 0 6h10"/><circle cx="5" cy="5" r="2"/><path d="m16 16 3 3-3 3"/>',
  layers: '<path d="m12 3 10 5-10 5L2 8l10-5Zm-9 9 9 5 9-5M3 17l9 5 9-5"/>',
  star: '<path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><path d="M14 6h4v5M6 14v4h5"/>',
  bank: '<path d="m3 8 9-5 9 5H3Zm2 3v7m7-7v7m7-7v7M3 21h18"/>',
  people: '<circle cx="9" cy="7" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3m1-17a3 3 0 0 1 0 6m3 11v-4a5 5 0 0 0-2-4"/>',
  chat: '<path d="M21 11a9 9 0 0 1-9 9H4l-3 3V11a10 10 0 0 1 20 0Z"/><path d="M6 8h10M6 12h7"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m16 8-2 6-6 2 2-6 6-2Z"/>',
  chart: '<path d="M4 3v17h17M8 15l4-5 4 2 5-7"/>',
  file: '<path d="M14 2H5v20h14V7l-5-5Zm0 0v6h5M8 12h8M8 16h6"/>',
  book: '<path d="M12 5c-3-3-7-3-10-2v16c4-1 7-1 10 2 3-3 6-3 10-2V3c-3-1-7-1-10 2Zm0 0v16"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v1"/>',
  home: '<path d="m3 10 9-8 9 8v11h-7v-7h-4v7H3V10Z"/>',
  search: '<circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>'
};
const icon = (name, cls = '') => `<svg class="icon ${cls}" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.file}</svg>`;

const globals = [ ['Início','/index.html'],['Biblioteca','/biblioteca/index.html'],['Praticar','/praticar/index.html'],['Meu estudo','/meu-estudo/index.html'] ];
const courseEntries = course => [...course.lessons, ...course.support];
const courseIndex = course => `${course.prefix}README.md`;
const courseMap = new Map(courses.flatMap(course => courseEntries(course).map(([file, label]) => [course.prefix + file, { course, label }])));
const activeCourseFor = source => courseMap.get(source)?.course || null;
export const labelFor = doc => courseMap.get(doc.source)?.label || (doc.source.endsWith('/README.md') ? 'Visão geral' : doc.title.replace(/^\d+\s*[—–-]\s*/, '').replace(/^Case \d+\s*[—–-]\s*/, ''));
export const hrefFor = (source, docs) => docs.get(source)?.url || `/${source.replace(/\/$/, '')}/index.html`;
export function contextualDocuments(active, docs) {
  if (!active) return [];
  if (isStandalone(active)) return [...docs.values()].filter(doc => isStandalone(doc) && doc.collection === active.collection);
  if (active.audience === 'instructor') return [...docs.values()].filter(doc => !isStandalone(doc) && doc.audience === 'instructor');
  if (active.type === 'practice') return [...docs.values()].filter(doc => doc.type === 'practice');
  const course = activeCourseFor(active.source);
  if (course) return courseEntries(course).flatMap(([file]) => docs.get(course.prefix + file) || []);
  return [...docs.values()].filter(doc => !isStandalone(doc) && !activeCourseFor(doc.source) && doc.section.id === active.section.id && doc.audience === 'student');
}
function sidebar(active, docs) {
  const siblings = contextualDocuments(active, docs);
  const course = activeCourseFor(active?.source);
  const link = doc => `<a href="${doc.url}" ${active.id === doc.id ? 'aria-current="page" class="active"' : ''}>${escape(labelFor(doc))}</a>`;
  const courseEntry = !course && active?.section.id === 'fundamentals' && active?.type !== 'practice' && active?.audience !== 'instructor'
    ? courses.filter(item => docs.has(courseIndex(item))).map(item => `<a href="${hrefFor(courseIndex(item), docs)}">${item.label} →</a>`).join('')
    : '';
  const items = course
    ? siblings.map(doc => `${doc.source === course.prefix + course.support[0][0] ? '<p class="nav-label">APOIO E LABORATÓRIOS</p>' : ''}${link(doc)}`).join('')
    : siblings.map(link).join('');
  return `<aside class="sidebar" id="navigation" aria-label="Navegação contextual"><a class="context-back" href="${active ? active.type === 'practice' || active.audience === 'instructor' ? '/praticar/index.html' : hrefFor(active.section.index, docs) : '/biblioteca/index.html'}">← ${active?.type === 'practice' ? 'Praticar' : active?.section.label || 'Biblioteca'}</a><p class="nav-label">${course ? course.label : active ? active.audience === 'instructor' ? 'MATERIAL DO INSTRUTOR' : active.type === 'practice' ? 'SIMULADOS · CANDIDATA' : 'NESTA ÁREA' : 'SEU PRÓXIMO PASSO'}</p><nav class="nav-items">${courseEntry}${siblings.length ? items : `<a href="${pilot.topic}">Transações e idempotência</a><a href="/technical-knowledge/02-system-design/00-system-design-from-zero.html">Comece do zero</a><a href="/praticar/index.html">Escolha um simulado</a>`}</nav></aside>`;
}
function breadcrumbsFor(active, docs) {
  const separator = '<span aria-hidden="true">/</span>';
  const section = `<a href="${active.type === 'practice' || active.audience === 'instructor' ? '/praticar/index.html' : hrefFor(active.section.index, docs)}">${active.type === 'practice' ? 'Praticar' : active.section.label}</a>`;
  const course = activeCourseFor(active.source);
  if (course) {
    const index = courseIndex(course);
    return `<a href="/biblioteca/index.html">Biblioteca</a>${separator}${section}${separator}${active.source === index ? `<span aria-current="location">${course.label}</span>` : `<a href="${hrefFor(index, docs)}">${course.label}</a>${separator}<span aria-current="location">${escape(labelFor(active))}</span>`}`;
  }
  return `${isStandalone(active) ? `<a href="/biblioteca/index.html">Biblioteca</a>${separator}` : ''}${section}${separator}<span aria-current="location">${active.audience === 'instructor' ? 'Material do instrutor' : escape(labelFor(active))}</span>`;
}
function headerMarkup(current) {
  const links=globals.map(([label,url])=>`<a href="${url}" ${url===current?'aria-current="page"':''}>${label}</a>`).join('');
  return `<header class="topbar"><div class="header-inner ui-container"><a class="brand" href="/index.html"><span class="brand-mark" aria-hidden="true">a<span>p</span><i></i></span><span>Arquitetura<small>em prática</small></span></a><div class="desktop-nav-slot"><nav class="global-nav" aria-label="Navegação principal">${links}</nav></div><div class="header-utilities"><button type="button" class="search-trigger" data-search-open aria-label="Buscar no material">${icon('search')}<span class="search-label">Buscar</span><kbd class="search-hint" data-search-shortcut aria-hidden="true" hidden></kbd></button><div class="desktop-theme-slot"><label class="theme-control" id="theme-control" for="theme-preference"><span class="theme-label">Tema</span><select id="theme-preference"><option value="system">Sistema</option><option value="light">Claro</option><option value="dark">Escuro</option></select></label></div><button type="button" class="global-menu-toggle" id="global-menu-toggle" aria-expanded="false" aria-controls="global-menu-panel" aria-label="Abrir navegação principal" hidden>${icon('menu')}<span>Menu</span></button></div></div></header><dialog id="global-menu-panel" aria-labelledby="global-menu-title"><div class="global-menu-heading"><h2 id="global-menu-title">Navegação principal</h2><button type="button" data-global-menu-close aria-label="Fechar navegação principal">Fechar ${icon('close')}</button></div><div class="global-menu-content"></div></dialog><noscript><nav class="global-nav-fallback ui-container" aria-label="Navegação principal sem JavaScript">${links}</nav></noscript>`;
}
export function layout({title, description, body, active, toc='', isHome=false, global='/biblioteca/index.html', docs, studyScope='main'}) {
  if (isHome) global='/index.html';
  const hasSidebar=Boolean(active);
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escape(title)} · ${siteName}</title><meta name="description" content="${escape(description)}"><meta name="theme-color" content="#1C1A17"><link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"><script src="/assets/theme-init.js"></script><link rel="stylesheet" href="/assets/site.css"><script type="module" src="/assets/site.js"></script></head><body data-study-scope="${active?.collection || studyScope}" class="${isHome ? 'home-page' : hasSidebar ? 'reading-page' : 'hub-page'}" ${active ? `data-document="${escape(active.url)}" data-title="${escape(active.title)}" data-content-id="${escape(active.id)}" data-content-version="${active.contentVersion}" data-audience="${active.audience}"` : ''}>
  <a class="skip-link" href="#main">Pular para o conteúdo</a>${headerMarkup(global)}
  ${hasSidebar ? sidebar(active,docs) : '<aside id="navigation" class="hub-navigation" hidden></aside>'}<button class="nav-backdrop" aria-label="Fechar navegação" tabindex="-1" hidden></button><div class="workspace"><nav class="breadcrumbs ui-container" aria-label="Localização">${hasSidebar ? `<button class="menu-toggle icon-button" aria-controls="navigation" aria-expanded="false" aria-label="Abrir área da aula">${icon('menu')}<span class="context-nav-label">Área da aula</span></button>` : ''}<a href="/index.html">Início</a><span aria-hidden="true">/</span>${active ? breadcrumbsFor(active, docs) : `<span>${global==='/index.html'?'Visão geral':globals.find(item=>item[1]===global)?.[0]||escape(title)}</span>`}</nav>
  <p class="storage-notice" role="status" hidden></p><p class="resume-notice" role="status" hidden></p><p id="interaction-status" class="interaction-status" role="status" aria-live="polite"></p>
  <main id="main" tabindex="-1" class="${hasSidebar?'reading-main':'home-main'}">${toc}${body}</main><footer class="page-footer"><span>${siteName} · Preparação para Solutions Architect FSI</span><span>Material independente de estudo. Sem afiliação oficial à Amazon. <a href="/references/index.html">Fontes e referências</a></span></footer></div>
  <dialog class="search-dialog" aria-labelledby="search-title"><div class="search-heading"><span id="search-title">Buscar no material de estudo</span><button class="icon-button" data-search-close aria-label="Fechar busca">${icon('close')}</button></div><div class="search-input-wrap">${icon('search')}<input id="search-input" type="search" autocomplete="off" placeholder="Tema, serviço ou pergunta…" aria-label="Buscar no material"></div><p class="search-status" role="status">Digite pelo menos 2 caracteres. Perguntas e explicações, sem gabaritos.</p><div class="search-results"></div><div class="search-footer">Respostas recolhidas e material do instrutor ficam fora desta busca.<button type="button" data-search-retry hidden>Tentar novamente</button><kbd>Esc</kbd></div></dialog>
  <dialog id="diagram-dialog" class="diagram-dialog" aria-labelledby="diagram-title"><div class="diagram-toolbar"><h2 id="diagram-title">Diagrama ampliado</h2><div><button data-diagram-zoom="out" aria-label="Reduzir diagrama">−</button><button data-diagram-zoom="fit">Ajustar</button><button data-diagram-zoom="in" aria-label="Ampliar diagrama">+</button><button data-diagram-close>Fechar ${icon('close')}</button></div></div><div class="diagram-stage" tabindex="0" aria-label="Diagrama ampliado com rolagem"></div></dialog>
  <noscript><p class="noscript-notice">O conteúdo e os links funcionam sem JavaScript. Busca, preferências, retomada e ampliação de diagramas precisam de JavaScript.</p></noscript></body></html>`;
}
export function tocFor(doc) {
  let items='', previousLevel='';
  for (const heading of doc.headings) {
    if(heading.level==='h2') {
      if(previousLevel==='h3') items+='</ol></li>';
      else if(previousLevel==='h2') items+='</li>';
      items+=`<li><a href="#${escape(heading.id)}">${escape(heading.title)}</a>`;
    } else {
      if(previousLevel!=='h3') items+=previousLevel==='h2'?'<ol>':'<li><ol>';
      items+=`<li><a href="#${escape(heading.id)}">${escape(heading.title)}</a></li>`;
    }
    previousLevel=heading.level;
  }
  if(previousLevel==='h3') items+='</ol></li>';
  else if(previousLevel==='h2') items+='</li>';
  return `<details class="toc" id="page-toc" open><summary>Nesta página</summary><nav aria-label="Sumário do documento"><ol>${items}</ol></nav><a class="back-top" href="#main">Voltar ao início ↑</a></details>`;
}
export function articleBody(doc, html, docs) {
  const sequence=contextualDocuments(doc,docs), position=sequence.indexOf(doc), next=sequence[position+1], previous=sequence[position-1], course=activeCourseFor(doc.source);
  const toolbar=`<div class="reader-toolbar" role="group" aria-label="Preferências de leitura"><button id="focus-toggle" aria-pressed="false">Modo foco</button><div class="text-controls"><button data-text-size="decrease" aria-label="Diminuir texto">A−</button><span class="text-size-label" aria-live="polite">Texto padrão</span><button data-text-size="increase" aria-label="Aumentar texto">A+</button></div></div>`;
  const contracts=caseSectionContracts[doc.source]||{};
  const mappedGroups=caseGroups.map(group=>({label:group.label,anchor:group.anchors.find(anchor=>contracts[anchor]&&doc.existingAnchors.includes(anchor)&&doc.headings.some(heading=>heading.title===contracts[anchor]))})).filter(group=>group.anchor);
  const groups=doc.type==='case'?`<nav class="case-sections" aria-label="Blocos do case">${mappedGroups.map(group=>`<a href="#${group.anchor}">${group.label}</a>`).join('')}</nav>`:'';
  const pilotLinks=doc.url===pilot.foundation.split('#')[0]?`<a href="${pilot.practice}">Praticar: pedido durante falha do banco →</a>`:doc.url===pilot.practice?`<a href="${pilot.foundation}">Voltar à seção estudada no F06 →</a>`:'';
  const instructorNotice=doc.audience==='instructor'?`<p class="audience-notice">${escape(doc.instructorNotice || 'Este roteiro contém respostas e evidências. Compartilhe somente a abertura da candidata. Ele é público e não exige autenticação.')}</p>`:'';
  const collectionNotice=isStandalone(doc)?'<p class="audience-notice">Coleção de consulta opcional · a leitura aqui fica separada do percurso principal. <a href="/biblioteca/index.html">Voltar à Biblioteca</a></p>':'';
  return `<div class="article-column">${toolbar}<div class="article-kicker"><span>${doc.readingLabel?escape(doc.readingLabel):doc.audience==='instructor'?'Leitura deliberada · material público do instrutor':doc.type==='practice'?'Simulado oral · candidata':escape(doc.section.label)}</span><span>${doc.minutes} min de leitura estimada</span></div>${instructorNotice}${collectionNotice}${groups}<article class="prose">${html}</article>${pilotLinks?`<nav class="pilot-links" aria-label="Continuar o percurso de transações e idempotência">${pilotLinks}</nav>`:''}<div class="study-actions"><div><strong>${isStandalone(doc)?'Registrar leitura nesta coleção':'Registrar esta leitura'}</strong><p>${isStandalone(doc)?'Este registro não altera o progresso principal.':'A marcação registra leitura; não é uma avaliação de domínio.'}</p></div><button class="read-toggle" aria-pressed="false">${icon('check')}<span>Marcar como lido</span></button></div><nav class="article-pagination" aria-label="Continuidade de leitura">${previous?`<a href="${previous.url}"><small>← ANTERIOR</small>${escape(labelFor(previous))}</a>`:'<span></span>'}${next?`<a href="${next.url}"><small>PRÓXIMO →</small>${escape(labelFor(next))}</a>`:course?`<a href="${hrefFor(courseIndex(course), docs)}">Voltar à trilha ${course.id === 'acid-do-zero' ? 'ACID' : escape(course.label)} →</a>`:'<a href="/biblioteca/index.html">Voltar à biblioteca →</a>'}</nav></div>`;
}
const resume = `<section class="resume-study" hidden><div><span class="eyebrow">CONTINUAR SEU ESTUDO</span><h2>Retome a última seção.</h2><a id="resume-link" data-resume-link href="${pilot.foundation}"></a></div>${icon('arrow')}</section>`;
export function homeBody(docs) {
  const focusDoc = docs.get(focusHub);
  return `<section class="hero"><div class="hero-copy"><span class="eyebrow">PREPARAÇÃO PARA SOLUTIONS ARCHITECT · FSI</span><h1>Entenda o mecanismo. Defenda a decisão.</h1><p>Construa sua base, conecte os conceitos e pratique a explicação das suas escolhas em serviços financeiros.</p><div class="hero-actions"><a class="button button-primary hero-study-action" href="${pilot.topic}">Estudar transações e idempotência ${icon('arrow')}</a><a class="hero-secondary" href="/technical-knowledge/02-system-design/00-system-design-from-zero.html">Está começando? Acompanhe a Loja Horizonte →</a></div></div><img class="hero-cover" src="/assets/amazon.jpg" width="2048" height="1360" alt="Capa de referência com a marca Amazon em composição laranja, creme e carvão" fetchpriority="high"></section><section class="tracks" id="trilhas"><div class="section-heading"><div><span class="eyebrow">ESCOLHA SEU PONTO DE PARTIDA</span><h2>Fundamentos, decisões e prática.</h2></div><a href="/biblioteca/index.html">Ver na Biblioteca →</a></div><div class="track-grid">${learningSections.map(section=>`<a class="track-card" href="${hrefFor(section.index,docs)}"><span class="track-icon">${icon(section.icon)}</span><h3>${section.label}</h3><p>${section.description}</p><span class="track-card-bottom">Explorar ${icon('arrow')}</span></a>`).join('')}${focusDoc ? `<a class="track-card track-card-focus" href="${focusDoc.url}"><span class="track-icon">${icon('star')}</span><h3>Foco do loop</h3><p>Os nove princípios em destaque, suas oito histórias e rodadas no formato das entrevistas.</p><span class="track-card-bottom">Explorar ${icon('arrow')}</span></a>` : ''}</div></section>`;
}
export function collectionBody(title, description, children) {
  return `<section class="collection"><span class="eyebrow">BIBLIOTECA DE ESTUDO</span><h1>${escape(title)}</h1><p>${escape(description)}</p><div class="collection-list">${children.map(doc=>`<a href="${doc.url}"><div><small>${escape(doc.section.label)}</small><h2>${escape(doc.title)}</h2><p>${escape(doc.description)}</p></div>${icon('arrow')}</a>`).join('')}</div></section>`;
}
export function libraryBody(docs) {
  const student = doc => Boolean(doc && doc.audience === 'student' && !isStandalone(doc));
  const available = entry => entry.url || (entry.source.endsWith('/')
    ? [...docs.values()].some(doc => doc.source.startsWith(entry.source) && student(doc))
    : student(docs.get(entry.source)));
  const entryUrl = entry => escape(entry.url || hrefFor(entry.source, docs));
  const jumpLinks = libraryGroups.map(group => `<li><a href="#library-${group.id}">${escape(group.navigationLabel)}</a></li>`).join('');
  const groups = libraryGroups.map(group => {
    const entries = group.entries.filter(available);
    const materials = entries.filter(entry => !entry.support).map(entry => `<li><a href="${entryUrl(entry)}"><div><h3>${escape(entry.label)}</h3><p>${escape(entry.description)}</p></div>${icon('arrow')}</a></li>`).join('');
    const support = entries.filter(entry => entry.support).map(entry => `<li><a href="${entryUrl(entry)}"><span>${escape(entry.label)}</span>${icon('arrow')}</a></li>`).join('');
    const supportArea = support ? `<footer class="library-support"><h3>Materiais de apoio</h3><ul class="library-support-list">${support}</ul></footer>` : '';
    const instructorNote = group.id === 'practice' ? '<p class="library-instructor-note">Os roteiros com gabarito permanecem no acesso deliberado do instrutor em Praticar.</p>' : '';
    return `<section class="library-group" data-library-group="${group.id}" aria-labelledby="library-${group.id}"><header class="library-group-heading"><span class="library-group-icon" aria-hidden="true">${icon(group.icon)}</span><div><h2 id="library-${group.id}" tabindex="-1">${escape(group.title)}</h2><p>${escape(group.description)}</p></div></header><ul class="library-materials">${materials}</ul>${supportArea}${instructorNote}</section>`;
  }).join('');
  return `<section class="collection library-catalog" aria-labelledby="library-title"><span class="eyebrow">CONSULTA POR OBJETIVO</span><h1 id="library-title">Biblioteca</h1><p>Escolha o material pelo objetivo do estudo.</p><nav class="library-jump-links" aria-label="Categorias da Biblioteca"><p>Ir para:</p><ul>${jumpLinks}</ul></nav><div class="library-grid">${groups}</div><aside class="library-standalone" aria-label="Coleção independente"><span class="eyebrow">CONSULTA OPCIONAL</span><a href="${caseCollection.indexUrl}">${caseCollection.label} ${icon('arrow')}</a><p>${escape(sections.find(section => section.id === 'cases').description)}</p></aside><p class="library-resources"><a href="${hrefFor('README.md', docs)}">Como usar o material</a><span aria-hidden="true"> · </span><a href="${hrefFor('references/README.md', docs)}">Fontes e revisão do material</a></p></section>`;
}
export function hubs(docs) {
  const values=[...docs.values()], students=values.filter(doc=>doc.audience==='student'&&!isStandalone(doc));
  return [
    {url:'/biblioteca/index.html',title:'Biblioteca',body:libraryBody(docs)},
    {url:'/praticar/index.html',title:'Praticar',body:collectionBody('Praticar','Escolha uma abertura e investigue oralmente. Peça evidências ao instrutor conforme suas hipóteses; não é preciso digitar respostas.',students.filter(doc=>doc.type==='practice'))+`<section class="instructor-entry" id="instrutor"><details><summary>Sou instrutor: consultar roteiros e gabaritos públicos</summary><p>A abertura da candidata fica separada dos roteiros. Estes links oferecem acesso deliberado a respostas públicas; não há autenticação.</p><ul>${values.filter(doc=>doc.audience==='instructor').map(doc=>`<li><a href="${doc.url}">${escape(doc.title)} · ${escape(doc.source.includes('/instrutor.md')?doc.source.split('/').at(-2).replace(/^\d+-/,'').replaceAll('-',' '):'guia')}</a></li>`).join('')}</ul></details></section>`},
    {url:'/meu-estudo/index.html',title:'Meu estudo',body:`<section class="collection"><span class="eyebrow">REGISTROS LOCAIS</span><h1>Meu estudo</h1><p>Acompanhe o plano até a entrevista, retome uma seção ou consulte suas marcações de leitura neste navegador. Uma leitura marcada não representa domínio do assunto. Os registros do instrutor não entram na retomada de estudante.</p>${renderStudyPlan()}${resume}<p><strong id="read-count">0</strong> leituras marcadas neste navegador.</p><div class="progress-track" role="progressbar" aria-label="Leituras marcadas" aria-valuemin="0" aria-valuemax="${values.filter(participatesInMainStudy).length}" aria-valuenow="0"><span id="read-progress"></span></div><h2>Leituras marcadas</h2><div class="study-history"><p>Ative JavaScript para consultar os registros locais.</p></div><p>Os dados ficam neste navegador e podem ser removidos por suas configurações. Não há sincronização entre dispositivos.</p></section>`},
    {url:pilot.topic,title:'Transações e idempotência',body:`<section class="collection topic-page"><span class="eyebrow">PERCURSO DE ESTUDO</span><h1>Transações e idempotência</h1><p>O cliente recebeu um timeout. O que isso permite concluir sobre a operação? Construa o raciocínio em dois passos, sem antecipar a solução do simulado.</p><ol class="journey-steps"><li><h2>1. Entenda o mecanismo no F06</h2><p>Estude concorrência e idempotência, depois a fronteira da transação e o significado de uma resposta incerta. Essa base explica o que pode ser garantido.</p><a href="${pilot.foundation}">Abrir F06 na seção de idempotência →</a></li><li><h2>2. Investigue como candidata</h2><p>Use somente a abertura do pedido durante falha do banco. Sustente as hipóteses com as evidências solicitadas e comunique o grau de certeza.</p><a href="${pilot.practice}">Abrir simulado sem gabarito →</a></li></ol><a href="/biblioteca/index.html">← Voltar à Biblioteca</a></section>`}
  ];
}

export function standaloneCollectionBody(docs) {
  const members=[...docs.values()].filter(isStandalone);
  return collectionBody(caseCollection.label, 'Coleção independente e opcional para consulta. Estes materiais não fazem parte das trilhas, da busca global ou do progresso principal.', members)+`<section class="collection"><a href="/biblioteca/index.html">← Voltar à Biblioteca</a><section class="resume-study" hidden><div><span class="eyebrow">CONTINUAR NESTA COLEÇÃO</span><h2>Retome sua consulta.</h2><a id="resume-link" data-resume-link href="${caseCollection.indexUrl}"></a></div>${icon('arrow')}</section><h2>Leituras desta coleção</h2><p><strong id="read-count">0</strong> leituras marcadas aqui, separadas do estudo principal.</p><div class="study-history"><p>Ative JavaScript para consultar os registros locais desta coleção.</p></div></section>`;
}
