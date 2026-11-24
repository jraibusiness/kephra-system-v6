// Proposta Ceia de Natal — Caçarola Personal Chef. HTML para celular com rolagem horizontal.
// Texto revisado a partir do PDF "Proposta de Serviço: Ceia de Natal".
const fs = require('fs');
const { fontFaces, logo, pot, RED, INK } = require('./common');

const WHATS = '(11) 98855-0641';
const WA_BASE = 'https://wa.me/5511988550641?text=';
const waIconPath = fs.readFileSync(__dirname + '/web.js', 'utf8').match(/<path fill="\$\{c\}" d="([^"]+)"/)[1];
const waIcon = (c, s = 22) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}" aria-hidden="true" style="color:${c}"><use href="#wa"/></svg>`;

const I = {
  menu: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4h6v3H9zM8.5 11h7M8.5 15h5"/>',
  cart: '<path d="M3 4h2l2.4 10.2a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.8L20 8H6.2"/><circle cx="9" cy="19" r="1.3"/><circle cx="17" cy="19" r="1.3"/>',
  cloche: '<path d="M3 17.5h18M5 17.5a7 7 0 0 1 14 0M12 8.5V6.5M10.5 6.5h3"/>',
  flame: '<path d="M12 3c2 3 5 5 5 9a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5.3 1.5 1 2.5 2 3 0-3 .5-5.5 1-7.5z"/>',
  team: '<circle cx="9" cy="8" r="3"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><circle cx="17" cy="9" r="2.4"/><path d="M15.5 14.2A4.5 4.5 0 0 1 21 18.5"/>',
  clean: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
  cal: '<rect x="3.5" y="5" width="17" height="15" rx="1.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  xcirc: '<circle cx="12" cy="12" r="8.5"/><path d="M9 9l6 6M15 9l-6 6"/>',
  guests: '<circle cx="12" cy="8" r="3.2"/><path d="M5.5 20a6.5 6.5 0 0 1 13 0"/>',
  stove: '<rect x="4" y="3.5" width="16" height="17" rx="2"/><path d="M4 9h16M8 6.2h.01M12 6.2h.01M7.5 13h9v4.5h-9z"/>',
  pay: '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18M7 14.5h4"/>',
  minus: '<circle cx="12" cy="12" r="8.5"/><path d="M8 12h8"/>',
  pin: '<path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
  user: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/>',
  phone: '<path d="M7 3h10a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM10.5 18h3"/>',
  seal: '<path d="M12 3l2.2 1.6 2.7-.1.8 2.6 2.2 1.6-.9 2.6.9 2.6-2.2 1.6-.8 2.6-2.7-.1L12 21l-2.2-1.6-2.7.1-.8-2.6-2.2-1.6.9-2.6-.9-2.6 2.2-1.6.8-2.6 2.7.1z"/><path d="M9 12l2 2 4-4"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
};
const ic = (k, c = RED, s = 22) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="${c}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[k]}</svg>`;
const star = (cls) => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 1.5l1.9 7.6 7.6 1.9-7.6 1.9L12 20.5l-1.9-7.6L2.5 11l7.6-1.9z"/></svg>`;

const brl = (n) => 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });

// ——— Conteúdo revisado ———
const OPCOES = {
  A: { nome: 'Buffet', valor: 3875, equipe: 'Chef + auxiliar de cozinha + 1 garçom', desc: 'Pratos dispostos na mesa, com um garçom reabastecendo e apoiando o serviço.' },
  B: { nome: 'Empratado', valor: 4325, equipe: 'Chef + auxiliar de cozinha + 2 garçons', desc: 'Cada prato é montado e servido à mesa, com dois garçons no salão.' },
};
const OPC = [
  { id: 'ps', nome: 'Personal shopper', desc: 'Compra e conferência de todos os ingredientes', valor: 450, txt: 'R$ 450' },
  { id: 'pp', nome: 'Pré-preparo no dia anterior', desc: 'Realizado em 23/12', valor: 600, txt: 'R$ 600' },
  { id: 'lc', nome: 'Coordenação do aluguel de louça', desc: 'Pedido, conferência e devolução', valor: null, txt: '10% do valor da locação' },
];

const slides = [];
const add = (id, title, cls, body) => slides.push({ id, title, cls, body });

add('capa', 'Capa', 'red cover', () => `
  ${star('orn o1')}${star('orn o2')}${star('orn o3')}
  <img class="cover-pot" src="${pot.redSoft}" alt="">
  <div class="cover-logo rv" style="--i:0"><img src="${logo.white}" alt="Caçarola Personal Chef"></div>
  <div class="cover-body">
    <div class="eyebrow rv" style="--i:1">Proposta de serviço</div>
    <h1 class="rv" style="--i:2">Ceia <span>de Natal</span></h1>
    <div class="hrule rv" style="--i:3"></div>
    <p class="rv" style="--i:4">Para Tânia<br>24 de dezembro de 2026 · Curitiba/PR</p>
  </div>
  <a class="swipe rv" style="--i:5" href="#evento">Deslize para o lado <span aria-hidden="true">→</span></a>`);

add('evento', 'O evento', '', () => `
  <div class="kicker rv" style="--i:0"><b>—</b><span class="rule"></span><span>O evento</span></div>
  <h2 class="rv" style="--i:1">Uma noite <em>para 16 pessoas.</em></h2>
  <dl class="facts">
    ${[
      ['user', 'Cliente', 'Tânia'],
      ['cal', 'Data', '24/12/2026 · quinta-feira'],
      ['pin', 'Local', 'Curitiba/PR'],
      ['guests', 'Convidados', '16 pessoas'],
      ['phone', 'Responsável', `Mariana Araújo · ${WHATS}`],
      ['seal', 'Validade da proposta', '01/12/2026'],
    ].map((f, i) => `<div class="rv" style="--i:${i + 2}"><span class="ico">${ic(f[0])}</span><dt>${f[1]}</dt><dd>${f[2]}</dd></div>`).join('')}
  </dl>`);

add('sobre', 'Sobre o serviço', '', () => `
  <div class="kicker rv" style="--i:0"><b>01</b><span class="rule"></span><span>Sobre o serviço</span></div>
  <h2 class="rv" style="--i:1">Ceia de Natal, <em>do antepasto à sobremesa.</em></h2>
  <p class="body rv j" style="--i:2">Mesa de frios e antepastos, duas saladas de entrada e <em>10 preparações</em> entre pratos principais e sobremesas. O cardápio será definido <b>em conjunto com a cliente</b>, considerando preferências e restrições alimentares.</p>
  <div class="stats rv" style="--i:3">
    <div><strong>16</strong><span>convidados</span></div>
    <div><strong>10</strong><span>preparações</span></div>
    <div><strong>3h</strong><span>de serviço</span></div>
  </div>`);

