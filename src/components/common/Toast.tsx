import React from 'react';
import { CheckCircle2, AlertCircle, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onClose }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-md w-full px-4 pointer-events-none">
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
          error: <XCircle className="w-5 h-5 text-rose-400 shrink-0" />,
          warning: <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />,
          info: <Info className="w-5 h-5 text-sky-400 shrink-0" />,
        };

        const borders = {
          success: 'border-emerald-500/30 bg-slate-900/95 text-emerald-200',
          error: 'border-rose-500/30 bg-slate-900/95 text-rose-200',
          warning: 'border-amber-500/30 bg-slate-900/95 text-amber-200',
          info: 'border-sky-500/30 bg-slate-900/95 text-sky-200',
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl shadow-2xl transition-all duration-300 animate-slide-up ${borders[toast.type]}`}
          >
            {icons[toast.type]}
            <div className="flex-1 text-sm">
              <h4 className="font-semibold text-white">{toast.title}</h4>
              {toast.message && <p className="mt-0.5 text-slate-300">{toast.message}</p>}
            </div>
            <button
              onClick={() => onClose(toast.id)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
