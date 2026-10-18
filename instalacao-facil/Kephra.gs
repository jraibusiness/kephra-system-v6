// KEPHRA SYSTEM — arquivo único gerado por tools/bundle.sh. Não edite aqui; edite apps-script/.

// ==================== Config.gs ====================
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

// Horizontes da cascata de metas: 10 anos → semana (o dia é o plano de tarefas)
const HORIZONS = {
  '10a': { label: '10 anos', days: 3650 }, '5a': { label: '5 anos', days: 1825 }, '2a': { label: '2 anos', days: 730 },
  '1a': { label: '1 ano', days: 365 }, '6m': { label: 'Semestre', days: 182 }, '3m': { label: 'Trimestre', days: 91 },
  '2m': { label: 'Bimestre', days: 61 }, '1m': { label: 'Mês', days: 30 }, '1s': { label: 'Semana', days: 7 },
};

const ROUTINE_KINDS = ['ritual', 'refeicao', 'compromisso', 'saude', 'livre', 'sono', 'casa', 'revisao'];

// ------------------------------------------------------------
// ESQUEMA — cada aba da planilha é uma tabela
// ------------------------------------------------------------
const SCHEMA = {
  Goals: {
    cols: ['id', 'title', 'rank', 'horizon', 'deadline', 'status', 'metric',
      'result', 'purpose', 'evidence', 'see', 'hear', 'feel', 'smell', 'taste', 'emotion', 'notes', 'createdAt', 'parentId'],
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
  Reviews: {
    // Conselhos do estrategista: data = JSON da análise, applied = JSON do que foi aplicado
    cols: ['id', 'date', 'horizon', 'data', 'applied'],
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
  strategyEffort: 'medium',       // profundidade do estrategista (low | medium | high)
  strategyHour: '16',             // revisão automática: domingo (semana), dia 1 (mês/trimestre/ano)
};

// ------------------------------------------------------------
// SEMENTE — base de controle inicial (tudo editável no app)
// ------------------------------------------------------------
function seedData_() {
  const now = new Date().toISOString();
  return {
    Goals: [
      { id: 'g_visao', rank: 1, horizon: '10a', parentId: '', title: 'Visão de 10 anos (escreva a sua)', deadline: '2036-12-31', status: 'ativa',
        metric: '', result: '', purpose: '', evidence: '', see: '', hear: '', feel: '', smell: '', taste: '', emotion: '',
        notes: 'O topo da cascata. Quem você é, onde mora, o que construiu, quanto fatura. Todo o resto deriva daqui.', createdAt: now },
      { id: 'g_eua', rank: 2, horizon: '2a', parentId: 'g_visao', title: 'Voltar a morar nos Estados Unidos', deadline: '', status: 'ativa',
        metric: 'Visto aprovado + renda em USD + mudança feita', result: '', purpose: '', evidence: '', see: '', hear: '', feel: '', smell: '', taste: '', emotion: '', notes: '', createdAt: now },
      { id: 'g_caixa', rank: 3, horizon: '3m', parentId: 'g_eua', title: 'Fazer caixa · aumentar o faturamento', deadline: '', status: 'ativa',
        metric: 'Faturamento mensal recorrente (R$) e caixa acumulado',
        result: 'Faturamento recorrente que paga o custo fixo com folga e acumula caixa para a mudança para os EUA.',
        purpose: 'É o combustível de todos os outros projetos. Sem caixa nada anda.',
        evidence: '', see: '', hear: '', feel: '', smell: '', taste: '', emotion: '', notes: 'Meta-mestra: alimenta todas as outras.', createdAt: now },
      { id: 'g_paula', rank: 4, horizon: '1a', parentId: 'g_visao', title: 'Reconstruir a relação com a Paula', deadline: '', status: 'ativa',
        metric: '', result: '', purpose: '', evidence: '', see: '', hear: '', feel: '', smell: '', taste: '', emotion: '', notes: '', createdAt: now },
      { id: 'g_saude', rank: 5, horizon: '1a', parentId: 'g_visao', title: 'Corpo e energia em ordem', deadline: '', status: 'ativa',
        metric: '2 caminhadas/semana + refeições preparadas no domingo', result: '', purpose: 'Energia física sustenta o resto.', evidence: '', see: '', hear: '', feel: '', smell: '', taste: '', emotion: '', notes: '', createdAt: now },
      { id: 'g_casa', rank: 6, horizon: '1m', parentId: 'g_saude', title: 'Casa funcional', deadline: '', status: 'ativa',
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
    Reviews: [],
    Settings: Object.keys(DEFAULT_SETTINGS).map(k => ({ key: k, value: DEFAULT_SETTINGS[k] })),
  };
}

// ==================== Time.gs ====================
// ============================================================
// TEMPO — datas no fuso do script (America/Sao_Paulo)
// ============================================================

function ymd_(d) { return Utilities.formatDate(d || new Date(), TZ, 'yyyy-MM-dd'); }
function hm_(d) { return Utilities.formatDate(d, TZ, 'HH:mm'); }
function iso_(d) { return Utilities.formatDate(d, TZ, "yyyy-MM-dd'T'HH:mm:ss"); }

function toMin_(hhmm) {
  const p = String(hhmm || '0:0').split(':');
  return Number(p[0]) * 60 + Number(p[1] || 0);
}

// Data local a partir de 'yyyy-MM-dd' + 'HH:mm' (o runtime usa o fuso do script)
function at_(day, hhmm) {
  const d = day.split('-').map(Number);
  const m = toMin_(hhmm);
  return new Date(d[0], d[1] - 1, d[2], Math.floor(m / 60), m % 60, 0, 0);
}

function parseIso_(s) {
  if (!s) return null;
  const m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?/);
  if (!m) return null;
  return new Date(+m[1], +m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0));
}

function dow_(day) { return at_(day, '00:00').getDay(); }

function addDays_(day, n) {
  const d = at_(day, '12:00');
  d.setDate(d.getDate() + n);
  return ymd_(d);
}

function daysBetween_(a, b) {
  return Math.round((at_(b, '12:00') - at_(a, '12:00')) / 86400000);
}

function daysOf_(csv) {
  return String(csv || '').split(',').map(s => s.trim()).filter(s => s !== '').map(Number);
}

const WEEKDAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

// ==================== Db.gs ====================
// ============================================================
// BANCO DE DADOS — Google Sheets como tabelas
// Todas as células são texto puro ('@') para evitar que o Sheets
// converta datas/horas; os tipos são restaurados pelo SCHEMA.
// ============================================================

function ss_() {
  const id = PropertiesService.getScriptProperties().getProperty(PROP_SHEET_ID);
  if (!id) throw new Error('Banco não inicializado. Rode a função setup() no editor do Apps Script.');
  return SpreadsheetApp.openById(id);
}

function sheet_(name) {
  const sh = ss_().getSheetByName(name);
  if (!sh) throw new Error('Aba ausente: ' + name);
  return sh;
}

function uid_(prefix) {
  return (prefix || 'x') + '_' + Utilities.getUuid().slice(0, 8);
}

function decode_(table, row) {
  const s = SCHEMA[table];
  const o = {};
  s.cols.forEach((c, i) => {
    let v = row[i];
    if (v === undefined || v === null) v = '';
    v = String(v);
    if ((s.num || []).indexOf(c) >= 0) o[c] = v === '' ? null : Number(v);
    else if ((s.bool || []).indexOf(c) >= 0) o[c] = v === 'true' || v === 'TRUE';
    else o[c] = v;
  });
  return o;
}

function encode_(table, obj) {
  return SCHEMA[table].cols.map(c => {
    const v = obj[c];
    if (v === undefined || v === null) return '';
    return String(v);
  });
}

const _cache = {};

function all_(table) {
  if (_cache[table]) return _cache[table];
  const sh = sheet_(table);
  const n = sh.getLastRow() - 1;
  const rows = n > 0 ? sh.getRange(2, 1, n, SCHEMA[table].cols.length).getValues() : [];
  _cache[table] = rows.filter(r => r[0] !== '').map(r => decode_(table, r));
  return _cache[table];
}

function find_(table, id) {
  return all_(table).find(r => r[SCHEMA[table].cols[0]] === id) || null;
}

function insert_(table, obj) {
  const key = SCHEMA[table].cols[0];
  if (!obj[key]) obj[key] = uid_(table.slice(0, 1).toLowerCase());
  sheet_(table).appendRow(encode_(table, obj));
  delete _cache[table];
  return obj;
}

function rowIndex_(table, id) {
  const sh = sheet_(table);
  const n = sh.getLastRow() - 1;
  if (n <= 0) return -1;
  const ids = sh.getRange(2, 1, n, 1).getValues();
  for (let i = 0; i < ids.length; i++) if (String(ids[i][0]) === id) return i + 2;
  return -1;
}

function update_(table, id, patch) {
  const r = rowIndex_(table, id);
  if (r < 0) throw new Error(table + ' não encontrado: ' + id);
  const sh = sheet_(table);
  const current = decode_(table, sh.getRange(r, 1, 1, SCHEMA[table].cols.length).getValues()[0]);
  const next = Object.assign(current, patch);
  sh.getRange(r, 1, 1, SCHEMA[table].cols.length).setValues([encode_(table, next)]);
  delete _cache[table];
  return next;
}

function upsert_(table, obj) {
  const key = SCHEMA[table].cols[0];
  if (obj[key] && rowIndex_(table, obj[key]) > 0) return update_(table, obj[key], obj);
  return insert_(table, obj);
}

function remove_(table, id) {
  const r = rowIndex_(table, id);
  if (r > 0) sheet_(table).deleteRow(r);
  delete _cache[table];
}

// Reescreve a tabela inteira (usado pelo Plan, que é regenerado em bloco)
function replaceWhere_(table, predicate, newRows) {
  const keep = all_(table).filter(r => !predicate(r));
  const rows = keep.concat(newRows).map(o => encode_(table, o));
  const sh = sheet_(table);
  const width = SCHEMA[table].cols.length;
  if (sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, width).clearContent();
  if (rows.length) sh.getRange(2, 1, rows.length, width).setValues(rows);
  delete _cache[table];
}

function settings_() {
  const s = Object.assign({}, DEFAULT_SETTINGS);
  all_('Settings').forEach(r => { s[r.key] = r.value; });
  return s;
}

function setSetting_(key, value) {
  upsert_('Settings', { key: key, value: value });
}

// ==================== Scheduler.gs ====================
// ============================================================
// AGENDADOR — transforma tarefas em um plano de dia realista
//
// 1. Tempo livre real = janela de trabalho − rotina − agenda Google
// 2. Capacidade = tempo livre × capacityPct (antídoto contra
//    superestimar o dia)
// 3. Duração realista = estimativa × seu fator histórico
//    (tempo real ÷ previsto, por tipo de esforço)
// 4. Pontuação = prioridade + foco do dia + meta + prazo
// 5. Trabalho profundo vai para a manhã; raso/físico, para a tarde
// ============================================================

const DEEP_MAX_MIN = 240; // teto diário de trabalho profundo (Newport: ~4h)

function focusGoalFor_(day) {
  const f = all_('Focus');
  const byDate = f.find(r => r.key === day);
  if (byDate && byDate.goalId) return byDate;
  return f.find(r => r.key === String(dow_(day))) || null;
}

function actualByTask_() {
  const m = {};
  all_('TimeLogs').forEach(l => {
    let min = l.minutes;
    if (!l.end && l.start) min = Math.round((new Date() - parseIso_(l.start)) / 60000);
    m[l.taskId] = (m[l.taskId] || 0) + (min || 0);
  });
  return m;
}

// Fator de realidade: quanto você de fato leva vs. quanto previu
function realityFactors_() {
  const actual = actualByTask_();
  const agg = {};
  let gEst = 0, gAct = 0, gN = 0;
  all_('Tasks').forEach(t => {
    if (t.status !== 'done' || !t.estimateMin || !actual[t.id]) return;
    const k = t.effortType || 'outro';
    agg[k] = agg[k] || { est: 0, act: 0, n: 0 };
    agg[k].est += t.estimateMin; agg[k].act += actual[t.id]; agg[k].n++;
    gEst += t.estimateMin; gAct += actual[t.id]; gN++;
  });
  const clamp = x => Math.max(0.6, Math.min(2.5, x));
  const global = gN >= 3 ? clamp(gAct / gEst) : 1.2; // sem histórico: +20% (falácia do planejamento)
  const out = { _global: { factor: global, n: gN } };
  Object.keys(EFFORT_TYPES).forEach(k => {
    const a = agg[k];
    out[k] = a && a.n >= 3 ? { factor: clamp(a.act / a.est), n: a.n } : { factor: global, n: a ? a.n : 0 };
  });
  return out;
}

// A meta e todas as suas metas-mãe, até a visão de 10 anos
function goalChain_(goalId, goals) {
  const out = [];
  let id = goalId;
  while (id && goals[id] && out.indexOf(id) < 0) { out.push(id); id = goals[id].parentId; }
  return out;
}

function scoreTask_(t, ctx) {
  let s = (PRIORITIES[t.priority] || PRIORITIES[3]).weight;
  const p = ctx.projects[t.projectId];
  const g = p ? ctx.goals[p.goalId] : null;
  if (g) {
    const chain = goalChain_(g.id, ctx.goals);
    if (ctx.focus && chain.indexOf(ctx.focus.goalId) >= 0) s += 45;
    if (ctx.periodGoal && chain.indexOf(ctx.periodGoal) >= 0) s += 25;
    if (g.rank) s += Math.max(0, 6 - g.rank) * 4;
    if (g.status === 'pausada') s -= 40;
  }
  if (p) {
    s += Math.max(0, 5 - (p.priority || 3)) * 5;
    if (p.status === 'pausado' || p.status === 'arquivado') s -= 50;
  }
  if (t.deadline) {
    const d = daysBetween_(ctx.day, t.deadline.slice(0, 10));
    s += d < 0 ? 90 : Math.max(0, 60 - d * 8);
  }
  if (t.status === 'doing') s += 15;
  if (t.createdAt) s += Math.min(10, daysBetween_(t.createdAt.slice(0, 10), ctx.day) / 3);
  return Math.round(s);
}

function subtract_(slots, busy) {
  let out = slots.slice();
  busy.forEach(b => {
    const next = [];
    out.forEach(s => {
      if (b.end <= s.start || b.start >= s.end) { next.push(s); return; }
      if (b.start > s.start) next.push({ start: s.start, end: b.start });
      if (b.end < s.end) next.push({ start: b.end, end: s.end });
    });
    out = next;
  });
  return out;
}

function busyFor_(day) {
  const d = dow_(day);
  const busy = [];
  all_('Routine').forEach(r => {
    if (daysOf_(r.days).indexOf(d) < 0) return;
    const end = r.end <= r.start ? '23:59' : r.end;
    busy.push({ start: at_(day, r.start).getTime(), end: at_(day, end).getTime(), title: r.label, kind: 'rotina', sub: r.kind });
  });
  calendarBusy_(day).forEach(e => busy.push(e));
  return busy;
}

function planDay(day, write) {
  day = day || ymd_();
  const s = settings_();
  const today = ymd_();
  const now = Date.now();
  const isWork = daysOf_(s.workDays).indexOf(dow_(day)) >= 0;

  const projects = {}; all_('Projects').forEach(p => projects[p.id] = p);
  const goals = {}; all_('Goals').forEach(g => goals[g.id] = g);
  const focus = focusGoalFor_(day);
  const periodGoal = s.periodFocusGoalId && (!s.periodFocusUntil || s.periodFocusUntil >= day) ? s.periodFocusGoalId : '';
  const ctx = { day, projects, goals, focus, periodGoal };

  const busy = busyFor_(day);
  const tasks = all_('Tasks').filter(t => t.status === 'todo' || t.status === 'doing');

  // Tarefas com horário fixo neste dia viram compromissos
  const fixedItems = [];
  tasks.forEach(t => {
    if (!t.fixedStart || t.fixedStart.slice(0, 10) !== day) return;
    const st = parseIso_(t.fixedStart).getTime();
    const en = st + (t.estimateMin || 30) * 60000;
    busy.push({ start: st, end: en, title: t.title, kind: 'fixa' });
    fixedItems.push({ taskId: t.id, start: st, end: en, chunk: '' });
  });

  // Hoje: preserva o que já passou ou está em andamento
  const keep = day === today ? all_('Plan').filter(p => p.date === day && parseIso_(p.start).getTime() < now) : [];
  const inProgress = {};
  keep.forEach(p => {
    const en = parseIso_(p.end).getTime();
    if (en > now) { busy.push({ start: now, end: en, title: '', kind: 'fixa' }); inProgress[p.taskId] = true; }
  });

  let winStart = at_(day, s.workStart).getTime();
  const winEnd = at_(day, s.workEnd).getTime();
  if (day === today) winStart = Math.max(winStart, Math.ceil(now / 300000) * 300000);
  busy.sort((a, b) => a.start - b.start);

  const minSlot = Number(s.minSlotMin) * 60000;
  const buffer = Number(s.bufferMin) * 60000;
  let slots = isWork && winStart < winEnd ? subtract_([{ start: winStart, end: winEnd }], busy) : [];
  // Transição também antes e depois de compromissos/rotina
  slots = slots.map(x => ({ start: x.start === winStart ? x.start : x.start + buffer, end: x.end === winEnd ? x.end : x.end - buffer }))
    .filter(x => x.end - x.start >= minSlot);
  const freeMin = slots.reduce((a, x) => a + (x.end - x.start) / 60000, 0);
  const capacityMin = Math.floor(freeMin * Number(s.capacityPct) / 100);

  // Exclui tarefas já reservadas em outros dias futuros
  const plannedElsewhere = {};
  all_('Plan').forEach(p => {
    if (p.date === day) return;
    if (p.date > today) plannedElsewhere[p.taskId] = true;
    if (p.date === today && day > today && parseIso_(p.end).getTime() > now) plannedElsewhere[p.taskId] = true;
  });

  const factors = realityFactors_();
  const actual = actualByTask_();
  const candidates = tasks
    .filter(t => !t.fixedStart && !plannedElsewhere[t.id] && !inProgress[t.id])
    .map(t => {
      const f = (factors[t.effortType] || factors._global).factor;
      const realistic = Math.round((t.estimateMin || 30) * f);
      const remaining = Math.max(15, realistic - (actual[t.id] || 0));
      return { t, score: scoreTask_(t, ctx), minutes: Math.ceil(remaining / 5) * 5, realistic };
    })
    .sort((a, b) => b.score - a.score);

  const deepUntil = at_(day, s.deepUntil).getTime();
  const chunkMs = Number(s.chunkMin) * 60000;
  const items = fixedItems.slice();
  const overflow = [];
  let used = 0, deepUsed = 0;

  candidates.forEach(c => {
    const et = EFFORT_TYPES[c.t.effortType] || {};
    const deep = !!et.deep || c.t.effortLevel === 3;
    const need = c.minutes;
    if (used + need > capacityMin || (deep && deepUsed + need > DEEP_MAX_MIN)) { overflow.push(c); return; }
    const pref = sl => {
      const morning = sl.start < deepUntil;
      if (et.slot === 'manha' || deep) return morning ? 0 : 1;
      if (et.slot === 'tarde') return morning ? 1 : 0;
      return 0;
    };
    const order = slots.map((sl, i) => i).sort((a, b) => pref(slots[a]) - pref(slots[b]) || slots[a].start - slots[b].start);
    const needMs = need * 60000;

    // Peças: [{ i: índice do slot, start, ms }]
    let placed = [];
    const whole = order.find(i => slots[i].end - slots[i].start >= needMs);
    if (whole !== undefined && needMs <= chunkMs) {
      placed = [{ i: whole, start: slots[whole].start, ms: needMs }];
    } else if (c.t.splittable || need > Number(s.chunkMin)) {
      // Blocos de até chunkMin, com pausa (buffer) entre eles; nenhuma peça menor que minSlot
      let left = needMs;
      for (let k = 0; k < order.length && left > 0; k++) {
        const sl = slots[order[k]];
        let cur = sl.start;
        while (left > 0 && sl.end - cur >= minSlot) {
          let ms = Math.min(left, sl.end - cur, chunkMs);
          if (left - ms > 0 && left - ms < minSlot) ms = left - minSlot;
          if (ms < minSlot) break;
          placed.push({ i: order[k], start: cur, ms });
          left -= ms;
          cur += ms + buffer;
        }
      }
      if (left > 0) placed = [];
    }
    if (!placed.length) { overflow.push(c); return; }

    // Registra em ordem cronológica e consome os slots
    placed.sort((a, b) => a.start - b.start);
    const n = placed.length;
    placed.forEach((pl, k) => {
      const en = pl.start + pl.ms;
      items.push({ taskId: c.t.id, start: pl.start, end: en, chunk: n > 1 ? (k + 1) + '/' + n : '' });
      slots[pl.i].start = Math.max(slots[pl.i].start, Math.min(slots[pl.i].end, en + buffer));
    });
    slots = slots.filter(x => x.end - x.start >= minSlot);
    used += need;
    if (deep) deepUsed += need;
  });

  if (write) {
    const rows = items.map(it => ({
      id: uid_('pl'), date: day, taskId: it.taskId,
      start: iso_(new Date(it.start)), end: iso_(new Date(it.end)), chunk: it.chunk, eventId: '',
    }));
    const keepIds = {}; keep.forEach(p => keepIds[p.id] = true);
    const removed = all_('Plan').filter(p => p.date === day && !keepIds[p.id]);
    syncPlanToCalendar_(rows, removed);
    replaceWhere_('Plan', p => p.date === day && !keepIds[p.id], rows);
  }

  keep.forEach(p => items.push({ taskId: p.taskId, start: parseIso_(p.start).getTime(), end: parseIso_(p.end).getTime(), chunk: p.chunk }));
  items.sort((a, b) => a.start - b.start);

  const timeline = timeline_(busy, items, projects);
  return {
    day, weekday: WEEKDAYS[dow_(day)], isWorkDay: isWork,
    focus: focus ? { goalId: focus.goalId, title: (goals[focus.goalId] || {}).title || '', note: focus.note } : null,
    periodGoal: periodGoal ? (goals[periodGoal] || {}).title : '',
    freeMin: Math.round(freeMin), capacityMin, plannedMin: used, deepMin: deepUsed,
    timeline,
    overflow: overflow.map(c => ({ taskId: c.t.id, title: c.t.title, minutes: c.minutes, score: c.score, priority: c.t.priority })),
  };
}

function timeline_(busy, items, projects) {
  const taskById = {}; all_('Tasks').forEach(t => taskById[t.id] = t);
  return busy.filter(b => b.kind !== 'fixa')
    .map(b => ({ start: b.start, end: b.end, title: b.title, kind: b.kind, sub: b.sub || '' }))
    .concat(items.map(it => {
      const t = taskById[it.taskId] || { title: '(tarefa removida)' };
      const p = projects[t.projectId] || {};
      return { start: it.start, end: it.end, title: t.title + (it.chunk ? ' (' + it.chunk + ')' : ''), kind: 'tarefa',
        taskId: t.id, status: t.status, priority: t.priority, effortType: t.effortType, project: p.name || '', color: p.color || '' };
    }))
    .sort((a, b) => a.start - b.start)
    .map(x => Object.assign(x, { startHM: hm_(new Date(x.start)), endHM: hm_(new Date(x.end)) }));
}

// Visão do dia: usa o plano salvo (o que está no Calendar); se não houver, mostra prévia
function dayView_(day) {
  day = day || ymd_();
  const saved = all_('Plan').filter(p => p.date === day);
  if (!saved.length) return Object.assign(planDay(day, false), { saved: false });
  const s = settings_();
  const projects = {}; all_('Projects').forEach(p => projects[p.id] = p);
  const goals = {}; all_('Goals').forEach(g => goals[g.id] = g);
  const focus = focusGoalFor_(day);
  const periodGoal = s.periodFocusGoalId && (!s.periodFocusUntil || s.periodFocusUntil >= day) ? s.periodFocusGoalId : '';
  const items = saved.map(p => ({ taskId: p.taskId, start: parseIso_(p.start).getTime(), end: parseIso_(p.end).getTime(), chunk: p.chunk }));
  const plannedMin = Math.round(items.reduce((a, i) => a + (i.end - i.start) / 60000, 0));
  const busy = busyFor_(day);
  const free = subtract_([{ start: at_(day, s.workStart).getTime(), end: at_(day, s.workEnd).getTime() }], busy)
    .filter(x => x.end - x.start >= Number(s.minSlotMin) * 60000)
    .reduce((a, x) => a + (x.end - x.start) / 60000, 0);
  const isWork = daysOf_(s.workDays).indexOf(dow_(day)) >= 0;
  return {
    day, weekday: WEEKDAYS[dow_(day)], saved: true,
    isWorkDay: isWork,
    freeMin: isWork ? Math.round(free) : 0, capacityMin: isWork ? Math.floor(free * Number(s.capacityPct) / 100) : 0,
    focus: focus ? { goalId: focus.goalId, title: (goals[focus.goalId] || {}).title || '', note: focus.note } : null,
    periodGoal: periodGoal ? (goals[periodGoal] || {}).title : '',
    plannedMin, timeline: timeline_(busy, items, projects),
    overflow: [],
  };
}

// ==================== Calendar.gs ====================
// ============================================================
// GOOGLE CALENDAR
// - Lê a agenda principal (e extras) como tempo ocupado
// - Escreve a rotina em "Kephra · Rotina" (séries semanais)
// - Escreve as tarefas planejadas em "Kephra · Plano"
// Ambas as agendas marcam o horário como OCUPADO, então páginas
// de agendamento de clientes só oferecem o tempo realmente livre.
// ============================================================

function calendar_(name, color) {
  const found = CalendarApp.getCalendarsByName(name);
  if (found.length) return found[0];
  const cal = CalendarApp.createCalendar(name, { timeZone: TZ, color: color });
  return cal;
}

function planCal_() { return calendar_(CAL_PLAN_NAME, CalendarApp.Color.RED); }
function routineCal_() { return calendar_(CAL_ROUTINE_NAME, CalendarApp.Color.BLUE); }

function sourceCalendars_() {
  const ids = String(settings_().sourceCalendars || '').split(',').map(x => x.trim()).filter(Boolean);
  const cals = [CalendarApp.getDefaultCalendar()];
  ids.forEach(id => { const c = CalendarApp.getCalendarById(id); if (c) cals.push(c); });
  return cals;
}

function calendarBusy_(day) {
  const start = at_(day, '00:00'), end = at_(addDays_(day, 1), '00:00');
  const out = [];
  sourceCalendars_().forEach(cal => {
    cal.getEvents(start, end).forEach(e => {
      if (e.isAllDayEvent()) return;
      try { if (e.getMyStatus() === CalendarApp.GuestStatus.NO) return; } catch (err) { /* evento sem convidados */ }
      out.push({ start: e.getStartTime().getTime(), end: e.getEndTime().getTime(), title: e.getTitle(), kind: 'agenda' });
    });
  });
  return out;
}

const PRIORITY_COLORS = { 1: 'RED', 2: 'ORANGE', 3: 'BLUE', 4: 'GRAY' };

function syncPlanToCalendar_(rows, removed) {
  const cal = planCal_();
  removed.forEach(p => {
    if (!p.eventId) return;
    try { const ev = cal.getEventById(p.eventId); if (ev) ev.deleteEvent(); } catch (err) { /* já removido */ }
  });
  const projects = {}; all_('Projects').forEach(p => projects[p.id] = p);
  const url = ScriptApp.getService().getUrl();
  rows.forEach(r => {
    const t = find_('Tasks', r.taskId);
    if (!t) return;
    const p = projects[t.projectId] || {};
    const et = EFFORT_TYPES[t.effortType] || { icon: '•', label: '' };
    const title = et.icon + ' ' + t.title + (r.chunk ? ' (' + r.chunk + ')' : '');
    const desc = [
      'P' + (t.priority || 3) + ' · ' + (p.name || 'sem projeto') + ' · ' + et.label,
      'Estimativa: ' + (t.estimateMin || '?') + ' min · Esforço ' + (t.effortLevel || '?') + '/3',
      t.deadline ? 'Prazo: ' + t.deadline : '',
      t.notes || '',
      url ? '\nAbrir no Kephra: ' + url + '?task=' + t.id : '',
      '[kephra:' + t.id + ']',
    ].filter(Boolean).join('\n');
    const ev = cal.createEvent(title, parseIso_(r.start), parseIso_(r.end), { description: desc });
    try { ev.setColor(CalendarApp.EventColor[PRIORITY_COLORS[t.priority] || 'BLUE']); } catch (err) { /* cor opcional */ }
    ev.removeAllReminders();
    r.eventId = ev.getId();
  });
}

const KIND_COLORS = { ritual: 'YELLOW', refeicao: 'PALE_GREEN', compromisso: 'MAUVE', saude: 'GREEN', livre: 'PALE_BLUE', sono: 'GRAY', casa: 'ORANGE', revisao: 'CYAN' };
const WEEKDAY_ENUM = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

function deleteRoutineSeries_(r) {
  if (!r.seriesId) return;
  try { const s = routineCal_().getEventSeriesById(r.seriesId); if (s) s.deleteEventSeries(); } catch (err) { /* já removida */ }
}

// Recria todas as séries da rotina (rodar sempre que a rotina mudar)
function syncRoutine() {
  const cal = routineCal_();
  const today = ymd_();
  const out = [];
  all_('Routine').forEach(r => {
    deleteRoutineSeries_(r);
    let seriesId = '';
    const days = daysOf_(r.days);
    if (r.sync && days.length) {
      let first = today;
      for (let i = 0; i < 7; i++) { if (days.indexOf(dow_(addDays_(today, i))) >= 0) { first = addDays_(today, i); break; } }
      const end = r.end <= r.start ? '23:59' : r.end;
      const rec = CalendarApp.newRecurrence().addWeeklyRule()
        .onlyOnWeekdays(days.map(d => CalendarApp.Weekday[WEEKDAY_ENUM[d]]));
      const series = cal.createEventSeries(r.label, at_(first, r.start), at_(first, end), rec, { description: '[kephra:rotina:' + r.id + ']' });
      try { series.setColor(CalendarApp.EventColor[KIND_COLORS[r.kind] || 'GRAY']); } catch (err) { /* cor opcional */ }
      series.removeAllReminders();
      seriesId = series.getId();
    }
    update_('Routine', r.id, { seriesId: seriesId });
    out.push({ id: r.id, synced: !!seriesId });
  });
  return out;
}

// ==================== AI.gs ====================
// ============================================================
// INTELIGÊNCIA ARTIFICIAL — Claude (padrão) e Gemini (alternativo)
// Chaves ficam em Propriedades do script: ANTHROPIC_API_KEY, GEMINI_API_KEY
// ============================================================

function aiKeys_() {
  const p = PropertiesService.getScriptProperties();
  return { claude: !!p.getProperty('ANTHROPIC_API_KEY'), gemini: !!p.getProperty('GEMINI_API_KEY') };
}

// Chamada única: devolve texto, ou objeto quando `schema` é passado
function ai_(opts) {
  const s = settings_();
  const keys = aiKeys_();
  let provider = opts.provider || s.aiProvider || 'claude';
  if (provider === 'claude' && !keys.claude && keys.gemini) provider = 'gemini';
  if (provider === 'gemini' && !keys.gemini && keys.claude) provider = 'claude';
  if (!keys.claude && !keys.gemini) throw new Error('Nenhuma chave de IA configurada (ANTHROPIC_API_KEY ou GEMINI_API_KEY).');
  try {
    return provider === 'gemini' ? gemini_(opts, s) : claude_(opts, s);
  } catch (err) {
    const other = provider === 'gemini' ? 'claude' : 'gemini';
    if (!keys[other]) throw err;
    console.warn('IA ' + provider + ' falhou, tentando ' + other + ': ' + err.message);
    return other === 'gemini' ? gemini_(opts, s) : claude_(opts, s);
  }
}

function claude_(opts, s) {
  const key = PropertiesService.getScriptProperties().getProperty('ANTHROPIC_API_KEY');
  const body = {
    model: s.claudeModel || 'claude-opus-5-5',
    max_tokens: opts.maxTokens || 4000,
    system: opts.system,
    messages: [{ role: 'user', content: opts.prompt }],
    output_config: { effort: opts.effort || 'low' },
    fallbacks: 'default',
  };
  if (opts.schema) body.output_config.format = { type: 'json_schema', schema: opts.schema };
  const res = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'anthropic-beta': 'server-side-fallback-2026-07-01',
    },
    payload: JSON.stringify(body),
    muteHttpExceptions: true,
  });
  const code = res.getResponseCode();
  const data = JSON.parse(res.getContentText());
  if (code !== 200) throw new Error('Claude ' + code + ': ' + (data.error ? data.error.message : res.getContentText()));
  if (data.stop_reason === 'refusal') throw new Error('Claude recusou o pedido.');
  const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
  return opts.schema ? JSON.parse(text) : text;
}

