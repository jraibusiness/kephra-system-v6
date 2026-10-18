// ============================================================
// KEPHRA SYSTEM v7 — constantes, taxonomia e esquema do banco
// ============================================================

const TZ = 'America/Sao_Paulo';
const PROP_SHEET_ID = 'KEPHRA_SHEET_ID';
const CAL_PLAN_NAME = 'Kephra · Plano';
const CAL_ROUTINE_NAME = 'Kephra · Rotina';

// ------------------------------------------------------------
// TIPOS DE ESFORÇO
// Base: Cal Newport (deep work × shallow work), maker × manager
// schedule (Paul Graham) e gestão de energia (Loehr & Schwartz:
// física, mental, emocional). `deep` = exige bloco protegido;
// `slot` = janela preferida do dia para o agendador.
// ------------------------------------------------------------
const EFFORT_TYPES = {
  mental_profundo: { label: 'Mental profundo', icon: '🧠', deep: true,  slot: 'manha', desc: 'Criação, estratégia, composição, arquitetura de sistemas, escrita longa. Exige foco ininterrupto.' },
  mental_analitico: { label: 'Mental analítico / estudo', icon: '📚', deep: true, slot: 'manha', desc: 'Pesquisa, leitura técnica, análise de dados, planilhas, aprendizado de algo novo.' },
  mental_raso: { label: 'Administrativo (raso)', icon: '📨', deep: false, slot: 'tarde', desc: 'E-mails, burocracia, agendamentos, pagamentos, organização. Fácil de interromper.' },
  social: { label: 'Social / comunicação', icon: '🗣️', deep: false, slot: 'tarde', desc: 'Calls, reuniões, vendas, networking, aulas e mentorias. Gasta energia emocional.' },
  artistico: { label: 'Artístico / performance', icon: '🎼', deep: true, slot: 'qualquer', desc: 'Reger, ensaiar, estudar partitura, gravar, apresentar.' },
  fisico_repetitivo: { label: 'Físico repetitivo', icon: '🔁', deep: false, slot: 'tarde', desc: 'Louça, limpeza, compras, marmitas. Baixa carga cognitiva.' },
  fisico_intenso: { label: 'Físico intenso / técnico', icon: '🔨', deep: false, slot: 'tarde', desc: 'Obra, reparo, carregar peso, mudança (ex.: quebrar parede para consertar cano).' },
  cuidado_fisico: { label: 'Cuidado físico / recuperação', icon: '🏃', deep: false, slot: 'qualquer', desc: 'Caminhada, treino, alongamento, médico.' },
  logistica: { label: 'Logística / deslocamento', icon: '🚗', deep: false, slot: 'qualquer', desc: 'Trânsito, viagens, filas, buscar/entregar coisas.' },
};

const PRIORITIES = {
  1: { label: 'P1 · Crítica', weight: 100 },
  2: { label: 'P2 · Alta', weight: 60 },
  3: { label: 'P3 · Média', weight: 30 },
  4: { label: 'P4 · Baixa', weight: 10 },
};

const ROUTINE_KINDS = ['ritual', 'refeicao', 'compromisso', 'saude', 'livre', 'sono', 'casa', 'revisao'];

// ------------------------------------------------------------
// ESQUEMA — cada aba da planilha é uma tabela
// ------------------------------------------------------------
const SCHEMA = {
  Goals: {
    cols: ['id', 'title', 'rank', 'tier', 'deadline', 'status', 'metric',
      'result', 'purpose', 'evidence', 'see', 'hear', 'feel', 'smell', 'taste', 'emotion', 'notes', 'createdAt'],
    num: ['rank'],
  },
  Projects: {
    cols: ['id', 'name', 'goalId', 'status', 'priority', 'color', 'weeklyHours', 'notes', 'createdAt'],
    num: ['priority', 'weeklyHours'],
  },
  Tasks: {
    cols: ['id', 'title', 'keywords', 'projectId', 'estimateMin', 'effortLevel', 'priority', 'deadline',
      'effortType', 'status', 'fixedStart', 'splittable', 'notes', 'createdAt', 'doneAt'],
    num: ['estimateMin', 'effortLevel', 'priority'],
    bool: ['splittable'],
  },
  TimeLogs: {
    cols: ['id', 'taskId', 'start', 'end', 'minutes', 'note'],
    num: ['minutes'],
  },
  Routine: {
    cols: ['id', 'label', 'days', 'start', 'end', 'kind', 'sync', 'seriesId'],
    bool: ['sync'],
  },
  Focus: {
    // key = '0'..'6' (dia da semana, 0 = domingo) ou 'yyyy-MM-dd' (exceção pontual)
    cols: ['key', 'goalId', 'note'],
  },
  Plan: {
    cols: ['id', 'date', 'taskId', 'start', 'end', 'chunk', 'eventId'],
  },
  Settings: {
    cols: ['key', 'value'],
  },
};

