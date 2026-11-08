/* Interview practice with browser-only records. No analytics, remote calls, TTS, or shared site state. */
const DIMENSIONS = [
  ['aderencia', 'Aderência à pergunta'],
  ['responsabilidade', 'Responsabilidade individual'],
  ['raciocinio', 'Raciocínio e decisão'],
  ['colaboracao', 'Colaboração e comunicação'],
  ['resultado', 'Resultado e evidência'],
  ['aprendizado', 'Aprendizado e limites'],
];
const RATINGS = [
  ['nao-observado', 'Não observado'],
  ['demonstrado', 'Demonstrado'],
  ['parcial', 'Parcial'],
  ['a-aprofundar', 'A aprofundar'],
];
const KIND_LABELS = {
  behavioral: 'Comportamental',
  technical: 'Técnica',
  consultative: 'Conversa consultiva',
  presentation: 'Apresentação',
};
const ASSESSMENT_VALUES = {
  quality: ['nao-observado', 'incompleta', 'regular', 'boa', 'excelente'],
  support: ['espontanea', 'apos-aprofundamento', 'apos-explicacao'],
  bases: ['fato-projeto', 'a-confirmar', 'hipotese', 'melhoria-hoje'],
  actions: ['melhorar-explicacao', 'confirmar-evidencia', 'revisar-conceito', 'variar-cenario'],
};

