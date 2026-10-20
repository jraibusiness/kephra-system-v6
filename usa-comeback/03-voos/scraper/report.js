// Lê o JSON do kayak.js, grava o histórico em precos.csv e gera o e-mail HTML do alerta diário.
// Uso: node report.js grid.json > email.html   (resumo vai para stderr como JSON)
const fs = require('fs');
const path = require('path');

const CSV = path.join(__dirname, '..', 'precos.csv');
const TEAL = '#1B7A7A', OCHRE = '#E17A18', GRAY = '#F5F5F5', TEXT = '#333333';
const FIRST_DEP = new Date('2026-12-08T00:00:00Z');
const OPPORTUNITY_1STOP = 1250; // US$ — abaixo disso, 1 escala, é fora da curva para dez/jan

const grid = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const day = grid.checked_at.slice(0, 10);
const ok = grid.results.filter(r => r.cheapest);

const legOf = r => {
  const hit = (r.top || []).find(t => t.legs && t.legs.length && t.price === '$' + (r.cheapest.usd).toLocaleString('en-US'));
  return hit ? hit.legs[0] : { airline: '—', stops: '' };
};
const airlineOf = r => legOf(r).airline;

// Histórico
const hist = fs.readFileSync(CSV, 'utf8').trim().split('\n').slice(1).map(l => l.split(','));
const prevDays = [...new Set(hist.map(h => h[0]).filter(d => d < day && /^\d{4}-\d\d-\d\d$/.test(d)))].sort();
const minOn = (d, col) => {
  const v = hist.filter(h => h[0] === d && h[9] === col).map(h => Number(h[7])).filter(Boolean);
  return v.length ? Math.min(...v) : null;
};
const lines = [];
for (const r of ok) {
  lines.push([day, grid.orig, grid.dest, r.dep, r.ret, airlineOf(r).replace(/,/g, ' /'), legOf(r).stops.replace(/ stops?/, ''), r.cheapest.usd, 'Kayak', 'cheapest'].join(','));
  if (r.stopsMin && r.stopsMin.one_stop) lines.push([day, grid.orig, grid.dest, r.dep, r.ret, '', '1', r.stopsMin.one_stop, 'Kayak', 'one_stop'].join(','));
  if (r.quickest) lines.push([day, grid.orig, grid.dest, r.dep, r.ret, '', '', r.quickest.usd, 'Kayak', 'quickest:' + r.quickest.duration].join(','));
}
fs.appendFileSync(CSV, lines.join('\n') + '\n');

// Indicadores
const minCheap = Math.min(...ok.map(r => r.cheapest.usd));
const min1 = Math.min(...ok.map(r => (r.stopsMin && r.stopsMin.one_stop) || Infinity));
const best = ok.find(r => r.cheapest.usd === minCheap);
const best1 = ok.find(r => r.stopsMin && r.stopsMin.one_stop === min1);
const yesterday = prevDays.length ? prevDays[prevDays.length - 1] : null;
const prevCheap = yesterday ? minOn(yesterday, 'cheapest') : null;
const prev1 = yesterday ? minOn(yesterday, 'one_stop') : null;
const daysOut = Math.round((FIRST_DEP - new Date(day + 'T00:00:00Z')) / 864e5);
const delta = (a, b) => (b == null ? '—' : (a - b === 0 ? '= 0' : (a > b ? '▲ +' : '▼ ') + (a - b)));

// Alta por data: compara 1 escala e mais rápido de cada par de datas com o dia anterior
const prevOf = (dep, ret, tag) => {
  if (!yesterday) return null;
  const v = hist.filter(h => h[0] === yesterday && h[3] === dep && h[4] === ret && h[9].startsWith(tag)).map(h => Number(h[7]));
  return v.length ? v[0] : null;
};
const rises = [];
for (const r of ok) {
  for (const [tag, val] of [['one_stop', r.stopsMin && r.stopsMin.one_stop], ['quickest', r.quickest && r.quickest.usd]]) {
    const p = prevOf(r.dep, r.ret, tag);
    if (val && p && val - p >= 75) rises.push({ dep: r.dep, ret: r.ret, tag, from: p, to: val });
  }
}
const maxRise = rises.sort((a, b) => (b.to - b.from) - (a.to - a.from))[0];

let verdict, color, why;
if (min1 <= OPPORTUNITY_1STOP) {
  verdict = 'OPORTUNIDADE — COMPRAR HOJE'; color = '#2E7D32';
  why = `1 escala abaixo de US$ ${OPPORTUNITY_1STOP}: fora da curva para alta temporada.`;
} else if (daysOut <= 45 || (prev1 && min1 > prev1) || maxRise) {
  verdict = 'COMPRAR JÁ'; color = '#B4570A';
  why = maxRise
    ? `Preços começaram a subir: ida ${maxRise.dep.slice(8)}/12 → volta ${maxRise.ret.slice(8)}/01 foi de US$ ${maxRise.from} para US$ ${maxRise.to} (${rises.length} alta(s) ≥ US$ 75 desde ontem).`
    : daysOut <= 45 ? `Faltam ${daysOut} dias: a partir daqui a tarifa de fim de ano tende a subir.` : 'A tarifa de 1 escala subiu desde ontem.';
} else {
  verdict = 'MONITORAR (pode esperar alguns dias)'; color = TEAL;
  why = `Faltam ${daysOut} dias para a 1ª data de ida. Preço estável; janela boa de compra vai até ~45 dias antes.`;
}

