
import { useState, useEffect, useCallback } from 'react';
import { createMockDataStructure } from '../../utils/dataHelpers';
import { useRaceData } from '../../hooks/useRaceData';

interface DataUpdateManagerProps {
  currentTrack: string;
  currentRace: number;
  onDataUpdate: (data: any, time: string) => void;
}

const useDataUpdateManager = ({ 
  currentTrack, 
  currentRace, 
  onDataUpdate 
}: DataUpdateManagerProps) => {
  const [nextUpdateIn, setNextUpdateIn] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const { horses, races, tracks } = useRaceData();

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Create updated data structure with current Supabase data
      const newData = createMockDataStructure(horses, races, tracks);
      const updatedTime = new Date().toLocaleTimeString();
      onDataUpdate(newData, updatedTime);
      setNextUpdateIn(30);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [onDataUpdate, horses, races, tracks]);

  useEffect(() => {
    // Reset the timer when track or race changes
    setNextUpdateIn(30);
    refreshData();
  }, [currentTrack, currentRace, refreshData]);

  useEffect(() => {
    // Set up countdown timer
    const timer = setInterval(() => {
      setNextUpdateIn((prev) => {
        if (prev <= 1) {
          refreshData();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [refreshData]);

  return { nextUpdateIn, isLoading, refreshData };
};

export default useDataUpdateManager;
