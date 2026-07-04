import { useEffect } from 'react';

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast?.visible) return;
    const t = setTimeout(() => onClose?.(), toast.duration || 3000);
    return () => clearTimeout(t);
  }, [toast, onClose]);

  if (!toast || !toast.visible) return null;

  const base = 'rounded px-4 py-2 shadow-md text-sm inline-block';
  const cls = toast.type === 'success' ? `${base} bg-emerald-100 text-emerald-800 border border-emerald-300` : `${base} bg-rose-100 text-rose-800 border border-rose-300`;

  return (
    <div className="toast-container fixed right-6 top-6 z-50">
      <div className={cls} role="status">
        {toast.message}
      </div>
    </div>
  );
}
