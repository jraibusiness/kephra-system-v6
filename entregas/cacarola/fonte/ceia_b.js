const { chromium } = require('playwright-core');
const F='file://'+process.cwd()+'/Proposta_Cacarola_Ceia_de_Natal.html';
const vis=(p,sel)=>p.evaluate(s=>[...document.querySelectorAll(s)].filter(e=>e.offsetParent!==null&&getComputedStyle(e).display!=='none').map(e=>e.innerText.replace(/\s+/g,' ').trim()),sel);
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1243/chrome-linux64/chrome'});
 for(const mode of ['semJS','comJS','comJS-sem-has']){
  const ctx=await b.newContext({viewport:{width:390,height:664},deviceScaleFactor:2,isMobile:true,hasTouch:true,javaScriptEnabled:mode!=='semJS'});
  if(mode==='comJS-sem-has')await ctx.addInitScript(()=>{const o=CSS.supports.bind(CSS);CSS.supports=function(a,b){if(String(a).includes(':has'))return false;return b===undefined?o(a):o(a,b)}});
  const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.goto(F);await p.waitForTimeout(500);
  const hidden=async()=>p.evaluate(()=>{const d=document.getElementById('deck'),i=Math.round(d.scrollLeft/d.clientWidth),s=document.querySelectorAll('.slide')[i];return [s.id,[...s.querySelectorAll('.rv')].filter(e=>getComputedStyle(e).opacity<0.99).length]});
  // navegar pelas setas (links) até o slide de escolha
  for(let k=0;k<11;k++){await p.click('.slide:nth-child('+(k+1)+') .nav.next');await p.waitForTimeout(mode==='semJS'?150:700)}
  const at=await hidden();
  // escolhas
  if(mode==='semJS'){await p.evaluate(()=>document.getElementById('escolha').scrollIntoView())}
  const t0=await vis(p,'#resumo .tot');
  await p.click('label.pk:nth-child(2)');await p.click('label.tg:nth-of-type(1)');await p.click('label.tg:nth-of-type(3)');
  const r1=[await vis(p,'#resumo .tot'),await vis(p,'#resumo .s-opt, #resumo .s-op'),await vis(p,'#resumo .t-lc')];
  const href=await p.evaluate(()=>{const a=[...document.querySelectorAll('#resumo .wa-btn')].filter(e=>getComputedStyle(e).display!=='none');return a.map(x=>decodeURIComponent(x.href.split('text=')[1]||''))});
  await p.click('label.pk:nth-child(1)');await p.click('label.tg:nth-of-type(2)');
  const r2=await vis(p,'#resumo .tot');
  console.log(`\n[${mode}] slide após 11 toques:`,at,'\n sem escolha:',t0,'\n B+shopper+louça:',JSON.stringify(r1),'\n WhatsApp:',JSON.stringify(href),'\n A+shopper+pré-preparo+louça:',r2,'\n erros:',errs);
  if(mode==='comJS'){
   // teclado e "deslizar": idle sem nada escondido
   await p.keyboard.press('ArrowLeft');await p.waitForTimeout(800);console.log(' após ←:',await hidden());
   await p.evaluate(()=>{const d=document.getElementById('deck');d.style.scrollBehavior='auto';d.scrollLeft=d.clientWidth*2});await p.waitForTimeout(1500);console.log(' após deslizar p/ slide 3:',await hidden());
   const all=await p.evaluate(()=>[...document.querySelectorAll('.slide')].map(s=>s.classList.contains('in')?1:0).join(''));console.log(' slides já revelados:',all);
  }
 }
 await b.close()})();
