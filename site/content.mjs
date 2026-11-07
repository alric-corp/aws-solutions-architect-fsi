export const siteName = 'Arquitetura em prática';
export const firstLesson = 'technical-knowledge/02-system-design/ecommerce/01-from-click-to-catalog.md';

// Library presentation follows the purpose of each resource. This does not
// change curriculum, document identities, audience or study-progress rules.
export const libraryGroups = [
  {
    id: 'technical', navigationLabel: 'Técnica', icon: 'layers', title: 'Aprendizagem técnica',
    description: 'Entenda mecanismos, construa arquiteturas e pratique decisões técnicas.',
    entries: [
      { source: 'technical-knowledge/02-system-design/00-system-design-from-zero.md', label: 'Loja Horizonte — comece do zero', description: 'Aulas guiadas que evoluem uma aplicação a partir de necessidades concretas.' },
      { source: 'technical-knowledge/01-fundamentals/README.md', label: 'Fundamentos', description: 'Redes, computação, segurança, dados, observabilidade e resiliência.' },
      { source: 'technical-knowledge/01-fundamentals/redes/README.md', label: 'Redes do zero', description: 'Do clique à resposta: endereços, caminhos, nomes, proteção e investigação.' },
      { source: 'technical-knowledge/01-fundamentals/acid/README.md', label: 'Transações e ACID do zero', description: 'Conceitos, concorrência e laboratórios para compreender transações.' },
      { source: 'technical-knowledge/02-system-design/README.md', label: 'System Design', description: 'Componentes, alternativas e trade-offs de arquitetura.' },
      { source: 'templates/technical-module.md', support: true, label: 'Template de módulo técnico', description: 'Estruture mecanismos, limites e evidências de um assunto técnico.' },
      { source: 'templates/poc.md', support: true, label: 'Template de PoC', description: 'Organize um experimento técnico com uma pergunta verificável.' }
    ]
  },
  {
    id: 'non-technical', navigationLabel: 'Comportamental', icon: 'people', title: 'Aprendizagem não técnica',
    description: 'Desenvolva comunicação, comportamento e narrativas com evidências.',
    entries: [
      { source: 'leadership-principles/README.md', label: 'Leadership Principles', description: 'Estude os princípios e prepare exemplos de decisões e comportamentos.' },
      { source: 'leadership-principles/00-star-and-evidence.md', label: 'STAR, evidências e contribuição individual', description: 'Explique contexto, ação, resultado e o que foi sua contribuição.' },
      { source: 'leadership-principles/stories/', label: 'Histórias STAR', description: 'Consulte narrativas e aprofundamentos de experiências profissionais.' },
      { source: 'leadership-principles/practice-guide.md', label: 'Guia de prática dos Leadership Principles', description: 'Ensaie histórias e perguntas de aprofundamento.' },
      { source: 'leadership-principles/english-practice-60-min.md', label: 'Comunicação em inglês', description: 'Pratique a explicação de experiências e decisões em inglês.' },
      { source: 'templates/star-story.md', support: true, label: 'Template de história STAR', description: 'Organize uma experiência com evidências observáveis.' },
      { source: 'progress/leadership-principles-story-matrix.md', support: true, label: 'Matriz LP × histórias', description: 'Relacione princípios, episódios reais e lacunas de preparação.' }
    ]
  },
  {
    id: 'amazon-role', navigationLabel: 'Amazon e a vaga', icon: 'compass', title: 'Amazon e a vaga',
    description: 'Conheça o papel de SA, a vaga e o foco de preparação para a entrevista.',
    entries: [
      { source: 'role/solutions-architect-role.md', label: 'O papel de um Solutions Architect na AWS', description: 'Entenda responsabilidades e a atuação com clientes.' },
      { source: 'role/job-description.md', label: 'Descrição da vaga', description: 'Consulte os requisitos e o contexto da oportunidade.' },
      { source: 'role/career-levels.md', label: 'Níveis de carreira — anotações', description: 'Revise as anotações de contexto sobre cargos e níveis.' },
      { source: 'interview/interview-process.md', label: 'O que esperar da entrevista na AWS', description: 'Conheça as etapas e os tipos de conversa da preparação.' },
      { source: 'interview/tips-and-strategies.md', label: 'Dicas e estratégias para a entrevista', description: 'Prepare a comunicação e a condução das conversas.' },
      { source: 'leadership-principles/loop-focus.md', label: 'Foco do loop', description: 'Consulte os princípios e as histórias priorizados para este processo.' }
    ]
  },
  {
    id: 'practice', navigationLabel: 'Simulações', icon: 'chat', title: 'Testes e simulações',
    description: 'Pratique investigação, explicação e avaliação do seu raciocínio.',
    entries: [
      { url: '/praticar/index.html', label: 'Simulados de troubleshooting', description: 'Escolha um dos seis enunciados de investigação técnica.' },
      { source: 'interview/simulations/README.md', label: 'Simulações de entrevista', description: 'Prepare sessões comportamentais, técnicas e de arquitetura.' },
      { source: 'interview/simulations/03-system-design/design-questions.md', label: 'Perguntas de design arquitetural', description: 'Defenda uma solução e discuta mudanças de requisito.' },
      { source: 'interview/simulations/04-troubleshooting/modelo-registro-sessao.md', support: true, label: 'Registro de sessão', description: 'Use o modelo em branco para registrar hipóteses e evidências.' },
      { source: 'templates/mock-interview-feedback.md', support: true, label: 'Feedback de simulação', description: 'Organize observações e próximos exercícios após uma rodada.' },
      { source: 'progress/competencies.md', label: 'Autoavaliação de competências', description: 'Registre lacunas com a matriz didática de competências.' }
    ]
  }
];

