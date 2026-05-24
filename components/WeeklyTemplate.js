import React, { useState, useMemo } from 'react';
import Modal from './Modal';

function TemplateCellModal({ cell, state, dispatch, onClose }) {
  const [d, setD] = useState(cell.current || { projectId: '', activity: '', kind: 'foco' });
  const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const block = state.blocks.find(b => b.id === cell.blockId);

  const save = () => {
    dispatch({ type: 'UPDATE_TEMPLATE_CELL', day: cell.day, blockId: cell.blockId, patch: d });
    onClose();
  };
  const clear = () => {
    dispatch({ type: 'DELETE_TEMPLATE_CELL', day: cell.day, blockId: cell.blockId });
    onClose();
  };

  return (
    <Modal onClose={onClose}>
        <h2 className="modal-title">{dayNames[cell.day]} · {block?.start}–{block?.end}</h2>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 16 }}>{block?.label}</div>
        <div className="field"><label className="label">Projeto</label>
          <select className="select" value={d.projectId || ''} onChange={e => setD({...d, projectId: e.target.value || null})}>
            <option value="">— Nenhum (atividade genérica) —</option>
            {state.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="field"><label className="label">Atividade específica</label>
          <input className="input" value={d.activity || ''} onChange={e => setD({...d, activity: e.target.value})} placeholder="Ex: Curso Harmonia: gravação módulo 1" />
        </div>
        <div className="field"><label className="label">Tipo</label>
          <select className="select" value={d.kind || 'foco'} onChange={e => setD({...d, kind: e.target.value})}>
            <option value="foco">Foco (criação)</option>
            <option value="operacional">Operacional (admin, emails)</option>
            <option value="estrategico">Estratégico (planejamento)</option>
          </select>
        </div>
        <div className="modal-actions">
          {cell.current && <button className="btn" style={{ borderColor: 'var(--accent-dim)', color: 'var(--accent)' }} onClick={clear}>Limpar célula</button>}
          <button className="btn" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={save}>Salvar</button>
        </div>
      </Modal>
  );
}

export default function WeeklyTemplate({ state, dispatch }) {
  const [editing, setEditing] = useState(null); // {day, blockId}
  const dayNames = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
  const workBlocks = state.blocks.filter(b => b.kind !== 'pausa');
  const tpl = state.weeklyTemplate || [];

  const getCell = (day, blockId) => tpl.find(t => t.day === day && t.blockId === blockId);
  const blockHours = (b) => {
    const [h1,m1] = b.start.split(':').map(Number);
    const [h2,m2] = b.end.split(':').map(Number);
    return ((h2*60+m2) - (h1*60+m1)) / 60;
  };

  // Calcular horas por projeto no template
  const hoursPerProject = useMemo(() => {
    const acc = {};
    tpl.forEach(t => {
      const block = state.blocks.find(b => b.id === t.blockId);
      if (!block || !t.projectId) return;
      acc[t.projectId] = (acc[t.projectId] || 0) + blockHours(block);
    });
    return acc;
  }, [tpl, state.blocks]);

  return (
    <div>
      <div className="page-header">
        <div className="page-eyebrow">O coração do sistema</div>
        <h1 className="page-title">Template <em>semanal</em>.</h1>
        <p className="page-sub">Cada célula define o que será feito naquele bloco, naquele dia. Quando o template está completo, você nunca mais pensa "o que faço agora?" — só executa.</p>
      </div>

      <div style={{ overflowX: 'auto', marginBottom: 24 }}>
        <div style={{ minWidth: 880, display: 'grid', gridTemplateColumns: '90px repeat(6, 1fr)', gap: 1, background: 'var(--border)', border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
          <div className="routine-cell header">Bloco</div>
          {dayNames.map(d => <div key={d} className="routine-cell header">{d}</div>)}
          {workBlocks.map(b => (
            <React.Fragment key={b.id}>
              <div className="routine-cell time" style={{ background: 'var(--surface-2)' }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text)' }}>{b.start}</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text-dim)', marginTop: 2 }}>{b.end}</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--gold)', marginTop: 4 }}>{blockHours(b)}h</div>
              </div>
              {[1,2,3,4,5,6].map(d => {
                const cell = getCell(d, b.id);
                const proj = cell ? state.projects.find(p => p.id === cell.projectId) : null;
                return (
                  <div
                    key={d}
                    onClick={() => setEditing({ day: d, blockId: b.id, current: cell })}
                    style={{
                      background: cell ? 'var(--surface)' : 'var(--bg)',
                      padding: 8,
                      minHeight: 80,
                      cursor: 'pointer',
                      borderLeft: proj ? `3px solid ${proj.color}` : '3px solid transparent',
                      transition: 'all 0.12s',
                    }}
                  >
                    {cell ? (
                      <>
                        <div style={{ fontSize: 11, lineHeight: 1.3, marginBottom: 4 }}>{cell.activity}</div>
                        {proj && <div style={{ fontFamily: 'var(--mono)', fontSize: 8, color: proj.color, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{proj.name.split(' ').slice(0,3).join(' ')}</div>}
                      </>
                    ) : (
                      <div style={{ color: 'var(--text-dim)', fontSize: 11, fontStyle: 'italic', textAlign: 'center', marginTop: 20 }}>+ definir</div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-title">Distribuição real no template vs. alocação planejada</div>
        <div className="card-sub">Comparação entre o que você reservou (Capacidade) e o que efetivamente bloqueou (Template)</div>
        {state.projects.filter(p => p.status === 'ativo').map(p => {
          const actual = hoursPerProject[p.id] || 0;
          const diff = actual - p.weeklyHours;
          return (
            <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '4px 1fr 80px 80px 80px', gap: 12, alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 4, height: 24, background: p.color, borderRadius: 2 }} />
              <div style={{ fontSize: 13, fontFamily: 'var(--display)' }}>{p.name}</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-dim)', textAlign: 'right' }}>{p.weeklyHours}h planej.</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--gold)', textAlign: 'right' }}>{actual}h template</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: diff === 0 ? 'var(--green)' : Math.abs(diff) <= 1 ? 'var(--gold)' : 'var(--accent)', textAlign: 'right' }}>
                {diff === 0 ? '✓' : diff > 0 ? `+${diff}h` : `${diff}h`}
              </div>
            </div>
          );
        })}
      </div>

      {editing && <TemplateCellModal cell={editing} state={state} dispatch={dispatch} onClose={() => setEditing(null)} />}
    </div>
  );
}
