
export const calculateBoxCost = (numHorses: number, betType: string, amount: number) => {
  if (numHorses < 2) return 0;
  
  switch (betType) {
    case 'exacta':
      return numHorses * (numHorses - 1) * amount;
    case 'trifecta':
      return numHorses * (numHorses - 1) * (numHorses - 2) * amount;
    case 'superfecta':
      return numHorses * (numHorses - 1) * (numHorses - 2) * (numHorses - 3) * amount;
    default:
      return numHorses * (numHorses - 1) * amount;
  }
};

export const canUseBoxOrKey = (betType: string) => {
  return ['exacta', 'trifecta', 'superfecta'].includes(betType);
};

export const canUseWithPositions = (betType: string) => {
  return betType === 'superfecta';
};

export const canUseTrifectaPositions = (betType: string) => {
  return betType === 'trifecta';
};

export const needsRaceSelection = (betType: string) => {
  return ['daily_double', 'pick_three'].includes(betType);
};

export const isWinPlaceShowBet = (betType: string) => {
  return ['win', 'place', 'show', 'win_place_show', 'win_place', 'win_show', 'place_show'].includes(betType);
};
