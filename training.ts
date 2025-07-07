
import { WorkoutFigure } from '../types';

// Generate workout figures
export const generateTrainingFigures = (): WorkoutFigure[] => {
  return [
    {
      horse: 'Silver Streak',
      date: '04/20/25',
      figure: 94,
      track: 'Saratoga',
      distance: '5f',
      improvement: 7
    },
    {
      horse: 'Dark Horse',
      date: '04/18/25',
      figure: 89,
      track: 'Belmont',
      distance: '6f',
      improvement: 5
    },
    {
      horse: 'Fast Lane',
      date: '04/22/25',
      figure: 91,
      track: 'Churchill',
      distance: '7f',
      improvement: 3
    },
    {
      horse: 'Thunder Bolt',
      date: '04/19/25',
      figure: 85,
      track: 'Aqueduct',
      distance: '4f',
      improvement: 2
    },
    {
      horse: 'Golden Arrow',
      date: '04/21/25',
      figure: 78,
      track: 'Keeneland',
      distance: '5f',
      improvement: -2
    },
    {
      horse: 'Wind Chaser',
      date: '04/17/25',
      figure: 72,
      track: 'Pimlico',
      distance: '6f',
      improvement: -1
    }
  ];
};
