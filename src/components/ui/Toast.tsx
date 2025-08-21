import React, { useEffect } from 'react';
import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'info' | 'warning' | 'error';

interface ToastProps {
  open: boolean;
  message: string;
  type?: ToastType;
  duration?: number; // ms
  onClose: () => void;
}

const typeStyles: Record<ToastType, { container: string; icon: React.ReactNode }> = {
  success: {
    container: 'bg-status-success text-white',
    icon: <CheckCircle2 className="w-5 h-5" />,
  },
  info: {
    container: 'bg-status-info text-white',
    icon: <Info className="w-5 h-5" />,
  },
  warning: {
    container: 'bg-primary-orange text-white',
    icon: <AlertTriangle className="w-5 h-5" />,
  },
  error: {
    container: 'bg-status-error text-white',
    icon: <AlertTriangle className="w-5 h-5" />,
  },
};

export const Toast: React.FC<ToastProps> = ({ open, message, type = 'info', duration = 3000, onClose }) => {
  useEffect(() => {
    if (!open) return;
    const id = setTimeout(() => onClose(), duration);
    return () => clearTimeout(id);
  }, [open, duration, onClose]);

  if (!open) return null;

  const s = typeStyles[type];

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <div className={`pointer-events-auto shadow-lg rounded-default px-4 py-3 flex items-center gap-3 ${s.container}`}>
          <div>{s.icon}</div>
          <div className="text-sm">{message}</div>
          <button className="ml-2 opacity-80 hover:opacity-100" onClick={onClose} aria-label="Fechar">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toast;
