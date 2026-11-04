// Plano até a entrevista, exibido em Meu estudo. Para mudar tarefas ou datas, edite só este arquivo.
// Cada tarefa precisa de um id estável: as marcações ficam salvas no navegador por esse id.
// A página é pública; para pessoas de fora do grupo de estudo, use o papel em vez do nome.
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const focus = '/leadership-principles/loop-focus.html';

export const studyPlan = {
  interview: '2026-11-10',
  note: 'A versão final da apresentação vai para a coordenadora até 09/11, 24 horas antes.',
  days: [
    { date: '2026-11-04', label: 'Qua 04/11', tasks: [
      { id: 'redes-adassa', text: 'Conversar com a Adassa sobre redes', done: true },
      { id: 'star06-apresentacao', text: 'Conferir se o STAR-06 bate com a apresentação: DMS ou snapshot, e quem fez a troca final', href: '/leadership-principles/stories/star-06-emergency-db-migration.html' },
      { id: 'apresentacao-final', text: 'Finalizar a apresentação do case' },
      { id: 'apresentacao-pablo', text: 'Enviar a apresentação para o Pablo montar perguntas e avaliar' }
    ] },
    { date: '2026-11-05', label: 'Qui 05/11', tasks: [
      { id: 'lacunas-historias', text: 'Encontrar episódios reais para as lacunas: discordância e influência entre equipes', href: focus },
      { id: 'rodadas-1-2', text: 'Rodadas 1 e 2 de LPs, com perguntas de follow-up', href: `${focus}#rodadas-no-formato-do-loop` },
      { id: 'simulados-01-02', text: 'Simulados de checkout lento e de pedido durante falha, para levar dúvidas ao Cleber', href: '/praticar/index.html' }
    ] },
    { date: '2026-11-06', label: 'Sex 06/11', tasks: [
      { id: 'cleber', text: 'Conversar com o Cleber: ACID, microsserviços, sistemas distribuídos e troubleshooting' },
      { id: 'rodadas-3-4', text: 'Rodadas 3 e 4 de LPs, com perguntas de follow-up', href: `${focus}#rodadas-no-formato-do-loop` },
      { id: 'perguntas-pablo', text: 'Responder às perguntas do Pablo e ajustar a apresentação' }
    ] },
    { date: '2026-11-07', label: 'Sáb 07/11', tasks: [
      { id: 'case-eventos', text: 'Praticar um case orientado a eventos e assíncrono, fora de e-commerce: por exemplo, pagamentos com fila, idempotência e outbox' },
      { id: 'cenario-chat', text: 'Praticar um cenário de chat conversacional' },
      { id: 'ingles-graciele', text: 'Conversar com a Graciele em inglês sobre um case técnico e alguns LPs', href: '/leadership-principles/english-practice-60-min.html' }
    ] },
    { date: '2026-11-08', label: 'Dom 08/11', tasks: [
      { id: 'simulado-completo', text: 'Simulado completo: apresentação de 60 minutos com perguntas, uma rodada de LPs e uma técnica' },
      { id: 'perguntas-entrevistadores', text: 'Preparar duas ou três perguntas para fazer a cada entrevistador' }
    ] },
    { date: '2026-11-09', label: 'Seg 09/11', tasks: [
      { id: 'enviar-apresentacao', text: 'Enviar a versão final da apresentação à coordenadora, 24 horas antes da entrevista' },
      { id: 'logistica', text: 'Confirmar horários e links; testar câmera, microfone e compartilhamento de tela' },
      { id: 'revisao-leve', text: 'Revisão leve do mapa de histórias e dos números da apresentação, sem assunto novo' }
    ] },
    { date: '2026-11-10', label: 'Ter 10/11', tasks: [
      { id: 'dia-entrevista', text: 'Entrar alguns minutos antes, com a apresentação aberta' }
    ] },
    { date: '', label: 'Depois do loop', tasks: [
      { id: 'remuneracao', text: 'Enviar a expectativa de remuneração para a recrutadora' }
    ] }
  ]
};

export function renderStudyPlan(plan = studyPlan) {
  const tasks = plan.days.flatMap(day => day.tasks);
  const done = tasks.filter(task => task.done).length;
  const [, month, day] = plan.interview.split('-');
  const days = plan.days.map(item => `<section class="plan-day"${item.date ? ` data-plan-day="${item.date}"` : ''}><h3>${escape(item.label)}</h3><ul class="plan-list">${item.tasks.map(task => `<li><label><input type="checkbox" data-plan-task="${escape(task.id)}"${task.done ? ' checked' : ''}><span>${escape(task.text)}</span></label>${task.href ? `<a href="${escape(task.href)}" aria-label="Abrir: ${escape(task.text)}">Abrir →</a>` : ''}</li>`).join('')}</ul></section>`).join('');
  return `<section class="study-plan" aria-labelledby="plano-entrevista" data-plan data-interview="${plan.interview}"><h2 id="plano-entrevista">Plano até a entrevista</h2>`
    + `<p class="plan-countdown" data-plan-countdown data-plan-note="${escape(plan.note)}">Entrevista em ${day}/${month}. ${escape(plan.note)}</p>`
    + `<p class="plan-summary"><strong data-plan-done>${done}</strong> de ${tasks.length} tarefas concluídas</p>`
    + `<div class="plan-progress" role="progressbar" aria-label="Tarefas do plano concluídas" aria-valuemin="0" aria-valuemax="${tasks.length}" aria-valuenow="${done}" data-plan-bar><span style="width: ${Math.round(done / tasks.length * 100)}%"></span></div>`
    + `<div class="plan-days">${days}</div></section>`;
}
