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
