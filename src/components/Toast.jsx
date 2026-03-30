import { CheckCircle, X, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ToastContainer() {
  const { toasts, removeToast } = useApp();

  return (
    <div style={{
      position: 'fixed', top: 20, right: 20, zIndex: 2000,
      display: 'flex', flexDirection: 'column', gap: 8,
      pointerEvents: 'none',
    }}>
      {toasts.map(toast => (
        <div key={toast.id} style={{
          background: '#111',
          color: '#fff',
          borderRadius: 8,
          padding: '10px 16px',
          display: 'flex', alignItems: 'center', gap: 10,
          minWidth: 240,
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          pointerEvents: 'all',
          animation: 'fadeInSlide 150ms ease',
        }}>
          {toast.type === 'error'
            ? <AlertCircle size={15} color="#E05252" />
            : <CheckCircle size={15} color="#4CAF7D" />
          }
          <span style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', padding: 0, display: 'flex' }}
          >
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}
