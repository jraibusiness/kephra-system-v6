import React from 'react';


export default function Capacity({ state, dispatch }) {
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
