// ============================================================
// INTELIGÊNCIA ARTIFICIAL — Claude (padrão) e Gemini (alternativo)
// Chaves ficam em Propriedades do script: ANTHROPIC_API_KEY, GEMINI_API_KEY
// ============================================================

function aiKeys_() {
  const p = PropertiesService.getScriptProperties();
  return { claude: !!p.getProperty('ANTHROPIC_API_KEY'), gemini: !!p.getProperty('GEMINI_API_KEY') };
}

// Chamada única: devolve texto, ou objeto quando `schema` é passado
function ai_(opts) {
  const s = settings_();
  const keys = aiKeys_();
  let provider = opts.provider || s.aiProvider || 'claude';
  if (provider === 'claude' && !keys.claude && keys.gemini) provider = 'gemini';
  if (provider === 'gemini' && !keys.gemini && keys.claude) provider = 'claude';
  if (!keys.claude && !keys.gemini) throw new Error('Nenhuma chave de IA configurada (ANTHROPIC_API_KEY ou GEMINI_API_KEY).');
  try {
    return provider === 'gemini' ? gemini_(opts, s) : claude_(opts, s);
  } catch (err) {
    const other = provider === 'gemini' ? 'claude' : 'gemini';
    if (!keys[other]) throw err;
    console.warn('IA ' + provider + ' falhou, tentando ' + other + ': ' + err.message);
    return other === 'gemini' ? gemini_(opts, s) : claude_(opts, s);
  }
}

function claude_(opts, s) {
  const key = PropertiesService.getScriptProperties().getProperty('ANTHROPIC_API_KEY');
  const body = {
    model: s.claudeModel || 'claude-opus-5-5',
    max_tokens: opts.maxTokens || 4000,
    system: opts.system,
    messages: [{ role: 'user', content: opts.prompt }],
    output_config: { effort: opts.effort || 'low' },
    fallbacks: 'default',
  };
  if (opts.schema) body.output_config.format = { type: 'json_schema', schema: opts.schema };
  const res = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'anthropic-beta': 'server-side-fallback-2026-07-01',
    },
    payload: JSON.stringify(body),
    muteHttpExceptions: true,
  });
  const code = res.getResponseCode();
  const data = JSON.parse(res.getContentText());
  if (code !== 200) throw new Error('Claude ' + code + ': ' + (data.error ? data.error.message : res.getContentText()));
  if (data.stop_reason === 'refusal') throw new Error('Claude recusou o pedido.');
  const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
  return opts.schema ? JSON.parse(text) : text;
}

function gemini_(opts, s) {
  const key = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  const model = s.geminiModel || 'gemini-2.5-flash';
  const body = {
    systemInstruction: { parts: [{ text: opts.system }] },
    contents: [{ role: 'user', parts: [{ text: opts.prompt }] }],
    generationConfig: { maxOutputTokens: opts.maxTokens || 4000 },
  };
  if (opts.schema) {
    body.generationConfig.responseMimeType = 'application/json';
    body.generationConfig.responseJsonSchema = opts.schema;
  }
  const res = UrlFetchApp.fetch('https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent', {
    method: 'post',
    contentType: 'application/json',
    headers: { 'x-goog-api-key': key },
    payload: JSON.stringify(body),
    muteHttpExceptions: true,
  });
  const code = res.getResponseCode();
  const data = JSON.parse(res.getContentText());
  if (code !== 200) throw new Error('Gemini ' + code + ': ' + (data.error ? data.error.message : res.getContentText()));
  const parts = (((data.candidates || [])[0] || {}).content || {}).parts || [];
  const text = parts.map(p => p.text || '').join('');
  return opts.schema ? JSON.parse(text) : text;
}

// ------------------------------------------------------------
// Contexto do sistema para os prompts
// ------------------------------------------------------------
function aiContext_() {
  const goals = all_('Goals').filter(g => g.status !== 'concluida').sort((a, b) => (a.rank || 99) - (b.rank || 99));
  const projects = all_('Projects').filter(p => p.status === 'ativo');
  return 'METAS (ordem de prioridade):\n' +
    goals.map(g => '- [' + g.id + '] #' + g.rank + ' ' + ((HORIZONS[g.horizon] || {}).label || '') + ' · ' + g.title + (g.parentId ? ' (serve a ' + g.parentId + ')' : '') + (g.deadline ? ' (prazo ' + g.deadline + ')' : '')).join('\n') +
    '\n\nPROJETOS ATIVOS:\n' +
    projects.map(p => '- [' + p.id + '] ' + p.name + ' → meta ' + p.goalId + ' · P' + p.priority).join('\n') +
    '\n\nTIPOS DE ESFORÇO:\n' +
    Object.keys(EFFORT_TYPES).map(k => '- ' + k + ': ' + EFFORT_TYPES[k].desc).join('\n');
}

const TASK_FIELDS = {
  type: 'object',
  properties: {
    title: { type: 'string', description: 'Título curto e acionável, começando com verbo' },
    keywords: { type: 'string', description: 'Palavras-chave separadas por vírgula' },
    projectId: { type: 'string', description: 'id do projeto da lista, ou string vazia' },
    estimateMin: { type: 'integer' },
    effortLevel: { type: 'integer', enum: [1, 2, 3] },
    priority: { type: 'integer', enum: [1, 2, 3, 4] },
    deadline: { type: 'string', description: 'yyyy-MM-dd ou vazio' },
    fixedStart: { type: 'string', description: "yyyy-MM-dd'T'HH:mm se houver horário marcado, senão vazio" },
    effortType: { type: 'string', enum: Object.keys(EFFORT_TYPES) },
    notes: { type: 'string' },
  },
  required: ['title', 'keywords', 'projectId', 'estimateMin', 'effortLevel', 'priority', 'deadline', 'fixedStart', 'effortType', 'notes'],
  additionalProperties: false,
};

