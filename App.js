import React, { useState, useEffect, useReducer, useRef, useMemo } from 'react';

const STORAGE_KEY = 'kephra_system_v6';

// ============================================================
// SEED DATA — calibrado a partir dos documentos do João
// ============================================================
const todayISO = () => new Date().toISOString().slice(0, 10);

// ============================================================
// FILTRO DE DECISÃO — toda ação passa por aqui
// ============================================================
const VECTORS = {
  a: { id: 'a', label: 'Apto próprio', short: 'A', color: '#B85A38', icon: '⌂', desc: 'Saída do apto da Mariana para espaço próprio' },
  b: { id: 'b', label: 'R$ 10k BR', short: 'B', color: '#2D4A3E', icon: '$', desc: 'R$ 10.000/mês fixos via música no Brasil' },
  c: { id: 'c', label: 'US$ 10k EUA', short: 'C', color: '#1A365D', icon: '✈', desc: 'Visto EUA + US$ 10.000 líquidos/mês lá' },
  d: { id: 'd', label: 'Teto', short: 'D', color: '#7B4B8A', icon: '↑', desc: 'Explosão do teto de permissão (EltonEuler / Aliança Divergente)' },
};

const seed = {
  meta: {
    targetBirthday: '2026-07-16',
    apartmentDeadline: '2026-08-31',
    monthlyTargetBRL: 10000,
    monthlyTargetUSD: 10000,
    fixedCostBRL: 5500,
    annualTargetUSD: 120000,
    weeklyAvailable: 66,
    weeklyFixed: 25,
    weeklyProjectBudget: 41,
    createdAt: todayISO(),
    posture: 'Operar 100% do tempo como quem já explodiu o teto. Pior cenário (isolamento, rejeição) já é linha de base tolerada — não é argumento contra agir. Medo de crítica/rejeição = freio identificado, não veto. Restrição real = caixa, não opinião alheia.',
  },
  goals: [
    { id: 'g1', tier: 'curto', vector: 'a', title: 'Apartamento próprio em São Paulo', deadline: '2026-08-31', metric: 'Caixa para aluguel + custos fixos', status: 'em_progresso', notes: 'Sair do apto da Mariana ASAP. Aguarda destravar caixa via AFMC/PRONAC ou Astin.' },
    { id: 'g2', tier: 'curto', vector: 'b', title: 'R$ 10.000/mês via música BR', deadline: '2026-09-30', metric: 'R$ 10k/mês fixos recorrentes', status: 'em_progresso', notes: 'Combinação Mentoria AK (R$ 2,5–5k/ticket) + QJ (R$ 97 × 100 = R$ 9,7k) + AFMC/PRONAC + cachês de regência.' },
    { id: 'g3', tier: 'medio', vector: 'c', title: 'Visto EUA + US$ 10.000 líquidos/mês', deadline: '2026-12-31', metric: 'O-1 aprovado + renda recorrente US', status: 'em_progresso', notes: 'O-1 via agent petitioner (Frank/Analytics AIML). Astin Civic Orchestra como Music Director — entrevista feita, decisão jun/2026.' },
    { id: 'g4', tier: 'medio', vector: 'd', title: 'Explosão do teto de permissão', deadline: '2027-07-16', metric: 'Postura e operação coerentes com teto explodido', status: 'em_progresso', notes: 'EltonEuler / Aliança Divergente. Não validar paralisia. Restrição real = caixa, não opinião alheia.' },
    { id: 'g5', tier: 'medio', vector: 'b', title: 'Quinta Justa com 100 assinantes', deadline: '2026-12-31', metric: '100 assinantes ativos (R$ 97 ou R$ 49,90)', status: 'em_progresso', notes: 'Canal: apresentações presenciais em grupos de nicho (Alphaville, clubes, cinéfilos). NÃO tráfego de massa.' },
    { id: 'g6', tier: 'medio', vector: 'c', title: 'Music Director nos EUA', deadline: '2026-12-31', metric: 'Cargo formal + visto', status: 'em_progresso', notes: 'Astin Civic Orchestra entrevistou. Aguardar decisão até meados de junho. Paralelo: outreach Florida Orchestra, USF, Patel.' },
  ],
  projects: [
    { id: 'p_afmc', name: 'AFMC · Diretor Artístico e Executivo', vector: 'b', weeklyHours: 10, goalIds: ['g2', 'g1'], color: '#2D4A3E', status: 'ativo', notes: 'Mandato 01/06–31/12/2026 (em formalização). PRONAC 260661 = R$ 1,44M. Gatilho de pró-labore: 20% de captação. 60% das regências da temporada 2026. Triangulação com UZP em curso (reunião 29/05 15h).', etapas: [
      { id: 'af1', title: 'Pressionar assinatura do Termo pelos 5 antes da reunião UZP', done: false, tag: 'urgente' },
      { id: 'af2', title: 'One-pager da reunião UZP · o que oferecer + o que pedir', done: false, tag: 'estrategia' },
      { id: 'af3', title: 'Mapear posições do PRONAC × pessoas atuais', done: false, tag: 'pessoas' },
      { id: 'af4', title: 'Tabela de cachês por regência (15 dias após assinatura)', done: false, tag: 'remuneracao' },
      { id: 'af5', title: 'Cronograma de captação · gatilho 20% para liberação inicial', done: false, tag: 'captacao' },
      { id: 'af6', title: 'CRM centralizado de contatos e parcerias', done: false, tag: 'sistema' },
      { id: 'af7', title: 'Plano artístico temporada 2026 com pico na Consciência Negra (novembro)', done: false, tag: 'artistico' },
      { id: 'af8', title: 'Mapear empresas parceiras da UZP com apetite ESG/DEI', done: false, tag: 'captacao' },
    ]},
    { id: 'p_frank', name: 'Frank · Black Admiral + prospecção EUA', vector: 'c', weeklyHours: 5, goalIds: ['g3', 'g6'], color: '#1A365D', status: 'ativo', notes: 'Canal reaberto na call de 22/05. Frank tem mídia Colorado/Denver + janela Juneteenth/250º US em junho. Áudios da ópera já enviados. Próxima call: qua 27/05 12h BR. Atenção: tratamento experimental do Frank — janela apertada.', etapas: [
      { id: 'fk1', title: 'Confirmar call quarta 27/05 12h BR', done: false, tag: 'urgente' },
      { id: 'fk2', title: 'Arquitetura prospecção EUA · planilha CRM + folder Drive para imprensa', done: false, tag: 'sistema' },
      { id: 'fk3', title: 'Finalizar edição das transcrições da ópera (terça)', done: false, tag: 'producao' },
      { id: 'fk4', title: 'Draft de carta para Pioneers Museum · Frank assina', done: false, tag: 'outreach' },
      { id: 'fk5', title: 'Mapa de 5 instituições Tier A para outreach via Frank', done: false, tag: 'outreach' },
      { id: 'fk6', title: 'Re-conectar nas reuniões matinais (8am West / 12pm BR)', done: false, tag: 'rede' },
      { id: 'fk7', title: 'Agent Petitioner Agreement (Analytics AIML) · finalizar', done: false, tag: 'visto' },
      { id: 'fk8', title: 'Pacote de evidência O-1B (8+ peer letters, mídia, itinerário)', done: false, tag: 'visto' },
    ]},
    { id: 'p_astin', name: 'Astin Civic Orchestra · Music Director', vector: 'c', weeklyHours: 1, goalIds: ['g6', 'g3'], color: '#5B7B9A', status: 'aguardando', notes: 'Entrevista feita. Aguardar decisão até meados de junho 2026. Se sair = volta aos EUA como Music Director, não como músico qualquer. Manter contato leve e profissional. Não pressionar.', etapas: [
      { id: 'as1', title: 'Follow-up cordial 7 dias após entrevista', done: false, tag: 'outreach' },
      { id: 'as2', title: 'Preparar materiais caso peçam segunda rodada', done: false, tag: 'preparacao' },
      { id: 'as3', title: 'Plano de contingência caso não saia (Florida, Patel, USF)', done: false, tag: 'plano_b' },
    ]},
    { id: 'p_mentoria', name: 'Mentoria AK (privada)', vector: 'b', weeklyHours: 4, goalIds: ['g2'], color: '#D4A33B', status: 'ativo', notes: 'MAIOR ROI/HORA. Sérgio R. V. Bôas pagou R$ 2,5k. Posicionamento: preparação para concursos de regência. Gargalo: sistema de leads qualificados. Ação: mapear concursos/vestibulares como pontos de concentração de dor.', etapas: [
      { id: 'm1', title: 'Mapear concursos e vestibulares de música 2026/H2', done: false, tag: 'sistema' },
      { id: 'm2', title: 'Coletar depoimento do Sérgio · pós-prova', done: false, tag: 'prova_social' },
      { id: 'm3', title: 'Pacote formal: nº sessões, entregas, preço', done: false, tag: 'pacote' },
      { id: 'm4', title: 'Página de vendas / landing específica', done: false, tag: 'plataforma' },
      { id: 'm5', title: 'Pillar de conteúdo LinkedIn · preparação concursos de regência', done: false, tag: 'conteudo' },
      { id: 'm6', title: 'Outreach base AK · mensagem dedicada com oferta', done: false, tag: 'outreach' },
      { id: 'm7', title: 'Meta 60 dias · fechar próximo cliente a R$ 2,5–5k', done: false, tag: 'meta' },
    ]},
    { id: 'p_qj', name: 'Quinta Justa', vector: 'b', weeklyHours: 6, goalIds: ['g2', 'g5'], color: '#7A8B5C', status: 'ativo', notes: 'Sessões qui 19h. Atualmente 4 participantes (2 pagantes a R$ 49,90, 2 cortesia). Meta: 100 assinantes. Canal validado = apresentação presencial em grupos de nicho (Cleo → Bernadete). NÃO investir em tráfego de massa enquanto oferta não estiver no funil.', etapas: [
      { id: 'qj1', title: 'Listar 10 pontos de concentração SP (Alphaville, clubes, cinéfilos, leitura)', done: false, tag: 'sistema' },
      { id: 'qj2', title: 'Script de apresentação presencial 15min', done: false, tag: 'sistema' },
      { id: 'qj3', title: 'Agendar 1 apresentação no grupo de cinéfilos da Cleo', done: false, tag: 'urgente' },
      { id: 'qj4', title: 'Meta operacional · 1 apresentação presencial/mês', done: false, tag: 'meta' },
      { id: 'qj5', title: 'Convidar 3 atuais como embaixadoras/indicadoras', done: false, tag: 'rede' },
      { id: 'qj6', title: 'Programa próxima sessão · O Guarani (qui 28/05)', done: false, tag: 'execucao' },
      { id: 'qj7', title: 'QJ ao Vivo São João da Boa Vista · agosto 2026', done: false, tag: 'evento' },
    ]},
    { id: 'p_kephra', name: 'Edições Kephra', vector: 'b', weeklyHours: 4, goalIds: ['g2'], color: '#8B5E3C', status: 'ativo', notes: 'Tchaikovsky pronto. Lançamento oficial 15/06. Lista de reviewers + plataforma + clube de assinaturas. Renda recorrente complementar.', etapas: [
      { id: 'tk1', title: 'Definir plano de negócio do clube de assinaturas', done: false, tag: 'estrategia' },
      { id: 'tk2', title: 'Plataforma + precificação', done: false, tag: 'estrategia' },
      { id: 'tk3', title: 'Lista de 20 reviewers (envio gratuito Tchaikovsky)', done: false, tag: 'marketing' },
      { id: 'tk4', title: 'Calendário editorial por efemérides', done: false, tag: 'marketing' },
      { id: 'tk5', title: 'Lançar oficialmente Tchaikovsky · 15/jun', done: false, tag: 'lancamento' },
      { id: 'tk6', title: 'Sistema de vendas automático', done: false, tag: 'automacao' },
      { id: 'tk7', title: 'Próxima edição: Nepomuceno Sinfonia em Sol menor', done: false, tag: 'producao' },
    ]},
    { id: 'p_linkedin', name: 'LinkedIn · Business & AI', vector: 'd', weeklyHours: 3, goalIds: ['g3', 'g4'], color: '#1A365D', status: 'ativo', notes: 'Trilha de autoridade que serve aos vetores C (visto/EUA) e D (teto). Cadência: seg carrossel · qua artigo · sex carrossel. Tema desta semana: Google I/O + GAS como diferencial de mentoria.', etapas: [
      { id: 'li1', title: 'Artigo · Google I/O + GAS como diferencial', done: false, tag: 'execucao' },
      { id: 'li2', title: 'Pillar mensal · preparação para concursos de regência', done: false, tag: 'conteudo' },
      { id: 'li3', title: 'Networking · 3 contatos US + 3 BR por dia', done: false, tag: 'rede' },
      { id: 'li4', title: 'Sistema de criação em bloco (1 dia / 3 posts)', done: false, tag: 'sistema' },
    ]},
    { id: 'p_industria', name: 'Mapeamento da indústria · diário', vector: 'd', weeklyHours: 5, goalIds: ['g4', 'g6'], color: '#4A5D3B', status: 'ativo', notes: 'NOVO. 60min/dia seg–sex lendo as melhores revistas, blogs e posts sobre música de concerto. Tornar-se expert da indústria que quer dominar.', etapas: [
      { id: 'in1', title: 'Lista de 10 veículos prioritários (BR + global)', done: false, tag: 'sistema' },
      { id: 'in2', title: 'Rotina diária · 60min seg–sex', done: false, tag: 'rotina' },
      { id: 'in3', title: 'Mapa de players BR · orquestras, agentes, programadores', done: false, tag: 'pesquisa' },
      { id: 'in4', title: 'Mapa de players global · alianças, capitalização, decision-makers', done: false, tag: 'pesquisa' },
      { id: 'in5', title: 'Síntese semanal · 1 insight publicável por semana', done: false, tag: 'output' },
    ]},
    { id: 'p_harmonia', name: 'Curso Harmonia / Hotmart', vector: 'b', weeklyHours: 2, goalIds: ['g2'], color: '#D4A33B', status: 'slow_burn', notes: 'Renda passiva futura. Quer gravar tudo (assíncrono). Não está pronto. Horizonte: lançamento jun/jul. Slow burn enquanto AFMC e UZP destravam.', etapas: [
      { id: 'th1', title: 'Extrair materiais via NotebookLM dos cursos já ministrados', done: false, tag: 'pesquisa' },
      { id: 'th2', title: 'Roteiro completo a partir dos relatórios', done: false, tag: 'execucao' },
      { id: 'th3', title: 'Gravação concentrada (sprint 5 dias)', done: false, tag: 'execucao' },
      { id: 'th4', title: 'Cadastrar produto Hotmart', done: false, tag: 'execucao' },
      { id: 'th5', title: 'Campanha de conversão pós-lançamento', done: false, tag: 'marketing' },
    ]},
    { id: 'p_porto', name: 'Curso Porto Seguro (CCB)', vector: 'b', weeklyHours: 1, goalIds: ['g2'], color: '#B5443B', status: 'slow_burn', notes: 'REDUZIDO. 5 pessoas na lista de espera. Retomar depois que AFMC destravar.', etapas: [
      { id: 't1', title: 'Definir preço e formato', done: false, tag: 'estrategia' },
      { id: 't2', title: 'Calendário de encontros presenciais SP', done: false, tag: 'estrategia' },
      { id: 't3', title: 'Página de vendas', done: false, tag: 'execucao' },
    ]},
    { id: 'p_weddings', name: "Wedding's (Santos)", vector: 'b', weeklyHours: 1, goalIds: ['g2'], color: '#9B6B8F', status: 'slow_burn', notes: 'REDUZIDO. Mantém contratos existentes apenas. Conflita com vetor C (presença BR). Retomar pleno só se vetor B não fechar pelas outras vias.', etapas: [
      { id: 'tw0', title: 'Localizar lista original dos 12 passos', done: false, tag: 'pesquisa' },
      { id: 'twh', title: 'Manter contratos existentes', done: false, tag: 'manutencao' },
    ]},
    { id: 'p_palestras', name: 'Prospecção de Palestras', vector: 'b', weeklyHours: 0, goalIds: ['g2'], color: '#999999', status: 'arquivado', notes: 'ARQUIVADO em 23/05/2026. Claude Routines relacionadas canceladas. Ruído pelo filtro de decisão atual. Reavaliar em 2027 se necessário.', etapas: [] },
    { id: 'p_cripta', name: 'Projeto Cripta da Sé', vector: 'd', weeklyHours: 0, goalIds: ['g4'], color: '#4A5D3B', status: 'pausado', notes: 'PAUSADO. 19 igrejas mapeadas. Material pronto. Retomar após estabilização de receita base.', etapas: [
      { id: 'cs1', title: 'Aguardar momento certo · pós-AFMC destravar', done: false, tag: 'aguardar' },
    ]},
    { id: 'p_maestro', name: 'Carreira Maestro · pesquisa', vector: 'c', weeklyHours: 0, goalIds: ['g6'], color: '#4A5D3B', status: 'slow_burn', notes: 'Absorvido por "Mapeamento da indústria diário".', etapas: [] },
  ],
  weeklyTemplate: [
    // FILOSOFIA: cada bloco serve a um vetor. Toda atividade responde ao filtro de decisão.
    // SEGUNDA — abertura: Mentoria + AFMC + indústria
    { day: 1, blockId: 'b1', projectId: 'p_mentoria', activity: 'Mentoria · pacote formal + iniciar mapa de concursos/vestibulares', kind: 'foco' },
    { day: 1, blockId: 'b3', projectId: 'p_afmc', activity: 'AFMC · pressionar assinatura + refinar one-pager UZP', kind: 'foco' },
    { day: 1, blockId: 'b5', projectId: 'p_industria', activity: 'Mapeamento da indústria · rotina diária 60min', kind: 'foco' },
    { day: 1, blockId: 'b7', projectId: 'p_qj', activity: 'TARDE · oferta QJ às 3 atuais como embaixadoras + depoimento Sérgio + LinkedIn networking', kind: 'operacional' },
    // TERÇA — Frank ópera + indústria + Mentoria conteúdo
    { day: 2, blockId: 'b1', projectId: 'p_frank', activity: 'Frank · finalizar edição das transcrições da ópera', kind: 'foco' },
    { day: 2, blockId: 'b3', projectId: 'p_industria', activity: 'Mapeamento da indústria', kind: 'foco' },
    { day: 2, blockId: 'b5', projectId: 'p_mentoria', activity: 'Mentoria · pillar LinkedIn (preparação concursos de regência)', kind: 'foco' },
    { day: 2, blockId: 'b7', projectId: 'p_linkedin', activity: 'TARDE · post LinkedIn + networking 30min + composição', kind: 'operacional' },
    // QUARTA — CALL FRANK
    { day: 3, blockId: 'b1', projectId: 'p_frank', activity: 'Preparação para call Frank · revisar arquitetura prospecção EUA', kind: 'foco' },
    { day: 3, blockId: 'b3', projectId: 'p_frank', activity: '★ 12h · CALL FRANK + OLIVE · West Coast 8am', kind: 'evento' },
    { day: 3, blockId: 'b5', projectId: 'p_industria', activity: 'Mapeamento da indústria', kind: 'foco' },
    { day: 3, blockId: 'b7', projectId: 'p_qj', activity: 'TARDE · agendar apresentação no grupo de cinéfilos da Cleo + networking', kind: 'operacional' },
    // QUINTA — sessão QJ à noite
    { day: 4, blockId: 'b1', projectId: 'p_industria', activity: 'Mapeamento da indústria', kind: 'foco' },
    { day: 4, blockId: 'b3', projectId: 'p_qj', activity: 'QJ · preparação programa O Guarani', kind: 'foco' },
    { day: 4, blockId: 'b5', projectId: 'p_afmc', activity: 'AFMC · preparação final para UZP (sexta)', kind: 'foco' },
    { day: 4, blockId: 'b7', projectId: 'p_qj', activity: 'TARDE · prep final QJ. 19h · ★ SESSÃO QUINTA JUSTA · O Guarani', kind: 'evento' },
    // SEXTA — REUNIÃO UZP
    { day: 5, blockId: 'b1', projectId: 'p_afmc', activity: 'Preparação final UZP · revisar one-pager + materiais', kind: 'foco' },
    { day: 5, blockId: 'b3', projectId: 'p_afmc', activity: 'Preparação final UZP · gatilhos de fechamento', kind: 'foco' },
    { day: 5, blockId: 'b5', projectId: 'p_afmc', activity: '★ 15h · REUNIÃO UZP · triangulação AFMC + JR + UZP', kind: 'evento' },
    { day: 5, blockId: 'b7', projectId: 'p_afmc', activity: 'TARDE · registro pós-reunião + disparar ações combinadas no mesmo dia', kind: 'operacional' },
    // SÁBADO — fechamento da semana
    { day: 6, blockId: 'b1', projectId: 'p_afmc', activity: 'AFMC · admin pós-UZP + planejamento da semana seguinte', kind: 'foco' },
    { day: 6, blockId: 'b3', projectId: 'p_qj', activity: 'QJ · outreach novos pontos de concentração SP', kind: 'foco' },
    { day: 6, blockId: 'b5', projectId: 'p_kephra', activity: 'Edições Kephra · calendário editorial + reviewers Tchaikovsky', kind: 'foco' },
    { day: 6, blockId: 'b7', projectId: 'p_linkedin', activity: 'TARDE · NEWSLETTER (noite) + revisão semanal + planejamento próxima semana', kind: 'operacional' },
  ],
  dateEvents: [
    { id: 'de_uzp', date: '2026-05-29', title: 'REUNIÃO UZP · 15h · triangulação AFMC + JR + UZP', channels: ['AFMC'], priority: 'alta' },
    { id: 'de_qj_oguarani', date: '2026-05-28', title: 'Quinta Justa · sessão O Guarani · 19h', channels: ['Quinta Justa'], priority: 'alta' },
    { id: 'de_frank_call', date: '2026-05-27', title: 'Call Frank + Olive · 12h BR (8am West)', channels: ['Frank', 'EUA'], priority: 'alta' },
    { id: 'de_afmc_start', date: '2026-06-01', title: 'Início do mandato · Diretor Artístico e Executivo AFMC', channels: ['AFMC'], priority: 'alta' },
    { id: 'de_astin_decision', date: '2026-06-15', title: 'Janela esperada · decisão Astin Civic Orchestra', channels: ['Astin', 'EUA'], priority: 'alta' },
    { id: 'de_juneteenth', date: '2026-06-19', title: 'Juneteenth · janela de PR via Frank (mídia Colorado/Denver)', channels: ['Frank', 'EUA'], priority: 'alta' },
    { id: 'de_tchaikovsky', date: '2026-06-15', title: 'Lançamento oficial Tchaikovsky (Edições Kephra)', channels: ['Kephra'], priority: 'alta' },
    { id: 'de_us250', date: '2026-07-04', title: '250º aniversário dos EUA · janela de PR Frank', channels: ['Frank', 'EUA'], priority: 'alta' },
    { id: 'de_birthday', date: '2026-07-16', title: '43º aniversário João Rocha', channels: ['João'], priority: 'alta' },
    { id: 'de_qj_aovivo', date: '2026-08-15', title: 'Quinta Justa AO VIVO · São João da Boa Vista', channels: ['Quinta Justa'], priority: 'alta' },
    { id: 'de_compositor_br', date: '2026-10-07', title: 'Dia do Compositor Brasileiro', channels: ['Maestro', 'Kephra'], priority: 'alta' },
    { id: 'de_villalobos', date: '2026-11-17', title: 'Morte de Heitor Villa-Lobos (1959)', channels: ['Kephra'], priority: 'alta' },
    { id: 'de_consciencia', date: '2026-11-20', title: 'Consciência Negra · pico temporada AFMC + Almirante Negro', channels: ['AFMC', 'Frank'], priority: 'alta' },
    { id: 'de_blackfriday', date: '2026-11-28', title: 'Black Friday', channels: ['Kephra', 'AK'], priority: 'alta' },
  ],
  milestones: [
    { id: 'ms_afmc_sign', date: '2026-05-29', title: 'Termo AFMC assinado pelos 5 + Reunião UZP', projectId: 'p_afmc', status: 'em_progresso' },
    { id: 'ms_afmc_start', date: '2026-06-01', title: 'Início do mandato AFMC', projectId: 'p_afmc', status: 'em_progresso' },
    { id: 'ms_astin', date: '2026-06-15', title: 'Decisão Astin Civic Orchestra', projectId: 'p_astin', status: 'em_progresso' },
    { id: 'ms_tchaikovsky', date: '2026-06-15', title: 'Lançamento Tchaikovsky (Edições Kephra)', projectId: 'p_kephra', status: 'em_progresso' },
    { id: 'ms_birthday', date: '2026-07-16', title: '43º aniversário · versão irreconhecível', projectId: null, status: 'em_progresso' },
    { id: 'ms_pronac20', date: '2026-07-31', title: 'PRONAC 260661 · gatilho de 20% de captação (R$ 288k)', projectId: 'p_afmc', status: 'em_progresso' },
    { id: 'ms_apto', date: '2026-08-31', title: 'Mudança para apartamento próprio', projectId: null, status: 'em_progresso' },
    { id: 'ms_qj_aovivo', date: '2026-08-15', title: 'Quinta Justa AO VIVO · São João da Boa Vista', projectId: 'p_qj', status: 'em_progresso' },
    { id: 'ms_visto', date: '2026-09-30', title: 'O-1B aprovado + visto carimbado em SP', projectId: 'p_frank', status: 'em_progresso' },
    { id: 'ms_10k_br', date: '2026-09-30', title: 'R$ 10.000/mês fixos via música BR', projectId: null, status: 'em_progresso' },
    { id: 'ms_consciencia', date: '2026-11-20', title: 'Concerto pico · Consciência Negra (AFMC + UZP)', projectId: 'p_afmc', status: 'em_progresso' },
    { id: 'ms_qj_100', date: '2026-12-31', title: 'Quinta Justa · 100 assinantes', projectId: 'p_qj', status: 'em_progresso' },
  ],
  kpis: [
    { id: 'k_afmc_sign', name: 'Termo AFMC assinado', projectId: 'p_afmc', weeklyTarget: 1, unit: 'assinatura', cadence: 'esta semana · gatilho para reunião UZP', current: 0 },
    { id: 'k_mentoria_venda', name: 'Vendas Mentoria AK', projectId: 'p_mentoria', weeklyTarget: 1, unit: 'venda nova', cadence: '1 nova mentoria a cada 30 dias · R$ 2,5–5k/ticket', current: 0 },
    { id: 'k_concursos', name: 'Concursos/vestibulares mapeados', projectId: 'p_mentoria', weeklyTarget: 20, unit: 'concursos', cadence: 'iniciar domingo · base do funil de mentoria', current: 0 },
    { id: 'k_qj_assinantes', name: 'Novos assinantes Quinta Justa', projectId: 'p_qj', weeklyTarget: 3, unit: 'assinantes', cadence: 'canal: apresentação presencial em grupos de nicho', current: 0 },
    { id: 'k_qj_pontos', name: 'Pontos de concentração QJ mapeados', projectId: 'p_qj', weeklyTarget: 10, unit: 'pontos', cadence: 'Alphaville, clubes, cinéfilos, leitura · domingo', current: 0 },
    { id: 'k_qj_apresentacoes', name: 'Apresentações presenciais QJ agendadas', projectId: 'p_qj', weeklyTarget: 1, unit: 'agendamentos', cadence: 'meta: 1 apresentação/mês', current: 0 },
    { id: 'k_frank_outreach', name: 'Contatos via Frank (instituições US)', projectId: 'p_frank', weeklyTarget: 5, unit: 'cartas/emails', cadence: 'Frank assina · janela Juneteenth+250º US', current: 0 },
    { id: 'k_linkedin_posts', name: 'Posts LinkedIn Business & AI', projectId: 'p_linkedin', weeklyTarget: 3, unit: 'posts', cadence: 'seg carrossel · qua artigo · sex carrossel', current: 0 },
    { id: 'k_industria', name: 'Mapeamento da indústria · horas', projectId: 'p_industria', weeklyTarget: 5, unit: 'horas', cadence: '60min/dia seg–sex', current: 0 },
    { id: 'k_networking', name: 'Networking LinkedIn (cold outreach)', projectId: 'p_linkedin', weeklyTarget: 30, unit: 'conexões', cadence: '30min/dia · 3 US + 3 BR', current: 0 },
    { id: 'k_kephra_reviews', name: 'Reviewers Tchaikovsky engajados', projectId: 'p_kephra', weeklyTarget: 5, unit: 'reviewers', cadence: 'envio gratuito + follow-up · pré-lançamento 15/06', current: 0 },
    { id: 'k_composicao', name: 'Horas de composição/regência', projectId: null, weeklyTarget: 12, unit: 'horas', cadence: '2h/dia × 6 dias', current: 0 },
    { id: 'k_newsletter', name: 'Newsletters enviadas', projectId: null, weeklyTarget: 1, unit: 'newsletter', cadence: 'sábado à noite', current: 0 },
  ],
  editorial: {
    canais: [
      { id: 'c_linkedin', name: 'LinkedIn · Business & AI', projectId: 'p_linkedin', color: '#1A365D', schedule: { 1: 'Carrossel estático', 3: 'Carrossel vídeo', 5: 'Artigo longo' } },
      { id: 'c_ig_jr', name: '@joaorocha_conductor', projectId: 'p_linkedin', color: '#A87B5B', schedule: { 2: 'Carrossel imagem', 4: 'Carrossel vídeo', 6: 'Story selfie' } },
      { id: 'c_ak_harmonia', name: 'AK · Harmonia & Intro ao Arranjo', projectId: 'p_harmonia', color: '#D4A33B', schedule: { 1: 'Carrossel imagem', 2: 'Carrossel vídeo', 3: 'Carrossel imagem', 4: 'Carrossel vídeo', 5: 'Carrossel imagem', 6: 'Carrossel vídeo' } },
      { id: 'c_porto', name: 'Curso Porto Seguro', projectId: 'p_porto', color: '#B5443B', schedule: { 1: 'Carrossel vídeo', 2: 'Carrossel imagem', 3: 'Carrossel vídeo', 4: 'Carrossel imagem', 5: 'Carrossel vídeo', 6: 'Carrossel imagem' } },
      { id: 'c_weddings', name: "Wedding's", projectId: 'p_weddings', color: '#9B6B8F', schedule: { 1: 'Carrossel imagem', 3: 'Carrossel vídeo', 5: 'Carrossel imagem' } },
      { id: 'c_qj', name: 'Quinta Justa', projectId: 'p_qj', color: '#7A8B5C', schedule: { 1: 'Carrossel vídeo', 2: 'Carrossel imagem', 3: 'Carrossel vídeo', 4: 'Carrossel imagem', 5: 'Carrossel vídeo', 6: 'Carrossel imagem' } },
      { id: 'c_kephra', name: 'Edições Kephra', projectId: 'p_kephra', color: '#8B5E3C', schedule: { 1: 'Story vendas', 2: 'Story vendas', 3: 'Story vendas', 4: 'Story vendas', 5: 'Story vendas', 6: 'Story vendas' } },
      { id: 'c_newsletter', name: 'Newsletter', projectId: null, color: '#5B7B9A', schedule: { 6: 'Envio noturno' } },
    ],
  },
  fixedActivities: [
    { id: 'f1', name: 'Composição ou Regência', dailyMinutes: 120, days: [1,2,3,4,5,6], priority: 'core' },
    { id: 'f_industria', name: 'Mapeamento da indústria', dailyMinutes: 60, days: [1,2,3,4,5], priority: 'core' },
    { id: 'f2', name: 'Networking LinkedIn (cold outreach 3 US + 3 BR)', dailyMinutes: 30, days: [1,2,3,4,5,6], priority: 'core' },
    { id: 'f3', name: 'Administração Financeira', dailyMinutes: 30, days: [1,2,3,4,5,6], priority: 'core' },
    { id: 'f4', name: 'Planejamento do dia seguinte', dailyMinutes: 30, days: [1,2,3,4,5,6], priority: 'core' },
    { id: 'f5', name: 'Meditação', dailyMinutes: 10, days: [1,2,3,4,5,6], priority: 'saude' },
    { id: 'f7', name: 'Sessão Quinta Justa (ao vivo)', dailyMinutes: 90, days: [4], priority: 'evento' },
    { id: 'f8', name: 'Revisão do sistema (semanal)', dailyMinutes: 60, days: [6], priority: 'meta' },
  ],
  blocks: [
    { id: 'b1', label: 'Bloco 1', start: '05:45', end: '07:00', kind: 'foco' },
    { id: 'b2', label: 'Intervalo', start: '07:00', end: '07:15', kind: 'pausa' },
    { id: 'b3', label: 'Bloco 2', start: '07:15', end: '09:00', kind: 'foco' },
    { id: 'b4', label: 'Intervalo', start: '09:00', end: '09:30', kind: 'pausa' },
    { id: 'b5', label: 'Bloco 3', start: '09:30', end: '11:30', kind: 'foco' },
    { id: 'b6', label: 'Almoço', start: '11:30', end: '13:00', kind: 'pausa' },
    { id: 'b7', label: 'Bloco 4', start: '13:00', end: '19:00', kind: 'operacional' },
    { id: 'b8', label: 'Quinta Justa (5ª)', start: '19:30', end: '21:00', kind: 'evento' },
  ],
  checkins: {},
  schedule: {}, // assignments of project -> day/block
  coachHistory: [],
};

