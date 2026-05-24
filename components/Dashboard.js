import React from 'react';
import { daysUntil, fmtBRL } from '../utils';
import { VECTORS } from '../context/AppContext';

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

export default function Dashboard({ state, dispatch, setView }) {
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
