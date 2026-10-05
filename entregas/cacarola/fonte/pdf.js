// Gera a versão PDF (formato vertical para smartphone) a partir do conteúdo.
const fs = require('fs');
const { chromium } = require('playwright-core');
const D = require('./data');
const { fontFaces, logo, pot, RED, INK } = require('./common');

const W = 390, H = 760;
const pages = [];
const TOTAL = 13;
let n = 0;

const head = (label) => `
  <div class="top">
    <img class="mini" src="${logo.red}" alt="Caçarola Personal Chef">
    <span class="toplabel">${label}</span>
  </div>`;
const foot = () => `
  <div class="foot"><span>Caçarola · Personal Chef</span><span class="pg">${String(n).padStart(2, '0')}<i>/</i>${TOTAL}</span></div>`;
const kicker = (num, txt) => `<div class="kicker"><b>${num}</b><span class="rule"></span><span>${txt}</span></div>`;
const page = (cls, inner, withChrome = true, label = 'Proposta · Plano mensal') => {
  n++;
  pages.push(`<section class="page ${cls}">${withChrome ? head(label) : ''}${inner}${withChrome ? foot() : ''}</section>`);
};

// 1 — Capa
page(
  'cover',
  `
  <img class="cover-pot" src="${pot.redSoft}" alt="">
  <div class="cover-logo"><img src="${logo.white}" alt="Caçarola Personal Chef"></div>
  <div class="cover-body">
    <div class="eyebrow">Proposta exclusiva</div>
    <h1>Plano Mensal<br><span>Personalizado</span></h1>
    <div class="cover-rule"></div>
    <p>${D.subtitulo}<br>${D.dias}</p>
  </div>
  <div class="cover-foot"><span>Chef Mariana</span><span>Outubro · 2026</span></div>`,
  false
);

// 2 — Apresentação
page(
  'intro',
  `
  ${kicker('—', 'Apresentação')}
  <h2>Praticidade,<br>variedade e<br><em>comida de verdade.</em></h2>
  <p class="lead">${D.intro}</p>
  <div class="stats">
    <div><strong>2</strong><span>pessoas</span></div>
    <div><strong>40</strong><span>marmitas<br>de almoço</span></div>
    <div><strong>20</strong><span>dias úteis<br>seg — sex</span></div>
  </div>`
);

// 3 — Plano mensal
page(
  'plano',
  `
  ${kicker('01', 'Plano mensal')}
  <h2>Almoços</h2>
  <div class="price">
    <span class="cur">R$</span><span class="val">${D.plano.preco}</span><span class="per">,00<br>/ mês</span>
  </div>
  <dl class="spec">
    <div><dt>Inclui</dt><dd><strong>${D.plano.inclui[0]}</strong><small>${D.plano.inclui[1]}</small></dd></div>
    <div><dt>Personal shopper</dt><dd>${D.plano.shopper}</dd></div>
    <div><dt>Ingredientes</dt><dd>${D.plano.ingredientes}</dd></div>
  </dl>`
);

// 4–7 — Cardápio
D.semanas.forEach((s) => {
  page(
    'menu',
    `
    ${kicker('02', 'Cardápio sugerido · 1º mês')}
    <div class="weekhead">
      <div>
        <div class="weekno">Semana ${s.n}</div>
        <h2>${s.tema}</h2>
      </div>
      <div class="dots">${[1, 2, 3, 4].map((i) => `<i class="${i === s.n ? 'on' : ''}"></i>`).join('')}</div>
    </div>
    <ol class="days">
      ${s.dias
        .map(
          (d, i) => `<li><span class="day">${D.diasSemana[i][0]}</span><div><strong>${d[0]}</strong><small>${d
            .slice(1)
            .join('<i>·</i>')}</small></div></li>`
        )
        .join('')}
    </ol>`
  );
});

// 8 — Complemento
page(
  'comp',
  `
  ${kicker('03', 'Complemento')}
  <h2>Jantares<br><em>+ lanches</em></h2>
  <p class="body">${D.complemento.texto}</p>
  <ul class="compo">
    ${D.complemento.itens
      .map((it) => `<li><b>${it[0]}</b><div><strong>${it[1]}</strong>${it[2] ? `<small>${it[2]}</small>` : ''}</div></li>`)
      .join('')}
  </ul>`
);

// 9 — Frequência
page(
  'freq',
  `
  ${kicker('03', 'Complemento · frequência')}
  <h2>Escolha o ritmo<br><em>de entrega</em></h2>
  <div class="opts">
    ${D.complemento.opcoes
      .map(
        (o) => `<div class="opt"><div class="opt-top"><span>${o.nome}</span><span class="add"><small>+ R$</small>${o.valor}</span></div><p>${o.desc}</p></div>`
      )
      .join('')}
  </div>
  <div class="notes">
    <div><h3>Sugestões de travessas</h3><p>${D.complemento.travessas}</p></div>
    <div><h3>Sugestões de lanches</h3><p>${D.complemento.lanches}</p></div>
  </div>`
);

