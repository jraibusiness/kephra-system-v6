# Alerta diário de voos — CVG → GRU

## Especificação

| Campo | Valor |
|---|---|
| Rota | **CVG** → **GRU**, ida e volta, 1 adulto, econômica |
| Grade de datas | ida 08, 09, 10, 12/12/2026 × volta 19, 20, 26/01/2027 (12 combinações) |
| Envio | ~**08h BRT, seg–sáb** (domingo folga) — tarefa agendada no Claude Code |
| Para | jr.conductor83@gmail.com + gandarp@gmail.com |
| Fonte | **Kayak** via navegador headless ([`scraper/kayak.js`](scraper/kayak.js)) |
| Histórico | [`precos.csv`](precos.csv) (uma linha por data × métrica, todo dia) |
| E-mail | [`scraper/report.js`](scraper/report.js) gera o HTML (veredito, 3 indicadores, tabela, link por data) |

**Google Flights:** testado em 18/10 — bloqueia acesso automatizado (captcha "unusual traffic"). Por isso a fonte é o Kayak. Complemento recomendado: ativar o **"Acompanhar preços"** do Google Flights nas datas finais (o próprio Google manda e-mail quando o preço muda).

## Como rodar

```bash
cd usa-comeback/03-voos/scraper
NODE_PATH=$(npm root -g) node kayak.js > /tmp/grid.json      # ~5 min
node report.js /tmp/grid.json > /tmp/email.html               # grava precos.csv
```

## Regras do veredito (report.js)

| Condição | Veredito |
|---|---|
| Melhor 1 escala ≤ US$ 1.250 | 🟢 OPORTUNIDADE — comprar hoje |
| Faltam ≤ 45 dias para 08/12, ou 1 escala subiu vs. ontem | 🟠 COMPRAR JÁ |
| Caso contrário | 🔵 MONITORAR |

## 1ª leitura real — 18/10/2026 (Kayak)

| | US$ | Datas | Detalhe |
|---|---|---|---|
| Mais barato | **1.112** | 09/12 → 20/01 | Copa, 2 escalas, 25h |
| Melhor 1 escala | **1.284** | 08/12 → 26/01 · 09/12 → 20/01 · 10/12 → 19/01 | — |
| Mais rápido | **1.322** | 08 ou 09/12 | ~13h (LATAM) |
| Sábado 12/12 | +US$ 100–400 | — | evitar |

**Leitura:** a diferença entre o mais barato (2 escalas, 18–25h) e o voo de ~13h é de só **US$ 150–200** → vale pagar o voo rápido. Ida **ter/qua 08–10/12**, nunca no sábado. Preços dentro do esperado para a temporada; comprar quando as datas estiverem fechadas, idealmente antes de **~24/10 (45 dias)**.