// ============================================================
// REDUCER
// ============================================================
function reducer(state, action) {
  switch (action.type) {
    case 'HYDRATE': return action.payload;
    case 'UPDATE_GOAL': return { ...state, goals: state.goals.map(g => g.id === action.id ? { ...g, ...action.patch } : g) };
    case 'ADD_GOAL': return { ...state, goals: [...state.goals, action.goal] };
    case 'DELETE_GOAL': return { ...state, goals: state.goals.filter(g => g.id !== action.id) };
    case 'UPDATE_PROJECT': return { ...state, projects: state.projects.map(p => p.id === action.id ? { ...p, ...action.patch } : p) };
    case 'ADD_PROJECT': return { ...state, projects: [...state.projects, action.project] };
    case 'DELETE_PROJECT': return { ...state, projects: state.projects.filter(p => p.id !== action.id) };
    case 'ADD_TASK': return { ...state, projects: state.projects.map(p => p.id === action.projectId ? { ...p, etapas: [...p.etapas, action.task] } : p) };
    case 'TOGGLE_TASK': return { ...state, projects: state.projects.map(p => p.id === action.projectId ? { ...p, etapas: p.etapas.map(t => t.id === action.taskId ? { ...t, done: !t.done } : t) } : p) };
    case 'UPDATE_TASK': return { ...state, projects: state.projects.map(p => p.id === action.projectId ? { ...p, etapas: p.etapas.map(t => t.id === action.taskId ? { ...t, ...action.patch } : t) } : p) };
    case 'DELETE_TASK': return { ...state, projects: state.projects.map(p => p.id === action.projectId ? { ...p, etapas: p.etapas.filter(t => t.id !== action.taskId) } : p) };
    case 'CHECKIN': return { ...state, checkins: { ...state.checkins, [action.date]: action.data } };
    case 'ADD_COACH_MSG': return { ...state, coachHistory: [...state.coachHistory, action.msg] };
    case 'CLEAR_COACH': return { ...state, coachHistory: [] };
    case 'UPDATE_META': return { ...state, meta: { ...state.meta, ...action.patch } };
    case 'ADD_MILESTONE': return { ...state, milestones: [...(state.milestones||[]), action.milestone] };
    case 'UPDATE_MILESTONE': return { ...state, milestones: (state.milestones||[]).map(m => m.id === action.id ? { ...m, ...action.patch } : m) };
    case 'DELETE_MILESTONE': return { ...state, milestones: (state.milestones||[]).filter(m => m.id !== action.id) };
    case 'UPDATE_KPI': return { ...state, kpis: (state.kpis||[]).map(k => k.id === action.id ? { ...k, ...action.patch } : k) };
    case 'ADD_KPI': return { ...state, kpis: [...(state.kpis||[]), action.kpi] };
    case 'DELETE_KPI': return { ...state, kpis: (state.kpis||[]).filter(k => k.id !== action.id) };
    case 'RESET_KPIS': return { ...state, kpis: (state.kpis||[]).map(k => ({ ...k, current: 0 })) };
    case 'UPDATE_TEMPLATE_CELL': {
      const tpl = state.weeklyTemplate || [];
      const idx = tpl.findIndex(t => t.day === action.day && t.blockId === action.blockId);
      if (idx >= 0) {
        const next = [...tpl];
        next[idx] = { ...next[idx], ...action.patch };
        return { ...state, weeklyTemplate: next };
      }
      return { ...state, weeklyTemplate: [...tpl, { day: action.day, blockId: action.blockId, ...action.patch }] };
    }
    case 'DELETE_TEMPLATE_CELL': return { ...state, weeklyTemplate: (state.weeklyTemplate||[]).filter(t => !(t.day === action.day && t.blockId === action.blockId)) };
    case 'ADD_DATE_EVENT': return { ...state, dateEvents: [...(state.dateEvents||[]), action.event] };
    case 'UPDATE_DATE_EVENT': return { ...state, dateEvents: (state.dateEvents||[]).map(d => d.id === action.id ? { ...d, ...action.patch } : d) };
    case 'DELETE_DATE_EVENT': return { ...state, dateEvents: (state.dateEvents||[]).filter(d => d.id !== action.id) };
    case 'RESET': return seed;
    default: return state;
  }
}

