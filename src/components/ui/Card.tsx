import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  shadow?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  shadow = true
}) => {
  return (
    <div className={`
      bg-white border border-neutral-gray rounded-default p-component
      ${shadow ? 'shadow-sm' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
};