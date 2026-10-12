// Orçamento Buffet de Moqueca — mesmo sistema visual da proposta mensal.
const fs = require('fs');
const { chromium } = require('playwright-core');
const { fontFaces, logo, pot, RED, INK } = require('./common');

const W = 390, H = 760, TOTAL = 7;
const WHATS = '(11) 98855-0641';
const WA = 'https://wa.me/5511988550641?text=' + encodeURIComponent('Olá, Mariana! Recebi o orçamento do Buffet de Moqueca da Caçarola.');

// Reaproveita o CSS da proposta mensal
const src = fs.readFileSync(__dirname + '/pdf.js', 'utf8');
const baseCss = new Function('W', 'H', 'RED', 'INK', 'fontFaces', 'return `' + src.split('const css = `')[1].split('\n`;\n')[0] + '`')(W, H, RED, INK, fontFaces);

const pages = [];
let n = 0;
const head = () => `<div class="top"><img class="mini" src="${logo.red}" alt="Caçarola Personal Chef"><span class="toplabel">Proposta · Buffet de moqueca</span></div>`;
const foot = () => `<div class="foot"><span>Caçarola · Personal Chef</span><span class="pg">${String(n).padStart(2, '0')}<i>/</i>${String(TOTAL).padStart(2, '0')}</span></div>`;
const kicker = (num, txt) => `<div class="kicker"><b>${num}</b><span class="rule"></span><span>${txt}</span></div>`;
const page = (cls, inner, chrome = true) => {
  n++;
  pages.push(`<section class="page ${cls}">${chrome ? head() : ''}${inner}${chrome ? foot() : ''}</section>`);
};

// 1 — Capa
page('cover', `
  <img class="cover-pot" src="${pot.redSoft}" alt="">
  <div class="cover-logo"><img src="${logo.white}" alt="Caçarola Personal Chef"></div>
  <div class="cover-body">
    <div class="eyebrow">Proposta exclusiva</div>
    <h1>Buffet de<br><span>Moqueca</span></h1>
    <div class="cover-rule"></div>
    <p>Evento para 30 pessoas<br>Moquecas de cação e camarão</p>
  </div>
  <div class="cover-foot"><span>Chef Mariana</span><span>Outubro · 2026</span></div>`, false);

// 2 — Apresentação
page('intro', `
  ${kicker('—', 'Apresentação')}
  <h2>Sabor, calor<br>e comida de<br><em>verdade.</em></h2>
  <p class="lead">Uma proposta pensada para receber 30 pessoas com moquecas de cação e camarão, arroz de coco, farofa, mix de folhas e salada de feijão fradinho. Tudo preparado pela chef Mariana, com técnica e cuidado, e servido quente para os convidados.</p>
  <div class="stats">
    <div><strong>30</strong><span>convidados</span></div>
    <div><strong>2</strong><span>moquecas<br>cação e camarão</span></div>
    <div><strong>1</strong><span>ajudante<br>na equipe</span></div>
  </div>`);

// 3 — Buffet completo
page('plano', `
  ${kicker('01', 'Buffet completo')}
  <h2>Buffet</h2>
  <div class="price"><span class="cur">R$</span><span class="val">2.400</span><span class="per">,00<br>/ evento</span></div>
  <p class="pp">R$ 80,00 por pessoa <i>·</i> <em>crianças não pagam</em></p>
  <dl class="spec">
    <div><dt>Inclui</dt><dd><strong>Moquecas, arroz de coco, farofa, mix de folhas e salada de feijão fradinho</strong><small>Cação e camarão · para 30 pessoas</small></dd></div>
    <div><dt>Ingredientes</dt><dd><strong>Todos os insumos inclusos</strong><small>Compra e preparo por conta da Caçarola</small></dd></div>
    <div><dt>Mão de obra</dt><dd><strong>Chef Mariana + 1 ajudante</strong><small>Preparo e serviço no evento</small></dd></div>
    <div class="out"><dt>Não incluso</dt><dd><strong>Acarajés</strong><small>Os acarajés não estão incluídos neste orçamento</small></dd></div>
  </dl>`);

// 4 — Cardápio
const menu = [
  ['Moqueca de cação', 'Postas de cação em molho de leite de coco, tomate, pimentão e dendê'],
  ['Moqueca de camarão', 'Camarão em molho de leite de coco, tomate, pimentão e dendê'],
  ['Arroz de coco', 'Arroz branco cozido no leite de coco'],
  ['Farofa', 'Farofa de farinha de mandioca, crocante e temperada'],
  ['Mix de folhas', 'Seleção de folhas verdes frescas'],
  ['Salada de feijão fradinho', 'Feijão fradinho em salada fresca e temperada'],
];
page('menu moq', `
  ${kicker('02', 'Cardápio')}
  <h2 class="one">Moqueca <em>da Caçarola</em></h2>
  <ol class="dishes">${menu.map((m) => `<li><strong>${m[0]}</strong><small>${m[1]}</small></li>`).join('')}</ol>
  <p class="note"><b>Acarajés não inclusos.</b> O cardápio é uma sugestão e pode ser ajustado conforme as preferências dos convidados e a data do evento.</p>`);

