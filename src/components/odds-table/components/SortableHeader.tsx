
import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { SortField, SortDirection } from '../types';

interface SortableHeaderProps {
  field: SortField;
  children: React.ReactNode;
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
}

const SortableHeader: React.FC<SortableHeaderProps> = ({ 
  field, 
  children, 
  sortField, 
  sortDirection, 
  onSort 
}) => {
  const getSortIcon = () => {
    if (sortField !== field) {
      return <ChevronUp className="h-4 w-4 text-gray-500" />;
    }
    return sortDirection === 'asc' ? 
      <ChevronUp className="h-4 w-4 text-white" /> : 
      <ChevronDown className="h-4 w-4 text-white" />;
  };

  return (
    <th 
      className="px-4 py-3 text-left cursor-pointer hover:bg-gray-700 transition-colors select-none"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs">{children}</span>
        {getSortIcon()}
      </div>
    </th>
  );
};

export default SortableHeader;
