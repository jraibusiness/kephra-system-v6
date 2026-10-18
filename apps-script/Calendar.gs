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
