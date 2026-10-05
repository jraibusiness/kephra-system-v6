// Gera a versão HTML (página única, mobile-first) a partir do mesmo conteúdo.
const fs = require('fs');
const D = require('./data');
const { fontFaces, logo, pot, RED, INK } = require('./common');

const kicker = (num, txt) => `<div class="kicker reveal"><b>${num}</b><span class="rule"></span><span>${txt}</span></div>`;

const weeks = D.semanas
  .map(
    (s, k) => `
  <div class="week" id="semana-${s.n}" role="tabpanel" aria-labelledby="tab-${s.n}" ${k ? 'hidden' : ''}>
    <div class="weekhead"><div class="weekno">Semana ${s.n}</div><h3>${s.tema}</h3></div>
    <ol class="days">
      ${s.dias
        .map(
          (d, i) =>
            `<li><span class="day" title="${D.diasSemana[i][1]}">${D.diasSemana[i][0]}</span><div><strong>${d[0]}</strong><small>${d
              .slice(1)
              .join('<i>·</i>')}</small></div></li>`
        )
        .join('')}
    </ol>
  </div>`
  )
  .join('');

const opts = D.complemento.opcoes
  .map(
    (o, i) => `
  <label class="opt">
    <input type="radio" name="freq" value="${o.valor}" data-nome="${o.nome}" ${o.id === 'mensal' ? 'checked' : ''}>
    <span class="opt-box">
      <span class="opt-top"><span class="opt-name">${o.nome}</span><span class="add"><small>+ R$</small>${o.valor}</span></span>
      <span class="opt-desc">${o.desc}</span>
    </span>
  </label>`
  )
  .join('');

