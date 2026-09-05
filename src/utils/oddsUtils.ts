
/**
 * Parse a morning-line odds string into decimal odds (return value only).
 * Handles fractional ("7-2", "5/2"), decimal ("3.5"), "EVEN"/"EVS", and "SCR".
 * Returns null for missing/unparseable values.
 */
export const parseFractionalOdds = (raw?: string | number | null): number | null => {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === 'number') return isFinite(raw) ? raw : null;
  const s = String(raw).trim().toUpperCase();
  if (!s || s === 'SCR' || s === 'SCRATCH' || s === '-') return null;
  if (s === 'EVEN' || s === 'EVS' || s === 'EV') return 1;
  const frac = s.match(/^(\d+(?:\.\d+)?)\s*[-/]\s*(\d+(?:\.\d+)?)$/);
  if (frac) {
    const num = parseFloat(frac[1]);
    const den = parseFloat(frac[2]);
    if (den > 0) return num / den;
  }
  const dec = parseFloat(s);
  return isFinite(dec) ? dec : null;
};

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
