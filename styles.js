const styles = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=JetBrains+Mono:wght@400;500&display=swap');

:root {
  /* Geometric Music Mosaic palette */
  --bg: #F7F5F0;
  --surface: #FFFFFF;
  --surface-2: #EDE8E0;
  --border: rgba(43,43,43,0.09);
  --border-strong: rgba(43,43,43,0.18);
  --text: #2B2B2B;
  --text-muted: #5A5245;
  --text-dim: #8A7F70;
  --accent: #B85A38;
  --accent-dim: #8A3F24;
  --gold: #D4A33B;
  --gold-dim: #9E7924;
  --green: #2D4A3E;
  --blue: #1A365D;
  --olive: #4A5D3B;
  --danger: #B85A38;
  --sidebar-bg: #1A365D;
  --sidebar-text: #E5DCD0;
  --sidebar-muted: rgba(229,220,208,0.5);
  --sidebar-dim: rgba(229,220,208,0.25);
  --display: 'Bebas Neue', 'Barlow Condensed', Impact, sans-serif;
  --display-alt: 'Barlow Condensed', 'Bebas Neue', sans-serif;
  --body: 'DM Sans', system-ui, sans-serif;
  --mono: 'JetBrains Mono', monospace;
}

* { box-sizing: border-box; }

/* Subtle grain overlay */
.kephra-app::after {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
  opacity: 0.025;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
  background-repeat: repeat;
}

.kephra-app {
  font-family: var(--body);
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
  display: grid;
  grid-template-columns: 248px 1fr;
  letter-spacing: -0.005em;
}

/* ── SIDEBAR ── */
.sidebar {
  background: var(--sidebar-bg);
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
  padding: 28px 0 28px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* geometric grid decoration bottom-right of sidebar */
.sidebar::before {
  content: '';
  position: absolute;
  bottom: -10px; right: -10px;
  width: 140px; height: 140px;
  background-image:
    linear-gradient(90deg, rgba(212,163,59,0.18) 1px, transparent 1px),
    linear-gradient(rgba(212,163,59,0.18) 1px, transparent 1px);
  background-size: 14px 14px;
  -webkit-mask-image: radial-gradient(circle at 100% 100%, black 20%, transparent 72%);
  mask-image: radial-gradient(circle at 100% 100%, black 20%, transparent 72%);
  pointer-events: none;
}

/* hairline rule top of sidebar */
.sidebar::after {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--gold) 0%, transparent 70%);
}

.sidebar-inner { padding: 0 22px; flex: 1; overflow-y: auto; }

.brand {
  font-family: var(--display);
  font-size: 30px;
  font-weight: 400;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--sidebar-text);
  margin-bottom: 2px;
  line-height: 1;
}
.brand-italic { color: var(--gold); }
.brand-sub {
  font-family: var(--mono);
  font-size: 8px;
  text-transform: uppercase;
  letter-spacing: 0.22em;
  color: var(--sidebar-muted);
  margin-bottom: 32px;
}

.nav-section {
  font-family: var(--mono);
  font-size: 8px;
  text-transform: uppercase;
  letter-spacing: 0.22em;
  color: var(--sidebar-dim);
  margin: 24px 0 6px;
  padding: 0 2px;
  border-top: 1px solid rgba(229,220,208,0.08);
  padding-top: 16px;
}

.nav-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 7px 10px;
  margin-bottom: 1px;
  border-left: 2px solid transparent;
  font-size: 12px;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  cursor: pointer;
  transition: all 0.1s ease;
  color: var(--sidebar-muted);
}
.nav-item:hover { color: var(--sidebar-text); background: rgba(229,220,208,0.06); }
.nav-item.active {
  color: var(--sidebar-text);
  border-left-color: var(--gold);
  background: rgba(229,220,208,0.08);
}
.nav-item .badge {
  font-family: var(--mono);
  font-size: 9px;
  color: var(--sidebar-muted);
  background: rgba(229,220,208,0.1);
  padding: 1px 5px;
  border-radius: 2px;
}

