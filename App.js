import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import styles from './styles';

import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import FilterView from './components/FilterView';
import Capacity from './components/Capacity';
import Projects from './components/Projects';
import Goals from './components/Goals';
import Routine from './components/Routine';
import Coach from './components/Coach';
import Settings from './components/Settings';
import Milestones from './components/Milestones';
import Editorial from './components/Editorial';
import KPIs from './components/KPIs';
import WeeklyTemplate from './components/WeeklyTemplate';
import DateEvents from './components/DateEvents';

function AppContent() {
  const [view, setView] = useState('dashboard');
  const { state, dispatch } = useApp();

  return (
    <div className="kephra-app">
      <style>{styles}</style>
      <Sidebar view={view} setView={setView} state={state} />
      <main className="main">
        {view === 'filter' && <FilterView state={state} setView={setView} />}
        {view === 'dashboard' && <Dashboard state={state} dispatch={dispatch} setView={setView} />}
        {view === 'template' && <WeeklyTemplate state={state} dispatch={dispatch} />}
        {view === 'capacity' && <Capacity state={state} dispatch={dispatch} />}
        {view === 'kpis' && <KPIs state={state} dispatch={dispatch} />}
        {view === 'projects' && <Projects state={state} dispatch={dispatch} />}
        {view === 'milestones' && <Milestones state={state} dispatch={dispatch} />}
        {view === 'goals' && <Goals state={state} dispatch={dispatch} />}
        {view === 'routine' && <Routine state={state} />}
        {view === 'editorial' && <Editorial state={state} dispatch={dispatch} />}
        {view === 'dates' && <DateEvents state={state} dispatch={dispatch} />}
        {view === 'coach' && <Coach state={state} dispatch={dispatch} />}
        {view === 'settings' && <Settings state={state} dispatch={dispatch} />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
