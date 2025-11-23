import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

export default function Input({
    label,
    type = 'text',
    error,
    success,
    helperText,
    icon: Icon,
    iconPosition = 'left',
    showPasswordToggle = false,
    maxLength,
    showCounter = false,
    className = '',
    ...props
}) {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [value, setValue] = useState(props.value || props.defaultValue || '');

    const inputType = type === 'password' && showPasswordToggle && showPassword ? 'text' : type;
    const hasValue = value?.toString().length > 0 || isFocused;

    const handleChange = (e) => {
        setValue(e.target.value);
        props.onChange?.(e);
    };

    return (
        <div className={`relative ${className}`}>
            {/* Floating Label */}
            {label && (
                <label
                    className={`absolute left-3 transition-all duration-200 pointer-events-none ${hasValue
                            ? 'top-2 text-xs text-blue-600 font-medium'
                            : 'top-1/2 -translate-y-1/2 text-gray-500'
                        } ${Icon && iconPosition === 'left' ? 'left-11' : ''}`}
                >
                    {label}
                </label>
            )}

            <div className="relative">
                {/* Left Icon */}
                {Icon && iconPosition === 'left' && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <Icon size={20} />
                    </div>
                )}

                {/* Input Field */}
                <input
                    type={inputType}
                    className={`w-full px-4 ${label ? 'pt-6 pb-2' : 'py-3'} ${Icon && iconPosition === 'left' ? 'pl-11' : ''
                        } ${Icon && iconPosition === 'right' ? 'pr-11' : ''
                        } ${showPasswordToggle || error || success ? 'pr-11' : ''
                        } border rounded-lg transition-all duration-200 ${error
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                            : success
                                ? 'border-green-500 focus:ring-green-500 focus:border-green-500'
                                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        } focus:ring-2 focus:ring-offset-0 outline-none`}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onChange={handleChange}
                    maxLength={maxLength}
                    {...props}
                />

                {/* Right Icon / Password Toggle / Status Icon */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {error && (
                        <AlertCircle className="text-red-500" size={20} />
                    )}
                    {success && !error && (
                        <CheckCircle2 className="text-green-500" size={20} />
                    )}
                    {type === 'password' && showPasswordToggle && (
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    )}
                    {Icon && iconPosition === 'right' && !showPasswordToggle && !error && !success && (
                        <Icon size={20} className="text-gray-400" />
                    )}
                </div>
            </div>

            {/* Helper Text / Error Message / Character Counter */}
            <div className="flex items-center justify-between mt-1 px-1">
                {(error || helperText) && (
                    <p
                        className={`text-sm ${error ? 'text-red-600 animate-slide-down' : 'text-gray-600'
                            }`}
                    >
                        {error || helperText}
                    </p>
                )}
                {showCounter && maxLength && (
                    <p className="text-xs text-gray-500 ml-auto">
                        {value?.toString().length || 0}/{maxLength}
                    </p>
                )}
            </div>
        </div>
    );
}

// Textarea variant
export function Textarea({
    label,
    error,
    helperText,
    maxLength,
    showCounter = false,
    rows = 4,
    className = '',
    ...props
}) {
    const [isFocused, setIsFocused] = useState(false);
    const [value, setValue] = useState(props.value || props.defaultValue || '');

    const hasValue = value?.toString().length > 0 || isFocused;

    const handleChange = (e) => {
        setValue(e.target.value);
        props.onChange?.(e);
    };

    return (
        <div className={`relative ${className}`}>
            {label && (
                <label
                    className={`absolute left-3 transition-all duration-200 pointer-events-none z-10 ${hasValue
                            ? 'top-2 text-xs text-blue-600 font-medium'
                            : 'top-4 text-gray-500'
                        }`}
                >
                    {label}
                </label>
            )}

            <textarea
                rows={rows}
                className={`w-full px-4 ${label ? 'pt-6 pb-2' : 'py-3'} border rounded-lg transition-all duration-200 ${error
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    } focus:ring-2 focus:ring-offset-0 outline-none resize-none`}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onChange={handleChange}
                maxLength={maxLength}
                {...props}
            />

            <div className="flex items-center justify-between mt-1 px-1">
                {(error || helperText) && (
                    <p className={`text-sm ${error ? 'text-red-600' : 'text-gray-600'}`}>
                        {error || helperText}
                    </p>
                )}
                {showCounter && maxLength && (
                    <p className="text-xs text-gray-500 ml-auto">
                        {value?.toString().length || 0}/{maxLength}
                    </p>
                )}
            </div>
        </div>
    );
}
