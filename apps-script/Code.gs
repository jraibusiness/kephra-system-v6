// ============================================================
// KEPHRA SYSTEM v7 — web app, instalação, gatilhos e API
// ============================================================

function doGet(e) {
  const t = HtmlService.createTemplateFromFile('Index');
  t.openTask = (e && e.parameter && e.parameter.task) || '';
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
  const handlers = ['morningPlan', 'dailyEmail', 'eveningPlan'];
  ScriptApp.getProjectTriggers().forEach(t => { if (handlers.indexOf(t.getHandlerFunction()) >= 0) ScriptApp.deleteTrigger(t); });
  const emailHour = Number(settings_().emailHour || 6);
  // O Apps Script dispara dentro de uma janela de ~15 min em torno do horário pedido
  ScriptApp.newTrigger('morningPlan').timeBased().atHour(Math.max(0, emailHour - 2)).nearMinute(15).everyDays(1).inTimezone(TZ).create();
  ScriptApp.newTrigger('dailyEmail').timeBased().atHour(emailHour).nearMinute(0).everyDays(1).inTimezone(TZ).create();
  ScriptApp.newTrigger('eveningPlan').timeBased().atHour(20).nearMinute(30).everyDays(1).inTimezone(TZ).create();
}

// Antes de acordar: monta o dia e escreve no Calendar
function morningPlan() { planDay(ymd_(), true); }
// À noite: deixa o dia seguinte pronto no Calendar
function eveningPlan() { planDay(addDays_(ymd_(), 1), true); }

// ------------------------------------------------------------
// API — único ponto de entrada do front-end
// ------------------------------------------------------------
const READ_ACTIONS = ['bootstrap', 'day', 'stats', 'preview'];

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
    effortTypes: EFFORT_TYPES, priorities: PRIORITIES, routineKinds: ROUTINE_KINDS,
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
    if (!g.id) { g.createdAt = iso_(new Date()); g.status = g.status || 'ativa'; g.rank = all_('Goals').length + 1; }
    return upsert_('Goals', g);
  },
  deleteGoal: p => { remove_('Goals', p.id); return true; },
  moveGoal: p => {
    const goals = all_('Goals').slice().sort((a, b) => (a.rank || 99) - (b.rank || 99));
    const i = goals.findIndex(g => g.id === p.id), j = i + p.dir;
    if (i < 0 || j < 0 || j >= goals.length) return goals;
    const tmp = goals[i]; goals[i] = goals[j]; goals[j] = tmp;
    goals.forEach((g, k) => { if (g.rank !== k + 1) update_('Goals', g.id, { rank: k + 1 }); });
    return all_('Goals');
  },

  saveRoutine: p => upsert_('Routine', Object.assign({ sync: true, seriesId: '' }, p.row)),
  deleteRoutine: p => { const r = find_('Routine', p.id); if (r) deleteRoutineSeries_(r); remove_('Routine', p.id); return true; },
  syncRoutine: () => syncRoutine(),

  saveFocus: p => { p.rows.forEach(r => upsert_('Focus', r)); return all_('Focus'); },
  deleteFocus: p => { remove_('Focus', p.key); return all_('Focus'); },
  saveSettings: p => {
    Object.keys(p.settings).forEach(k => setSetting_(k, p.settings[k]));
    if (p.settings.emailHour !== undefined) installTriggers();
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
