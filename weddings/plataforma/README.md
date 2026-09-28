# Wedding's · Plataforma (landing + diagnóstico musical)

Página única, sem build: `index.html` (landing + assessment em 7 passos) → `apps-script/Code.gs`
(grava na planilha, calcula o Score de Afinidade e manda e-mail de alerta).

Substitui as três versões dispersas no Drive:
- `index` (Google Doc, out/2025) — rascunho da landing;
- app do AI Studio "Weddings Coral e Orquestra" (fev/2026) — código preservado em `../legacy/ai-studio-applet/`;
- Web app do Assessment no Apps Script (mar/2026) — **privado**, dava tela de login para a noiva.

## Publicar em 15 minutos

### 1. Backend (Apps Script)
1. Criar uma planilha nova na conta `musica.weddings@gmail.com` chamada **"WD — Leads"**.
2. *Extensões → Apps Script* → colar `apps-script/Code.gs` → salvar.
3. Rodar `testeManual` uma vez (autoriza Planilhas + Gmail; deve chegar um e-mail e criar a aba **Leads**).
4. *Implantar → Nova implantação → App da Web* → **Executar como: Eu** · **Quem pode acessar: Qualquer pessoa** → copiar a URL `/exec`.
5. Testar a URL no navegador anônimo: deve responder `{"ok":true,...}` — **sem tela de login**.

### 2. Front (index.html)
Editar só o bloco `CONFIG` no fim do arquivo:
- `APPS_SCRIPT_URL`: a URL `/exec` do passo 1.4;
- `WHATSAPP`: número do WhatsApp Business da Wedding's (ex.: `5513999999999`);
- `FOTO_MAESTRO`: URL pública de uma foto regendo (opcional);
- `PACOTES` / `INVESTIMENTO`: preços "a partir de" (ver o estudo de caso, seção 6).

### 3. Hospedagem
- **Netlify (grátis, recomendado)**: app.netlify.com → *Add new site → Deploy manually* → arrastar a pasta `plataforma/`.
  Depois, *Domain settings* → apontar o domínio da Wedding's (pago em 27/02/2025 — conferir se ainda está ativo).
- Alternativa: GitHub Pages (exige repositório público ou plano pago, pois este repo é privado).

### 4. Checagem final (celular, aba anônima)
- [ ] Página abre sem login, sem rolagem lateral.
- [ ] Diagnóstico completo → aparece "Obrigado" → linha nova na aba **Leads** → e-mail de alerta chegou.
- [ ] Score ≥ 70 mostra botão de WhatsApp com mensagem preenchida.
- [ ] Link da página colocado na bio do Instagram, no Google Business e no Casamentos.com.br.

## Regras do Score (0–100)
| Critério | Pontos |
|---|---|
| Investimento: >20k 40 · 13–20k 32 · 8–13k 22 · "conversar" 12 · <8k 5 | até 40 |
| Cidade na Baixada (Santos, Guarujá, São Vicente, Praia Grande) | 20 (fora: 8) |
| Horizonte: 6–12m 20 · 3–6m 18 · >1a 12 · <3m 10 · sem data 4 | até 20 |
| Formação: grandiosa 10 · câmara 8 · intimista/indefinida 5 | até 10 |
| Quer arranjo exclusivo: sim 10 · talvez 5 | até 10 |

≥ 70 **quente** (WhatsApp pessoal no mesmo dia) · 45–69 **morno** (e-mail com 3 sugestões por momento em 48h) · < 45 **nutrição**.
A regra vive nos dois arquivos; o Apps Script é a fonte da verdade.
