import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

export default function Alert({ type = 'info', children, className = '' }) {
    const types = {
        info: {
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            text: 'text-blue-800',
            icon: <Info className="w-5 h-5" />,
        },
        success: {
            bg: 'bg-green-50',
            border: 'border-green-200',
            text: 'text-green-800',
            icon: <CheckCircle className="w-5 h-5" />,
        },
        warning: {
            bg: 'bg-yellow-50',
            border: 'border-yellow-200',
            text: 'text-yellow-800',
            icon: <AlertCircle className="w-5 h-5" />,
        },
        error: {
            bg: 'bg-red-50',
            border: 'border-red-200',
            text: 'text-red-800',
            icon: <XCircle className="w-5 h-5" />,
        },
    };

    const config = types[type];

    return (
        <div className={`${config.bg} ${config.border} ${config.text} border rounded-lg p-4 flex items-start gap-3 ${className}`}>
            <div className="flex-shrink-0">{config.icon}</div>
            <div className="flex-1">{children}</div>
        </div>
    );
}
