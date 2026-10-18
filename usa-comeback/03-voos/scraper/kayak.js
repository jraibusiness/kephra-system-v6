// Busca tarifas CVG→GRU no Kayak para uma grade de datas e imprime JSON.
// Uso: NODE_PATH=$(npm root -g) node kayak.js [ORIG] [DEST] "2026-12-08,2026-12-09" "2027-01-19,2027-01-20"
const { chromium } = require('playwright');

const [orig = 'CVG', dest = 'GRU',
  deps = '2026-12-08,2026-12-09,2026-12-10,2026-12-12',
  rets = '2027-01-19,2027-01-20,2027-01-22,2027-01-26'] = process.argv.slice(2);

const money = s => (s && s.match(/\$[\d,]+/) ? Number(s.match(/\$([\d,]+)/)[1].replace(/,/g, '')) : null);

async function search(ctx, dep, ret) {
  const page = await ctx.newPage();
  const url = `https://www.kayak.com/flights/${orig}-${dest}/${dep}/${ret}?sort=price_a`;
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForFunction(() => /Cheapest\s*\n?\s*\$/.test(document.body.innerText), null, { timeout: 60000 });
    await page.waitForTimeout(4000);
    const text = await page.evaluate(() => document.body.innerText);
    const grab = label => { const m = text.match(new RegExp(label + '\\s*\\n?\\s*(\\$[\\d,]+)\\s*•\\s*([\\dhm ]+)')); return m ? { usd: money(m[1]), duration: m[2].trim() } : null; };
    const stopsMin = {};
    for (const [k, label] of [['nonstop', 'Nonstop'], ['one_stop', '1 stop'], ['two_plus', '2\\+ stops']]) {
      const m = text.match(new RegExp('\\n' + label + '\\s*\\n\\s*(\\$[\\d,]+)'));
      stopsMin[k] = m ? money(m[1]) : null;
    }
    const top = await page.$$eval('[class*="result-item-container"]', els => els.slice(0, 5).map(e => {
      const lines = e.innerText.split('\n').map(l => l.trim()).filter(Boolean)
        .filter(l => !/^Go to (next|previous|price|result)/.test(l));
      const price = lines.find(l => /^\$[\d,]+$/.test(l));
      const legs = [];
      lines.forEach((l, i) => { if (/\d:\d\d [ap]m – /.test(l)) legs.push({ times: l, airline: lines[i + 1], stops: lines[i + 2] }); });
      return { price, legs: legs.slice(0, 2) };
    }));
    return { dep, ret, url, cheapest: grab('Cheapest'), best: grab('Best'), quickest: grab('Quickest'), stopsMin, top };
  } catch (e) {
    return { dep, ret, url, error: e.message.split('\n')[0] };
  } finally { await page.close(); }
}

(async () => {
  const browser = await chromium.launch({
    proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined,
    args: ['--disable-blink-features=AutomationControlled'],
  });
  const ctx = await browser.newContext({
    locale: 'en-US', viewport: { width: 1366, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  });
  const out = [];
  for (const d of deps.split(',')) for (const r of rets.split(',')) out.push(await search(ctx, d, r));
  await browser.close();
  console.log(JSON.stringify({ checked_at: new Date().toISOString(), orig, dest, results: out }, null, 2));
})();