const uid = () => Math.random().toString(36).slice(2, 10);

// ============================================================
// STYLES
// ============================================================
const styles = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=JetBrains+Mono:wght@400;500&display=swap');

:root {
  /* Geometric Music Mosaic palette */
  --bg: #F7F5F0;
  --surface: #FFFFFF;
  --surface-2: #EDE8E0;
  --border: rgba(43,43,43,0.09);
  --border-strong: rgba(43,43,43,0.18);
  --text: #2B2B2B;
  --text-muted: #5A5245;
  --text-dim: #8A7F70;
  --accent: #B85A38;
  --accent-dim: #8A3F24;
  --gold: #D4A33B;
  --gold-dim: #9E7924;
  --green: #2D4A3E;
  --blue: #1A365D;
  --olive: #4A5D3B;
  --danger: #B85A38;
  --sidebar-bg: #1A365D;
  --sidebar-text: #E5DCD0;
  --sidebar-muted: rgba(229,220,208,0.5);
  --sidebar-dim: rgba(229,220,208,0.25);
  --display: 'Bebas Neue', 'Barlow Condensed', Impact, sans-serif;
  --display-alt: 'Barlow Condensed', 'Bebas Neue', sans-serif;
  --body: 'DM Sans', system-ui, sans-serif;
  --mono: 'JetBrains Mono', monospace;
}

* { box-sizing: border-box; }

/* Subtle grain overlay */
.kephra-app::after {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
  opacity: 0.025;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
  background-repeat: repeat;
}

.kephra-app {
  font-family: var(--body);
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
  display: grid;
  grid-template-columns: 248px 1fr;
  letter-spacing: -0.005em;
}

/* ── SIDEBAR ── */
.sidebar {
  background: var(--sidebar-bg);
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
  padding: 28px 0 28px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* geometric grid decoration bottom-right of sidebar */
.sidebar::before {
  content: '';
  position: absolute;
  bottom: -10px; right: -10px;
  width: 140px; height: 140px;
  background-image:
    linear-gradient(90deg, rgba(212,163,59,0.18) 1px, transparent 1px),
    linear-gradient(rgba(212,163,59,0.18) 1px, transparent 1px);
  background-size: 14px 14px;
  -webkit-mask-image: radial-gradient(circle at 100% 100%, black 20%, transparent 72%);
  mask-image: radial-gradient(circle at 100% 100%, black 20%, transparent 72%);
  pointer-events: none;
}

/* hairline rule top of sidebar */
.sidebar::after {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--gold) 0%, transparent 70%);
}

.sidebar-inner { padding: 0 22px; flex: 1; overflow-y: auto; }

.brand {
  font-family: var(--display);
  font-size: 30px;
  font-weight: 400;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--sidebar-text);
  margin-bottom: 2px;
  line-height: 1;
}
.brand-italic { color: var(--gold); }
.brand-sub {
  font-family: var(--mono);
  font-size: 8px;
  text-transform: uppercase;
  letter-spacing: 0.22em;
  color: var(--sidebar-muted);
  margin-bottom: 32px;
}

.nav-section {
  font-family: var(--mono);
  font-size: 8px;
  text-transform: uppercase;
  letter-spacing: 0.22em;
  color: var(--sidebar-dim);
  margin: 24px 0 6px;
  padding: 0 2px;
  border-top: 1px solid rgba(229,220,208,0.08);
  padding-top: 16px;
}

.nav-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 7px 10px;
  margin-bottom: 1px;
  border-left: 2px solid transparent;
  font-size: 12px;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  cursor: pointer;
  transition: all 0.1s ease;
  color: var(--sidebar-muted);
}
.nav-item:hover { color: var(--sidebar-text); background: rgba(229,220,208,0.06); }
.nav-item.active {
  color: var(--sidebar-text);
  border-left-color: var(--gold);
  background: rgba(229,220,208,0.08);
}
.nav-item .badge {
  font-family: var(--mono);
  font-size: 9px;
  color: var(--sidebar-muted);
  background: rgba(229,220,208,0.1);
  padding: 1px 5px;
  border-radius: 2px;
}

/* ── MAIN ── */
.main {
  padding: 48px 60px 100px;
  max-width: 1280px;
}

/* ── PAGE HEADER ── */
.page-header { margin-bottom: 40px; }

.page-eyebrow {
  font-family: var(--body);
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.28em;
  color: var(--accent);
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.page-eyebrow::before {
  content: '';
  display: inline-block;
  width: 20px;
  height: 1px;
  background: var(--accent);
}

.page-title {
  font-family: var(--display);
  font-size: 72px;
  font-weight: 400;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  line-height: 0.92;
  margin: 0 0 12px;
  color: var(--blue);
}
.page-title em { font-style: normal; color: var(--accent); }

.page-sub {
  color: var(--text-muted);
  font-size: 14px;
  max-width: 580px;
  line-height: 1.55;
  font-weight: 300;
}

/* ── GRID ── */
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }

/* ── CARDS ── */
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-top: 2px solid var(--border-strong);
  padding: 20px;
}

.card-title {
  font-family: var(--display-alt);
  font-size: 19px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 4px;
  color: var(--blue);
}
.card-sub {
  font-family: var(--mono);
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--text-dim);
  margin-bottom: 16px;
}

/* ── STATS ── */
.stat-value {
  font-family: var(--display);
  font-size: 52px;
  font-weight: 400;
  letter-spacing: 0.02em;
  line-height: 1;
  color: var(--blue);
}
.stat-value em { font-style: normal; color: var(--accent); }
.stat-label {
  font-family: var(--mono);
  font-size: 8px;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--text-dim);
  margin-top: 8px;
}

/* ── COUNTDOWN ── */
.countdown {
  display: flex;
  gap: 0;
  background: var(--blue);
  margin-bottom: 24px;
  position: relative;
  overflow: hidden;
}
/* hairline grid overlay on countdown */
.countdown::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(90deg, rgba(212,163,59,0.06) 1px, transparent 1px),
    linear-gradient(rgba(212,163,59,0.06) 1px, transparent 1px);
  background-size: 20px 20px;
  pointer-events: none;
}
.countdown-item {
  position: relative;
  z-index: 1;
  flex: 1;
  padding: 24px 28px;
  border-right: 1px solid rgba(229,220,208,0.1);
}
.countdown-item:last-child { border-right: none; }
.countdown-num {
  font-family: var(--display);
  font-size: 56px;
  font-weight: 400;
  letter-spacing: 0.02em;
  line-height: 1;
  color: var(--sidebar-text);
}
.countdown-num em { color: var(--gold); font-style: normal; }
.countdown-label {
  font-family: var(--mono);
  font-size: 8px;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: rgba(229,220,208,0.5);
  margin-top: 8px;
}

/* ── BARS ── */
.bar-track {
  height: 3px;
  background: var(--border-strong);
  margin: 8px 0;
  overflow: hidden;
}
.bar-fill {
  height: 100%;
  background: var(--accent);
  transition: width 0.4s ease;
}