function gemini_(opts, s) {
  const key = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  const model = s.geminiModel || 'gemini-2.5-flash';
  const body = {
    systemInstruction: { parts: [{ text: opts.system }] },
    contents: [{ role: 'user', parts: [{ text: opts.prompt }] }],
    generationConfig: { maxOutputTokens: opts.maxTokens || 4000 },
  };
  if (opts.schema) {
    body.generationConfig.responseMimeType = 'application/json';
    body.generationConfig.responseJsonSchema = opts.schema;
  }
  const res = UrlFetchApp.fetch('https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent', {
    method: 'post',
    contentType: 'application/json',
    headers: { 'x-goog-api-key': key },
    payload: JSON.stringify(body),
    muteHttpExceptions: true,
  });
  const code = res.getResponseCode();
  const data = JSON.parse(res.getContentText());
  if (code !== 200) throw new Error('Gemini ' + code + ': ' + (data.error ? data.error.message : res.getContentText()));
  const parts = (((data.candidates || [])[0] || {}).content || {}).parts || [];
  const text = parts.map(p => p.text || '').join('');
  return opts.schema ? JSON.parse(text) : text;
}

// ------------------------------------------------------------
// Contexto do sistema para os prompts
// ------------------------------------------------------------
function aiContext_() {
  const goals = all_('Goals').filter(g => g.status !== 'concluida').sort((a, b) => (a.rank || 99) - (b.rank || 99));
  const projects = all_('Projects').filter(p => p.status === 'ativo');
  return 'METAS (ordem de prioridade):\n' +
    goals.map(g => '- [' + g.id + '] #' + g.rank + ' ' + ((HORIZONS[g.horizon] || {}).label || '') + ' · ' + g.title + (g.parentId ? ' (serve a ' + g.parentId + ')' : '') + (g.deadline ? ' (prazo ' + g.deadline + ')' : '')).join('\n') +
    '\n\nPROJETOS ATIVOS:\n' +
    projects.map(p => '- [' + p.id + '] ' + p.name + ' → meta ' + p.goalId + ' · P' + p.priority).join('\n') +
    '\n\nTIPOS DE ESFORÇO:\n' +
    Object.keys(EFFORT_TYPES).map(k => '- ' + k + ': ' + EFFORT_TYPES[k].desc).join('\n');
}

