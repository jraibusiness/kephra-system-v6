// Mede a folga de cada parágrafo justificado e devolve os que ficariam com espaços grandes demais.
const { chromium } = require('playwright-core');
const fs=require('fs');
(async()=>{const file=process.argv[2],TH=+process.argv[3]||0.32,write=process.argv[4]==='write';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1243/chrome-linux64/chrome'});
const html=fs.readFileSync(file,'utf8');const worst={};
for(const w of [360,375,390,393,402,414,430]){
 const p=await (await b.newContext({viewport:{width:w,height:844},javaScriptEnabled:false})).newPage();await p.setContent(html);await p.evaluate(()=>document.fonts.ready);
 const r=await p.evaluate(()=>[...document.querySelectorAll('[data-j]')].map(el=>{
  el.style.textAlign='left';const cs=getComputedStyle(el),fs=parseFloat(cs.fontSize);
  const box=el.getBoundingClientRect(),L=box.left+parseFloat(cs.paddingLeft),W=box.width-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight);
  const lines=[];const tw=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);let n;
  while(n=tw.nextNode()){const re=/[^\s ]+/g;let m;while(m=re.exec(n.textContent)){const g=document.createRange();g.setStart(n,m.index);g.setEnd(n,m.index+m[0].length);const c=g.getClientRects()[0];if(!c)continue;let li=lines.find(x=>Math.abs(x.t-c.top)<4);if(!li){li={t:c.top,l:c.left,r:c.right,k:0};lines.push(li)}li.l=Math.min(li.l,c.left);li.r=Math.max(li.r,c.right);li.k++}}
  let mx=0;lines.slice(0,-1).forEach(li=>{if(li.k>1)mx=Math.max(mx,(W-(li.r-L))/(li.k-1)/fs)});
  el.style.textAlign='';return [el.dataset.j,+mx.toFixed(2),el.textContent.trim().slice(0,40)]}));
 r.forEach(([j,g,t])=>{if(!worst[j]||worst[j].g<g)worst[j]={g,t,w}});
}
const bad=Object.entries(worst).filter(([j,v])=>v.g>TH);
Object.entries(worst).forEach(([j,v])=>console.log(j.padStart(2),v.g.toFixed(2)+'em',v.g>TH?'→ ESQUERDA':'  justif.',v.t));
if(write){let out=html;bad.forEach(([j])=>{out=out.replace(new RegExp('class="([^"]*)\\bj" data-j="'+j+'"'),'class="$1jl" data-j="'+j+'"')});fs.writeFileSync(file,out);console.log('alinhados à esquerda:',bad.length)}
await b.close()})();