add('cardapio', 'Cardápio', '', () => `
  <div class="kicker rv" style="--i:0"><b>02</b><span class="rule"></span><span>Cardápio</span></div>
  <h2 class="rv" style="--i:1">Pratos principais <em>e sobremesas.</em></h2>
  <ul class="nums">
    <li class="rv" style="--i:2"><b>3</b><div><strong>proteínas</strong><small>Pernil e mais duas opções, a definir com a cliente</small></div></li>
    <li class="rv" style="--i:3"><b>5</b><div><strong>acompanhamentos</strong></div></li>
    <li class="rv" style="--i:4"><b>2</b><div><strong>sobremesas</strong></div></li>
  </ul>
  <p class="total-line rv" style="--i:5"><span>Total</span><b>10 preparações</b></p>`);

add('bonus', 'Bônus de primeira contratação', 'red', () => `
  ${star('orn o4')}${star('orn o5')}
  <div class="kicker light rv" style="--i:0"><b>✦</b><span class="rule"></span><span>Bônus de primeira contratação</span></div>
  <h2 class="rv" style="--i:1">Cortesia desta <span class="soft">primeira contratação.</span></h2>
  <ul class="gifts">
    <li class="rv" style="--i:2"><span class="g-n">1</span><strong>Mesa de frios e antepastos</strong></li>
    <li class="rv" style="--i:3"><span class="g-n">2</span><strong>Duas saladas de entrada</strong></li>
  </ul>
  <p class="body light rv j" style="--i:4">A elaboração e a execução da mesa de frios e antepastos e das duas saladas de entrada são uma cortesia desta primeira contratação, <b>sem custo adicional</b>.</p>`);

add('incluido', 'O que está incluído', '', () => `
  <div class="kicker rv" style="--i:0"><b>03</b><span class="rule"></span><span>O que está incluído</span></div>
  <h2 class="rv" style="--i:1">Do cardápio <em>à cozinha organizada.</em></h2>
  <ul class="ilist">
    ${[
      ['menu', 'Elaboração e aprovação do cardápio'],
      ['cart', 'Lista detalhada de compras dos ingredientes'],
      ['cloche', 'Preparo, finalização e montagem da mesa de frios'],
      ['flame', 'Execução dos pratos quentes e das sobremesas'],
      ['team', 'Equipe de apoio no dia: auxiliar de cozinha e garçons, conforme a opção'],
      ['clean', 'Organização da cozinha ao final do serviço'],
    ].map((x, i) => `<li class="rv" style="--i:${i + 2}"><span class="ico">${ic(x[0])}</span><span>${x[1]}</span></li>`).join('')}
  </ul>`);

add('opcoes', 'Opções de contratação', '', () => `
  <div class="kicker rv" style="--i:0"><b>04</b><span class="rule"></span><span>Opções de contratação</span></div>
  <h2 class="rv" style="--i:1">Dois formatos <em>de serviço.</em></h2>
  <div class="plans">
    ${['A', 'B'].map((k, i) => { const o = OPCOES[k]; return `
    <article class="plan rv" style="--i:${i + 2}">
      <div class="plan-top"><span class="plan-k">Opção ${k}</span><span class="plan-n">${o.nome}</span></div>
      <div class="plan-v"><small>R$</small>${o.valor.toLocaleString('pt-BR')}<span>valor total</span></div>
      <div class="plan-team">${ic('team', RED, 18)}<span>${o.equipe}</span></div>
      <p>${o.desc}</p>
    </article>`; }).join('')}
  </div>`);

add('opcionais', 'Serviços opcionais', '', () => `
  <div class="kicker rv" style="--i:0"><b>05</b><span class="rule"></span><span>Serviços opcionais</span></div>
  <h2 class="rv" style="--i:1">Serviços <em>opcionais.</em></h2>
  <ul class="plist">
    ${OPC.map((o, i) => `<li class="rv" style="--i:${i + 2}"><div><strong>${o.nome}</strong><small>${o.desc}</small></div><b class="${o.valor ? '' : 'pct'}">${o.txt}</b></li>`).join('')}
  </ul>`);

add('nao-incluido', 'Não está incluído', '', () => `
  <div class="kicker rv" style="--i:0"><b>06</b><span class="rule"></span><span>Não está incluído</span></div>
  <h2 class="rv" style="--i:1">Por conta <em>da cliente.</em></h2>
  <ul class="ilist muted">
    ${[
      ['Ingredientes e bebidas', ''],
      ['Aluguel de louça, talheres e taças', 'Estimativa de R$ 25 a R$ 45 por pessoa, ou de R$ 400 a R$ 720 no total'],
      ['Decoração e arranjos', ''],
      ['Horas extras além do horário combinado', ''],
    ].map((x, i) => `<li class="rv" style="--i:${i + 2}"><span class="ico">${ic('minus', '#8A807D')}</span><span><strong>${x[0]}</strong>${x[1] ? `<small>${x[1]}</small>` : ''}</span></li>`).join('')}
  </ul>`);

const cond = (items, start) => items.map((x, i) => `<li class="rv" style="--i:${i + start}"><span class="ico">${ic(x[0])}</span><div><strong>${x[1]}</strong><p>${x[2]}</p></div></li>`).join('');
add('condicoes', 'Condições', '', () => `
  <div class="kicker rv" style="--i:0"><b>07</b><span class="rule"></span><span>Condições · 1 de 2</span></div>
  <h2 class="rv" style="--i:1">Condições <em>do serviço.</em></h2>
  <ul class="clist">${cond([
    ['cal', 'Reserva da data', 'Sinal de <em>50% na confirmação</em> e saldo até 24 horas antes do evento.'],
    ['clock', 'Horário do serviço', 'Das 21h à meia-noite (3 horas de serviço). O preparo e a montagem anteriores a esse horário estão incluídos no valor. Hora extra após a meia-noite: <b>R$ 150 por hora</b>.'],
    ['xcirc', 'Cancelamento', 'O sinal não é reembolsável em cancelamentos com menos de 15 dias de antecedência.'],
  ], 2)}</ul>`);

add('condicoes-2', 'Condições (continuação)', '', () => `
  <div class="kicker rv" style="--i:0"><b>07</b><span class="rule"></span><span>Condições · 2 de 2</span></div>
  <h2 class="rv" style="--i:1">Condições <em>do serviço.</em></h2>
  <ul class="clist">${cond([
    ['guests', 'Número de convidados', 'Alterações devem ser informadas até 7 dias antes do evento.'],
    ['stove', 'Cozinha', 'A cliente deve disponibilizar fogão, forno e geladeira em bom funcionamento, além de bancadas para o preparo.'],
    ['pay', 'Pagamento', 'Pix ou transferência bancária.'],
  ], 2)}</ul>`);