const SYSTEM_BASE = 'Você é o motor do Kephra System, o sistema pessoal de execução de João Rocha — maestro, compositor, empresário e empreendedor em São Paulo. ' +
  'Ele é autista nível 1 de suporte: seja literal, concreto, estruturado e sem rodeios. Português brasileiro.';

// Texto livre → tarefa estruturada ("ligar pro Frank amanhã 10h, 30 min, urgente")
function aiParseTask(text) {
  const today = ymd_();
  return ai_({
    system: SYSTEM_BASE + ' Converta a descrição em uma tarefa estruturada. Se o tempo não for dito, estime de forma realista (ele tende a subestimar). ' +
      'Prioridade: 1 = crítica/urgente, 4 = baixa. Esforço: 1 leve, 2 médio, 3 pesado.',
    prompt: 'Hoje é ' + WEEKDAYS[dow_(today)] + ', ' + today + '.\n\n' + aiContext_() + '\n\nDESCRIÇÃO:\n' + text,
    schema: TASK_FIELDS,
    effort: 'low',
  });
}

// Quebra uma tarefa grande em passos concretos
function aiBreakdown(taskId) {
  const t = find_('Tasks', taskId);
  if (!t) throw new Error('Tarefa não encontrada');
  const p = find_('Projects', t.projectId);
  const res = ai_({
    system: SYSTEM_BASE + ' Quebre a tarefa em 3 a 7 passos físicos e concretos, cada um com no máximo 90 minutos, ' +
      'na ordem de execução. O primeiro passo deve ser pequeno o suficiente para começar em 2 minutos.',
    prompt: 'TAREFA: ' + t.title + '\nPROJETO: ' + (p ? p.name : '-') + '\nESTIMATIVA ATUAL: ' + t.estimateMin + ' min\nNOTAS: ' + (t.notes || '-'),
    schema: {
      type: 'object',
      properties: { steps: { type: 'array', items: {
        type: 'object',
        properties: { title: { type: 'string' }, estimateMin: { type: 'integer' }, effortType: { type: 'string', enum: Object.keys(EFFORT_TYPES) } },
        required: ['title', 'estimateMin', 'effortType'], additionalProperties: false,
      } } },
      required: ['steps'], additionalProperties: false,
    },
    effort: 'medium',
  });
  return res.steps;
}

// Ajuda a detalhar a meta no método de Tony Robbins (RPM + evidências sensoriais)
function aiGoalSensory(goalId) {
  const g = find_('Goals', goalId);
  if (!g) throw new Error('Meta não encontrada');
  const fields = ['result', 'purpose', 'evidence', 'see', 'hear', 'feel', 'smell', 'taste', 'emotion'];
  const props = {}; fields.forEach(f => props[f] = { type: 'string' });
  return ai_({
    system: SYSTEM_BASE + ' Ajude a descrever a meta com o método RPM de Tony Robbins (Resultado, Propósito) e com evidências sensoriais ' +
      'extremamente concretas, em primeira pessoa e no presente, como se já tivesse acontecido: o que vejo, ouço, sinto no corpo, ' +
      'que cheiro e que gosto existem nesse momento, e a emoção. Evidência = o critério objetivo que prova que a meta foi atingida. ' +
      'Use o que ele já escreveu; complete só o que estiver vazio ou vago. Cada campo: 1 a 3 frases.',
    prompt: 'META: ' + g.title + '\nMÉTRICA: ' + (g.metric || '-') + '\nPRAZO: ' + (g.deadline || '-') + '\n\nO QUE JÁ ESTÁ ESCRITO:\n' +
      fields.map(f => f + ': ' + (g[f] || '(vazio)')).join('\n'),
    schema: { type: 'object', properties: props, required: fields, additionalProperties: false },
    effort: 'medium',
  });
}

// Parágrafo estratégico para o e-mail da manhã
function aiBriefing(view) {
  const last = reviewsList_(1)[0];
  const strategy = last && last.data.summary ? '\n\nESTRATÉGIA VIGENTE (' + last.horizon + ', ' + last.date.slice(0, 10) + '):\n' + last.data.summary + '\nGargalo: ' + last.data.constraint : '';
  const lines = view.timeline.map(x => x.startHM + '–' + x.endHM + ' ' + x.title + (x.kind === 'tarefa' ? ' [P' + x.priority + ']' : ' (' + x.kind + ')'));
  return ai_({
    system: SYSTEM_BASE + ' Escreva o briefing da manhã: no máximo 5 linhas, sem saudação longa. Diga qual é a UMA coisa que, ' +
      'se feita hoje, mais move o gargalo da estratégia vigente, e um alerta concreto se o plano estiver apertado ou houver prazo vencendo. Sem emojis.',
    prompt: aiContext_() + strategy + '\n\nFOCO DO DIA: ' + (view.focus ? view.focus.title : '-') +
      '\nCAPACIDADE: ' + view.plannedMin + ' min planejados de ' + (view.freeMin || '?') + ' min livres' +
      '\n\nAGENDA:\n' + lines.join('\n') +
      (view.overflow && view.overflow.length ? '\n\nNÃO COUBE HOJE:\n' + view.overflow.map(o => '- ' + o.title).join('\n') : ''),
    effort: 'medium',
    maxTokens: 2000,
  });
}
