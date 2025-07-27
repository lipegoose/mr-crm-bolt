import React from 'react';
// useState removido pois não está sendo usado

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  vertical?: boolean;
}

export const Tabs: React.FC<TabsProps> = ({ 
  tabs, 
  activeTab, 
  onTabChange, 
  vertical = false 
}) => {
  return (
    <div className={`${vertical ? 'flex' : ''}`}>
      <div 
        className={`
          ${vertical 
            ? 'flex flex-col space-y-1 min-w-[200px] border-r border-neutral-gray pr-4' 
            : 'flex space-x-1 border-b border-neutral-gray mb-4'
          }
        `}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              px-4 py-2 rounded-t-md text-sm font-medium transition-colors
              ${activeTab === tab.id
                ? 'text-primary-orange border-b-2 border-primary-orange bg-primary-orange/5'
                : 'text-neutral-gray-medium hover:text-neutral-black hover:bg-gray-50'
              }
              ${vertical 
                ? 'flex items-center space-x-2 text-left border-l-2 border-transparent rounded-l-none rounded-r-md pl-3'
                : ''
              }
              ${vertical && activeTab === tab.id
                ? '!border-l-2 !border-primary-orange !rounded-r-md !rounded-l-none'
                : ''
              }
            `}
          >
            {tab.icon && (
              <span className={`${vertical ? '' : 'mr-2'}`}>
                {tab.icon}
              </span>
            )}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
