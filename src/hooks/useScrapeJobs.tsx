
import { useState, useEffect } from 'react';
import { ScrapeJob } from '@/types/ScraperTypes';
import { useJobFetching } from './useJobFetching';
import { useScraperStats } from './useScraperStats';
import { useJobOperations } from './useJobOperations';
import { toast } from '@/components/ui/sonner';

export const useScrapeJobs = () => {
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [trackSchedule, setTrackSchedule] = useState<Record<string, string[]>>({});
  
  // Use our smaller hooks
  const { jobs, isLoading, loadJobs, setJobs } = useJobFetching();
  const { stats, loadStats } = useScraperStats();
  const { isRunningJob, createJob: createJobOperation, toggleJobStatus: toggleJobStatusOperation, deleteJob: deleteJobOperation, runJobManually: runJobManuallyOperation } = useJobOperations();

  // Load track schedule
  useEffect(() => {
    // This is a simplified weekly schedule for tracks
    // In a real implementation, this would come from an API or database
    const schedule: Record<string, string[]> = {
      'CHURCHILL DOWNS': ['Thursday', 'Friday', 'Saturday', 'Sunday'],
      'BELMONT PARK': ['Thursday', 'Friday', 'Saturday', 'Sunday'],
      'AQUEDUCT': ['Friday', 'Saturday', 'Sunday'],
      'GULFSTREAM': ['Thursday', 'Friday', 'Saturday', 'Sunday'],
      'DEL MAR': ['Friday', 'Saturday', 'Sunday'],
      'KEENELAND': ['Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      'KENTUCKY DOWNS': ['Saturday', 'Sunday'],
      'OAKLAWN PARK': ['Friday', 'Saturday', 'Sunday'],
      'PIMLICO': ['Friday', 'Saturday', 'Sunday'],
      'LOS ALAMITOS-DAY': ['Saturday', 'Sunday'],
      'LOS ALAMITOS-NIGHT': ['Friday', 'Saturday']
    };
    
    setTrackSchedule(schedule);
  }, []);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      loadJobs();
      loadStats();
      setLastRefresh(new Date());
    }, 30000);
    
    return () => clearInterval(refreshInterval);
  }, [loadJobs, loadStats]);

  // Load data on mount
  useEffect(() => {
    loadJobs();
    loadStats();
  }, [loadJobs, loadStats]);

  // Enhanced versions of the operations that update local state
  const createJob = async (values: any) => {
    // Add offtrackbetting.com URL format if not provided
    if (!values.url || values.url.trim() === '') {
      const trackSlug = values.track_name.toLowerCase().replace(/\s+/g, '-');
      values.url = `https://app.offtrackbetting.com/#/lobby/live-racing?programName=${trackSlug}`;
    }
    
    const result = await createJobOperation(values);
    if (result.success && result.data) {
      setJobs([result.data as ScrapeJob, ...jobs]);
      loadStats();
    }
    return result.success;
  };

  const toggleJobStatus = async (job: ScrapeJob) => {
    const result = await toggleJobStatusOperation(job);
    if (result.success) {
      // Update jobs state
      setJobs(jobs.map(j => 
        j.id === job.id ? { ...j, is_active: result.isActive } : j
      ));
      loadStats();
    }
  };

  const deleteJob = async (jobId: string) => {
    const result = await deleteJobOperation(jobId);
    if (result.success) {
      setJobs(jobs.filter(job => job.id !== jobId));
      loadStats();
    }
  };

  const runJobManually = async (job: ScrapeJob) => {
    // Check if the track is running today based on schedule
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const trackDays = trackSchedule[job.track_name] || [];
    
    if (!trackDays.includes(today)) {
      toast.warning(`${job.track_name} doesn't typically run on ${today}. Running anyway.`);
    }
    
    const result = await runJobManuallyOperation(job);
    if (result.success) {
      // Wait a moment before refreshing to allow the edge function to complete
      setTimeout(async () => {
        await loadJobs();
        await loadStats();
      }, 3000);
    }
  };

  // Check if a track is running today
  const isTrackRunningToday = (trackName: string): boolean => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const trackDays = trackSchedule[trackName] || [];
    return trackDays.includes(today);
  };
  
  // Get the next racing day for a track
  const getNextRacingDay = (trackName: string): string | null => {
    const trackDays = trackSchedule[trackName] || [];
    if (trackDays.length === 0) return null;
    
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date().getDay(); // 0 = Sunday, 6 = Saturday
    
    // Convert track days to day indices
    const trackDayIndices = trackDays.map(day => weekdays.indexOf(day));
    
    // Find the next day that has racing
    for (let i = 1; i <= 7; i++) {
      const checkDay = (today + i) % 7;
      if (trackDayIndices.includes(checkDay)) {
        return weekdays[checkDay];
      }
    }
    
    return trackDays[0]; // Fallback to first scheduled day
  };

  return {
    jobs,
    stats,
    isLoading,
    isRunningJob,
    loadJobs,
    loadStats,
    createJob,
    toggleJobStatus,
    deleteJob,
    runJobManually,
    lastRefresh,
    trackSchedule,
    isTrackRunningToday,
    getNextRacingDay
  };
};
