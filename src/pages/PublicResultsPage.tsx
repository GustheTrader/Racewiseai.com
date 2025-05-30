
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, LineChart, Trophy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { RaceResult } from '@/types/RaceResultTypes';
import ResultsDisplay from '@/components/results/ResultsDisplay';
import UserProfile from '@/components/UserProfile';
import AdminLink from '@/components/AdminLink';

const PublicResultsPage: React.FC = () => {
  const navigate = useNavigate();
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-radial from-betting-dark to-black p-6 text-white">
      <div className="max-w-6xl mx-auto">
        <header className="mb-6 flex justify-between items-center p-4 bg-betting-darkPurple border-4 border-betting-tertiaryPurple rounded-lg shadow-lg">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-blue-600">
              5D ODDS PULSE RESULTS
            </h1>
            <p className="text-gray-400">
              View the latest race results from major tracks
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate("/")}
              className="flex items-center gap-2 border-betting-tertiaryPurple bg-betting-darkPurple hover:bg-betting-tertiaryPurple/20"
            >
              <LineChart className="h-4 w-4" />
              Odds Dashboard
            </Button>
            <Button 
              onClick={() => navigate('/quantum-rankings')}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2 rounded-lg transform hover:scale-105 transition-all shadow-lg border-2 border-orange-400"
            >
              Quantum 5D AI Rankings
            </Button>
            <UserProfile />
          </div>
        </header>

        <div className="mb-6">
          <Card className="bg-betting-navyBlue border-betting-mediumBlue">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="mr-2 h-5 w-5 text-yellow-300" />
                Latest Race Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResultsDisplay
                results={results}
                selectedResult={selectedResult}
                setSelectedResult={setSelectedResult}
                onRefresh={fetchLatestResults}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </div>
      </div>
      <AdminLink />
    </div>
  );
};

export default PublicResultsPage;
