import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

type ToastKind = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ToastApi {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const api = useMemo<ToastApi>(() => {
    const push = (kind: ToastKind, message: string) => {
      const id = nextId++;
      setToasts((list) => [...list, { id, kind, message }]);
      window.setTimeout(() => {
        setToasts((list) => list.filter((toast) => toast.id !== id));
      }, 4000);
    };
    return {
      success: (message) => push('success', message),
      error: (message) => push('error', message),
      info: (message) => push('info', message),
    };
  }, []);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toast-region" role="status" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.kind}`}>
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast 必须在 <ToastProvider> 内使用');
  return context;
}
