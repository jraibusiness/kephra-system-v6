// Proposta Plano Mensal — 2º mês. Layout/identidade da proposta mensal, conteúdo do PDF "Mês 2".
const fs = require('fs');
const { fontFaces, logo, pot, RED, INK } = require('./common');

// Reaproveita o CSS da página web do 1º mês
const src = fs.readFileSync(__dirname + '/web.js', 'utf8');
const baseCss = new Function('RED', 'INK', 'fontFaces', 'return `' + src.split('<style>\n')[1].split('</style>')[0] + '`')(RED, INK, fontFaces);

const WHATS = '(11) 98855-0641';
const WA = 'https://wa.me/5511988550641?text=' + encodeURIComponent('Olá, Mariana! Recebi a proposta do 2º mês do Plano Mensal da Caçarola.');
const DIAS = [['Seg', 'Segunda'], ['Ter', 'Terça'], ['Qua', 'Quarta'], ['Qui', 'Quinta'], ['Sex', 'Sexta']];

const semanas = [
  { n: 1, tema: 'Frescor e sabor', tag: 'Consumo fresco', dias: [
    ['Filet mignon ao molho de ervas', 'Purê de mandioquinha', 'Legumes assados'],
    ['Sobrecoxa assada com mostarda e mel', 'Arroz', 'Brócolis'],
    ['Tilápia com crosta de ervas', 'Cuscuz marroquino', 'Legumes'],
    ['Carne de panela', 'Purê de batata', 'Cenouras'],
    ['Hambúrguer artesanal', 'Polenta cremosa', 'Legumes'],
  ] },
  { n: 2, tema: 'Sabores do mundo', tag: 'Para congelar', dias: [
    ['Frango recheado com espinafre e ricota', 'Purê de batata-doce', 'Legumes'],
    ['Lombo suíno ao molho de mostarda', 'Purê de mandioquinha', 'Vagem'],
    ['Sobrecoxa desossada ao curry suave', 'Arroz basmati', 'Legumes'],
    ['Bife bourguignon', 'Purê de batata', 'Cenouras'],
    ['Almôndegas ao molho de tomate', 'Purê de cenoura', 'Brócolis'],
  ] },
  { n: 3, tema: 'Comfort food com técnica', tag: 'Para congelar', dias: [
    ['Filet mignon ao molho de mostarda', 'Purê de batata-doce', 'Legumes'],
    ['Sobrecoxa assada com alho, limão e ervas', 'Arroz', 'Legumes'],
    ['Hambúrguer artesanal', 'Polenta cremosa', 'Legumes'],
    ['Frango xadrez em versão leve', 'Arroz', 'Legumes'],
    ['Carne desfiada ao molho', 'Arroz integral', 'Purê de batata', 'Legumes'],
  ] },
  { n: 4, tema: 'Preparações especiais', tag: 'Para congelar', dias: [
    ['Ragu de carne', 'Purê de batata', 'Legumes verdes'],
    ['Sobrecoxa ao molho de tomate e azeitonas', 'Arroz', 'Abobrinha'],
    ['Salmão em molho cremoso de limão', 'Arroz de jasmim', 'Brócolis'],
    ['Kafta de carne ao molho', 'Arroz com lentilha', 'Legumes'],
    ['Filet mignon ao molho de vinho', 'Purê de batata-doce', 'Legumes'],
  ] },
];

const travessas = [
  ['Lasanha de berinjela', 'com ragu de carne', false],
  ['Fricassê de frango', 'em travessa maior', false],
  ['Escondidinho de mandioca', 'com carne seca e bastante carne desfiada', false],
  ['Moussaka de carne', 'com berinjela e batata', true],
  ['Massa ao forno', 'com ragu de linguiça e abobrinha', true],
];
const lanches = [
  ['4', 'Sanduíches caprese com frango'],
  ['3', 'Sanduíches caprese com carne (rosbife)'],
  ['1', 'Frango desfiado com cenoura e ricota'],
  ['1', 'Peru com queijo e rúcula'],
  ['1', 'Carne louca com queijo'],
];
const opcoes = [
  { nome: 'Entrega semanal', valor: 400, desc: 'Maior frequência de entrega e organização das porções ao longo do mês.' },
  { nome: 'Entrega quinzenal', valor: 300, desc: 'Duas entregas no período, reduzindo deslocamentos e facilitando o armazenamento.' },
  { nome: 'Entrega mensal', valor: 200, desc: 'Toda a produção é entregue junto com as marmitas do mês.', checked: true },
];

