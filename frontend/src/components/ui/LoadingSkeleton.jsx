export default function LoadingSkeleton({ type = 'card', count = 1, className = '' }) {
    const skeletons = {
        card: () => (
            <div className={`bg-white rounded-xl shadow-md overflow-hidden animate-pulse ${className}`}>
                <div className="h-48 bg-gray-200"></div>
                <div className="p-6 space-y-3">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3 mt-4"></div>
                </div>
            </div>
        ),
        table: () => (
            <div className={`bg-white rounded-lg shadow-md overflow-hidden animate-pulse ${className}`}>
                <div className="p-4 border-b border-gray-200">
                    <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                </div>
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="p-4 border-b border-gray-100 flex gap-4">
                        <div className="h-4 bg-gray-200 rounded flex-1"></div>
                        <div className="h-4 bg-gray-200 rounded flex-1"></div>
                        <div className="h-4 bg-gray-200 rounded flex-1"></div>
                    </div>
                ))}
            </div>
        ),
        text: () => (
            <div className={`space-y-3 animate-pulse ${className}`}>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
        ),
        list: () => (
            <div className={`space-y-4 ${className}`}>
                {[...Array(count)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 animate-pulse">
                        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    </div>
                ))}
            </div>
        ),
    };

    const SkeletonComponent = skeletons[type];

    if (count === 1) {
        return <SkeletonComponent />;
    }

    return (
        <>
            {[...Array(count)].map((_, i) => (
                <SkeletonComponent key={i} />
            ))}
        </>
    );
}
