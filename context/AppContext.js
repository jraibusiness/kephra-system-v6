import React, { createContext, useReducer, useContext, useEffect, useState } from 'react';

export const STORAGE_KEY = 'kephra_system_v6';

const todayISO = () => new Date().toISOString().slice(0, 10);

export const VECTORS = {
  a: { id: 'a', label: 'Apto próprio', short: 'A', color: '#B85A38', icon: '⌂', desc: 'Saída do apto da Mariana para espaço próprio' },
  b: { id: 'b', label: 'R$ 10k BR', short: 'B', color: '#2D4A3E', icon: '$', desc: 'R$ 10.000/mês fixos via música no Brasil' },
  c: { id: 'c', label: 'US$ 10k EUA', short: 'C', color: '#1A365D', icon: '✈', desc: 'Visto EUA + US$ 10.000 líquidos/mês lá' },
  d: { id: 'd', label: 'Teto', short: 'D', color: '#7B4B8A', icon: '↑', desc: 'Explosão do teto de permissão (EltonEuler / Aliança Divergente)' },
};


export const seed = {
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

export const uid = () => Math.random().toString(36).slice(2, 10);

const AppContext = createContext();

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        // Ensure window.storage exists or provide fallback if running in test
        const result = window.storage ? await window.storage.get(STORAGE_KEY) : null;
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
    if (state && hydrated && window.storage) {
      window.storage.set(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
    }
  }, [state, hydrated]);

  if (!state) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#F7F5F0', color: '#1A365D', fontFamily: "'Bebas Neue', 'Barlow Condensed', sans-serif", textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: 22 }}>
        carregando o sistema...
      </div>
    );
  }

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
