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

function scoreTask_(t, ctx) {
  let s = (PRIORITIES[t.priority] || PRIORITIES[3]).weight;
  const p = ctx.projects[t.projectId];
  const g = p ? ctx.goals[p.goalId] : null;
  if (g) {
    if (ctx.focus && g.id === ctx.focus.goalId) s += 45;
    if (ctx.periodGoal && g.id === ctx.periodGoal) s += 25;
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
