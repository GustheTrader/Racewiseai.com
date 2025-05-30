
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { RaceResult } from '@/types/RaceResultTypes';
import { toast } from 'sonner';
import UrlInputSection from './importer/UrlInputSection';
import TrackRaceInputSection from './importer/TrackRaceInputSection';
import ResultsPreview from './importer/ResultsPreview';
import ImportButton from './importer/ImportButton';

interface ResultsImporterProps {
  trackName?: string;
  onResultImported: (result: RaceResult) => void;
}

const ResultsImporter: React.FC<ResultsImporterProps> = ({ 
  trackName = '',
  onResultImported 
}) => {
  const [url, setUrl] = useState('');
  const [raceTrack, setRaceTrack] = useState(trackName);
  const [raceNumber, setRaceNumber] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  const handleScrapePreview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url || !url.trim()) {
      toast.error("Please enter a valid URL");
      return;
    }
    
    setIsImporting(true);
    setPreviewData(null);
    
    try {
      // Call the scraper edge function
      const { data, error } = await supabase.functions.invoke('scrape-race-results', {
        body: { 
          url,
          trackName: raceTrack || undefined,
          raceNumber: raceNumber ? parseInt(raceNumber) : undefined
        }
      });
      
      if (error) throw error;
      
      if (!data || !data.success) {
        throw new Error(data?.error || 'Failed to scrape the URL');
      }
      
      setPreviewData(data.results);
      
      // Auto-detect track name and race number from scraped results
      if (data.results?.trackName) {
        setRaceTrack(data.results.trackName);
      }
      
      if (data.results?.raceNumber) {
        setRaceNumber(data.results.raceNumber.toString());
      }
      
      toast.success('Successfully scraped race results');
    } catch (error) {
      console.error('Error scraping results:', error);
      toast.error(error instanceof Error ? error.message : "Failed to scrape race results");
    } finally {
      setIsImporting(false);
    }
  };

  const handleImportResults = async () => {
    if (!previewData) {
      toast.error("No data to import. Please scrape a URL first.");
      return;
    }
    
    if (!raceTrack) {
      toast.error("Please select a track name");
      return;
    }
    
    if (!raceNumber) {
      toast.error("Please enter a race number");
      return;
    }
    
    setIsImporting(true);
    
    try {
      // Save the results to Supabase
      const { data, error } = await supabase
        .from('race_results')
        .insert({
          track_name: raceTrack,
          race_number: parseInt(raceNumber),
          race_date: new Date().toISOString(),
          results_data: previewData,
          source_url: url
        })
        .select()
        .single();
      
      if (error) throw error;
      
      toast.success('Race results imported successfully');
      
      onResultImported(data as RaceResult);
      
      // Reset form
      setUrl('');
      setPreviewData(null);
    } catch (error) {
      console.error('Error importing results:', error);
      toast.error(error instanceof Error ? error.message : "Failed to import race results");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleScrapePreview} className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <UrlInputSection
            url={url}
            setUrl={setUrl}
            raceTrack={raceTrack}
            raceNumber={raceNumber}
          />
          
          <TrackRaceInputSection
            trackName={trackName}
            raceTrack={raceTrack}
            setRaceTrack={setRaceTrack}
            raceNumber={raceNumber}
            setRaceNumber={setRaceNumber}
            setUrl={setUrl}
          />
        </div>
        
        <Button 
          type="submit" 
          disabled={isImporting || !url}
          className="w-full bg-orange-500 hover:bg-orange-600"
        >
          {isImporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Scraping...
            </>
          ) : (
            'Scrape Results'
          )}
        </Button>
      </form>
      
      <ResultsPreview previewData={previewData} />
      
      <ImportButton
        onClick={handleImportResults}
        disabled={isImporting}
        isImporting={isImporting}
        hasPreviewData={!!previewData}
      />
    </div>
  );
};

export default ResultsImporter;