const kicker = (num, txt) => `<div class="kicker reveal"><b>${num}</b><span class="rule"></span><span>${txt}</span></div>`;
const waIcon = (c) => `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="${c}" d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zm5.8 14.13c-.25.69-1.44 1.32-1.98 1.37-.51.05-.99.24-3.33-.69-2.81-1.11-4.6-3.99-4.74-4.17-.14-.18-1.13-1.5-1.13-2.87 0-1.36.71-2.03.97-2.31.25-.28.55-.35.73-.35l.53.01c.17.01.4-.06.62.48.23.55.78 1.91.85 2.05.07.14.11.3.02.48-.09.18-.14.3-.28.46-.14.16-.29.36-.41.48-.14.14-.28.29-.12.57.16.28.71 1.17 1.53 1.9 1.05.94 1.94 1.23 2.22 1.37.28.14.44.12.6-.07.16-.18.69-.81.88-1.09.18-.28.37-.23.62-.14.25.09 1.6.76 1.88.89.28.14.46.21.53.32.07.12.07.67-.18 1.36z"/></svg>`;

const weeks = semanas.map((s, k) => `
  <div class="week" id="semana-${s.n}" aria-label="Semana ${s.n}">
    <div class="weekhead"><div class="weekno">Semana ${s.n} <span class="tag ${s.n === 1 ? 'fresh' : ''}">${s.tag}</span></div><h3>${s.tema}</h3></div>
    <ol class="days">${s.dias.map((d, i) => `<li><span class="day" title="${DIAS[i][1]}">${DIAS[i][0]}</span><div><strong>${d[0]}</strong><small>${d.slice(1).join('<i>·</i>')}</small></div></li>`).join('')}</ol>
  </div>`).join('');

