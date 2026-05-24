import React from 'react';

export default function Editorial({ state, dispatch }) {
  const dayNames = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
  const canais = state.editorial?.canais || [];
  const totalPosts = canais.reduce((acc, c) => acc + Object.keys(c.schedule || {}).length, 0);

  return (
    <div>
      <div className="page-header">
        <div className="page-eyebrow">{canais.length} canais · {totalPosts} posts/semana</div>
        <h1 className="page-title">O <em>calendário editorial</em> da semana.</h1>
        <p className="page-sub">Cada canal, cada dia, cada tipo de conteúdo. Esta é sua máquina de presença online.</p>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <div style={{ minWidth: 800, display: 'grid', gridTemplateColumns: '220px repeat(6, 1fr)', gap: 1, background: 'var(--border)', border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
          <div className="routine-cell header">Canal</div>
          {dayNames.map(d => <div key={d} className="routine-cell header">{d}</div>)}
          {canais.map(c => (
            <React.Fragment key={c.id}>
              <div className="routine-cell" style={{ background: 'var(--surface-2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 4, height: 24, background: c.color, borderRadius: 2 }} />
                  <div>
                    <div style={{ fontFamily: 'var(--display)', fontSize: 13, fontWeight: 500 }}>{c.name}</div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{Object.keys(c.schedule).length}/sem</div>
                  </div>
                </div>
              </div>
              {[1,2,3,4,5,6].map(d => (
                <div key={d} className="routine-cell" style={{ background: c.schedule[d] ? 'var(--surface)' : 'var(--bg)', minHeight: 60, padding: 8 }}>
                  {c.schedule[d] ? (
                    <div style={{ fontSize: 11, lineHeight: 1.3 }}>
                      <div style={{ color: c.color, fontFamily: 'var(--mono)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>●</div>
                      {c.schedule[d]}
                    </div>
                  ) : (
                    <div style={{ color: 'var(--text-dim)', fontSize: 11, fontStyle: 'italic' }}>—</div>
                  )}
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="divider" />

      <div className="grid-3">
        <div className="card">
          <div className="stat-value">{totalPosts}</div>
          <div className="stat-label">Posts por semana</div>
        </div>
        <div className="card">
          <div className="stat-value">{Math.round(totalPosts / 6)}</div>
          <div className="stat-label">Posts por dia em média</div>
        </div>
        <div className="card">
          <div className="stat-value">{canais.length}</div>
          <div className="stat-label">Canais ativos</div>
        </div>
      </div>

      <div className="quote">
        A palavra de ordem é pensamento sistêmico. Não trabalhar mais horas — criar sistemas onde os projetos avançam através de rotinas e automação.
        <span className="quote-author">— Relatório Estratégico, gestão de sistemas</span>
      </div>

      <div className="card">
        <div className="card-title">Princípios deste calendário</div>
        <div style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0 }}>· <strong style={{ color: 'var(--text)' }}>Bloco semanal único</strong> de criação por canal (ex.: LinkedIn — 1 dia, todos os 3 posts da semana criados e agendados).</p>
          <p>· <strong style={{ color: 'var(--text)' }}>Criação antecipada</strong> sempre. Nada é publicado no mesmo dia em que foi criado.</p>
          <p>· <strong style={{ color: 'var(--text)' }}>Cadência fixa</strong> por canal. Algoritmo recompensa consistência, não volume.</p>
          <p>· <strong style={{ color: 'var(--text)' }}>Newsletter</strong> sai sábado à noite — fechamento da semana.</p>
          <p style={{ marginBottom: 0 }}>· <strong style={{ color: 'var(--text)' }}>Domingo livre</strong>. Sempre.</p>
        </div>
      </div>
    </div>
  );
}
