import React, { useState } from 'react';
import { Filter, X } from 'lucide-react';
import DateRangePicker from './DateRangePicker';
import MultiSelect from './MultiSelect';

const FilterPanel = ({ filters, onFilterChange, onClear }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleDateRangeChange = (range) => {
        onFilterChange({
            ...filters,
            dateFrom: range.start,
            dateTo: range.end
        });
    };

    const handleStatusChange = (selected) => {
        onFilterChange({
            ...filters,
            status: selected
        });
    };

    const handleClear = () => {
        if (onClear) onClear();
        setIsOpen(false);
    };

    const statusOptions = [
        { value: 'pending', label: 'Pending' },
        { value: 'confirmed', label: 'Confirmed' },
        { value: 'cancelled', label: 'Cancelled' },
        { value: 'completed', label: 'Completed' }
    ];

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
                <Filter className="w-5 h-5 mr-2" />
                Filters
                {(filters.dateFrom || filters.dateTo || filters.status) && (
                    <span className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                        Active
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-gray-900">Filters</h3>
                        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {/* Date Range */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Date Range
                            </label>
                            <DateRangePicker
                                startDate={filters.dateFrom}
                                endDate={filters.dateTo}
                                onChange={handleDateRangeChange}
                            />
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Status
                            </label>
                            <MultiSelect
                                options={statusOptions}
                                value={filters.status}
                                onChange={handleStatusChange}
                                placeholder="Select status..."
                            />
                        </div>
                    </div>

                    <div className="mt-4 flex space-x-2">
                        <button
                            onClick={handleClear}
                            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                        >
                            Clear All
                        </button>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                        >
                            Apply
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FilterPanel;
