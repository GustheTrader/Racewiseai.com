import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface VideoGrade {
  race: string;
  date: string;
  grade: string;
  troubleNotes: string;
}

interface HorsePerformance {
  pp: number;
  horseName: string;
  lastFiveGrades: VideoGrade[];
  runoutGrade: string;
  runoutNotes: string;
}

const VideoPerformanceCard = () => {
  const mockData: HorsePerformance[] = [
    {
      pp: 1,
      horseName: "Silver Streak",
      lastFiveGrades: [
        { race: "Race 7", date: "04/20", grade: "A", troubleNotes: "Clean trip" },
        { race: "Race 5", date: "04/15", grade: "B+", troubleNotes: "Bumped at start" },
        { race: "Race 3", date: "04/10", grade: "A-", troubleNotes: "Wide turn" },
        { race: "Race 8", date: "04/05", grade: "B", troubleNotes: "Traffic trouble" },
        { race: "Race 2", date: "03/30", grade: "C+", troubleNotes: "Broke slowly" }
      ],
      runoutGrade: "A",
      runoutNotes: "Strong finish, maintained form"
    },
    {
      pp: 2,
      horseName: "Thunder Bolt",
      lastFiveGrades: [
        { race: "Race 6", date: "04/22", grade: "B", troubleNotes: "Steady pace" },
        { race: "Race 4", date: "04/17", grade: "C", troubleNotes: "Faded late" },
        { race: "Race 9", date: "04/12", grade: "B-", troubleNotes: "Lost whip" },
        { race: "Race 1", date: "04/07", grade: "A-", troubleNotes: "Rail trip" },
        { race: "Race 7", date: "04/02", grade: "D", troubleNotes: "Refused to run" }
      ],
      runoutGrade: "B+",
      runoutNotes: "Improved effort, showed heart"
    },
    {
      pp: 3,
      horseName: "Golden Arrow",
      lastFiveGrades: [
        { race: "Race 8", date: "04/21", grade: "A+", troubleNotes: "Perfect trip" },
        { race: "Race 6", date: "04/16", grade: "A", troubleNotes: "Overcame trouble" },
        { race: "Race 4", date: "04/11", grade: "B+", troubleNotes: "Late charge" },
        { race: "Race 2", date: "04/06", grade: "A-", troubleNotes: "Good closing kick" },
        { race: "Race 9", date: "04/01", grade: "B", troubleNotes: "Checked mid-race" }
      ],
      runoutGrade: "A+",
      runoutNotes: "Dominant performance past wire"
    },
    {
      pp: 4,
      horseName: "Fast Lane",
      lastFiveGrades: [
        { race: "Race 5", date: "04/19", grade: "C+", troubleNotes: "Lugged in" },
        { race: "Race 3", date: "04/14", grade: "B-", troubleNotes: "Hung late" },
        { race: "Race 7", date: "04/09", grade: "C", troubleNotes: "No response" },
        { race: "Race 1", date: "04/04", grade: "B", troubleNotes: "Even effort" },
        { race: "Race 8", date: "03/29", grade: "F", troubleNotes: "Pulled up" }
      ],
      runoutGrade: "C",
      runoutNotes: "Moderate effort, needs improvement"
    },
    {
      pp: 5,
      horseName: "Wind Chaser",
      lastFiveGrades: [
        { race: "Race 4", date: "04/18", grade: "B+", troubleNotes: "Good recovery" },
        { race: "Race 2", date: "04/13", grade: "A-", troubleNotes: "Nice finish" },
        { race: "Race 6", date: "04/08", grade: "B", troubleNotes: "Steady throughout" },
        { race: "Race 9", date: "04/03", grade: "C+", troubleNotes: "Tired late" },
        { race: "Race 5", date: "03/28", grade: "D+", troubleNotes: "Poor start" }
      ],
      runoutGrade: "B",
      runoutNotes: "Consistent effort, maintained pace"
    }
  ];

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'bg-green-600 text-white';
    if (grade.startsWith('B')) return 'bg-blue-600 text-white';
    if (grade.startsWith('C')) return 'bg-yellow-600 text-white';
    if (grade.startsWith('D')) return 'bg-orange-600 text-white';
    return 'bg-red-600 text-white';
  };

  return (
    <Card className="w-full h-full">
      <CardHeader className="bg-gradient-to-r from-betting-primaryPurple to-betting-secondaryPurple text-white">
        <CardTitle className="text-center text-3xl">Video Performance Summary Grade</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-betting-tertiaryPurple/50">
                <th className="text-left p-4 text-lg font-bold">PP</th>
                <th className="text-left p-4 text-lg font-bold">Horse</th>
                <th className="text-center p-4 text-lg font-bold" colSpan={5}>Last 5 Video Grades</th>
                <th className="text-center p-4 text-lg font-bold">Runout Grade</th>
                <th className="text-left p-4 text-lg font-bold">Runout Notes</th>
              </tr>
              <tr className="border-b border-betting-tertiaryPurple/30">
                <th></th>
                <th></th>
                <th className="text-center p-2 text-sm">Most Recent</th>
                <th className="text-center p-2 text-sm">2nd Back</th>
                <th className="text-center p-2 text-sm">3rd Back</th>
                <th className="text-center p-2 text-sm">4th Back</th>
                <th className="text-center p-2 text-sm">5th Back</th>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {mockData.map((horse, index) => (
                <tr key={index} className="border-b border-betting-tertiaryPurple/20 hover:bg-betting-darkPurple/30">
                  <td className="p-4 text-center font-bold text-xl">{horse.pp}</td>
                  <td className="p-4 font-bold text-lg">{horse.horseName}</td>
                  {horse.lastFiveGrades.map((grade, gradeIndex) => (
                    <td key={gradeIndex} className="p-2 text-center">
                      <div className="space-y-2">
                        <Badge className={`${getGradeColor(grade.grade)} text-lg font-bold px-3 py-1`}>
                          {grade.grade}
                        </Badge>
                        <div className="text-xs text-gray-400">
                          <div>{grade.race}</div>
                          <div>{grade.date}</div>
                        </div>
                        <div className="text-xs text-yellow-400 italic">
                          {grade.troubleNotes}
                        </div>
                      </div>
                    </td>
                  ))}
                  <td className="p-4 text-center">
                    <Badge className={`${getGradeColor(horse.runoutGrade)} text-xl font-bold px-4 py-2`}>
                      {horse.runoutGrade}
                    </Badge>
                  </td>
                  <td className="p-4 text-sm text-yellow-400 italic max-w-xs">
                    {horse.runoutNotes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-8 p-4 bg-betting-darkPurple/50 rounded-lg border border-betting-tertiaryPurple/30">
          <h3 className="text-lg font-bold mb-3">Grade Scale:</h3>
          <div className="grid grid-cols-5 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Badge className="bg-green-600 text-white">A</Badge>
              <span>Excellent Performance</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-600 text-white">B</Badge>
              <span>Good Performance</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-yellow-600 text-white">C</Badge>
              <span>Average Performance</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-orange-600 text-white">D</Badge>
              <span>Below Average</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-red-600 text-white">F</Badge>
              <span>Poor Performance</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoPerformanceCard;