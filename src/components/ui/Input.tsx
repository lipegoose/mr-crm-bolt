import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-neutral-black mb-1">
          {label}
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