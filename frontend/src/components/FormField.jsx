export default function FormField({ label, children, className = '' }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`.trim()}>
      {label ? <label className="text-sm font-medium text-slate-700">{label}</label> : null}
      {children}
    </div>
  );
}