/* ── MAIN ── */
.main {
  padding: 48px 60px 100px;
  max-width: 1280px;
}

/* ── PAGE HEADER ── */
.page-header { margin-bottom: 40px; }

.page-eyebrow {
  font-family: var(--body);
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.28em;
  color: var(--accent);
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.page-eyebrow::before {
  content: '';
  display: inline-block;
  width: 20px;
  height: 1px;
  background: var(--accent);
}

.page-title {
  font-family: var(--display);
  font-size: 72px;
  font-weight: 400;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  line-height: 0.92;
  margin: 0 0 12px;
  color: var(--blue);
}
.page-title em { font-style: normal; color: var(--accent); }

.page-sub {
  color: var(--text-muted);
  font-size: 14px;
  max-width: 580px;
  line-height: 1.55;
  font-weight: 300;
}

/* ── GRID ── */
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }

/* ── CARDS ── */
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-top: 2px solid var(--border-strong);
  padding: 20px;
}

.card-title {
  font-family: var(--display-alt);
  font-size: 19px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 4px;
  color: var(--blue);
}
.card-sub {
  font-family: var(--mono);
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--text-dim);
  margin-bottom: 16px;
}

/* ── STATS ── */
.stat-value {
  font-family: var(--display);
  font-size: 52px;
  font-weight: 400;
  letter-spacing: 0.02em;
  line-height: 1;
  color: var(--blue);
}
.stat-value em { font-style: normal; color: var(--accent); }
.stat-label {
  font-family: var(--mono);
  font-size: 8px;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--text-dim);
  margin-top: 8px;
}

/* ── COUNTDOWN ── */
.countdown {
  display: flex;
  gap: 0;
  background: var(--blue);
  margin-bottom: 24px;
  position: relative;
  overflow: hidden;
}
/* hairline grid overlay on countdown */
.countdown::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(90deg, rgba(212,163,59,0.06) 1px, transparent 1px),
    linear-gradient(rgba(212,163,59,0.06) 1px, transparent 1px);
  background-size: 20px 20px;
  pointer-events: none;
}
.countdown-item {
  position: relative;
  z-index: 1;
  flex: 1;
  padding: 24px 28px;
  border-right: 1px solid rgba(229,220,208,0.1);
}
.countdown-item:last-child { border-right: none; }
.countdown-num {
  font-family: var(--display);
  font-size: 56px;
  font-weight: 400;
  letter-spacing: 0.02em;
  line-height: 1;
  color: var(--sidebar-text);
}
.countdown-num em { color: var(--gold); font-style: normal; }
.countdown-label {
  font-family: var(--mono);
  font-size: 8px;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: rgba(229,220,208,0.5);
  margin-top: 8px;
}

/* ── BARS ── */
.bar-track {
  height: 3px;
  background: var(--border-strong);
  margin: 8px 0;
  overflow: hidden;
}
.bar-fill {
  height: 100%;
  background: var(--accent);
  transition: width 0.4s ease;
}

/* ── PROJECT ROW ── */
.project-row {
  display: grid;
  grid-template-columns: 3px 1fr auto auto;
  gap: 16px;
  align-items: center;
  padding: 14px 16px;
  background: var(--surface);
  border: 1px solid var(--border);
  margin-bottom: 6px;
  cursor: pointer;
  transition: all 0.1s ease;
}
.project-row:hover { border-color: var(--border-strong); transform: translateX(3px); }
.project-bar { width: 3px; height: 36px; }
.project-name {
  font-family: var(--display-alt);
  font-size: 16px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--blue);
}
.project-meta {
  font-family: var(--mono);
  font-size: 9px;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  margin-top: 2px;
}
.project-hours { font-family: var(--mono); font-size: 12px; color: var(--gold); font-weight: 500; }
.project-progress { font-family: var(--mono); font-size: 10px; color: var(--text-muted); }

