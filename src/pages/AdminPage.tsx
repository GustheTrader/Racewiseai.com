
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import JobsTable from '@/components/admin/jobs/JobsTable';
import CreateJobDialog from '@/components/admin/jobs/CreateJobDialog';
import ActiveJobsList from '@/components/admin/ActiveJobsList';
import TrackGrid from '@/components/admin/TrackGrid';
import OddsPulseConfigTab from '@/components/admin/OddsPulseConfigTab';
import DataScraperTab from '@/components/admin/DataScraperTab';
import DataImportTab from '@/components/admin/DataImportTab';
import RaceDataManager from '@/components/RaceDataManager';
import StatsCards from '@/components/admin/stats/StatsCards';
import ConfigInfo from '@/components/admin/config/ConfigInfo';
import DemoDataGenerator from '@/components/admin/DemoDataGenerator';
import UserManagementTab from '@/components/admin/UserManagementTab';
import { DataToolboxTab } from '@/components/admin/DataToolboxTab';
import { RaceResultsTab } from '@/components/admin/RaceResultsTab';
import { useScrapeJobs } from '@/hooks/useScrapeJobs';

const AdminPage: React.FC = () => {
  const { user, isLoading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [apiUrl, setApiUrl] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');
  const [isTestMode, setIsTestMode] = useState<boolean>(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Get all the required state and functions from useScrapeJobs hook
  const {
    jobs,
    stats,
    isLoading: isJobsLoading,
    isRunningJob,
    createJob,
    toggleJobStatus,
    deleteJob,
    runJobManually
  } = useScrapeJobs();

  useEffect(() => {
    const loadApiSettings = async () => {
      // BUGFIX: Add proper error handling
      try {
        if (user) {
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
        }
      } catch (err) {
        console.error('Error loading API settings:', err);
      }
    };

    loadApiSettings();
  }, [user]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user || !isAdmin) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatsCards stats={stats} isLoading={isJobsLoading} />
      </div>

      <Tabs defaultValue="scraper">
        <TabsList className="mb-4 flex-wrap">
          <TabsTrigger value="scraper">Data Scraper</TabsTrigger>
          <TabsTrigger value="toolbox">Data Toolbox</TabsTrigger>
          <TabsTrigger value="jobs">Job Management</TabsTrigger>
          <TabsTrigger value="tracks">Track Management</TabsTrigger>
          <TabsTrigger value="raceData">Race Data</TabsTrigger>
          <TabsTrigger value="results">Race Results</TabsTrigger>
          <TabsTrigger value="oddsPulse">Odds Pulse API</TabsTrigger>
          <TabsTrigger value="import">Data Import</TabsTrigger>
          <TabsTrigger value="demo">Demo Data</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
        </TabsList>

        <div className="bg-betting-dark p-4 rounded-md border border-gray-700">
          <TabsContent value="scraper">
            <DataScraperTab />
          </TabsContent>

          <TabsContent value="toolbox">
            <DataToolboxTab />
          </TabsContent>

          <TabsContent value="jobs">
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-2">Active Jobs</h2>
              <div className="bg-betting-darkBlue border border-betting-mediumBlue p-4 rounded-md">
                <ActiveJobsList 
                  jobs={jobs} 
                  onRunJob={runJobManually} 
                  isRunningJob={isRunningJob} 
                />
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-semibold">Scheduled Jobs</h2>
                <CreateJobDialog 
                  isOpen={isDialogOpen} 
                  onOpenChange={setIsDialogOpen} 
                  createJob={createJob} 
                />
              </div>
              <JobsTable 
                jobs={jobs}
                onRunJob={runJobManually}
                onToggleJobStatus={toggleJobStatus}
                onDeleteJob={deleteJob}
                isRunningJob={isRunningJob}
                isLoading={isJobsLoading}
              />
            </div>
          </TabsContent>

          <TabsContent value="tracks">
            <TrackGrid 
              jobs={jobs} 
              onRunJob={runJobManually} 
              isRunningJob={isRunningJob} 
            />
          </TabsContent>
          
          <TabsContent value="raceData">
            <RaceDataManager />
          </TabsContent>

          <TabsContent value="results">
            <RaceResultsTab />
          </TabsContent>

          <TabsContent value="oddsPulse">
            <OddsPulseConfigTab />
          </TabsContent>

          <TabsContent value="import">
            <DataImportTab apiUrl={apiUrl} apiKey={apiKey} isTestMode={isTestMode} />
          </TabsContent>
          
          <TabsContent value="demo">
            <DemoDataGenerator />
          </TabsContent>

          <TabsContent value="users">
            <UserManagementTab />
          </TabsContent>

          <TabsContent value="config">
            {/* Note: TypeScript doesn't like forwarding all these props directly, so we use a wrapper */}
            <ConfigInfo 
              apiUrl={apiUrl} 
              setApiUrl={setApiUrl} 
              apiKey={apiKey} 
              setApiKey={setApiKey} 
              isTestMode={isTestMode}
              setIsTestMode={setIsTestMode}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default AdminPage;
