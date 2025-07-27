import React from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

export const TextArea: React.FC<TextAreaProps> = ({
  label,
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
      <textarea
        className={`
          w-full px-component py-2 
          bg-white border border-neutral-gray rounded-default
          text-neutral-black placeholder-neutral-gray-medium
          focus:outline-none focus:border-primary-orange focus:ring-1 focus:ring-primary-orange
          disabled:bg-gray-50 disabled:cursor-not-allowed
          resize-vertical min-h-[100px]
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
