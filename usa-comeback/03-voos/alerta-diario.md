# Alerta diário de voos — CVG → GRU

## Especificação (do briefing)

| Campo | Valor |
|---|---|
| Rota | **CVG** (Cincinnati/N. Kentucky) → **GRU** (Guarulhos), ida e volta |
| Ida | 2ª semana de dez/2026 (07–13/12) |
| Volta | penúltima / última semana de jan/2027 (18–31/01) |
| Envio | **08h BRT, seg–sáb** (domingo folga) |
| Para | jr.conductor83@gmail.com + e-mail da Paula `[ABERTO: gandarp@gmail.com ou gandarp107@gmail.com?]` |
| Conteúdo | Tabela com melhores tarifas (Google Flights + outros) + recomendação: **comprar já / esperar / oportunidade fora da curva** |
| Log | Cada envio grava uma linha por tarifa em [`precos.csv`](precos.csv) para ver a tendência |

## Aeroportos alternativos a comparar

Ida da Paula (Oxford, OH): **CVG** (~1 h), **DAY** Dayton (~1 h), **CMH** Columbus (~2 h), **IND** Indianápolis (~2 h). Conexões típicas: ATL (Delta, direto ATL–GRU), MIA (American/LATAM), IAH (United), JFK/EWR, CLT.

## Limitação honesta

Não há API de tarifas conectada a esta sessão. A busca diária usa **pesquisa web** (Google Flights, Kayak, Momondo, Expedia, Skyscanner). Resultado: faixas e snapshots, não cotação ao vivo com datas exatas. Para preço exato: usar o **alerta de preço do próprio Google Flights** (grátis) com as datas — o relatório diário complementa com análise e tendência.

## Leitura inicial (18/10) `[PESQUISA + INFERÊNCIA]`

- Snapshots da rota fora de temporada: **US$ 680–1.100** ida e volta (Expedia, Cheapflights, AA, Google Flights).
- Dez–jan é alta temporada (férias BR + festas) → esperar **US$ 1.000–1.600**.
- Para internacional de fim de ano, a janela boa de compra costuma ser **2–4 meses antes** → **estamos dentro dela agora**. Recomendação preliminar: definir datas exatas e comprar até **meados de novembro**; esperar além disso tende a encarecer.
- Voar ida em **ter/qua** e evitar volta no 1º fim de semana de jan.
