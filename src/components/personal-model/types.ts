
export interface WeightingFactors {
  speed: number;
  pace: number;
  closer: number;
  classLevel: number;
  fireNumber: number;
  finalTimeRating: number;
}

export interface PersonalModelResults {
  odds: Record<number, number>;
  scores: Record<number, number>;
}
