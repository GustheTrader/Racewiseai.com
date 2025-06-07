
import React from 'react';
import { TooltipProps } from 'recharts';

interface RunnerNamesMap {
  [key: string]: string;
}

interface ChartTooltipProps extends TooltipProps<any, any> {
  runnerNames: RunnerNamesMap;
  smallText?: boolean;
}

const ChartTooltip: React.FC<ChartTooltipProps> = ({ 
  active, 
  payload, 
  label, 
  runnerNames,
  smallText = false 
}) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const formatValue = (value: any, name: string) => {
    if (name === 'volume') return [`$${value.toLocaleString()}`, 'Bet Volume'];
    if (name.toString().includes('Odds')) {
      const runnerNumber = name.toString().replace('runnerOdds', '');
      return [`${value}`, `${runnerNames[`runner${runnerNumber}` as keyof typeof runnerNames]} Odds`];
    }
    const runnerNumber = name.toString().replace('runner', '');
    const runnerName = runnerNames[name as keyof typeof runnerNames] || `Runner ${runnerNumber}`;
    return [`#${value}`, runnerName];
  };

  return (
    <div 
      style={{ 
        backgroundColor: '#1D2133', 
        borderColor: '#3B82F6',
        color: '#fff',
        fontSize: smallText ? 10 : 12,
        padding: '8px 12px',
        borderRadius: '4px',
        border: '1px solid #3B82F6'
      }}
    >
      <div>{`Time: ${label}`}</div>
      {payload.map((entry, index) => {
        const [formattedValue, formattedName] = formatValue(entry.value, entry.name || '');
        return (
          <div key={index} style={{ color: entry.color }}>
            {formattedName}: {formattedValue}
          </div>
        );
      })}
    </div>
  );
};

export default ChartTooltip;
