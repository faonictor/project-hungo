import React from 'react';
import { Typography } from "@material-tailwind/react";

const SelectField = ({ label, value, onChange, options, placeholder = '' }) => (
    <div className="flex flex-col gap-3">
        <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
            {label}:
        </Typography>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="border border-blue-gray-200 focus:ring-1 p-3.5 rounded-md text-base w-full"
        >
            <option value="">{placeholder}</option>
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    </div>
);

export default SelectField;
