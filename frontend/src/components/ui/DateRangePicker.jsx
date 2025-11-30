import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Calendar } from 'lucide-react';

const DateRangePicker = ({ startDate, endDate, onChange, placeholder = 'Select date range' }) => {
    const [localStartDate, setLocalStartDate] = useState(startDate);
    const [localEndDate, setLocalEndDate] = useState(endDate);

    const handleStartDateChange = (date) => {
        setLocalStartDate(date);
        if (onChange) {
            onChange({ start: date, end: localEndDate });
        }
    };

    const handleEndDateChange = (date) => {
        setLocalEndDate(date);
        if (onChange) {
            onChange({ start: localStartDate, end: date });
        }
    };

    return (
        <div className="flex items-center space-x-2">
            <div className="relative flex-1">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <DatePicker
                    selected={localStartDate}
                    onChange={handleStartDateChange}
                    selectsStart
                    startDate={localStartDate}
                    endDate={localEndDate}
                    placeholderText="Start date"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    dateFormat="yyyy-MM-dd"
                />
            </div>
            <span className="text-gray-500">to</span>
            <div className="relative flex-1">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <DatePicker
                    selected={localEndDate}
                    onChange={handleEndDateChange}
                    selectsEnd
                    startDate={localStartDate}
                    endDate={localEndDate}
                    minDate={localStartDate}
                    placeholderText="End date"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    dateFormat="yyyy-MM-dd"
                />
            </div>
        </div>
    );
};

export default DateRangePicker;
