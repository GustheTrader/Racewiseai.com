
import React, { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Link as LinkIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { RaceResult } from '@/types/RaceResultTypes';
import { formatOTBUrl } from '../dashboard/utils/scraper-utils';
import { toast } from 'sonner';
import { TRACK_OPTIONS } from '@/types/ScraperTypes';

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

  const handleTrackChange = (value: string) => {
    setRaceTrack(value);
    
    // When track changes, update URL suggestion
    if (value && raceNumber) {
      setUrl(formatOTBUrl(value, parseInt(raceNumber)));
    }
  };

  const handleRaceNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRaceNumber(value);
    
    // When race number changes, update URL suggestion
    if (raceTrack && value) {
      setUrl(formatOTBUrl(raceTrack, parseInt(value)));
    }
  };

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

  const generateUrlSuggestion = () => {
    if (raceTrack && raceNumber) {
      return formatOTBUrl(raceTrack, parseInt(raceNumber));
    }
    return '';
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleScrapePreview} className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Results Page URL
            </label>
            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="https://app.offtrackbetting.com/#/lobby/live-racing"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="bg-betting-dark border-betting-mediumBlue text-white flex-grow"
                required
              />
              {raceTrack && raceNumber && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setUrl(generateUrlSuggestion())}
                  className="shrink-0"
                  title="Generate URL for selected track/race"
                >
                  <LinkIcon className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Enter the URL of the race results page you want to import
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Track Name
              </label>
              {trackName ? (
                <Input 
                  value={trackName} 
                  disabled 
                  className="bg-betting-dark border-betting-mediumBlue text-white"
                />
              ) : (
                <Select value={raceTrack} onValueChange={handleTrackChange}>
                  <SelectTrigger className="bg-betting-dark border-betting-mediumBlue text-white">
                    <SelectValue placeholder="Select track" />
                  </SelectTrigger>
                  <SelectContent className="bg-betting-dark border-betting-mediumBlue text-white">
                    {TRACK_OPTIONS.map(track => (
                      <SelectItem key={track.value} value={track.value}>
                        {track.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Race Number
              </label>
              <Input
                type="number"
                placeholder="Race number"
                value={raceNumber}
                onChange={handleRaceNumberChange}
                min="1"
                className="bg-betting-dark border-betting-mediumBlue text-white"
              />
            </div>
          </div>
        </div>
        
        <Button 
          type="submit" 
          disabled={isImporting || !url}
          className="w-full"
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
      
      {previewData && (
        <Card className="bg-betting-dark border-betting-mediumBlue">
          <CardContent className="pt-4">
            <h3 className="text-lg font-medium mb-3">Preview of Scraped Results</h3>
            
            <div className="bg-betting-navyBlue p-4 rounded-md overflow-auto max-h-80 mb-4">
              <pre className="text-xs text-gray-300">
                {JSON.stringify(previewData, null, 2)}
              </pre>
            </div>
            
            <Button 
              onClick={handleImportResults} 
              disabled={isImporting}
              className="w-full"
            >
              Import Results to Database
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ResultsImporter;
