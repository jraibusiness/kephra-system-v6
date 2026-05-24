import React from 'react';

export default function Routine({ state }) {
  const dayNames = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

  return (
    <div>
      <div className="page-header">
        <div className="page-eyebrow">Sistema de tempo</div>
        <h1 className="page-title">A <em>grade</em> que sustenta tudo.</h1>
        <p className="page-sub">11 horas úteis por dia. {state.meta.weeklyAvailable} horas por semana. Esta é a infraestrutura da sua semana.</p>
      </div>

      <div className="routine-grid">
        <div className="routine-cell header">Horário</div>
        {dayNames.map(d => <div key={d} className="routine-cell header">{d}</div>)}
        {state.blocks.map(b => (
          <React.Fragment key={b.id}>
            <div className="routine-cell time">{b.start}<br/><span style={{ opacity: 0.5 }}>{b.end}</span></div>
            {dayNames.map((d, di) => {
              const isQJ = b.kind === 'evento' && di === 3;
              if (b.kind === 'evento' && !isQJ) return <div key={di} className="routine-cell" style={{ background: 'var(--bg)' }} />;
              return (
                <div key={di} className={`routine-cell ${b.kind} ${isQJ ? 'evento' : ''}`}>
                  {isQJ ? 'Sessão Quinta Justa' : b.kind === 'pausa' ? '—' : b.label}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      <div className="divider" />

      <h3 style={{ fontFamily: 'var(--display)', fontSize: 22, fontWeight: 500, marginBottom: 12 }}>Compromissos fixos</h3>
      <div className="grid-2">
        {state.fixedActivities.map(a => (
          <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 14, fontFamily: 'var(--display)', fontWeight: 500 }}>{a.name}</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 2 }}>
                {a.days.length === 6 ? 'Seg–Sáb' : a.days.map(d => dayNames[d-1]).join(', ')} · {a.priority}
              </div>
            </div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--gold)' }}>{a.dailyMinutes}m</div>
          </div>
        ))}
      </div>

      <div className="quote">
        Eu não quero acordar e ter que pensar no que fazer. Eu quero apenas saber que vou fazer meu dia do início ao fim e que tais ações estão me levando diretamente aos meus objetivos.
        <span className="quote-author">— Você, escrevendo este sistema</span>
      </div>
    </div>
  );
}
