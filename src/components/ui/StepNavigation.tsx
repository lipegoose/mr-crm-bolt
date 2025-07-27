import React from 'react';
import { Check } from 'lucide-react';

export interface Step {
  id: string;
  label: string;
  icon?: React.ReactNode;
  completed?: boolean;
}

interface StepNavigationProps {
  steps: Step[];
  activeStep: string;
  onStepChange: (stepId: string) => void;
}

export const StepNavigation: React.FC<StepNavigationProps> = ({
  steps,
  activeStep,
  onStepChange
}) => {
  return (
    <div className="flex flex-col space-y-1 min-w-[220px] border-r border-neutral-gray pr-4 h-full">
      <h3 className="text-sm font-medium text-neutral-gray-medium mb-2 px-3">Passo a passo:</h3>
      <div className="flex flex-col space-y-1">
        {steps.map((step) => (
          <button
            key={step.id}
            onClick={() => onStepChange(step.id)}
            className={`
              px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-between
              ${activeStep === step.id
                ? 'text-primary-orange bg-primary-orange/5 font-medium'
                : 'text-neutral-gray-medium hover:text-neutral-black hover:bg-gray-50'
              }
            `}
          >
            <div className="flex items-center">
              {step.icon && <span className="mr-2">{step.icon}</span>}
              <span>{step.label}</span>
            </div>
            {step.completed && (
              <span className="text-green-500">
                <Check size={16} />
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
