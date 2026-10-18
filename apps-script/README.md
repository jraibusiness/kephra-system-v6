# Kephra System v7 · Google Apps Script

Um app pessoal de tarefas no celular (uma mistura de Todoist e Notion) que monta a sua agenda no Google Calendar em torno das suas metas, com um estrategista de IA que julga a melhor estratégia da visão de 10 anos até a semana.

- **Banco de dados:** uma planilha Google criada automaticamente, com as abas Goals, Projects, Tasks, TimeLogs, Routine, Focus, Plan e Settings.
- **App:** um Web App do Apps Script, pensado para o celular. Você salva o atalho na tela inicial.
- **Agenda:** duas agendas novas, **Kephra · Rotina** e **Kephra · Plano**. As duas marcam o horário como ocupado.
- **E-mail:** o plano do dia chega por volta das 6h.
- **IA:** Claude é o padrão e o Gemini é a alternativa. Se um falhar, o outro assume.

## O que cada tela faz

| Tela | Função |
|---|---|
| **Hoje** | Mostra o foco do dia, a carga planejada × a capacidade e a sequência do dia (rotina + agenda + tarefas). Cada tarefa tem ▶ (cronômetro) e ✓. O botão **Planejar** grava o dia no Google Calendar. |
| **Tarefas** | Adição rápida, com interpretação por IA opcional ("ligar pro Frank amanhã 10h, 30 min, urgente"). Tem filtros e busca por palavra-chave. Cada tarefa guarda nome, palavras-chave, projeto, tempo estimado, prioridade P1–P4, esforço 1–3, tipo de esforço, prazo, horário fixo, se pode ser dividida e notas. **✦ Quebrar em passos** usa IA. |
| **Projetos** | Cada projeto fica ligado a uma meta. Mostra as tarefas abertas, as horas rastreadas e a meta de horas por semana. |
| **Metas** | A ordem das metas define a prioridade. Tem a meta-mestra do período (ex.: fazer caixa até 30/11), o foco por dia da semana e exceções por data. Cada meta pode ser descrita no método **RPM de Tony Robbins** (Resultado, Propósito, Evidência) e com **evidências sensoriais**: o que vejo, ouço, sinto no corpo, que cheiro, que gosto e qual emoção. O botão **◉ Visualizar** abre a meta em tela cheia, para ler antes de fechar os olhos. |
| **Análise** | Tempo por tipo de esforço, por meta, por projeto e por dia. Também mostra **previsto × real** por tipo de esforço. |
| **⚙ Ajustes** | Rotina base editável, parâmetros do agendador, IA, e-mail de teste e link para a planilha. |

## O estrategista (aba Estratégia)

Duas camadas trabalham juntas:

- **Estrategista (IA, semanal/mensal/trimestral/anual)** — decide *o quê* e *por quê*. Lê o sistema inteiro: a cascata de metas, projetos, tarefas abertas, minutos reais gastos por projeto (7 e 28 dias), capacidade real dos próximos 14 dias, seu fator previsto × real e as revisões anteriores com o que você aplicou (para corrigir a rota). Aplica, nesta ordem:
  1. **Primeiros princípios** — reduz a meta-mestra às variáveis fundamentais (ex.: faturamento = conversas × fechamento × ticket) e aponta qual tem mais folga por hora.
  2. **Pensamento sistêmico** — o **gargalo único** (Teoria das Restrições), laços de reforço/equilíbrio, ponto de alavancagem (Meadows), tempo real × ideal.
  3. **Teoria dos jogos** — atores, incentivos e sua melhor jogada (dominantes, reputação em jogos repetidos, apostas assimétricas, BATNA).
  4. **Decisão** — alavancagem de cada projeto (acelerar / manter / reduzir / pausar), tarefas novas que *cabem* na capacidade, repriorizações, **cortes**, metas novas mais concretas, foco por dia, meta-mestra do período, riscos e **a pergunta** que você precisa responder.

  Nada muda sem você: cada ação tem checkbox → **Aplicar** → o dia é replanejado.
  Automático: **domingo** (semana) e **dia 1** (mês; trimestre em jan/abr/jul/out; ano em janeiro), por volta das 16h, com e-mail.
- **Consultar** — pergunta pontual ("aceito este cliente a R$ 300/h?") julgada com todo o contexto: veredito, porquê, próximo passo.
- **Agendador (determinístico, diário)** — decide *quando*, seguindo as prioridades que o estrategista ajustou. O briefing das 6h usa a estratégia vigente para apontar a tarefa que mais move o gargalo.

> A qualidade do julgamento depende da qualidade dos dados. Mínimo para funcionar bem: escrever a visão de 10 anos, metas com métrica e prazo, e usar o cronômetro.

## Como o agendador decide

1. **Tempo livre real** = a janela de trabalho (padrão: 06:00–19:00, de segunda a sábado), menos a rotina, menos os eventos da sua agenda principal.
2. **Capacidade** = 80% desse tempo livre. É uma proteção contra superestimar o dia.
3. **Duração realista** = a sua estimativa × o seu **fator histórico** (tempo real ÷ previsto) para aquele tipo de esforço. Sem histórico, o fator é +20%. A partir de 3 tarefas concluídas com cronômetro, o sistema passa a usar os seus números.
4. **Pontuação**: prioridade (P1 = 100 … P4 = 10), +45 se a tarefa serve ao foco do dia, +25 se serve à meta-mestra do período, um bônus pela posição da meta e pela prioridade do projeto, e urgência pelo prazo (tarefa atrasada = +90).
5. Trabalho **mental profundo** e **analítico**, e tudo com esforço 3, vai para a manhã, com teto de 4h por dia. Tarefas **rasas, sociais e físicas** vão para a tarde.
6. Há 10 min de transição entre blocos. Tarefas longas são divididas em blocos de até 90 min.
7. O que não couber aparece em **"Não coube neste dia"**. Aí a decisão é sua: cortar, adiar ou mudar o prazo.

