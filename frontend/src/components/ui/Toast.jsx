import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useEffect, useState, createContext, useContext, useCallback } from 'react';

const ToastContext = createContext(null);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

function Toast({
    id,
    message,
    type = 'info',
    duration = 5000,
    onClose,
    position = 'top-right'
}) {
    const [isVisible, setIsVisible] = useState(true);
    const [progress, setProgress] = useState(100);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        if (duration > 0 && !isPaused) {
            const interval = setInterval(() => {
                setProgress((prev) => {
                    const newProgress = prev - (100 / (duration / 100));
                    if (newProgress <= 0) {
                        clearInterval(interval);
                        handleClose();
                        return 0;
                    }
                    return newProgress;
                });
            }, 100);

            return () => clearInterval(interval);
        }
    }, [duration, isPaused]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => onClose?.(id), 300);
    };

    const variants = {
        success: {
            container: 'bg-white border-green-100 text-gray-800',
            icon: CheckCircle2,
            iconColor: 'text-green-500',
            bar: 'bg-green-500'
        },
        error: {
            container: 'bg-white border-red-100 text-gray-800',
            icon: AlertCircle,
            iconColor: 'text-red-500',
            bar: 'bg-red-500'
        },
        warning: {
            container: 'bg-white border-yellow-100 text-gray-800',
            icon: AlertTriangle,
            iconColor: 'text-yellow-500',
            bar: 'bg-yellow-500'
        },
        info: {
            container: 'bg-white border-blue-100 text-gray-800',
            icon: Info,
            iconColor: 'text-blue-500',
            bar: 'bg-blue-500'
        },
    };

    const config = variants[type] || variants.info;
    const Icon = config.icon;

    if (!isVisible) return null;

    return (
        <div
            className={`pointer-events-auto w-full max-w-sm overflow-hidden rounded-xl border shadow-lg ring-1 ring-black/5 animate-slide-in-right ${config.container}`}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className="p-4">
                <div className="flex items-start gap-3">
                    <Icon className={`w-5 h-5 flex-shrink-0 ${config.iconColor} mt-0.5`} />
                    <div className="flex-1 pt-0.5">
                        <p className="text-sm font-medium">{message}</p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="flex-shrink-0 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>
            {duration > 0 && (
                <div className="h-1 w-full bg-gray-100">
                    <div
                        className={`h-full ${config.bar} transition-all duration-100 ease-linear`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}
        </div>
    );
}

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback(({ message, type = 'info', duration = 5000 }) => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, message, type, duration }]);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast, removeToast }}>
            {children}
            <div className="fixed top-0 right-0 z-50 flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        {...toast}
                        onClose={removeToast}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
}