const TASK_FIELDS = {
  type: 'object',
  properties: {
    title: { type: 'string', description: 'Título curto e acionável, começando com verbo' },
    keywords: { type: 'string', description: 'Palavras-chave separadas por vírgula' },
    projectId: { type: 'string', description: 'id do projeto da lista, ou string vazia' },
    estimateMin: { type: 'integer' },
    effortLevel: { type: 'integer', enum: [1, 2, 3] },
    priority: { type: 'integer', enum: [1, 2, 3, 4] },
    deadline: { type: 'string', description: 'yyyy-MM-dd ou vazio' },
    fixedStart: { type: 'string', description: "yyyy-MM-dd'T'HH:mm se houver horário marcado, senão vazio" },
    effortType: { type: 'string', enum: Object.keys(EFFORT_TYPES) },
    notes: { type: 'string' },
  },
  required: ['title', 'keywords', 'projectId', 'estimateMin', 'effortLevel', 'priority', 'deadline', 'fixedStart', 'effortType', 'notes'],
  additionalProperties: false,
};

const SYSTEM_BASE = 'Você é o motor do Kephra System, o sistema pessoal de execução de João Rocha — maestro, compositor, empresário e empreendedor em São Paulo. ' +
  'Ele é autista nível 1 de suporte: seja literal, concreto, estruturado e sem rodeios. Português brasileiro.';

