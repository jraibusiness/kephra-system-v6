import React, { useState } from 'react';
import { daysUntil } from '../utils';
import { uid } from '../context/AppContext';
import Modal from './Modal';

function GoalModal({ goal, onClose, onSave, onDelete }) {
  const [d, setD] = useState(goal || { title: '', tier: 'curto', deadline: '', metric: '', status: 'em_progresso', notes: '' });
  return (
    <Modal onClose={onClose}>
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
      </Modal>
  );
}

export default function Goals({ state, dispatch }) {
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
