
import React, { useState } from 'react';
import { getMockData } from '../utils/mockData';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import useDataUpdateManager from '../components/dashboard/DataUpdateManager';
import DashboardContent from '../components/dashboard/DashboardContent';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Database, AlertTriangle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const Index = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(getMockData());
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);
  const [currentTrack, setCurrentTrack] = useState("CHURCHILL DOWNS");
  const [currentRace, setCurrentRace] = useState(7);
  
  // Use our custom hook for data updates
  const { nextUpdateIn, isLoading, refreshData, error, retryCount } = useDataUpdateManager({
    currentTrack,
    currentRace,
    onDataUpdate: (updatedData, updatedTime) => {
      setData(updatedData);
      setLastUpdated(updatedTime);
      setShowUpdateNotification(true);
      setTimeout(() => setShowUpdateNotification(false), 3000);
    }
  });

  const handleTrackChange = (track: string) => {
    setCurrentTrack(track);
  };

  const handleRaceChange = (race: number) => {
    setCurrentRace(race);
  };

  return (
    <DashboardLayout 
      title="RACEWISE AI TOOLBOX"
      subtitle="Live race track odds and pool movement dashboard"
      extraButtons={
        <Button 
          variant="outline" 
          onClick={() => navigate("/results")}
          className="flex items-center gap-2 border-betting-tertiaryPurple bg-betting-darkPurple hover:bg-betting-tertiaryPurple/20"
        >
          <Database className="h-4 w-4" />
          Race Results
        </Button>
      }
    >
      {error && (
        <Alert variant="destructive" className="mb-3 border-red-500/50 bg-red-950/40">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="flex items-center justify-between">
            <span>{retryCount > 0 ? 'Retrying data fetch…' : 'Data fetch failed'}</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => refreshData()}
              disabled={isLoading}
              className="h-7 px-2"
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Retry now
            </Button>
          </AlertTitle>
          <AlertDescription>{error} Last successful update: {lastUpdated}.</AlertDescription>
        </Alert>
      )}
      <DashboardContent 
        data={data}
        currentTrack={currentTrack}
        currentRace={currentRace}
        lastUpdated={lastUpdated}
        nextUpdateIn={nextUpdateIn}
        showUpdateNotification={showUpdateNotification}
        isLoading={isLoading}
        onRefreshData={refreshData}
        onTrackChange={handleTrackChange}
        onRaceChange={handleRaceChange}
      />
    </DashboardLayout>
  );
};

export default Index;
