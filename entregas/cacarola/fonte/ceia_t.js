// Testes da proposta da Ceia: encaixe vertical por slide, órfãs, rolagem horizontal, resumo com/sem JS, screenshots.
const { chromium } = require('playwright-core');
const F='file://'+process.cwd()+'/Proposta_Cacarola_Ceia_de_Natal.html';
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1243/chrome-linux64/chrome'});
 // 1) encaixe: viewports reais de Safari (barras visíveis) e pré-visualização
 for(const [w,h,tag] of [[375,548,'SE Safari'],[375,667,'SE tela'],[390,664,'iPhone 14 Safari'],[393,660,'15 Safari'],[430,746,'Pro Max Safari'],[390,780,'Quick Look'],[360,640,'Android']]){
  const p=await (await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:2,isMobile:true,hasTouch:true,javaScriptEnabled:false})).newPage();await p.goto(F);await p.evaluate(()=>document.fonts.ready);
  const r=await p.evaluate(()=>[...document.querySelectorAll('.slide')].map(s=>{const sc=s.querySelector('.sc');return [s.id,sc.scrollHeight-sc.clientHeight]}).filter(x=>x[1]>1));
  const bw=await p.evaluate(()=>[document.body.scrollWidth,innerWidth,document.body.scrollHeight,innerHeight]);
  console.log(`${w}x${h} ${tag}: excede →`,r.length?JSON.stringify(r):'nenhum','| body',bw.join(','));
 }
 await b.close()})();
