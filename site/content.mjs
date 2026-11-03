export const siteName = 'Arquitetura em prática';
export const firstLesson = 'technical-knowledge/02-system-design/ecommerce/01-from-click-to-catalog.md';

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
