import React from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        const bgColors = {
          success: 'bg-zinc-900 border-emerald-500 text-white',
          warning: 'bg-zinc-900 border-amber-500 text-white',
          error: 'bg-zinc-900 border-rose-500 text-white',
          info: 'bg-zinc-900 border-orange-500 text-white',
        }[toast.type];

        const Icon = {
          success: CheckCircle2,
          warning: AlertTriangle,
          error: AlertTriangle,
          info: Info,
        }[toast.type];

        const iconColors = {
          success: 'text-emerald-400',
          warning: 'text-amber-400',
          error: 'text-rose-400',
          info: 'text-orange-400',
        }[toast.type];

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-lg shadow-xl border ${bgColors} transition-all duration-300 animate-in fade-in slide-in-from-bottom-2`}
          >
            <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColors}`} />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold tracking-wide">{toast.title}</h4>
              {toast.message && (
                <p className="text-xs text-zinc-300 mt-1 leading-relaxed">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-zinc-400 hover:text-white p-1 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