## Tipos de esforço

A taxonomia combina deep work × shallow work (Cal Newport), o maker × manager schedule e a gestão de energia física, mental e emocional (Loehr & Schwartz).

🧠 Mental profundo · 📚 Mental analítico / estudo · 📨 Administrativo (raso) · 🗣️ Social / comunicação · 🎼 Artístico / performance · 🔁 Físico repetitivo · 🔨 Físico intenso / técnico · 🏃 Cuidado físico · 🚗 Logística

## Rotina base inicial (tudo editável em ⚙)

| Horário | Bloco | Dias |
|---|---|---|
| 04:45–06:00 | Café lento + notícias | todos |
| 06:00–19:00 | Janela de trabalho (o agendador preenche) | seg–sáb |
| 11:30–12:30 | Almoço | todos |
| 17:00–18:00 | Caminhada · Parque da Aclimação | ter, sex |
| 19:30–21:00 | Quinta Justa | qui |
| 19:30–21:30 | Tempo livre · TV, com jantar às 20:00 | exceto qui |
| 21:45 | Sono (não vai para o Calendar) | todos |
| 09:00–11:30 | Preparar as refeições da semana | dom |
| 17:00–18:00 | Revisão semanal + planejamento | dom |

> ⚠️ Você disse "tempo livre até por volta das 11h30". Interpretei como **21h30**. Acordando às 4h45, ficar até 23h30 daria 5h15 de sono por noite. Se for 23h30 mesmo, ajuste em ⚙ → Rotina.

## Instalação (uma vez, ~15 min)

### 1. Criar o projeto

**Opção A, sem linha de comando:**

1. Abra <https://script.google.com> e clique em **Novo projeto**. Dê o nome `Kephra System`.
2. Em **Configurações do projeto** (engrenagem), marque **"Mostrar arquivo de manifesto appsscript.json"**.
3. Crie os arquivos com os mesmos nomes desta pasta e cole o conteúdo de cada um. São 8 arquivos de script (`Config`, `Time`, `Db`, `Scheduler`, `Calendar`, `AI`, `Email`, `Code`) e 3 arquivos HTML (`Index`, `Styles`, `App`). Substitua também o conteúdo de `appsscript.json`.

**Opção B, com clasp:**

```bash
npm i -g @google/clasp && clasp login
cd apps-script
clasp create --type standalone --title "Kephra System" --rootDir .
clasp push
```

### 2. Inicializar

1. No editor, selecione a função **`setup`** e clique em **Executar**. Autorize as permissões: Planilhas, Calendar, envio de e-mail e acesso externo (para a IA).
2. O `setup` cria a planilha, as duas agendas, a rotina no Calendar e três gatilhos diários:
   - **morningPlan**: ~4h, monta o dia;
   - **dailyEmail**: ~6h, envia o plano;
   - **eveningPlan**: ~20h30, deixa o dia seguinte pronto;
   - **strategyCron**: ~16h, revisão estratégica aos domingos e no dia 1 do mês.

   O Google dispara cada gatilho dentro de uma janela de ~15 min em torno do horário pedido.

### 3. Chaves de IA (opcional, mas recomendado)

Vá em **Configurações do projeto → Propriedades do script → Adicionar propriedade**:

- `ANTHROPIC_API_KEY`: gere em <https://console.anthropic.com>
- `GEMINI_API_KEY` (opcional): gere em <https://aistudio.google.com/apikey>

O modelo padrão é `claude-opus-5-5`, e dá para trocar em ⚙. O estrategista roda com esforço `medium` (configurável na aba Settings da planilha: `strategyEffort`). Se a revisão estourar o tempo, use `low`; se houver chave do Gemini, ele assume automaticamente.

### 4. Publicar o app

1. Clique em **Implantar → Nova implantação → App da Web**.
2. Escolha **Executar como: Eu** e **Quem pode acessar: Somente eu**.
3. Abra a URL `/exec` no celular.
   - iPhone: Safari → Compartilhar → **Adicionar à Tela de Início**.
   - Android: Chrome → ⋮ → **Adicionar à tela inicial**.

Sempre que alterar o código, use **Implantar → Gerenciar implantações → editar → Nova versão**. Assim a URL continua a mesma.

### 5. Página de agendamento de clientes

Na página de agendamento do Google Calendar (Agenda de horários), abra **Disponibilidade → "Verificar disponibilidade em outras agendas"** e marque **Kephra · Rotina** e **Kephra · Plano**. Assim os clientes só enxergam o tempo realmente livre.

## Uso diário

1. **Manhã:** o e-mail chega às ~6h com a sequência do dia e o briefing da IA. O Calendar já está montado.
2. **Durante o dia:** antes de começar uma tarefa, toque em ▶. Quando terminar, toque em ✓ Concluir. Esqueceu o cronômetro? Use **＋ Tempo manual**.
3. **Imprevisto:** toque em **↻ Replanejar**. O que já passou fica como está, e o resto do dia é refeito a partir de agora.
4. **Domingo:** na revisão semanal, ajuste o foco de cada dia e a meta-mestra em **Metas**.
