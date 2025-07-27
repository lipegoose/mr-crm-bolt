import React from 'react';

interface RadioOption {
  value: string;
  label: string;
}

interface RadioGroupProps {
  label?: string;
  name: string;
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  helperText?: string;
  required?: boolean;
  className?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  label,
  name,
  options,
  value,
  onChange,
  error,
  helperText,
  required = false,
  className = '',
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="block text-sm font-semibold mb-2">
          {label}
          {required && <span className="text-status-error ml-1">*</span>}
        </div>
      )}
      <div className="flex space-x-4">
        {options.map((option) => (
          <label key={option.value} className="inline-flex items-center">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={handleChange}
              className="w-4 h-4 text-primary-orange border-neutral-gray focus:ring-primary-orange"
            />
            <span className="ml-2 text-sm text-neutral-black">{option.label}</span>
          </label>
        ))}
      </div>
      {error && <p className="mt-1 text-sm text-status-error">{error}</p>}
      {helperText && !error && (
        <p className="mt-1 text-sm text-neutral-gray-medium">{helperText}</p>
      )}
    </div>
  );
};
