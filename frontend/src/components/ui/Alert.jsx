import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';

export default function Alert({
    variant = 'info',
    title,
    children,
    dismissible = false,
    onDismiss = () => { },
    className = '',
}) {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    const handleDismiss = () => {
        setIsVisible(false);
        onDismiss?.();
    };

    const variants = {
        success: {
            container: 'bg-green-50 border-green-200 text-green-800',
            icon: CheckCircle2,
            iconColor: 'text-green-600',
        },
        error: {
            container: 'bg-red-50 border-red-200 text-red-800',
            icon: AlertCircle,
            iconColor: 'text-red-600',
        },
        warning: {
            container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
            icon: AlertTriangle,
            iconColor: 'text-yellow-600',
        },
        info: {
            container: 'bg-blue-50 border-blue-200 text-blue-800',
            icon: Info,
            iconColor: 'text-blue-600',
        },
    };

    const config = variants[variant] || variants.info;
    const Icon = config.icon;

    return (
        <div
            className={`${config.container} border rounded-xl p-4 flex items-start gap-3 animate-fade-in ${className}`}
            role="alert"
        >
            <Icon className={`w-5 h-5 flex-shrink-0 ${config.iconColor} mt-0.5`} />
            <div className="flex-1">
                {title && <h5 className="font-semibold mb-1">{title}</h5>}
                <div className="text-sm opacity-90">{children}</div>
            </div>
            {dismissible && (
                <button
                    onClick={handleDismiss}
                    className={`p-1 rounded-lg hover:bg-black/5 transition-colors ${config.iconColor}`}
                    aria-label="Dismiss alert"
                >
                    <X size={16} />
                </button>
            )}
        </div>
    );
}
