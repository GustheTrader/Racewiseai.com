
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format, formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Clock, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const ScheduledJobsMonitor = () => {
  const [nextRun, setNextRun] = useState<string | null>(null);
  const [lastRun, setLastRun] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [operatingHours, setOperatingHours] = useState<string>('');
  const [entriesSchedule, setEntriesSchedule] = useState<string>('');

  const fetchCronStatus = async () => {
    setIsLoading(true);
    try {
      // Calculate the next run time based on the current time
      const now = new Date();
      
      // For next run, we use 1 minute for high-frequency jobs
      const nextRunDate = new Date(now);
      nextRunDate.setSeconds(0);
      nextRunDate.setMinutes(nextRunDate.getMinutes() + 1);
      
      setNextRun(nextRunDate.toISOString());
      
      // Set operating hours info
      setOperatingHours('8:00 AM - 12:00 AM Eastern Time');
      
      // Set entries schedule info
      setEntriesSchedule('8:00 AM, 9:00 AM, 10:00 AM Eastern Time');

      // Get the last run information from scrape_jobs
      const { data: jobsData, error: jobsError } = await supabase
        .from('scrape_jobs')
        .select('last_run_at')
        .order('last_run_at', { ascending: false })
        .limit(1);

      if (jobsError) throw jobsError;

      if (jobsData && jobsData.length > 0 && jobsData[0].last_run_at) {
        setLastRun(jobsData[0].last_run_at);
      }
    } catch (error) {
      console.error('Error fetching cron status:', error);
      toast.error('Failed to fetch scheduled job information');
    } finally {
      setIsLoading(false);
    }
  };

  const triggerManualRun = async () => {
    setIsRefreshing(true);
    try {
      const { error } = await supabase.functions.invoke('scheduled-scrape', {
        body: { force: true }
      });
      
      if (error) {
        throw error;
      }
      
      toast.success('Scheduled scrape triggered manually');
      
      // Wait a few seconds before refreshing data to allow the function to complete
      setTimeout(() => {
        fetchCronStatus();
      }, 3000);
    } catch (error) {
      console.error('Error triggering scheduled scrape:', error);
      toast.error('Failed to trigger scheduled scrape');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCronStatus();
    
    // Refresh status every minute
    const interval = setInterval(fetchCronStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="bg-betting-navyBlue border-betting-mediumBlue">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-betting-skyBlue" />
          Scheduled Scraping
        </CardTitle>
        <CardDescription className="text-gray-400">
          Status of automated race data scraping
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-betting-skyBlue" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-betting-darkBlue p-4 rounded-lg">
                <div className="text-sm text-gray-400">Next Scheduled Run</div>
                <div className="flex items-center space-x-2 mt-1">
                  <Calendar className="h-4 w-4 text-betting-vividPurple" />
                  <div className="text-lg font-semibold text-white">
                    {nextRun ? format(new Date(nextRun), 'MMM d, h:mm a') : 'Not scheduled'}
                  </div>
                </div>
                {nextRun && (
                  <div className="text-xs text-gray-400 mt-1">
                    {formatDistanceToNow(new Date(nextRun), { addSuffix: true })}
                  </div>
                )}
              </div>
              
              <div className="bg-betting-darkBlue p-4 rounded-lg">
                <div className="text-sm text-gray-400">Last Execution</div>
                <div className="flex items-center space-x-2 mt-1">
                  <Calendar className="h-4 w-4 text-betting-skyBlue" />
                  <div className="text-lg font-semibold text-white">
                    {lastRun ? format(new Date(lastRun), 'MMM d, h:mm a') : 'Never'}
                  </div>
                </div>
                {lastRun && (
                  <div className="text-xs text-gray-400 mt-1">
                    {formatDistanceToNow(new Date(lastRun), { addSuffix: true })}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                onClick={triggerManualRun}
                disabled={isRefreshing}
                className="flex items-center gap-2"
              >
                {isRefreshing && <Loader2 className="h-4 w-4 animate-spin" />}
                Run Scheduled Scrape Now
              </Button>
            </div>
            
            <div className="text-sm text-gray-400 space-y-2">
              <div className="bg-betting-darkBlue p-3 rounded-lg">
                <p><span className="font-semibold">Regular Scraping:</span> Odds and will-pays run every minute, results every 15 minutes</p>
                <p><span className="font-semibold">Operating hours:</span> {operatingHours}</p>
              </div>
              
              <div className="bg-gradient-to-r from-betting-darkBlue to-betting-navyBlue/80 p-3 rounded-lg border-l-4 border-betting-vividPurple">
                <p className="font-semibold text-betting-vividPurple">Morning Entries Scraping</p>
                <p className="text-xs mt-1">Daily entries (horses, ML odds, jockeys, trainers) at {entriesSchedule}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ScheduledJobsMonitor;