add('escolha', 'Sua escolha', '', () => `
  <div class="kicker rv" style="--i:0"><b>08</b><span class="rule"></span><span>Resumo para aprovação</span></div>
  <h2 class="rv" style="--i:1">Monte <em>a sua escolha.</em></h2>
  <fieldset class="rv" style="--i:2"><legend>Opção</legend>
    <div class="pick2">
      ${['A', 'B'].map((k) => `<label class="pk"><input type="radio" name="opt" id="o${k}" value="${k}"><span class="pk-box"><span class="pk-k">Opção ${k}</span><span class="pk-n">${OPCOES[k].nome}</span><span class="pk-v">${brl(OPCOES[k].valor)}</span><span class="pk-tick">${ic('check', '#fff', 14)}</span></span></label>`).join('')}
    </div>
  </fieldset>
  <fieldset class="rv" style="--i:3"><legend>Opcionais</legend>
    ${OPC.map((o) => `<label class="tg"><input type="checkbox" class="opcional" id="${o.id}" value="${o.id}"><span class="tg-box"><span class="tg-n">${o.nome}</span><span class="tg-v">${o.valor ? '+ ' + o.txt : o.txt}</span><span class="tg-sw" aria-hidden="true"></span></span></label>`).join('')}
  </fieldset>
  <p class="hint rv" style="--i:4">Toque para selecionar. O resumo aparece no próximo slide.</p>`);

// Combinações para o resumo funcionar sem JavaScript (CSS :has)
const combos = [];
for (const k of ['A', 'B']) for (const ps of [0, 1]) for (const pp of [0, 1]) {
  const total = OPCOES[k].valor + (ps ? 450 : 0) + (pp ? 600 : 0);
  combos.push({ key: `${k}${ps}${pp}`, k, ps, pp, total, sinal: total / 2 });
}
const waMsg = (k, ps, pp, lc) => {
  const c = combos.find((x) => x.key === `${k}${ps}${pp}`);
  const ops = [ps && 'Personal shopper', pp && 'Pré-preparo no dia anterior (23/12)', lc && 'Coordenação do aluguel de louça (10% do valor da locação)'].filter(Boolean);
  return WA_BASE + encodeURIComponent(`Olá, Mariana! Quero seguir com a proposta da Ceia de Natal (24/12).\n\nOpção: ${k} · ${OPCOES[k].nome}\nOpcionais: ${ops.length ? ops.join('; ') : 'nenhum'}\nTotal: ${brl(c.total)}${lc ? ' + 10% do valor da locação de louça' : ''}\nSinal (50%): ${brl(c.sinal)}`);
};
const WA_GENERIC = WA_BASE + encodeURIComponent('Olá, Mariana! Recebi a proposta da Ceia de Natal (24/12) e gostaria de conversar.');

add('resumo', 'Resumo para aprovação', '', () => `
  <div class="kicker rv" style="--i:0"><b>08</b><span class="rule"></span><span>Resumo para aprovação</span></div>
  <h2 class="rv" style="--i:1">Resumo <em>da sua escolha.</em></h2>
  <dl class="sum rv" style="--i:2">
    <div><dt>Opção escolhida</dt><dd>
      <span class="s-none">Nenhuma opção selecionada</span>
      ${['A', 'B'].map((k) => `<span class="s-opt" data-o="${k}">${k} · ${OPCOES[k].nome}</span>`).join('')}
    </dd></div>
    <div><dt>Opcionais escolhidos</dt><dd>
      <span class="s-noop">Nenhum</span>
      ${OPC.map((o) => `<span class="s-op" data-op="${o.id}">${o.nome}</span>`).join('')}
    </dd></div>
  </dl>
  <div class="tot-card rv" style="--i:3" aria-live="polite">
    <div class="tot tot-none"><span class="t-h">Total</span><span class="t-msg">Escolha a opção A ou B no slide anterior.</span></div>
    ${combos.map((c) => `<div class="tot" data-k="${c.key}"><span class="t-h">Total</span><span class="t-v">${brl(c.total)}</span><span class="t-s">Sinal (50%): <b>${brl(c.sinal)}</b></span></div>`).join('')}
    <div class="tot tot-js" hidden><span class="t-h">Total</span><span class="t-v" id="jsv"></span><span class="t-s">Sinal (50%): <b id="jss"></b></span></div>
    <p class="t-lc">+ 10% do valor da locação de louça</p>
  </div>
  <div class="cta-wrap rv" style="--i:4">
    <a class="wa-btn wa-none" href="${WA_GENERIC}" target="_blank" rel="noopener">${waIcon(RED)}<span><small>Fale com a Mariana</small>WhatsApp ${WHATS}</span></a>
    ${['A', 'B'].flatMap((k) => [0, 1].flatMap((ps) => [0, 1].flatMap((pp) => [0, 1].map((lc) =>
      `<a class="wa-btn wa-k" data-w="${k}${ps}${pp}${lc}" href="${waMsg(k, ps, pp, lc)}" target="_blank" rel="noopener">${waIcon(RED)}<span><small>Enviar minha escolha</small>pelo WhatsApp</span></a>`)))).join('')}
    <a class="wa-btn wa-js" id="wajs" hidden href="${WA_GENERIC}" target="_blank" rel="noopener">${waIcon(RED)}<span><small>Enviar minha escolha</small>pelo WhatsApp</span></a>
  </div>
  <p class="valid rv" style="--i:5">Proposta válida até 01/12/2026.</p>
  <div class="print-only sign">De acordo: ______________________________ &nbsp; Data: ____/____/________</div>`);

add('fim', 'Encerramento', 'red closing', () => `
  ${star('orn o6')}${star('orn o7')}
  <img class="cover-pot" src="${pot.redSoft}" alt="">
  <div class="close-in">
    <div class="eyebrow rv" style="--i:0">Boas festas</div>
    <img class="close-logo rv" style="--i:1" src="${logo.white}" alt="Caçarola Personal Chef">
    <p class="motto rv" style="--i:2">comida de verdade, feita com carinho e técnica.</p>
    <div class="hrule rv" style="--i:3"></div>
    <div class="sig rv" style="--i:4">Mariana Araújo · Chef de Cozinha</div>
    <a class="wa-light rv" style="--i:5" href="${WA_GENERIC}" target="_blank" rel="noopener">${waIcon('#fff')}<span><small>Fale comigo no WhatsApp</small>${WHATS}</span></a>
  </div>`);

const N = slides.length;
const pad = (n) => String(n).padStart(2, '0');

