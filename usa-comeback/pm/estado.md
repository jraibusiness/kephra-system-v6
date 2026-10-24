# Estado das decisões — atualizado a cada rodada

| ID | Decisão | Aberta em | Prazo | João | Paula | Proposta | Conf. João | Conf. Paula | Status |
|---|---|---|---|---|---|---|---|---|---|
| D1 | Destino da viagem (opção 1, 2 ou 3) | 18/10 | 22/10 | — | — | — | — | — | aguardando respostas |
| D2 | Datas do voo da Paula | 18/10 | 21/10 (comprar até ~24/10) | — | 06/12 → 20/01 (21/10) | — | — | — | aguardando João |
| D2t | Tipo de voo (~13h direto-rápido / 1 escala / mais barato) | 21/10 | 22/10 | — | — | — | — | — | aguardando respostas |
| D3 | Desistência do divórcio DR25030206 | 18/10 | 23/10 | — | — | — | — | — | aguardando respostas |
| D4 | Impressões gerais sobre o plano de visto | 18/10 | 23/10 | — | — | — | — | — | aguardando respostas |

## Log
- 18/10 19h50 BRT — kickoff enviado (D1–D4).
- 18/10 20h15 BRT — kickoff reenviado corrigido (botões/cabeçalho ilegíveis no Gmail iOS); "Nossa viagem" e "Visto" reenviados corrigidos. QA obrigatório instituído.
- 19/10 08h00 BRT — rodada da manhã: **nenhuma resposta** de João nem de Paula para D1–D4. Enviado lembrete ⏰ (D2 vence ter 20/10) + alerta de voos (mais barato US$ 1.157, +45; 1 escala US$ 1.284 estável; ~13h US$ 1.322 em 08–09/12). QA OK nos dois; HTML guardado no Gmail conferido.
- 19/10 18h BRT — rodada da tarde: ainda **nenhuma resposta**. Lembrete ⏰ curto (D2 vence amanhã + D3). QA OK; HTML no Gmail conferido.
- 20/10 08h BRT — rodada da manhã: **nenhuma resposta** (sem devoluções de e-mail). Preços **começaram a subir**: ida 08/12 ~13h US$ 1.322 → 1.465; ida 09/12 segurou (US$ 1.322–1.334). Enviados: lembrete ⏰ "D2 vence hoje" (recomendação D2-B) + alerta de voos com veredito **COMPRAR JÁ (ida 09/12)**. QA OK nos dois. Regra do veredito no report.js corrigida (detecta alta ≥ US$ 75 por par de datas).
- 20/10 18h BRT — rodada da tarde: **nenhuma resposta**; D2 venceu sem decisão. Lembrete ⏰ curto (D2 + D3). Obs.: João moveu para a lixeira os lembretes de 19/10 e as versões duplicadas do kickoff (sem resposta escrita). QA OK.
- 21/10 08h BRT — rodada da manhã: **Paula respondeu D2: ida 06/12, volta 20/01** (21/10 02h18 UTC). João: sem resposta. Aberta D2t (tipo de voo, os dois). Preços: ida 09/12 ~13h subiu para US$ 1.465; 06/12 → 20/01 ~13h US$ 1.418 · 1 escala US$ 1.359 · mais barato US$ 1.167 (Copa ~18h). Enviados: rodada PM (thread do kickoff) + alerta de voos **COMPRAR JÁ (06/12 → 20/01)**. QA OK nos dois; HTML no Gmail conferido. Default do scraper passa a incluir 06–07/12.
- 21/10 18h BRT — rodada da tarde: **nenhuma resposta nova** (só a da Paula na D2, de madrugada). Lembrete ⏰ curto (João: D2; os dois: D2t; D1 vence amanhã). QA OK; HTML no Gmail conferido.
- 21/10 ~18h30 BRT — João autorizou usar seus rascunhos não enviados como resposta: D2 'Paula decide' (→ 06/12→20/01), D1-A. Enviado pedido ✅ Confirmar D2 (texto simples) + tipo de voo; D1 falta Paula. Rascunhos de resposta passam a ser checados em cada rodada.
- 22/10 — Paula (21/10 23h30 UTC): voo sempre o mais rápido (fibromialgia, cadeira de rodas); D1: Lageado pago/pequeno, quer água grátis sem outro voo. Enviado ✅ Confirmar: voo rápido 06/12→20/01 (~13h, US$ 1.418, pedir assistência) + destino Cunha/Paraty (alt. SFX). Aguardando CONFIRMO dos dois.
- 24/10 08h BRT — rodadas de 22–23/10 não rodaram (sessão inativa). Paula (22/10): CONFIRMO voo rápido + casas em Paraty (SFX descartado). João: sem CONFIRMO. Preço 06/12→20/01: ~13h US$ 1.417, mais barato US$ 1.364. Enviado ⏰ texto simples cobrando João + D3.
- 24/10 — João: CONFIRMO. D2/D1 fechadas pelos dois (voo rápido 06/12→20/01; Paraty). Enviado link da passagem (Kayak/Google Flights) + 6 casas Airbnb Paraty 07/12→19/01 (A–F, R$ 6,6–9,5 mil). Nova decisão D5: casa (aguarda os dois). Paula agora em gandarp + gandarp107.
- 24/10 — Enviado: aluguel de carro GRU 07/12→19/01 (Kayak: Polo R$ 3.463 … Pulse auto R$ 5.118; histórico Kayak dez ~R$190/dia, jan ~R$97/dia) + aviso de possível adiamento (OS-UZP, Natal) → estadia antes em SP: interior ou Baixada. Pendentes: D5 casa; D6 adiamento (conversa João/Paula).
- 24/10 — Correção João: carro só de ida (GRU→destino, devolve lá; no destino Uber; outro carro na volta). Paraty não tem grandes locadoras (só Luma, local); alternativa: devolver em Angra (Localiza) ou transfer. Regra: e-mails só após confirmação do João.