function node(tag, attributes = {}, children = []) {
  const element = document.createElement(tag);
  for (const [key, value] of Object.entries(attributes)) {
    if (value == null || value === false) continue;
    if (key === 'className') element.className = value;
    else if (key === 'text') element.textContent = String(value);
    else if (key === 'value') element.value = String(value);
    else if (key === 'checked') element.checked = Boolean(value);
    else if (key === 'disabled') element.disabled = Boolean(value);
    else if (key === 'hidden') element.hidden = Boolean(value);
    else element.setAttribute(key, value === true ? '' : String(value));
  }
  for (const child of [children].flat(Infinity)) {
    if (child != null && child !== false) element.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return element;
}

function button(text, action, attributes = {}) {
  return node('button', { type: 'button', className: 'loop-button', 'data-action': action, text, ...attributes });
}

function replaceContent(element, ...children) {
  element.replaceChildren(...children.flat(Infinity).filter(child => child != null && child !== false));
}

function textList(values) {
  return node('ul', {}, (Array.isArray(values) ? values : []).map(value => node('li', { text: value })));
}

function details(title, children, attributes = {}) {
  return node('details', { className: 'loop-details', ...attributes }, [node('summary', { text: title }), node('div', { className: 'loop-stack' }, children)]);
}

function escaped(value) {
  return String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
}

// Markdown is generated locally. Keep only inert markup, including in the isolated presentation.
function inertHtml(value) {
  const template = document.createElement('template');
  template.innerHTML = typeof value === 'string' ? value : '';
  const allowed = new Set(['P', 'BR', 'STRONG', 'B', 'EM', 'I', 'CODE', 'PRE', 'UL', 'OL', 'LI', 'TABLE', 'THEAD', 'TBODY', 'TFOOT', 'TR', 'TH', 'TD', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'HR', 'DL', 'DT', 'DD', 'SPAN', 'A', 'SUP', 'SUB']);
  for (const element of [...template.content.querySelectorAll('*')]) {
    if (!allowed.has(element.tagName)) {
      if (['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'FORM', 'INPUT', 'BUTTON', 'TEXTAREA', 'SELECT', 'LINK', 'META', 'BASE', 'IMG', 'SVG', 'MATH'].includes(element.tagName)) element.remove();
      else element.replaceWith(...element.childNodes);
      continue;
    }
    for (const attribute of [...element.attributes]) element.removeAttribute(attribute.name);
  }
  return template.innerHTML;
}

function htmlBlock(value, attributes = {}) {
  const element = node('div', { className: 'loop-markdown', ...attributes });
  element.innerHTML = inertHtml(value);
  return element;
}

function safeLocalUrl(value) {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) return '#';
  try {
    const target = new URL(value, location.origin);
    return target.origin === location.origin ? `${target.pathname}${target.search}${target.hash}` : '#';
  } catch { return '#'; }
}

const app = document.getElementById('app');
let data;
try {
  data = JSON.parse(document.getElementById('loop-data')?.textContent || '{}');
  if (data.schemaVersion !== 1 || !Array.isArray(data.sessions) || !data.sessions.length) throw new Error('Invalid practice data');
} catch {
  if (app) app.replaceChildren(node('main', { className: 'loop-panel' }, [
    node('h1', { text: 'Não foi possível abrir o roteiro' }),
    node('p', { text: 'Confira o material do roteiro. Conduza a conversa oralmente; não compartilhe esta tela.' }),
  ]));
}

if (data?.schemaVersion === 1 && Array.isArray(data.sessions) && data.sessions.length && app) startApp();

function startApp() {
  const isPublic = data.publication === 'public';
  const STORAGE_PREFIX = isPublic ? 'loop-practice:v1' : 'loop-private:v1';
  const THEME_KEY = `${STORAGE_PREFIX}:theme`;
  document.body.dataset.loopPublication = isPublic ? 'public' : 'private';
  let storageBlocked = false;
  const recordCache = new Map();
  const runtime = new Map();
  const deepRuntime = new Map();
  const deepContexts = new WeakMap();
  const deepProxies = new Map();
  let activeSessionIndex = 0;
  let questionSerial = 0;
  let themePreference = 'system';
  const media = typeof matchMedia === 'function' ? matchMedia('(prefers-color-scheme: dark)') : null;

  function warnStorage() {
    storageBlocked = true;
    const warning = document.getElementById('loop-storage-warning');
    if (warning) warning.hidden = false;
    updateSaveStatus();
  }

  function readStorage(key) {
    if (storageBlocked) return null;
    try { return localStorage.getItem(key); }
    catch { warnStorage(); return null; }
  }

  function writeStorage(key, value) {
    if (storageBlocked) return false;
    try { localStorage.setItem(key, value); return true; }
    catch { warnStorage(); return false; }
  }

  function recordKey(session) { return `${STORAGE_PREFIX}:${data.pageId}:${session.id}`; }

  function deepVariants(session) { return session.deepDiveTraining?.variants || []; }

  function moduleOnlySession(session) {
    return isPublic && Boolean(session.deepDiveTraining) && !(session.questions?.length || session.reserves?.length || session.agenda?.length);
  }

  function isoDate(value) {
    return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value) && Number.isFinite(Date.parse(value));
  }

  function deepDebrief(value, module) {
    const source = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    const output = {
      opinion: '', justification: '', comparison: '', facets: {}, technical: {}, ladderMap: '', corrections: '',
      priorities: Array.from({ length: 3 }, () => ({ practice: '', criterion: '' })),
      realStoryConfirmed: source.realStoryConfirmed === true,
      star: { situation: '', task: '', action: '', result: '' }, extraQuestions: ['', '', ''],
      englishFeedback: '', nextVersion: '', nextReason: '',
    };
    for (const field of ['justification', 'comparison', 'ladderMap', 'corrections', 'englishFeedback', 'nextReason']) if (typeof source[field] === 'string') output[field] = source[field];
    if (['inclined', 'not-inclined', 'inconclusivo'].includes(source.opinion)) output.opinion = source.opinion;
    if (['v1', 'v2', 'v3'].includes(source.nextVersion)) output.nextVersion = source.nextVersion;
    for (const [field, definitions] of [['facets', module.facets || []], ['technical', module.technicalDimensions || []]]) {
      for (const definition of definitions) {
        const item = source[field]?.[definition.id];
        const observation = { evidence: '', quality: 'nao-observado', support: '', concern: '' };
        for (const key of ['evidence', 'concern']) if (typeof item?.[key] === 'string') observation[key] = item[key];
        if (ASSESSMENT_VALUES.quality.includes(item?.quality)) observation.quality = item.quality;
        if (ASSESSMENT_VALUES.support.includes(item?.support)) observation.support = item.support;
        output[field][definition.id] = observation;
      }
    }
    for (let index = 0; index < 3; index += 1) {
      for (const field of ['practice', 'criterion']) if (typeof source.priorities?.[index]?.[field] === 'string') output.priorities[index][field] = source.priorities[index][field];
      if (typeof source.extraQuestions?.[index] === 'string') output.extraQuestions[index] = source.extraQuestions[index];
    }
    for (const field of ['situation', 'task', 'action', 'result']) if (typeof source.star?.[field] === 'string') output.star[field] = source.star[field];
    return output;
  }

  function restoreDeepRuns(value, session) {
    const module = session.deepDiveTraining;
    if (!module || !value || typeof value !== 'object' || Array.isArray(value)) return null;
    const restored = { nextSequence: 1, order: [], attempts: {} };
    const knownEvents = ['start', 'pause', 'coaching', 'debrief', 'retry', 'english', 'portuguese', 'time', 'next', 'instructor', 'exposure', 'question', 'phase', 'resume', 'record-debrief'];
    const attempts = value.attempts && typeof value.attempts === 'object' && !Array.isArray(value.attempts) ? value.attempts : {};
    const orderedIds = [...new Set([...(Array.isArray(value.order) ? value.order : []), ...Object.keys(attempts)])];
    for (const id of orderedIds) {
      if (typeof id !== 'string' || !/^run-[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id.slice(4))) || Number(id.slice(4)) >= Number.MAX_SAFE_INTEGER || !Object.prototype.hasOwnProperty.call(attempts, id)) continue;
      const source = attempts[id];
      const variant = deepVariants(session).find(item => item.id === source?.variantId);
      if (!variant || !isoDate(source.createdAt)) continue;
      const questions = [...(variant.questions || []), ...(variant.reserves || [])];
      const attempt = {
        id, variantId: variant.id, createdAt: source.createdAt, language: source.language === 'en' ? 'en' : 'pt',
        status: source.status === 'debrief' ? 'debrief' : 'practice', exposed: source.exposed === true,
        remainingMinutes: Number.isSafeInteger(source.remainingMinutes) && source.remainingMinutes >= 0 ? source.remainingMinutes : null,
        phaseIndex: Number.isInteger(source.phaseIndex) && source.phaseIndex >= 0 && source.phaseIndex < variant.agenda.length ? source.phaseIndex : 0,
        questionIndex: Number.isInteger(source.questionIndex) && source.questionIndex >= 0 && source.questionIndex < questions.length ? source.questionIndex : 0,
        coachingDraft: typeof source.coachingDraft === 'string' ? source.coachingDraft : '',
        coverageNotes: typeof source.coverageNotes === 'string' ? source.coverageNotes : '',
        coachingLog: Array.isArray(source.coachingLog) ? source.coachingLog.filter(item => isoDate(item?.at) && typeof item.note === 'string').map(item => ({ at: item.at, note: item.note })) : [],
        events: Array.isArray(source.events) ? source.events.filter(item => isoDate(item?.at) && knownEvents.includes(item.type)).map(item => ({ at: item.at, type: item.type, message: typeof item.message === 'string' ? item.message : '' })) : [],
        evidenceLog: [], exerciseDrafts: {}, debrief: deepDebrief(source.debrief, module),
        debriefRecordedAt: isoDate(source.debriefRecordedAt) ? source.debriefRecordedAt : null,
      };
      if (Array.isArray(source.evidenceLog)) attempt.evidenceLog = source.evidenceLog.filter(entry => {
        const question = questions.find(item => item.id === entry?.questionId);
        return isoDate(entry?.releasedAt) && question?.exercise?.cards?.some(card => card.id === entry.cardId);
      }).map(entry => ({ questionId: entry.questionId, cardId: entry.cardId, releasedAt: entry.releasedAt, request: typeof entry.request === 'string' ? entry.request : '', conditionalConfirmed: entry.conditionalConfirmed === true }));
      for (const question of questions) if (typeof source.exerciseDrafts?.[question.id]?.request === 'string') attempt.exerciseDrafts[question.id] = { request: source.exerciseDrafts[question.id].request };
      restored.attempts[id] = attempt;
      restored.order.push(id);
      restored.nextSequence = Math.max(restored.nextSequence, Number(id.slice(4)) + 1);
    }
    return restored;
  }

  function guidedQuestions(session) {
    if (!session.evaluationGuide) return [];
    return (session.questions || []).filter(question => question.evaluatorGuide && typeof question.id === 'string');
  }

  function hasEvaluatorGuide(session, question) {
    return guidedQuestions(session).some(item => item.id === question.id);
  }

  function assessmentDraft(value) {
    const source = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    const draft = {
      date: '', quality: 'nao-observado', support: '', said: '', demonstrated: '', missing: '',
      bases: [], actions: [], nextTest: '',
    };
    for (const field of ['said', 'demonstrated', 'missing', 'nextTest']) {
      if (typeof source[field] === 'string') draft[field] = source[field];
    }
    if (typeof source.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(source.date)) {
      const date = new Date(`${source.date}T00:00:00Z`);
      if (Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === source.date) draft.date = source.date;
    }
    for (const field of ['quality', 'support']) {
      if (ASSESSMENT_VALUES[field].includes(source[field])) draft[field] = source[field];
    }
    for (const field of ['bases', 'actions']) {
      if (Array.isArray(source[field])) draft[field] = [...new Set(source[field].filter(value => ASSESSMENT_VALUES[field].includes(value)))];
    }
    return draft;
  }

  function emptyRecord(session) {
    const record = {
      schemaVersion: 1, pageId: String(data.pageId), sessionId: String(session.id), updatedAt: null,
      episodio: '', dimensions: Object.fromEntries(DIMENSIONS.map(([key]) => [key, { status: 'nao-observado', note: '' }])),
      duvida: '', ajuda: '', proxima: '', evidenceLog: [], exerciseDrafts: {},
    };
    if (guidedQuestions(session).length) record.questionAssessments = {};
    return record;
  }

  function recordFor(session) {
    const context = deepContexts.get(session);
    if (context) return context.attempt;
    const key = recordKey(session);
    if (recordCache.has(key)) return recordCache.get(key);
    const record = emptyRecord(session);
    const stored = readStorage(key);
    if (stored) {
      try {
        const saved = JSON.parse(stored);
        if (saved?.schemaVersion === 1 && saved.pageId === String(data.pageId) && saved.sessionId === String(session.id)) {
          for (const field of ['episodio', 'duvida', 'ajuda', 'proxima']) if (typeof saved[field] === 'string') record[field] = saved[field];
          for (const [dimension] of DIMENSIONS) {
            const item = saved.dimensions?.[dimension];
            if (RATINGS.some(([value]) => value === item?.status)) record.dimensions[dimension].status = item.status;
            if (typeof item?.note === 'string') record.dimensions[dimension].note = item.note;
          }
          record.updatedAt = typeof saved.updatedAt === 'string' ? saved.updatedAt : null;
          record.evidenceLog = Array.isArray(saved.evidenceLog) ? saved.evidenceLog.filter(entry => entry && typeof entry.questionId === 'string' && typeof entry.cardId === 'string' && typeof entry.releasedAt === 'string').map(entry => ({
            questionId: entry.questionId, cardId: entry.cardId, releasedAt: entry.releasedAt,
            request: typeof entry.request === 'string' ? entry.request : '', conditionalConfirmed: entry.conditionalConfirmed === true,
          })) : [];
          if (saved.exerciseDrafts && typeof saved.exerciseDrafts === 'object' && !Array.isArray(saved.exerciseDrafts)) {
            if (moduleOnlySession(session)) {
              // Retired questions are no longer rendered, but their private drafts remain exportable.
              record.exerciseDrafts = Object.fromEntries(Object.entries(saved.exerciseDrafts)
                .filter(([, draft]) => draft && typeof draft.request === 'string')
                .map(([id, draft]) => [id, { request: draft.request }]));
            } else {
              for (const question of [...(session.questions || []), ...(session.reserves || [])]) {
                const draft = saved.exerciseDrafts[question.id];
                if (draft && typeof draft.request === 'string') {
                  record.exerciseDrafts[question.id] = { request: draft.request };
                }
              }
            }
          }
          if (record.questionAssessments && saved.questionAssessments && typeof saved.questionAssessments === 'object' && !Array.isArray(saved.questionAssessments)) {
            for (const question of guidedQuestions(session)) {
              if (!Object.prototype.hasOwnProperty.call(saved.questionAssessments, question.id)) continue;
              const assessment = saved.questionAssessments[question.id];
              if (!assessment || typeof assessment !== 'object' || Array.isArray(assessment)) continue;
              record.questionAssessments[question.id] = {
                draft: assessmentDraft(assessment.draft),
                observations: Array.isArray(assessment.observations) ? assessment.observations.filter(observation =>
                  observation && typeof observation.savedAt === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(observation.savedAt) && Number.isFinite(Date.parse(observation.savedAt))
                ).map(observation => ({ ...assessmentDraft(observation), savedAt: observation.savedAt })) : [],
              };
            }
          }
          const deepRuns = restoreDeepRuns(saved.deepDiveRuns, session);
          if (deepRuns) record.deepDiveRuns = deepRuns;
        }
      } catch { announce('O registro local anterior não pôde ser lido. Um registro vazio está disponível nesta sessão.'); }
    }
    recordCache.set(key, record);
    return record;
  }

  function saveRecord(session) {
    const context = deepContexts.get(session);
    if (context) { saveRecord(context.owner); return; }
    const record = recordFor(session);
    record.updatedAt = new Date().toISOString();
    writeStorage(recordKey(session), JSON.stringify(record));
    updateSaveStatus();
  }

  function updateSaveStatus() {
    const status = document.getElementById('loop-save-status');
    if (!status) return;
    status.textContent = storageBlocked
      ? 'Registro mantido apenas nesta aba. Exporte o JSON antes de fechar.'
      : 'Registro privado salvo neste navegador a cada alteração. Você pode exportá-lo em JSON.';
  }

  function announce(message) {
    const status = document.getElementById('loop-status');
    if (status) status.textContent = message;
  }

  function applyTheme() {
    document.body.dataset.loopTheme = themePreference === 'system' ? (media?.matches ? 'dark' : 'light') : themePreference;
  }

  const savedTheme = readStorage(THEME_KEY);
  if (['system', 'light', 'dark'].includes(savedTheme)) themePreference = savedTheme;
  applyTheme();
  media?.addEventListener?.('change', () => { if (themePreference === 'system') applyTheme(); });

  const themeSelect = node('select', { id: 'loop-theme', 'data-action': 'theme', 'aria-label': isPublic ? 'Tema do roteiro público' : 'Tema da página privada' }, [
    node('option', { value: 'system', text: 'Sistema' }), node('option', { value: 'light', text: 'Claro' }), node('option', { value: 'dark', text: 'Escuro' }),
  ]);
  themeSelect.value = themePreference;
  themeSelect.addEventListener('change', () => {
    themePreference = themeSelect.value;
    applyTheme();
    writeStorage(THEME_KEY, themePreference);
  });

  const header = node('header', { className: 'loop-header' }, [
    node('div', { className: 'loop-brand' }, [
      node('span', { className: 'loop-eyebrow', text: isPublic ? 'Roteiro público · instrutor' : 'Roteiro privado · instrutor' }),
      node('h1', { text: data.title }),
      node('p', { className: 'loop-muted', text: data.dateLabel }),
    ]),
    ...(isPublic ? [node('a', { id: 'loop-return-practice', className: 'loop-page-link', 'data-action': 'return-practice', href: safeLocalUrl(data.returnUrl || '/praticar/index.html#instrutor'), text: '← Voltar a Praticar' })] : []),
    node('nav', { className: 'loop-nav', 'aria-label': isPublic ? 'Páginas do roteiro público' : 'Páginas do roteiro privado', 'data-loop-pages': '', 'data-private-pages': '', 'data-public-pages': isPublic ? '' : null }, [
      node('a', { className: 'loop-page-link', href: `${location.pathname}${location.search}`, 'aria-current': 'page', text: data.title }),
      node('a', { className: 'loop-page-link', href: safeLocalUrl(data.otherPage?.url), text: data.otherPage?.title || 'Outra agenda' }),
    ]),
    node('label', { className: 'loop-theme', for: 'loop-theme' }, [node('span', { text: 'Tema' }), themeSelect]),
  ]);
  const sessionNav = node('nav', { className: 'loop-sessions', 'aria-label': 'Selecionar sessão' }, [
    node('h2', { className: 'loop-eyebrow', text: 'Sessões' }),
    ...data.sessions.map((session, index) => {
      const control = button('', 'select-session', {
        id: `loop-session-${index}`, className: 'loop-session-button', 'data-session-id': session.id,
        'aria-pressed': String(index === 0), 'aria-controls': 'loop-session-panel',
      });
      control.append(node('span', { text: session.time }), node('strong', { text: session.name }), node('span', { text: session.role }));
      control.addEventListener('click', () => selectSession(index));
      return control;
    }),
  ]);
  const main = node('main', { id: 'loop-session-panel', className: 'loop-main', 'aria-labelledby': 'loop-session-title' });
  const warning = node('p', { id: 'loop-storage-warning', className: 'loop-warning', role: 'status', hidden: !storageBlocked, text: 'O armazenamento do navegador está indisponível. As alterações ficam apenas nesta aba; exporte o registro em JSON antes de fechar.' });
  app.replaceChildren(
    node('a', { className: 'loop-skip', href: '#loop-session-title', text: 'Ir para a sessão ativa' }),
    header,
    node('div', { className: 'loop-private-notice', 'data-private-notice': '' }, [
      node('strong', { text: isPublic ? 'Painel de condução público. Não compartilhe esta página inteira.' : 'Tela exclusiva de quem conduz. Não compartilhe esta página inteira.' }),
      node('p', { text: data.privacyNotice || (isPublic ? 'Roteiro, agenda e notas são públicos, sem autenticação. Os registros preenchidos permanecem apenas neste navegador. Apresente somente a pergunta ou a evidência selecionada.' : 'Apresente somente a pergunta ou a evidência escolhida usando o botão de apresentação. O restante contém notas privadas.') }),
    ]),
    node('p', { className: 'loop-intro', text: data.intro }), warning,
    node('p', { id: 'loop-status', className: 'loop-status', role: 'status', 'aria-live': 'polite', 'aria-atomic': 'true' }),
    node('div', { className: 'loop-layout' }, [sessionNav, main]),
    node('footer', { className: 'loop-footer', text: `${isPublic ? 'Material público' : 'Material local'} de preparação. Hipóteses, tempos e dimensões de observação não são critérios oficiais nem previsão de resultado.` }),
  );

  function sessionRuntime(session) {
    if (!runtime.has(session.id)) runtime.set(session.id, { questionIndex: 0, phaseIndex: 0, elapsedMs: 0, startedAt: null, running: false });
    return runtime.get(session.id);
  }

  function selectedSession() { return data.sessions[activeSessionIndex]; }

  function deepState(session) {
    if (!deepRuntime.has(session.id)) deepRuntime.set(session.id, { mode: moduleOnlySession(session) ? '' : 'legacy', attemptId: null });
    return deepRuntime.get(session.id);
  }

  function currentDeepAttempt(session) {
    if (!session.deepDiveTraining) return null;
    const state = deepState(session);
    return !state.mode || state.mode === 'legacy' ? null : recordFor(session).deepDiveRuns?.attempts[state.attemptId] || null;
  }

  function deepEvent(attempt, type, message) {
    attempt.events.push({ at: new Date().toISOString(), type, message });
  }

  function pausePractice(session) {
    const state = sessionRuntime(session);
    if (state.running) state.elapsedMs = elapsedFor(state);
    state.running = false;
    state.startedAt = null;
  }

  function createDeepAttempt(session, variantId, retry = false) {
    const variant = deepVariants(session).find(item => item.id === variantId);
    if (!variant) return null;
    pausePractice(practiceSession(session));
    const record = recordFor(session);
    if (!record.deepDiveRuns) record.deepDiveRuns = { nextSequence: 1, order: [], attempts: {} };
    const runs = record.deepDiveRuns;
    const id = `run-${runs.nextSequence++}`;
    const previous = currentDeepAttempt(session);
    const currentIndex = previous?.variantId === variantId ? previous.questionIndex : -1;
    const currentQuestion = variant.questions[currentIndex];
    const fallbackIndex = variant.questions.findIndex(question => question.exercise || /-(?:REAL|AI|MIGRATION|TRANSFER)$/.test(question.id));
    const questionIndex = retry ? Math.max(0, currentQuestion && !/-(?:INTRO|END)$/.test(currentQuestion.id) ? currentIndex : fallbackIndex) : 0;
    const attempt = {
      id, variantId, createdAt: new Date().toISOString(), language: retry && previous?.language === 'en' ? 'en' : 'pt', status: 'practice',
      exposed: false, remainingMinutes: null, phaseIndex: 0, questionIndex,
      coachingDraft: '', coachingLog: [], coverageNotes: '', events: [], evidenceLog: [], exerciseDrafts: {},
      debrief: deepDebrief(null, session.deepDiveTraining), debriefRecordedAt: null,
    };
    deepEvent(attempt, retry ? 'retry' : 'start', retry ? 'Reteste do mesmo cenário após debrief; evidências e rascunhos não foram herdados. Compare a compreensão com a tentativa anterior, sem presumir independência após exposição.' : `Versão escolhida manualmente: ${variant.label}.`);
    runs.attempts[id] = attempt;
    runs.order.push(id);
    Object.assign(deepState(session), { mode: variantId, attemptId: id });
    saveRecord(session);
    return attempt;
  }

  function practiceSession(owner) {
    if (!owner.deepDiveTraining) return owner;
    const attempt = currentDeepAttempt(owner);
    const variant = attempt && deepVariants(owner).find(item => item.id === attempt.variantId);
    if (!variant) return owner;
    const proxyKey = `${owner.id}:${attempt.id}:${attempt.language}`;
    if (!deepProxies.has(proxyKey)) {
      const translate = question => ({
        ...question,
        prompt: attempt.language === 'en' && typeof question.promptEn === 'string' ? question.promptEn : question.prompt,
        followups: attempt.language === 'en' && Array.isArray(question.followupsEn) ? question.followupsEn : question.followups,
        ...(question.exercise ? { exercise: { ...question.exercise, cards: question.exercise.cards.map(card => ({
          ...card, studentHtml: attempt.language === 'en' && typeof card.studentHtmlEn === 'string' ? card.studentHtmlEn : card.studentHtml,
        })) } } : {}),
      });
      const proxy = {
        ...owner, id: `${owner.id}:deep:${attempt.id}`, agenda: variant.agenda,
        questions: variant.questions.map(translate), reserves: (variant.reserves || []).map(translate),
        candidateQuestion: '', notesHtml: '', evaluationGuide: undefined, deepDiveTraining: undefined,
      };
      deepContexts.set(proxy, { owner, attempt, variant });
      deepProxies.set(proxyKey, proxy);
      if (!runtime.has(proxy.id)) runtime.set(proxy.id, { questionIndex: attempt.questionIndex, phaseIndex: attempt.phaseIndex, elapsedMs: 0, startedAt: null, running: false });
    }
    return deepProxies.get(proxyKey);
  }

  function activePracticeSession() { return practiceSession(selectedSession()); }

  function rememberDeepPosition(session, type) {
    const context = deepContexts.get(session);
    if (!context) return;
    const state = sessionRuntime(session);
    context.attempt.questionIndex = state.questionIndex;
    context.attempt.phaseIndex = state.phaseIndex;
    if (type) deepEvent(context.attempt, type, type === 'question' ? `Pergunta selecionada: ${allQuestions(session)[state.questionIndex]?.question.id || ''}.` : `Fase escolhida: ${session.agenda[state.phaseIndex]?.label || ''}.`);
    saveRecord(context.owner);
  }

  function refreshDeepSession(focusId = 'loop-deep-mode') {
    selectSession(activeSessionIndex, false);
    document.getElementById(focusId)?.focus();
  }

  function runDeepCommand(owner, command, amount) {
    const attempt = currentDeepAttempt(owner);
    if (!attempt) { announce('Escolha V1, V2 ou V3 antes de usar os comandos de treino.'); return; }
    const practice = practiceSession(owner);
    const state = sessionRuntime(practice);
    if (command === 'retry') {
      if (attempt.status !== 'debrief') { announce('Use /debrief antes de refazer. A tentativa atual será preservada.'); return; }
      createDeepAttempt(owner, attempt.variantId, true);
      refreshDeepSession();
      announce('Nova tentativa iniciada, sem evidências liberadas ou feedback herdado. A anterior continua no histórico.');
      return;
    }
    if (command === 'pause') {
      pausePractice(practice);
      const note = attempt.coachingDraft.trim() || 'Pausa/coaching solicitada pelo operador; ajuda específica ainda não registrada.';
      attempt.coachingLog.push({ at: new Date().toISOString(), note });
      deepEvent(attempt, 'pause', 'Cronômetro pausado; apoio registrado separadamente da resposta espontânea.');
    } else if (command === 'debrief') {
      pausePractice(practice);
      attempt.status = 'debrief';
      deepEvent(attempt, 'debrief', 'Debrief manual iniciado fora da agenda de 60 minutos.');
    } else if (command === 'english' || command === 'portuguese') {
      attempt.language = command === 'english' ? 'en' : 'pt';
      deepEvent(attempt, command, command === 'english' ? 'Perguntas, aprofundamentos e cartões preparados em inglês selecionados; notas permanecem em português.' : 'Perguntas e cartões em português selecionados.');
    } else if (command === 'time') {
      if (!Number.isSafeInteger(amount) || amount < 0) { announce('Informe minutos inteiros maiores ou iguais a zero. O valor é informado pelo operador, sem calcular tempo decorrido.'); return; }
      attempt.remainingMinutes = amount;
      deepEvent(attempt, 'time', `${amount} minutos restantes informados pelo operador; cronômetro não recalculado.`);
    } else if (command === 'next') {
      if (attempt.status === 'debrief') { announce('O debrief está fora da agenda. Use Refazer para uma nova tentativa.'); return; }
      if (state.phaseIndex >= practice.agenda.length - 1) { announce('Esta é a última fase da agenda. Abra o debrief manualmente quando desejar; a cobertura não é presumida.'); return; }
      pausePractice(practice);
      if (state.phaseIndex < practice.agenda.length - 1) { state.phaseIndex += 1; state.elapsedMs = 0; }
      attempt.phaseIndex = state.phaseIndex;
      deepEvent(attempt, 'next', `Fase selecionada manualmente: ${practice.agenda[state.phaseIndex]?.label || ''}. Cobertura a registrar pelo operador; nenhuma competência foi presumida.`);
    } else if (command === 'instructor') {
      deepEvent(attempt, 'instructor', 'Orientações reservadas do caso atual abertas pelo operador; isso não confirma exposição à candidata.');
    } else if (command === 'resume') {
      if (attempt.status === 'debrief') { announce('O debrief não acrescenta tempo à rodada. Use Refazer para voltar à prática.'); return; }
      if (!state.running && elapsedFor(state) < durationFor(practice, state)) { state.startedAt = Date.now(); state.running = true; }
      deepEvent(attempt, 'resume', 'Cronômetro retomado manualmente.');
    } else return;
    saveRecord(owner);
    refreshDeepSession(command === 'debrief' ? 'loop-deep-debrief-title' : 'loop-deep-operator-title');
    if (command === 'instructor') {
      for (const element of document.querySelectorAll('[data-deep-instructor], #loop-question-area [data-instructor-notes], #loop-question-area [data-exercise-instructor]')) element.open = true;
      document.querySelector('[data-deep-instructor] > summary')?.focus();
      announce('Ficha do instrutor aberta. O roteiro é público, sem autenticação. Registre se houve exposição à candidata.');
    } else if (command === 'time') announce(`${amount} minutos restantes registrados como informação do operador. O cronômetro não foi alterado.`);
    else if (command === 'next') announce('Próxima fase selecionada manualmente. Registre o que foi coberto; nenhuma evidência foi liberada.');
    else if (command === 'debrief') announce('Debrief aberto fora dos 60 minutos, sem avaliação automática.');
    else if (command === 'pause') announce('Pausa registrada. Apoio e exposição precisam ser considerados ao descrever a independência da resposta.');
    else if (command === 'english' || command === 'portuguese') announce(command === 'english' ? 'Textos preparados em inglês ativos. O feedback de inglês permanece separado do técnico.' : 'Textos em português ativos.');
  }

  function renderDeepDiveModule(owner) {
    const module = owner.deepDiveTraining;
    const moduleOnly = moduleOnlySession(owner);
    const emptyMode = moduleOnly ? '' : 'legacy';
    const attempt = currentDeepAttempt(owner);
    const variant = attempt && deepVariants(owner).find(item => item.id === attempt.variantId);
    const mode = node('select', { id: 'loop-deep-mode', 'data-deep-dive-mode': '' }, [
      node('option', { value: emptyMode, text: moduleOnly ? 'Escolha V1, V2 ou V3' : 'Roteiro legado — preservado' }),
      ...deepVariants(owner).map(item => node('option', { value: item.id, text: item.label })),
    ]);
    mode.value = attempt ? attempt.variantId : emptyMode;
    mode.addEventListener('change', () => {
      if (mode.value === emptyMode) {
        pausePractice(practiceSession(owner));
        Object.assign(deepState(owner), { mode: emptyMode, attemptId: null });
      } else createDeepAttempt(owner, mode.value);
      refreshDeepSession();
    });
    const runs = recordFor(owner).deepDiveRuns;
    const historySelect = node('select', { id: 'loop-deep-attempt', 'data-deep-attempt': '' }, [
      node('option', { value: '', text: 'Escolha uma tentativa para retomar' }),
      ...(runs?.order || []).map(id => {
        const item = runs.attempts[id];
        const label = deepVariants(owner).find(candidate => candidate.id === item.variantId)?.label || item.variantId;
        return node('option', { value: id, text: `${id} · ${label} · ${item.status === 'debrief' ? 'debrief' : 'prática'}` });
      }),
    ]);
    historySelect.value = attempt?.id || '';
    historySelect.addEventListener('change', () => {
      const selected = runs?.attempts[historySelect.value];
      if (!selected) return;
      pausePractice(practiceSession(owner));
      Object.assign(deepState(owner), { mode: selected.variantId, attemptId: selected.id });
      refreshDeepSession();
      announce('Tentativa retomada. O cronômetro local não reconstrói o tempo decorrido antes de recarregar a página.');
    });
    const reserved = details('Ficha reservada do instrutor — não apresentar à candidata', [
      node('p', { className: 'loop-deep-status', text: 'Roteiro público, sem autenticação. Abrir este painel não libera cartões nem abre a apresentação. Se a candidata viu a ficha, registre a exposição; a independência da resposta pode ter sido afetada.' }),
      variant ? node('p', { className: 'loop-assessment-text', text: variant.instructorNotes }) : null,
      details('Regras e preparação', [
        node('p', { text: attempt?.language === 'en' ? module.introductionEn : module.introductionPt }), textList(module.rules),
      ]),
      details('Facetas de Dive Deep e perguntas de apoio', (module.facets || []).map(facet => node('section', { className: 'loop-stack' }, [node('h4', { text: facet.label }), textList(facet.prompts)]))),
      details('Régua autoral da resposta — não é régua de carreira', [
        textList((module.qualityLevels || []).map(level => `${level.label} — ${level.description}`)),
        textList((module.supportLevels || []).map(level => `${level.label} — ${level.description || ''}`)),
        node('p', { text: 'Marque fato a confirmar quando a sustentação estiver pendente. Não faça média nem use estatísticas de reprovação. Depois de ensinar a solução, registre a ajuda e reteste a compreensão.' }),
      ]),
      details('Escada de aprofundamento', node('ol', {}, (module.ladder || []).map(item => node('li', {}, [node('strong', { text: item.label }), node('p', { text: item.prompt })])))),
      module.pixExtension ? details('Extensão Pix — somente quando preparada', [node('p', { text: module.pixExtension.notice }), textList((module.pixExtension.references || []).map(reference => `${reference.title} · ${reference.url}`))]) : null,
    ], { 'data-deep-instructor': '' });
    return node('section', { className: 'loop-card loop-stack loop-deep-module', 'data-deep-dive-training': '', 'data-deep-current-attempt': attempt?.id || '', 'data-deep-current-variant': attempt?.variantId || emptyMode, 'aria-labelledby': 'loop-deep-title' }, [
      node('h3', { id: 'loop-deep-title', text: module.title }), node('p', { className: 'loop-muted', text: module.notice }),
      node('p', { className: 'loop-deep-status', text: moduleOnly ? 'Escolha V1, V2 ou V3 para iniciar uma tentativa, ou retome uma tentativa salva. Nenhuma versão começa automaticamente.' : 'Qual versão vamos praticar: V1, V2 ou V3? O roteiro legado permanece disponível. Cada escolha de versão inicia uma tentativa separada.' }),
      node('div', { className: 'loop-deep-debrief-grid' }, [
        node('div', { className: 'loop-field' }, [node('label', { for: 'loop-deep-mode', text: 'Versão e cenário da prática' }), mode]),
        runs?.order.length ? node('div', { className: 'loop-field' }, [node('label', { for: 'loop-deep-attempt', text: 'Retomar tentativa e debrief local' }), historySelect]) : null,
      ]),
      variant ? node('p', { text: variant.objective }) : null,
      variant ? node('p', { className: 'loop-muted', text: `Agenda desta versão: 60 minutos. Debrief adicional fora da agenda. Primeiro domínio: ${variant.firstDomain}. Segundo domínio: ${variant.secondDomain}.` }) : null,
      attempt ? renderDeepOperator(owner, attempt) : null,
      reserved,
    ]);
  }

  function renderDeepOperator(owner, attempt) {
    const module = owner.deepDiveTraining;
    const controls = [['pause', 'Pausar / coaching'], ['debrief', 'Abrir debrief'], ['retry', 'Refazer após debrief'], ['english', 'Usar textos em inglês'], ['next', 'Próxima fase'], ['instructor', 'Consultar instrutor'], ['resume', 'Retomar cronômetro'], ['portuguese', 'Usar textos em português']].map(([command, label]) => {
      const control = button(label, `deep-${command}`, { disabled: command === 'retry' && attempt.status !== 'debrief' });
      control.addEventListener('click', () => runDeepCommand(owner, command));
      return control;
    });
    const remaining = node('input', { id: 'loop-deep-remaining', type: 'number', min: '0', step: '1', 'data-deep-remaining': '', value: attempt.remainingMinutes == null ? '' : attempt.remainingMinutes });
    const time = button('Registrar tempo informado', 'deep-time');
    time.addEventListener('click', () => runDeepCommand(owner, 'time', remaining.value.trim() === '' ? NaN : Number(remaining.value)));
    const coaching = node('textarea', { id: 'loop-deep-coaching', rows: 3, value: attempt.coachingDraft, 'data-deep-coaching-note': '', placeholder: 'Registre a orientação ou ajuda oferecida, sem completar a resposta da candidata.' });
    coaching.addEventListener('input', () => { attempt.coachingDraft = coaching.value; saveRecord(owner); });
    const saveCoaching = button('Registrar orientação oferecida', 'deep-log-coaching');
    saveCoaching.addEventListener('click', () => {
      if (!coaching.value.trim()) { announce('Descreva a orientação oferecida para registrá-la.'); return; }
      attempt.coachingLog.push({ at: new Date().toISOString(), note: coaching.value.trim() });
      deepEvent(attempt, 'coaching', 'Orientação registrada pelo operador; não tratar como resposta espontânea.');
      saveRecord(owner); refreshDeepSession('loop-deep-coaching'); announce('Orientação registrada nesta tentativa.');
    });
    const exposure = node('input', { id: 'loop-deep-exposure', type: 'checkbox', checked: attempt.exposed, 'data-deep-exposure': '' });
    exposure.addEventListener('change', () => {
      attempt.exposed = exposure.checked;
      deepEvent(attempt, 'exposure', exposure.checked ? 'Operador confirmou exposição da candidata às orientações reservadas; independência afetada.' : 'Operador corrigiu o sinalizador de exposição; registro anterior permanece nos eventos.');
      saveRecord(owner); refreshDeepSession('loop-deep-exposure');
    });
    const coverage = node('textarea', { id: 'loop-deep-coverage', rows: 3, value: attempt.coverageNotes, 'data-deep-coverage': '', placeholder: 'Anote os temas e as facetas efetivamente observados; avançar a fase não presume cobertura.' });
    coverage.addEventListener('input', () => { attempt.coverageNotes = coverage.value; saveRecord(owner); });
    const command = node('input', { id: 'loop-deep-command', type: 'text', autocomplete: 'off', 'data-deep-command': '', placeholder: '/pausa, /debrief, /refazer, /english, /tempo N, /proximo ou /instrutor' });
    const execute = button('Executar comando manual', 'deep-command');
    function executeCommand() {
      const text = command.value.trim();
      const timeMatch = /^\/tempo\s+(\d+)$/.exec(text);
      const known = { '/pausa': 'pause', '/debrief': 'debrief', '/refazer': 'retry', '/english': 'english', '/proximo': 'next', '/instrutor': 'instructor' };
      if (timeMatch) runDeepCommand(owner, 'time', Number(timeMatch[1]));
      else if (known[text]) runDeepCommand(owner, known[text]);
      else announce('Comando não reconhecido. Consulte os sete comandos manuais; não há chat ou geração de respostas.');
    }
    execute.addEventListener('click', executeCommand);
    command.addEventListener('keydown', event => { if (event.key === 'Enter') { event.preventDefault(); executeCommand(); } });
    return node('section', { className: 'loop-stack', 'data-deep-operator': '', 'aria-labelledby': 'loop-deep-operator-title' }, [
      node('h4', { id: 'loop-deep-operator-title', tabindex: '-1', text: `Painel do operador · ${attempt.id}` }),
      node('p', { className: 'loop-deep-status', 'data-deep-status': '', text: `${attempt.status === 'debrief' ? 'Debrief manual fora dos 60 minutos' : 'Prática com controles manuais'} · Idioma: ${attempt.language === 'en' ? 'inglês preparado' : 'português'} · Tempo restante informado: ${attempt.remainingMinutes == null ? 'não registrado' : `${attempt.remainingMinutes} min`}.` }),
      node('div', { className: 'loop-deep-controls' }, controls),
      node('div', { className: 'loop-deep-command-input' }, [node('div', { className: 'loop-field loop-deep-remaining' }, [node('label', { for: 'loop-deep-remaining', text: 'Minutos restantes informados pelo operador' }), remaining]), time]),
      node('p', { className: 'loop-muted', text: '/tempo N registra a informação fornecida; não inventa tempo decorrido nem altera fases. /proximo muda somente a fase e deixa a cobertura para o registro manual.' }),
      node('div', { className: 'loop-field' }, [node('label', { for: 'loop-deep-command', text: 'Comando manual local — sem chat ou GenAI' }), command]), execute,
      details('Ajuda dos comandos', node('ul', {}, (module.commands || []).map(item => node('li', {}, [node('strong', { text: `${item.command} · ${item.label}` }), node('p', { text: item.help })])))),
      node('div', { className: 'loop-field' }, [node('label', { for: 'loop-deep-coaching', text: 'Orientação ou ajuda oferecida — registro privado' }), coaching]), saveCoaching,
      node('label', { className: 'loop-check', for: 'loop-deep-exposure' }, [exposure, node('span', { text: 'Confirmo que a candidata viu conteúdo reservado do instrutor nesta tentativa.' })]),
      (attempt.exposed || attempt.coachingLog.length) ? node('p', { className: 'loop-deep-status', 'data-deep-independence': '', text: attempt.exposed ? 'Exposição à ficha confirmada: independência afetada. Diferencie a resposta inicial da evolução após acesso às orientações; isso não gera nota automática.' : 'Há pausa/coaching registrados. Descreva a ajuda efetivamente oferecida e seu efeito na independência, distinguindo a resposta inicial da evolução após apoio; isso não gera nota automática.' }) : null,
      attempt.events.some(event => event.type === 'retry') ? node('p', { className: 'loop-deep-status', 'data-deep-retest': '', text: 'Reteste após debrief no mesmo cenário. Compare com a tentativa anterior; reconhecer o exemplo ou repetir uma orientação não comprova transferência independente. Após exposição ao gabarito, use outra variante para avaliar de forma independente.' }) : null,
      node('div', { className: 'loop-field' }, [node('label', { for: 'loop-deep-coverage', text: 'Cobertura observada — anotar fatos, sem inferir competência' }), coverage]),
      details('Histórico privado de comandos e apoio', [
        node('h4', { text: 'Eventos da tentativa' }), node('ol', { className: 'loop-deep-command-log', 'data-deep-events': '' }, attempt.events.map(item => node('li', { text: `${item.at} · ${item.message}` }))),
        node('h4', { text: 'Pausas e orientações oferecidas' }), node('ol', { className: 'loop-deep-command-log', 'data-deep-coaching-log': '' }, attempt.coachingLog.map(item => node('li', { text: `${item.at} · ${item.note}` }))),
      ], { 'data-deep-local-history': '' }),
    ]);
  }

  function renderDeepDebrief(owner, attempt) {
    const module = owner.deepDiveTraining;
    const draft = attempt.debrief;
    const prefix = `loop-deep-${attempt.id}`;
    function textField(field, label, object = draft, attributes = {}, placeholder = '') {
      const id = `${prefix}-${field}-${Object.values(attributes).join('-') || 'debrief'}`;
      const input = node('textarea', { id, rows: 3, value: object[field], placeholder, ...attributes });
      input.addEventListener('input', () => { object[field] = input.value; saveRecord(owner); });
      return node('div', { className: 'loop-field' }, [node('label', { for: id, text: label }), input]);
    }
    function topText(field, label, placeholder = '') { return textField(field, label, draft, { 'data-deep-debrief-field': field }, placeholder); }
    function selectField(field, label, object, choices, attributes, emptyLabel) {
      const id = `${prefix}-${field}-${Object.values(attributes).join('-')}`;
      const select = node('select', { id, ...attributes }, [emptyLabel ? node('option', { value: '', text: emptyLabel }) : null, ...choices.map(item => node('option', { value: item.value, text: item.label }))]);
      select.value = object[field];
      select.addEventListener('change', () => {
        object[field] = choices.some(item => item.value === select.value) ? select.value : (emptyLabel ? '' : 'nao-observado');
        saveRecord(owner);
      });
      return node('div', { className: 'loop-field' }, [node('label', { for: id, text: label }), select]);
    }
    function observations(field, definitions, attribute) {
      return node('div', { className: 'loop-deep-facets' }, definitions.map(definition => {
        const observation = draft[field][definition.id];
        const metadata = { 'data-deep-observation-id': `${field}-${definition.id}` };
        return node('fieldset', { className: 'loop-deep-observation loop-stack', [attribute]: definition.id }, [
          node('legend', { text: definition.label }),
          textField('evidence', 'Evidência narrada ou observada', observation, { ...metadata, 'data-deep-observation-field': 'evidence' }),
          node('div', { className: 'loop-deep-debrief-grid' }, [
            selectField('quality', 'Qualidade observada nesta rodada', observation, module.qualityLevels || [], { ...metadata, 'data-deep-observation-field': 'quality' }),
            selectField('support', 'Apoio observado', observation, module.supportLevels || [], { ...metadata, 'data-deep-observation-field': 'support' }, 'Não registrado'),
          ]),
          textField('concern', 'Dúvida, limite ou ponto a confirmar', observation, { ...metadata, 'data-deep-observation-field': 'concern' }),
        ]);
      }));
    }
    const star = node('div', { className: 'loop-deep-debrief-grid', 'data-deep-star': '', hidden: !draft.realStoryConfirmed }, [
      ...[['situation', 'Situação real narrada'], ['task', 'Responsabilidade ou tarefa real'], ['action', 'Ações efetivamente realizadas'], ['result', 'Resultado e limites conhecidos']].map(([field, label]) => textField(field, label, draft.star, { 'data-deep-star-field': field }, '[PREENCHER]')),
    ]);
    const real = node('input', { id: `${prefix}-real-story`, type: 'checkbox', checked: draft.realStoryConfirmed, 'data-deep-debrief-field': 'realStoryConfirmed' });
    real.addEventListener('change', () => { draft.realStoryConfirmed = real.checked; star.hidden = !real.checked; saveRecord(owner); });
    const priorities = node('div', { className: 'loop-deep-priorities' }, draft.priorities.map((priority, index) => node('fieldset', { className: 'loop-deep-observation loop-stack', 'data-deep-priority': index }, [
      node('legend', { text: `Prioridade ${index + 1}` }),
      textField('practice', 'O que praticar', priority, { 'data-deep-priority-index': index, 'data-deep-priority-field': 'practice' }),
      textField('criterion', 'Critério observável para a próxima tentativa', priority, { 'data-deep-priority-index': index, 'data-deep-priority-field': 'criterion' }),
    ])));
    const extraQuestions = node('div', { className: 'loop-stack' }, draft.extraQuestions.map((value, index) => {
      const id = `${prefix}-extra-${index}`;
      const input = node('textarea', { id, rows: 2, value, 'data-deep-extra-question': index, placeholder: 'Pergunta autoral a partir da conversa; não complete fatos ou experiências.' });
      input.addEventListener('input', () => { draft.extraQuestions[index] = input.value; saveRecord(owner); });
      return node('div', { className: 'loop-field' }, [node('label', { for: id, text: `Pergunta autoral adicional ${index + 1}` }), input]);
    }));
    const record = button('Registrar debrief desta tentativa', 'deep-save-debrief', { id: 'loop-deep-save-debrief' });
    record.addEventListener('click', () => {
      attempt.debriefRecordedAt = new Date().toISOString();
      deepEvent(attempt, 'record-debrief', 'Debrief manual registrado pelo operador, sem nota, média ou parecer calculado.');
      saveRecord(owner); refreshDeepSession('loop-deep-save-debrief'); announce('Debrief manual registrado nesta tentativa. Nenhuma avaliação foi calculada.');
    });
    return details('Debrief privado da tentativa — tempo adicional fora dos 60 minutos', [
      node('h3', { id: 'loop-deep-debrief-title', tabindex: '-1', text: `Debrief manual · ${attempt.id}` }),
      node('p', { className: 'loop-deep-status', text: 'Preencha somente com fatos narrados ou observados nesta tentativa. Esta é uma régua de preparação por resposta, sem média, nota de nível ou vínculo com avaliação oficial. Não observado não é zero; apoio não registrado não significa resposta espontânea.' }),
      node('p', { className: 'loop-muted', text: 'Rascunhos e feedback ficam somente neste navegador e entram apenas no export privado da sessão. O cronômetro da rodada está parado; este debrief não soma tempo à agenda de 60 minutos.' }),
      selectField('opinion', 'Parecer SIMULADO de preparação — decisão manual', draft, [
        { value: 'inclined', label: 'Inclinado — justificar com as evidências da conversa' },
        { value: 'not-inclined', label: 'Não inclinado — registrar as lacunas observadas' },
        { value: 'inconclusivo', label: 'Inconclusivo' },
      ], { 'data-deep-debrief-field': 'opinion' }, 'Sem parecer registrado'),
      topText('justification', 'Justificativa do parecer — fatos e limites'),
      topText('comparison', 'Comparação com a tentativa anterior — transferência ou repetição da orientação'),
      details('Cinco facetas de Dive Deep', observations('facets', module.facets || [], 'data-deep-facet'), { 'data-deep-facets': '' }),
      details('Sete dimensões técnicas', observations('technical', module.technicalDimensions || [], 'data-deep-technical'), { 'data-deep-technical-dimensions': '' }),
      topText('ladderMap', 'Escada de aprofundamento — onde houve evidência e onde faltou observar'),
      topText('corrections', 'Correções técnicas — inclua a fonte ou marque como pendente de confirmação'),
      node('h4', { text: 'Três prioridades para a próxima prática' }), priorities,
      node('label', { className: 'loop-check', for: `${prefix}-real-story` }, [real, node('span', { text: 'Confirmo que foi narrada uma experiência de trabalho real para organizar os campos STAR abaixo.' })]),
      node('p', { className: 'loop-muted', text: 'STAR organiza somente fatos de trabalho real narrados. Cenários de treino, hipóteses e melhorias propostas não viram experiência pessoal.' }), star,
      node('h4', { text: 'Perguntas autorais a partir do que foi narrado' }), extraQuestions,
      node('section', { className: 'loop-stack', 'data-deep-english-feedback': '' }, [node('h4', { text: 'Feedback de inglês — separado do técnico' }), topText('englishFeedback', 'Observações de comunicação em inglês, somente se essa parte foi praticada')]),
      selectField('nextVersion', 'Versão sugerida para o próximo treino — decisão manual', draft, [
        { value: 'v1', label: 'V1 — raciocínio consultivo' }, { value: 'v2', label: 'V2 — investigação do incidente preparado' }, { value: 'v3', label: 'V3 — experiência real' },
      ], { 'data-deep-debrief-field': 'nextVersion' }, 'Sem próxima versão definida'),
      topText('nextReason', 'Motivo e objetivo do próximo treino'), record,
      attempt.debriefRecordedAt ? node('p', { className: 'loop-muted', text: `Último registro manual deste debrief: ${new Date(attempt.debriefRecordedAt).toLocaleString('pt-BR')}.` }) : null,
    ], { id: 'loop-deep-debrief', 'data-deep-debrief': '', 'data-deep-attempt-id': attempt.id, hidden: attempt.status !== 'debrief', open: attempt.status === 'debrief' });
  }

  function allQuestions(session) {
    return [...(session.questions || []).map(question => ({ question, reserve: false })), ...(session.reserves || []).map(question => ({ question, reserve: true }))];
  }

  function selectSession(index, focus = true) {
    activeSessionIndex = index;
    const session = selectedSession();
    for (const control of sessionNav.querySelectorAll('[data-session-id]')) control.setAttribute('aria-pressed', String(control.dataset.sessionId === session.id));
    main.dataset.activeSessionId = session.id;
    const practice = practiceSession(session);
    const state = sessionRuntime(practice);
    const moduleOnly = moduleOnlySession(session);
    const attempt = currentDeepAttempt(session);
    const ready = !moduleOnly || Boolean(attempt);
    const hypothesis = node('section', { className: 'loop-card loop-hypothesis', 'aria-labelledby': 'loop-hypothesis-title' }, [
      node('h3', { id: 'loop-hypothesis-title', text: 'Hipótese de preparação' }),
      textList(session.hypothesis),
      node('p', { className: 'loop-muted', 'data-hypothesis-disclaimer': '', text: 'Hipótese de treino, não confirmada: não representa atribuição oficial de LPs, roteiro oficial da entrevista ou critério de aprovação.' }),
    ]);
    replaceContent(main,
      node('section', { className: 'loop-panel' }, [
        node('div', { className: 'loop-session-heading' }, [
          node('div', {}, [node('p', { className: 'loop-eyebrow', text: session.time }), node('h2', { id: 'loop-session-title', tabindex: '-1', text: session.name }), node('p', { className: 'loop-meta', text: session.role })]),
          node('p', { className: 'loop-muted', text: session.objective }),
        ]),
        session.deepDiveTraining ? renderDeepDiveModule(session) : null,
        ready ? (moduleOnly ? renderTimer(practice, state) : node('div', { className: 'loop-grid' }, [hypothesis, renderTimer(practice, state)])) : null,
      ]),
      ready ? node('section', { id: 'loop-question-area', className: 'loop-panel', 'aria-label': 'Condução da pergunta' }) : null,
      attempt ? renderDeepDebrief(session, attempt) : null,
      ready ? renderRegistration(session) : details('Registro geral privado da sessão e exportação', renderRegistration(session), { 'data-deep-general-record': '' }),
    );
    if (ready) renderQuestion(practice, state.questionIndex, false);
    refreshTimer();
    updateSaveStatus();
    if (focus) document.getElementById('loop-session-title')?.focus();
  }

  function durationFor(session, state) {
    return Math.max(0, Number(session.agenda?.[state.phaseIndex]?.minutes) || 0) * 60_000;
  }

  function elapsedFor(state) {
    return state.elapsedMs + (state.running && state.startedAt != null ? Date.now() - state.startedAt : 0);
  }

  function timerText(milliseconds) {
    const seconds = Math.max(0, Math.ceil(milliseconds / 1000));
    return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  }

  function refreshTimer() {
    if (moduleOnlySession(selectedSession()) && !currentDeepAttempt(selectedSession())) return;
    const session = activePracticeSession();
    const state = sessionRuntime(session);
    const duration = durationFor(session, state);
    const elapsed = elapsedFor(state);
    if (state.running && elapsed >= duration) {
      state.running = false;
      state.startedAt = null;
      state.elapsedMs = duration;
      announce('O tempo da fase terminou. Selecione manualmente a próxima fase quando desejar.');
    }
    const display = document.getElementById('loop-timer-display');
    if (!display) return;
    const phase = session.agenda?.[state.phaseIndex];
    display.textContent = timerText(duration - elapsedFor(state));
    display.setAttribute('aria-label', `${phase?.label || 'Fase'}: ${display.textContent} restantes`);
    const start = document.querySelector('[data-action="timer-start"]');
    const pause = document.querySelector('[data-action="timer-pause"]');
    const reset = document.querySelector('[data-action="timer-reset"]');
    if (start) { start.disabled = deepContexts.get(session)?.attempt.status === 'debrief' || state.running || duration <= 0 || elapsedFor(state) >= duration; start.textContent = state.elapsedMs > 0 ? 'Retomar' : 'Iniciar'; }
    if (pause) pause.disabled = !state.running;
    if (reset) reset.disabled = !state.running && state.elapsedMs === 0;
    const status = document.getElementById('loop-timer-status');
    if (status) status.textContent = elapsedFor(state) >= duration && duration > 0 ? 'Tempo concluído. A próxima fase depende da sua escolha.' : state.running ? 'Em andamento' : state.elapsedMs > 0 ? 'Pausado' : 'Pronto para iniciar';
  }

  function renderTimer(session, state) {
    const phases = Array.isArray(session.agenda) ? session.agenda : [];
    const phaseList = node('div', { className: 'loop-phase-list', 'aria-label': 'Escolher fase da agenda' }, phases.map((phase, index) => {
      const control = button(`${phase.label} · ${phase.minutes} min`, 'select-phase', { className: 'loop-phase-button', 'data-phase-index': index, 'aria-pressed': String(index === state.phaseIndex), disabled: deepContexts.get(session)?.attempt.status === 'debrief' });
      control.addEventListener('click', () => {
        state.phaseIndex = index; state.running = false; state.startedAt = null; state.elapsedMs = 0;
        for (const phaseButton of phaseList.querySelectorAll('button')) phaseButton.setAttribute('aria-pressed', String(Number(phaseButton.dataset.phaseIndex) === index));
        document.getElementById('loop-phase-label').textContent = phase.label;
        rememberDeepPosition(session, 'phase');
        refreshTimer();
        announce(`Fase selecionada: ${phase.label}. O cronômetro está parado.`);
      });
      return control;
    }));
    const start = button('Iniciar', 'timer-start', { className: 'loop-button loop-button-primary' });
    start.addEventListener('click', () => { if (deepContexts.get(session)?.attempt.status !== 'debrief' && !state.running && elapsedFor(state) < durationFor(session, state)) { state.startedAt = Date.now(); state.running = true; refreshTimer(); } });
    const pause = button('Pausar', 'timer-pause', { disabled: !state.running });
    pause.addEventListener('click', () => { if (state.running) { state.elapsedMs = elapsedFor(state); state.startedAt = null; state.running = false; refreshTimer(); } });
    const reset = button('Reiniciar fase', 'timer-reset');
    reset.addEventListener('click', () => { state.elapsedMs = 0; state.startedAt = null; state.running = false; refreshTimer(); });
    return node('section', { className: 'loop-card loop-timer', 'aria-labelledby': 'loop-agenda-title' }, [
      node('h3', { id: 'loop-agenda-title', text: 'Agenda e cronômetro' }), phaseList,
      node('strong', { id: 'loop-phase-label', text: phases[state.phaseIndex]?.label || 'Sem fase' }),
      node('output', { id: 'loop-timer-display', className: 'loop-timer-display', role: 'timer', 'aria-live': 'off', text: timerText(durationFor(session, state) - elapsedFor(state)) }),
      node('div', { className: 'loop-timer-actions' }, [start, pause, reset]),
      node('p', { id: 'loop-timer-status', className: 'loop-muted', text: 'Pronto para iniciar' }),
      node('p', { className: 'loop-muted', text: 'Fases e evidências só avançam por escolha explícita de quem conduz.' }),
    ]);
  }

  function renderQuestion(session, index, focus = true) {
    const questions = allQuestions(session);
    const entry = questions[Math.min(Math.max(0, index), questions.length - 1)];
    const area = document.getElementById('loop-question-area');
    if (!entry) { replaceContent(area, node('p', { text: 'Nenhuma pergunta disponível nesta sessão.' })); return; }
    const state = sessionRuntime(session);
    state.questionIndex = questions.indexOf(entry);
    rememberDeepPosition(session, focus ? 'question' : null);
    const question = entry.question;
    questionSerial += 1;
    const serial = questionSerial;
    area.dataset.questionId = question.id;
    area.dataset.questionKind = question.kind;
    area.dataset.isReserve = String(entry.reserve);
    const select = node('select', { id: 'loop-question-select', 'data-action': 'select-question' });
    for (const [isReserve, label] of [[false, 'Perguntas principais'], [true, 'Reservas — usar como substituta']]) {
      const group = node('optgroup', { label });
      questions.forEach((item, itemIndex) => { if (item.reserve === isReserve) group.append(node('option', { value: itemIndex, 'data-question-id': item.question.id, text: `${item.question.id} · ${item.question.category || KIND_LABELS[item.question.kind] || 'Pergunta'}` })); });
      if (group.childElementCount) select.append(group);
    }
    select.value = String(state.questionIndex);
    select.addEventListener('change', () => renderQuestion(session, Number(select.value)));
    const previous = button('← Anterior', 'previous-question', { disabled: state.questionIndex === 0 });
    previous.addEventListener('click', () => renderQuestion(session, state.questionIndex - 1));
    const next = button('Próxima →', 'next-question', { disabled: state.questionIndex === questions.length - 1 });
    next.addEventListener('click', () => renderQuestion(session, state.questionIndex + 1));
    const readout = node('section', { id: 'loop-readout', className: 'loop-readout', hidden: true, 'aria-label': 'Leitura em voz alta — somente a pergunta', 'data-student-prompt': '' }, [node('p', { text: question.prompt })]);
    const readButton = button('Ler em voz alta', 'read-aloud', { 'aria-controls': 'loop-readout', 'aria-expanded': 'false' });
    readButton.addEventListener('click', () => {
      readout.hidden = !readout.hidden;
      readButton.setAttribute('aria-expanded', String(!readout.hidden));
      readButton.textContent = readout.hidden ? 'Ler em voz alta' : 'Fechar leitura';
      if (!readout.hidden) { readout.tabIndex = -1; readout.focus(); }
    });
    const present = button('Apresentar pergunta', 'present-prompt');
    present.addEventListener('click', () => presentSelection(`<p>${escaped(question.prompt)}</p>`));
    const notesSections = [
      ['Objetivo da observação', question.notes?.objective],
      ['Evidências a procurar', question.notes?.evidence],
      ['Limites e cuidados', question.notes?.limits],
      ['Esclarecimentos possíveis', question.notes?.clarifications],
      ['Observações para condução', question.notes?.observations],
      ['Próximo aprofundamento sugerido', question.notes?.nextFollowup],
      ['Alternativas válidas e seus limites', question.notes?.alternatives],
    ].filter(([, value]) => Array.isArray(value) ? value.length : value);
    const notes = details(isPublic ? 'Notas do instrutor' : 'Notas privadas do instrutor', [
      ...notesSections.map(([title, value]) => node('section', { className: 'loop-stack' }, [node('h4', { text: title }), Array.isArray(value) ? textList(value) : node('p', { text: value })])),
      question.notes?.ratingSignals ? node('section', { className: 'loop-stack', 'data-deep-rating-signals': '' }, [node('h4', { text: 'Sinais de qualidade desta resposta — régua de treino' }), ...['incompleta', 'regular', 'boa', 'excelente'].map(value => node('p', {}, [node('strong', { text: `${value.charAt(0).toUpperCase()}${value.slice(1)}: ` }), String(question.notes.ratingSignals[value] || '')]))]) : null,
      question.exercise?.premisesHtml ? node('section', { className: 'loop-stack', 'data-exercise-premises': '' }, [node('h4', { text: isPublic ? 'Premissas do exercício' : 'Premissas privadas do exercício' }), htmlBlock(question.exercise.premisesHtml)]) : null,
      question.exercise?.instructorHtml ? details(isPublic ? 'Orientações de condução do exercício' : 'Orientações privadas do exercício', htmlBlock(question.exercise.instructorHtml), { 'data-exercise-instructor': '' }) : null,
      question.source ? node('p', { className: 'loop-source', text: `Fonte: ${question.source.label || ''} · ${question.source.path || ''}${question.source.anchor ? `#${question.source.anchor.replace(/^#/, '')}` : ''}${question.source.line ? ` · linha ${question.source.line}` : ''}` }) : null,
    ], { 'data-instructor-notes': '' });
    const kindLabel = KIND_LABELS[question.kind] || 'Pergunta';
    const contextParts = [entry.reserve ? 'Reserva substituta' : 'Pergunta principal', kindLabel];
    if (question.category && question.category !== kindLabel) contextParts.push(question.category);
    replaceContent(area,
      node('div', { className: 'loop-question-nav' }, [node('div', { className: 'loop-field' }, [node('label', { for: 'loop-question-select', text: 'Pergunta ou reserva substituta' }), select]), node('div', { className: 'loop-question-actions' }, [previous, next])]),
      node('p', { className: 'loop-question-context', 'data-question-context': '', text: contextParts.join(' · ') }),
      node('h3', { id: 'loop-question-heading', tabindex: '-1', text: question.kind === 'presentation' ? 'Contexto e tarefa de apresentação' : 'Pergunta para a candidata' }),
      node('p', { id: 'loop-question-prompt', className: 'loop-prompt', 'data-prompt': '', text: question.prompt }),
      node('div', { className: 'loop-question-actions' }, [readButton, present]), readout,
      hasEvaluatorGuide(session, question) ? renderEvaluatorGuide(session, question) : null,
      hasEvaluatorGuide(session, question) ? renderAssessment(session, question, serial) : null,
      node('section', { className: 'loop-stack', 'aria-label': isPublic ? 'Aprofundamentos para condução' : 'Aprofundamentos privados' }, (question.followups || []).map((followup, followupIndex) => details(`Aprofundamento ${followupIndex + 1}`, node('p', { text: followup }), { className: 'loop-details loop-followup', 'data-followup-index': followupIndex }))),
      notes,
      question.exercise ? renderExercise(session, question, serial) : null,
      session.candidateQuestion ? details('Pergunta de encerramento da candidata', node('p', { text: session.candidateQuestion }), { 'data-candidate-question': '' }) : null,
      session.notesHtml ? details('Notas gerais da sessão', htmlBlock(session.notesHtml), { 'data-session-notes': '' }) : null,
    );
    if (focus) document.getElementById('loop-question-heading')?.focus();
  }

  function renderEvaluatorGuide(session, question) {
    const guide = question.evaluatorGuide;
    const common = session.evaluationGuide;
    const section = (title, content) => node('section', { className: 'loop-stack' }, [node('h4', { text: title }), content]);
    const legend = (title, entries) => section(title, node('ul', {}, entries.map(entry => node('li', {}, [
      node('strong', { text: entry.label }), entry.description ? ` — ${entry.description}` : '',
    ]))));
    const commonGuide = details('Legenda e orientações da sessão', [
      node('h4', { text: common.title }), node('p', { className: 'loop-muted', text: common.notice }),
      legend('Qualidade observada', common.levels || []),
      legend('Apoio durante a resposta', common.supports || []),
      legend('Base da anotação', common.bases || []),
      legend('Ações para o próximo treino', common.actions || []),
      common.instructions?.length ? section('Como usar a ficha', textList(common.instructions)) : null,
      common.pocketQuestions?.length ? section('Perguntas de bolso', textList(common.pocketQuestions)) : null,
      common.neutralPrompts?.length ? section('Aprofundar sem induzir', node('ul', {}, common.neutralPrompts.map(prompt => node('li', { className: 'loop-stack' }, [
        node('p', {}, [node('strong', { text: 'Evite induzir: ' }), String(prompt.leading || '')]),
        node('p', {}, [node('strong', { text: 'Pergunta neutra: ' }), String(prompt.neutral || '')]),
      ])))) : null,
      common.example ? section('Exemplo de anotação', node('p', { className: 'loop-assessment-text', text: common.example })) : null,
      common.closing ? section('Fechamento da conversa', node('p', { text: common.closing })) : null,
    ], { 'data-evaluation-guide': '' });
    return details(`Cola do avaliador · ${guide.code}`, [
      section('O que se espera nesta pergunta', node('p', { text: guide.expected })),
      ...['incompleta', 'regular', 'boa', 'excelente'].map(value => section(
        common.levels?.find(level => level.value === value)?.label || value,
        node('p', { text: guide.levels?.[value] || '' }),
      )),
      section('Próximo aprofundamento', node('p', { text: guide.nextFollowup })),
      guide.cautions?.length ? section('Cuidados na observação', textList(guide.cautions)) : null,
      guide.factsToConfirm?.length ? section('Fatos a confirmar', textList(guide.factsToConfirm)) : null,
      commonGuide,
    ], { 'data-evaluator-guide': '', 'data-evaluator-code': guide.code });
  }

  function renderAssessment(session, question, serial) {
    const record = recordFor(session);
    if (!record.questionAssessments[question.id]) record.questionAssessments[question.id] = { draft: assessmentDraft(), observations: [] };
    const assessment = record.questionAssessments[question.id];
    const draft = assessment.draft;
    const common = session.evaluationGuide;
    const code = question.evaluatorGuide.code;
    const prefix = `loop-assessment-${serial}`;
    function updateDraft(field, value) {
      Object.assign(draft, assessmentDraft({ ...draft, [field]: value }));
      saveRecord(session);
    }
    function textField(field, label, rows = 3) {
      const id = `${prefix}-${field}`;
      const input = node('textarea', { id, rows, value: draft[field], 'data-assessment-field': field });
      input.addEventListener('input', () => updateDraft(field, input.value));
      return node('div', { className: 'loop-field' }, [node('label', { for: id, text: label }), input]);
    }
    function selectField(field, label, choices, emptyLabel) {
      const id = `${prefix}-${field}`;
      const input = node('select', { id, 'data-assessment-field': field }, [
        emptyLabel ? node('option', { value: '', text: emptyLabel }) : null,
        ...choices.filter(choice => ASSESSMENT_VALUES[field].includes(choice.value)).map(choice => node('option', { value: choice.value, text: choice.label })),
      ]);
      input.value = draft[field];
      input.addEventListener('change', () => { updateDraft(field, input.value); input.value = draft[field]; });
      return node('div', { className: 'loop-field' }, [node('label', { for: id, text: label }), input]);
    }
    function choicesField(field, label, choices, attribute) {
      return node('fieldset', { className: 'loop-assessment-options' }, [
        node('legend', { text: label }),
        ...choices.filter(choice => ASSESSMENT_VALUES[field].includes(choice.value)).map((choice, index) => {
          const id = `${prefix}-${field}-${index}`;
          const input = node('input', { type: 'checkbox', id, checked: draft[field].includes(choice.value), [attribute]: choice.value });
          input.addEventListener('change', () => {
            const selected = input.checked ? [...draft[field], choice.value] : draft[field].filter(value => value !== choice.value);
            updateDraft(field, selected);
          });
          return node('label', { className: 'loop-check', for: id }, [input, node('span', { text: choice.label })]);
        }),
      ]);
    }
    const dateId = `${prefix}-date`;
    const dateInput = node('input', { id: dateId, type: 'date', value: draft.date, 'data-assessment-field': 'date' });
    dateInput.addEventListener('input', () => updateDraft('date', dateInput.value));
    const history = node('section', { className: 'loop-stack loop-assessment-history', 'data-assessment-history': '', 'aria-label': `Histórico privado de observações · ${code}` });
    const displayLabel = (choices, value) => choices?.find(choice => choice.value === value)?.label || 'Não registrado';
    function renderHistory() {
      replaceContent(history, node('h4', { text: 'Histórico de observações' }),
        assessment.observations.length ? node('ol', { className: 'loop-assessment-observations' }, assessment.observations.map((observation, index) => {
          const fields = [
            ['Data da observação', observation.date],
            ['Qualidade observada', displayLabel(common.levels, observation.quality)],
            ['Apoio observado', displayLabel(common.supports, observation.support)],
            ['O que a candidata disse', observation.said],
            ['O que foi demonstrado', observation.demonstrated],
            ['O que falta observar ou confirmar', observation.missing],
            ['Base da anotação', observation.bases.map(value => displayLabel(common.bases, value)).join('; ')],
            ['Próximas ações', observation.actions.map(value => displayLabel(common.actions, value)).join('; ')],
            ['Próximo teste ou pergunta', observation.nextTest],
          ];
          return node('li', { className: 'loop-card loop-stack', 'data-assessment-observation-index': index }, [
            node('h4', { text: `Observação ${index + 1}` }),
            node('p', { className: 'loop-muted' }, [node('span', { text: 'Registrada em ' }), node('time', { datetime: observation.savedAt, text: new Date(observation.savedAt).toLocaleString('pt-BR') })]),
            node('dl', {}, fields.flatMap(([label, value]) => [node('dt', { text: label }), node('dd', { text: value || 'Não registrado' })])),
          ]);
        })) : node('p', { className: 'loop-muted', text: 'Nenhuma observação registrada. O rascunho é salvo automaticamente; use Registrar observação para preservar esta resposta no histórico.' }),
      );
    }
    const save = button('Registrar observação', 'save-assessment', { className: 'loop-button loop-button-primary' });
    save.addEventListener('click', () => {
      assessment.observations.push({ ...assessmentDraft(draft), savedAt: new Date().toISOString() });
      saveRecord(session);
      renderHistory();
      announce(`Observação registrada para ${code}. O histórico anterior e o rascunho foram preservados.`);
    });
    renderHistory();
    return details(`Ficha privada da resposta · ${code}`, [
      node('p', { className: 'loop-muted', text: 'Esta ficha fica apenas neste navegador. Preserve a primeira resposta e registre novas observações para acompanhar a evolução. O botão abaixo acrescenta uma observação ao histórico e mantém o rascunho.' }),
      node('p', { className: 'loop-muted', text: 'Classifique a resposta desta rodada, não a pessoa. Esta é uma régua de preparação, sem média ou vínculo com avaliação oficial. Não observado não é zero.' }),
      node('div', { className: 'loop-dimension-grid' }, [
        node('div', { className: 'loop-field' }, [node('label', { for: dateId, text: 'Data da observação' }), dateInput]),
        selectField('quality', 'Qualidade observada', common.levels || []),
        selectField('support', 'Apoio observado durante a resposta', common.supports || [], 'Não registrado'),
      ]),
      node('div', { className: 'loop-dimension-grid' }, [
        textField('said', 'O que a candidata disse'), textField('demonstrated', 'O que foi demonstrado'),
        textField('missing', 'O que falta observar ou confirmar'), textField('nextTest', 'Próximo teste ou pergunta'),
      ]),
      node('div', { className: 'loop-dimension-grid' }, [
        choicesField('bases', 'Base da anotação', common.bases || [], 'data-assessment-basis'),
        choicesField('actions', 'Próximas ações de treino', common.actions || [], 'data-assessment-action'),
      ]),
      save, history,
    ], { 'data-assessment': '', 'data-assessment-question-id': question.id, 'data-evaluator-code': code });
  }

  function renderExercise(session, question, serial) {
    const exercise = question.exercise;
    const record = recordFor(session);
    const savedDraft = record.exerciseDrafts[question.id];
    if (!savedDraft || typeof savedDraft.request !== 'string') record.exerciseDrafts[question.id] = { request: '' };
    const draft = record.exerciseDrafts[question.id];
    const requestId = `loop-request-${serial}`;
    const requestInput = node('textarea', { id: requestId, rows: 3, 'data-evidence-request': '', 'data-question-id': question.id, value: draft.request, placeholder: 'Registre o pedido feito pela candidata, sem completar ou antecipar a investigação.' });
    const cardsArea = node('div', { className: 'loop-evidence-grid' });
    const log = node('section', { className: 'loop-log', 'aria-label': 'Registro de liberações de evidência', 'data-evidence-log': '' });
    const releaseControls = [];
    const wasReleased = card => record.evidenceLog.some(entry => entry.questionId === question.id && entry.cardId === card.id);

    function updateLog() {
      const entries = record.evidenceLog.filter(entry => entry.questionId === question.id);
      log.replaceChildren(node('h4', { text: 'Registro de liberações' }), entries.length ? node('ol', {}, entries.map(entry => {
        const card = exercise.cards?.find(item => item.id === entry.cardId);
        return node('li', {}, [node('strong', { text: card?.label || entry.cardId }), node('span', { text: ` · ${new Date(entry.releasedAt).toLocaleTimeString('pt-BR')} · Pedido: ${entry.request}` })]);
      })) : node('p', { className: 'loop-muted', text: 'Nenhuma evidência liberada. O cronômetro não libera cartões.' }));
    }

    function updateControls() {
      for (const item of releaseControls) {
        const released = wasReleased(item.card);
        item.release.disabled = released || !requestInput.value.trim() || !item.relevant.checked || (item.card.conditional && !item.conditional?.checked);
        item.release.textContent = released ? 'Evidência liberada' : 'Liberar evidência';
        item.present.hidden = !released;
        item.wrapper.dataset.released = String(released);
        item.status.hidden = !released;
      }
    }

    requestInput.addEventListener('input', () => {
      draft.request = requestInput.value;
      // A revised request needs a fresh confirmation of its relevance and conditions.
      for (const item of releaseControls) {
        item.relevant.checked = false;
        if (item.conditional) item.conditional.checked = false;
      }
      saveRecord(session);
      updateControls();
    });
    for (const [cardIndex, card] of (exercise.cards || []).entries()) {
      const cardId = `loop-card-${serial}-${cardIndex}`;
      const relevantId = `${cardId}-relevant`;
      const conditionalId = `${cardId}-conditional`;
      const relevant = node('input', { type: 'checkbox', id: relevantId, 'data-confirm-relevant': '', 'data-card-id': card.id });
      const conditional = card.conditional ? node('input', { type: 'checkbox', id: conditionalId, 'data-confirm-conditional': '', 'data-card-id': card.id }) : null;
      relevant.addEventListener('change', updateControls);
      conditional?.addEventListener('change', updateControls);
      const release = button('Liberar evidência', 'release-evidence', { className: 'loop-button loop-button-primary', 'data-card-id': card.id, disabled: true });
      const present = button('Apresentar evidência', 'present-evidence', { 'data-card-id': card.id, hidden: true });
      present.addEventListener('click', () => { if (wasReleased(card)) presentSelection(inertHtml(card.studentHtml)); });
      const status = node('p', { className: 'loop-released', 'data-evidence-released': '', hidden: true, text: 'Liberada. Use “Apresentar evidência” para abrir somente este conteúdo.' });
      const wrapper = node('article', { className: 'loop-evidence-card', 'data-card-id': card.id, 'data-conditional': String(Boolean(card.conditional)) }, [
        details(card.label || `Cartão ${cardIndex + 1}`, [
          card.conditional ? node('p', { className: 'loop-condition', 'data-release-condition': '', text: `${isPublic ? 'Condição de liberação' : 'Condição privada de liberação'}: ${card.condition || 'A candidata precisa propor a recuperação e definir os critérios de sucesso e de interrupção antes de receber esta evidência.'}` }) : null,
          node('p', { className: 'loop-muted', text: card.request || 'Libere somente quando houver um pedido relevante.' }),
          card.notesHtml ? details(isPublic ? 'Orientação de condução deste cartão' : 'Orientação privada deste cartão', htmlBlock(card.notesHtml), { 'data-card-notes': '' }) : null,
          node('label', { className: 'loop-check', for: relevantId }, [relevant, node('span', { text: 'Confirmo que a candidata fez um pedido relevante para esta evidência.' })]),
          details(isPublic ? 'Consultar informação deste cartão — apoio à condução' : 'Consultar informação deste cartão — somente instrutor', htmlBlock(card.studentHtml), { 'data-card-preview': '' }),
          conditional ? node('label', { className: 'loop-check', for: conditionalId }, [conditional, node('span', { text: card.confirmation || 'Confirmo que a candidata propôs a recuperação e definiu critérios de sucesso e de interrupção.' })]) : null,
          node('div', { className: 'loop-question-actions' }, [release, present]), status,
        ], { 'data-evidence-card': '', id: cardId }),
      ]);
      release.addEventListener('click', () => {
        if (wasReleased(card) || !requestInput.value.trim() || !relevant.checked || (card.conditional && !conditional?.checked)) return;
        record.evidenceLog.push({ questionId: String(question.id), cardId: String(card.id), releasedAt: new Date().toISOString(), request: requestInput.value.trim(), conditionalConfirmed: Boolean(conditional?.checked) });
        saveRecord(session); updateControls(); updateLog();
        announce('Evidência liberada. Para mostrá-la à candidata, escolha Apresentar evidência.');
        present.focus();
      });
      releaseControls.push({ card, relevant, conditional, release, present, wrapper, status });
      cardsArea.append(wrapper);
    }
    updateControls(); updateLog();
    return node('section', { className: 'loop-card loop-stack', 'data-exercise': '', 'aria-label': isPublic ? 'Controle de condução do exercício' : 'Controle privado do exercício' }, [
      node('h4', { text: `Exercício · ${exercise.variantLabel || 'evidências sob solicitação'}` }),
      node('p', { className: 'loop-muted', text: 'Registre o pedido e confirme sua pertinência. A liberação registra a decisão; a apresentação exige outro clique. Não antecipe os próximos cartões.' }),
      node('div', { className: 'loop-field' }, [node('label', { for: requestId, text: 'Solicitação feita pela candidata — campo privado' }), requestInput]),
      cardsArea, log,
    ]);
  }

  function renderRegistration(session) {
    const record = recordFor(session);
    const sessionNumber = activeSessionIndex;
    function recordField(key, label, rows = 3) {
      const id = `loop-record-${sessionNumber}-${key}`;
      const input = node('textarea', { id, rows, value: record[key], 'data-record-field': key });
      input.addEventListener('input', () => { record[key] = input.value; saveRecord(session); });
      return node('div', { className: 'loop-field' }, [node('label', { for: id, text: label }), input]);
    }
    const dimensions = DIMENSIONS.map(([key, label]) => {
      const selectId = `loop-dimension-${sessionNumber}-${key}`;
      const noteId = `${selectId}-note`;
      const select = node('select', { id: selectId, 'data-dimension': key, 'data-dimension-field': 'status' }, RATINGS.map(([value, text]) => node('option', { value, text })));
      select.value = record.dimensions[key].status;
      select.addEventListener('change', () => { record.dimensions[key].status = select.value; saveRecord(session); });
      const note = node('textarea', { id: noteId, rows: 2, value: record.dimensions[key].note, 'data-dimension': key, 'data-dimension-field': 'note' });
      note.addEventListener('input', () => { record.dimensions[key].note = note.value; saveRecord(session); });
      return node('div', { className: 'loop-dimension loop-stack' }, [node('label', { for: selectId, text: label }), select, node('label', { for: noteId, text: `Evidência observada — ${label.toLowerCase()}` }), note]);
    });
    const exportButton = button('Exportar registro da sessão (JSON)', 'export-record');
    exportButton.addEventListener('click', () => {
      const exported = JSON.stringify(recordFor(session), null, 2);
      const url = URL.createObjectURL(new Blob([exported], { type: 'application/json;charset=utf-8' }));
      const link = node('a', { href: url, download: `loop-privado-${String(data.pageId).replace(/[^a-z0-9_-]/gi, '-')}-${String(session.id).replace(/[^a-z0-9_-]/gi, '-')}.json`, hidden: true });
      document.body.append(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      announce('Exportação do registro privado iniciada.');
    });
    return node('section', { className: 'loop-panel loop-registration loop-stack', 'aria-labelledby': 'loop-registration-title', 'data-session-record': session.id }, [
      node('h3', { id: 'loop-registration-title', text: 'Registro privado da sessão' }),
      node('p', { className: 'loop-muted', text: 'Registre fatos e dúvidas antes do feedback. As dimensões abaixo organizam a observação do treino; não são uma rubrica oficial.' }),
      recordField('episodio', 'Episódio e evidências observadas', 5),
      node('div', { className: 'loop-dimension-grid' }, dimensions),
      recordField('duvida', 'Dúvida que permanece'), recordField('ajuda', 'Ajuda oferecida durante o treino'), recordField('proxima', 'Próxima reformulação ou tentativa'),
      node('p', { id: 'loop-save-status', className: 'loop-muted' }), exportButton,
    ]);
  }

  function presentSelection(selectedHtml) {
    // A fresh window receives only the explicit selection. Never copy parent DOM, data, or state.
    let popup;
    try { popup = window.open('about:blank', '_blank', 'popup,width=1100,height=780'); }
    catch { popup = null; }
    if (!popup) { announce(`A janela de apresentação foi bloqueada. Conduza oralmente usando apenas a pergunta ou a evidência selecionada; não compartilhe esta ${isPublic ? 'tela de condução' : 'tela privada'}.`); return; }
    try {
      popup.opener = null;
      const content = inertHtml(selectedHtml);
      const policy = "default-src 'none'; script-src 'none'; style-src 'unsafe-inline'; img-src 'none'; font-src 'none'; connect-src 'none'; form-action 'none'; base-uri 'none'; object-src 'none'";
      const studentDocument = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="${escaped(policy)}"><title>Apresentação</title><style>html{color-scheme:light}body{margin:0;padding:clamp(1.25rem,5vw,4rem);background:#FAF8F5;color:#1F1C19;font:clamp(1.15rem,2vw,1.55rem)/1.6 system-ui,sans-serif;overflow-wrap:anywhere}main{max-width:65rem;margin:auto}h1,h2,h3,h4{line-height:1.25}p{white-space:pre-wrap}pre{white-space:pre-wrap;padding:1rem;background:#F1EDE7}table{border-collapse:collapse;width:100%;font-size:.85em}th,td{border:1px solid #CCC3B8;padding:.6rem;text-align:left;vertical-align:top}code{font-family:ui-monospace,monospace}li+li{margin-top:.5rem}</style></head><body><main>${content}</main></body></html>`;
      const popupDocument = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; frame-src about:; style-src 'unsafe-inline'; script-src 'none'; connect-src 'none'; base-uri 'none'; form-action 'none'"><title>Apresentação</title><style>html,body{margin:0;height:100%;background:#FAF8F5}iframe{display:block;width:100%;height:100%;border:0}</style></head><body><iframe title="Conteúdo selecionado para apresentação" sandbox referrerpolicy="no-referrer" srcdoc="${escaped(studentDocument)}"></iframe></body></html>`;
      popup.document.open(); popup.document.write(popupDocument); popup.document.close();
      popup.focus();
      announce('Janela aberta somente com o conteúdo selecionado. Confira essa janela antes de compartilhar.');
    } catch {
      try { popup.close(); } catch { /* The oral fallback remains available. */ }
      announce(`Não foi possível abrir a apresentação isolada. Conduza oralmente sem compartilhar esta ${isPublic ? 'tela de condução' : 'tela privada'}.`);
    }
  }

  selectSession(0, false);
  refreshTimer();
  setInterval(refreshTimer, 1000);
}