const renderSlide = (s, i) => {
  const n = i + 1, red = /\bred\b/.test(s.cls);
  const prev = i > 0 ? `<a class="nav prev" href="#${slides[i - 1].id}" aria-label="Anterior: ${slides[i - 1].title}">‹</a>` : '<span class="nav ghost"></span>';
  const next = i < N - 1 ? `<a class="nav next" href="#${slides[i + 1].id}" aria-label="Próximo: ${slides[i + 1].title}">›</a>` : `<a class="nav next" href="#${slides[0].id}" aria-label="Voltar ao início">↺</a>`;
  const seg = slides.map((_, k) => `<i class="${k === i ? 'on' : k < i ? 'past' : ''}"></i>`).join('');
  return `
<section class="slide ${s.cls}" id="${s.id}" aria-roledescription="slide" aria-label="${n} de ${N}: ${s.title}">
  ${s.cls.includes('cover') ? '' : `<header class="sh"><span class="lg ${red ? 'lg-w' : 'lg-r'}" role="img" aria-label="Caçarola Personal Chef"></span><span class="sh-r">Ceia de Natal · <b>${pad(n)}</b> / ${pad(N)}</span></header>`}
  <div class="sc"><div class="sc-in">${s.body()}</div></div>
  <footer class="sf">${prev}<div class="seg" aria-hidden="true">${seg}</div>${next}</footer>
</section>`;
};

// CSS das combinações (resumo sem JavaScript)
const has = (sel, on) => (on ? `:has(${sel}:checked)` : `:not(:has(${sel}:checked))`);
const comboCss = [
  ...combos.map((c) => `.deck:has(#o${c.k}:checked)${has('#ps', c.ps)}${has('#pp', c.pp)} .tot[data-k="${c.key}"]{display:flex}`),
  ...['A', 'B'].flatMap((k) => [0, 1].flatMap((ps) => [0, 1].flatMap((pp) => [0, 1].map((lc) =>
    `.deck:has(#o${k}:checked)${has('#ps', ps)}${has('#pp', pp)}${has('#lc', lc)} .wa-k[data-w="${k}${ps}${pp}${lc}"]{display:flex}`)))),
  '.deck:has(input[name=opt]:checked) .tot-none,.deck:has(input[name=opt]:checked) .wa-none,.deck:has(input[name=opt]:checked) .s-none{display:none}',
  ...['A', 'B'].map((k) => `.deck:has(#o${k}:checked) .s-opt[data-o="${k}"]{display:inline-flex}`),
  ...OPC.map((o) => `.deck:has(#${o.id}:checked) .s-op[data-op="${o.id}"]{display:inline-flex}`),
  '.deck:has(.opcional:checked) .s-noop{display:none}',
  '.deck:has(#lc:checked):has(input[name=opt]:checked) .t-lc{display:block}',
].join('\n');

