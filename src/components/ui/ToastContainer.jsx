import { FiCheckCircle, FiXCircle, FiX } from 'react-icons/fi';
import { useUiStore } from '../../store/uiStore';

const ICONS = {
  success: <FiCheckCircle className="text-green-500 text-lg shrink-0" />,
  error: <FiXCircle className="text-red-500 text-lg shrink-0" />,
};

const ToastContainer = () => {
  const toasts = useUiStore((s) => s.toasts);
  const removeToast = useUiStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 w-full max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="bg-white border border-gray-200 shadow-lg rounded-lg px-4 py-3 flex items-center gap-3 animate-[fadeIn_0.2s_ease-out]"
        >
          {ICONS[toast.type] || ICONS.success}
          <p className="text-sm text-gray-700 flex-1">{toast.message}</p>
          <button onClick={() => removeToast(toast.id)} className="text-gray-400 hover:text-gray-600">
            <FiX />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
