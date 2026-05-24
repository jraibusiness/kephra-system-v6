const daysUntil = (iso) => {
  const target = new Date(iso + 'T00:00:00');
  const now = new Date();
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
};
const fmtBRL = (n) => `R$ ${n.toLocaleString('pt-BR')}`;
const projectProgress = (p) => p.etapas.length ? Math.round(p.etapas.filter(t => t.done).length / p.etapas.length * 100) : 0;

export { daysUntil, fmtBRL, projectProgress };
