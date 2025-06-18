
import React from 'react';
import { Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WeightingFactors } from './types';

interface WeightingControlsProps {
  weights: WeightingFactors;
  onWeightChange: (factor: keyof WeightingFactors, value: number) => void;
  onCalculate: () => void;
  onReset: () => void;
}

const WeightingControls: React.FC<WeightingControlsProps> = ({
  weights,
  onWeightChange,
  onCalculate,
  onReset
}) => {
  return (
    <div className="p-4 border-t border-gray-800/50 bg-gradient-to-r from-gray-800/30 to-gray-900/20 backdrop-blur-sm">
      <div className="mb-4">
        <h4 className="text-white font-semibold mb-3 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">P-Model Boost Weighting Percentages</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(weights).map(([key, value]) => (
            <div key={key} className="flex flex-col group/weight">
              <label className="text-sm text-gray-300 mb-1 capitalize group-hover/weight:text-white transition-colors">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="0.1"
                  value={value}
                  onChange={(e) => onWeightChange(key as keyof WeightingFactors, parseFloat(e.target.value))}
                  className="flex-1 h-2 bg-gradient-to-r from-gray-700 to-gray-600 rounded-lg appearance-none cursor-pointer slider backdrop-blur-sm"
                />
                <span className="text-white text-sm w-12 text-right font-mono bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">{value.toFixed(1)}%</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-sm text-gray-400">
          Total: <span className="text-white font-medium">{Object.values(weights).reduce((sum, weight) => sum + weight, 0).toFixed(1)}%</span>
        </div>
      </div>

      <div className="flex space-x-3">
        <Button 
          onClick={onCalculate}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white flex items-center gap-2 border border-blue-500/30 backdrop-blur-sm shadow-lg hover:shadow-blue-500/20 transition-all duration-300"
        >
          <Calculator className="h-4 w-4" />
          Evaluate Model
        </Button>
        <Button 
          onClick={onReset}
          variant="outline"
          className="border-gray-600/50 text-gray-300 hover:bg-gradient-to-r hover:from-gray-800/60 hover:to-gray-700/60 backdrop-blur-sm hover:border-purple-500/30 transition-all duration-300"
        >
          Reset Weights
        </Button>
      </div>
    </div>
  );
};

export default WeightingControls;