// Texto livre → tarefa estruturada ("ligar pro Frank amanhã 10h, 30 min, urgente")
function aiParseTask(text) {
  const today = ymd_();
  return ai_({
    system: SYSTEM_BASE + ' Converta a descrição em uma tarefa estruturada. Se o tempo não for dito, estime de forma realista (ele tende a subestimar). ' +
      'Prioridade: 1 = crítica/urgente, 4 = baixa. Esforço: 1 leve, 2 médio, 3 pesado.',
    prompt: 'Hoje é ' + WEEKDAYS[dow_(today)] + ', ' + today + '.\n\n' + aiContext_() + '\n\nDESCRIÇÃO:\n' + text,
    schema: TASK_FIELDS,
    effort: 'low',
  });
}

// Quebra uma tarefa grande em passos concretos
function aiBreakdown(taskId) {
  const t = find_('Tasks', taskId);
  if (!t) throw new Error('Tarefa não encontrada');
  const p = find_('Projects', t.projectId);
  const res = ai_({
    system: SYSTEM_BASE + ' Quebre a tarefa em 3 a 7 passos físicos e concretos, cada um com no máximo 90 minutos, ' +
      'na ordem de execução. O primeiro passo deve ser pequeno o suficiente para começar em 2 minutos.',
    prompt: 'TAREFA: ' + t.title + '\nPROJETO: ' + (p ? p.name : '-') + '\nESTIMATIVA ATUAL: ' + t.estimateMin + ' min\nNOTAS: ' + (t.notes || '-'),
    schema: {
      type: 'object',
      properties: { steps: { type: 'array', items: {
        type: 'object',
        properties: { title: { type: 'string' }, estimateMin: { type: 'integer' }, effortType: { type: 'string', enum: Object.keys(EFFORT_TYPES) } },
        required: ['title', 'estimateMin', 'effortType'], additionalProperties: false,
      } } },
      required: ['steps'], additionalProperties: false,
    },
    effort: 'medium',
  });
  return res.steps;
}

// Ajuda a detalhar a meta no método de Tony Robbins (RPM + evidências sensoriais)
function aiGoalSensory(goalId) {
  const g = find_('Goals', goalId);
  if (!g) throw new Error('Meta não encontrada');
  const fields = ['result', 'purpose', 'evidence', 'see', 'hear', 'feel', 'smell', 'taste', 'emotion'];
  const props = {}; fields.forEach(f => props[f] = { type: 'string' });
  return ai_({
    system: SYSTEM_BASE + ' Ajude a descrever a meta com o método RPM de Tony Robbins (Resultado, Propósito) e com evidências sensoriais ' +
      'extremamente concretas, em primeira pessoa e no presente, como se já tivesse acontecido: o que vejo, ouço, sinto no corpo, ' +
      'que cheiro e que gosto existem nesse momento, e a emoção. Evidência = o critério objetivo que prova que a meta foi atingida. ' +
      'Use o que ele já escreveu; complete só o que estiver vazio ou vago. Cada campo: 1 a 3 frases.',
    prompt: 'META: ' + g.title + '\nMÉTRICA: ' + (g.metric || '-') + '\nPRAZO: ' + (g.deadline || '-') + '\n\nO QUE JÁ ESTÁ ESCRITO:\n' +
      fields.map(f => f + ': ' + (g[f] || '(vazio)')).join('\n'),
    schema: { type: 'object', properties: props, required: fields, additionalProperties: false },
    effort: 'medium',
  });
}