/* ── PROJECT ROW ── */
.project-row {
  display: grid;
  grid-template-columns: 3px 1fr auto auto;
  gap: 16px;
  align-items: center;
  padding: 14px 16px;
  background: var(--surface);
  border: 1px solid var(--border);
  margin-bottom: 6px;
  cursor: pointer;
  transition: all 0.1s ease;
}
.project-row:hover { border-color: var(--border-strong); transform: translateX(3px); }
.project-bar { width: 3px; height: 36px; }
.project-name {
  font-family: var(--display-alt);
  font-size: 16px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--blue);
}
.project-meta {
  font-family: var(--mono);
  font-size: 9px;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  margin-top: 2px;
}
.project-hours { font-family: var(--mono); font-size: 12px; color: var(--gold); font-weight: 500; }
.project-progress { font-family: var(--mono); font-size: 10px; color: var(--text-muted); }

/* ── BUTTONS ── */
.btn {
  font-family: var(--body);
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  padding: 9px 16px;
  border: 1px solid var(--border-strong);
  background: transparent;
  color: var(--text);
  cursor: pointer;
  transition: all 0.12s ease;
}
.btn:hover { background: var(--text); color: var(--bg); border-color: var(--text); }
.btn-primary { background: var(--accent); border-color: var(--accent); color: white; }
.btn-primary:hover { background: var(--accent-dim); border-color: var(--accent-dim); color: white; }
.btn-ghost { background: transparent; border-color: transparent; color: var(--text-muted); padding: 4px 8px; }
.btn-ghost:hover { color: var(--accent); background: transparent; border-color: transparent; }
.btn-sm { padding: 5px 10px; font-size: 9px; }

/* ── INPUTS ── */
.input, .textarea, .select {
  font-family: var(--body);
  font-size: 13px;
  padding: 9px 12px;
  background: var(--surface);
  border: 1px solid var(--border-strong);
  color: var(--text);
  width: 100%;
  outline: none;
  border-radius: 0;
}
.input:focus, .textarea:focus, .select:focus { border-color: var(--accent); }
.textarea { resize: vertical; min-height: 80px; font-family: var(--body); }
.label {
  font-family: var(--mono);
  font-size: 8px;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--text-dim);
  margin-bottom: 6px;
  display: block;
}

/* ── TAGS ── */
.tag {
  display: inline-block;
  font-family: var(--mono);
  font-size: 8px;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  padding: 2px 6px;
  background: var(--surface-2);
  color: var(--text-muted);
  border: 1px solid var(--border-strong);
}
.tag-accent { color: var(--accent); border-color: rgba(184,90,56,0.3); background: rgba(184,90,56,0.06); }
.tag-gold { color: var(--gold-dim); border-color: rgba(212,163,59,0.3); background: rgba(212,163,59,0.06); }
.tag-green { color: var(--green); border-color: rgba(45,74,62,0.3); background: rgba(45,74,62,0.06); }

/* ── DIVIDER ── */
.divider {
  height: 1px;
  background: var(--border);
  margin: 28px 0;
  position: relative;
}
.divider::before {
  content: '';
  position: absolute;
  left: 0; top: 0;
  width: 40px; height: 1px;
  background: var(--gold);
}

/* ── TASKS ── */
.task-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 9px 0;
  border-bottom: 1px solid var(--border);
}
.task-row:last-child { border-bottom: none; }
.checkbox {
  width: 14px; height: 14px;
  border: 1.5px solid var(--border-strong);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}
.checkbox.done { background: var(--accent); border-color: var(--accent); color: white; }
.task-text { flex: 1; font-size: 13px; font-weight: 300; line-height: 1.4; }
.task-text.done { color: var(--text-dim); text-decoration: line-through; }

/* ── MODAL ── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(26,54,93,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 24px;
  backdrop-filter: blur(3px);
}
.modal {
  background: var(--surface);
  border: 1px solid var(--border-strong);
  border-top: 3px solid var(--accent);
  padding: 32px;
  max-width: 560px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}
.modal-title {
  font-family: var(--display);
  font-size: 32px;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--blue);
  margin: 0 0 20px;
}

.field { margin-bottom: 16px; }
.modal-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 24px; }

/* ── COACH ── */
.coach-container {
  display: grid;
  grid-template-rows: 1fr auto;
  gap: 16px;
  height: calc(100vh - 200px);
}
.coach-msgs {
  background: var(--surface);
  border: 1px solid var(--border);
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.coach-msg {
  max-width: 78%;
  padding: 12px 16px;
  font-size: 13px;
  font-weight: 300;
  line-height: 1.55;
}
.coach-msg.user {
  background: var(--blue);
  color: var(--sidebar-text);
  align-self: flex-end;
}
.coach-msg.assistant {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-left: 2px solid var(--gold);
  align-self: flex-start;
  white-space: pre-wrap;
}
.coach-empty {
  text-align: center;
  color: var(--text-dim);
  font-family: var(--display-alt);
  font-style: italic;
  font-size: 17px;
  padding: 60px 20px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.coach-input { display: flex; gap: 8px; }
.coach-input .textarea { flex: 1; min-height: 48px; }

/* ── CAPACITY BAR ── */
.capacity-bar {
  display: flex;
  height: 28px;
  overflow: hidden;
  border: 1px solid var(--border-strong);
  margin: 12px 0 20px;
}
.capacity-segment {
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--mono);
  font-size: 9px;
  color: white;
  letter-spacing: 0.06em;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  padding: 0 4px;
}

/* ── ROUTINE GRID ── */
.routine-grid {
  display: grid;
  grid-template-columns: 80px repeat(6, 1fr);
  gap: 1px;
  background: var(--border-strong);
  border: 1px solid var(--border-strong);
  overflow: hidden;
}
.routine-cell {
  background: var(--surface);
  padding: 8px;
  min-height: 52px;
  font-size: 11px;
  font-weight: 300;
}
.routine-cell.header {
  background: var(--blue);
  font-family: var(--mono);
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 9px;
  color: var(--sidebar-muted);
  text-align: center;
  padding: 10px 4px;
}
.routine-cell.time { background: var(--surface-2); font-family: var(--mono); font-size: 9px; color: var(--text-muted); }
.routine-cell.pausa { background: var(--bg); color: var(--text-dim); font-style: italic; }
.routine-cell.foco { background: var(--surface); }
.routine-cell.evento { background: var(--olive); color: white; }

/* ── FLAGS ── */
.flag {
  display: inline-block;
  padding: 2px 7px;
  font-family: var(--mono);
  font-size: 8px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  margin-right: 6px;
}
.flag-curto { background: var(--accent); color: white; }
.flag-medio { background: var(--gold); color: var(--text); }
.flag-longo { background: var(--blue); color: white; }

/* ── GOAL CARD ── */
.goal-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-left: 3px solid var(--accent);
  padding: 16px 18px;
  margin-bottom: 10px;
}
.goal-card.medio { border-left-color: var(--gold); }
.goal-card.longo { border-left-color: var(--blue); }
.goal-title {
  font-family: var(--display-alt);
  font-size: 17px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--blue);
  margin: 0 0 6px;
}
.goal-metric { font-family: var(--mono); font-size: 11px; color: var(--text-muted); margin-bottom: 8px; }
.goal-deadline { font-family: var(--mono); font-size: 10px; color: var(--accent); font-weight: 500; }

/* ── QUOTE ── */
.quote {
  font-family: var(--display-alt);
  font-style: italic;
  font-size: 20px;
  font-weight: 300;
  line-height: 1.45;
  color: var(--sidebar-text);
  padding: 28px 32px;
  background: var(--blue);
  margin: 24px 0;
  letter-spacing: 0.01em;
  text-transform: uppercase;
  position: relative;
  overflow: hidden;
}
.quote::before {
  content: '"';
  position: absolute;
  top: -10px; left: 20px;
  font-family: var(--display);
  font-size: 120px;
  color: rgba(212,163,59,0.12);
  line-height: 1;
  pointer-events: none;
}
.quote-author {
  font-family: var(--mono);
  font-style: normal;
  font-size: 8px;
  text-transform: uppercase;
  letter-spacing: 0.22em;
  color: rgba(229,220,208,0.45);
  margin-top: 14px;
  display: block;
}

/* ── LOADING ── */
.loading-dot { display: inline-block; animation: pulse 1.4s infinite; }
.loading-dot:nth-child(2) { animation-delay: 0.2s; }
.loading-dot:nth-child(3) { animation-delay: 0.4s; }
@keyframes pulse { 0%, 60%, 100% { opacity: 0.3; } 30% { opacity: 1; } }

