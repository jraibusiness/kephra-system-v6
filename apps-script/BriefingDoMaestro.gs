/**
 * BRIEFING DO MAESTRO — versão Apps Script (não depende do Claude)
 * Roda nos servidores do Google todo dia por volta das 4h40.
 * Lê: Google Doc "Kephra · Prioridades da Semana" + Agenda (principal e Kephra · Rotina)
 *     + vigilância no Gmail (falhas de script, n8n, Mercor, e-mails do curso).
 * Envia: 1 e-mail curto para o João. O assunto começa com ⚠️ só quando algo quebrou.
 *
 * INSTALAÇÃO (uma vez):
 *  1. script.google.com → Novo projeto → nome "Briefing do Maestro".
 *  2. Cole este arquivo inteiro no Code.gs e salve.
 *  3. Configurações do projeto (engrenagem) → Fuso horário: (GMT-03:00) São Paulo.
 *  4. Selecione a função criarGatilho → Executar → autorize.
 *  5. Teste agora: selecione enviarBriefing → Executar. O e-mail deve chegar em 1 minuto.
 */

const DOC_ID     = '1u26XJCjbxKVY22N6RKzDBuNmUvVvFPxToza46jGIQKk';
const CAL_ROTINA = '32bbf119b83ff89d451cb57fa5872b49cd3205c31b2856a93540d1246e76a66c@group.calendar.google.com';
const PARA       = 'jr.conductor83@gmail.com';
const TZ         = 'America/Sao_Paulo';
const DIAS       = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
// Período do curso de arranjo da OSB (para checar os e-mails aos alunos)
const CURSO_INICIO = new Date(2026, 10, 5), CURSO_FIM = new Date(2026, 11, 10);

function enviarBriefing() {
  const hoje   = new Date();
  const dd     = Utilities.formatDate(hoje, TZ, 'dd/MM');
  const dow    = DIAS[Number(Utilities.formatDate(hoje, TZ, 'u')) % 7]; // u: 1=seg … 7=dom
  const linhas = DocumentApp.openById(DOC_ID).getBody().getText().split('\n');

  const plano   = blocoDoDia_(linhas, dow + ' ' + dd);
  const prazo   = proximoPrazo_(linhas, hoje);
  const agenda  = agenda_(hoje);
  const alertas = vigilancia_(hoje);

  const principal = plano.length ? plano[0] : 'Sem plano do dia no documento: atualizar as prioridades na revisão de sexta.';
  let corpo = 'A coisa mais importante hoje: ' + principal + '\n';
  if (plano.length > 1) corpo += '\nPlano do dia:\n' + plano.slice(1).map(l => '• ' + l).join('\n') + '\n';
  corpo += '\nAgenda:\n' + (agenda.length ? agenda.join('\n') : '• sem compromissos com horário') + '\n';
  if (prazo) corpo += '\nPrazo mais próximo: ' + prazo + '\n';
  if (alertas.length) corpo += '\n⚠️ Atenção:\n' + alertas.map(a => '• ' + a).join('\n') + '\n';
  if (dow === 'Sex') corpo += '\n' + secao_(linhas, 'PLACAR') + '\n';
  corpo += '\nPrioridades: https://docs.google.com/document/d/' + DOC_ID + '/edit';

  const assunto = (alertas.length ? '⚠️ ' : '') + 'Hoje: ' + principal.replace(/[;:.]$/, '').substring(0, 70);
  MailApp.sendEmail(PARA, assunto, corpo, { name: 'Briefing do Maestro' });
}

// Itens do dia na seção DIA A DIA: "- Qui 12/11:" seguido de "  - ..." (ou tudo numa linha só)
function blocoDoDia_(linhas, rotulo) {
  const out = [];
  for (let i = 0; i < linhas.length; i++) {
    const l = linhas[i];
    if (/^\S/.test(l) && l.indexOf(rotulo) !== -1) {
      const resto = l.split(rotulo)[1].replace(/^[\s:—-]+/, '').trim();
      if (resto) out.push(resto);
      for (let j = i + 1; j < linhas.length && /^\s+\S/.test(linhas[j]); j++) {
        out.push(linhas[j].replace(/^\s*[-•]\s*/, '').replace(/;$/, '').trim());
      }
      break;
    }
  }
  return out;
}

