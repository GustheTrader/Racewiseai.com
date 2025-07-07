
import { ValuePick, PickCombination } from '../types';

export const generateValuePicks = (): ValuePick[] => {
  return [
    {
      race: 2,
      pp: 5,
      horse: "Gold Search",
      odds: "3/1",
      value: 18.4,
      confidence: 75
    },
    {
      race: 4,
      pp: 3,
      horse: "Rivalry",
      odds: "7/2",
      value: 11.2,
      confidence: 62
    },
    {
      race: 1,
      pp: 8,
      horse: "Beer With Ice",
      odds: "9/1",
      value: 7.5,
      confidence: 45
    },
    {
      race: 3,
      pp: 2,
      horse: "More Than Five",
      odds: "5/1",
      value: 4.2,
      confidence: 58
    }
  ];
};

export const generatePick3Combos = (): PickCombination[] => {
  return [
    {
      combination: "3-5-2",
      races: "1-3"
    },
    {
      combination: "3-5-7",
      races: "2-4"
    },
    {
      combination: "3-1-2",
      races: "3-5"
    },
    {
      combination: "5-1-2",
      races: "1-3"
    }
  ];
};