const row = r => `<tr>
  <td style="padding:6px 8px;border-bottom:1px solid #ddd">${r.dep.slice(8)}/${r.dep.slice(5, 7)} → ${r.ret.slice(8)}/${r.ret.slice(5, 7)}</td>
  <td style="padding:6px 8px;border-bottom:1px solid #ddd;text-align:right;${r.cheapest.usd === minCheap ? `color:#A8520C;font-weight:bold` : ''}">$${r.cheapest.usd.toLocaleString('en-US')}</td>
  <td style="padding:6px 8px;border-bottom:1px solid #ddd">${airlineOf(r)} · ${r.cheapest.duration}</td>
  <td style="padding:6px 8px;border-bottom:1px solid #ddd;text-align:right;${r.stopsMin && r.stopsMin.one_stop === min1 ? `color:#A8520C;font-weight:bold` : ''}">${r.stopsMin && r.stopsMin.one_stop ? '$' + r.stopsMin.one_stop.toLocaleString('en-US') : '—'}</td>
  <td style="padding:6px 8px;border-bottom:1px solid #ddd;text-align:right">${r.quickest ? '$' + r.quickest.usd.toLocaleString('en-US') + ' · ' + r.quickest.duration : '—'}</td>
  <td style="padding:6px 8px;border-bottom:1px solid #ddd"><a href="${r.url}" style="color:${TEAL}">ver</a></td></tr>`;

const tile = (label, value, sub) => `<td style="background-color:${GRAY};padding:12px;width:33%;vertical-align:top">
  <div style="font-size:12px;color:#666">${label}</div><div style="font-size:22px;font-weight:bold;color:${TEAL}">${value}</div><div style="font-size:12px;color:#666">${sub}</div></td>`;

const html = `<div style="font-family:Arial,Helvetica,sans-serif;color:${TEXT};max-width:680px;margin:auto">
<div style="background-color:${TEAL};color:#fff;padding:16px 20px"><div style="font-size:12px;letter-spacing:1px">ALERTA DE VOOS · ${day.split('-').reverse().join('/')}</div>
<div style="font-size:20px;font-weight:bold">Cincinnati (CVG) → São Paulo (GRU) · ida e volta</div></div>
<div style="background-color:${color};color:#fff;padding:12px 20px;font-size:16px;font-weight:bold">${verdict}</div>
<div style="padding:8px 20px;font-size:14px">${why}</div>
<table style="width:100%;border-collapse:separate;border-spacing:8px"><tr>
${tile('Mais barato hoje', '$' + minCheap.toLocaleString('en-US'), `${delta(minCheap, prevCheap)} vs ontem · ${best.dep.slice(8)}/12 → ${best.ret.slice(8)}/01`)}
${tile('Melhor com 1 escala', isFinite(min1) ? '$' + min1.toLocaleString('en-US') : '—', `${delta(min1, prev1)} vs ontem${best1 ? ` · ${best1.dep.slice(8)}/12 → ${best1.ret.slice(8)}/01` : ''}`)}
${tile('Dias até a 1ª ida', String(daysOut), '08/12/2026')}
</tr></table>
<table style="width:100%;border-collapse:collapse;font-size:13px;margin-top:4px">
<tr style="background-color:${GRAY};text-align:left"><th style="padding:6px 8px">Datas</th><th style="padding:6px 8px;text-align:right">Mais barato</th><th style="padding:6px 8px">Cia · duração</th><th style="padding:6px 8px;text-align:right">1 escala</th><th style="padding:6px 8px;text-align:right">Mais rápido</th><th></th></tr>
${ok.map(row).join('\n')}
</table>
<!--ANALISE-->
<div style="font-size:11px;color:#888;padding:16px 20px">Fonte: Kayak (preço total por pessoa, econômica, em US$, consultado às ${grid.checked_at.slice(11, 16)} UTC). Preços mudam a cada minuto — confirmar no site antes de comprar. Google Flights bloqueia consultas automáticas; vale ativar o “Acompanhar preços” dele com as datas escolhidas.</div>
</div>`;

process.stdout.write(html);
process.stderr.write(JSON.stringify({ day, minCheap, min1, prevCheap, prev1, daysOut, verdict, rises: rises.length, failed: grid.results.length - ok.length }) + '\n');
