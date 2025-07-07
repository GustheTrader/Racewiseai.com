
/**
 * Utility functions for odds comparison and formatting
 */

/**
 * Convert fractional odds to decimal
 */
export const convertToDecimal = (odds: string): number => {
  const parts = odds.split('-');
  if (parts.length === 2) {
    const numerator = parseInt(parts[0]);
    const denominator = parseInt(parts[1]);
    return denominator > 0 ? numerator / denominator + 1 : 0;
  }
  return 0;
};

/**
 * Compare odds and determine if there's value
 */
export const compareOdds = (mlOdds: string, qModelOdds: string): { delta: number, hasValue: boolean } => {
  const mlDecimal = convertToDecimal(mlOdds);
  const qModelDecimal = convertToDecimal(qModelOdds);
  
  if (mlDecimal === 0 || qModelDecimal === 0) return { delta: 0, hasValue: false };
  
  // Calculate delta (positive means value)
  const delta = mlDecimal - qModelDecimal;
  
  return {
    delta: parseFloat(delta.toFixed(2)),
    hasValue: delta > 0
  };
};