// Parágrafo estratégico para o e-mail da manhã
function aiBriefing(view) {
  const last = reviewsList_(1)[0];
  const strategy = last && last.data.summary ? '\n\nESTRATÉGIA VIGENTE (' + last.horizon + ', ' + last.date.slice(0, 10) + '):\n' + last.data.summary + '\nGargalo: ' + last.data.constraint : '';
  const lines = view.timeline.map(x => x.startHM + '–' + x.endHM + ' ' + x.title + (x.kind === 'tarefa' ? ' [P' + x.priority + ']' : ' (' + x.kind + ')'));
  return ai_({
    system: SYSTEM_BASE + ' Escreva o briefing da manhã: no máximo 5 linhas, sem saudação longa. Diga qual é a UMA coisa que, ' +
      'se feita hoje, mais move o gargalo da estratégia vigente, e um alerta concreto se o plano estiver apertado ou houver prazo vencendo. Sem emojis.',
    prompt: aiContext_() + strategy + '\n\nFOCO DO DIA: ' + (view.focus ? view.focus.title : '-') +
      '\nCAPACIDADE: ' + view.plannedMin + ' min planejados de ' + (view.freeMin || '?') + ' min livres' +
      '\n\nAGENDA:\n' + lines.join('\n') +
      (view.overflow && view.overflow.length ? '\n\nNÃO COUBE HOJE:\n' + view.overflow.map(o => '- ' + o.title).join('\n') : ''),
    effort: 'medium',
    maxTokens: 2000,
  });
}

// ==================== Strategy.gs ====================
// ============================================================
// ESTRATEGISTA — o "secretário que julga"
//
// Lê o sistema inteiro (cascata de metas 10 anos → semana, projetos,
// tarefas, tempo real gasto, capacidade dos próximos dias, conselhos
// anteriores e o que você de fato aplicou) e devolve um veredito
// estruturado com ações concretas. Nada muda sem a sua aprovação:
// cada ação tem um checkbox e o botão "Aplicar".
//
// Lentes: primeiros princípios · pensamento sistêmico (gargalo da
// Teoria das Restrições, laços de reforço/equilíbrio, pontos de
// alavancagem de Meadows) · teoria dos jogos (atores, incentivos,
// jogadas dominantes, jogos repetidos/reputação).
// ============================================================

const STRATEGY_HORIZONS = {
  semana: 'próxima semana (7 dias)',
  mes: 'próximo mês',
  trimestre: 'próximo trimestre (90 dias)',
  ano: 'próximo ano, ancorado na visão de 5 e 10 anos',
};

function minutesBy_(days) {
  const from = addDays_(ymd_(), -days + 1);
  const tasks = {}; all_('Tasks').forEach(t => tasks[t.id] = t);
  const byProject = {};
  all_('TimeLogs').forEach(l => {
    if (!l.start || l.start.slice(0, 10) < from || !l.minutes) return;
    const pid = (tasks[l.taskId] || {}).projectId || '-';
    byProject[pid] = (byProject[pid] || 0) + l.minutes;
  });
  return byProject;
}

function capacityNext_(n) {
  const s = settings_();
  const out = [];
  for (let i = 0; i < n; i++) {
    const day = addDays_(ymd_(), i);
    if (daysOf_(s.workDays).indexOf(dow_(day)) < 0) { out.push({ day, weekday: WEEKDAYS[dow_(day)], freeMin: 0 }); continue; }
    const free = subtract_([{ start: at_(day, s.workStart).getTime(), end: at_(day, s.workEnd).getTime() }], busyFor_(day))
      .reduce((a, x) => a + (x.end - x.start) / 60000, 0);
    out.push({ day, weekday: WEEKDAYS[dow_(day)], freeMin: Math.round(free), plannableMin: Math.round(free * Number(s.capacityPct) / 100) });
  }
  return out;
}

// Retrato completo e compacto do sistema para o modelo
function strategyContext_() {
  const today = ymd_();
  const goals = all_('Goals');
  const projects = all_('Projects');
  const tasks = all_('Tasks');
  const actual = actualByTask_();
  const m7 = minutesBy_(7), m28 = minutesBy_(28);
  const open = tasks.filter(t => t.status === 'todo' || t.status === 'doing');
  const done28 = tasks.filter(t => t.status === 'done' && t.doneAt && t.doneAt.slice(0, 10) >= addDays_(today, -27));

  const depth = g => { let d = 0, cur = g; while (cur && cur.parentId && d < 10) { cur = goals.find(x => x.id === cur.parentId); d++; } return d; };
  const goalLines = goals.slice().sort((a, b) => depth(a) - depth(b) || (a.rank || 99) - (b.rank || 99)).map(g => {
    const ps = projects.filter(p => p.goalId === g.id);
    return {
      id: g.id, horizon: (HORIZONS[g.horizon] || {}).label || g.horizon, parentId: g.parentId, rank: g.rank, status: g.status,
      title: g.title, deadline: g.deadline, metric: g.metric, result: g.result, purpose: g.purpose, evidence: g.evidence,
      projects: ps.map(p => p.id), minutesLast28d: ps.reduce((a, p) => a + (m28[p.id] || 0), 0),
    };
  });
  const projectLines = projects.filter(p => p.status !== 'arquivado').map(p => {
    const pt = open.filter(t => t.projectId === p.id);
    return {
      id: p.id, name: p.name, goalId: p.goalId, priority: p.priority, status: p.status, notes: p.notes,
      targetHoursWeek: p.weeklyHours, actualHoursLast7d: Math.round((m7[p.id] || 0) / 6) / 10, actualHoursLast28d: Math.round((m28[p.id] || 0) / 6) / 10,
      openTasks: pt.length, openMinutes: pt.reduce((a, t) => a + (t.estimateMin || 0), 0),
      doneLast28d: done28.filter(t => t.projectId === p.id).length,
    };
  });
  const taskLines = open.sort((a, b) => a.priority - b.priority).slice(0, 120).map(t => ({
    id: t.id, title: t.title, projectId: t.projectId, priority: t.priority, estimateMin: t.estimateMin, trackedMin: actual[t.id] || 0,
    effortType: t.effortType, effortLevel: t.effortLevel, deadline: t.deadline, status: t.status,
    ageDays: t.createdAt ? daysBetween_(t.createdAt.slice(0, 10), today) : 0,
  }));
  const factors = realityFactors_();
  const s = settings_();
  const reviews = all_('Reviews').slice(-3).map(r => {
    let d = {}, a = {};
    try { d = JSON.parse(r.data); } catch (e) { /* revisão corrompida */ }
    try { a = JSON.parse(r.applied || '{}'); } catch (e) { /* nada aplicado */ }
    return { date: r.date, horizon: r.horizon, summary: d.summary, constraint: d.constraint, applied: a };
  });
  const cap = capacityNext_(14);

  return {
    today: today + ' (' + WEEKDAYS[dow_(today)] + ')',
    goals: goalLines,
    projects: projectLines,
    openTasks: taskLines,
    openTasksTotal: open.length,
    doneLast28d: done28.length,
    trackedMinutesLast28d: Object.keys(m28).reduce((a, k) => a + m28[k], 0),
    estimateRealityFactor: { global: factors._global.factor, samples: factors._global.n },
    capacityNext14d: cap,
    plannableMinutesNext7d: cap.slice(0, 7).reduce((a, d) => a + (d.plannableMin || 0), 0),
    openMinutesRealistic: Math.round(open.reduce((a, t) => a + (t.estimateMin || 30), 0) * factors._global.factor),
    focusByWeekday: all_('Focus').filter(f => f.key.length === 1).map(f => ({ weekday: Number(f.key), goalId: f.goalId })),
    periodMasterGoal: { goalId: s.periodFocusGoalId, until: s.periodFocusUntil },
    previousReviews: reviews,
  };
}

const STRATEGIST_SYSTEM = SYSTEM_BASE + `

Você é o estrategista-chefe e secretário executivo dele. Sua função é JULGAR, não descrever: decidir qual é a melhor estratégia para que as metas, da visão de 10 anos até a semana, sejam cumpridas no menor tempo, com os recursos que ele realmente tem.

PERFIL DELE: maestro, compositor, empresário e empreendedor em São Paulo, querendo voltar a morar nos EUA. Objetivos acima da média: não planeje como para um assalariado. Mas ele SUPERESTIMA o tempo disponível. Use os números de capacidade e o fator de realidade, nunca o otimismo dele. Caixa é a restrição que alimenta todo o resto, salvo evidência em contrário nos dados.

MÉTODO (aplique nesta ordem):
1. PRIMEIROS PRINCÍPIOS — reduza a meta-mestra do horizonte às variáveis fundamentais (ex.: faturamento = nº de vendas × ticket × frequência; vendas = conversas qualificadas × taxa de fechamento). Identifique qual variável tem mais folga para crescer por hora investida. Questione premissas herdadas dos projetos.
2. PENSAMENTO SISTÊMICO — encontre O gargalo único (Teoria das Restrições): o que, se destravado, faz todo o sistema andar. Mapeie laços de reforço (o que se retroalimenta positivamente) e de equilíbrio (o que trava). Aponte o ponto de alavancagem de maior ordem (Donella Meadows). Compare onde o tempo dele FOI (minutos reais) com onde DEVERIA ir.
3. TEORIA DOS JOGOS — liste os atores relevantes (clientes, parceiros, instituições, concorrentes, pessoas próximas), o incentivo de cada um e a melhor jogada dele: jogadas dominantes, construção de reputação em jogos repetidos, sinais críveis, opções assimétricas (pouco a perder, muito a ganhar), BATNA em negociações.
4. DECISÃO — portfólio: corte sem piedade o que não move o gargalo ("drop"), reprioritize o que existe, crie no máximo as tarefas que cabem na capacidade real do horizonte. Cada tarefa nova: verbo + objeto concreto, ≤ 120 min, com projeto existente.

REGRAS:
- Use apenas IDs que existem nos dados (projectId, taskId, goalId). Se faltar projeto, use "" e diga no rationale.
- Respeite a capacidade: a soma das tarefas novas + abertas prioritárias não pode passar da capacidade planejável do horizonte.
- Se houver revisões anteriores, verifique se o que foi aplicado gerou resultado (minutos, tarefas concluídas) e corrija a rota.
- Metas sem evidência, métrica ou prazo são um problema estratégico: proponha a versão concreta em newGoals ou na pergunta final.
- Seja específico, numérico, sem jargão vazio e sem motivacional. Português brasileiro.`;

