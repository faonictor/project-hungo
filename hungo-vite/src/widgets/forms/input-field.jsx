import React from "react";
import InputMask from "react-input-mask";
import { Typography } from "@material-tailwind/react";

const InputField = ({
                        label,
                        placeholder,
                        value,
                        onChange,
                        type = "text",
                        mask,
                        min,
                        max,
                        step,
                        className
                    }) => (
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
                    <input
                        {...inputProps}
                        type={type}
                        size="lg"
                        placeholder={placeholder}
                        aria-label={label}
                        className="border border-blue-gray-200 focus:ring-1 p-3 rounded-md text-base"
                    />
                )}
            </InputMask>
        ) : (
            <input
                type={type}
                size="lg"
                placeholder={placeholder}
                aria-label={label}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                min={type === "number" ? min : undefined}
                max={type === "number" ? max : undefined}
                step={type === "number" ? step : undefined}
                className="border border-blue-gray-200 focus:ring-1 p-3 rounded-md text-base"
            />
        )}
    </div>
);

export default InputField;
