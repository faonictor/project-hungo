import React, { forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface CurrencyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  value: number | string;
  onChange: (value: string, numericValue: number) => void;
  prefix?: string;
  className?: string;
}

export const formatCentsToBRL = (cents: number): string => {
  if (cents <= 0 || isNaN(cents)) return "";
  return (cents / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const parseValueToCents = (val: number | string): number => {
  if (typeof val === "number") {
    if (isNaN(val) || val <= 0) return 0;
    return Math.round(val * 100);
  }
  if (!val) return 0;
  const digits = val.toString().replace(/\D/g, "");
  return parseInt(digits, 10) || 0;
};

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  (
    {
      value,
      onChange,
      prefix = "R$",
      className,
      disabled,
      placeholder = "0,00",
      ...props
    },
    ref
  ) => {
    const cents = parseValueToCents(value);
    const displayValue = cents > 0 ? formatCentsToBRL(cents) : "";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      const digits = rawValue.replace(/\D/g, "");
      const newCents = parseInt(digits, 10) || 0;

      if (newCents === 0) {
        onChange("", 0);
      } else {
        const numVal = newCents / 100;
        onChange(numVal.toFixed(2), numVal);
      }
    };

    return (
      <div className={cn("relative flex items-center w-full", className)}>
        {prefix && (
          <span
            className={cn(
              "absolute left-2.5 text-xs font-semibold select-none pointer-events-none transition-colors",
              disabled ? "text-muted-foreground/40" : "text-muted-foreground"
            )}
          >
            {prefix}
          </span>
        )}
        <Input
          ref={ref}
          type="text"
          inputMode="numeric"
          disabled={disabled}
          placeholder={placeholder}
          value={displayValue}
          onChange={handleChange}
          className={cn(
            "text-right font-mono font-bold h-8 text-xs transition-all w-full",
            prefix ? "pl-8 pr-2.5" : "px-2.5",
            disabled && "opacity-40 bg-muted/60 cursor-not-allowed"
          )}
          {...props}
        />
      </div>
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";
