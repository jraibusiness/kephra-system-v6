import React, { useState } from 'react';
import { uid } from '../context/AppContext';
import Modal from './Modal';

function KPIModal({ state, onClose, onSave }) {
  const [d, setD] = useState({ name: '', projectId: '', weeklyTarget: 10, unit: '', cadence: '' });
  return (
    <Modal onClose={onClose}>
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
      </Modal>
  );
}

export default function KPIs({ state, dispatch }) {
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
