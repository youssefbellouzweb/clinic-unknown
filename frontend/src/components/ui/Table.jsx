import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';
import Skeleton, { SkeletonTable } from './Skeleton';
import EmptyState from './EmptyState';

export default function Table({
    columns,
    data,
    isLoading = false,
    emptyState,
    onSort,
    sortColumn,
    sortDirection,
    striped = false,
    hover = true,
    className = '',
}) {
    if (isLoading) {
        return <SkeletonTable rows={5} columns={columns.length} />;
    }

    if (!data || data.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-md overflow-hidden p-8">
                {emptyState || <EmptyState title="No data available" />}
            </div>
        );
    }

    return (
        <div className={`bg-white rounded-xl shadow-md overflow-hidden ${className}`}>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {columns.map((column, index) => (
                                <th
                                    key={index}
                                    scope="col"
                                    className={`px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider ${column.sortable ? 'cursor-pointer hover:bg-gray-100 transition-colors' : ''
                                        } ${column.className || ''}`}
                                    onClick={() => column.sortable && onSort?.(column.key)}
                                >
                                    <div className="flex items-center gap-2">
                                        {column.header}
                                        {column.sortable && (
                                            <span className="text-gray-400">
                                                {sortColumn === column.key ? (
                                                    sortDirection === 'asc' ? (
                                                        <ChevronUp size={14} />
                                                    ) : (
                                                        <ChevronDown size={14} />
                                                    )
                                                ) : (
                                                    <ChevronsUpDown size={14} />
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.map((row, rowIndex) => (
                            <tr
                                key={row.id || rowIndex}
                                className={`
                                    transition-colors duration-150
                                    ${striped && rowIndex % 2 === 0 ? 'bg-gray-50/50' : ''}
                                    ${hover ? 'hover:bg-blue-50/50' : ''}
                                `}
                            >
                                {columns.map((column, colIndex) => (
                                    <td
                                        key={colIndex}
                                        className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${column.className || ''
                                            }`}
                                    >
                                        {column.render
                                            ? column.render(row)
                                            : row[column.key]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
