export default function Skeleton({
    variant = 'rectangle',
    width = '100%',
    height = '20px',
    className = '',
    count = 1,
    circle = false
}) {
    const skeletons = Array.from({ length: count }, (_, i) => i);

    const getVariantClass = () => {
        if (circle) return 'rounded-full';

        switch (variant) {
            case 'text':
                return 'rounded h-4';
            case 'title':
                return 'rounded h-8';
            case 'circle':
                return 'rounded-full';
            case 'rectangle':
            default:
                return 'rounded-lg';
        }
    };

    return (
        <>
            {skeletons.map((index) => (
                <div
                    key={index}
                    className={`animate-shimmer ${getVariantClass()} ${className}`}
                    style={{ width, height }}
                />
            ))}
        </>
    );
}

// Skeleton presets for common use cases
export function SkeletonCard({ className = '' }) {
    return (
        <div className={`bg-white rounded-xl shadow-md p-6 ${className}`}>
            <div className="flex items-center gap-4 mb-4">
                <Skeleton circle width="48px" height="48px" />
                <div className="flex-1 space-y-2">
                    <Skeleton variant="title" width="60%" />
                    <Skeleton variant="text" width="40%" />
                </div>
            </div>
            <div className="space-y-2">
                <Skeleton variant="text" width="100%" />
                <Skeleton variant="text" width="90%" />
                <Skeleton variant="text" width="80%" />
            </div>
        </div>
    );
}

export function SkeletonTable({ rows = 5, columns = 4 }) {
    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {/* Header */}
            <div className="bg-gray-50 p-4 border-b border-gray-200">
                <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
                    {Array.from({ length: columns }).map((_, i) => (
                        <Skeleton key={i} variant="text" width="80%" />
                    ))}
                </div>
            </div>

            {/* Rows */}
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div key={rowIndex} className="p-4 border-b border-gray-100">
                    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
                        {Array.from({ length: columns }).map((_, colIndex) => (
                            <Skeleton key={colIndex} variant="text" width="70%" />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

export function SkeletonList({ items = 3 }) {
    return (
        <div className="space-y-4">
            {Array.from({ length: items }).map((_, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
                    <Skeleton circle width="40px" height="40px" />
                    <div className="flex-1 space-y-2">
                        <Skeleton variant="text" width="60%" />
                        <Skeleton variant="text" width="40%" />
                    </div>
                </div>
            ))}
        </div>
    );
}
