import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface ToastItem {
  id: number;
  message: string;
}

interface ToastContextValue {
  show: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue>({ show: () => {} });

export function useToast(): ToastContextValue {
  return useContext(ToastContext);
}

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const show = useCallback((message: string) => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2000);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {toasts.length > 0 &&
        createPortal(
          <div
            className="toast-container"
            style={{
              position: "fixed",
              bottom: 48,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 200,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              pointerEvents: "none",
            }}
          >
            {toasts.map((t) => (
              <div
                key={t.id}
                className="toast-item"
                style={{
                  padding: "8px 16px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--surface-elevated)",
                  border: "1px solid var(--border-default)",
                  boxShadow: "var(--shadow-md)",
                  fontSize: 12,
                  fontWeight: 500,
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-ui)",
                  animation: "toastIn 0.2s ease-out, toastOut 0.18s ease-in 1.8s forwards",
                  whiteSpace: "nowrap",
                }}
              >
                {t.message}
              </div>
            ))}
          </div>,
          document.body,
        )}
    </ToastContext.Provider>
  );
}