import React, { useState, useRef, useEffect } from 'react';
import { daysUntil, projectProgress } from '../utils';

export default function Coach({ state, dispatch }) {
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
