
/**
 * Format a number as odds
 */
export const formatOdds = (odds: number): string => {
  return odds.toFixed(2);
};

/**
 * Format a number as currency
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Format a difference as a string with + or - prefix
 */
export const formatDifference = (diff: number): string => {
  const prefix = diff > 0 ? '+' : '';
  return `${prefix}${diff.toFixed(2)}`;
};

/**
 * Get CSS class based on value change
 */
export const getChangeClass = (change: number): string => {
  if (change > 0) return 'positive-change';
  if (change < 0) return 'negative-change';
  return '';
};

/**
 * Format a timestamp to time string
 */
export const formatTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  });
};

/**
 * Format training figure with star indicator
 */
export const formatTrainingFigure = (figure: number): string => {
  const stars = figure >= 90 ? '★★★' : figure >= 80 ? '★★' : figure >= 70 ? '★' : '';
  return `${figure} ${stars}`;
};

/**
 * Format runner position with PP indicator
 */
export const formatRunnerPosition = (position: number, runnerNumber: number): string => {
  return `${position} (PP${runnerNumber})`;
};