const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="${RED}">
<meta name="color-scheme" content="light">
<meta name="format-detection" content="telephone=no">
<title>Caçarola — Plano Mensal Personalizado · 2º mês</title>
<meta name="description" content="Proposta Caçarola Personal Chef — 2º mês do plano mensal: alimentação personalizada para 2 pessoas, de segunda a sexta-feira.">
<link rel="icon" href="${pot.red}">
<style>
${baseCss}
/* —— 2º mês —— */
p,.lead,.body,.spec dd,.notes p,.obs p,.timeline p{text-wrap:pretty;hyphens:auto;-webkit-hyphens:auto}
.j{text-align:justify;text-align-last:left}
.tag{display:inline-block;vertical-align:2px;margin-left:8px;font-size:10px;letter-spacing:.18em;padding:4px 9px 3px;border:1px solid var(--red);color:var(--red);border-radius:999px}
.tag.fresh{background:var(--red);color:#fff}
.tip{font-size:16px;line-height:1.5;color:var(--muted);margin-top:18px;padding-top:14px;border-top:1px solid var(--line)}
.tip b{color:var(--red);font-weight:600}
/* porcionamento */
.portions{display:grid;gap:12px;grid-template-columns:1fr 1fr}
.pcard{border:1px solid #E3D8D5;padding:16px 14px 14px;background:#fff}
.pcard h4{font-size:11px;letter-spacing:.24em;text-transform:uppercase;font-weight:600;color:var(--red);margin-bottom:10px}
.pcard dl>div{padding:8px 0;border-top:1px solid var(--line)}
.pcard dt{font-size:clamp(28px,8vw,36px);font-weight:300;color:var(--red);line-height:1}
.pcard dd{font-size:12px;letter-spacing:.14em;text-transform:uppercase;font-weight:600;margin-top:4px}
.pcard .foot-note{font-size:14px;color:var(--muted);line-height:1.35;margin-top:8px}
.rules{list-style:none;margin-top:26px;border-top:1px solid var(--ink)}
.rules li{display:grid;grid-template-columns:28px 1fr;padding:13px 0;border-bottom:1px solid var(--line);font-size:18px;line-height:1.45;color:var(--body)}
.rules li:before{content:"";width:8px;height:8px;border-radius:50%;background:var(--red);margin-top:9px}
.rules b{color:var(--ink);font-weight:600}
/* travessas & lanches */
.list{list-style:none;border-top:1px solid var(--ink);margin-top:30px}
.list li{display:grid;grid-template-columns:56px 1fr;align-items:center;padding:14px 0;border-bottom:1px solid var(--line)}
.list li>b{font-weight:300;font-size:44px;line-height:1;color:var(--red)}
.list strong{display:block;font-size:21px;font-weight:600;line-height:1.2}
.list small{display:block;font-size:16.5px;color:var(--muted);margin-top:2px;line-height:1.35}
.novo{display:inline-block;font-size:10px;letter-spacing:.2em;text-transform:uppercase;font-weight:600;background:var(--red);color:#fff;padding:3px 8px 2px;border-radius:999px;margin-left:6px;vertical-align:3px}
.alt{margin-top:18px;background:var(--blush);border-left:2px solid var(--red);padding:16px 18px;font-size:17px;line-height:1.5;color:var(--body)}
.alt b{color:var(--red);font-weight:600}
.torta{margin-top:30px;background:var(--red);color:#fff;padding:22px 22px 20px;position:relative;overflow:hidden}
.torta .t-h{font-size:11px;letter-spacing:.24em;text-transform:uppercase;font-weight:600;opacity:.9}
.torta h4{font-size:30px;font-weight:500;margin:6px 0 6px;line-height:1.1}
.torta p{font-size:17px;line-height:1.5;opacity:.95}
.torta img{position:absolute;right:-60px;bottom:-24px;width:240px;opacity:.5;pointer-events:none}
/* investimento */
.big{display:flex;align-items:flex-start;color:var(--red);margin:6px 0 4px}
.big .cur{font-size:22px;font-weight:500;margin:14px 6px 0 0}
.big .val{font-size:clamp(84px,24vw,120px);font-weight:300;line-height:.9;letter-spacing:-.03em}
.big .per{font-size:20px;font-weight:500;margin:14px 0 0 6px;line-height:1.15;color:var(--ink)}
.small-note{font-size:16px;color:var(--muted);margin-bottom:24px}
.modes{border-top:1px solid var(--ink)}
.modes .m{display:grid;grid-template-columns:1fr auto;gap:12px;align-items:center;padding:16px 0;border-bottom:1px solid var(--line);transition:background .3s}
.modes .m span{font-size:17px;line-height:1.35}
.modes .m span small{display:block;font-size:12px;letter-spacing:.16em;text-transform:uppercase;font-weight:600;color:var(--red);margin-bottom:3px}
.modes .m b{font-size:30px;font-weight:400;color:var(--red);white-space:nowrap}
.modes .m.on{background:var(--blush);box-shadow:-12px 0 0 var(--blush),12px 0 0 var(--blush)}
.ritmo{margin-top:18px;font-size:17px;line-height:1.5;color:var(--body);display:flex;gap:12px;align-items:flex-start}
.ritmo svg{flex:none;width:22px;height:22px;margin-top:2px}
/* encerramento: botão suave */
.wa{background:rgba(255,255,255,.12);color:#fff;border:1px solid rgba(255,255,255,.55);box-shadow:none;backdrop-filter:blur(4px)}
.wa small{color:#fff;opacity:.9}
.wa b{color:#fff}
/* camadas de fundo sutis */
section.block{position:relative;overflow:hidden}
section.block:before{content:"";position:absolute;width:260px;height:260px;left:-150px;top:40px;border-radius:50%;border:1px solid rgba(227,29,38,.08);box-shadow:0 0 0 26px rgba(227,29,38,.025);pointer-events:none}
section.block>.wrap{position:relative}
.wm{position:absolute;right:-90px;bottom:-10px;width:300px;opacity:1;pointer-events:none}
/* barra superior com as semanas */
.bar{display:block;padding-bottom:8px}
.bar-top{display:flex;justify-content:space-between;align-items:center}
.weeknav{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:8px}
.weeknav a{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:44px;border:1px solid rgba(227,29,38,.45);color:var(--red);text-decoration:none;font-size:18px;font-weight:600;line-height:1;border-radius:4px;transition:background .25s,color .25s;-webkit-tap-highlight-color:transparent}
.weeknav a small{font-size:9px;letter-spacing:.2em;text-transform:uppercase;font-weight:600;margin-bottom:3px;color:var(--ink)}
.weeknav a.on{background:var(--red);color:#fff;border-color:var(--red)}
.weeknav a.on small{color:#fff}
.week{scroll-margin-top:calc(128px + env(safe-area-inset-top))}
.week+.week{margin-top:64px}
/* sem quebras órfãs */
h1,h2,h3,h4,.when,.motto{text-wrap:balance}
.nb,.pcard dt{white-space:nowrap}
.pcard dt{font-size:clamp(24px,6.8vw,34px)}
/* animação: só esconde se o JS rodou (classe .anim no <html>) */
.reveal{opacity:1;transform:none}
.anim .reveal{opacity:0;transform:translateY(18px);transition:opacity .9s cubic-bezier(.2,.7,.2,1),transform .9s cubic-bezier(.2,.7,.2,1)}
.anim .reveal.in{opacity:1;transform:none}
.anim .stagger>*{opacity:0;transform:translateY(12px);transition:opacity .7s cubic-bezier(.2,.7,.2,1),transform .7s cubic-bezier(.2,.7,.2,1)}
.anim .stagger.in>*{opacity:1;transform:none}
${[1,2,3,4,5,6,7,8].map(i=>`.anim .stagger.in>*:nth-child(${i}){transition-delay:${(i-1)*80}ms}`).join('\n')}
.progress{position:fixed;left:0;top:0;height:2px;width:100%;background:var(--red);transform-origin:0 50%;transform:scaleX(0);z-index:30;pointer-events:none}
@media (prefers-reduced-motion:reduce){.anim .reveal,.anim .stagger>*{opacity:1!important;transform:none!important;transition:none!important}.progress{display:none}}
@media print{.anim .reveal,.anim .stagger>*{opacity:1!important;transform:none!important}.week[data-hide]{display:block!important}}
</style>
</head>
<body>
<div class="progress" id="progress" aria-hidden="true"></div>

<header class="bar" id="bar">
  <div class="bar-top">
    <a href="#topo" aria-label="Voltar ao início"><img src="${logo.red}" alt="Caçarola Personal Chef"></a>
    <a class="pill" href="${WA}" target="_blank" rel="noopener">${waIcon('#fff')}Falar com a chef</a>
  </div>
  <nav class="weeknav" aria-label="Ir para a semana do cardápio">
    ${semanas.map((s) => `<a href="#semana-${s.n}" data-w="${s.n}"><small>Semana</small>${s.n}</a>`).join('')}
  </nav>
</header>

<main>
<section class="hero" id="topo">
  <img class="hero-pot" src="${pot.redSoft}" alt="">
  <div class="hero-logo"><img src="${logo.white}" alt="Caçarola Personal Chef"></div>
  <div class="hero-body">
    <div class="eyebrow">Proposta exclusiva · 2º mês</div>
    <h1>Plano Mensal <span>Personalizado</span></h1>
    <div class="hrule"></div>
    <p>Alimentação personalizada para 2 pessoas<br>Segunda a sexta-feira</p>
  </div>
  <div class="hero-foot"><span>Chef Mariana · Nov 2026</span><a class="cue" href="#apresentacao">Descubra <i></i></a></div>
</section>

<section class="block" id="apresentacao"><div class="wrap">
  ${kicker('—', 'Apresentação')}
  <h2 class="reveal">Praticidade, variedade e <em>comida de verdade.</em></h2>
  <p class="lead reveal j">Um segundo mês construído a partir do que vocês mais amaram no primeiro: <b>os favoritos ficam</b>, <em>o porcionamento aumenta</em> e entram <em>novas preparações pensadas para congelar bem</em>.</p>
  <div class="stats stagger">
    <div><strong>2</strong><span>pessoas</span></div>
    <div><strong>40</strong><span>marmitas<br>de almoço</span></div>
    <div><strong>20</strong><span>dias úteis<br>seg — sex</span></div>
  </div>
</div></section>

<section class="block" id="plano"><div class="wrap">
  ${kicker('01', 'Plano mensal')}
  <h2 class="reveal">Almoços</h2>
  <div class="price reveal"><span class="cur">R$</span><span class="val">450</span><span class="per">,00<br>/ mês</span></div>
  <dl class="spec stagger">
    <div><dt>Inclui</dt><dd><strong>40 marmitas de almoço</strong><small>20 para cada pessoa · 20 dias úteis. <em>Marmitas cheias, com porcionamento reforçado.</em></small></dd></div>
    <div><dt>Personal shopper</dt><dd><strong>Compras pela Caçarola</strong><small>Realizadas conforme lista e planejamento do cardápio.</small></dd></div>
    <div><dt>Ingredientes</dt><dd><strong>Não inclusos no valor do serviço</strong><small>Serão pagos pelo casal. Com as porções maiores, a estimativa será atualizada.</small></dd></div>
  </dl>
</div></section>

<section class="block" id="porcionamento"><div class="wrap">
  ${kicker('02', 'Novo porcionamento')}
  <h2 class="reveal">Marmitas cheias, <em>do jeito que vocês pediram.</em></h2>
  <div class="portions stagger">
    <div class="pcard"><h4>Marmita Carol</h4><dl>
      <div><dt>150 g</dt><dd>proteína</dd></div>
      <div><dt>100 g</dt><dd>carboidrato</dd></div>
      <div><dt>200 g</dt><dd>legumes</dd></div>
    </dl><p class="foot-note">+ o que couber no espaço</p></div>
    <div class="pcard"><h4>Marmita João</h4><dl>
      <div><dt>150–200 g</dt><dd>proteína</dd></div>
      <div><dt>150–200 g</dt><dd>carboidrato</dd></div>
      <div><dt>extra</dt><dd>legumes</dd></div>
    </dl><p class="foot-note">legumes só se sobrar espaço</p></div>
  </div>
  <h3 class="sub reveal">Regras <em>da cozinha</em></h3>
  <ul class="rules stagger">
    <li><span><b>Proteína pesada só da carne</b>, sem cebola, alho-poró etc.</span></li>
    <li><span><b>Marmitas sempre cheias</b>, até o limite do recipiente.</span></li>
    <li><span><b>Mais proteína e carboidrato</b> nos pratos leves (frango, peixe, salmão, cuscuz).</span></li>
    <li><span><b>Legumes extras em vasilha separada</b>, no lugar da salada.</span></li>
  </ul>
  <p class="alt reveal j"><b>Abóbora saiu das marmitas de carne desfiada.</b> Quando houver abóbora ou batata-doce, contam como carboidrato.</p>
</div></section>

<section class="block" id="cardapio"><div class="wrap">
  ${kicker('03', 'Cardápio sugerido · 2º mês')}
  <h2 class="reveal">Quatro semanas, <em>quatro viagens.</em></h2>
  <div id="weeks">${weeks}</div>
  <p class="tip reveal j"><b>Legumes extras em vasilha separada</b>, no lugar da salada. Cardápio sujeito a ajustes conforme preferências e rotina do casal.</p>
</div></section>

<section class="block" id="cronograma"><div class="wrap">
  ${kicker('04', 'Cronograma')}
  <h2 class="reveal">Próximos <em>passos.</em></h2>
  <ol class="timeline stagger">
    <li class="first"><span class="dot"></span><div class="when">A confirmar</div><strong>Vasilhas e cartões</strong><p>Envio das vasilhas de marmita e dos cartões (10/11 ou 19/11).</p></li>
    <li><span class="dot"></span><div class="when">22/11/2026</div><strong>2ª entrega</strong><p>Segundo plano mensal, com as comidas prontas.</p></li>
    <li><span class="dot"></span><div class="when">Após o fim do ano</div><strong>Reavaliação</strong><p>Reavaliação do formato para 2027, com possibilidade de migração para o plano quinzenal.</p></li>
  </ol>
</div></section>

</main>

<footer class="closing">
  <img class="hero-pot" src="${pot.redSoft}" alt="">
  <div class="inner">
    <img class="clogo reveal" src="${logo.white}" alt="Caçarola Personal Chef">
    <p class="motto reveal">comida de verdade, feita com carinho e técnica.</p>
    <div class="hrule"></div>
    <div class="sig">Mariana · Chef de Cozinha · PUC-PR</div>
    <a class="wa" href="${WA}" target="_blank" rel="noopener">${waIcon('#fff')}<span><small>Fale comigo no WhatsApp</small><b>${WHATS}</b></span></a>
    <div class="cfoot"><span>Caçarola</span><span>Personal Chef</span></div>
  </div>
</footer>

<script>
(function(){
  var d=document.documentElement;
  // Botões de semana: realça a semana que está na tela
  try{
    var links=document.querySelectorAll('.weeknav a'),wk=[1,2,3,4].map(function(n){return document.getElementById('semana-'+n)});
    function act(){var y=window.innerHeight*0.35,cur=0;for(var k=0;k<wk.length;k++){if(wk[k].getBoundingClientRect().top<y)cur=k+1}for(var k=0;k<links.length;k++){links[k].classList.toggle('on',k+1===cur)}}
    window.addEventListener('scroll',act,{passive:true});act();
    for(var k=0;k<links.length;k++)links[k].addEventListener('click',function(e){var t=document.getElementById('semana-'+this.getAttribute('data-w'));if(!t)return;e.preventDefault();t.querySelectorAll('.reveal,.stagger').forEach(function(x){x.classList.add('in')});t.scrollIntoView({behavior:'smooth',block:'start'});history.replaceState&&history.replaceState(null,'','#semana-'+this.getAttribute('data-w'))});
  }catch(e){}
  // Barra superior e progresso de leitura
  try{
    var bar=document.getElementById('bar'),hero=document.getElementById('topo'),pg=document.getElementById('progress'),tick=false;
    function onScroll(){if(tick)return;tick=true;requestAnimationFrame(function(){var y=window.pageYOffset,h=d.scrollHeight-window.innerHeight;pg.style.transform='scaleX('+(h>0?Math.min(1,y/h):0)+')';bar.classList.toggle('show',y>hero.offsetHeight*0.8);tick=false})}
    window.addEventListener('scroll',onScroll,{passive:true});onScroll();
  }catch(e){}
  // Animação de entrada — à prova de falhas:
  // o conteúdo só é escondido depois que tudo abaixo está pronto; qualquer erro ou atraso revela tudo.
  try{
    if(!('IntersectionObserver' in window))return;
    if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    var els=document.querySelectorAll('.reveal,.stagger');
    function revealAll(){for(var k=0;k<els.length;k++)els[k].classList.add('in')}
    var io=new IntersectionObserver(function(es){es.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}})},{rootMargin:'0px 0px -8% 0px',threshold:0.01});
    for(var k=0;k<els.length;k++)io.observe(els[k]);
    // o que já está na tela aparece de imediato
    var vh=window.innerHeight||800;for(var k=0;k<els.length;k++){var r=els[k].getBoundingClientRect();if(r.top<vh)els[k].classList.add('in')}
    d.classList.add('anim');
    // travas: se o observador não disparar, revela tudo
    var safety=setTimeout(revealAll,4000);
    window.addEventListener('scroll',function(){clearTimeout(safety);safety=setTimeout(revealAll,4000)},{passive:true});
    window.addEventListener('beforeprint',revealAll);window.addEventListener('pagehide',revealAll);
    document.addEventListener('visibilitychange',function(){if(document.hidden)revealAll()});
  }catch(e){d.classList.remove('anim')}
})();
</script>
</body>
</html>`;

const NB='\u00A0';
const fix=(t)=>t
  .replace(/(\d)\s+(?=[^\s<])/g,'$1'+NB)            // número + palavra/unidade (150 g, 20 dias, 22/11 com…)
  .replace(/R\$\s+/g,'R$'+NB)                         // R$ 450
  .replace(/\s+([–—·+])\s+/g,NB+'$1 ')               // separadores não começam linha
  .replace(/(^|\s)([aeoàéAEO]|de|da|do|em|no|na|um|ao|os|as|e)\s+/g,(m,p,w)=>p+w+NB); // palavra curta não fica sozinha no fim da linha
const parts=html.split(/(<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>)/);
const fixed=parts.map((p)=>p.startsWith('<')?p:fix(p));
// última linha nunca com uma palavra só: cola as duas últimas palavras antes do fechamento de um bloco de texto
for(let i=0;i<fixed.length-1;i++){
  const t=fixed[i];
  if(t.startsWith('<')||!/\S/.test(t))continue;
  let k=i+1;while(k<fixed.length&&(fixed[k]===''||/^<\/(em|b|i|span)>$/.test(fixed[k])))k++;
  if(!/^<\/(p|strong|small|h[1-4]|li|dd|dt|div|span|a|aside)>$/.test(fixed[k]||''))continue;
  const m=t.match(/^([\s\S]*\S)\s+(\S+\s*)$/);
  if(m&&(m[1].split(/\s/).pop().length+m[2].length)<=24)fixed[i]=m[1]+NB+m[2];
}
const out=fixed.join('');
fs.writeFileSync('Proposta_Cacarola_Plano_Mensal_Mes2.html', out);
console.log('ok', (html.length / 1024).toFixed(0) + 'KB');
