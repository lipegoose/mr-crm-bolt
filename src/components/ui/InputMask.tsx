import React, { useState, useEffect } from 'react';

interface InputMaskProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  error?: string;
  helperText?: string;
  mask: string;
  onChange?: (value: string) => void;
  required?: boolean;
}

export const InputMask: React.FC<InputMaskProps> = ({
  label,
  error,
  helperText,
  className = '',
  mask,
  value = '',
  onChange,
  required = false,
  ...props
}) => {
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (value) {
      setInputValue(maskValue(value.toString(), mask));
    }
  }, [value, mask]);

  const maskValue = (val: string, mask: string): string => {
    let result = '';
    let valIndex = 0;

    for (let i = 0; i < mask.length && valIndex < val.length; i++) {
      const maskChar = mask[i];
      const valChar = val[valIndex];

      if (maskChar === '#') {
        if (/\d/.test(valChar)) {
          result += valChar;
          valIndex++;
        } else {
          valIndex++;
          i--;
        }
      } else if (maskChar === 'A') {
        if (/[a-zA-Z]/.test(valChar)) {
          result += valChar;
          valIndex++;
        } else {
          valIndex++;
          i--;
        }
      } else if (maskChar === 'S') {
        if (/[a-zA-Z0-9]/.test(valChar)) {
          result += valChar;
          valIndex++;
        } else {
          valIndex++;
          i--;
        }
      } else {
        result += maskChar;
        if (valChar === maskChar) {
          valIndex++;
        }
      }
    }

    return result;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
    const maskedValue = maskValue(rawValue, mask);
    
    setInputValue(maskedValue);
    
    if (onChange) {
      onChange(maskedValue);
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-neutral-black mb-1">
          {label}
          {required && <span className="text-status-error ml-1">*</span>}
        </label>
      )}
      <input
        className={`
          w-full px-component py-2 
          bg-white border border-neutral-gray rounded-default
          text-neutral-black placeholder-neutral-gray-medium
          focus:outline-none focus:border-primary-orange focus:ring-1 focus:ring-primary-orange
          disabled:bg-gray-50 disabled:cursor-not-allowed
          ${error ? 'border-status-error' : ''}
          ${className}
        `}
        value={inputValue}
        onChange={handleChange}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-status-error">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-neutral-gray-medium">{helperText}</p>
      )}
    </div>
  );
};
