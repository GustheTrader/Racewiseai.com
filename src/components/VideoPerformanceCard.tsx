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
      <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 sm:px-6">
        <CardTitle className="text-center text-xl sm:text-2xl md:text-3xl">Video Performance Summary Grade</CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 md:p-6">
        <div className="overflow-x-auto -mx-3 sm:-mx-4 md:-mx-6 px-3 sm:px-4 md:px-6">
          <div className="min-w-[900px]">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-betting-tertiaryPurple/50">
                  <th className="text-left p-2 sm:p-3 md:p-4 text-sm sm:text-base md:text-lg font-bold whitespace-nowrap">PP</th>
                  <th className="text-left p-2 sm:p-3 md:p-4 text-sm sm:text-base md:text-lg font-bold whitespace-nowrap">Horse</th>
                  <th className="text-center p-2 sm:p-3 md:p-4 text-sm sm:text-base md:text-lg font-bold" colSpan={5}>Last 5 Video Grades</th>
                  <th className="text-center p-2 sm:p-3 md:p-4 text-sm sm:text-base md:text-lg font-bold whitespace-nowrap">Runout Grade</th>
                  <th className="text-left p-2 sm:p-3 md:p-4 text-sm sm:text-base md:text-lg font-bold whitespace-nowrap">Runout Notes</th>
                </tr>
                <tr className="border-b border-betting-tertiaryPurple/30">
                  <th></th>
                  <th></th>
                  <th className="text-center p-1 sm:p-2 text-xs sm:text-sm whitespace-nowrap">Most Recent</th>
                  <th className="text-center p-1 sm:p-2 text-xs sm:text-sm whitespace-nowrap">2nd Back</th>
                  <th className="text-center p-1 sm:p-2 text-xs sm:text-sm whitespace-nowrap">3rd Back</th>
                  <th className="text-center p-1 sm:p-2 text-xs sm:text-sm whitespace-nowrap">4th Back</th>
                  <th className="text-center p-1 sm:p-2 text-xs sm:text-sm whitespace-nowrap">5th Back</th>
                  <th></th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {mockData.map((horse, index) => (
                  <tr key={index} className="border-b border-betting-tertiaryPurple/20 hover:bg-betting-darkPurple/30">
                    <td className="p-2 sm:p-3 md:p-4 text-center font-bold text-base sm:text-lg md:text-xl">{horse.pp}</td>
                    <td className="p-2 sm:p-3 md:p-4 font-bold text-sm sm:text-base md:text-lg whitespace-nowrap">{horse.horseName}</td>
                    {horse.lastFiveGrades.map((grade, gradeIndex) => (
                      <td key={gradeIndex} className="p-1 sm:p-2 text-center">
                        <div className="space-y-1 sm:space-y-2">
                          <Badge className={`${getGradeColor(grade.grade)} text-sm sm:text-base md:text-lg font-bold px-2 sm:px-3 py-0.5 sm:py-1`}>
                            {grade.grade}
                          </Badge>
                          <div className="text-[10px] sm:text-xs text-gray-400">
                            <div>{grade.race}</div>
                            <div>{grade.date}</div>
                          </div>
                          <div className="text-[10px] sm:text-xs text-yellow-400 italic">
                            {grade.troubleNotes}
                          </div>
                        </div>
                      </td>
                    ))}
                    <td className="p-2 sm:p-3 md:p-4 text-center">
                      <Badge className={`${getGradeColor(horse.runoutGrade)} text-base sm:text-lg md:text-xl font-bold px-2 sm:px-3 md:px-4 py-1 sm:py-2`}>
                        {horse.runoutGrade}
                      </Badge>
                    </td>
                    <td className="p-2 sm:p-3 md:p-4 text-xs sm:text-sm text-yellow-400 italic max-w-[150px] sm:max-w-xs">
                      {horse.runoutNotes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="mt-4 sm:mt-6 md:mt-8 p-3 sm:p-4 bg-betting-darkPurple/50 rounded-lg border border-betting-tertiaryPurple/30">
          <h3 className="text-base sm:text-lg font-bold mb-2 sm:mb-3">Grade Scale:</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm">
            <div className="flex items-center gap-1 sm:gap-2">
              <Badge className="bg-green-600 text-white text-xs sm:text-sm">A</Badge>
              <span>Excellent</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <Badge className="bg-blue-600 text-white text-xs sm:text-sm">B</Badge>
              <span>Good</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <Badge className="bg-yellow-600 text-white text-xs sm:text-sm">C</Badge>
              <span>Average</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <Badge className="bg-orange-600 text-white text-xs sm:text-sm">D</Badge>
              <span>Below Avg</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <Badge className="bg-red-600 text-white text-xs sm:text-sm">F</Badge>
              <span>Poor</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoPerformanceCard;