import React, { useState } from 'react';
import { daysUntil } from '../utils';
import { uid } from '../context/AppContext';
import Modal from './Modal';

function DateEventModal({ event, onClose, onSave, onDelete }) {
  const [d, setD] = useState(event || { title: '', date: '', channels: [], priority: 'media' });
  const channelsStr = (d.channels || []).join(', ');
  return (
    <Modal onClose={onClose}>
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
      </Modal>
  );
}

export default function DateEvents({ state, dispatch }) {
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
