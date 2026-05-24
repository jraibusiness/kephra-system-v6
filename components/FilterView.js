import React from 'react';
import { VECTORS } from '../context/AppContext';

export default function FilterView({ state, setView }) {
  const vectors = ['a', 'b', 'c', 'd'];
  return (
    <div>
      <div className="page-header">
        <div className="page-eyebrow">Protocolo de decisão · 23 de maio de 2026</div>
        <h1 className="page-title">O <em>filtro</em> que governa tudo.</h1>
        <p className="page-sub">Toda ação, projeto ou compromisso passa por esses quatro vetores. Se não responde a pelo menos um, é ruído — independente de quem está envolvido.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 28 }}>
        {vectors.map(vid => {
          const v = VECTORS[vid];
          const goals = (state.goals || []).filter(g => g.vector === vid);
          const projects = (state.projects || []).filter(p => p.vector === vid && p.status === 'ativo');
          return (
            <div key={vid} className="card" style={{ borderTopColor: v.color, borderTopWidth: 3 }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: v.color, letterSpacing: '0.2em', fontWeight: 500, marginBottom: 6 }}>VETOR {v.short}</div>
              <div style={{ fontFamily: 'var(--display)', fontSize: 24, color: 'var(--blue)', fontWeight: 400, lineHeight: 1, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.02em' }}>{v.label}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 14 }}>{v.desc}</div>
              {goals.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text-dim)', letterSpacing: '0.18em', marginBottom: 6 }}>METAS</div>
                  {goals.map(g => (
                    <div key={g.id} style={{ fontSize: 12, lineHeight: 1.5, padding: '3px 0' }}>· {g.title}</div>
                  ))}
                </div>
              )}
              {projects.length > 0 && (
                <div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text-dim)', letterSpacing: '0.18em', marginBottom: 6 }}>PROJETOS ATIVOS</div>
                  {projects.map(p => (
                    <div key={p.id} style={{ fontSize: 12, lineHeight: 1.5, padding: '3px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 6, height: 6, background: p.color, borderRadius: 1, display: 'inline-block' }} />
                      {p.name} <span style={{ color: 'var(--text-dim)', fontFamily: 'var(--mono)', fontSize: 10 }}>· {p.weeklyHours}h</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="quote">
        {state.meta.posture}
        <span className="quote-author">— Protocolo JR · 23 de maio de 2026</span>
      </div>

      <div className="card">
        <div className="card-title">Postura operacional</div>
        <div style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text-muted)', marginTop: 10 }}>
          <p style={{ marginTop: 0 }}>· <strong style={{ color: 'var(--text)' }}>Pior cenário já é a linha de base.</strong> Isolamento, rejeição, crítica — tudo isso já é tolerado há tempos. Não é argumento contra agir.</p>
          <p>· <strong style={{ color: 'var(--text)' }}>Medo de crítica/rejeição é freio, não veto.</strong> Identificar e atravessar.</p>
          <p>· <strong style={{ color: 'var(--text)' }}>Restrição real = caixa.</strong> Não opinião alheia. Operar como quem já explodiu o teto.</p>
          <p style={{ marginBottom: 0 }}>· <strong style={{ color: 'var(--text)' }}>Ação que não responde a nenhum vetor</strong> é ruído. Cortar sem culpa.</p>
        </div>
      </div>
    </div>
  );
}