// Próximo prazo da seção PRAZOS (primeira data dd/mm de cada linha)
function proximoPrazo_(linhas, hoje) {
  const base = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  let melhor = null;
  secao_(linhas, 'PRAZOS').split('\n').forEach(l => {
    const m = l.match(/(\d{1,2})\/(\d{1,2})/);
    if (!m) return;
    let d = new Date(base.getFullYear(), Number(m[2]) - 1, Number(m[1]));
    if (d < base && base.getMonth() === 11 && Number(m[2]) === 1) d.setFullYear(d.getFullYear() + 1);
    if (d < base) return;
    if (!melhor || d < melhor.d) melhor = { d: d, t: l.replace(/^[-•\s]+/, '') };
  });
  if (!melhor) return '';
  const dias = Math.round((melhor.d - base) / 86400000);
  return melhor.t + (dias === 0 ? ' (HOJE)' : ' (faltam ' + dias + ' dia' + (dias > 1 ? 's' : '') + ')');
}

function secao_(linhas, titulo) {
  const ini = linhas.findIndex(l => l.trim().toUpperCase().indexOf(titulo) === 0);
  if (ini < 0) return '';
  const out = [linhas[ini]];
  for (let i = ini + 1; i < linhas.length; i++) {
    const t = linhas[i].trim();
    if (t && t === t.toUpperCase() && /[A-ZÇÃÕÉ]{4,}/.test(t) && !/^[-•]/.test(t)) break; // próximo título
    if (t) out.push(linhas[i]);
  }
  return out.join('\n');
}

// Compromissos do calendário principal + blocos da rotina que não colidem com eles
function agenda_(hoje) {
  const ini = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const fim = new Date(ini.getTime() + 86400000);
  const fmt = d => Utilities.formatDate(d, TZ, 'HH:mm');
  const princ = CalendarApp.getDefaultCalendar().getEvents(ini, fim);
  const cal = CalendarApp.getCalendarById(CAL_ROTINA);
  const rot = cal ? cal.getEvents(ini, fim) : [];
  const ocupados = princ.filter(e => !e.isAllDayEvent());
  const colide = e => ocupados.some(p => e.getStartTime() < p.getEndTime() && e.getEndTime() > p.getStartTime());

  const itens = [];
  princ.forEach(e => itens.push({ t: e.isAllDayEvent() ? ini : e.getStartTime(),
    s: (e.isAllDayEvent() ? 'dia todo' : fmt(e.getStartTime())) + ' · ' + e.getTitle() + ' ★' }));
  rot.forEach(e => { if (!colide(e)) itens.push({ t: e.getStartTime(), s: fmt(e.getStartTime()) + ' · ' + e.getTitle() }); });
  return itens.sort((a, b) => a.t - b.t).map(i => '• ' + i.s);
}

// Só reporta o que quebrou. Poucas chamadas ao Gmail (não estoura cota).
function vigilancia_(hoje) {
  const a = [];
  const n = q => GmailApp.search(q, 0, 50).length;
  const scripts = n('newer_than:1d subject:"Summary of failures for Google Apps Script"');
  if (scripts) a.push(scripts + ' aviso(s) de falha de Apps Script nas últimas 24h.');
  const n8n = n('newer_than:1d subject:"Publicador: erro"');
  if (n8n) a.push(n8n + ' erro(s) do n8n (Publicador) nas últimas 24h: ver o fiscal de sexta ou o n8n.');
  const mercor = n('newer_than:1d from:mercor.com ("Action needed" OR "good standing")');
  if (mercor) a.push('Alerta da Mercor: pegar/fazer tarefa para manter a vaga.');
  const ontem = new Date(hoje.getTime() - 86400000);
  const dOntem = Number(Utilities.formatDate(ontem, TZ, 'u')); // 1=seg 3=qua 4=qui 6=sáb
  if ([1, 3, 4, 6].indexOf(dOntem) !== -1 && ontem >= CURSO_INICIO && ontem <= CURSO_FIM) {
    if (!n('in:sent newer_than:1d "Conexões Musicais"')) a.push('O e-mail de ontem aos alunos do curso de arranjo não saiu.');
  }
  return a;
}

function criarGatilho() {
  ScriptApp.getProjectTriggers().forEach(t => {
    if (t.getHandlerFunction() === 'enviarBriefing') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('enviarBriefing').timeBased().everyDays(1).atHour(4).nearMinute(40).inTimezone(TZ).create();
  Logger.log('Gatilho criado: todo dia por volta das 4h40 (São Paulo).');
}
