import { Link } from 'react-router-dom';
import { formatPen } from '../../utils/money.js';

export default function ProjectCard({ project }) {
  const { id, name, status, totalBudget, spentAmount } = project;
  const progress = totalBudget > 0 ? (spentAmount / totalBudget) * 100 : 0;

  return (
    <Link
      to={`/proyecto/${id}`}
      className="group relative flex h-48 flex-col justify-between overflow-hidden rounded-[32px] border border-blue-100 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)]"
    >
      {/* Fondo sutil al hacer hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            Proyecto
          </p>
          <h3 className="mt-1 font-bold text-slate-800 line-clamp-1">{name}</h3>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-600">
          {status}
        </span>
      </div>

      <div className="relative z-10">
        <div className="mb-2 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Liquidado</p>
            <p className="font-semibold text-slate-700">{formatPen(spentAmount)}</p>
          </div>
          <p className="text-xs font-bold text-slate-400">{progress.toFixed(1)}%</p>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-blue-500 transition-all duration-500"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>
    </Link>
  );
}