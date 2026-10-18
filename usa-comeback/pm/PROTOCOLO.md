# Gerente do projeto — protocolo (definido pelo João em 18/10/2026)

## Regra de ouro
Nenhuma decisão avança sem **resposta dos dois** (João **e** Paula) e, depois, **confirmação dos dois** à proposta consolidada.

## Ciclo de cada decisão
1. **Pergunta** — e-mail `[USA-PM]` com a decisão, opções e botões de resposta (mailto pré-preenchido para os dois).
2. **Coleta** — ler as respostas no Gmail. Falta alguém → **cobrar 2× por dia** (rodadas ~08h e ~18h BRT, seg–sáb), só quem não respondeu, com cópia ao outro.
3. **Proposta** — com as duas respostas: raciocinar, conciliar divergências e mandar e-mail `[USA-PM] ✅ Confirmar` com a decisão proposta e o porquê.
4. **Confirmação** — esperar "CONFIRMO" dos **dois**. Ajuste pedido → nova proposta. Falta alguém → seguir cobrando.
5. **Execução** — só depois das duas confirmações. Registrar em `estado.md` e abrir a próxima decisão.

## Como identificar quem respondeu
- **Paula:** qualquer remetente `gandarp@gmail.com`, `gandarp107@gmail.com` ou `gandarp@miamioh.edu`.
- **João:** remetente `jr.conductor83@gmail.com` **com** "Resposta" ou "Re:" no assunto (os e-mails do gerente saem da mesma conta, mas com assunto `[USA-PM] 📋` / `[USA-PM] ⏰` / `[USA-PM] ✅`).
- Busca: `subject:"USA-PM" newer_than:3d` + ler as threads inteiras.

## Limites
- O gerente **nunca** compra, reserva ou paga nada; entrega links e o casal executa.
- Nunca mencionar outras mulheres / relacionamentos do João no Brasil.
- Transparência total entre os dois: toda resposta vai com cópia para ambos.
- Canal: Gmail (HTML com botões mailto). Brevo avaliado e descartado: o conector disponível não envia e-mail transacional avulso e as respostas sairiam da thread.

## QA obrigatório de e-mail (desde 18/10, após falha no Gmail iOS)
Nenhum e-mail sai sem passar por:
1. **Gerar** pelo `pm/pm_email.py` (decisões) ou `03-voos/scraper/report.js` (voos). Só `background-color:` — nunca `background:` abreviado (o Gmail apaga). Em HTML avulso, rodar `python3 pm/sanitize.py arquivo.html`.
2. **QA:** `NODE_PATH=$(npm root -g) node pm/qa_email.js arquivo.html` → precisa dar `QA OK`. Ele simula o Gmail (remove `background:`), checa contraste de todo texto e link (≥ 3), barras que sumiriam, link sem href e e-mail vazio. Gera prints claro/escuro em 390 px; **olhar o print** antes de enviar.
3. **Botões:** sempre com fallback de código (D2-A, D2-B…) para responder por texto.
4. **Pós-envio:** buscar a mensagem enviada (`get_message`) e conferir que o HTML guardado manteve cores e links.
