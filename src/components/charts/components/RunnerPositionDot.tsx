
import React from 'react';
import { getRunnerColorByPosition } from '../constants/postPositionColors';

interface RunnerPositionDotProps {
  cx: number;
  cy: number;
  value: number;
  runnerNumber: number;
}

const RunnerPositionDot: React.FC<RunnerPositionDotProps> = ({ 
  cx, 
  cy, 
  value, 
  runnerNumber 
}) => {
  const standardColor = getRunnerColorByPosition(runnerNumber);
  
  return (
    <g>
      <rect 
        x={cx - 10} 
        y={cy - 10} 
        width={20} 
        height={20} 
        fill={standardColor} 
        stroke="#FFFFFF"
        strokeWidth={2}
        rx={2}
      />
      <text
        x={cx}
        y={cy}
        dy={2}
        textAnchor="middle"
        fill={runnerNumber === 2 || runnerNumber === 4 ? "#000000" : "#FFFFFF"}
        fontSize={11}
        fontWeight="bold"
      >
        {value}
      </text>
    </g>
  );
};

export default RunnerPositionDot;