/* ── RESPONSIVE ── */
@media (max-width: 768px) {
  .kephra-app { grid-template-columns: 1fr; }
  .sidebar { position: relative; height: auto; }
  .main { padding: 24px 20px 60px; }
  .grid-2, .grid-3, .grid-4 { grid-template-columns: 1fr; }
  .countdown { flex-direction: column; }
  .page-title { font-size: 48px; }
}
`;

// ============================================================
// HELPERS
// ============================================================
const daysUntil = (iso) => {
  const target = new Date(iso + 'T00:00:00');
  const now = new Date();
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
};
const fmtBRL = (n) => `R$ ${n.toLocaleString('pt-BR')}`;
const projectProgress = (p) => p.etapas.length ? Math.round(p.etapas.filter(t => t.done).length / p.etapas.length * 100) : 0;

// ============================================================
// COMPONENTS
// ============================================================

function Sidebar({ view, setView, state }) {
  const totalTasks = state.projects.reduce((acc, p) => acc + p.etapas.length, 0);
  const doneTasks = state.projects.reduce((acc, p) => acc + p.etapas.filter(t => t.done).length, 0);
  const milestonesCount = (state.milestones || []).filter(m => m.status === 'em_progresso').length;
  const upcomingDates = (state.dateEvents || []).filter(d => { const days = daysUntil(d.date); return days >= 0 && days <= 30; }).length;
  const items = [
    { section: 'Comando' },
    { id: 'filter', label: 'Filtro de decisão', badge: 'A·B·C·D' },
    { id: 'dashboard', label: 'Hoje', badge: null },
    { id: 'template', label: 'Template semanal', badge: null },
    { id: 'capacity', label: 'Capacidade', badge: `${state.meta.weeklyProjectBudget}h` },
    { id: 'kpis', label: 'KPIs', badge: (state.kpis||[]).length },
    { section: 'Execução' },
    { id: 'projects', label: 'Projetos', badge: `${doneTasks}/${totalTasks}` },
    { id: 'milestones', label: 'Marcos', badge: milestonesCount },
    { id: 'goals', label: 'Metas', badge: state.goals.length },
    { section: 'Operação' },
    { id: 'routine', label: 'Rotina', badge: null },
    { id: 'editorial', label: 'Calendário editorial', badge: null },
    { id: 'dates', label: 'Datas estratégicas', badge: upcomingDates || null },
    { section: 'Inteligência' },
    { id: 'coach', label: 'Conselho IA', badge: null },
    { id: 'settings', label: 'Ajustes', badge: null },
  ];
  return (
    <aside className="sidebar">
      <div className="sidebar-inner">
      <div className="brand">Sistema <span className="brand-italic">Kephra</span></div>
      <div className="brand-sub">João Rocha · Kephra System v4</div>
      {items.map((it, i) => it.section ? (
        <div key={i} className="nav-section">{it.section}</div>
      ) : (
        <div key={it.id} className={`nav-item ${view === it.id ? 'active' : ''}`} onClick={() => setView(it.id)}>
          <span>{it.label}</span>
          {it.badge != null && <span className="badge">{it.badge}</span>}
        </div>
      ))}
      <div style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid rgba(229,220,208,0.12)', fontFamily: 'var(--mono)', fontSize: 8, color: 'rgba(229,220,208,0.3)', textTransform: 'uppercase', letterSpacing: '0.18em', lineHeight: 1.8 }}>
        Foco no processo<br/>resultado é consequência
      </div>
      </div>
    </aside>
  );
}

// ============================================================
// FILTER PANEL — versão compacta para o Dashboard
// ============================================================
function FilterPanel({ state, setView }) {
  const vectors = ['a', 'b', 'c', 'd'];
  const countByVector = (vid) => {
    const goals = (state.goals || []).filter(g => g.vector === vid).length;
    const projects = (state.projects || []).filter(p => p.vector === vid && p.status === 'ativo').length;
    return { goals, projects };
  };
  return (
    <div className="card" style={{ marginBottom: 24, borderTopColor: 'var(--gold)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
        <div>
          <div className="card-title">Filtro de decisão</div>
          <div className="card-sub">toda ação responde a pelo menos um vetor · senão, é ruído</div>
        </div>
        <button className="btn btn-sm" onClick={() => setView('filter')}>Ver protocolo</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {vectors.map(vid => {
          const v = VECTORS[vid];
          const c = countByVector(vid);
          return (
            <div key={vid} style={{ padding: '12px 14px', border: `1px solid ${v.color}33`, borderLeft: `3px solid ${v.color}`, background: 'var(--surface)' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: v.color, letterSpacing: '0.18em', fontWeight: 500, marginBottom: 4 }}>{v.short} · {v.icon}</div>
              <div style={{ fontFamily: 'var(--display)', fontSize: 16, color: 'var(--blue)', fontWeight: 500, lineHeight: 1.15, marginBottom: 6 }}>{v.label}</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{c.goals} meta{c.goals !== 1 ? 's' : ''} · {c.projects} projeto{c.projects !== 1 ? 's' : ''}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// FILTER VIEW — página dedicada ao protocolo
// ============================================================
function FilterView({ state, setView }) {
  const vectors = ['a', 'b', 'c', 'd'];
  return (
    <div>
      <div className="page-header">
        <div className="page-eyebrow">Protocolo de decisão · 23 de maio de 2026</div>
        <h1 className="page-title">O <em>filtro</em> que governa tudo.</h1>
        <p className="page-sub">Toda ação, projeto ou compromisso passa por esses quatro vetores. Se não responde a pelo menos um, é ruído — independente de quem está envolvido.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 28 }}>
        {vectors.map(vid => {
          const v = VECTORS[vid];
          const goals = (state.goals || []).filter(g => g.vector === vid);
          const projects = (state.projects || []).filter(p => p.vector === vid && p.status === 'ativo');
          return (
            <div key={vid} className="card" style={{ borderTopColor: v.color, borderTopWidth: 3 }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: v.color, letterSpacing: '0.2em', fontWeight: 500, marginBottom: 6 }}>VETOR {v.short}</div>
              <div style={{ fontFamily: 'var(--display)', fontSize: 24, color: 'var(--blue)', fontWeight: 400, lineHeight: 1, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.02em' }}>{v.label}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 14 }}>{v.desc}</div>
              {goals.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text-dim)', letterSpacing: '0.18em', marginBottom: 6 }}>METAS</div>
                  {goals.map(g => (
                    <div key={g.id} style={{ fontSize: 12, lineHeight: 1.5, padding: '3px 0' }}>· {g.title}</div>
                  ))}
                </div>
              )}
              {projects.length > 0 && (
                <div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text-dim)', letterSpacing: '0.18em', marginBottom: 6 }}>PROJETOS ATIVOS</div>
                  {projects.map(p => (
                    <div key={p.id} style={{ fontSize: 12, lineHeight: 1.5, padding: '3px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 6, height: 6, background: p.color, borderRadius: 1, display: 'inline-block' }} />
                      {p.name} <span style={{ color: 'var(--text-dim)', fontFamily: 'var(--mono)', fontSize: 10 }}>· {p.weeklyHours}h</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="quote">
        {state.meta.posture}
        <span className="quote-author">— Protocolo JR · 23 de maio de 2026</span>
      </div>

      <div className="card">
        <div className="card-title">Postura operacional</div>
        <div style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text-muted)', marginTop: 10 }}>
          <p style={{ marginTop: 0 }}>· <strong style={{ color: 'var(--text)' }}>Pior cenário já é a linha de base.</strong> Isolamento, rejeição, crítica — tudo isso já é tolerado há tempos. Não é argumento contra agir.</p>
          <p>· <strong style={{ color: 'var(--text)' }}>Medo de crítica/rejeição é freio, não veto.</strong> Identificar e atravessar.</p>
          <p>· <strong style={{ color: 'var(--text)' }}>Restrição real = caixa.</strong> Não opinião alheia. Operar como quem já explodiu o teto.</p>
          <p style={{ marginBottom: 0 }}>· <strong style={{ color: 'var(--text)' }}>Ação que não responde a nenhum vetor</strong> é ruído. Cortar sem culpa.</p>
        </div>
      </div>
    </div>
  );
}

function Dashboard({ state, dispatch, setView }) {
  const daysToBirthday = daysUntil(state.meta.targetBirthday);
  const daysToApt = daysUntil(state.meta.apartmentDeadline);
  const today = new Date();
  const dow = today.getDay(); // 0=domingo, 1=segunda...
  const isWorkday = dow >= 1 && dow <= 6;

  const todayActivities = state.fixedActivities.filter(a => a.days.includes(dow));
  const allTasks = state.projects.flatMap(p => p.etapas.filter(t => !t.done).map(t => ({ ...t, projectName: p.name, projectId: p.id, color: p.color })));
  const urgentTasks = allTasks.slice(0, 5);

  const totalEtapas = state.projects.reduce((a, p) => a + p.etapas.length, 0);
  const totalDone = state.projects.reduce((a, p) => a + p.etapas.filter(t => t.done).length, 0);
  const overallProgress = totalEtapas ? Math.round(totalDone / totalEtapas * 100) : 0;

  // Template do dia: blocos com atividades atribuídas
  const todayTemplate = (state.weeklyTemplate || []).filter(t => t.day === dow);
  const orderedBlocks = state.blocks.filter(b => b.kind !== 'pausa');
  const blockMap = Object.fromEntries(state.blocks.map(b => [b.id, b]));

  // Datas estratégicas: próximos 14 dias
  const upcomingDates = (state.dateEvents || [])
    .map(d => ({ ...d, days: daysUntil(d.date) }))
    .filter(d => d.days >= 0 && d.days <= 14)
    .sort((a,b) => a.days - b.days);

  return (
    <div>
      <div className="page-header">
        <div className="page-eyebrow">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
        <h1 className="page-title">Bom dia, <em>João</em>.</h1>
        <p className="page-sub">Você definiu o caminho. Hoje é só execução.</p>
      </div>

      <FilterPanel state={state} setView={setView} />

      <div className="countdown">
        <div className="countdown-item">
          <div className="countdown-num"><em>{daysToApt}</em></div>
          <div className="countdown-label">dias até apartamento próprio</div>
        </div>
        <div style={{ width: 1, background: 'var(--border-strong)' }} />
        <div className="countdown-item">
          <div className="countdown-num"><em>{daysToBirthday}</em></div>
          <div className="countdown-label">dias até 43 anos</div>
        </div>
        <div style={{ width: 1, background: 'var(--border-strong)' }} />
        <div className="countdown-item">
          <div className="countdown-num">{overallProgress}<span style={{ fontSize: 20, color: 'var(--text-dim)' }}>%</span></div>
          <div className="countdown-label">execução geral dos projetos</div>
        </div>
      </div>

      {isWorkday && todayTemplate.length > 0 && (
        <div className="card" style={{ marginBottom: 24, borderColor: 'var(--border-strong)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
            <div>
              <div className="card-title">Seu dia agora — execute em ordem</div>
              <div className="card-sub">{todayTemplate.length} blocos definidos · sem decisões, só execução</div>
            </div>
            <button className="btn btn-sm" onClick={() => setView('template')}>Editar template</button>
          </div>
          {orderedBlocks.map(b => {
            const cell = todayTemplate.find(t => t.blockId === b.id);
            const proj = cell ? state.projects.find(p => p.id === cell.projectId) : null;
            return (
              <div key={b.id} style={{ display: 'grid', gridTemplateColumns: '100px 4px 1fr', gap: 12, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text)' }}>{b.start}<span style={{ color: 'var(--text-dim)' }}>–{b.end}</span></div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: 2 }}>{b.label}</div>
                </div>
                <div style={{ width: 4, height: 40, background: proj?.color || 'var(--border)', borderRadius: 2 }} />
                <div>
                  {cell ? (
                    <>
                      <div style={{ fontSize: 14, fontFamily: 'var(--display)', fontWeight: 500 }}>{cell.activity}</div>
                      {proj && <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: proj.color, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 2 }}>{proj.name}</div>}
                    </>
                  ) : (
                    <div style={{ fontSize: 13, color: 'var(--text-dim)', fontStyle: 'italic' }}>— sem atribuição (defina no template)</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!isWorkday && (
        <div className="quote" style={{ marginBottom: 24 }}>
          Domingo. Descanso é parte do sistema. Amanhã o template volta.
        </div>
      )}

      <div className="grid-2">
        <div className="card">
          <div className="card-title">Compromissos fixos de hoje</div>
          <div className="card-sub">{todayActivities.length} atividades · {todayActivities.reduce((a,x)=>a+x.dailyMinutes,0)} min</div>
          {todayActivities.map(a => (
            <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 14 }}>
              <span>{a.name}</span>
              <span style={{ fontFamily: 'var(--mono)', color: 'var(--gold)', fontSize: 12 }}>{a.dailyMinutes}m</span>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-title">Próximas tarefas</div>
          <div className="card-sub">5 mais imediatas · {allTasks.length} no total</div>
          {urgentTasks.length === 0 ? (
            <div style={{ color: 'var(--text-dim)', fontStyle: 'italic', padding: '12px 0' }}>Nenhuma tarefa pendente.</div>
          ) : urgentTasks.map(t => (
            <div key={t.id} className="task-row">
              <div className="checkbox" onClick={() => dispatch({ type: 'TOGGLE_TASK', projectId: t.projectId, taskId: t.id })} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14 }}>{t.title}</div>
                <div style={{ fontSize: 11, color: t.color, fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 2 }}>{t.projectName}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="quote">
        Operar 100% do tempo como quem já explodiu o teto. Pior cenário já é linha de base — não é argumento contra agir. Restrição real = caixa, não opinião alheia.
        <span className="quote-author">— Protocolo JR · 23 de maio de 2026</span>
      </div>

      {(() => {
        const upcoming = (state.milestones || []).filter(m => m.status === 'em_progresso' && daysUntil(m.date) >= 0).sort((a,b) => a.date.localeCompare(b.date)).slice(0, 4);
        if (upcoming.length === 0) return null;
        return (
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-title">Próximos marcos</div>
            <div className="card-sub">{upcoming.length} eventos de data fixa</div>
            {upcoming.map(m => {
              const proj = state.projects.find(p => p.id === m.projectId);
              const days = daysUntil(m.date);
              return (
                <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontSize: 14, fontFamily: 'var(--display)' }}>{m.title}</div>
                    {proj && <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: proj.color, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 2 }}>{proj.name}</div>}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 13, color: days < 30 ? 'var(--accent)' : 'var(--gold)' }}>{days} dias</div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-dim)' }}>{m.date}</div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}

      {upcomingDates.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
            <div>
              <div className="card-title">Datas estratégicas — próximos 14 dias</div>
              <div className="card-sub">Efemérides e datas que devem virar conteúdo</div>
            </div>
            <button className="btn btn-sm" onClick={() => setView('dates')}>Ver todas</button>
          </div>
          {upcomingDates.map(d => (
            <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ flex: 1, paddingRight: 16 }}>
                <div style={{ fontSize: 14, fontFamily: 'var(--display)' }}>{d.title}</div>
                <div style={{ marginTop: 4 }}>
                  {(d.channels || []).map(c => <span key={c} className="tag" style={{ marginRight: 4 }}>{c}</span>)}
                  {d.priority === 'alta' && <span className="tag tag-accent">alta</span>}
                  {d.priority === 'media' && <span className="tag tag-gold">média</span>}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 13, color: d.days <= 3 ? 'var(--accent)' : 'var(--gold)' }}>{d.days === 0 ? 'HOJE' : `${d.days}d`}</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-dim)' }}>{d.date.slice(5)}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid-3">
        <div className="card">
          <div className="stat-value"><em>{fmtBRL(state.meta.monthlyTargetBRL)}</em></div>
          <div className="stat-label">Meta de renda mensal</div>
        </div>
        <div className="card">
          <div className="stat-value">{state.meta.weeklyProjectBudget}<span style={{ fontSize: 18, color: 'var(--text-dim)' }}>h</span></div>
          <div className="stat-label">Horas semanais para projetos</div>
        </div>
        <div className="card">
          <div className="stat-value">{state.projects.filter(p => p.status === 'ativo').length}</div>
          <div className="stat-label">Projetos estratégicos ativos</div>
        </div>
      </div>
    </div>
  );
}

function Capacity({ state, dispatch }) {
  const totalAlloc = state.projects.reduce((a, p) => a + (p.status === 'ativo' ? p.weeklyHours : 0), 0);
  const remaining = state.meta.weeklyProjectBudget - totalAlloc;

  return (
    <div>
      <div className="page-header">
        <div className="page-eyebrow">Sistema · Capacidade</div>
        <h1 className="page-title">Suas <em>{state.meta.weeklyProjectBudget} horas</em> de manobra.</h1>
        <p className="page-sub">{state.meta.weeklyAvailable}h totais por semana (seg–sáb) menos {state.meta.weeklyFixed}h de compromissos fixos. O que sobra é onde sua vida é construída.</p>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
          <div>
            <div className="card-title">Alocação atual</div>
            <div className="card-sub">{totalAlloc}h alocadas · {remaining >= 0 ? `${remaining}h livres` : `${-remaining}h excedidas`}</div>
          </div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 13, color: remaining < 0 ? 'var(--accent)' : 'var(--green)' }}>
            {totalAlloc}/{state.meta.weeklyProjectBudget}h
          </div>
        </div>
        <div className="capacity-bar">
          {state.projects.filter(p => p.status === 'ativo').map(p => (
            <div key={p.id} className="capacity-segment" style={{ background: p.color, width: `${(p.weeklyHours / state.meta.weeklyProjectBudget) * 100}%` }} title={`${p.name}: ${p.weeklyHours}h`}>
              {p.weeklyHours}h
            </div>
          ))}
          {remaining > 0 && (
            <div className="capacity-segment" style={{ background: 'var(--border)', color: 'var(--text-muted)', width: `${(remaining / state.meta.weeklyProjectBudget) * 100}%` }}>
              {remaining}h reserva
            </div>
          )}
        </div>
        <div style={{ marginTop: 8 }}>
          {state.projects.filter(p => p.status === 'ativo').map(p => (
            <div key={p.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginRight: 14, marginBottom: 6, fontSize: 12 }}>
              <span style={{ width: 10, height: 10, background: p.color, borderRadius: 2, display: 'inline-block' }} />
              {p.name} · <span style={{ fontFamily: 'var(--mono)', color: 'var(--gold)' }}>{p.weeklyHours}h</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-title">Ajustar alocação semanal</div>
        <div className="card-sub">Mova horas entre projetos. Se passar de {state.meta.weeklyProjectBudget}h, algo precisa sair.</div>
        {state.projects.map(p => (
          <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '4px 1fr 90px 30px', gap: 14, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
            <div style={{ width: 4, height: 28, background: p.color, borderRadius: 2 }} />
            <div>
              <div style={{ fontSize: 14, fontFamily: 'var(--display)' }}>{p.name}</div>
              <div style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--mono)' }}>{p.status}</div>
            </div>
            <input type="number" className="input" style={{ padding: '6px 10px', textAlign: 'center' }} value={p.weeklyHours} min="0" max="40"
              onChange={(e) => dispatch({ type: 'UPDATE_PROJECT', id: p.id, patch: { weeklyHours: parseFloat(e.target.value) || 0 } })} />
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-dim)' }}>h</span>
          </div>
        ))}
      </div>

      <div className="grid-3" style={{ marginTop: 24 }}>
        <div className="card">
          <div className="stat-value">{state.meta.weeklyAvailable}<span style={{ fontSize: 18, color: 'var(--text-dim)' }}>h</span></div>
          <div className="stat-label">Disponível semanal (seg–sáb)</div>
        </div>
        <div className="card">
          <div className="stat-value" style={{ color: 'var(--text-muted)' }}>{state.meta.weeklyFixed}<span style={{ fontSize: 18 }}>h</span></div>
          <div className="stat-label">Compromissos fixos</div>
        </div>
        <div className="card">
          <div className="stat-value"><em>{state.meta.weeklyProjectBudget}</em><span style={{ fontSize: 18, color: 'var(--text-dim)' }}>h</span></div>
          <div className="stat-label">Saldo para projetos</div>
        </div>
      </div>
    </div>
  );
}

function Projects({ state, dispatch }) {
  const [selected, setSelected] = useState(null);
  const [adding, setAdding] = useState(false);

  const total = state.projects.reduce((a, p) => a + p.weeklyHours, 0);

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div className="page-eyebrow">{state.projects.length} braços · {total}h/semana</div>
          <h1 className="page-title">Os <em>oito braços</em>.</h1>
          <p className="page-sub">Cada projeto é uma máquina. Cada máquina, sua engrenagem dentro da máquina maior.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setAdding(true)}>+ Novo projeto</button>
      </div>

      <div>
        {state.projects.map(p => (
          <div key={p.id} className="project-row" onClick={() => setSelected(p)}>
            <div className="project-bar" style={{ background: p.color }} />
            <div>
              <div className="project-name">{p.name}</div>
              <div className="project-meta">{p.etapas.length} etapas · {projectProgress(p)}% completo</div>
            </div>
            <div className="project-hours">{p.weeklyHours}h/sem</div>
            <div className="project-progress">{p.etapas.filter(t => t.done).length}/{p.etapas.length}</div>
          </div>
        ))}
      </div>

      {selected && <ProjectModal project={selected} state={state} dispatch={dispatch} onClose={() => setSelected(null)} />}
      {adding && <AddProjectModal dispatch={dispatch} onClose={() => setAdding(false)} />}
    </div>
  );
}

function ProjectModal({ project, state, dispatch, onClose }) {
  const [newTask, setNewTask] = useState('');
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(project);

  useEffect(() => setDraft(project), [project]);

  const save = () => {
    dispatch({ type: 'UPDATE_PROJECT', id: project.id, patch: draft });
    setEditing(false);
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    dispatch({ type: 'ADD_TASK', projectId: project.id, task: { id: uid(), title: newTask.trim(), done: false } });
    setNewTask('');
  };

  const current = state.projects.find(p => p.id === project.id) || project;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 680 }}>
        {!editing ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
              <div style={{ width: 4, height: 28, background: current.color, borderRadius: 2 }} />
              <h2 className="modal-title" style={{ margin: 0 }}>{current.name}</h2>
            </div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 16 }}>
              {current.weeklyHours}h/semana · {current.status} · {projectProgress(current)}% completo
            </div>
            {current.notes && <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 18, lineHeight: 1.5 }}>{current.notes}</p>}

            <div className="label">Etapas</div>
            <div style={{ marginBottom: 16 }}>
              {current.etapas.map(t => (
                <div key={t.id} className="task-row">
                  <div className={`checkbox ${t.done ? 'done' : ''}`} onClick={() => dispatch({ type: 'TOGGLE_TASK', projectId: current.id, taskId: t.id })}>
                    {t.done && '✓'}
                  </div>
                  <div className={`task-text ${t.done ? 'done' : ''}`}>{t.title}</div>
                  <button className="btn-ghost btn" onClick={() => dispatch({ type: 'DELETE_TASK', projectId: current.id, taskId: t.id })}>×</button>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <input className="input" placeholder="Nova etapa..." value={newTask} onChange={e => setNewTask(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTask()} />
              <button className="btn btn-primary btn-sm" onClick={addTask}>+</button>
            </div>

            <div className="modal-actions">
              <button className="btn" onClick={() => { if (confirm('Excluir projeto inteiro?')) { dispatch({ type: 'DELETE_PROJECT', id: current.id }); onClose(); } }}>Excluir</button>
              <button className="btn" onClick={() => setEditing(true)}>Editar</button>
              <button className="btn btn-primary" onClick={onClose}>Fechar</button>
            </div>
          </>
        ) : (
          <>
            <h2 className="modal-title">Editar projeto</h2>
            <div className="field"><label className="label">Nome</label><input className="input" value={draft.name} onChange={e => setDraft({...draft, name: e.target.value})} /></div>
            <div className="field"><label className="label">Horas semanais</label><input className="input" type="number" value={draft.weeklyHours} onChange={e => setDraft({...draft, weeklyHours: parseFloat(e.target.value)||0})} /></div>
            <div className="field"><label className="label">Cor</label><input className="input" type="color" value={draft.color} onChange={e => setDraft({...draft, color: e.target.value})} /></div>
            <div className="field"><label className="label">Status</label>
              <select className="select" value={draft.status} onChange={e => setDraft({...draft, status: e.target.value})}>
                <option value="ativo">Ativo</option><option value="pausado">Pausado</option><option value="concluido">Concluído</option>
              </select>
            </div>
            <div className="field"><label className="label">Notas</label><textarea className="textarea" value={draft.notes} onChange={e => setDraft({...draft, notes: e.target.value})} /></div>
            <div className="modal-actions">
              <button className="btn" onClick={() => setEditing(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={save}>Salvar</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function AddProjectModal({ dispatch, onClose }) {
  const [d, setD] = useState({ name: '', weeklyHours: 2, color: '#B5443B', notes: '', status: 'ativo' });
  const save = () => {
    if (!d.name.trim()) return;
    dispatch({ type: 'ADD_PROJECT', project: { id: uid(), ...d, goalIds: [], etapas: [] } });
    onClose();
  };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">Novo projeto</h2>
        <div className="field"><label className="label">Nome</label><input className="input" value={d.name} onChange={e => setD({...d, name: e.target.value})} /></div>
        <div className="field"><label className="label">Horas semanais</label><input className="input" type="number" value={d.weeklyHours} onChange={e => setD({...d, weeklyHours: parseFloat(e.target.value)||0})} /></div>
        <div className="field"><label className="label">Cor</label><input className="input" type="color" value={d.color} onChange={e => setD({...d, color: e.target.value})} /></div>
        <div className="field"><label className="label">Notas</label><textarea className="textarea" value={d.notes} onChange={e => setD({...d, notes: e.target.value})} /></div>
        <div className="modal-actions">
          <button className="btn" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={save}>Criar</button>
        </div>
      </div>
    </div>
  );
}

function Goals({ state, dispatch }) {
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);
  const tiers = [
    { id: 'curto', label: 'Curto prazo', desc: 'O que precisa acontecer nas próximas semanas' },
    { id: 'medio', label: 'Médio prazo', desc: 'Consolidação · 2026–2027' },
    { id: 'longo', label: 'Longo prazo', desc: 'Expansão internacional · 2027–2029' },
  ];

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div className="page-eyebrow">Hierarquia de objetivos</div>
          <h1 className="page-title">As <em>metas</em> que governam tudo.</h1>
          <p className="page-sub">Cada projeto serve uma meta. Cada meta tem prazo, métrica e status. Se não estiver aqui, não acontece.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setAdding(true)}>+ Nova meta</button>
      </div>

      {tiers.map(tier => {
        const goals = state.goals.filter(g => g.tier === tier.id);
        return (
          <div key={tier.id} style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 12 }}>
              <span className={`flag flag-${tier.id}`}>{tier.label}</span>
              <span style={{ color: 'var(--text-dim)', fontSize: 13 }}>{tier.desc}</span>
            </div>
            {goals.length === 0 && <div style={{ color: 'var(--text-dim)', fontStyle: 'italic', padding: '12px 0' }}>Nenhuma meta neste prazo.</div>}
            {goals.map(g => (
              <div key={g.id} className={`goal-card ${g.tier}`} onClick={() => setEditing(g)} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div className="goal-title">{g.title}</div>
                    <div className="goal-metric">{g.metric}</div>
                    {g.notes && <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>{g.notes}</div>}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="goal-deadline">{daysUntil(g.deadline)} dias</div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-dim)', marginTop: 4 }}>{g.deadline}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      })}

      {adding && <GoalModal onClose={() => setAdding(false)} onSave={(g) => { dispatch({ type: 'ADD_GOAL', goal: { id: uid(), ...g } }); setAdding(false); }} />}
      {editing && <GoalModal goal={editing} onClose={() => setEditing(null)} onSave={(g) => { dispatch({ type: 'UPDATE_GOAL', id: editing.id, patch: g }); setEditing(null); }} onDelete={() => { dispatch({ type: 'DELETE_GOAL', id: editing.id }); setEditing(null); }} />}
    </div>
  );
}

function GoalModal({ goal, onClose, onSave, onDelete }) {
  const [d, setD] = useState(goal || { title: '', tier: 'curto', deadline: '', metric: '', status: 'em_progresso', notes: '' });
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">{goal ? 'Editar meta' : 'Nova meta'}</h2>
        <div className="field"><label className="label">Título</label><input className="input" value={d.title} onChange={e => setD({...d, title: e.target.value})} /></div>
        <div className="field"><label className="label">Prazo</label>
          <select className="select" value={d.tier} onChange={e => setD({...d, tier: e.target.value})}>
            <option value="curto">Curto prazo</option><option value="medio">Médio prazo</option><option value="longo">Longo prazo</option>
          </select>
        </div>
        <div className="field"><label className="label">Data limite</label><input className="input" type="date" value={d.deadline} onChange={e => setD({...d, deadline: e.target.value})} /></div>
        <div className="field"><label className="label">Métrica de sucesso</label><input className="input" value={d.metric} onChange={e => setD({...d, metric: e.target.value})} placeholder="Como você sabe que conseguiu?" /></div>
        <div className="field"><label className="label">Notas</label><textarea className="textarea" value={d.notes} onChange={e => setD({...d, notes: e.target.value})} /></div>
        <div className="modal-actions">
          {onDelete && <button className="btn" style={{ borderColor: 'var(--accent-dim)', color: 'var(--accent)' }} onClick={() => { if (confirm('Excluir meta?')) onDelete(); }}>Excluir</button>}
          <button className="btn" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={() => onSave(d)}>Salvar</button>
        </div>
      </div>
    </div>
  );
}

function Routine({ state }) {
  const dayNames = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

  return (
    <div>
      <div className="page-header">
        <div className="page-eyebrow">Sistema de tempo</div>
        <h1 className="page-title">A <em>grade</em> que sustenta tudo.</h1>
        <p className="page-sub">11 horas úteis por dia. {state.meta.weeklyAvailable} horas por semana. Esta é a infraestrutura da sua semana.</p>
      </div>

      <div className="routine-grid">
        <div className="routine-cell header">Horário</div>
        {dayNames.map(d => <div key={d} className="routine-cell header">{d}</div>)}
        {state.blocks.map(b => (
          <React.Fragment key={b.id}>
            <div className="routine-cell time">{b.start}<br/><span style={{ opacity: 0.5 }}>{b.end}</span></div>
            {dayNames.map((d, di) => {
              const isQJ = b.kind === 'evento' && di === 3;
              if (b.kind === 'evento' && !isQJ) return <div key={di} className="routine-cell" style={{ background: 'var(--bg)' }} />;
              return (
                <div key={di} className={`routine-cell ${b.kind} ${isQJ ? 'evento' : ''}`}>
                  {isQJ ? 'Sessão Quinta Justa' : b.kind === 'pausa' ? '—' : b.label}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      <div className="divider" />

      <h3 style={{ fontFamily: 'var(--display)', fontSize: 22, fontWeight: 500, marginBottom: 12 }}>Compromissos fixos</h3>
      <div className="grid-2">
        {state.fixedActivities.map(a => (
          <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 14, fontFamily: 'var(--display)', fontWeight: 500 }}>{a.name}</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 2 }}>
                {a.days.length === 6 ? 'Seg–Sáb' : a.days.map(d => dayNames[d-1]).join(', ')} · {a.priority}
              </div>
            </div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--gold)' }}>{a.dailyMinutes}m</div>
          </div>
        ))}
      </div>

      <div className="quote">
        Eu não quero acordar e ter que pensar no que fazer. Eu quero apenas saber que vou fazer meu dia do início ao fim e que tais ações estão me levando diretamente aos meus objetivos.
        <span className="quote-author">— Você, escrevendo este sistema</span>
      </div>
    </div>
  );
}

function Coach({ state, dispatch }) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [state.coachHistory, loading]);

  const buildContext = () => {
    const kpis = state.kpis || [];
    const milestones = (state.milestones || []).filter(m => m.status === 'em_progresso').sort((a,b) => a.date.localeCompare(b.date)).slice(0, 10);
    const upcomingDates = (state.dateEvents || []).map(d => ({...d, days: daysUntil(d.date)})).filter(d => d.days >= 0 && d.days <= 30).sort((a,b) => a.days - b.days);
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const tplByDay = {};
    (state.weeklyTemplate || []).forEach(t => {
      const block = state.blocks.find(b => b.id === t.blockId);
      const proj = state.projects.find(p => p.id === t.projectId);
      if (!tplByDay[t.day]) tplByDay[t.day] = [];
      tplByDay[t.day].push(`  ${block?.start}-${block?.end}: ${t.activity}${proj ? ` [${proj.name}]` : ''}`);
    });

    return `Você é o conselheiro estratégico de João Rocha, maestro-compositor brasileiro de 42 anos baseado em São Paulo. Você o conhece intimamente pelo sistema que ele construiu. Seja direto, conciso, em português brasileiro. Trate-o como igual técnico e empresarial. Não dê terapia; dê posição estratégica. Não repita o que já está no sistema — assuma conhecimento.

