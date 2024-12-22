import React from "react";
import InputMask from "react-input-mask";
import { Input, Typography } from "@material-tailwind/react";

const InputField = ({ label, placeholder, value, onChange, type = "text", mask }) => (
    <div className="flex flex-col gap-3">
        <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
            {label}:
        </Typography>
        {mask ? (
            <InputMask
                mask={mask}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            >
                {(inputProps) => (
                    <Input
                        {...inputProps}
                        type={type}
                        size="lg"
                        placeholder={placeholder}
                        aria-label={label}
                        className="!border-blue-gray-200 focus:!border-gray-900"
                    />
                )}
            </InputMask>
        ) : (
            <Input
                type={type}
                size="lg"
                placeholder={placeholder}
                aria-label={label}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="!border-t-blue-gray-200 focus:!border-t-gray-900"
            />
        )}
    </div>
);

export default InputField;
