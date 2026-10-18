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