/* ── BUTTONS ── */
.btn {
  font-family: var(--body);
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  padding: 9px 16px;
  border: 1px solid var(--border-strong);
  background: transparent;
  color: var(--text);
  cursor: pointer;
  transition: all 0.12s ease;
}
.btn:hover { background: var(--text); color: var(--bg); border-color: var(--text); }
.btn-primary { background: var(--accent); border-color: var(--accent); color: white; }
.btn-primary:hover { background: var(--accent-dim); border-color: var(--accent-dim); color: white; }
.btn-ghost { background: transparent; border-color: transparent; color: var(--text-muted); padding: 4px 8px; }
.btn-ghost:hover { color: var(--accent); background: transparent; border-color: transparent; }
.btn-sm { padding: 5px 10px; font-size: 9px; }

/* ── INPUTS ── */
.input, .textarea, .select {
  font-family: var(--body);
  font-size: 13px;
  padding: 9px 12px;
  background: var(--surface);
  border: 1px solid var(--border-strong);
  color: var(--text);
  width: 100%;
  outline: none;
  border-radius: 0;
}
.input:focus, .textarea:focus, .select:focus { border-color: var(--accent); }
.textarea { resize: vertical; min-height: 80px; font-family: var(--body); }
.label {
  font-family: var(--mono);
  font-size: 8px;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--text-dim);
  margin-bottom: 6px;
  display: block;
}

/* ── TAGS ── */
.tag {
  display: inline-block;
  font-family: var(--mono);
  font-size: 8px;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  padding: 2px 6px;
  background: var(--surface-2);
  color: var(--text-muted);
  border: 1px solid var(--border-strong);
}
.tag-accent { color: var(--accent); border-color: rgba(184,90,56,0.3); background: rgba(184,90,56,0.06); }
.tag-gold { color: var(--gold-dim); border-color: rgba(212,163,59,0.3); background: rgba(212,163,59,0.06); }
.tag-green { color: var(--green); border-color: rgba(45,74,62,0.3); background: rgba(45,74,62,0.06); }

/* ── DIVIDER ── */
.divider {
  height: 1px;
  background: var(--border);
  margin: 28px 0;
  position: relative;
}
.divider::before {
  content: '';
  position: absolute;
  left: 0; top: 0;
  width: 40px; height: 1px;
  background: var(--gold);
}

/* ── TASKS ── */
.task-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 9px 0;
  border-bottom: 1px solid var(--border);
}
.task-row:last-child { border-bottom: none; }
.checkbox {
  width: 14px; height: 14px;
  border: 1.5px solid var(--border-strong);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}
.checkbox.done { background: var(--accent); border-color: var(--accent); color: white; }
.task-text { flex: 1; font-size: 13px; font-weight: 300; line-height: 1.4; }
.task-text.done { color: var(--text-dim); text-decoration: line-through; }

