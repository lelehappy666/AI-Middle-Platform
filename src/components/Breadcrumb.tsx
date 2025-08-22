import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '../lib/utils';

interface BreadcrumbItem {
  label: string;
  path?: string;
  onClick?: () => void;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className }) => {
  return (
    <nav className={cn('flex items-center space-x-1 text-sm', className)}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
          )}
          
          {item.onClick ? (
            <button
              onClick={item.onClick}
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors duration-200 hover:underline"
            >
              {index === 0 && <Home className="w-4 h-4" />}
              <span>{item.label}</span>
            </button>
          ) : (
            <span className="flex items-center space-x-1 text-gray-600">
              {index === 0 && <Home className="w-4 h-4" />}
              <span>{item.label}</span>
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;