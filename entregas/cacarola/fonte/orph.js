const { chromium } = require('playwright-core');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1243/chrome-linux64/chrome'});
const f='file://'+process.cwd()+'/Proposta_Cacarola_Plano_Mensal_Mes2.html';
for (const w of [320,360,375,390,393,414,430]){
 const p=await (await b.newContext({viewport:{width:w,height:844},deviceScaleFactor:3,isMobile:true,javaScriptEnabled:false})).newPage();await p.goto(f);await p.evaluate(()=>document.fonts.ready);
 const r=await p.evaluate(()=>{
  const isBlock=el=>{const d=getComputedStyle(el).display;return !d.startsWith('inline')};
  const groups=new Map();const split=[];
  const tw=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;
  while(n=tw.nextNode()){const pe=n.parentElement;if(!pe||pe.closest('script,style,svg')||!pe.offsetParent&&getComputedStyle(pe).position!=='fixed')continue;
   let blk=pe;while(blk&&!isBlock(blk))blk=blk.parentElement;
   const re=/[^\s ]+/g;let m;while(m=re.exec(n.textContent)){const rg=document.createRange();rg.setStart(n,m.index);rg.setEnd(n,m.index+m[0].length);const rc=[...rg.getClientRects()].filter(x=>x.width>0);if(!rc.length)continue;
    const tops=new Set(rc.map(x=>Math.round(x.top)));if(tops.size>1)split.push(m[0]);
    if(!groups.has(blk))groups.set(blk,[]);groups.get(blk).push({w:m[0],t:Math.round(rc[0].top),br:false})}}
  const out=[];
  groups.forEach((ws,blk)=>{const lines=[];ws.forEach(x=>{let L=lines.find(l=>Math.abs(l.t-x.t)<4);if(!L){L={t:x.t,ws:[]};lines.push(L)}L.ws.push(x.w)});
   if(lines.length<2)return;
   const hasBr=blk.querySelector('br');
   lines.forEach(L=>{const short=L.ws.every(x=>x.replace(/[^\p{L}\p{N}]/gu,'').length<=2);if((L.ws.length===1&&!hasBr)||short)out.push(`[${L.ws.join(' ')}] ← ${blk.textContent.trim().replace(/\s+/g,' ').slice(0,60)}`)})});
  return {out,split,sw:document.documentElement.scrollWidth}});
 console.log(w,'scrollW',r.sw,'orphans',r.out.length?r.out:'none','hyphen-splits',r.split.length?r.split:'none');
}
await b.close()})();