function strategySchema_() {
  const str = { type: 'string' };
  const int = { type: 'integer' };
  const obj = (props) => ({ type: 'object', properties: props, required: Object.keys(props), additionalProperties: false });
  return obj({
    summary: { type: 'string', description: 'Veredito em 3–5 linhas: a estratégia do horizonte' },
    constraint: { type: 'string', description: 'O gargalo único do sistema agora' },
    firstPrinciples: { type: 'string', description: 'A meta-mestra reduzida às variáveis fundamentais e qual alavancar' },
    systemLoops: { type: 'string', description: 'Laços de reforço/equilíbrio, ponto de alavancagem, tempo real × ideal' },
    gameTheory: { type: 'array', items: obj({ actor: str, incentive: str, bestMove: str }) },
    leverage: { type: 'array', description: 'Projetos ordenados por alavancagem na meta-mestra', items: obj({ projectId: str, score: int, verdict: { type: 'string', enum: ['acelerar', 'manter', 'reduzir', 'pausar'] }, rationale: str }) },
    newTasks: { type: 'array', items: obj({ title: str, projectId: str, estimateMin: int, priority: { type: 'integer', enum: [1, 2, 3, 4] }, effortType: { type: 'string', enum: Object.keys(EFFORT_TYPES) }, deadline: { type: 'string', description: 'yyyy-MM-dd ou vazio' }, rationale: str }) },
    reprioritize: { type: 'array', items: obj({ taskId: str, priority: { type: 'integer', enum: [1, 2, 3, 4] }, rationale: str }) },
    drop: { type: 'array', items: obj({ taskId: str, rationale: str }) },
    newGoals: { type: 'array', items: obj({ title: str, horizon: { type: 'string', enum: Object.keys(HORIZONS) }, parentId: str, metric: str, deadline: str, rationale: str }) },
    weeklyFocus: { type: 'array', description: 'Meta de foco para cada dia da semana (0 = domingo)', items: obj({ weekday: int, goalId: str }) },
    periodGoalId: { type: 'string', description: 'Meta-mestra do período, ou vazio para manter' },
    periodUntil: { type: 'string', description: 'yyyy-MM-dd' },
    risks: { type: 'array', items: str },
    question: { type: 'string', description: 'A UMA pergunta que ele precisa responder para destravar a estratégia' },
  });
}

function aiStrategy(horizon) {
  horizon = STRATEGY_HORIZONS[horizon] ? horizon : 'semana';
  const ctx = strategyContext_();
  const data = ai_({
    system: STRATEGIST_SYSTEM,
    prompt: 'HORIZONTE DESTA REVISÃO: ' + STRATEGY_HORIZONS[horizon] + '.\n\nDADOS DO SISTEMA (JSON):\n' + JSON.stringify(ctx),
    schema: strategySchema_(),
    effort: settings_().strategyEffort || 'medium',
    maxTokens: 16000,
  });
  return insert_('Reviews', { id: uid_('rv'), date: iso_(new Date()), horizon: horizon, data: JSON.stringify(data), applied: '' });
}

function reviewsList_(n) {
  return all_('Reviews').slice(-(n || 10)).reverse().map(r => {
    let data = {}, applied = null;
    try { data = JSON.parse(r.data); } catch (e) { /* revisão corrompida */ }
    try { applied = r.applied ? JSON.parse(r.applied) : null; } catch (e) { /* ignorado */ }
    return { id: r.id, date: r.date, horizon: r.horizon, data, applied };
  });
}

// Aplica as ações marcadas. sel = { newTasks:[i], reprioritize:[i], drop:[i], newGoals:[i], weeklyFocus:bool, period:bool }
function applyStrategy_(reviewId, sel) {
  const r = find_('Reviews', reviewId);
  if (!r) throw new Error('Revisão não encontrada');
  const d = JSON.parse(r.data);
  const pick = (arr, idx) => (idx || []).map(i => (arr || [])[i]).filter(Boolean);
  const projectIds = {}; all_('Projects').forEach(p => projectIds[p.id] = true);
  const goalIds = {}; all_('Goals').forEach(g => goalIds[g.id] = true);
  const now = iso_(new Date());
  const log = { at: now, newTasks: 0, reprioritize: 0, drop: 0, newGoals: 0, weeklyFocus: false, period: false };

  pick(d.newGoals, sel.newGoals).forEach(g => {
    insert_('Goals', { id: uid_('g'), title: g.title, horizon: g.horizon, parentId: goalIds[g.parentId] ? g.parentId : '', metric: g.metric,
      deadline: g.deadline, status: 'ativa', rank: all_('Goals').length + 1, notes: 'Proposta pelo estrategista: ' + g.rationale, createdAt: now });
    log.newGoals++;
  });
  pick(d.newTasks, sel.newTasks).forEach(t => {
    insert_('Tasks', { id: uid_('t'), title: t.title, projectId: projectIds[t.projectId] ? t.projectId : '', estimateMin: t.estimateMin || 30,
      priority: t.priority || 2, effortLevel: 2, effortType: t.effortType, deadline: t.deadline || '', status: 'todo', keywords: 'estrategista',
      notes: t.rationale, splittable: false, fixedStart: '', createdAt: now, doneAt: '' });
    log.newTasks++;
  });
  pick(d.reprioritize, sel.reprioritize).forEach(x => { if (find_('Tasks', x.taskId)) { update_('Tasks', x.taskId, { priority: x.priority }); log.reprioritize++; } });
  pick(d.drop, sel.drop).forEach(x => { if (find_('Tasks', x.taskId)) { update_('Tasks', x.taskId, { status: 'dropped', notes: (find_('Tasks', x.taskId).notes || '') + '\nDescartada pelo estrategista: ' + x.rationale }); log.drop++; } });
  if (sel.weeklyFocus) {
    (d.weeklyFocus || []).forEach(f => { if (f.weekday >= 0 && f.weekday <= 6 && goalIds[f.goalId]) upsert_('Focus', { key: String(f.weekday), goalId: f.goalId, note: '' }); });
    log.weeklyFocus = true;
  }
  if (sel.period && goalIds[d.periodGoalId]) {
    setSetting_('periodFocusGoalId', d.periodGoalId);
    setSetting_('periodFocusUntil', d.periodUntil || '');
    log.period = true;
  }
  update_('Reviews', reviewId, { applied: JSON.stringify(log) });
  planDay(ymd_(), true);
  return log;
}

// Pergunta livre com o contexto inteiro ("devo aceitar este cliente?")
function aiAsk(question) {
  return ai_({
    system: STRATEGIST_SYSTEM + '\n\nAgora responda a uma pergunta pontual dele. Formato: 1) Veredito em uma frase. 2) Por quê (primeiros princípios, sistema, jogo — só o que for relevante). 3) Próximo passo concreto, com tempo estimado. Máximo 12 linhas.',
    prompt: 'DADOS DO SISTEMA (JSON):\n' + JSON.stringify(strategyContext_()) + '\n\nPERGUNTA:\n' + question,
    effort: settings_().strategyEffort || 'medium',
    maxTokens: 6000,
  });
}

// Gatilho diário: domingo = semana; dia 1 = mês (trimestre em jan/abr/jul/out, ano em janeiro)
function strategyCron() {
  const today = ymd_();
  const d = Number(today.slice(8, 10)), m = Number(today.slice(5, 7));
  let horizon = '';
  if (d === 1) horizon = m === 1 ? 'ano' : [4, 7, 10].indexOf(m) >= 0 ? 'trimestre' : 'mes';
  else if (dow_(today) === 0) horizon = 'semana';
  if (!horizon) return;
  const keys = aiKeys_();
  if (!keys.claude && !keys.gemini) return;
  const review = aiStrategy(horizon);
  emailStrategy_(review);
}

function emailStrategy_(review) {
  const d = JSON.parse(review.data);
  const url = ScriptApp.getService().getUrl();
  const sec = (t, b) => b ? '<h3 style="font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:#B85A38;margin:22px 0 6px">' + t + '</h3><div style="font-size:14px;line-height:1.55">' + b + '</div>' : '';
  const li = arr => arr && arr.length ? '<ul style="padding-left:18px;margin:0">' + arr.map(x => '<li>' + x + '</li>').join('') + '</ul>' : '';
  const pname = id => (find_('Projects', id) || {}).name || id;
  const html = '<div style="max-width:600px;margin:0 auto;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#2B2B2B;background:#F7F5F0;padding:24px">' +
    '<div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#8A7F70">Kephra · conselho estratégico</div>' +
    '<h1 style="font-size:26px;margin:4px 0 12px">Revisão · ' + esc_(STRATEGY_HORIZONS[review.horizon]) + '</h1>' +
    '<div style="padding:12px 14px;background:#1A365D;color:#F7F5F0;border-radius:8px;font-size:15px;line-height:1.5;white-space:pre-wrap">' + esc_(d.summary) + '</div>' +
    sec('Gargalo', esc_(d.constraint)) + sec('Primeiros princípios', esc_(d.firstPrinciples)) + sec('Sistema', esc_(d.systemLoops)) +
    sec('Teoria dos jogos', li((d.gameTheory || []).map(g => '<b>' + esc_(g.actor) + '</b> — quer: ' + esc_(g.incentive) + '. Sua jogada: ' + esc_(g.bestMove)))) +
    sec('Alavancagem dos projetos', li((d.leverage || []).map(l => esc_(pname(l.projectId)) + ' · ' + l.score + '/10 · <b>' + l.verdict + '</b> — ' + esc_(l.rationale)))) +
    sec('Ações propostas', (d.newTasks || []).length + ' tarefas novas · ' + (d.reprioritize || []).length + ' repriorizações · ' + (d.drop || []).length + ' cortes. Revise e aplique no app.') +
    sec('Riscos', li((d.risks || []).map(esc_))) +
    sec('A pergunta', '<b>' + esc_(d.question) + '</b>') +
    (url ? '<p style="margin-top:24px"><a href="' + url + '?view=estrategia" style="background:#B85A38;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;font-weight:600">Revisar e aplicar</a></p>' : '') + '</div>';
  MailApp.sendEmail({ to: Session.getEffectiveUser().getEmail(), subject: 'Kephra · Estratégia ' + review.horizon + ' · ' + d.constraint.slice(0, 70), body: d.summary, htmlBody: html, name: 'Kephra System' });
}

