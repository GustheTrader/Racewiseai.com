
import React, { useState, useEffect } from 'react';
import { useRaceData } from '../hooks/useRaceData';
import { createMockDataStructure, getCurrentRaceData } from '../utils/dataHelpers';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import useDataUpdateManager from '../components/dashboard/DataUpdateManager';
import DashboardContent from '../components/dashboard/DashboardContent';
import RealtimeStatusIndicator from '../components/dashboard/RealtimeStatusIndicator';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Database, Globe } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { horses, races, tracks, isLoading: dataLoading } = useRaceData();
  const [data, setData] = useState(createMockDataStructure([], [], []));
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);
  const [currentTrack, setCurrentTrack] = useState("CHURCHILL DOWNS");
  const [currentRace, setCurrentRace] = useState(7);

  // Update data when Supabase data loads
  useEffect(() => {
    if (!dataLoading && horses.length > 0) {
      setData(createMockDataStructure(horses, races, tracks));
    }
  }, [horses, races, tracks, dataLoading]);
  
  // Use our custom hook for data updates
  const { nextUpdateIn, isLoading, refreshData } = useDataUpdateManager({
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
      subtitle={
        <div className="flex items-center gap-4">
          <span>Live race track odds and pool movement dashboard</span>
          <RealtimeStatusIndicator />
        </div>
      }
      extraButtons={
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => navigate("/statpal")}
            className="flex items-center gap-2 border-betting-tertiaryPurple bg-betting-darkPurple hover:bg-betting-tertiaryPurple/20"
          >
            <Globe className="h-4 w-4" />
            Statpal Live Data
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate("/results")}
            className="flex items-center gap-2 border-betting-tertiaryPurple bg-betting-darkPurple hover:bg-betting-tertiaryPurple/20"
          >
            <Database className="h-4 w-4" />
            Race Results
          </Button>
        </div>
      }
    >
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