export const sections = [
  { id: 'guided', label: 'Comece do zero', icon: 'route', description: 'Acompanhe a Loja Horizonte, do primeiro clique às decisões de arquitetura.', index: 'technical-knowledge/02-system-design/00-system-design-from-zero.md', matches: path => path.includes('/ecommerce/') || path.endsWith('/00-system-design-from-zero.md') },
  { id: 'fundamentals', label: 'Fundamentos', icon: 'layers', description: 'Entenda as peças: redes, segurança, computação, dados e resiliência.', index: 'technical-knowledge/01-fundamentals/README.md', matches: path => path.startsWith('technical-knowledge/01-fundamentals/') },
  { id: 'design', label: 'System Design', icon: 'grid', description: 'Combine componentes, compare alternativas e defenda seus trade-offs.', index: 'technical-knowledge/02-system-design/README.md', matches: path => path.startsWith('technical-knowledge/02-system-design/') },
  { id: 'cases', label: 'Cases FSI', icon: 'bank', description: 'Coleção independente e opcional para consulta. Não faz parte das trilhas ou do progresso principal.', index: 'cases/', matches: path => path.startsWith('cases/') },
  { id: 'leadership', label: 'Leadership Principles', icon: 'people', description: 'Transforme experiências reais em histórias claras, com método STAR.', index: 'leadership-principles/README.md', matches: path => path.startsWith('leadership-principles/') },
  { id: 'interview', label: 'Entrevistas e simulações', icon: 'chat', description: 'Pratique a explicação, investigue falhas e prepare sua próxima conversa.', index: 'interview/', matches: path => path.startsWith('interview/') },
  { id: 'role', label: 'O papel de um SA', icon: 'compass', index: 'role/', matches: path => path.startsWith('role/') },
  { id: 'progress', label: 'Meu desenvolvimento', icon: 'chart', index: 'progress/', matches: path => path.startsWith('progress/') },
  { id: 'templates', label: 'Templates de prática', icon: 'file', index: 'templates/', matches: path => path.startsWith('templates/') },
  { id: 'references', label: 'Referências', icon: 'book', index: 'references/README.md', matches: path => path.startsWith('references/') },
  { id: 'guide', label: 'Sobre o material', icon: 'info', index: 'README.md', matches: () => true }
];

// Only versioned study content is published. Local ignored notes, operational
// documentation, credentials and repository metadata never enter the output.
export const publicRoots = ['technical-knowledge/', 'cases/', 'leadership-principles/', 'interview/', 'role/', 'progress/', 'templates/', 'references/'];
export const allowedAssetExtensions = new Set(['.svg', '.png', '.jpg', '.jpeg', '.webp', '.gif', '.drawio', '.pdf']);
export const sectionFor = path => sections.find(section => section.matches(path));