/* ── MODAL ── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(26,54,93,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 24px;
  backdrop-filter: blur(3px);
}
.modal {
  background: var(--surface);
  border: 1px solid var(--border-strong);
  border-top: 3px solid var(--accent);
  padding: 32px;
  max-width: 560px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}
.modal-title {
  font-family: var(--display);
  font-size: 32px;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--blue);
  margin: 0 0 20px;
}

.field { margin-bottom: 16px; }
.modal-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 24px; }

/* ── COACH ── */
.coach-container {
  display: grid;
  grid-template-rows: 1fr auto;
  gap: 16px;
  height: calc(100vh - 200px);
}
.coach-msgs {
  background: var(--surface);
  border: 1px solid var(--border);
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.coach-msg {
  max-width: 78%;
  padding: 12px 16px;
  font-size: 13px;
  font-weight: 300;
  line-height: 1.55;
}
.coach-msg.user {
  background: var(--blue);
  color: var(--sidebar-text);
  align-self: flex-end;
}
.coach-msg.assistant {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-left: 2px solid var(--gold);
  align-self: flex-start;
  white-space: pre-wrap;
}
.coach-empty {
  text-align: center;
  color: var(--text-dim);
  font-family: var(--display-alt);
  font-style: italic;
  font-size: 17px;
  padding: 60px 20px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.coach-input { display: flex; gap: 8px; }
.coach-input .textarea { flex: 1; min-height: 48px; }

/* ── CAPACITY BAR ── */
.capacity-bar {
  display: flex;
  height: 28px;
  overflow: hidden;
  border: 1px solid var(--border-strong);
  margin: 12px 0 20px;
}
.capacity-segment {
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--mono);
  font-size: 9px;
  color: white;
  letter-spacing: 0.06em;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  padding: 0 4px;
}

/* ── ROUTINE GRID ── */
.routine-grid {
  display: grid;
  grid-template-columns: 80px repeat(6, 1fr);
  gap: 1px;
  background: var(--border-strong);
  border: 1px solid var(--border-strong);
  overflow: hidden;
}
.routine-cell {
  background: var(--surface);
  padding: 8px;
  min-height: 52px;
  font-size: 11px;
  font-weight: 300;
}
.routine-cell.header {
  background: var(--blue);
  font-family: var(--mono);
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 9px;
  color: var(--sidebar-muted);
  text-align: center;
  padding: 10px 4px;
}
.routine-cell.time { background: var(--surface-2); font-family: var(--mono); font-size: 9px; color: var(--text-muted); }
.routine-cell.pausa { background: var(--bg); color: var(--text-dim); font-style: italic; }
.routine-cell.foco { background: var(--surface); }
.routine-cell.evento { background: var(--olive); color: white; }

/* ── FLAGS ── */
.flag {
  display: inline-block;
  padding: 2px 7px;
  font-family: var(--mono);
  font-size: 8px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  margin-right: 6px;
}
.flag-curto { background: var(--accent); color: white; }
.flag-medio { background: var(--gold); color: var(--text); }
.flag-longo { background: var(--blue); color: white; }

/* ── GOAL CARD ── */
.goal-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-left: 3px solid var(--accent);
  padding: 16px 18px;
  margin-bottom: 10px;
}
.goal-card.medio { border-left-color: var(--gold); }
.goal-card.longo { border-left-color: var(--blue); }
.goal-title {
  font-family: var(--display-alt);
  font-size: 17px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--blue);
  margin: 0 0 6px;
}
.goal-metric { font-family: var(--mono); font-size: 11px; color: var(--text-muted); margin-bottom: 8px; }
.goal-deadline { font-family: var(--mono); font-size: 10px; color: var(--accent); font-weight: 500; }

/* ── QUOTE ── */
.quote {
  font-family: var(--display-alt);
  font-style: italic;
  font-size: 20px;
  font-weight: 300;
  line-height: 1.45;
  color: var(--sidebar-text);
  padding: 28px 32px;
  background: var(--blue);
  margin: 24px 0;
  letter-spacing: 0.01em;
  text-transform: uppercase;
  position: relative;
  overflow: hidden;
}
.quote::before {
  content: '"';
  position: absolute;
  top: -10px; left: 20px;
  font-family: var(--display);
  font-size: 120px;
  color: rgba(212,163,59,0.12);
  line-height: 1;
  pointer-events: none;
}
.quote-author {
  font-family: var(--mono);
  font-style: normal;
  font-size: 8px;
  text-transform: uppercase;
  letter-spacing: 0.22em;
  color: rgba(229,220,208,0.45);
  margin-top: 14px;
  display: block;
}

/* ── LOADING ── */
.loading-dot { display: inline-block; animation: pulse 1.4s infinite; }
.loading-dot:nth-child(2) { animation-delay: 0.2s; }
.loading-dot:nth-child(3) { animation-delay: 0.4s; }
@keyframes pulse { 0%, 60%, 100% { opacity: 0.3; } 30% { opacity: 1; } }

/* ── RESPONSIVE ── */
@media (max-width: 768px) {
  .kephra-app { grid-template-columns: 1fr; }
  .sidebar { position: relative; height: auto; }
  .main { padding: 24px 20px 60px; }
  .grid-2, .grid-3, .grid-4 { grid-template-columns: 1fr; }
  .countdown { flex-direction: column; }
  .page-title { font-size: 48px; }
}
`

export default styles;
