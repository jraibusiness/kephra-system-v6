import React, { useState, useEffect } from 'react';
import { projectProgress } from '../utils';
import { uid } from '../context/AppContext';
import Modal from './Modal';

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
    <Modal onClose={onClose} style={{ maxWidth: 680 }}>
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
      </Modal>
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
    <Modal onClose={onClose}>
        <h2 className="modal-title">Novo projeto</h2>
        <div className="field"><label className="label">Nome</label><input className="input" value={d.name} onChange={e => setD({...d, name: e.target.value})} /></div>
        <div className="field"><label className="label">Horas semanais</label><input className="input" type="number" value={d.weeklyHours} onChange={e => setD({...d, weeklyHours: parseFloat(e.target.value)||0})} /></div>
        <div className="field"><label className="label">Cor</label><input className="input" type="color" value={d.color} onChange={e => setD({...d, color: e.target.value})} /></div>
        <div className="field"><label className="label">Notas</label><textarea className="textarea" value={d.notes} onChange={e => setD({...d, notes: e.target.value})} /></div>
        <div className="modal-actions">
          <button className="btn" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={save}>Criar</button>
        </div>
      </Modal>
  );
}

export default function Projects({ state, dispatch }) {
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
