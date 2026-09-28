/**
 * Wedding's — backend de captação de leads (Google Apps Script)
 *
 * Recebe o diagnóstico enviado pela landing (index.html), grava na aba "Leads"
 * da planilha vinculada, calcula o Score de Afinidade e avisa a equipe por e-mail.
 *
 * Implantação: ver README.md desta pasta. IMPORTANTE: "Quem pode acessar: Qualquer pessoa".
 */

const OWNER_EMAILS = ['musica.weddings@gmail.com']; // quem recebe o alerta de novo lead
const SHEET_NAME = 'Leads';
const HOT_SCORE = 70;  // >= 70: ligar/WhatsApp em até 24h
const WARM_SCORE = 45; // 45–69: e-mail com sugestões em até 48h; < 45: nutrição

const HEADERS = [
  'ID', 'Recebido em', 'Score', 'Prioridade', 'Status', 'Nome', 'Papel', 'WhatsApp', 'E-mail',
  'Horizonte', 'Data', 'Cidade', 'Local', 'Convidados', 'Estilo', 'Formação', 'Música marcante',
  'Arranjo exclusivo', 'Visão', 'Investimento', 'Origem', 'Consentimento LGPD', 'Página'
];

const BASE_CITIES = ['Santos', 'Guarujá', 'São Vicente', 'Praia Grande'];

function doPost(e) {
  try {
    const d = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (d.website) return json_({ ok: true }); // honeypot: bot
    if (!d.nome || !d.whatsapp || !d.email) return json_({ ok: false, error: 'campos obrigatórios' });

    const score = score_(d);
    const prioridade = score >= HOT_SCORE ? 'QUENTE · contato em 24h'
      : score >= WARM_SCORE ? 'MORNO · e-mail em 48h' : 'FRIO · nutrição';
    const id = 'WD-' + Utilities.getUuid().slice(0, 8).toUpperCase();

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      sheet_().appendRow([
        id, new Date(), score, prioridade, 'Novo', d.nome, d.papel, d.whatsapp, d.email,
        d.horizonte, d.data, d.cidade, d.local, d.convidados, d.estilo, d.formacao, d.musica,
        d.arranjo, d.visao, d.investimento, d.origem, d.consentimentoLGPD ? 'Sim' : 'Não', d.pagina
      ]);
    } finally {
      lock.releaseLock();
    }

    notify_(id, score, prioridade, d);
    return json_({ ok: true, id: id, score: score });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: String(err) });
  }
}

function doGet() {
  return json_({ ok: true, service: "Wedding's leads", time: new Date().toISOString() });
}

/** Mesma regra do index.html — aqui é a fonte da verdade. */
function score_(d) {
  let s = 0;
  s += ({ 'Acima de R$ 20.000': 40, 'R$ 13.000 a R$ 20.000': 32, 'R$ 8.000 a R$ 13.000': 22,
          'Prefiro conversar antes': 12, 'Até R$ 8.000': 5 })[d.investimento] || 0;
  s += BASE_CITIES.indexOf(d.cidade) >= 0 ? 20 : 8;
  s += ({ 'Em 6 a 12 meses': 20, 'Em 3 a 6 meses': 18, 'Em mais de 1 ano': 12,
          'Nos próximos 3 meses': 10, 'Ainda sem data': 4 })[d.horizonte] || 0;
  s += ({ 'Grandiosa (orquestra + coral)': 10, 'Câmara com vozes (8–12)': 8,
          'Intimista (4–6 músicos)': 5, 'Ainda não sei': 5 })[d.formacao] || 0;
  s += d.arranjo === 'Sim, com certeza' ? 10 : d.arranjo === 'Talvez' ? 5 : 0;
  return Math.min(100, s);
}

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }
  return sh;
}

function notify_(id, score, prioridade, d) {
  const phone = String(d.whatsapp || '').replace(/\D/g, '');
  const wa = 'https://wa.me/' + (phone.length <= 11 ? '55' + phone : phone);
  const body = [
    'Novo diagnóstico — ' + id,
    'Score: ' + score + ' · ' + prioridade,
    '',
    'Nome: ' + d.nome + ' (' + (d.papel || '-') + ')',
    'WhatsApp: ' + d.whatsapp + '  →  ' + wa,
    'E-mail: ' + d.email,
    'Quando: ' + d.horizonte + (d.data ? ' · ' + d.data : ''),
    'Onde: ' + d.cidade + ' · ' + d.local + ' · convidados: ' + (d.convidados || '-'),
    'Estilo: ' + d.estilo + ' · Formação: ' + d.formacao,
    'Música: ' + (d.musica || '-') + ' · Arranjo: ' + (d.arranjo || '-'),
    'Investimento: ' + d.investimento,
    'Origem: ' + (d.origem || '-'),
    '',
    'Visão: ' + (d.visao || '-'),
    '',
    'Próximo passo: ' + (score >= HOT_SCORE
      ? 'WhatsApp pessoal hoje + agendar Consulta de Curadoria (15 min).'
      : score >= WARM_SCORE ? 'E-mail com 3 sugestões por momento em até 48h.' : 'Entrar na nutrição.')
  ].join('\n');
  MailApp.sendEmail({
    to: OWNER_EMAILS.join(','),
    subject: "[Wedding's] " + prioridade.split(' ')[0] + ' · ' + d.nome + ' · ' + d.cidade,
    body: body
  });
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

/** Rode uma vez pelo editor para autorizar e testar. */
function testeManual() {
  const r = doPost({ postData: { contents: JSON.stringify({
    nome: 'Teste Interno', papel: 'O casal', whatsapp: '13999999999', email: OWNER_EMAILS[0],
    horizonte: 'Em 6 a 12 meses', cidade: 'Santos', local: 'Basílica do Embaré',
    estilo: 'Equilíbrio entre clássico e moderno', formacao: 'Câmara com vozes (8–12)',
    arranjo: 'Sim, com certeza', investimento: 'R$ 13.000 a R$ 20.000', consentimentoLGPD: true
  }) } });
  console.log(r.getContent());
}
