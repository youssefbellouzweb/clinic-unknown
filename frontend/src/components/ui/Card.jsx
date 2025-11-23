export default function Card({
    children,
    variant = 'default',
    hover = true,
    className = '',
    ...props
}) {
    const variants = {
        default: 'bg-white shadow-md',
        elevated: 'bg-white shadow-lg',
        outlined: 'bg-white border-2 border-gray-200',
        glass: 'glass',
        gradient: 'bg-gradient-to-br from-white to-gray-50 shadow-md',
    };

    const hoverClass = hover ? 'hover-lift' : '';

    return (
        <div
            className={`rounded-xl transition-all duration-300 ${variants[variant]} ${hoverClass} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardHeader({ children, className = '' }) {
    return (
        <div className={`px-6 py-5 border-b border-gray-200 ${className}`}>
            {children}
        </div>
    );
}

export function CardBody({ children, className = '' }) {
    return (
        <div className={`px-6 py-5 ${className}`}>
            {children}
        </div>
    );
}

export function CardFooter({ children, className = '' }) {
    return (
        <div className={`px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl ${className}`}>
            {children}
        </div>
    );
}

export function CardTitle({ children, className = '' }) {
    return (
        <h3 className={`text-xl font-semibold text-gray-900 ${className}`}>
            {children}
        </h3>
    );
}

export function CardDescription({ children, className = '' }) {
    return (
        <p className={`text-sm text-gray-600 mt-1 ${className}`}>
            {children}
        </p>
    );
}

