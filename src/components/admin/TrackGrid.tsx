
import React from 'react';
import { ScrapeJob } from '@/types/ScraperTypes';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Play, CheckCircle, XCircle, Clock } from 'lucide-react';
import WeeklyCalendar from './tracks/WeeklyCalendar';

interface TrackGridProps {
  jobs: ScrapeJob[];
  onRunJob: (job: ScrapeJob) => void;
  isRunningJob: boolean;
}

const TrackGrid: React.FC<TrackGridProps> = ({
  jobs,
  onRunJob,
  isRunningJob
}) => {
  // Group jobs by track
  const trackGroups = jobs.reduce((groups, job) => {
    const trackName = job.track_name;
    if (!groups[trackName]) {
      groups[trackName] = [];
    }
    groups[trackName].push(job);
    return groups;
  }, {} as Record<string, ScrapeJob[]>);

  // Count active jobs by track
  const getActiveJobCount = (trackJobs: ScrapeJob[]) => {
    return trackJobs.filter(job => job.is_active).length;
  };
  
  // Get latest job status for a track
  const getLatestStatus = (trackJobs: ScrapeJob[]) => {
    const sortedJobs = [...trackJobs].sort((a, b) => 
      new Date(b.last_run_at || 0).getTime() - new Date(a.last_run_at || 0).getTime()
    );
    
    return sortedJobs[0]?.status || 'pending';
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(trackGroups).map(([trackName, trackJobs]) => (
              <Card key={trackName} className="bg-betting-darkBlue border-betting-mediumBlue hover:bg-betting-darkBlue/80 transition-colors">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium flex items-center justify-between">
                    <span className="truncate">{trackName}</span>
                    {getLatestStatus(trackJobs) === 'completed' && (
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    )}
                    {getLatestStatus(trackJobs) === 'failed' && (
                      <XCircle className="h-4 w-4 text-red-400" />
                    )}
                    {getLatestStatus(trackJobs) === 'running' && (
                      <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
                    )}
                    {getLatestStatus(trackJobs) === 'pending' && (
                      <Clock className="h-4 w-4 text-yellow-400" />
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-400 mb-3">
                    <span className="font-medium text-betting-skyBlue">{getActiveJobCount(trackJobs)}</span> active jobs
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {trackJobs.map(job => (
                      <div 
                        key={job.id} 
                        className={`
                          text-xs px-2 py-0.5 rounded 
                          ${job.is_active ? 'bg-betting-tertiaryPurple/30' : 'bg-gray-700/30'}
                          ${job.job_type === 'odds' ? 'text-blue-400' : 
                            job.job_type === 'will_pays' ? 'text-purple-400' : 
                            job.job_type === 'entries' ? 'text-green-400' : 'text-orange-400'}
                        `}
                      >
                        {job.job_type}
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full bg-betting-darkPurple/30 hover:bg-betting-darkPurple text-white border-betting-mediumBlue"
                    onClick={() => onRunJob(trackJobs[0])}
                    disabled={isRunningJob || trackJobs.length === 0}
                  >
                    {isRunningJob ? (
                      <>
                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-3 w-3" />
                        Run Jobs
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <WeeklyCalendar />
        </div>
      </div>
    </div>
  );
};

export default TrackGrid;