// 10 — Investimento
page(
  'invest',
  `
  ${kicker('04', 'Investimento')}
  <h2>Resumo do<br><em>investimento</em></h2>
  <div class="ledger">
    <div class="row"><div><strong>Plano mensal de almoço</strong></div><div class="amt">R$ 450<small>,00</small></div></div>
    <div class="row"><div><strong>Complemento de jantar + lanches</strong><small>Escolha conforme a frequência de entrega</small></div>
      <div class="amt stack"><span>R$ 200</span><span>R$ 300</span><span>R$ 400</span></div></div>
    <div class="row"><div><strong>Ingredientes</strong></div><div class="amt soft">Pagos separadamente<br>pelo casal</div></div>
  </div>
  <div class="mini-table">
    <div class="mt-h">Valor mensal do serviço por modalidade</div>
    ${D.complemento.opcoes
      .slice()
      .reverse()
      .map((o) => `<div class="mt-r"><span>Almoço + ${o.nome.replace('Entrega ', 'entrega ')}</span><b>R$ ${450 + o.valor}</b></div>`)
      .join('')}
    <div class="mt-f">Ingredientes à parte</div>
  </div>`
);

// 11 — Cronograma
page(
  'crono',
  `
  ${kicker('05', 'Cronograma inicial')}
  <h2>Próximos<br><em>passos</em></h2>
  <ol class="timeline">
    ${D.cronograma
      .map((c, i) => `<li class="${i === 0 ? 'first' : ''}"><span class="dot"></span><div class="when">${c[0]}</div><strong>${c[1]}</strong><p>${c[2]}</p></li>`)
      .join('')}
  </ol>`
);

// 12 — Armazenamento
page(
  'store',
  `
  ${kicker('06', 'Armazenamento e entrega')}
  <h2>Do nosso fogão<br><em>para a sua casa</em></h2>
  <p class="body">${D.armazenamento}</p>
  <aside class="obs"><h3>Observação sobre o cardápio</h3><p>${D.observacao}</p></aside>`
);

// 13 — Encerramento
page(
  'closing',
  `
  <img class="cover-pot" src="${pot.redSoft}" alt="">
  <div class="close-logo"><img src="${logo.white}" alt="Caçarola Personal Chef"></div>
  <p class="motto">${D.assinatura}</p>
  <div class="cover-rule"></div>
  <div class="sig">${D.chef}</div>
  <a class="wa" href="${D.whatsLink}"><span>WhatsApp</span><b>${D.whats}</b></a>
  <div class="cover-foot"><span>Caçarola · Personal Chef</span><span>${TOTAL}<i>/</i>${TOTAL}</span></div>`,
  false
);

