
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { useScrapeJobs } from '@/hooks/useScrapeJobs';
import { format, startOfWeek, addDays, isToday } from 'date-fns';

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const WeeklyCalendar = () => {
  const { trackSchedule, jobs, runJobManually, isRunningJob } = useScrapeJobs();
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date()));
  const [currentWeekDates, setCurrentWeekDates] = useState<Date[]>([]);
  
  // Generate dates for the current week view
  useEffect(() => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      dates.push(addDays(weekStart, i));
    }
    setCurrentWeekDates(dates);
  }, [weekStart]);
  
  // Navigate to previous week
  const prevWeek = () => {
    setWeekStart(addDays(weekStart, -7));
  };
  
  // Navigate to next week
  const nextWeek = () => {
    setWeekStart(addDays(weekStart, 7));
  };
  
  // Navigate to current week
  const currentWeek = () => {
    setWeekStart(startOfWeek(new Date()));
  };
  
  // Run all active jobs for a track
  const runTrackJobs = (trackName: string) => {
    const trackJobs = jobs.filter(job => job.track_name === trackName && job.is_active);
    if (trackJobs.length > 0) {
      trackJobs.forEach(job => {
        runJobManually(job);
      });
    }
  };
  
  return (
    <Card className="bg-betting-darkBlue border-betting-mediumBlue">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-white flex items-center">
          <CalendarCheck className="h-5 w-5 mr-2 text-betting-skyBlue" />
          Weekly Racing Calendar
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={prevWeek}
            className="h-7 w-7 p-0 rounded-full"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={currentWeek}
            className="h-7 px-2 text-xs"
          >
            Today
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={nextWeek}
            className="h-7 w-7 p-0 rounded-full"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-gray-400 mb-2">
          Week of {format(weekStart, 'MMM d, yyyy')}
        </div>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {WEEKDAYS.map((day, index) => (
            <div 
              key={day} 
              className="text-center text-xs font-semibold py-1"
            >
              {day.substring(0, 3)}
              <div className="text-[10px] text-gray-400">
                {format(currentWeekDates[index], 'MMM d')}
              </div>
            </div>
          ))}
        </div>
        
        <div className="space-y-2 mt-4">
          {Object.entries(trackSchedule).map(([trackName, racingDays]) => (
            <div key={trackName} className="flex items-center justify-between py-2 border-b border-betting-mediumBlue/30">
              <div className="flex-1">
                <div className="font-medium text-white">{trackName}</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {WEEKDAYS.map((day, idx) => {
                    const isRacingDay = racingDays.includes(day);
                    const isCurrentDay = isToday(currentWeekDates[idx]);
                    
                    return (
                      <Badge 
                        key={day} 
                        variant={isRacingDay ? "default" : "outline"}
                        className={`
                          text-[10px] rounded-sm px-1 py-0 
                          ${isRacingDay 
                            ? 'bg-betting-tertiaryPurple text-white' 
                            : 'text-gray-500 border-gray-500/30 bg-transparent'}
                          ${isCurrentDay && isRacingDay ? 'ring-1 ring-betting-skyBlue' : ''}
                        `}
                      >
                        {day.substring(0, 1)}
                      </Badge>
                    );
                  })}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={isRunningJob}
                onClick={() => runTrackJobs(trackName)}
                className="text-xs h-7 bg-betting-darkPurple/50 hover:bg-betting-darkPurple border-betting-mediumBlue"
              >
                Run Jobs
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklyCalendar;