const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="${RED}">
<meta name="color-scheme" content="light">
<meta name="format-detection" content="telephone=no">
<title>Caçarola — Proposta Ceia de Natal · Tânia</title>
<meta name="description" content="Proposta de serviço da Caçarola Personal Chef: Ceia de Natal para 16 pessoas, 24 de dezembro de 2026, em Curitiba/PR.">
<link rel="icon" href="${pot.red}">
<style>
${fontFaces}
:root{--red:${RED};--ink:${INK};--body:#3A3230;--muted:#6F6562;--line:#EFE8E6;--blush:#FBF3F2;--g:clamp(22px,6vw,40px)}
*{box-sizing:border-box;margin:0;padding:0;hyphens:manual;-webkit-hyphens:manual}
html,body{height:100%;background:#fff;overflow:hidden;overscroll-behavior:none}
body{font-family:"Advent Pro",system-ui,sans-serif;color:var(--ink);font-size:17px;line-height:1.5;font-feature-settings:"lnum","kern";-webkit-font-smoothing:antialiased;-webkit-text-size-adjust:100%}
em{font-style:normal;color:var(--red)}
b,strong{font-weight:600}
a{color:inherit}
.nb{white-space:nowrap}
.j{text-align:justify;text-align-last:left}.jl{text-align:left}
h1,h2,h3{text-wrap:wrap}

/* ——— trilho horizontal ——— */
.deck{display:flex;height:100vh;height:100svh;width:100vw;overflow-x:auto;overflow-y:hidden;scroll-snap-type:x mandatory;scroll-behavior:smooth;-webkit-overflow-scrolling:touch;scrollbar-width:none;overscroll-behavior-x:contain}
.deck::-webkit-scrollbar{display:none}
.slide{position:relative;flex:0 0 100vw;width:100vw;height:100%;scroll-snap-align:start;scroll-snap-stop:always;display:flex;flex-direction:column;overflow:hidden;background:#fff}
.slide:before{content:"";position:absolute;width:300px;height:300px;right:-170px;top:-150px;border-radius:50%;border:1px solid rgba(227,29,38,.08);box-shadow:0 0 0 28px rgba(227,29,38,.025);pointer-events:none}
.slide.red{background:var(--red);color:#fff}
.slide.red:before{border-color:rgba(255,255,255,.14);box-shadow:0 0 0 28px rgba(255,255,255,.04)}
.sh{flex:none;display:flex;justify-content:space-between;align-items:center;padding:max(14px,env(safe-area-inset-top)) var(--g) 0;height:auto;min-height:58px}
.lg{display:block;height:48px;width:73px;background:no-repeat left center/contain}
.lg-r{background-image:url(${logo.red})}.lg-w{background-image:url(${logo.white})}
.sh-r{font-size:10.5px;letter-spacing:.22em;text-transform:uppercase;font-weight:500;color:#8A807D}
.sh-r b{color:var(--red)}
.red .sh-r,.red .sh-r b{color:#fff}
.sc{flex:1;min-height:0;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;display:flex;flex-direction:column;padding:0 var(--g);overscroll-behavior-y:contain;scrollbar-width:none}
.sc::-webkit-scrollbar{display:none}
.sc-in{width:100%;max-width:520px;margin:auto;padding:12px 0 18px;position:static}
.sc-in>*:not(.cover-pot):not(.orn){position:relative;z-index:1}
.sf{flex:none;display:flex;align-items:center;gap:14px;padding:8px var(--g) max(14px,env(safe-area-inset-bottom))}
.nav{flex:none;width:44px;height:44px;border-radius:50%;border:1px solid rgba(227,29,38,.4);color:var(--red);display:flex;align-items:center;justify-content:center;font-size:24px;line-height:1;text-decoration:none;padding-bottom:3px;-webkit-tap-highlight-color:transparent;transition:background .25s,color .25s}
.nav.next{background:var(--red);color:#fff;border-color:var(--red)}
.nav.ghost,.red .nav.ghost{visibility:hidden}
.red .nav{border-color:rgba(255,255,255,.6);color:#fff}
.red .nav.next{background:#fff;color:var(--red);border-color:#fff}
.seg{flex:1;display:flex;gap:4px}
.seg i{flex:1;height:2px;background:rgba(227,29,38,.16);border-radius:2px}
.seg i.past{background:rgba(227,29,38,.45)}
.seg i.on{background:var(--red);height:3px}
.red .seg i{background:rgba(255,255,255,.3)}.red .seg i.past{background:rgba(255,255,255,.6)}.red .seg i.on{background:#fff}

/* ——— tipografia ——— */
.kicker{display:flex;align-items:center;gap:10px;font-size:11px;letter-spacing:.26em;text-transform:uppercase;font-weight:600;margin-bottom:14px}
.kicker b{color:var(--red)}
.kicker .rule{width:24px;height:1px;background:var(--red)}
.kicker.light,.kicker.light b{color:#fff}.kicker.light .rule{background:#fff}
h2{font-weight:500;font-size:clamp(31px,8.8vw,46px);line-height:1.02;letter-spacing:-.005em;margin-bottom:22px}
.red h2 .soft{font-weight:300;display:inline}
.body{font-size:18px;line-height:1.55;color:var(--body)}
.body.light{color:#fff;opacity:.95}
.red em{color:#fff;text-decoration:underline;text-underline-offset:4px;text-decoration-thickness:1px}
.ico{flex:none;width:40px;height:40px;border-radius:50%;background:var(--blush);display:inline-flex;align-items:center;justify-content:center}

/* capa */
.cover .sc-in{min-height:100%;display:flex;flex-direction:column;padding-top:max(22px,env(safe-area-inset-top))}
.cover-logo{flex:1;display:flex;align-items:center;justify-content:center;min-height:150px}
.cover-logo img{width:min(58vw,250px)}
.cover-body{padding-bottom:6px}
.eyebrow{font-size:11.5px;letter-spacing:.34em;text-transform:uppercase;font-weight:600;opacity:.95;margin-bottom:12px}
.cover h1{font-weight:300;font-size:clamp(56px,17vw,92px);line-height:.95;letter-spacing:-.02em}
.cover h1 span{display:block;font-weight:600}
.hrule{width:46px;height:1px;background:rgba(255,255,255,.85);margin:22px 0 16px}
.cover-body p{font-size:18px;line-height:1.45}
.swipe{display:inline-flex;align-items:center;gap:10px;margin-top:26px;font-size:11.5px;letter-spacing:.26em;text-transform:uppercase;font-weight:600;text-decoration:none;border-top:1px solid rgba(255,255,255,.35);padding-top:14px;width:100%}
.swipe span{display:inline-block;font-size:18px;letter-spacing:0;animation:nudge 1.8s ease-in-out infinite}
@keyframes nudge{0%,100%{transform:translateX(0)}50%{transform:translateX(8px)}}
.cover-pot{position:absolute;width:min(130vw,640px);right:-34%;bottom:-6%;pointer-events:none}
.orn{position:absolute;color:#fff;opacity:.22;pointer-events:none}
.o1{width:18px;top:12%;left:12%}.o2{width:11px;top:20%;right:16%;opacity:.3}.o3{width:8px;top:31%;left:24%;opacity:.35}
.o4{width:16px;top:16%;right:12%}.o5{width:9px;bottom:26%;left:10%;opacity:.3}
.o6{width:16px;top:14%;left:14%}.o7{width:10px;top:24%;right:18%;opacity:.3}

/* evento */
.facts>div{display:grid;grid-template-columns:40px 1fr;column-gap:14px;align-items:center;padding:9px 0;border-bottom:1px solid var(--line)}
.facts>div:last-child{border-bottom:0}
.facts .ico{grid-row:span 2}
.facts dt{font-size:10.5px;letter-spacing:.22em;text-transform:uppercase;font-weight:600;color:var(--red)}
.facts dd{font-size:17.5px;font-weight:500;line-height:1.3}

/* sobre */
.stats{display:grid;grid-template-columns:repeat(3,1fr);border-top:1px solid var(--ink);margin-top:28px}
.stats div{padding-top:14px}
.stats div+div{padding-left:14px;border-left:1px solid var(--line)}
.stats strong{display:block;font-weight:300;font-size:clamp(46px,13vw,64px);line-height:1;color:var(--red)}
.stats span{display:block;margin-top:6px;font-size:11px;letter-spacing:.16em;text-transform:uppercase;font-weight:600}

/* cardápio */
.nums{list-style:none;border-top:1px solid var(--ink)}
.nums li{display:grid;grid-template-columns:70px 1fr;align-items:center;padding:14px 0;border-bottom:1px solid var(--line)}
.nums b{font-weight:300;font-size:62px;line-height:1;color:var(--red)}
.nums strong{display:block;font-size:22px;font-weight:600;line-height:1.2}
.nums small{display:block;font-size:16px;color:var(--muted);margin-top:3px;line-height:1.35}
.total-line{display:flex;justify-content:space-between;align-items:baseline;margin-top:16px;font-size:11px;letter-spacing:.24em;text-transform:uppercase;font-weight:600}
.total-line b{font-size:22px;letter-spacing:0;text-transform:none;color:var(--red);font-weight:500}

/* bônus */
.gifts{list-style:none;margin:4px 0 22px;border-top:1px solid rgba(255,255,255,.5)}
.gifts li{display:flex;align-items:center;gap:16px;padding:16px 0;border-bottom:1px solid rgba(255,255,255,.3)}
.g-n{flex:none;width:40px;height:40px;border-radius:50%;border:1px solid rgba(255,255,255,.7);display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:500}
.gifts strong{font-size:22px;font-weight:500;line-height:1.2}

/* listas com ícone */
.ilist{list-style:none}
.ilist li{display:flex;align-items:center;gap:14px;padding:10px 0;border-bottom:1px solid var(--line);font-size:17.5px;line-height:1.35;color:var(--body)}
.ilist li:last-child{border-bottom:0}
.ilist strong{display:block;font-weight:500;color:var(--ink)}
.ilist small{display:block;font-size:15px;color:var(--muted);margin-top:2px;line-height:1.4}
.ilist.muted .ico{background:#F6F2F1}

/* opções */
.plans{display:grid;gap:10px}
.plan{border:1px solid #E6DCD9;padding:13px 16px 13px;position:relative;background:#fff}
.plan:first-child{border-top:3px solid var(--red)}
.plan+.plan{border-top:3px solid var(--ink)}
.plan-top{display:flex;align-items:baseline;gap:10px}
.plan-k{font-size:10.5px;letter-spacing:.24em;text-transform:uppercase;font-weight:600;color:var(--red)}
.plan-n{font-size:23px;font-weight:600}
.plan-v{display:flex;align-items:flex-start;gap:4px;color:var(--red);font-size:40px;font-weight:300;line-height:1;margin:4px 0 8px;letter-spacing:-.02em}
.plan-v small{font-size:16px;font-weight:500;margin-top:7px;letter-spacing:0}
.plan-v span{align-self:flex-end;font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;font-weight:600;color:var(--muted);margin:0 0 7px 8px}
.plan-team{display:flex;align-items:center;gap:8px;font-size:15px;font-weight:500;padding:6px 0;border-top:1px solid var(--line);border-bottom:1px solid var(--line);margin-bottom:8px}
.plan p{font-size:15px;line-height:1.4;color:var(--muted)}

/* opcionais */
.plist{list-style:none;border-top:1px solid var(--ink)}
.plist li{display:grid;grid-template-columns:1fr auto;gap:14px;align-items:center;padding:16px 0;border-bottom:1px solid var(--line)}
.plist strong{display:block;font-size:19.5px;font-weight:600;line-height:1.2}
.plist small{display:block;font-size:15.5px;color:var(--muted);margin-top:3px;line-height:1.35}
.plist b{font-size:28px;font-weight:400;color:var(--red);white-space:nowrap}
.plist b.pct{font-size:15px;font-weight:600;line-height:1.25;text-align:right;white-space:normal;max-width:120px}

/* condições */
.clist{list-style:none}
.clist li{display:flex;gap:14px;padding:12px 0;border-bottom:1px solid var(--line)}
.clist li:last-child{border-bottom:0}
.clist strong{display:block;font-size:12px;letter-spacing:.2em;text-transform:uppercase;font-weight:600;color:var(--ink);margin:2px 0 4px}
.clist p{font-size:16.5px;line-height:1.45;color:var(--body)}

/* escolha */
fieldset{border:0;margin-bottom:14px}
legend{font-size:11px;letter-spacing:.24em;text-transform:uppercase;font-weight:600;color:var(--red);margin-bottom:10px}
.pick2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.pk,.tg{display:block;cursor:pointer;-webkit-tap-highlight-color:transparent;position:relative}
.pk input,.tg input{position:absolute;opacity:0;width:1px;height:1px}
.pk-box{display:flex;flex-direction:column;border:1px solid #E3D8D5;padding:14px 14px 12px;position:relative;transition:border-color .25s,background .25s}
.pk-k{font-size:10.5px;letter-spacing:.22em;text-transform:uppercase;font-weight:600;color:var(--red)}
.pk-n{font-size:21px;font-weight:600;margin:2px 0 4px}
.pk-v{font-size:24px;font-weight:300;color:var(--red)}
.pk-tick{position:absolute;top:10px;right:10px;width:22px;height:22px;border-radius:50%;border:1px solid #D9CCC9;display:flex;align-items:center;justify-content:center}
.pk-tick svg{opacity:0}
.pk input:checked+.pk-box{border-color:var(--red);background:var(--blush)}
.pk input:checked+.pk-box .pk-tick{background:var(--red);border-color:var(--red)}
.pk input:checked+.pk-box .pk-tick svg{opacity:1}
.pk input:focus-visible+.pk-box,.tg input:focus-visible+.tg-box{outline:2px solid var(--red);outline-offset:3px}
.tg-box{display:grid;grid-template-columns:1fr auto;grid-template-areas:"n sw" "v sw";column-gap:14px;align-items:center;padding:10px 0;border-bottom:1px solid var(--line)}
.tg-n{grid-area:n;font-size:17.5px;font-weight:600;line-height:1.25}
.tg-v{grid-area:v;font-size:15px;color:var(--muted)}
.tg-sw{grid-area:sw;width:46px;height:28px;border-radius:999px;background:#E9E0DE;position:relative;transition:background .25s}
.tg-sw:after{content:"";position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.18);transition:transform .25s}
.tg input:checked+.tg-box .tg-sw{background:var(--red)}
.tg input:checked+.tg-box .tg-sw:after{transform:translateX(18px)}
.tg input:checked+.tg-box .tg-v{color:var(--red)}
.hint{font-size:14px;color:var(--muted);margin-top:-4px}
.next-cta{display:flex;justify-content:space-between;align-items:center;margin-top:4px;padding:14px 18px;border:1px solid var(--red);color:var(--red);text-decoration:none;font-size:12px;letter-spacing:.22em;text-transform:uppercase;font-weight:600}
.next-cta span{font-size:18px;letter-spacing:0}

/* resumo */
.sum>div{padding:12px 0;border-bottom:1px solid var(--line)}
.sum>div:first-child{border-top:1px solid var(--ink)}
.sum dt{font-size:10.5px;letter-spacing:.22em;text-transform:uppercase;font-weight:600;color:var(--red);margin-bottom:6px}
.sum dd{display:flex;flex-wrap:wrap;gap:6px;font-size:18px;font-weight:500}
.s-opt,.s-op{display:none;align-items:center;border:1px solid rgba(227,29,38,.35);background:var(--blush);color:var(--ink);padding:3px 10px;border-radius:999px;font-size:15.5px}
.s-none,.s-noop{color:var(--muted);font-weight:400}
.tot-card{margin-top:16px;background:var(--red);color:#fff;padding:18px 20px 16px;position:relative;overflow:hidden}
.tot{display:none;flex-direction:column}
.tot-none{display:flex}
.t-h{font-size:10.5px;letter-spacing:.24em;text-transform:uppercase;font-weight:600;opacity:.9}
.t-v{font-size:clamp(48px,14vw,64px);font-weight:300;line-height:1.05;letter-spacing:-.02em}
.t-s{font-size:16.5px;margin-top:2px}
.t-msg{font-size:18px;line-height:1.35;margin-top:6px}
.t-lc{display:none;margin-top:8px;padding-top:8px;border-top:1px solid rgba(255,255,255,.3);font-size:14.5px;opacity:.95}
.cta-wrap{margin-top:14px}
.wa-btn{display:none;align-items:center;justify-content:center;gap:12px;padding:12px 18px;border:1px solid rgba(227,29,38,.4);background:var(--blush);color:var(--red);border-radius:999px;text-decoration:none;font-size:18px;font-weight:600;-webkit-tap-highlight-color:transparent}
.wa-btn span{display:flex;flex-direction:column;line-height:1.15}
.wa-btn small{font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:var(--ink)}
.wa-none{display:flex}
.valid{margin-top:12px;font-size:14px;color:var(--muted);text-align:center}
.print-only{display:none}
.js-calc .tot,.js-calc .wa-btn{display:none!important}
.js-calc .tot-js:not([hidden]),.js-calc .wa-js:not([hidden]){display:flex!important}
.js-calc .tot-none.show,.js-calc .wa-none.show{display:flex!important}
${comboCss}

/* encerramento */
.closing .sc-in{text-align:center}
.closing .eyebrow{margin-bottom:26px}
.close-logo{width:min(60vw,240px)}
.motto{font-size:clamp(26px,7.4vw,36px);font-weight:300;line-height:1.2;margin:30px auto 0;max-width:14em}
.closing .hrule{margin:24px auto 18px}
.sig{font-size:12px;letter-spacing:.22em;text-transform:uppercase;font-weight:600}
.wa-light{display:inline-flex;align-items:center;gap:12px;margin-top:28px;padding:12px 26px 12px 18px;border:1px solid rgba(255,255,255,.6);background:rgba(255,255,255,.1);border-radius:999px;color:#fff;text-decoration:none;font-size:21px;font-weight:600}
.wa-light span{display:flex;flex-direction:column;align-items:flex-start;line-height:1.15}
.wa-light small{font-size:10px;letter-spacing:.22em;text-transform:uppercase;opacity:.9}

/* animação: só esconde quando o JavaScript confirmou que consegue revelar */
.anim .slide:not(.in) .rv{opacity:0;transform:translateY(16px)}
.anim .rv{transition:opacity .8s cubic-bezier(.2,.7,.2,1) calc(var(--i,0)*70ms),transform .8s cubic-bezier(.2,.7,.2,1) calc(var(--i,0)*70ms)}
.progress{position:fixed;left:0;top:0;height:2px;width:100%;background:var(--red);transform-origin:0 50%;transform:scaleX(0);z-index:5;pointer-events:none;transition:transform .4s}
@media (prefers-reduced-motion:reduce){.anim .slide .rv{opacity:1!important;transform:none!important;transition:none!important}.swipe span{animation:none}.deck{scroll-behavior:auto}}

/* telas baixas: tipografia e espaçamentos compactos */
@media (max-height:700px){
  h2{font-size:clamp(28px,8vw,38px);margin-bottom:16px}
  .kicker{margin-bottom:10px}
  .sh{min-height:54px;padding-top:max(10px,env(safe-area-inset-top))}.lg{height:44px;width:67px}
  .sf{padding-top:4px;padding-bottom:max(10px,env(safe-area-inset-bottom))}.nav{width:40px;height:40px}
  .sc-in{padding:6px 0 10px}
  .ico{width:34px;height:34px}.ico svg{width:19px;height:19px}
  .facts>div{grid-template-columns:34px 1fr;padding:7px 0}.facts dd{font-size:16.5px}
  .ilist li{padding:7px 0;font-size:16.5px}
  .clist li{padding:9px 0}.clist p{font-size:15.5px}
  .body{font-size:17px}
  .nums li{padding:10px 0}.nums b{font-size:52px}
  .plan-v{font-size:36px}.plan p{font-size:14.5px}
  .plist li{padding:12px 0}
  .pk-box{padding:11px 12px 10px}.pk-n{font-size:19px}.pk-v{font-size:21px}
  .tg-box{padding:8px 0}.tg-n{font-size:16.5px}
  .cover-logo{min-height:110px}.cover-logo img{width:min(50vw,210px)}.cover h1{font-size:clamp(50px,15vw,80px)}.swipe{margin-top:18px}
  .motto{margin-top:22px}.wa-light{margin-top:20px}.closing .eyebrow{margin-bottom:18px}
  .t-v{font-size:clamp(42px,12vw,56px)}.sum>div{padding:9px 0}
}
@media (max-height:580px){
  h2{font-size:clamp(26px,7.4vw,32px);margin-bottom:12px}
  .stats{margin-top:16px}.stats strong{font-size:42px}
  .facts>div{padding:5px 0}.ilist li{padding:5px 0;font-size:16px}.ilist small{font-size:14px}
  .clist li{padding:7px 0}.clist p{font-size:15px;line-height:1.4}
  .plan{padding:10px 14px}.plan-v{font-size:32px;margin:2px 0 6px}
  .gifts li{padding:11px 0}.gifts{margin-bottom:14px}
  .tot-card{padding:14px 16px 12px}.cta-wrap{margin-top:10px}.wa-btn{padding:9px 16px}
  .hint{display:none}.plan p{font-size:14px;line-height:1.35}.plan-team{padding:4px 0;margin-bottom:6px}.plans{gap:8px}
  legend{margin-bottom:6px}fieldset{margin-bottom:10px}.pk-n{font-size:18px;margin:0 0 2px}.pk-v{font-size:19px}.tg-box{padding:7px 0}
}
/* telas muito estreitas (iPhone SE 1ª geração) */
@media (max-width:340px){.plist li{grid-template-columns:1fr;gap:4px}.plist b,.plist b.pct{text-align:left;max-width:none;font-size:22px}.plist b.pct{font-size:15px}.kicker{letter-spacing:.14em;font-size:10px;gap:8px}.kicker .rule{width:16px}.tg-n{font-size:14.5px}.tg-v{font-size:13.5px}.tg-box{column-gap:10px}.tg-sw{width:42px}.tg input:checked+.tg-box .tg-sw:after{transform:translateX(14px)}.sh-r{letter-spacing:.14em}}
/* telas largas: conteúdo centralizado */
@media (min-width:760px){.sc-in{max-width:560px}.cover .sc-in{max-width:560px}}
/* impressão: um slide por página */
@media print{html,body{overflow:visible;height:auto}.deck{display:block;height:auto;overflow:visible;width:auto}.slide{width:auto;height:auto;min-height:100vh;page-break-after:always;break-after:page}.sc{overflow:visible}.sf,.progress,.swipe{display:none}.print-only{display:block;margin-top:24px;font-size:15px}.anim .slide .rv{opacity:1!important;transform:none!important}}
</style>
</head>
<body>
<svg width="0" height="0" style="position:absolute" aria-hidden="true"><symbol id="wa" viewBox="0 0 24 24"><path fill="currentColor" d="${waIconPath}"/></symbol></svg>
<div class="progress" id="progress" aria-hidden="true"></div>
<main class="deck" id="deck" tabindex="-1" aria-label="Proposta Ceia de Natal — deslize para o lado">
${slides.map(renderSlide).join('\n')}
</main>
<script>
(function(){
  var d=document.documentElement,deck=document.getElementById('deck'),slides=[].slice.call(deck.querySelectorAll('.slide')),pg=document.getElementById('progress');
  function idx(){return Math.max(0,Math.min(slides.length-1,Math.round(deck.scrollLeft/Math.max(1,deck.clientWidth))))}
  function mark(i){if(slides[i])slides[i].classList.add('in');pg.style.transform='scaleX('+((i+1)/slides.length)+')'}
  function go(i){i=Math.max(0,Math.min(slides.length-1,i));deck.scrollTo({left:i*deck.clientWidth,behavior:'smooth'});mark(i)}
  // Navegação por teclado e roda do mouse (no celular, o gesto de deslizar já funciona sozinho)
  try{
    document.addEventListener('keydown',function(e){if(e.target&&/INPUT|TEXTAREA/.test(e.target.tagName))return;if(e.key==='ArrowRight'||e.key==='PageDown'){e.preventDefault();go(idx()+1)}if(e.key==='ArrowLeft'||e.key==='PageUp'){e.preventDefault();go(idx()-1)}});
    var lock=0,acc=0;
    deck.addEventListener('wheel',function(e){if(Math.abs(e.deltaX)>Math.abs(e.deltaY))return;var sc=e.target.closest&&e.target.closest('.sc');if(sc&&sc.scrollHeight>sc.clientHeight+2){var atTop=sc.scrollTop<=0,atEnd=sc.scrollTop+sc.clientHeight>=sc.scrollHeight-2;if((e.deltaY<0&&!atTop)||(e.deltaY>0&&!atEnd))return}e.preventDefault();var now=Date.now();if(now<lock)return;acc+=e.deltaY;if(Math.abs(acc)>30){go(idx()+(acc>0?1:-1));acc=0;lock=now+650}},{passive:false});
    // Links internos (setas): rolagem suave sem alterar o endereço
    deck.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href^="#"]');if(!a)return;var t=document.getElementById(a.getAttribute('href').slice(1));if(!t)return;e.preventDefault();go(slides.indexOf(t))});
  }catch(e){}
  // Resumo calculado (reforço ao CSS, para navegadores sem :has)
  try{
    var BASE={A:3875,B:4325},EX={ps:450,pp:600},NOMES={A:'Buffet',B:'Empratado'};
    var fmt=function(n){return 'R$ '+n.toLocaleString('pt-BR',{minimumFractionDigits:n%1?2:0,maximumFractionDigits:2})};
    var wajs=document.getElementById('wajs'),totjs=deck.querySelector('.tot-js'),tn=deck.querySelector('.tot-none'),wn=deck.querySelector('.wa-none');
    var supportsHas=window.CSS&&CSS.supports&&CSS.supports('selector(:has(*))');
    function calc(){
      var o=deck.querySelector('input[name=opt]:checked');
      var ps=document.getElementById('ps').checked,pp=document.getElementById('pp').checked,lc=document.getElementById('lc').checked;
      if(supportsHas)return;
      deck.classList.add('js-calc');
      [].forEach.call(deck.querySelectorAll('.s-opt'),function(s){s.style.display=o&&s.dataset.o===o.value?'inline-flex':'none'});
      [].forEach.call(deck.querySelectorAll('.s-op'),function(s){s.style.display=document.getElementById(s.dataset.op).checked?'inline-flex':'none'});
      deck.querySelector('.s-none').style.display=o?'none':'';deck.querySelector('.s-noop').style.display=(ps||pp||lc)?'none':'';
      deck.querySelector('.t-lc').style.display=(o&&lc)?'block':'none';
      if(!o){totjs.hidden=true;wajs.hidden=true;tn.classList.add('show');wn.classList.add('show');return}
      tn.classList.remove('show');wn.classList.remove('show');
      var t=BASE[o.value]+(ps?EX.ps:0)+(pp?EX.pp:0);
      document.getElementById('jsv').textContent=fmt(t);document.getElementById('jss').textContent=fmt(t/2);totjs.hidden=false;
      var ops=[ps&&'Personal shopper',pp&&'Pré-preparo no dia anterior (23/12)',lc&&'Coordenação do aluguel de louça (10% do valor da locação)'].filter(Boolean);
      wajs.href='${WA_BASE}'+encodeURIComponent('Olá, Mariana! Quero seguir com a proposta da Ceia de Natal (24/12).\\n\\nOpção: '+o.value+' · '+NOMES[o.value]+'\\nOpcionais: '+(ops.length?ops.join('; '):'nenhum')+'\\nTotal: '+fmt(t)+(lc?' + 10% do valor da locação de louça':'')+'\\nSinal (50%): '+fmt(t/2));wajs.hidden=false;
    }
    [].forEach.call(deck.querySelectorAll('input'),function(i){i.addEventListener('change',calc)});calc();
  }catch(e){}
  // Animação de entrada por slide — à prova de falhas
  try{
    if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches){slides.forEach(function(s){s.classList.add('in')});return}
    mark(idx());
    if('IntersectionObserver' in window){
      var io=new IntersectionObserver(function(es){es.forEach(function(x){if(x.isIntersecting)mark(slides.indexOf(x.target))})},{root:deck,threshold:0.55});
      slides.forEach(function(s){io.observe(s)});
    }
    deck.addEventListener('scroll',function(){mark(idx())},{passive:true});
    setInterval(function(){mark(idx())},700);
    window.addEventListener('beforeprint',function(){slides.forEach(function(s){s.classList.add('in')})});
    d.classList.add('anim');
  }catch(e){d.classList.remove('anim');slides.forEach(function(s){s.classList.add('in')})}
})();
</script>
</body>
</html>`;

// ——— Sem linhas órfãs: espaços inseparáveis ———
const NB = ' ';
const fix = (t) => t
  .replace(/(\d)\s+(?=[^\s<])/g, '$1' + NB)
  .replace(/R\$\s+/g, 'R$' + NB)
  .replace(/\s+([–—·+])\s+/g, NB + '$1 ')
  .replace(/(^|\s)([aeoàéAEO]|de|da|do|em|no|na|um|ao|os|as|e|à)\s+/g, (m, p, w) => p + w + NB);
const parts = html.split(/(<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>)/);
const fixed = parts.map((p) => (p.startsWith('<') ? p : fix(p)));
for (let i = 0; i < fixed.length - 1; i++) {
  const t = fixed[i];
  if (t.startsWith('<') || !/\S/.test(t)) continue;
  let k = i + 1; while (k < fixed.length && (fixed[k] === '' || /^<\/(em|b|i|span)>$/.test(fixed[k]))) k++;
  if (!/^<\/(p|strong|small|h[1-4]|li|dd|dt|div|span|a|aside|legend)>$/.test(fixed[k] || '')) continue;
  const m = t.match(/^([\s\S]*\S)\s+(\S+\s*)$/);
  if (m && (m[1].split(/\s/).pop().length + m[2].length) <= 24) fixed[i] = m[1] + NB + m[2];
  else if (/^\s+\S+\s*$/.test(t) && /^<\/(i|b|em|span|strong)>$/.test(fixed[i - 1] || '')) fixed[i] = t.replace(/^\s+/, NB);
}
for (let i = 0; i < fixed.length; i++) { if (!fixed[i].startsWith('<')) fixed[i] = fixed[i].replace(/([\p{L}]+(?:-[\p{L}]+)+)/gu, '<span class="nb">$1</span>'); }
let jn = 0;
const out = fixed.join('').replace(/class="([^"]*\bj)"/g, (m, c) => `class="${c}" data-j="${jn++}"`);
fs.writeFileSync('Proposta_Cacarola_Ceia_de_Natal.html', out);
console.log('ok', N, 'slides', (out.length / 1024).toFixed(0) + 'KB');
