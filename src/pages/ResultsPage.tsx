import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RaceResult } from '@/types/RaceResultTypes';
import ResultsDisplay from '@/components/results/ResultsDisplay';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { toast } from 'sonner';

const ResultsPage: React.FC = () => {
  const [results, setResults] = useState<RaceResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<RaceResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchLatestResults();
  }, []);

  const fetchLatestResults = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('race_results')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        setResults(data as RaceResult[]);
        setSelectedResult(data[0] as RaceResult);
      }
    } catch (error) {
      console.error('Error fetching results:', error);
      toast.error('Failed to fetch race results');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout
      title="Race Results"
      subtitle="View the latest race results from major tracks"
    >
      <div className="space-y-6">
        <ResultsDisplay
          results={results}
          selectedResult={selectedResult}
          setSelectedResult={setSelectedResult}
          onRefresh={fetchLatestResults}
          isLoading={isLoading}
        />
      </div>
    </DashboardLayout>
  );
};

export default ResultsPage;