// ==================== Email.gs ====================
// ============================================================
// E-MAIL DA MANHÃ — plano do dia, em ordem, às 6h
// ============================================================

const KIND_LABEL = { rotina: 'Rotina', agenda: 'Agenda', tarefa: 'Tarefa' };

function esc_(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function yesterdayStats_() {
  const y = addDays_(ymd_(), -1);
  const logs = all_('TimeLogs').filter(l => l.start && l.start.slice(0, 10) === y && l.minutes);
  const tasks = {}; all_('Tasks').forEach(t => tasks[t.id] = t);
  const byType = {};
  let total = 0;
  logs.forEach(l => {
    const t = tasks[l.taskId] || {};
    const k = t.effortType || 'outro';
    byType[k] = (byType[k] || 0) + l.minutes;
    total += l.minutes;
  });
  const actual = actualByTask_();
  const done = Object.values(tasks).filter(t => t.doneAt && t.doneAt.slice(0, 10) === y);
  const est = done.reduce((a, t) => a + (t.estimateMin || 0), 0);
  const act = done.reduce((a, t) => a + (actual[t.id] || 0), 0);
  return { total, byType, done: done.length, est, act };
}

function upcomingDeadlines_(days) {
  const today = ymd_(), limit = addDays_(today, days);
  return all_('Tasks')
    .filter(t => (t.status === 'todo' || t.status === 'doing') && t.deadline && t.deadline.slice(0, 10) <= limit)
    .sort((a, b) => a.deadline.localeCompare(b.deadline));
}

function dailyEmail() {
  const day = ymd_();
  const saved = all_('Plan').some(p => p.date === day);
  const view = saved ? dayView_(day) : planDay(day, true);
  const keys = aiKeys_();
  let briefing = '';
  if (keys.claude || keys.gemini) {
    try { briefing = aiBriefing(view); } catch (err) { console.warn('Briefing indisponível: ' + err.message); }
  }
  const y = yesterdayStats_();
  const deadlines = upcomingDeadlines_(7);
  const url = ScriptApp.getService().getUrl();
  const dd = day.split('-');

  const rowColor = x => x.kind === 'tarefa' ? (x.color || '#B85A38') : x.kind === 'agenda' ? '#1A365D' : '#C9BFAF';
  const rows = view.timeline.map(x => {
    const et = EFFORT_TYPES[x.effortType];
    const label = x.kind === 'tarefa'
      ? '<b>' + esc_((et ? et.icon + ' ' : '') + x.title) + '</b><br><span style="color:#8A7F70;font-size:12px">P' + x.priority + ' · ' + esc_(x.project) + '</span>'
      : esc_(x.title) + ' <span style="color:#8A7F70;font-size:12px">· ' + KIND_LABEL[x.kind] + '</span>';
    return '<tr><td style="padding:8px 10px 8px 0;font-family:monospace;font-size:13px;white-space:nowrap;vertical-align:top;color:#5A5245">' +
      x.startHM + '–' + x.endHM + '</td><td style="border-left:4px solid ' + rowColor(x) + ';padding:8px 12px;font-size:14px">' + label + '</td></tr>';
  }).join('');

  const section = (title, body) => '<h3 style="font-family:Arial Narrow,Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase;font-size:13px;color:#B85A38;margin:28px 0 8px">' + title + '</h3>' + body;

  let html = '<div style="max-width:600px;margin:0 auto;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#2B2B2B;background:#F7F5F0;padding:24px">' +
    '<div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#8A7F70">Kephra System · plano do dia</div>' +
    '<h1 style="font-size:28px;margin:4px 0 0">' + view.weekday + ', ' + dd[2] + '/' + dd[1] + '</h1>' +
    (view.focus && view.focus.title ? '<div style="margin-top:12px;padding:12px 14px;background:#1A365D;color:#F7F5F0;border-radius:8px"><span style="font-size:11px;letter-spacing:.1em;text-transform:uppercase;opacity:.7">Foco do dia</span><br><b style="font-size:16px">' + esc_(view.focus.title) + '</b>' + (view.focus.note ? '<br><span style="font-size:13px;opacity:.8">' + esc_(view.focus.note) + '</span>' : '') + '</div>' : '') +
    (briefing ? section('Briefing', '<div style="font-size:14px;line-height:1.55;white-space:pre-wrap">' + esc_(briefing) + '</div>') : '') +
    section('Sequência do dia', '<table style="border-collapse:collapse;width:100%">' + rows + '</table>' +
      '<p style="font-size:12px;color:#8A7F70">Planejado: ' + view.plannedMin + ' min de tarefas' + (view.freeMin ? ' em ' + view.freeMin + ' min livres' : '') + '.</p>');

  if (view.overflow && view.overflow.length) {
    html += section('Não coube hoje', '<ul style="font-size:14px;padding-left:18px;margin:0">' +
      view.overflow.slice(0, 8).map(o => '<li>' + esc_(o.title) + ' <span style="color:#8A7F70">(' + o.minutes + ' min · P' + o.priority + ')</span></li>').join('') + '</ul>');
  }
  if (deadlines.length) {
    html += section('Prazos · próximos 7 dias', '<ul style="font-size:14px;padding-left:18px;margin:0">' +
      deadlines.slice(0, 10).map(t => '<li><span style="font-family:monospace">' + t.deadline.slice(5, 10).split('-').reverse().join('/') + '</span> · ' + esc_(t.title) + '</li>').join('') + '</ul>');
  }
  if (y.total || y.done) {
    const types = Object.keys(y.byType).sort((a, b) => y.byType[b] - y.byType[a])
      .map(k => (EFFORT_TYPES[k] ? EFFORT_TYPES[k].icon + ' ' + EFFORT_TYPES[k].label : k) + ': ' + y.byType[k] + ' min').join(' · ');
    html += section('Ontem', '<p style="font-size:14px;margin:0">' + y.total + ' min cronometrados · ' + y.done + ' tarefas concluídas' +
      (y.est ? ' · previsto ' + y.est + ' min, real ' + y.act + ' min (' + Math.round(y.act / y.est * 100) + '%)' : '') + '</p>' +
      (types ? '<p style="font-size:13px;color:#5A5245">' + types + '</p>' : ''));
  }
  if (url) html += '<p style="margin-top:28px"><a href="' + url + '" style="background:#B85A38;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;font-weight:600">Abrir o Kephra</a></p>';
  html += '</div>';

  const plain = view.timeline.map(x => x.startHM + '–' + x.endHM + '  ' + x.title).join('\n');
  MailApp.sendEmail({
    to: Session.getEffectiveUser().getEmail(),
    subject: 'Kephra · ' + view.weekday + ' ' + dd[2] + '/' + dd[1] + (view.focus && view.focus.title ? ' · ' + view.focus.title : ''),
    body: (briefing ? briefing + '\n\n' : '') + plain,
    htmlBody: html,
    name: 'Kephra System',
  });
}

// ==================== Code.gs ====================
// ============================================================
// KEPHRA SYSTEM v7 — web app, instalação, gatilhos e API
// ============================================================

function doGet(e) {
  const t = HtmlService.createTemplateFromFile('Index');
  t.openTask = (e && e.parameter && e.parameter.task) || '';
  t.openView = (e && e.parameter && e.parameter.view) || '';
  return t.evaluate()
    .setTitle('Kephra')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover')
    .addMetaTag('apple-mobile-web-app-capable', 'yes')
    .addMetaTag('mobile-web-app-capable', 'yes')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
}

function include(name) {
  return HtmlService.createHtmlOutputFromFile(name).getContent();
}

// ------------------------------------------------------------
// INSTALAÇÃO — rode uma vez no editor: setup()
// ------------------------------------------------------------
function setup() {
  const props = PropertiesService.getScriptProperties();
  let ss = null;
  const existing = props.getProperty(PROP_SHEET_ID);
  if (existing) { try { ss = SpreadsheetApp.openById(existing); } catch (err) { ss = null; } }
  const fresh = !ss;
  if (fresh) {
    ss = SpreadsheetApp.create('Kephra System · Banco de dados');
    props.setProperty(PROP_SHEET_ID, ss.getId());
  }
  const seed = seedData_();
  Object.keys(SCHEMA).forEach(name => {
    let sh = ss.getSheetByName(name);
    const isNew = !sh;
    if (!sh) sh = ss.insertSheet(name);
    sh.getRange('A:Z').setNumberFormat('@');
    sh.getRange(1, 1, 1, SCHEMA[name].cols.length).setValues([SCHEMA[name].cols]).setFontWeight('bold');
    sh.setFrozenRows(1);
    if (isNew && seed[name] && seed[name].length) {
      sh.getRange(2, 1, seed[name].length, SCHEMA[name].cols.length).setValues(seed[name].map(o => encode_(name, o)));
    }
  });
  const blank = ss.getSheetByName('Sheet1') || ss.getSheetByName('Página1') || ss.getSheetByName('Planilha1');
  if (blank && ss.getSheets().length > 1) ss.deleteSheet(blank);

  planCal_();
  routineCal_();
  syncRoutine();
  installTriggers();
  console.log('Kephra pronto. Planilha: ' + ss.getUrl());
  return ss.getUrl();
}

function installTriggers() {
  const handlers = ['morningPlan', 'dailyEmail', 'eveningPlan', 'strategyCron'];
  ScriptApp.getProjectTriggers().forEach(t => { if (handlers.indexOf(t.getHandlerFunction()) >= 0) ScriptApp.deleteTrigger(t); });
  const emailHour = Number(settings_().emailHour || 6);
  // O Apps Script dispara dentro de uma janela de ~15 min em torno do horário pedido
  ScriptApp.newTrigger('morningPlan').timeBased().atHour(Math.max(0, emailHour - 2)).nearMinute(15).everyDays(1).inTimezone(TZ).create();
  ScriptApp.newTrigger('dailyEmail').timeBased().atHour(emailHour).nearMinute(0).everyDays(1).inTimezone(TZ).create();
  ScriptApp.newTrigger('eveningPlan').timeBased().atHour(20).nearMinute(30).everyDays(1).inTimezone(TZ).create();
  ScriptApp.newTrigger('strategyCron').timeBased().atHour(Number(settings_().strategyHour || 16)).nearMinute(0).everyDays(1).inTimezone(TZ).create();
}

// Antes de acordar: monta o dia e escreve no Calendar
function morningPlan() { planDay(ymd_(), true); }
// À noite: deixa o dia seguinte pronto no Calendar
function eveningPlan() { planDay(addDays_(ymd_(), 1), true); }

// ------------------------------------------------------------
// API — único ponto de entrada do front-end
// ------------------------------------------------------------
const READ_ACTIONS = ['bootstrap', 'day', 'stats', 'preview', 'reviews'];

function api(action, payload) {
  const lock = READ_ACTIONS.indexOf(action) >= 0 ? null : LockService.getScriptLock();
  try {
    if (lock) lock.waitLock(20000);
    const fn = API[action];
    if (!fn) throw new Error('Ação desconhecida: ' + action);
    return JSON.stringify({ ok: true, data: fn(payload || {}) });
  } catch (err) {
    console.error(action + ': ' + err.stack);
    return JSON.stringify({ ok: false, error: err.message });
  } finally {
    if (lock) lock.releaseLock();
  }
}

function activeLog_() {
  return all_('TimeLogs').find(l => l.start && !l.end) || null;
}

function stopTimer_(note) {
  const log = activeLog_();
  if (!log) return null;
  const end = new Date();
  const minutes = Math.max(1, Math.round((end - parseIso_(log.start)) / 60000));
  return update_('TimeLogs', log.id, { end: iso_(end), minutes: minutes, note: note || log.note });
}

function completeTask_(id) {
  const log = activeLog_();
  if (log && log.taskId === id) stopTimer_();
  return update_('Tasks', id, { status: 'done', doneAt: iso_(new Date()) });
}

const API = {
  bootstrap: () => ({
    goals: all_('Goals'), projects: all_('Projects'), tasks: all_('Tasks'),
    routine: all_('Routine'), focus: all_('Focus'), settings: settings_(),
    effortTypes: EFFORT_TYPES, priorities: PRIORITIES, routineKinds: ROUTINE_KINDS, horizons: HORIZONS, reviews: reviewsList_(5),
    today: dayView_(ymd_()), todayISO: ymd_(), timer: activeLog_(), actual: actualByTask_(),
    factors: realityFactors_(), aiKeys: aiKeys_(), sheetUrl: ss_().getUrl(),
  }),
  day: p => dayView_(p.day),
  preview: p => planDay(p.day, false),
  plan: p => planDay(p.day, true),

  saveTask: p => {
    const t = Object.assign({}, p.task);
    if (!t.id) {
      t.createdAt = iso_(new Date());
      t.status = t.status || 'todo';
      t.priority = t.priority || 3;
      t.effortLevel = t.effortLevel || 2;
      t.estimateMin = t.estimateMin || 30;
      return insert_('Tasks', t);
    }
    if (t.status === 'done') { const cur = find_('Tasks', t.id); if (cur && cur.status !== 'done') t.doneAt = iso_(new Date()); }
    return update_('Tasks', t.id, t);
  },
  saveTasks: p => p.tasks.map(t => API.saveTask({ task: t })),
  completeTask: p => completeTask_(p.id),
  reopenTask: p => update_('Tasks', p.id, { status: 'todo', doneAt: '' }),
  deleteTask: p => {
    const rows = all_('Plan').filter(r => r.taskId === p.id && parseIso_(r.start).getTime() > Date.now());
    syncPlanToCalendar_([], rows);
    replaceWhere_('Plan', r => rows.some(x => x.id === r.id), []);
    remove_('Tasks', p.id);
    return true;
  },

  saveProject: p => upsert_('Projects', Object.assign({ createdAt: iso_(new Date()), status: 'ativo', priority: 3 }, p.project)),
  deleteProject: p => { remove_('Projects', p.id); return true; },

  saveGoal: p => {
    const g = Object.assign({}, p.goal);
    if (!g.id) { g.createdAt = iso_(new Date()); g.status = g.status || 'ativa'; g.horizon = g.horizon || '3m'; g.rank = all_('Goals').length + 1; }
    if (g.parentId && g.parentId === g.id) g.parentId = '';
    return upsert_('Goals', g);
  },
  deleteGoal: p => {
    all_('Goals').filter(g => g.parentId === p.id).forEach(g => update_('Goals', g.id, { parentId: '' }));
    remove_('Goals', p.id);
    return true;
  },
  moveGoal: p => {
    // Reordena entre irmãs (mesma meta-mãe), trocando os ranks
    const g0 = find_('Goals', p.id);
    if (!g0) return all_('Goals');
    const sibs = all_('Goals').filter(g => (g.parentId || '') === (g0.parentId || '')).sort((a, b) => (a.rank || 99) - (b.rank || 99));
    const i = sibs.findIndex(g => g.id === p.id), j = i + p.dir;
    if (j < 0 || j >= sibs.length) return all_('Goals');
    const ri = sibs[i].rank, rj = sibs[j].rank;
    update_('Goals', sibs[i].id, { rank: rj === ri ? rj + p.dir : rj });
    update_('Goals', sibs[j].id, { rank: ri });
    return all_('Goals');
  },

  saveRoutine: p => upsert_('Routine', Object.assign({ sync: true, seriesId: '' }, p.row)),
  deleteRoutine: p => { const r = find_('Routine', p.id); if (r) deleteRoutineSeries_(r); remove_('Routine', p.id); return true; },
  syncRoutine: () => syncRoutine(),

  saveFocus: p => { p.rows.forEach(r => upsert_('Focus', r)); return all_('Focus'); },
  deleteFocus: p => { remove_('Focus', p.key); return all_('Focus'); },
  saveSettings: p => {
    Object.keys(p.settings).forEach(k => setSetting_(k, p.settings[k]));
    if (p.settings.emailHour !== undefined || p.settings.strategyHour !== undefined) installTriggers();
    return settings_();
  },

  timerStart: p => {
    stopTimer_();
    const task = find_('Tasks', p.taskId);
    if (task && task.status === 'todo') update_('Tasks', task.id, { status: 'doing' });
    return insert_('TimeLogs', { id: uid_('log'), taskId: p.taskId, start: iso_(new Date()), end: '', minutes: '', note: '' });
  },
  timerStop: p => {
    const log = stopTimer_(p.note);
    if (log && p.done) completeTask_(log.taskId);
    return log;
  },
  logManual: p => {
    const end = new Date(), start = new Date(end - p.minutes * 60000);
    return insert_('TimeLogs', { id: uid_('log'), taskId: p.taskId, start: iso_(start), end: iso_(end), minutes: p.minutes, note: 'manual' });
  },

  aiParse: p => aiParseTask(p.text),
  aiBreakdown: p => aiBreakdown(p.taskId),
  aiGoal: p => aiGoalSensory(p.goalId),
  testEmail: () => { dailyEmail(); return true; },

  stats: p => stats_(p.days || 30),

  strategy: p => { aiStrategy(p.horizon); return reviewsList_(5); },
  applyStrategy: p => applyStrategy_(p.id, p.sel || {}),
  ask: p => aiAsk(p.question),
  reviews: () => reviewsList_(20),
};

// ------------------------------------------------------------
// ANÁLISE — para onde vai o seu tempo e o quanto você erra a estimativa
// ------------------------------------------------------------
function stats_(days) {
  const from = addDays_(ymd_(), -days + 1);
  const tasks = {}; all_('Tasks').forEach(t => tasks[t.id] = t);
  const projects = {}; all_('Projects').forEach(p => projects[p.id] = p);
  const goals = {}; all_('Goals').forEach(g => goals[g.id] = g);
  const byType = {}, byProject = {}, byGoal = {}, byDay = {};
  let total = 0;
  all_('TimeLogs').forEach(l => {
    if (!l.start || l.start.slice(0, 10) < from || !l.minutes) return;
    const t = tasks[l.taskId] || {};
    const p = projects[t.projectId] || {};
    const add = (m, k) => { m[k] = (m[k] || 0) + l.minutes; };
    add(byType, t.effortType || 'outro');
    add(byProject, p.name || 'Sem projeto');
    add(byGoal, (goals[p.goalId] || {}).title || 'Sem meta');
    add(byDay, l.start.slice(0, 10));
    total += l.minutes;
  });
  const actual = actualByTask_();
  const accuracy = {};
  const recent = [];
  Object.values(tasks).forEach(t => {
    if (t.status !== 'done' || !t.doneAt || t.doneAt.slice(0, 10) < from) return;
    const act = actual[t.id] || 0;
    if (!act || !t.estimateMin) return;
    const k = t.effortType || 'outro';
    accuracy[k] = accuracy[k] || { est: 0, act: 0, n: 0 };
    accuracy[k].est += t.estimateMin; accuracy[k].act += act; accuracy[k].n++;
    recent.push({ title: t.title, est: t.estimateMin, act: act, effortType: k, doneAt: t.doneAt });
  });
  recent.sort((a, b) => b.doneAt.localeCompare(a.doneAt));
  const done = Object.values(tasks).filter(t => t.doneAt && t.doneAt.slice(0, 10) >= from).length;
  return { days, from, total, done, byType, byProject, byGoal, byDay, accuracy, recent: recent.slice(0, 25), factors: realityFactors_() };
}
