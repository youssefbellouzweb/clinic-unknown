import React from 'react';
import { X } from 'lucide-react';

/**
 * ImagePreview Component
 * @param {object} props
 * @param {string} props.src - Image source URL
 * @param {string} props.alt - Alt text
 * @param {Function} props.onRemove - Callback when remove button is clicked
 * @param {string} props.className - Additional CSS classes
 */
const ImagePreview = ({ src, alt = 'Preview', onRemove, className = '' }) => {
    return (
        <div className={`relative group ${className}`}>
            <img
                src={src}
                alt={alt}
                className="w-full h-full object-cover rounded-lg border border-gray-200"
            />

            {onRemove && (
                <button
                    onClick={onRemove}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    aria-label="Remove image"
                >
                    <X className="w-4 h-4" />
                </button>
            )}

            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg pointer-events-none" />
        </div>
    );
};

export default ImagePreview;