const DEFAULT_SETTINGS = {
  workDays: '1,2,3,4,5,6',        // seg–sáb
  workStart: '06:00',
  workEnd: '19:00',
  deepUntil: '11:30',             // trabalho profundo preferencialmente antes do almoço
  bufferMin: '10',                // transição entre tarefas
  capacityPct: '80',              // nunca planejar 100% do tempo livre
  minSlotMin: '20',
  chunkMin: '90',                 // tarefas longas são quebradas em blocos de até 90 min
  sourceCalendars: '',            // IDs extras separados por vírgula (a agenda principal entra sempre)
  emailHour: '6',
  aiProvider: 'claude',           // claude | gemini
  claudeModel: 'claude-opus-5-5',
  geminiModel: 'gemini-2.5-flash',
  periodFocusGoalId: '',          // meta-mestra do período (ex.: fazer caixa)
  periodFocusUntil: '',
};

// ------------------------------------------------------------
// SEMENTE — base de controle inicial (tudo editável no app)
// ------------------------------------------------------------
function seedData_() {
  const now = new Date().toISOString();
  return {
    Goals: [
      { id: 'g_caixa', rank: 1, tier: 'curto', title: 'Fazer caixa · aumentar o faturamento', deadline: '', status: 'ativa',
        metric: 'Faturamento mensal recorrente (R$) e caixa acumulado',
        result: 'Faturamento recorrente que paga o custo fixo com folga e acumula caixa para a mudança para os EUA.',
        purpose: 'É o combustível de todos os outros projetos. Sem caixa nada anda.',
        evidence: '', see: '', hear: '', feel: '', smell: '', taste: '', emotion: '', notes: 'Meta-mestra: alimenta todas as outras.', createdAt: now },
      { id: 'g_eua', rank: 2, tier: 'medio', title: 'Voltar a morar nos Estados Unidos', deadline: '', status: 'ativa',
        metric: 'Visto aprovado + renda em USD + mudança feita', result: '', purpose: '', evidence: '', see: '', hear: '', feel: '', smell: '', taste: '', emotion: '', notes: '', createdAt: now },
      { id: 'g_paula', rank: 3, tier: 'medio', title: 'Reconstruir a relação com a Paula', deadline: '', status: 'ativa',
        metric: '', result: '', purpose: '', evidence: '', see: '', hear: '', feel: '', smell: '', taste: '', emotion: '', notes: '', createdAt: now },
      { id: 'g_saude', rank: 4, tier: 'continuo', title: 'Corpo e energia em ordem', deadline: '', status: 'ativa',
        metric: '2 caminhadas/semana + refeições preparadas no domingo', result: '', purpose: 'Energia física sustenta o resto.', evidence: '', see: '', hear: '', feel: '', smell: '', taste: '', emotion: '', notes: '', createdAt: now },
      { id: 'g_casa', rank: 5, tier: 'curto', title: 'Casa funcional', deadline: '', status: 'ativa',
        metric: 'Reparos resolvidos', result: '', purpose: '', evidence: '', see: '', hear: '', feel: '', smell: '', taste: '', emotion: '', notes: 'Só entra na agenda quando não competir com caixa.', createdAt: now },
    ],
    Projects: [
      { id: 'p_mentoria', name: 'Mentoria AK', goalId: 'g_caixa', status: 'ativo', priority: 1, color: '#D4A33B', weeklyHours: 4, notes: 'Maior ROI/hora (importado do Kephra v6 — revisar).', createdAt: now },
      { id: 'p_afmc', name: 'AFMC', goalId: 'g_caixa', status: 'ativo', priority: 2, color: '#2D4A3E', weeklyHours: 8, notes: 'Importado do Kephra v6 — revisar status.', createdAt: now },
      { id: 'p_qj', name: 'Quinta Justa', goalId: 'g_caixa', status: 'ativo', priority: 2, color: '#7A8B5C', weeklyHours: 5, notes: 'Sessões às quintas 19h30–21h.', createdAt: now },
      { id: 'p_edicoes', name: 'Edições Kephra', goalId: 'g_caixa', status: 'ativo', priority: 3, color: '#8B5E3C', weeklyHours: 3, notes: '', createdAt: now },
      { id: 'p_eua', name: 'Visto e rede nos EUA', goalId: 'g_eua', status: 'ativo', priority: 2, color: '#1A365D', weeklyHours: 4, notes: 'O-1, Frank, prospecção EUA (importado do v6).', createdAt: now },
      { id: 'p_plataforma', name: 'Kephra System (esta plataforma)', goalId: 'g_caixa', status: 'ativo', priority: 3, color: '#B85A38', weeklyHours: 3, notes: '', createdAt: now },
      { id: 'p_paula', name: 'Paula', goalId: 'g_paula', status: 'ativo', priority: 2, color: '#9B6B8F', weeklyHours: 0, notes: '', createdAt: now },
      { id: 'p_saude', name: 'Saúde', goalId: 'g_saude', status: 'ativo', priority: 2, color: '#4A5D3B', weeklyHours: 0, notes: '', createdAt: now },
      { id: 'p_casa', name: 'Casa / manutenção', goalId: 'g_casa', status: 'ativo', priority: 4, color: '#8A7F70', weeklyHours: 0, notes: '', createdAt: now },
    ],
    Tasks: [
      { id: 't_revisar', title: 'Revisar metas, projetos e rotina importados no Kephra', keywords: 'setup, kephra', projectId: 'p_plataforma',
        estimateMin: 45, effortLevel: 2, priority: 1, deadline: '', effortType: 'mental_analitico', status: 'todo', fixedStart: '', splittable: false, notes: '', createdAt: now, doneAt: '' },
      { id: 't_sensorial', title: 'Descrever a meta "Fazer caixa" com evidências sensoriais', keywords: 'metas, robbins', projectId: 'p_plataforma',
        estimateMin: 30, effortLevel: 2, priority: 2, deadline: '', effortType: 'mental_profundo', status: 'todo', fixedStart: '', splittable: false, notes: 'O que vou ver, ouvir, sentir, cheirar e saborear quando estiver atingida.', createdAt: now, doneAt: '' },
    ],
    TimeLogs: [],
    Routine: [
      { id: 'r_cafe', label: 'Café lento + notícias', days: '0,1,2,3,4,5,6', start: '04:45', end: '06:00', kind: 'ritual', sync: true, seriesId: '' },
      { id: 'r_almoco', label: 'Almoço', days: '0,1,2,3,4,5,6', start: '11:30', end: '12:30', kind: 'refeicao', sync: true, seriesId: '' },
      { id: 'r_caminhada', label: 'Caminhada · Parque da Aclimação', days: '2,5', start: '17:00', end: '18:00', kind: 'saude', sync: true, seriesId: '' },
      { id: 'r_livre', label: 'Tempo livre · TV', days: '0,1,2,3,5,6', start: '19:30', end: '21:30', kind: 'livre', sync: true, seriesId: '' },
      { id: 'r_jantar', label: 'Jantar', days: '0,1,2,3,5,6', start: '20:00', end: '20:45', kind: 'refeicao', sync: true, seriesId: '' },
      { id: 'r_qj', label: 'Quinta Justa (sessão)', days: '4', start: '19:30', end: '21:00', kind: 'compromisso', sync: true, seriesId: '' },
      { id: 'r_jantar_qui', label: 'Jantar', days: '4', start: '21:00', end: '21:30', kind: 'refeicao', sync: true, seriesId: '' },
      { id: 'r_sono', label: 'Sono', days: '0,1,2,3,4,5,6', start: '21:45', end: '23:59', kind: 'sono', sync: false, seriesId: '' },
      { id: 'r_marmitas', label: 'Preparar refeições da semana', days: '0', start: '09:00', end: '11:30', kind: 'casa', sync: true, seriesId: '' },
      { id: 'r_revisao', label: 'Revisão semanal + planejamento', days: '0', start: '17:00', end: '18:00', kind: 'revisao', sync: true, seriesId: '' },
    ],
    Focus: [
      { key: '0', goalId: 'g_saude', note: 'Domingo: marmitas, descanso, revisão semanal.' },
      { key: '1', goalId: 'g_caixa', note: '' },
      { key: '2', goalId: 'g_caixa', note: '' },
      { key: '3', goalId: 'g_caixa', note: '' },
      { key: '4', goalId: 'g_caixa', note: 'Noite: Quinta Justa.' },
      { key: '5', goalId: 'g_caixa', note: '' },
      { key: '6', goalId: 'g_eua', note: '' },
    ],
    Plan: [],
    Settings: Object.keys(DEFAULT_SETTINGS).map(k => ({ key: k, value: DEFAULT_SETTINGS[k] })),
  };
}
