import React, { useState, useEffect } from 'react';
import { STORAGE_KEY, todayISO } from '../context/AppContext';

export default function Settings({ state, dispatch }) {
  const [d, setD] = useState(state.meta);
  useEffect(() => setD(state.meta), [state.meta]);
  return (
    <div>
      <div className="page-header">
        <div className="page-eyebrow">Configurações do sistema</div>
        <h1 className="page-title">Os <em>parâmetros</em>.</h1>
        <p className="page-sub">Datas, metas financeiras e capacidade. Tudo que governa o resto.</p>
      </div>

      <div className="card">
        <div className="card-title">Metas e prazos</div>
        <div className="grid-2" style={{ marginTop: 16 }}>
          <div className="field"><label className="label">Deadline apartamento</label><input className="input" type="date" value={d.apartmentDeadline} onChange={e => setD({...d, apartmentDeadline: e.target.value})} /></div>
          <div className="field"><label className="label">Próximo aniversário</label><input className="input" type="date" value={d.targetBirthday} onChange={e => setD({...d, targetBirthday: e.target.value})} /></div>
          <div className="field"><label className="label">Meta mensal BRL</label><input className="input" type="number" value={d.monthlyTargetBRL} onChange={e => setD({...d, monthlyTargetBRL: parseInt(e.target.value)||0})} /></div>
          <div className="field"><label className="label">Custo fixo BRL</label><input className="input" type="number" value={d.fixedCostBRL} onChange={e => setD({...d, fixedCostBRL: parseInt(e.target.value)||0})} /></div>
          <div className="field"><label className="label">Meta anual USD</label><input className="input" type="number" value={d.annualTargetUSD} onChange={e => setD({...d, annualTargetUSD: parseInt(e.target.value)||0})} /></div>
          <div className="field"><label className="label">Horas disponíveis/sem</label><input className="input" type="number" value={d.weeklyAvailable} onChange={e => setD({...d, weeklyAvailable: parseFloat(e.target.value)||0})} /></div>
          <div className="field"><label className="label">Horas fixas/sem</label><input className="input" type="number" value={d.weeklyFixed} onChange={e => setD({...d, weeklyFixed: parseFloat(e.target.value)||0})} /></div>
          <div className="field"><label className="label">Saldo projetos/sem</label><input className="input" type="number" value={d.weeklyProjectBudget} onChange={e => setD({...d, weeklyProjectBudget: parseFloat(e.target.value)||0})} /></div>
        </div>
        <div className="modal-actions">
          <button className="btn btn-primary" onClick={() => dispatch({ type: 'UPDATE_META', patch: d })}>Salvar parâmetros</button>
        </div>
      </div>

      <div className="divider" />

      <div className="card">
        <div className="card-title">Dados</div>
        <div className="card-sub">Sua máquina inteira em uma string</div>
        <button className="btn" onClick={() => {
          const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url; a.download = `kephra_backup_${todayISO()}.json`; a.click();
        }}>Exportar backup JSON</button>
        <button className="btn" style={{ marginLeft: 8, color: 'var(--accent)' }} onClick={() => {
          if (confirm('Apagar tudo e voltar aos dados-semente? Esta ação é irreversível.')) {
            dispatch({ type: 'RESET' });
          }
        }}>Resetar para dados-semente</button>
      </div>
    </div>
  );
}
