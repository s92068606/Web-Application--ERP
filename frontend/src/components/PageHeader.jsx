export default function PageHeader({ title, actions, children }) {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-400 bg-slate-100 px-4 py-3 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-2">
        <span className="h-3 w-3 rounded-full bg-slate-700"></span>
        <span className="h-3 w-3 rounded-full bg-slate-700"></span>
        <span className="h-3 w-3 rounded-full bg-slate-700"></span>
      </div>
      <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-700">{title}</div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      {children}
    </div>
  );
}
