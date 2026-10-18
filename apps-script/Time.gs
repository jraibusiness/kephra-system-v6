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
