import React, { useState, useEffect } from 'react';
import { CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useForm } from 'react-hook-form';
import { Loader2, RefreshCw, PlusCircle, Activity } from 'lucide-react';
import { useScrapeJobs } from '@/hooks/useScrapeJobs';
import StatsCards from './stats/StatsCards';
import CreateJobDialog from './jobs/CreateJobDialog';
import JobsTable from './jobs/JobsTable';
import ConfigInfo from './config/ConfigInfo';
import TrackGrid from './TrackGrid';
import ActiveJobsList from './ActiveJobsList';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth/AuthContext';

const DataScraperTab = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [apiUrl, setApiUrl] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');
  const [isTestMode, setIsTestMode] = useState<boolean>(true);
  const { user } = useAuth();
  
  const {
    jobs,
    stats,
    isLoading,
    isRunningJob,
    loadJobs,
    loadStats,
    createJob,
    toggleJobStatus,
    deleteJob,
    runJobManually
  } = useScrapeJobs();
  
  const form = useForm({
    defaultValues: {
      url: '',
      track_name: '',
      job_type: 'odds',
      interval_seconds: 60,
      is_active: true
    }
  });

  // Load API settings from Supabase
  useEffect(() => {
    const loadApiSettings = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('api_connections')
            .select('api_url, api_key, is_test_mode')
            .eq('user_id', user.id)
            .maybeSingle();

          if (error) {
            console.error('Failed to load API settings:', error);
            return;
          }

          if (data) {
            setApiUrl(data.api_url || '');
            setApiKey(data.api_key || '');
            setIsTestMode(data.is_test_mode !== false);  // Default to true if null
          }
        } catch (err) {
          console.error('Error loading API settings:', err);
        }
      }
    };

    loadApiSettings();
  }, [user]);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      loadJobs();
      loadStats();
      setLastRefresh(new Date());
    }, 30000);
    
    return () => clearInterval(refreshInterval);
  }, [loadJobs, loadStats]);

  // Function to handle form submission to create a new job
  const handleCreateJob = async (values: any) => {
    const success = await createJob(values);
    if (success) {
      setIsDialogOpen(false);
      form.reset();
      toast.success("New scrape job created successfully");
    }
  };

  const handleManualRefresh = () => {
    loadJobs();
    loadStats();
    setLastRefresh(new Date());
    toast.success("Data refreshed successfully");
  };

  return (
    <>
      <CardHeader className="px-0 pt-0">
        <CardTitle>Off-Track Betting Data Scraper</CardTitle>
        <div className="text-gray-400 mt-2 flex items-center justify-between">
          <div>
            Configure and monitor automated scraping for odds, will pays, and results from offtrackbetting.com
          </div>
          <div className="text-xs text-gray-500 flex items-center">
            <Activity className="h-3 w-3 mr-1 text-betting-skyBlue" />
            Last Updated: {lastRefresh.toLocaleTimeString()}
          </div>
        </div>
      </CardHeader>
      
      <StatsCards stats={stats} />
      
      <div className="flex justify-between items-center mb-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-[500px] grid-cols-4">
            <TabsTrigger value="active">Active Jobs</TabsTrigger>
            <TabsTrigger value="tracks">Track Overview</TabsTrigger>
            <TabsTrigger value="jobs">All Jobs</TabsTrigger>
            <TabsTrigger value="config">Configuration</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline"
            onClick={handleManualRefresh}
            disabled={isLoading}
            className="h-8 px-3"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
          
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="h-8 px-3"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Job
          </Button>
        </div>
      </div>
      
      <TabsContent value="active" className="mt-0">
        <ActiveJobsList 
          jobs={jobs} 
          onRunJob={runJobManually} 
          isRunningJob={isRunningJob} 
        />
      </TabsContent>
      
      <TabsContent value="tracks" className="mt-0">
        <TrackGrid 
          jobs={jobs} 
          onRunJob={runJobManually} 
          isRunningJob={isRunningJob} 
        />
      </TabsContent>
      
      <TabsContent value="jobs" className="mt-0">
        <JobsTable
          jobs={jobs}
          onRunJob={runJobManually}
          onToggleJobStatus={toggleJobStatus}
          onDeleteJob={deleteJob}
          isRunningJob={isRunningJob}
        />
      </TabsContent>
      
      <TabsContent value="config" className="mt-0">
        <ConfigInfo 
          apiUrl={apiUrl}
          setApiUrl={setApiUrl}
          apiKey={apiKey}
          setApiKey={setApiKey}
          isTestMode={isTestMode}
          setIsTestMode={setIsTestMode}
        />
      </TabsContent>
      
      <CreateJobDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        createJob={createJob}
        form={form}
        onSubmit={handleCreateJob}
      />
    </>
  );
};

export default DataScraperTab;
