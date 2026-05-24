import React from 'react';
import { daysUntil } from '../utils';

export default function Sidebar({ view, setView, state }) {
  const totalTasks = state.projects.reduce((acc, p) => acc + p.etapas.length, 0);
  const doneTasks = state.projects.reduce((acc, p) => acc + p.etapas.filter(t => t.done).length, 0);
  const milestonesCount = (state.milestones || []).filter(m => m.status === 'em_progresso').length;
  const upcomingDates = (state.dateEvents || []).filter(d => { const days = daysUntil(d.date); return days >= 0 && days <= 30; }).length;
  const items = [
    { section: 'Comando' },
    { id: 'filter', label: 'Filtro de decisão', badge: 'A·B·C·D' },
    { id: 'dashboard', label: 'Hoje', badge: null },
    { id: 'template', label: 'Template semanal', badge: null },
    { id: 'capacity', label: 'Capacidade', badge: `${state.meta.weeklyProjectBudget}h` },
    { id: 'kpis', label: 'KPIs', badge: (state.kpis||[]).length },
    { section: 'Execução' },
    { id: 'projects', label: 'Projetos', badge: `${doneTasks}/${totalTasks}` },
    { id: 'milestones', label: 'Marcos', badge: milestonesCount },
    { id: 'goals', label: 'Metas', badge: state.goals.length },
    { section: 'Operação' },
    { id: 'routine', label: 'Rotina', badge: null },
    { id: 'editorial', label: 'Calendário editorial', badge: null },
    { id: 'dates', label: 'Datas estratégicas', badge: upcomingDates || null },
    { section: 'Inteligência' },
    { id: 'coach', label: 'Conselho IA', badge: null },
    { id: 'settings', label: 'Ajustes', badge: null },
  ];
  return (
    <aside className="sidebar">
      <div className="sidebar-inner">
      <div className="brand">Sistema <span className="brand-italic">Kephra</span></div>
      <div className="brand-sub">João Rocha · Kephra System v4</div>
      {items.map((it, i) => it.section ? (
        <div key={i} className="nav-section">{it.section}</div>
      ) : (
        <div key={it.id} className={`nav-item ${view === it.id ? 'active' : ''}`} onClick={() => setView(it.id)}>
          <span>{it.label}</span>
          {it.badge != null && <span className="badge">{it.badge}</span>}
        </div>
      ))}
      <div style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid rgba(229,220,208,0.12)', fontFamily: 'var(--mono)', fontSize: 8, color: 'rgba(229,220,208,0.3)', textTransform: 'uppercase', letterSpacing: '0.18em', lineHeight: 1.8 }}>
        Foco no processo<br/>resultado é consequência
      </div>
      </div>
    </aside>
  );
}