const css = `
${fontFaces}
@page{size:${W}px ${H}px;margin:0}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:#fff}
body{font-family:"Advent Pro",sans-serif;color:${INK};-webkit-print-color-adjust:exact;print-color-adjust:exact;font-feature-settings:"lnum","kern"}
.page{width:${W}px;height:${H}px;position:relative;overflow:hidden;padding:26px 30px 0;page-break-after:always;break-after:page;background:#fff}
.page:last-child{page-break-after:auto;break-after:auto}
em{font-style:normal;color:${RED}}
/* chrome */
.top{display:flex;justify-content:space-between;align-items:center;height:46px;margin-bottom:26px}
.mini{height:46px;width:auto}
.toplabel{font-size:10px;letter-spacing:.24em;text-transform:uppercase;color:#8A807D;font-weight:500}
.foot{position:absolute;left:30px;right:30px;bottom:22px;display:flex;justify-content:space-between;align-items:center;font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:#8A807D;font-weight:500;border-top:1px solid #EFE8E6;padding-top:12px}
.foot .pg{color:${RED};font-weight:600}
.foot i,.cover-foot i{font-style:normal;opacity:.45;margin:0 3px}
.kicker{display:flex;align-items:center;gap:10px;font-size:11px;letter-spacing:.26em;text-transform:uppercase;font-weight:600;color:${INK};margin-bottom:16px}
.kicker b{color:${RED};font-weight:600}
.kicker .rule{width:22px;height:1px;background:${RED}}
h2{font-weight:500;font-size:38px;line-height:1.02;letter-spacing:-.005em;margin-bottom:22px}
h3{font-size:12px;letter-spacing:.2em;text-transform:uppercase;font-weight:600;color:${RED};margin-bottom:6px}
.body{font-size:17px;line-height:1.5;font-weight:400;color:#3A3230}
/* cover */
.cover,.closing{background:${RED};color:#fff;padding:0}
.cover-pot{position:absolute;width:520px;right:-190px;bottom:-40px;opacity:.6}
.cover-logo{position:absolute;top:84px;left:0;right:0;display:flex;justify-content:center}
.cover-logo img{width:212px}
.cover-body{position:absolute;left:34px;right:34px;top:372px}
.eyebrow{font-size:11px;letter-spacing:.32em;text-transform:uppercase;font-weight:600;opacity:.9;margin-bottom:14px}
.cover h1{font-weight:300;font-size:46px;line-height:1;letter-spacing:-.01em}
.cover h1 span{font-weight:600}
.cover-rule{width:44px;height:1px;background:rgba(255,255,255,.8);margin:24px 0 18px}
.cover-body p{font-size:17px;line-height:1.45;font-weight:400;opacity:.95}
.cover-foot{position:absolute;left:34px;right:34px;bottom:26px;display:flex;justify-content:space-between;font-size:10px;letter-spacing:.24em;text-transform:uppercase;font-weight:500;border-top:1px solid rgba(255,255,255,.35);padding-top:12px}
/* intro */
.intro h2{font-size:40px}
.lead{font-size:18px;line-height:1.5;color:#3A3230;font-weight:400;border-left:2px solid ${RED};padding-left:16px}
.stats{position:absolute;left:30px;right:30px;bottom:76px;display:grid;grid-template-columns:repeat(3,1fr);border-top:1px solid ${INK}}
.stats div{padding:14px 0 0;}
.stats div+div{padding-left:14px;border-left:1px solid #EFE8E6}
.stats strong{display:block;font-weight:300;font-size:50px;line-height:1;color:${RED}}
.stats span{display:block;margin-top:6px;font-size:11px;letter-spacing:.16em;text-transform:uppercase;font-weight:600;line-height:1.35}
/* plano */
.price{display:flex;align-items:flex-start;color:${RED};margin:-4px 0 26px;border-bottom:1px solid ${INK};padding-bottom:18px}
.price .cur{font-size:22px;font-weight:500;margin-top:16px;margin-right:6px}
.price .val{font-size:120px;font-weight:300;line-height:.9;letter-spacing:-.03em}
.price .per{font-size:20px;font-weight:500;margin:16px 0 0 6px;line-height:1.15;color:${INK}}
.spec>div{padding:14px 0;border-bottom:1px solid #EFE8E6}
.spec dt{font-size:11px;letter-spacing:.22em;text-transform:uppercase;font-weight:600;color:${RED};margin-bottom:5px}
.spec dd{font-size:17px;line-height:1.4;color:#3A3230}
.spec dd strong{display:block;font-weight:600;font-size:20px;color:${INK}}
.spec dd small{display:block;font-size:15px;color:#6F6562;margin-top:2px}
/* menu */
.weekhead{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:1px solid ${INK};padding-bottom:16px;margin-bottom:4px}
.weekhead h2{margin:0;font-size:34px}
.weekno{font-size:13px;letter-spacing:.24em;text-transform:uppercase;font-weight:600;color:${RED};margin-bottom:6px}
.dots{display:flex;gap:5px;padding-bottom:8px}
.dots i{width:7px;height:7px;border-radius:50%;border:1px solid ${RED}}
.dots i.on{background:${RED}}
.days{list-style:none}
.days li{display:grid;grid-template-columns:46px 1fr;gap:6px;padding:15px 0;border-bottom:1px solid #EFE8E6}
.days li:last-child{border-bottom:0}
.day{font-size:12px;letter-spacing:.2em;text-transform:uppercase;font-weight:600;color:${RED};padding-top:4px}
.days strong{display:block;font-weight:600;font-size:19px;line-height:1.2}
.days small{display:block;font-size:15.5px;line-height:1.35;color:#6F6562;margin-top:4px}
.days small i{font-style:normal;color:${RED};margin:0 6px}
/* complemento */
.compo{list-style:none;margin-top:26px;border-top:1px solid ${INK}}
.compo li{display:grid;grid-template-columns:70px 1fr;align-items:center;padding:14px 0;border-bottom:1px solid #EFE8E6}
.compo b{font-weight:300;font-size:52px;line-height:1;color:${RED}}
.compo strong{display:block;font-size:20px;font-weight:600}
.compo small{display:block;font-size:15px;color:#6F6562;margin-top:2px;line-height:1.35}
.opts{display:grid;gap:8px;margin-bottom:16px}
.opt{border:1px solid #EADFDC;padding:11px 16px 12px;border-radius:2px}
.opt-top{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:5px}
.opt-top span:first-child{font-size:18px;font-weight:600}
.add{font-size:30px;font-weight:400;color:${RED};line-height:1}
.add small{font-size:13px;font-weight:600;margin-right:3px;vertical-align:6px}
.opt p{font-size:15px;line-height:1.4;color:#6F6562}
.notes{display:grid;gap:10px;border-top:1px solid ${INK};padding-top:14px}
.notes p{font-size:14.5px;line-height:1.45;color:#3A3230}
.freq h2{font-size:34px;margin-bottom:16px}
/* invest */
.ledger{border-top:1px solid ${INK}}
.ledger .row{display:grid;grid-template-columns:1fr auto;gap:14px;align-items:center;padding:16px 0;border-bottom:1px solid #EFE8E6}
.ledger strong{display:block;font-size:18px;font-weight:600;line-height:1.25}
.ledger small{display:block;font-size:14.5px;color:#6F6562;margin-top:3px;line-height:1.35}
.amt{font-size:30px;font-weight:400;color:${RED};text-align:right;white-space:nowrap}
.amt small{display:inline;font-size:16px;color:${RED}}
.amt.stack{display:flex;flex-direction:column;font-size:20px;line-height:1.2;font-weight:500}
.amt.soft{font-size:14px;color:#6F6562;font-weight:500;line-height:1.35;white-space:normal}
.mini-table{margin-top:22px;background:${RED};color:#fff;padding:16px 18px}
.mt-h{font-size:10.5px;letter-spacing:.22em;text-transform:uppercase;font-weight:600;opacity:.9;margin-bottom:8px}
.mt-r{display:flex;justify-content:space-between;align-items:baseline;padding:7px 0;border-bottom:1px solid rgba(255,255,255,.25);font-size:16px;font-weight:500}
.mt-r b{font-size:22px;font-weight:600}
.mt-f{font-size:12px;letter-spacing:.14em;text-transform:uppercase;margin-top:9px;opacity:.85;font-weight:500}
/* crono */
.timeline{list-style:none;position:relative;margin-top:6px;padding-left:28px}
.timeline:before{content:"";position:absolute;left:6px;top:8px;bottom:8px;width:1px;background:${RED}}
.timeline li{position:relative;padding-bottom:30px}
.timeline .dot{position:absolute;left:-28px;top:6px;width:13px;height:13px;border-radius:50%;background:#fff;border:1px solid ${RED}}
.timeline li.first .dot{background:${RED}}
.when{font-size:26px;font-weight:400;color:${RED};line-height:1.1}
.timeline strong{display:block;font-size:12px;letter-spacing:.22em;text-transform:uppercase;font-weight:600;margin:6px 0 4px}
.timeline p{font-size:17px;line-height:1.45;color:#3A3230}
/* store */
.obs{margin-top:24px;background:#FBF3F2;border-left:2px solid ${RED};padding:16px 18px}
.obs p{font-size:15.5px;line-height:1.45;color:#3A3230}
.store h2{font-size:34px}
/* closing */
.close-logo{position:absolute;top:150px;left:0;right:0;display:flex;justify-content:center}
.close-logo img{width:230px}
.motto{position:absolute;top:380px;left:34px;right:34px;text-align:center;font-size:27px;font-weight:300;line-height:1.2}
.closing .cover-rule{position:absolute;top:470px;left:50%;margin:0 0 0 -22px}
.sig{position:absolute;top:492px;left:0;right:0;text-align:center;font-size:12px;letter-spacing:.22em;text-transform:uppercase;font-weight:600}
.wa{position:absolute;top:545px;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;background:#fff;color:${RED};text-decoration:none;padding:12px 30px;border-radius:999px;white-space:nowrap}
.wa span{font-size:10px;letter-spacing:.26em;text-transform:uppercase;font-weight:600;color:${INK}}
.wa b{font-size:22px;font-weight:600;letter-spacing:.02em}
`;

const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Caçarola — Proposta Plano Mensal Personalizado</title><style>${css}</style></head><body>${pages.join('\n')}</body></html>`;

(async () => {
  fs.writeFileSync('proposta-pdf.html', html);
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await b.newPage({ viewport: { width: W, height: H } });
  await p.setContent(html, { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready);
  // Verifica conteúdo que transborda a página
  const over = await p.evaluate(() =>
    [...document.querySelectorAll('.page')].map((pg, i) => {
      const r = pg.getBoundingClientRect();
      const foot = pg.querySelector('.foot');
      const limit = foot ? foot.getBoundingClientRect().top : r.bottom;
      let max = 0;
      pg.querySelectorAll('*').forEach((el) => {
        if (el.closest('.foot') || el.classList.contains('cover-pot') || el.closest('.stats') || el.closest('.cover-foot')) return;
        max = Math.max(max, el.getBoundingClientRect().bottom);
      });
      return { page: i + 1, free: Math.round(limit - max) };
    })
  );
  console.log(JSON.stringify(over));
  await p.pdf({ path: 'Proposta_Cacarola_Plano_Mensal.pdf', width: W + 'px', height: H + 'px', printBackground: true, preferCSSPageSize: true });
  await b.close();
})();
