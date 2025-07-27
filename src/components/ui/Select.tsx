import React from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Option[];
  error?: string;
  helperText?: string;
  required?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  error,
  helperText,
  className = '',
  required = false,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold mb-1">
          {label}
          {required && <span className="text-status-error ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          className={`
            w-full px-component py-2 
            bg-white border border-neutral-gray rounded-default
            text-neutral-black placeholder-neutral-gray-medium
            focus:outline-none focus:border-primary-orange focus:ring-1 focus:ring-primary-orange
            disabled:bg-gray-50 disabled:cursor-not-allowed
            appearance-none
            ${error ? 'border-status-error' : ''}
            ${className}
          `}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <ChevronDown className="h-4 w-4 text-neutral-gray-medium" />
        </div>
      </div>
      {error && (
        <p className="mt-1 text-sm text-status-error">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-neutral-gray-medium">{helperText}</p>
      )}
    </div>
  );
};
