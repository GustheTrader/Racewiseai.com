
interface RunnerNamesMap {
  [key: string]: string;
}

export const createLegendFormatter = (runnerNames: RunnerNamesMap) => {
  return (value: string) => {
    if (value === 'volume') return 'Bet Volume';
    if (value.toString().includes('Odds')) {
      const runnerNumber = value.toString().replace('runnerOdds', '');
      return `${runnerNames[`runner${runnerNumber}` as keyof typeof runnerNames]} Odds`;
    }
    const runnerNumber = value.toString().replace('runner', '');
    return runnerNames[value as keyof typeof runnerNames] || `Runner ${runnerNumber}`;
  };
};
