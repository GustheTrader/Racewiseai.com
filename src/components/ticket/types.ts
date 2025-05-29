
export interface BetSelection {
  horseId: number;
  horseName: string;
  pp: number;
  betType: 'win' | 'place' | 'show' | 'exacta' | 'trifecta' | 'superfecta' | 'daily_double' | 'pick_three' | 'win_place_show' | 'win_place' | 'win_show' | 'place_show';
  amount: number;
  isKeyHorse?: boolean;
  isBoxBet?: boolean;
  withPosition?: number;
  raceNumber?: number;
}

export interface TicketConstruction {
  betType: BetSelection['betType'];
  boxHorses: number[];
  keyHorses: number[];
  withHorses: number[];
  withPosition1: number[];
  withPosition2: number[];
  withPosition3: number[];
  withPosition4: number[];
  amount: number;
  raceNumber?: number;
  isBoxMode: boolean;
  isKeyMode: boolean;
  isWithMode: boolean;
}

export interface BetType {
  type: BetSelection['betType'];
  label: string;
  color: string;
}