const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="${RED}">
<meta name="color-scheme" content="light">
<title>Caçarola — Plano Mensal Personalizado</title>
<meta name="description" content="Proposta Caçarola Personal Chef: alimentação personalizada para 2 pessoas, de segunda a sexta-feira.">
<link rel="icon" href="${pot.red}">
<style>
${fontFaces}
:root{--red:${RED};--ink:${INK};--body:#3A3230;--muted:#6F6562;--line:#EFE8E6;--paper:#FFFFFF;--blush:#FBF3F2;--gutter:clamp(22px,6vw,48px);--max:680px}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}
body{font-family:"Advent Pro",system-ui,sans-serif;color:var(--ink);background:var(--paper);font-size:18px;line-height:1.5;font-feature-settings:"lnum","kern";-webkit-font-smoothing:antialiased;overflow-x:hidden}
em{font-style:normal;color:var(--red)}
a{color:inherit}
.wrap{max-width:var(--max);margin:0 auto;padding:0 var(--gutter)}
section.block{padding:clamp(72px,14vw,128px) 0 0}
.kicker{display:flex;align-items:center;gap:12px;font-size:12px;letter-spacing:.28em;text-transform:uppercase;font-weight:600;margin-bottom:18px}
.kicker b{color:var(--red);font-weight:600}
.kicker .rule{width:26px;height:1px;background:var(--red)}
h2{font-weight:500;font-size:clamp(40px,10.5vw,64px);line-height:1;letter-spacing:-.01em;margin-bottom:28px}
.body{font-size:clamp(18px,4.6vw,20px);line-height:1.55;color:var(--body)}

/* barra superior */
.bar{position:fixed;inset:0 0 auto 0;z-index:20;display:flex;justify-content:space-between;align-items:center;padding:10px var(--gutter);padding-top:max(10px,env(safe-area-inset-top));background:rgba(255,255,255,.92);backdrop-filter:saturate(1.4) blur(14px);-webkit-backdrop-filter:saturate(1.4) blur(14px);border-bottom:1px solid var(--line);transform:translateY(-110%);transition:transform .45s cubic-bezier(.2,.7,.2,1)}
.bar.show{transform:none}
.bar img{height:40px;display:block}
.pill{display:inline-flex;align-items:center;gap:8px;background:var(--red);color:#fff;text-decoration:none;font-weight:600;font-size:13px;letter-spacing:.16em;text-transform:uppercase;padding:11px 18px;border-radius:999px;min-height:44px}
.pill svg{width:16px;height:16px}

/* capa */
.hero{position:relative;min-height:100vh;min-height:100svh;background:var(--red);color:#fff;overflow:hidden;display:flex;flex-direction:column;padding:max(28px,env(safe-area-inset-top)) var(--gutter) 28px}
.hero-pot{position:absolute;width:min(130vw,980px);right:-38%;bottom:-6%;opacity:.6;pointer-events:none}
.hero-logo{flex:1;display:flex;align-items:center;justify-content:center;padding:6vh 0 2vh}
.hero-logo img{width:min(62vw,300px);animation:rise 1.2s cubic-bezier(.2,.7,.2,1) both}
.hero-body{position:relative;max-width:var(--max);width:100%;margin:0 auto;animation:rise 1.2s .25s cubic-bezier(.2,.7,.2,1) both}
.eyebrow{font-size:12px;letter-spacing:.34em;text-transform:uppercase;font-weight:600;opacity:.92;margin-bottom:16px}
.hero h1{font-weight:300;font-size:clamp(46px,13vw,88px);line-height:.98;letter-spacing:-.015em}
.hero h1 span{font-weight:600;display:block}
.hrule{width:48px;height:1px;background:rgba(255,255,255,.8);margin:26px 0 18px}
.hero p{font-size:clamp(18px,4.8vw,21px);line-height:1.45}
.hero-foot{position:relative;max-width:var(--max);width:100%;margin:36px auto 0;display:flex;justify-content:space-between;align-items:center;font-size:11px;letter-spacing:.26em;text-transform:uppercase;font-weight:500;border-top:1px solid rgba(255,255,255,.35);padding-top:14px}
.cue{display:inline-flex;align-items:center;gap:8px;text-decoration:none}
.cue i{width:1px;height:22px;background:#fff;display:block;animation:cue 2.2s ease-in-out infinite;transform-origin:top}
@keyframes cue{0%{transform:scaleY(0)}50%{transform:scaleY(1)}100%{transform:scaleY(0);transform-origin:bottom}}
@keyframes rise{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}

/* apresentação */
.lead{font-size:clamp(19px,5vw,22px);line-height:1.55;color:var(--body);border-left:2px solid var(--red);padding-left:18px}
.stats{display:grid;grid-template-columns:repeat(3,1fr);border-top:1px solid var(--ink);margin-top:48px}
.stats div{padding:16px 0 0}
.stats div+div{padding-left:16px;border-left:1px solid var(--line)}
.stats strong{display:block;font-weight:300;font-size:clamp(52px,14vw,76px);line-height:1;color:var(--red)}
.stats span{display:block;margin-top:8px;font-size:12px;letter-spacing:.16em;text-transform:uppercase;font-weight:600;line-height:1.4}

/* plano */
.price{display:flex;align-items:flex-start;color:var(--red);border-bottom:1px solid var(--ink);padding-bottom:22px;margin-bottom:8px}
.price .cur{font-size:24px;font-weight:500;margin:18px 8px 0 0}
.price .val{font-size:clamp(120px,34vw,180px);font-weight:300;line-height:.86;letter-spacing:-.035em}
.price .per{font-size:22px;font-weight:500;margin:18px 0 0 8px;line-height:1.15;color:var(--ink)}
.spec>div{padding:18px 0;border-bottom:1px solid var(--line)}
.spec dt{font-size:12px;letter-spacing:.24em;text-transform:uppercase;font-weight:600;color:var(--red);margin-bottom:6px}
.spec dd{font-size:19px;line-height:1.45;color:var(--body)}
.spec dd strong{display:block;font-weight:600;font-size:23px;color:var(--ink)}
.spec dd small{display:block;font-size:17px;color:var(--muted);margin-top:2px}

/* cardápio */
.tabs{display:grid;grid-template-columns:repeat(4,1fr);border:1px solid var(--ink);margin-bottom:26px;position:sticky;top:calc(64px + env(safe-area-inset-top));z-index:5;background:#fff}
.tabs button{font:inherit;font-size:13px;letter-spacing:.18em;text-transform:uppercase;font-weight:600;background:none;border:0;color:var(--ink);padding:14px 4px;min-height:48px;cursor:pointer;transition:background .25s,color .25s}
.tabs button+button{border-left:1px solid var(--ink)}
.tabs button[aria-selected="true"]{background:var(--red);color:#fff}
.tabs button:focus-visible{outline:2px solid var(--red);outline-offset:2px}
.weekhead{border-bottom:1px solid var(--ink);padding-bottom:16px;margin-bottom:2px}
.weekno{font-size:13px;letter-spacing:.26em;text-transform:uppercase;font-weight:600;color:var(--red);margin-bottom:6px}
.weekhead h3{font-weight:500;font-size:clamp(32px,8.6vw,44px);line-height:1.05}
.week{animation:fade .5s ease both}
@keyframes fade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.days{list-style:none}
.days li{display:grid;grid-template-columns:52px 1fr;gap:6px;padding:18px 0;border-bottom:1px solid var(--line)}
.days li:last-child{border-bottom:0}
.day{font-size:13px;letter-spacing:.2em;text-transform:uppercase;font-weight:600;color:var(--red);padding-top:5px}
.days strong{display:block;font-weight:600;font-size:clamp(20px,5.4vw,23px);line-height:1.22}
.days small{display:block;font-size:clamp(16.5px,4.4vw,18px);line-height:1.4;color:var(--muted);margin-top:4px}
.days small i{font-style:normal;color:var(--red);margin:0 7px}
.swipe-hint{font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:var(--muted);text-align:center;margin-top:14px}

/* complemento */
.compo{list-style:none;margin:34px 0 0;border-top:1px solid var(--ink)}
.compo li{display:grid;grid-template-columns:84px 1fr;align-items:center;padding:16px 0;border-bottom:1px solid var(--line)}
.compo b{font-weight:300;font-size:60px;line-height:1;color:var(--red)}
.compo strong{display:block;font-size:22px;font-weight:600}
.compo small{display:block;font-size:17px;color:var(--muted);margin-top:2px;line-height:1.35}
.sub{font-weight:500;font-size:clamp(28px,7.4vw,36px);line-height:1.08;margin:64px 0 8px}
.subnote{font-size:17px;color:var(--muted);margin-bottom:22px}
.opts{display:grid;gap:12px}
.opt{display:block;cursor:pointer;-webkit-tap-highlight-color:transparent}
.opt input{position:absolute;opacity:0;pointer-events:none}
.opt-box{display:block;border:1px solid #E3D8D5;padding:16px 18px 18px;transition:border-color .25s,background .25s,box-shadow .25s;position:relative}
.opt-box:before{content:"";position:absolute;left:-1px;top:-1px;bottom:-1px;width:3px;background:var(--red);transform:scaleY(0);transition:transform .3s cubic-bezier(.2,.7,.2,1)}
.opt input:checked+.opt-box{border-color:var(--red);background:var(--blush)}
.opt input:checked+.opt-box:before{transform:none}
.opt input:focus-visible+.opt-box{outline:2px solid var(--red);outline-offset:3px}
.opt-top{display:flex;justify-content:space-between;align-items:baseline;gap:12px;margin-bottom:6px}
.opt-name{font-size:21px;font-weight:600}
.add{font-size:36px;font-weight:400;color:var(--red);line-height:1;white-space:nowrap}
.add small{font-size:14px;font-weight:600;margin-right:4px;vertical-align:8px}
.opt-desc{display:block;font-size:17px;line-height:1.45;color:var(--muted)}
.notes{display:grid;gap:20px;border-top:1px solid var(--ink);padding-top:22px;margin-top:40px}
.notes h4,.obs h4{font-size:12px;letter-spacing:.22em;text-transform:uppercase;font-weight:600;color:var(--red);margin-bottom:6px}
.notes p{font-size:18px;line-height:1.5;color:var(--body)}

/* investimento */
.ledger{border-top:1px solid var(--ink)}
.ledger .row{display:grid;grid-template-columns:1fr auto;gap:16px;align-items:center;padding:20px 0;border-bottom:1px solid var(--line)}
.ledger strong{display:block;font-size:20px;font-weight:600;line-height:1.25}
.ledger small{display:block;font-size:16px;color:var(--muted);margin-top:3px;line-height:1.35}
.amt{font-size:34px;font-weight:400;color:var(--red);text-align:right;white-space:nowrap}
.amt small{display:inline;font-size:18px;color:var(--red)}
.amt.stack{display:flex;flex-direction:column;font-size:22px;line-height:1.25;font-weight:500}
.amt.soft{font-size:16px;color:var(--muted);font-weight:500;line-height:1.35;white-space:normal}
.total{margin-top:28px;background:var(--red);color:#fff;padding:24px 22px 22px;position:relative;overflow:hidden}
.total .t-h{font-size:11px;letter-spacing:.24em;text-transform:uppercase;font-weight:600;opacity:.9}
.total .t-v{font-size:clamp(64px,18vw,96px);font-weight:300;line-height:1;letter-spacing:-.02em;margin:8px 0 4px;display:flex;align-items:flex-start;gap:6px}
.total .t-v small{font-size:22px;font-weight:500;margin-top:10px}
.total .t-v .mo{font-size:20px;font-weight:500;align-self:flex-end;margin-bottom:10px}
.total .t-s{font-size:17px;line-height:1.4;opacity:.95}
.total .t-f{font-size:12px;letter-spacing:.16em;text-transform:uppercase;font-weight:500;margin-top:14px;padding-top:12px;border-top:1px solid rgba(255,255,255,.3);opacity:.9}
.total a{color:#fff}

/* cronograma */
.timeline{list-style:none;position:relative;padding-left:34px}
.timeline:before{content:"";position:absolute;left:7px;top:10px;bottom:10px;width:1px;background:var(--red)}
.timeline li{position:relative;padding-bottom:40px}
.timeline li:last-child{padding-bottom:0}
.timeline .dot{position:absolute;left:-34px;top:8px;width:15px;height:15px;border-radius:50%;background:#fff;border:1px solid var(--red)}
.timeline li.first .dot{background:var(--red)}
.when{font-size:clamp(28px,7.4vw,36px);font-weight:400;color:var(--red);line-height:1.1}
.timeline strong{display:block;font-size:13px;letter-spacing:.22em;text-transform:uppercase;font-weight:600;margin:8px 0 4px}
.timeline p{font-size:19px;line-height:1.45;color:var(--body)}

/* armazenamento */
.obs{margin-top:30px;background:var(--blush);border-left:2px solid var(--red);padding:20px 22px}
.obs p{font-size:18px;line-height:1.5;color:var(--body)}

/* encerramento */
.closing{position:relative;margin-top:clamp(88px,16vw,140px);background:var(--red);color:#fff;text-align:center;overflow:hidden;padding:clamp(72px,16vw,120px) var(--gutter) calc(32px + env(safe-area-inset-bottom))}
.closing .hero-pot{right:-30%;bottom:-10%}
.closing .inner{position:relative;max-width:var(--max);margin:0 auto}
.closing .clogo{width:min(60vw,280px)}
.motto{font-size:clamp(28px,7.6vw,40px);font-weight:300;line-height:1.2;margin:44px auto 0;max-width:16em}
.closing .hrule{margin:28px auto 20px}
.sig{font-size:13px;letter-spacing:.24em;text-transform:uppercase;font-weight:600}
.wa{display:inline-flex;align-items:center;gap:14px;background:#fff;color:var(--red);text-decoration:none;padding:14px 30px 14px 22px;border-radius:999px;margin-top:36px;box-shadow:0 10px 30px rgba(0,0,0,.12);transition:transform .25s}
.wa:active{transform:scale(.98)}
.wa svg{width:28px;height:28px;flex:none}
.wa span{display:flex;flex-direction:column;align-items:flex-start;text-align:left}
.wa small{font-size:11px;letter-spacing:.26em;text-transform:uppercase;font-weight:600;color:var(--ink)}
.wa b{font-size:24px;font-weight:600;letter-spacing:.02em;line-height:1.1}
.cfoot{display:flex;justify-content:space-between;font-size:11px;letter-spacing:.24em;text-transform:uppercase;font-weight:500;border-top:1px solid rgba(255,255,255,.35);padding-top:14px;margin-top:72px}

/* revelação ao rolar */
.reveal{opacity:0;transform:translateY(16px);transition:opacity .9s cubic-bezier(.2,.7,.2,1),transform .9s cubic-bezier(.2,.7,.2,1)}
.reveal.in{opacity:1;transform:none}
.no-js .reveal{opacity:1;transform:none}
@media (prefers-reduced-motion:reduce){*,*:before,*:after{animation:none!important;transition:none!important}.reveal{opacity:1;transform:none}html{scroll-behavior:auto}}
@media (min-width:900px){
  .hero-body h1{font-size:96px}
  .bar img{height:46px}
}
@media print{.bar,.tabs,.swipe-hint{display:none}.week[hidden]{display:block!important}.reveal{opacity:1;transform:none}}
</style>
</head>
<body class="no-js">

<header class="bar" id="bar" aria-hidden="true">
  <a href="#topo" aria-label="Voltar ao início"><img src="${logo.red}" alt="Caçarola Personal Chef"></a>
  <a class="pill" href="${D.whatsLink}" target="_blank" rel="noopener">${waIcon('#fff')}Falar com a chef</a>
</header>

<main>
<section class="hero" id="topo">
  <img class="hero-pot" src="${pot.redSoft}" alt="">
  <div class="hero-logo"><img src="${logo.white}" alt="Caçarola Personal Chef"></div>
  <div class="hero-body">
    <div class="eyebrow">Proposta exclusiva</div>
    <h1>Plano Mensal <span>Personalizado</span></h1>
    <div class="hrule"></div>
    <p>${D.subtitulo}<br>${D.dias}</p>
  </div>
  <div class="hero-foot"><span>Chef Mariana · Out 2026</span><a class="cue" href="#apresentacao">Descubra <i></i></a></div>
</section>

<section class="block" id="apresentacao"><div class="wrap">
  ${kicker('—', 'Apresentação')}
  <h2 class="reveal">Praticidade, variedade e <em>comida de verdade.</em></h2>
  <p class="lead reveal">${D.intro}</p>
  <div class="stats reveal">
    <div><strong>2</strong><span>pessoas</span></div>
    <div><strong>40</strong><span>marmitas<br>de almoço</span></div>
    <div><strong>20</strong><span>dias úteis<br>seg — sex</span></div>
  </div>
</div></section>

<section class="block" id="plano"><div class="wrap">
  ${kicker('01', 'Plano mensal')}
  <h2 class="reveal">Almoços</h2>
  <div class="price reveal"><span class="cur">R$</span><span class="val">${D.plano.preco}</span><span class="per">,00<br>/ mês</span></div>
  <dl class="spec reveal">
    <div><dt>Inclui</dt><dd><strong>${D.plano.inclui[0]}</strong><small>${D.plano.inclui[1]}</small></dd></div>
    <div><dt>Personal shopper</dt><dd>${D.plano.shopper}</dd></div>
    <div><dt>Ingredientes</dt><dd>${D.plano.ingredientes}</dd></div>
  </dl>
</div></section>

<section class="block" id="cardapio"><div class="wrap">
  ${kicker('02', 'Cardápio sugerido · 1º mês')}
  <h2 class="reveal">Quatro semanas, <em>quatro viagens.</em></h2>
  <div class="tabs" role="tablist" aria-label="Semanas do cardápio">
    ${D.semanas.map((s, k) => `<button role="tab" id="tab-${s.n}" aria-controls="semana-${s.n}" aria-selected="${k === 0}">Sem ${s.n}</button>`).join('')}
  </div>
  <div id="weeks">${weeks}</div>
  <p class="swipe-hint" aria-hidden="true">Deslize para trocar de semana</p>
</div></section>

<section class="block" id="complemento"><div class="wrap">
  ${kicker('03', 'Complemento')}
  <h2 class="reveal">Jantares <em>+ lanches</em></h2>
  <p class="body reveal">${D.complemento.texto}</p>
  <ul class="compo reveal">
    ${D.complemento.itens.map((it) => `<li><b>${it[0]}</b><div><strong>${it[1]}</strong>${it[2] ? `<small>${it[2]}</small>` : ''}</div></li>`).join('')}
  </ul>
  <h3 class="sub reveal">Escolha o ritmo <em>de entrega</em></h3>
  <p class="subnote reveal">Toque em uma opção para ver o investimento mensal.</p>
  <div class="opts reveal" role="radiogroup" aria-label="Frequência de entrega">${opts}</div>
  <div class="notes reveal">
    <div><h4>Sugestões de travessas</h4><p>${D.complemento.travessas}</p></div>
    <div><h4>Sugestões de lanches</h4><p>${D.complemento.lanches}</p></div>
  </div>
</div></section>

<section class="block" id="investimento"><div class="wrap">
  ${kicker('04', 'Investimento')}
  <h2 class="reveal">Resumo do <em>investimento</em></h2>
  <div class="ledger reveal">
    <div class="row"><div><strong>Plano mensal de almoço</strong></div><div class="amt">R$ 450<small>,00</small></div></div>
    <div class="row"><div><strong>Complemento de jantar + lanches</strong><small>Escolha conforme a frequência de entrega</small></div><div class="amt stack"><span>R$ 200</span><span>R$ 300</span><span>R$ 400</span></div></div>
    <div class="row"><div><strong>Ingredientes</strong></div><div class="amt soft">Pagos separadamente<br>pelo casal</div></div>
  </div>
  <div class="total reveal" aria-live="polite">
    <div class="t-h">Valor mensal do serviço</div>
    <div class="t-v"><small>R$</small><span id="tv">650</span><span class="mo">/ mês</span></div>
    <div class="t-s">Almoço <span aria-hidden="true">+</span> complemento com <strong id="tn">entrega mensal</strong></div>
    <div class="t-f">Ingredientes pagos à parte · <a href="#complemento">alterar frequência</a></div>
  </div>
</div></section>

<section class="block" id="cronograma"><div class="wrap">
  ${kicker('05', 'Cronograma inicial')}
  <h2 class="reveal">Próximos <em>passos</em></h2>
  <ol class="timeline">
    ${D.cronograma.map((c, i) => `<li class="reveal ${i === 0 ? 'first' : ''}"><span class="dot"></span><div class="when">${c[0]}</div><strong>${c[1]}</strong><p>${c[2]}</p></li>`).join('')}
  </ol>
</div></section>

<section class="block" id="entrega"><div class="wrap">
  ${kicker('06', 'Armazenamento e entrega')}
  <h2 class="reveal">Do nosso fogão <em>para a sua casa</em></h2>
  <p class="body reveal">${D.armazenamento}</p>
  <aside class="obs reveal"><h4>Observação sobre o cardápio</h4><p>${D.observacao}</p></aside>
</div></section>
</main>

<footer class="closing">
  <img class="hero-pot" src="${pot.redSoft}" alt="">
  <div class="inner">
    <img class="clogo reveal" src="${logo.white}" alt="Caçarola Personal Chef">
    <p class="motto reveal">${D.assinatura}</p>
    <div class="hrule"></div>
    <div class="sig">${D.chef}</div>
    <a class="wa" href="${D.whatsLink}" target="_blank" rel="noopener">${waIcon(RED)}<span><small>WhatsApp</small><b>${D.whats}</b></span></a>
    <div class="cfoot"><span>Caçarola</span><span>Personal Chef</span></div>
  </div>
</footer>

<script>
(function(){
  document.body.classList.remove('no-js');
  // barra superior após a capa
  var bar=document.getElementById('bar'),hero=document.getElementById('topo');
  new IntersectionObserver(function(e){var on=!e[0].isIntersecting;bar.classList.toggle('show',on);bar.setAttribute('aria-hidden',!on)},{threshold:0.05}).observe(hero);
  // revelação suave
  var io=new IntersectionObserver(function(es){es.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}})},{rootMargin:'0px 0px -8% 0px'});
  document.querySelectorAll('.reveal').forEach(function(el){io.observe(el)});
  // abas do cardápio
  var tabs=[].slice.call(document.querySelectorAll('[role=tab]')),cur=0;
  function show(i){cur=(i+tabs.length)%tabs.length;tabs.forEach(function(t,k){var on=k===cur;t.setAttribute('aria-selected',on);t.tabIndex=on?0:-1;document.getElementById(t.getAttribute('aria-controls')).hidden=!on})}
  tabs.forEach(function(t,k){t.addEventListener('click',function(){show(k)});t.addEventListener('keydown',function(e){if(e.key==='ArrowRight'){show(cur+1);tabs[cur].focus()}if(e.key==='ArrowLeft'){show(cur-1);tabs[cur].focus()}})});
  show(0);
  // deslizar entre semanas
  var w=document.getElementById('weeks'),sx=0,sy=0;
  w.addEventListener('touchstart',function(e){sx=e.touches[0].clientX;sy=e.touches[0].clientY},{passive:true});
  w.addEventListener('touchend',function(e){var dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.5){show(cur+(dx<0?1:-1))}},{passive:true});
  // total conforme frequência
  var tv=document.getElementById('tv'),tn=document.getElementById('tn');
  function total(){var r=document.querySelector('input[name=freq]:checked');tv.textContent=(450+ +r.value).toLocaleString('pt-BR');tn.textContent=r.dataset.nome.toLowerCase()}
  document.querySelectorAll('input[name=freq]').forEach(function(r){r.addEventListener('change',total)});
  total();
})();
</script>
</body>
</html>`;

function waIcon(c) {
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="${c}" d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zm5.8 14.13c-.25.69-1.44 1.32-1.98 1.37-.51.05-.99.24-3.33-.69-2.81-1.11-4.6-3.99-4.74-4.17-.14-.18-1.13-1.5-1.13-2.87 0-1.36.71-2.03.97-2.31.25-.28.55-.35.73-.35l.53.01c.17.01.4-.06.62.48.23.55.78 1.91.85 2.05.07.14.11.3.02.48-.09.18-.14.3-.28.46-.14.16-.29.36-.41.48-.14.14-.28.29-.12.57.16.28.71 1.17 1.53 1.9 1.05.94 1.94 1.23 2.22 1.37.28.14.44.12.6-.07.16-.18.69-.81.88-1.09.18-.28.37-.23.62-.14.25.09 1.6.76 1.88.89.28.14.46.21.53.32.07.12.07.67-.18 1.36z"/></svg>`;
}

fs.writeFileSync('Proposta_Cacarola_Plano_Mensal.html', html);
console.log('ok', (html.length / 1024).toFixed(0) + 'KB');
