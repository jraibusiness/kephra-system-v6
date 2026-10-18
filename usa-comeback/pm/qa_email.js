// QA obrigatório antes de enviar qualquer e-mail HTML do projeto.
// Uso: NODE_PATH=$(npm root -g) node qa_email.js arquivo.html [saida_prefixo]
// Falha (exit 1) se algum link/botão ficar ilegível quando o cliente descarta o fundo do <a>
// (comportamento do Gmail iOS no modo escuro), ou se houver link sem href.
// Gera prints: <prefixo>-claro.png e <prefixo>-escuro.png (modo escuro forçado do Chromium).
const { chromium } = require('playwright');
const path = require('path');

const file = path.resolve(process.argv[2]);
const prefix = process.argv[3] || file.replace(/\.html$/, '');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } }); // tela de iPhone
  await page.goto('file://' + file);
  const problems = await page.evaluate(() => {
    // Simula o Gmail: remove `background:` abreviado (só `background-color` sobrevive)
    document.querySelectorAll('[style]').forEach(el => {
      const st = el.getAttribute('style');
      if (/(^|;)\s*background\s*:/i.test(st)) el.setAttribute('style', st.replace(/(^|;)\s*background\s*:[^;]*/ig, '$1'));
    });
    const parse = c => (c.match(/[\d.]+/g) || []).map(Number);
    const lum = ([r, g, b]) => {
      const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
    const bgOf = (el, self) => {
      // links: ignora o fundo do próprio <a> (clientes de e-mail costumam descartá-lo)
      for (let n = self ? el : el.parentElement; n; n = n.parentElement) {
        const c = parse(getComputedStyle(n).backgroundColor);
        if (c.length >= 3 && (c.length < 4 || c[3] > 0)) return c.slice(0, 3);
      }
      return [255, 255, 255];
    };
    const out = [];
    if (document.body.innerText.trim().length < 200) out.push('e-mail vazio ou quase vazio');
    document.querySelectorAll('a').forEach(a => {
      const text = a.innerText.trim();
      if (!a.getAttribute('href')) out.push(`link sem href: "${text}"`);
      const ratio = contrast(parse(getComputedStyle(a).color).slice(0, 3), bgOf(a));
      if (text && ratio < 3) out.push(`ilegível sem o fundo do link (contraste ${ratio.toFixed(2)}): "${text}"`);
    });
    // todo elemento com texto próprio precisa de contraste >= 3 contra o fundo efetivo
    document.querySelectorAll('body *').forEach(el => {
      if (el.tagName === 'A' || el.closest('a')) return;
      const own = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join(' ').trim();
      if (!own || !/[A-Za-zÀ-ú0-9]/.test(own)) return;
      const ratio = contrast(parse(getComputedStyle(el).color).slice(0, 3), bgOf(el, true));
      if (ratio < 3) out.push(`texto ilegível (contraste ${ratio.toFixed(2)}): "${own.slice(0, 50)}"`);
    });
    // barras/blocos que dependem de cor de fundo e ficaram invisíveis
    document.querySelectorAll('div,td,span').forEach(el => {
      const r = el.getBoundingClientRect();
      if (el.children.length === 0 && !el.innerText.trim() && r.height > 0 && r.height <= 24 && r.width > 0) {
        const c = parse(getComputedStyle(el).backgroundColor);
        if (c.length < 3 || (c.length === 4 && c[3] === 0)) out.push(`barra/bloco sem cor (sumiu no Gmail): ${el.outerHTML.slice(0, 80)}`);
      }
    });
    return out;
  });
  await page.screenshot({ path: prefix + '-claro.png', fullPage: true });
  await browser.close();

  const dark = await chromium.launch({ args: ['--blink-settings=forceDarkModeEnabled=true'] });
  const dpage = await dark.newPage({ viewport: { width: 390, height: 844 }, colorScheme: 'dark' });
  await dpage.goto('file://' + file);
  await dpage.screenshot({ path: prefix + '-escuro.png', fullPage: true });
  await dark.close();

  if (problems.length) { console.error('QA REPROVADO:\n- ' + problems.join('\n- ')); process.exit(1); }
  console.log(`QA OK · prints: ${prefix}-claro.png, ${prefix}-escuro.png`);
})();
