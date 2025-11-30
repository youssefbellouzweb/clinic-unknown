import React from 'react';
import Select from 'react-select';

const MultiSelect = ({ options, value, onChange, placeholder = 'Select options...', isMulti = true }) => {
    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            borderColor: state.isFocused ? '#6366f1' : '#d1d5db',
            boxShadow: state.isFocused ? '0 0 0 2px rgba(99, 102, 241, 0.2)' : 'none',
            '&:hover': {
                borderColor: '#6366f1'
            }
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected ? '#6366f1' : state.isFocused ? '#e0e7ff' : 'white',
            color: state.isSelected ? 'white' : '#1f2937',
            '&:active': {
                backgroundColor: '#6366f1'
            }
        }),
        multiValue: (provided) => ({
            ...provided,
            backgroundColor: '#e0e7ff'
        }),
        multiValueLabel: (provided) => ({
            ...provided,
            color: '#4f46e5'
        }),
        multiValueRemove: (provided) => ({
            ...provided,
            color: '#4f46e5',
            '&:hover': {
                backgroundColor: '#c7d2fe',
                color: '#3730a3'
            }
        })
    };

    return (
        <Select
            isMulti={isMulti}
            options={options}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            styles={customStyles}
            className="react-select-container"
            classNamePrefix="react-select"
        />
    );
};

export default MultiSelect;