FILTRO DE DECISÃO · TODA AÇÃO PASSA POR AQUI:
- Vetor A — Apto próprio: saída do apto da Mariana para espaço próprio ASAP
- Vetor B — R$ 10k BR: R$ 10.000/mês fixos via música no Brasil
- Vetor C — US$ 10k EUA: visto EUA + US$ 10.000 líquidos/mês lá
- Vetor D — Teto: explosão do teto de permissão (EltonEuler / Aliança Divergente)
Ação que não responde a pelo menos um desses é ruído. Cortar sem culpa.

POSTURA OPERACIONAL JR:
${state.meta.posture || ''}

CONTEXTO ATUAL:

METAS (cada uma vinculada a um vetor):
${state.goals.map(g => `- [${(g.vector||'').toUpperCase()}] ${g.title} (${g.deadline}, ${daysUntil(g.deadline)} dias): ${g.metric}. ${g.notes}`).join('\n')}

PROJETOS ATIVOS (${state.projects.filter(p=>p.status==='ativo').reduce((a,p)=>a+p.weeklyHours,0)}h/sem de ${state.meta.weeklyProjectBudget}h disponíveis):
${state.projects.filter(p=>p.status!=='arquivado').map(p => `- [${(p.vector||'').toUpperCase()}] ${p.name} (${p.weeklyHours}h/sem, ${p.status}, ${projectProgress(p)}%): ${p.notes}`).join('\n')}

TEMPLATE SEMANAL (rotina determinística):
${Object.keys(tplByDay).sort().map(d => `${dayNames[d]}:\n${tplByDay[d].join('\n')}`).join('\n\n')}

MARCOS PRÓXIMOS:
${milestones.map(m => `- ${m.date} (${daysUntil(m.date)} dias): ${m.title}`).join('\n')}

DATAS ESTRATÉGICAS PRÓXIMAS (30 dias):
${upcomingDates.map(d => `- ${d.date} (${d.days}d) [${d.priority}]: ${d.title} | canais: ${(d.channels||[]).join(', ')}`).join('\n')}

KPIs DA SEMANA:
${kpis.map(k => `- ${k.name}: ${k.current}/${k.weeklyTarget} ${k.unit} — ${k.cadence}`).join('\n')}

ROTINA: ${state.meta.weeklyAvailable}h disponíveis (seg–sáb), ${state.meta.weeklyFixed}h em compromissos fixos.

