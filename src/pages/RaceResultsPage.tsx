
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ResultsImporter from '@/components/results/ResultsImporter';
import ResultsDisplay from '@/components/results/ResultsDisplay';
import { supabase } from '@/integrations/supabase/client';
import { RaceResult } from '@/types/RaceResultTypes';
import { Loader2 } from 'lucide-react';

const RaceResultsPage: React.FC = () => {
  const { toast: toastNotification } = useToast();
  const { trackName } = useParams<{ trackName: string }>();
  const [activeTab, setActiveTab] = useState('view');
  const [results, setResults] = useState<RaceResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<RaceResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (trackName) {
      fetchResults();
    }
  }, [trackName]);

  const fetchResults = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('race_results')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (trackName && trackName !== 'all') {
        // Handle exact track name match for specific track
        query = query.eq('track_name', trackName);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      if (data) {
        console.log("Fetched race results:", data);
        setResults(data as RaceResult[]);
        if (data.length > 0 && !selectedResult) {
          setSelectedResult(data[0] as RaceResult);
        } else if (data.length === 0) {
          setSelectedResult(null);
        }
      } else {
        setResults([]);
        setSelectedResult(null);
      }
    } catch (error) {
      console.error('Error fetching results:', error);
      toast.error('Failed to fetch race results.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResultImported = (newResult: RaceResult) => {
    setResults([newResult, ...results]);
    setSelectedResult(newResult);
    setActiveTab('view');
    toast.success('Race results imported successfully.');
  };

  // Set document title
  useEffect(() => {
    document.title = `${trackName === 'all' ? 'All Tracks' : trackName} Race Results`;
  }, [trackName]);

  return (
    <div className="min-h-screen bg-gradient-radial from-betting-dark to-black p-6 text-white">
      <div className="max-w-6xl mx-auto">
        <header className="mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-600">
              {trackName === 'all' ? 'All Tracks' : trackName} Results
            </h1>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => window.location.href = "/"}>
                Back to Dashboard
              </Button>
            </div>
          </div>
          <p className="text-gray-400 mt-2">
            View and import race results
          </p>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="view">View Results</TabsTrigger>
            <TabsTrigger value="import">Import Results</TabsTrigger>
          </TabsList>
          
          <TabsContent value="view">
            <Card className="bg-betting-navyBlue border-betting-mediumBlue">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Race Results
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResultsDisplay 
                  results={results}
                  selectedResult={selectedResult}
                  setSelectedResult={setSelectedResult}
                  onRefresh={fetchResults}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="import">
            <Card className="bg-betting-navyBlue border-betting-mediumBlue">
              <CardHeader>
                <CardTitle>Import Results from Web</CardTitle>
              </CardHeader>
              <CardContent>
                <ResultsImporter 
                  trackName={trackName === 'all' ? '' : trackName || ''}
                  onResultImported={handleResultImported}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RaceResultsPage;
