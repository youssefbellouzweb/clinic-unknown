export default function Badge({
    children,
    variant = 'default',
    size = 'md',
    dot = false,
    pulse = false,
    icon: Icon,
    className = '',
}) {
    const variants = {
        default: 'bg-gray-100 text-gray-800',
        primary: 'bg-blue-100 text-blue-800',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
        danger: 'bg-red-100 text-red-800',
        info: 'bg-blue-100 text-blue-800',
        purple: 'bg-purple-100 text-purple-800',
        pink: 'bg-pink-100 text-pink-800',
        gradient: 'gradient-primary text-white',
        'gradient-purple': 'gradient-purple text-white',
    };

    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-sm',
        lg: 'px-3 py-1.5 text-base',
    };

    return (
        <span
            className={`inline-flex items-center gap-1.5 font-medium rounded-full ${variants[variant]} ${sizes[size]} ${className}`}
        >
            {dot && (
                <span className={`w-2 h-2 rounded-full bg-current ${pulse ? 'animate-pulse-slow' : ''}`} />
            )}
            {Icon && <Icon size={size === 'sm' ? 12 : size === 'lg' ? 16 : 14} />}
            {children}
        </span>
    );
}

// Status Badge Presets
export function StatusBadge({ status, ...props }) {
    const statusMap = {
        active: { variant: 'success', dot: true, pulse: true, children: 'Active' },
        inactive: { variant: 'default', dot: true, children: 'Inactive' },
        pending: { variant: 'warning', dot: true, pulse: true, children: 'Pending' },
        confirmed: { variant: 'success', dot: true, children: 'Confirmed' },
        canceled: { variant: 'danger', dot: true, children: 'Canceled' },
        completed: { variant: 'primary', dot: true, children: 'Completed' },
    };

    const config = statusMap[status] || { variant: 'default', children: status };

    return <Badge {...config} {...props} />;
}
