
import { useState, useEffect, useCallback, useRef } from 'react';
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
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [lastSuccessAt, setLastSuccessAt] = useState<string | null>(null);

  const MAX_RETRIES = 3;

  // Use ref to store the callback to avoid dependency issues
  const onDataUpdateRef = useRef(onDataUpdate);
  onDataUpdateRef.current = onDataUpdate;

  const fetchWithRetry = useCallback(async (attempt = 0): Promise<void> => {
    setIsLoading(true);
    try {
      // In a real app, this would be an API call
      const newData = getMockData();
      if (!newData) throw new Error('No data returned from source');
      const updatedTime = new Date().toLocaleTimeString();
      onDataUpdateRef.current(newData, updatedTime);
      setNextUpdateIn(30);
      setError(null);
      setRetryCount(0);
      setLastSuccessAt(updatedTime);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error(`[DataUpdateManager] Refresh failed (attempt ${attempt + 1}):`, message);

      if (attempt < MAX_RETRIES) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, attempt) * 1000;
        setRetryCount(attempt + 1);
        setError(`Data fetch failed. Retrying in ${delay / 1000}s (attempt ${attempt + 1}/${MAX_RETRIES})...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return fetchWithRetry(attempt + 1);
      }

      setError(`Unable to fetch race data after ${MAX_RETRIES} attempts. Showing last available data. Will retry on next cycle.`);
      setNextUpdateIn(30);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshData = useCallback(() => {
    setRetryCount(0);
    return fetchWithRetry(0);
  }, [fetchWithRetry]);

  useEffect(() => {
    // Reset the timer when track or race changes
    setNextUpdateIn(30);
    setError(null);
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

  return { nextUpdateIn, isLoading, refreshData, error, retryCount, lastSuccessAt };
};

export default useDataUpdateManager;