PRAZOS CRÍTICOS:
- Apartamento próprio: ${daysUntil(state.meta.apartmentDeadline)} dias (${state.meta.apartmentDeadline})
- 43º aniversário: ${daysUntil(state.meta.targetBirthday)} dias
- Meta R$ ${state.meta.monthlyTargetBRL.toLocaleString('pt-BR')}/mês BR + US$ ${(state.meta.monthlyTargetUSD||0).toLocaleString('en-US')}/mês EUA`;
  };

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input.trim() };
    dispatch({ type: 'ADD_COACH_MSG', msg: userMsg });
    setInput('');
    setLoading(true);

    try {
      const messages = [...state.coachHistory, userMsg].map(m => ({ role: m.role, content: m.content }));
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1500,
          system: buildContext(),
          messages,
        }),
      });
      const data = await response.json();
      const text = data.content?.filter(c => c.type === 'text').map(c => c.text).join('\n') || 'Sem resposta.';
      dispatch({ type: 'ADD_COACH_MSG', msg: { role: 'assistant', content: text } });
    } catch (e) {
      dispatch({ type: 'ADD_COACH_MSG', msg: { role: 'assistant', content: 'Erro de conexão. Tente novamente.' } });
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div className="page-eyebrow">Conselheiro pessoal</div>
          <h1 className="page-title">Pergunte ao <em>sistema</em>.</h1>
          <p className="page-sub">A IA conhece todos seus projetos, metas, prazos e a estrutura da sua semana. Use para decisões de tradeoff, priorização e reflexão estratégica.</p>
        </div>
        {state.coachHistory.length > 0 && <button className="btn" onClick={() => { if (confirm('Limpar conversa?')) dispatch({ type: 'CLEAR_COACH' }); }}>Limpar</button>}
      </div>

      <div className="coach-container">
        <div className="coach-msgs">
          {state.coachHistory.length === 0 && !loading && (
            <div className="coach-empty">
              Ex.: "Preciso de 3h extras para Wedding's essa semana. De onde tiro?"<br/>
              "Como divido as 5h do Curso Porto Seguro entre os 4 blocos?"<br/>
              "Estou em dúvida entre acelerar Harmonia ou Palestras. Qual prioriza?"
            </div>
          )}
          {state.coachHistory.map((m, i) => (
            <div key={i} className={`coach-msg ${m.role}`}>{m.content}</div>
          ))}
          {loading && <div className="coach-msg assistant"><span className="loading-dot">●</span> <span className="loading-dot">●</span> <span className="loading-dot">●</span></div>}
          <div ref={endRef} />
        </div>
        <div className="coach-input">
          <textarea className="textarea" placeholder="Pergunte qualquer coisa..." value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} />
          <button className="btn btn-primary" onClick={send} disabled={loading || !input.trim()}>Enviar</button>
        </div>
      </div>
    </div>
  );
}

function Settings({ state, dispatch }) {
  const [d, setD] = useState(state.meta);
  useEffect(() => setD(state.meta), [state.meta]);
  return (
    <div>
      <div className="page-header">
        <div className="page-eyebrow">Configurações do sistema</div>
        <h1 className="page-title">Os <em>parâmetros</em>.</h1>
        <p className="page-sub">Datas, metas financeiras e capacidade. Tudo que governa o resto.</p>
      </div>

      <div className="card">
        <div className="card-title">Metas e prazos</div>
        <div className="grid-2" style={{ marginTop: 16 }}>
          <div className="field"><label className="label">Deadline apartamento</label><input className="input" type="date" value={d.apartmentDeadline} onChange={e => setD({...d, apartmentDeadline: e.target.value})} /></div>
          <div className="field"><label className="label">Próximo aniversário</label><input className="input" type="date" value={d.targetBirthday} onChange={e => setD({...d, targetBirthday: e.target.value})} /></div>
          <div className="field"><label className="label">Meta mensal BRL</label><input className="input" type="number" value={d.monthlyTargetBRL} onChange={e => setD({...d, monthlyTargetBRL: parseInt(e.target.value)||0})} /></div>
          <div className="field"><label className="label">Custo fixo BRL</label><input className="input" type="number" value={d.fixedCostBRL} onChange={e => setD({...d, fixedCostBRL: parseInt(e.target.value)||0})} /></div>
          <div className="field"><label className="label">Meta anual USD</label><input className="input" type="number" value={d.annualTargetUSD} onChange={e => setD({...d, annualTargetUSD: parseInt(e.target.value)||0})} /></div>
          <div className="field"><label className="label">Horas disponíveis/sem</label><input className="input" type="number" value={d.weeklyAvailable} onChange={e => setD({...d, weeklyAvailable: parseFloat(e.target.value)||0})} /></div>
          <div className="field"><label className="label">Horas fixas/sem</label><input className="input" type="number" value={d.weeklyFixed} onChange={e => setD({...d, weeklyFixed: parseFloat(e.target.value)||0})} /></div>
          <div className="field"><label className="label">Saldo projetos/sem</label><input className="input" type="number" value={d.weeklyProjectBudget} onChange={e => setD({...d, weeklyProjectBudget: parseFloat(e.target.value)||0})} /></div>
        </div>
        <div className="modal-actions">
          <button className="btn btn-primary" onClick={() => dispatch({ type: 'UPDATE_META', patch: d })}>Salvar parâmetros</button>
        </div>
      </div>

      <div className="divider" />

      <div className="card">
        <div className="card-title">Dados</div>
        <div className="card-sub">Sua máquina inteira em uma string</div>
        <button className="btn" onClick={() => {
          const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url; a.download = `kephra_backup_${todayISO()}.json`; a.click();
        }}>Exportar backup JSON</button>
        <button className="btn" style={{ marginLeft: 8, color: 'var(--accent)' }} onClick={() => {
          if (confirm('Apagar tudo e voltar aos dados-semente? Esta ação é irreversível.')) {
            dispatch({ type: 'RESET' });
          }
        }}>Resetar para dados-semente</button>
      </div>
    </div>
  );
}

// ============================================================
// MILESTONES
// ============================================================
function Milestones({ state, dispatch }) {
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);
  const milestones = (state.milestones || []).slice().sort((a,b) => a.date.localeCompare(b.date));
  const grouped = milestones.reduce((acc, m) => {
    const days = daysUntil(m.date);
    const bucket = days < 0 ? 'passados' : days <= 30 ? 'iminente' : days <= 90 ? 'proximo' : 'futuro';
    (acc[bucket] = acc[bucket] || []).push(m);
    return acc;
  }, {});
  const labels = { iminente: 'Próximos 30 dias', proximo: '30–90 dias', futuro: 'Mais de 90 dias', passados: 'Passados' };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div className="page-eyebrow">{milestones.length} marcos · datas fixas</div>
          <h1 className="page-title">Os <em>marcos</em> que ancoram o calendário.</h1>
          <p className="page-sub">Eventos com data definida que disparam ação imediata. Lançamentos, performances ao vivo, prazos críticos.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setAdding(true)}>+ Novo marco</button>
      </div>

      {['iminente', 'proximo', 'futuro', 'passados'].map(bucket => {
        const list = grouped[bucket];
        if (!list || list.length === 0) return null;
        return (
          <div key={bucket} style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.18em', color: bucket === 'iminente' ? 'var(--accent)' : 'var(--text-dim)', marginBottom: 10 }}>
              {labels[bucket]}
            </div>
            {list.map(m => {
              const proj = state.projects.find(p => p.id === m.projectId);
              const days = daysUntil(m.date);
              return (
                <div key={m.id} className="goal-card" onClick={() => setEditing(m)} style={{ cursor: 'pointer', borderLeftColor: proj?.color || 'var(--accent)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div className="goal-title">{m.title}</div>
                      {proj && <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: proj.color, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>{proj.name}</div>}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="goal-deadline" style={{ color: days < 30 && days >= 0 ? 'var(--accent)' : 'var(--gold)' }}>{days >= 0 ? `${days} dias` : `há ${-days} dias`}</div>
                      <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-dim)', marginTop: 4 }}>{m.date}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}

      {adding && <MilestoneModal state={state} onClose={() => setAdding(false)} onSave={(m) => { dispatch({ type: 'ADD_MILESTONE', milestone: { id: uid(), status: 'em_progresso', ...m } }); setAdding(false); }} />}
      {editing && <MilestoneModal milestone={editing} state={state} onClose={() => setEditing(null)} onSave={(m) => { dispatch({ type: 'UPDATE_MILESTONE', id: editing.id, patch: m }); setEditing(null); }} onDelete={() => { dispatch({ type: 'DELETE_MILESTONE', id: editing.id }); setEditing(null); }} />}
    </div>
  );
}

function MilestoneModal({ milestone, state, onClose, onSave, onDelete }) {
  const [d, setD] = useState(milestone || { title: '', date: '', projectId: '', status: 'em_progresso' });
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">{milestone ? 'Editar marco' : 'Novo marco'}</h2>
        <div className="field"><label className="label">Título</label><input className="input" value={d.title} onChange={e => setD({...d, title: e.target.value})} /></div>
        <div className="field"><label className="label">Data</label><input className="input" type="date" value={d.date} onChange={e => setD({...d, date: e.target.value})} /></div>
        <div className="field"><label className="label">Projeto vinculado (opcional)</label>
          <select className="select" value={d.projectId || ''} onChange={e => setD({...d, projectId: e.target.value || null})}>
            <option value="">— Nenhum —</option>
            {state.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="field"><label className="label">Status</label>
          <select className="select" value={d.status} onChange={e => setD({...d, status: e.target.value})}>
            <option value="em_progresso">Em progresso</option><option value="concluido">Concluído</option><option value="cancelado">Cancelado</option>
          </select>
        </div>
        <div className="modal-actions">
          {onDelete && <button className="btn" style={{ borderColor: 'var(--accent-dim)', color: 'var(--accent)' }} onClick={() => { if (confirm('Excluir marco?')) onDelete(); }}>Excluir</button>}
          <button className="btn" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={() => onSave(d)}>Salvar</button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// EDITORIAL CALENDAR
// ============================================================
function Editorial({ state, dispatch }) {
  const dayNames = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
  const canais = state.editorial?.canais || [];
  const totalPosts = canais.reduce((acc, c) => acc + Object.keys(c.schedule || {}).length, 0);

  return (
    <div>
      <div className="page-header">
        <div className="page-eyebrow">{canais.length} canais · {totalPosts} posts/semana</div>
        <h1 className="page-title">O <em>calendário editorial</em> da semana.</h1>
        <p className="page-sub">Cada canal, cada dia, cada tipo de conteúdo. Esta é sua máquina de presença online.</p>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <div style={{ minWidth: 800, display: 'grid', gridTemplateColumns: '220px repeat(6, 1fr)', gap: 1, background: 'var(--border)', border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
          <div className="routine-cell header">Canal</div>
          {dayNames.map(d => <div key={d} className="routine-cell header">{d}</div>)}
          {canais.map(c => (
            <React.Fragment key={c.id}>
              <div className="routine-cell" style={{ background: 'var(--surface-2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 4, height: 24, background: c.color, borderRadius: 2 }} />
                  <div>
                    <div style={{ fontFamily: 'var(--display)', fontSize: 13, fontWeight: 500 }}>{c.name}</div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{Object.keys(c.schedule).length}/sem</div>
                  </div>
                </div>
              </div>
              {[1,2,3,4,5,6].map(d => (
                <div key={d} className="routine-cell" style={{ background: c.schedule[d] ? 'var(--surface)' : 'var(--bg)', minHeight: 60, padding: 8 }}>
                  {c.schedule[d] ? (
                    <div style={{ fontSize: 11, lineHeight: 1.3 }}>
                      <div style={{ color: c.color, fontFamily: 'var(--mono)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>●</div>
                      {c.schedule[d]}
                    </div>
                  ) : (
                    <div style={{ color: 'var(--text-dim)', fontSize: 11, fontStyle: 'italic' }}>—</div>
                  )}
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="divider" />

      <div className="grid-3">
        <div className="card">
          <div className="stat-value">{totalPosts}</div>
          <div className="stat-label">Posts por semana</div>
        </div>
        <div className="card">
          <div className="stat-value">{Math.round(totalPosts / 6)}</div>
          <div className="stat-label">Posts por dia em média</div>
        </div>
        <div className="card">
          <div className="stat-value">{canais.length}</div>
          <div className="stat-label">Canais ativos</div>
        </div>
      </div>

      <div className="quote">
        A palavra de ordem é pensamento sistêmico. Não trabalhar mais horas — criar sistemas onde os projetos avançam através de rotinas e automação.
        <span className="quote-author">— Relatório Estratégico, gestão de sistemas</span>
      </div>

      <div className="card">
        <div className="card-title">Princípios deste calendário</div>
        <div style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0 }}>· <strong style={{ color: 'var(--text)' }}>Bloco semanal único</strong> de criação por canal (ex.: LinkedIn — 1 dia, todos os 3 posts da semana criados e agendados).</p>
          <p>· <strong style={{ color: 'var(--text)' }}>Criação antecipada</strong> sempre. Nada é publicado no mesmo dia em que foi criado.</p>
          <p>· <strong style={{ color: 'var(--text)' }}>Cadência fixa</strong> por canal. Algoritmo recompensa consistência, não volume.</p>
          <p>· <strong style={{ color: 'var(--text)' }}>Newsletter</strong> sai sábado à noite — fechamento da semana.</p>
          <p style={{ marginBottom: 0 }}>· <strong style={{ color: 'var(--text)' }}>Domingo livre</strong>. Sempre.</p>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// KPIs
// ============================================================
function KPIs({ state, dispatch }) {
  const [adding, setAdding] = useState(false);
  const kpis = state.kpis || [];

  const update = (id, current) => dispatch({ type: 'UPDATE_KPI', id, patch: { current } });

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div className="page-eyebrow">{kpis.length} indicadores operacionais</div>
          <h1 className="page-title">As <em>métricas</em> que levam às metas.</h1>
          <p className="page-sub">"Se eu enviar 10 emails toda segunda, quarta e sexta, estarei cumprindo metas que me levam aos objetivos finais." Isto é onde isso vive.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" onClick={() => { if (confirm('Zerar contadores da semana?')) dispatch({ type: 'RESET_KPIS' }); }}>Zerar semana</button>
          <button className="btn btn-primary" onClick={() => setAdding(true)}>+ Novo KPI</button>
        </div>
      </div>

      {kpis.map(k => {
        const proj = state.projects.find(p => p.id === k.projectId);
        const pct = k.weeklyTarget > 0 ? Math.min(100, Math.round(k.current / k.weeklyTarget * 100)) : 0;
        return (
          <div key={k.id} className="card" style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div style={{ flex: 1 }}>
                <div className="card-title" style={{ marginBottom: 2 }}>{k.name}</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                  {proj && <span style={{ color: proj.color, marginRight: 8 }}>● {proj.name}</span>}
                  {k.cadence}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--display)', fontSize: 28, lineHeight: 1, fontWeight: 500 }}>
                  <span style={{ color: pct >= 100 ? 'var(--green)' : pct >= 50 ? 'var(--gold)' : 'var(--text)' }}>{k.current}</span>
                  <span style={{ color: 'var(--text-dim)', fontSize: 18 }}>/{k.weeklyTarget}</span>
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: 4 }}>{k.unit}</div>
              </div>
            </div>
            <div className="bar-track"><div className="bar-fill" style={{ width: `${pct}%`, background: pct >= 100 ? 'var(--green)' : pct >= 50 ? 'var(--gold)' : 'var(--accent)' }} /></div>
            <div style={{ display: 'flex', gap: 6, marginTop: 10, alignItems: 'center' }}>
              <button className="btn btn-sm" onClick={() => update(k.id, Math.max(0, k.current - 1))}>−1</button>
              <button className="btn btn-sm" onClick={() => update(k.id, k.current + 1)}>+1</button>
              <button className="btn btn-sm" onClick={() => update(k.id, k.current + 5)}>+5</button>
              <input className="input" type="number" value={k.current} onChange={e => update(k.id, parseInt(e.target.value) || 0)} style={{ width: 80, padding: '5px 8px', fontSize: 13 }} />
              <div style={{ flex: 1 }} />
              <button className="btn btn-sm btn-ghost" onClick={() => { if (confirm('Excluir KPI?')) dispatch({ type: 'DELETE_KPI', id: k.id }); }}>excluir</button>
            </div>
          </div>
        );
      })}

      {adding && <KPIModal state={state} onClose={() => setAdding(false)} onSave={(k) => { dispatch({ type: 'ADD_KPI', kpi: { id: uid(), current: 0, ...k } }); setAdding(false); }} />}
    </div>
  );
}

function KPIModal({ state, onClose, onSave }) {
  const [d, setD] = useState({ name: '', projectId: '', weeklyTarget: 10, unit: '', cadence: '' });
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">Novo KPI</h2>
        <div className="field"><label className="label">Nome</label><input className="input" value={d.name} onChange={e => setD({...d, name: e.target.value})} placeholder="Ex: Emails de prospecção" /></div>
        <div className="field"><label className="label">Projeto vinculado (opcional)</label>
          <select className="select" value={d.projectId} onChange={e => setD({...d, projectId: e.target.value || null})}>
            <option value="">— Nenhum —</option>
            {state.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="grid-2">
          <div className="field"><label className="label">Meta semanal</label><input className="input" type="number" value={d.weeklyTarget} onChange={e => setD({...d, weeklyTarget: parseInt(e.target.value)||0})} /></div>
          <div className="field"><label className="label">Unidade</label><input className="input" value={d.unit} onChange={e => setD({...d, unit: e.target.value})} placeholder="emails, posts, vendas..." /></div>
        </div>
        <div className="field"><label className="label">Cadência</label><input className="input" value={d.cadence} onChange={e => setD({...d, cadence: e.target.value})} placeholder="Ex: seg/qua/sex · 10 por dia" /></div>
        <div className="modal-actions">
          <button className="btn" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={() => onSave(d)}>Criar</button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// WEEKLY TEMPLATE BUILDER — o coração do sistema
// ============================================================
function WeeklyTemplate({ state, dispatch }) {
  const [editing, setEditing] = useState(null); // {day, blockId}
  const dayNames = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
  const workBlocks = state.blocks.filter(b => b.kind !== 'pausa');
  const tpl = state.weeklyTemplate || [];

  const getCell = (day, blockId) => tpl.find(t => t.day === day && t.blockId === blockId);
  const blockHours = (b) => {
    const [h1,m1] = b.start.split(':').map(Number);
    const [h2,m2] = b.end.split(':').map(Number);
    return ((h2*60+m2) - (h1*60+m1)) / 60;
  };

  // Calcular horas por projeto no template
  const hoursPerProject = useMemo(() => {
    const acc = {};
    tpl.forEach(t => {
      const block = state.blocks.find(b => b.id === t.blockId);
      if (!block || !t.projectId) return;
      acc[t.projectId] = (acc[t.projectId] || 0) + blockHours(block);
    });
    return acc;
  }, [tpl, state.blocks]);

  return (
    <div>
      <div className="page-header">
        <div className="page-eyebrow">O coração do sistema</div>
        <h1 className="page-title">Template <em>semanal</em>.</h1>
        <p className="page-sub">Cada célula define o que será feito naquele bloco, naquele dia. Quando o template está completo, você nunca mais pensa "o que faço agora?" — só executa.</p>
      </div>

      <div style={{ overflowX: 'auto', marginBottom: 24 }}>
        <div style={{ minWidth: 880, display: 'grid', gridTemplateColumns: '90px repeat(6, 1fr)', gap: 1, background: 'var(--border)', border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
          <div className="routine-cell header">Bloco</div>
          {dayNames.map(d => <div key={d} className="routine-cell header">{d}</div>)}
          {workBlocks.map(b => (
            <React.Fragment key={b.id}>
              <div className="routine-cell time" style={{ background: 'var(--surface-2)' }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text)' }}>{b.start}</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text-dim)', marginTop: 2 }}>{b.end}</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--gold)', marginTop: 4 }}>{blockHours(b)}h</div>
              </div>
              {[1,2,3,4,5,6].map(d => {
                const cell = getCell(d, b.id);
                const proj = cell ? state.projects.find(p => p.id === cell.projectId) : null;
                return (
                  <div
                    key={d}
                    onClick={() => setEditing({ day: d, blockId: b.id, current: cell })}
                    style={{
                      background: cell ? 'var(--surface)' : 'var(--bg)',
                      padding: 8,
                      minHeight: 80,
                      cursor: 'pointer',
                      borderLeft: proj ? `3px solid ${proj.color}` : '3px solid transparent',
                      transition: 'all 0.12s',
                    }}
                  >
                    {cell ? (
                      <>
                        <div style={{ fontSize: 11, lineHeight: 1.3, marginBottom: 4 }}>{cell.activity}</div>
                        {proj && <div style={{ fontFamily: 'var(--mono)', fontSize: 8, color: proj.color, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{proj.name.split(' ').slice(0,3).join(' ')}</div>}
                      </>
                    ) : (
                      <div style={{ color: 'var(--text-dim)', fontSize: 11, fontStyle: 'italic', textAlign: 'center', marginTop: 20 }}>+ definir</div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-title">Distribuição real no template vs. alocação planejada</div>
        <div className="card-sub">Comparação entre o que você reservou (Capacidade) e o que efetivamente bloqueou (Template)</div>
        {state.projects.filter(p => p.status === 'ativo').map(p => {
          const actual = hoursPerProject[p.id] || 0;
          const diff = actual - p.weeklyHours;
          return (
            <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '4px 1fr 80px 80px 80px', gap: 12, alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 4, height: 24, background: p.color, borderRadius: 2 }} />
              <div style={{ fontSize: 13, fontFamily: 'var(--display)' }}>{p.name}</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-dim)', textAlign: 'right' }}>{p.weeklyHours}h planej.</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--gold)', textAlign: 'right' }}>{actual}h template</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: diff === 0 ? 'var(--green)' : Math.abs(diff) <= 1 ? 'var(--gold)' : 'var(--accent)', textAlign: 'right' }}>
                {diff === 0 ? '✓' : diff > 0 ? `+${diff}h` : `${diff}h`}
              </div>
            </div>
          );
        })}
      </div>

      {editing && <TemplateCellModal cell={editing} state={state} dispatch={dispatch} onClose={() => setEditing(null)} />}
    </div>
  );
}

function TemplateCellModal({ cell, state, dispatch, onClose }) {
  const [d, setD] = useState(cell.current || { projectId: '', activity: '', kind: 'foco' });
  const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const block = state.blocks.find(b => b.id === cell.blockId);

  const save = () => {
    dispatch({ type: 'UPDATE_TEMPLATE_CELL', day: cell.day, blockId: cell.blockId, patch: d });
    onClose();
  };
  const clear = () => {
    dispatch({ type: 'DELETE_TEMPLATE_CELL', day: cell.day, blockId: cell.blockId });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">{dayNames[cell.day]} · {block?.start}–{block?.end}</h2>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 16 }}>{block?.label}</div>
        <div className="field"><label className="label">Projeto</label>
          <select className="select" value={d.projectId || ''} onChange={e => setD({...d, projectId: e.target.value || null})}>
            <option value="">— Nenhum (atividade genérica) —</option>
            {state.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="field"><label className="label">Atividade específica</label>
          <input className="input" value={d.activity || ''} onChange={e => setD({...d, activity: e.target.value})} placeholder="Ex: Curso Harmonia: gravação módulo 1" />
        </div>
        <div className="field"><label className="label">Tipo</label>
          <select className="select" value={d.kind || 'foco'} onChange={e => setD({...d, kind: e.target.value})}>
            <option value="foco">Foco (criação)</option>
            <option value="operacional">Operacional (admin, emails)</option>
            <option value="estrategico">Estratégico (planejamento)</option>
          </select>
        </div>
        <div className="modal-actions">
          {cell.current && <button className="btn" style={{ borderColor: 'var(--accent-dim)', color: 'var(--accent)' }} onClick={clear}>Limpar célula</button>}
          <button className="btn" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={save}>Salvar</button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// DATE EVENTS — efemérides estratégicas
// ============================================================
function DateEvents({ state, dispatch }) {
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);
  const events = (state.dateEvents || []).slice().sort((a,b) => a.date.localeCompare(b.date));
  const grouped = events.reduce((acc, e) => {
    const days = daysUntil(e.date);
    const bucket = days < 0 ? 'passados' : days <= 14 ? 'iminente' : days <= 60 ? 'proximo' : 'futuro';
    (acc[bucket] = acc[bucket] || []).push({...e, days});
    return acc;
  }, {});
  const labels = { iminente: 'Próximos 14 dias — agir agora', proximo: '15–60 dias — preparar criativos', futuro: 'Mais de 60 dias', passados: 'Já passaram' };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div className="page-eyebrow">{events.length} efemérides · {(grouped.iminente||[]).length} iminentes</div>
          <h1 className="page-title">Datas <em>estratégicas</em>.</h1>
          <p className="page-sub">Nascimentos, mortes, estreias, feriados, eventos pessoais. Cada data é um gatilho para conteúdo em um ou mais canais. Surface aqui antes de virar emergência.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setAdding(true)}>+ Nova data</button>
      </div>

      {['iminente', 'proximo', 'futuro', 'passados'].map(bucket => {
        const list = grouped[bucket];
        if (!list || list.length === 0) return null;
        return (
          <div key={bucket} style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.18em', color: bucket === 'iminente' ? 'var(--accent)' : 'var(--text-dim)', marginBottom: 10 }}>
              {labels[bucket]}
            </div>
            {list.map(e => (
              <div key={e.id} className="card" style={{ marginBottom: 8, padding: 14, cursor: 'pointer' }} onClick={() => setEditing(e)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, paddingRight: 16 }}>
                    <div style={{ fontFamily: 'var(--display)', fontSize: 15, fontWeight: 500, lineHeight: 1.3 }}>{e.title}</div>
                    <div style={{ marginTop: 6 }}>
                      {(e.channels || []).map(c => <span key={c} className="tag" style={{ marginRight: 4 }}>{c}</span>)}
                      {e.priority === 'alta' && <span className="tag tag-accent">alta</span>}
                      {e.priority === 'media' && <span className="tag tag-gold">média</span>}
                      {e.priority === 'baixa' && <span className="tag">baixa</span>}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 13, color: e.days < 0 ? 'var(--text-dim)' : e.days <= 3 ? 'var(--accent)' : e.days <= 14 ? 'var(--gold)' : 'var(--text-muted)' }}>
                      {e.days === 0 ? 'HOJE' : e.days < 0 ? `há ${-e.days}d` : `${e.days}d`}
                    </div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-dim)', marginTop: 2 }}>{e.date}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      })}

      {adding && <DateEventModal onClose={() => setAdding(false)} onSave={(e) => { dispatch({ type: 'ADD_DATE_EVENT', event: { id: uid(), priority: 'media', channels: [], ...e } }); setAdding(false); }} />}
      {editing && <DateEventModal event={editing} onClose={() => setEditing(null)} onSave={(e) => { dispatch({ type: 'UPDATE_DATE_EVENT', id: editing.id, patch: e }); setEditing(null); }} onDelete={() => { dispatch({ type: 'DELETE_DATE_EVENT', id: editing.id }); setEditing(null); }} />}
    </div>
  );
}

function DateEventModal({ event, onClose, onSave, onDelete }) {
  const [d, setD] = useState(event || { title: '', date: '', channels: [], priority: 'media' });
  const channelsStr = (d.channels || []).join(', ');
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">{event ? 'Editar data' : 'Nova data estratégica'}</h2>
        <div className="field"><label className="label">Título / contexto</label><textarea className="textarea" value={d.title} onChange={e => setD({...d, title: e.target.value})} /></div>
        <div className="field"><label className="label">Data</label><input className="input" type="date" value={d.date} onChange={e => setD({...d, date: e.target.value})} /></div>
        <div className="field"><label className="label">Canais (separados por vírgula)</label>
          <input className="input" value={channelsStr} onChange={e => setD({...d, channels: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})} placeholder="Maestro, Kephra, Wedding's, todos..." />
        </div>
        <div className="field"><label className="label">Prioridade</label>
          <select className="select" value={d.priority} onChange={e => setD({...d, priority: e.target.value})}>
            <option value="alta">Alta</option><option value="media">Média</option><option value="baixa">Baixa</option>
          </select>
        </div>
        <div className="modal-actions">
          {onDelete && <button className="btn" style={{ borderColor: 'var(--accent-dim)', color: 'var(--accent)' }} onClick={() => { if (confirm('Excluir data?')) onDelete(); }}>Excluir</button>}
          <button className="btn" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={() => onSave(d)}>Salvar</button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// APP ROOT
// ============================================================
export default function App() {
  const [state, dispatch] = useReducer(reducer, null);
  const [view, setView] = useState('dashboard');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const result = await window.storage.get(STORAGE_KEY);
        if (result?.value) {
          dispatch({ type: 'HYDRATE', payload: JSON.parse(result.value) });
        } else {
          dispatch({ type: 'HYDRATE', payload: seed });
        }
      } catch (e) {
        dispatch({ type: 'HYDRATE', payload: seed });
      }
      setHydrated(true);
    })();
  }, []);

  useEffect(() => {
    if (state && hydrated) {
      window.storage.set(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
    }
  }, [state, hydrated]);

  if (!state) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#F7F5F0', color: '#1A365D', fontFamily: "'Bebas Neue', 'Barlow Condensed', sans-serif", textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: 22 }}>
        <style>{styles}</style>
        carregando o sistema...
      </div>
    );
  }

  return (
    <div className="kephra-app">
      <style>{styles}</style>
      <Sidebar view={view} setView={setView} state={state} />
      <main className="main">
        {view === 'filter' && <FilterView state={state} setView={setView} />}
        {view === 'dashboard' && <Dashboard state={state} dispatch={dispatch} setView={setView} />}
        {view === 'template' && <WeeklyTemplate state={state} dispatch={dispatch} />}
        {view === 'capacity' && <Capacity state={state} dispatch={dispatch} />}
        {view === 'kpis' && <KPIs state={state} dispatch={dispatch} />}
        {view === 'projects' && <Projects state={state} dispatch={dispatch} />}
        {view === 'milestones' && <Milestones state={state} dispatch={dispatch} />}
        {view === 'goals' && <Goals state={state} dispatch={dispatch} />}
        {view === 'routine' && <Routine state={state} />}
        {view === 'editorial' && <Editorial state={state} dispatch={dispatch} />}
        {view === 'dates' && <DateEvents state={state} dispatch={dispatch} />}
        {view === 'coach' && <Coach state={state} dispatch={dispatch} />}
        {view === 'settings' && <Settings state={state} dispatch={dispatch} />}
      </main>
    </div>
  );
}

