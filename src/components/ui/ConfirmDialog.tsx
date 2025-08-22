import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  description?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  reverseButtons?: boolean;
  confirmVariant?: 'danger' | 'primary' | 'secondary';
  cancelVariant?: 'primary' | 'secondary';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title = 'Confirmar ação',
  description = 'Tem certeza que deseja prosseguir?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  loading = false,
  onConfirm,
  onCancel,
  reverseButtons = false,
  confirmVariant = 'danger',
  cancelVariant = 'secondary',
}) => {
  if (!open) return null;

  const variantClass = (v: 'danger' | 'primary' | 'secondary') => {
    switch (v) {
      case 'danger':
        return 'bg-status-error text-white hover:opacity-90 disabled:opacity-50';
      case 'primary':
        return 'bg-primary-orange text-white hover:opacity-90 disabled:opacity-50';
      case 'secondary':
      default:
        return 'border border-neutral-gray hover:bg-neutral-gray/10 disabled:opacity-50';
    }
  };

  const CancelBtn = (
    <button
      className={`px-3 py-2 text-sm rounded-default ${variantClass(cancelVariant === 'primary' ? 'primary' : 'secondary')}`}
      onClick={onCancel}
      disabled={loading}
    >
      {cancelText}
    </button>
  );

  const ConfirmBtn = (
    <button
      className={`px-3 py-2 text-sm rounded-default ${variantClass(confirmVariant)}`}
      onClick={onConfirm}
      disabled={loading}
    >
      {loading ? 'Processando...' : confirmText}
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ marginTop: 0 }}>
      <div className="absolute inset-0 bg-black/40" onClick={loading ? undefined : onCancel} />
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-primary-orange" />
            <h3 className="text-lg font-semibold text-neutral-black">{title}</h3>
          </div>
          <button
            className="p-1 text-neutral-gray-medium hover:text-neutral-black disabled:opacity-50"
            onClick={onCancel}
            disabled={loading}
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4 text-neutral-gray-medium">
          {description}
        </div>
        <div className="flex items-center justify-end gap-2 p-4 border-t">
          {reverseButtons ? (
            <>
              {ConfirmBtn}
              {CancelBtn}
            </>
          ) : (
            <>
              {CancelBtn}
              {ConfirmBtn}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
