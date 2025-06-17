
import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  isLoading: boolean;
  hasNoData: boolean;
}

const LoadingState: React.FC<LoadingStateProps> = ({ isLoading, hasNoData }) => {
  if (isLoading) {
    return (
      <tr>
        <td colSpan={12} className="px-4 py-8 text-center text-gray-400">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin mb-2" />
            <span>Fetching latest odds data...</span>
          </div>
        </td>
      </tr>
    );
  }

  if (hasNoData) {
    return (
      <tr>
        <td colSpan={12} className="px-4 py-8 text-center text-gray-400">
          No odds data available for this race
        </td>
      </tr>
    );
  }

  return null;
};

export default LoadingState;
