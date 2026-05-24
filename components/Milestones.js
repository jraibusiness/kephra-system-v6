import React, { useState } from 'react';
import { daysUntil } from '../utils';
import { uid } from '../context/AppContext';
import Modal from './Modal';

function MilestoneModal({ milestone, state, onClose, onSave, onDelete }) {
  const [d, setD] = useState(milestone || { title: '', date: '', projectId: '', status: 'em_progresso' });
  return (
    <Modal onClose={onClose}>
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
      </Modal>
  );
}

export default function Milestones({ state, dispatch }) {
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
