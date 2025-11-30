import { Loader2 } from 'lucide-react';

export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    type = 'button',
    disabled = false,
    loading = false,
    icon: Icon = null,
    iconPosition = 'left',
    className = '',
    ...props
}) {
    const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden';

    const variants = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-md hover:shadow-lg hover:-translate-y-0.5',
        secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 hover:shadow-md',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-md hover:shadow-lg hover:-translate-y-0.5',
        success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-md hover:shadow-lg hover:-translate-y-0.5',
        warning: 'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-500 shadow-md hover:shadow-lg hover:-translate-y-0.5',
        outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
        ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
        gradient: 'gradient-primary text-white shadow-colored hover:shadow-colored-lg hover:-translate-y-0.5',
        'gradient-purple': 'gradient-purple text-white shadow-md hover:shadow-lg hover:-translate-y-0.5',
        'gradient-warm': 'gradient-warm text-white shadow-md hover:shadow-lg hover:-translate-y-0.5',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-5 py-2.5 text-base',
        lg: 'px-7 py-3.5 text-lg',
        xl: 'px-9 py-4 text-xl',
    };

    const isDisabled = disabled || loading;

    return (
        <button
            type={type}
            disabled={isDisabled}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {loading && (
                <Loader2 className="animate-spin" size={size === 'sm' ? 16 : size === 'lg' ? 22 : size === 'xl' ? 24 : 18} />
            )}

            {!loading && Icon && iconPosition === 'left' && (
                <Icon size={size === 'sm' ? 16 : size === 'lg' ? 22 : size === 'xl' ? 24 : 18} />
            )}

            <span>{children}</span>

            {!loading && Icon && iconPosition === 'right' && (
                <Icon size={size === 'sm' ? 16 : size === 'lg' ? 22 : size === 'xl' ? 24 : 18} />
            )}
        </button>
    );
}