// 5 — Opcional
page('plano', `
  ${kicker('03', 'Opcional')}
  <h2>Louças e<br><em>equipamentos</em></h2>
  <div class="price"><span class="cur">R$</span><span class="val">500</span><span class="per">,00<br>/ evento</span></div>
  <dl class="spec">
    <div><dt>Opcional</dt><dd><strong>Locação de louças</strong><small>Valor médio baseado em pesquisa de mercado</small></dd></div>
    <div><dt>Flexibilidade</dt><dd>Se preferir, podemos manter a locação das louças pela Caçarola ou combinar outra forma de servir. Sem compromisso: a escolha é sua.</dd></div>
  </dl>`);

// 6 — Investimento
page('invest', `
  ${kicker('04', 'Investimento')}
  <h2>Resumo do<br><em>investimento</em></h2>
  <div class="ledger">
    <div class="row"><div><strong>Buffet completo</strong><small>Ingredientes, chef e ajudante</small></div><div class="amt">R$ 2.400</div></div>
    <div class="row"><div><strong>Locação de louças</strong><small>Opcional</small></div><div class="amt">+ R$ 500</div></div>
    <div class="row"><div><strong>Acarajés</strong></div><div class="amt soft">Não inclusos</div></div>
  </div>
  <div class="mini-table">
    <div class="mt-h">Valor total por opção</div>
    <div class="mt-r"><span>Somente buffet<small>R$ 80,00 por pessoa</small></span><b>R$ 2.400</b></div>
    <div class="mt-r"><span>Buffet + louças<small>R$ 96,67 por pessoa</small></span><b>R$ 2.900</b></div>
    <div class="mt-f">Crianças não pagam · Acarajés não inclusos</div>
  </div>`);

// 7 — Encerramento
page('closing', `
  <img class="cover-pot" src="${pot.redSoft}" alt="">
  <div class="close-logo"><img src="${logo.white}" alt="Caçarola Personal Chef"></div>
  <p class="motto">comida de verdade, feita com carinho e técnica.</p>
  <div class="cover-rule"></div>
  <div class="sig">Mariana · Chef de Cozinha · PUC-PR</div>
  <a class="wa" href="${WA}"><span>WhatsApp</span><b>${WHATS}</b></a>
  <div class="cover-foot"><span>Caçarola · Personal Chef</span><span>07<i>/</i>07</span></div>`, false);

const css = baseCss + `
.cover h1{font-size:52px}
.moq h2.one{font-size:33px;white-space:nowrap;margin-bottom:18px}
.pp{font-size:16px;font-weight:500;margin:-14px 0 6px}
.pp i{font-style:normal;color:${RED};margin:0 5px}
.price{margin-bottom:20px}
.price .val{font-size:104px}
.plano .spec>div{padding:11px 0}
.plano .spec dd strong{font-size:18.5px;line-height:1.25}
.plano .spec dd small{font-size:14.5px}
.spec .out dt{color:${INK}}
.spec .out dd strong{color:${RED}}
.dishes{list-style:none;border-top:1px solid ${INK}}
.dishes li{padding:9px 0;border-bottom:1px solid #EFE8E6}
.dishes strong{display:block;font-size:19px;font-weight:600;line-height:1.2}
.dishes small{display:block;font-size:15px;line-height:1.35;color:#6F6562;margin-top:3px}
.note{margin-top:12px;font-size:14.5px;line-height:1.45;color:#3A3230;background:#FBF3F2;border-left:2px solid ${RED};padding:11px 14px}
.note b{color:${RED};font-weight:600}
.mt-r span small{display:block;font-size:12.5px;opacity:.85;font-weight:400;margin-top:1px}
.mt-r{align-items:center}
`;

const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Caçarola — Orçamento Buffet de Moqueca</title><style>${css}</style></head><body>${pages.join('\n')}</body></html>`;

(async () => {
  fs.writeFileSync('moq-pdf.html', html);
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await b.newPage({ viewport: { width: W, height: H } });
  await p.setContent(html, { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready);
  const over = await p.evaluate(() =>
    [...document.querySelectorAll('.page')].map((pg, i) => {
      const r = pg.getBoundingClientRect(), f = pg.querySelector('.foot');
      const limit = f ? f.getBoundingClientRect().top : r.bottom;
      let max = 0;
      pg.querySelectorAll('*').forEach((el) => {
        if (el.closest('.foot') || el.classList.contains('cover-pot') || el.closest('.stats') || el.closest('.cover-foot')) return;
        max = Math.max(max, el.getBoundingClientRect().bottom);
      });
      return i + 1 + ':' + Math.round(limit - max);
    })
  );
  console.log(over.join(' '));
  await p.pdf({ path: 'Orcamento_Cacarola_Buffet_Moqueca.pdf', width: W + 'px', height: H + 'px', printBackground: true, preferCSSPageSize: true });
  await b.close();
})();
