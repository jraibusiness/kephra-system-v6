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
