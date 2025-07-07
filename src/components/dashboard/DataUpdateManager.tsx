
import { useState, useEffect, useCallback } from 'react';
import { getMockData } from '../../utils/mockData';

interface DataUpdateManagerProps {
  currentTrack: string;
  currentRace: number;
  onDataUpdate: (data: any, time: string) => void;
}

// This is a custom hook, not a React component
const useDataUpdateManager = ({ 
  currentTrack, 
  currentRace, 
  onDataUpdate 
}: DataUpdateManagerProps) => {
  const [nextUpdateIn, setNextUpdateIn] = useState(30);
  const [isLoading, setIsLoading] = useState(false);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      // In a real app, this would be an API call
      const newData = getMockData();
      const updatedTime = new Date().toLocaleTimeString();
      onDataUpdate(newData, updatedTime);
      setNextUpdateIn(30);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [onDataUpdate]);

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
