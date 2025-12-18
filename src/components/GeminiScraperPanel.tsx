import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface ScraperStats {
  races_inserted: number;
  horses_inserted: number;
  duration_ms: number;
}

interface ScrapedRaceData {
  track_name: string;
  race_date: string;
  race_number: number;
  horses: any[];
  betting_pools?: any[];
}

const GeminiScraperPanel: React.FC = () => {
  const [url, setUrl] = useState('');
  const [trackName, setTrackName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<ScraperStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<ScrapedRaceData | null>(null);

  const TRACK_OPTIONS = [
    { value: 'BELMONT PARK', label: 'Belmont Park' },
    { value: 'CHURCHILL DOWNS', label: 'Churchill Downs' },
    { value: 'AQUEDUCT', label: 'Aqueduct' },
    { value: 'GULFSTREAM', label: 'Gulfstream Park' },
    { value: 'DEL MAR', label: 'Del Mar' },
    { value: 'KEENELAND', label: 'Keeneland' },
    { value: 'OAKLAWN PARK', label: 'Oaklawn Park' },
    { value: 'PIMLICO', label: 'Pimlico' },
    { value: 'SARATOGA', label: 'Saratoga' },
    { value: 'SANTA ANITA', label: 'Santa Anita' },
  ];

  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) {
      toast.error('Please enter a URL');
      return;
    }

    setIsLoading(true);
    setError(null);
    setPreviewData(null);
    setStats(null);

    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please log in to use the scraper');
        return;
      }

      // Step 1: Scrape with Gemini
      console.log('Starting Gemini scrape...');
      const { data: scrapeResult, error: scrapeError } = await supabase.functions.invoke(
        'scrape-with-gemini',
        {
          body: {
            url: url.trim(),
            track_name: trackName || undefined,
          },
        }
      );

      if (scrapeError) {
        throw new Error(scrapeError.message || 'Scraping failed');
      }

      if (!scrapeResult?.success) {
        throw new Error(scrapeResult?.error || 'Scraping failed');
      }

      console.log('Scrape successful:', scrapeResult);
      setPreviewData(scrapeResult.data);

      // Step 2: Save to Supabase
      console.log('Saving data to Supabase...');
      const { data: saveResult, error: saveError } = await supabase.functions.invoke(
        'save-scraped-data',
        {
          body: {
            raceData: scrapeResult.data,
            sourceUrl: url.trim(),
          },
        }
      );

      if (saveError) {
        throw new Error(saveError.message || 'Failed to save data');
      }

      if (!saveResult?.success) {
        throw new Error(saveResult?.error || 'Failed to save data');
      }

      console.log('Data saved:', saveResult);
      setStats(saveResult.stats);

      toast.success(
        `✅ Successfully scraped and saved! ${saveResult.stats.horses_inserted} horses from ${saveResult.stats.races_inserted} race(s)`
      );
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred during scraping';
      setError(errorMessage);
      console.error('Scraper error:', err);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-betting-navyBlue border-betting-mediumBlue">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🤖 Gemini Powered Scraper</span>
            <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
              Gemini 2.0 Flash
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleScrape} className="space-y-4">
            {/* Track Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Track Name (Optional)
              </label>
              <Select value={trackName} onValueChange={setTrackName}>
                <SelectTrigger className="bg-betting-dark border-betting-tertiaryPurple text-white">
                  <SelectValue placeholder="Select a track or enter URL" />
                </SelectTrigger>
                <SelectContent className="bg-betting-dark border-betting-tertiaryPurple text-white">
                  {TRACK_OPTIONS.map(track => (
                    <SelectItem key={track.value} value={track.value}>
                      {track.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-400 mt-1">
                Auto-detected from URL if not selected
              </p>
            </div>

            {/* URL Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Off-Track Betting URL
              </label>
              <Input
                type="url"
                placeholder="https://www.offtrackbetting.com/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="bg-betting-dark border-betting-tertiaryPurple text-white"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-400 mt-1">
                Enter the URL of the race page you want to scrape
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex gap-2 p-3 bg-red-900/20 border border-red-700 rounded text-red-300 text-sm">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>{error}</div>
              </div>
            )}

            {/* Scrape Button */}
            <Button
              type="submit"
              disabled={isLoading || !url.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scraping with Gemini...
                </>
              ) : (
                '🚀 Scrape Race Data'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Preview Data */}
      {previewData && (
        <Card className="bg-betting-darkPurple border-4 border-betting-tertiaryPurple">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Scraped Race Data Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Race Info */}
            <div className="grid grid-cols-2 gap-4 p-3 bg-betting-dark rounded border border-betting-mediumBlue">
              <div>
                <div className="text-xs text-gray-400">Track</div>
                <div className="font-semibold text-white">{previewData.track_name}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Race Date</div>
                <div className="font-semibold text-white">{previewData.race_date}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Race Number</div>
                <div className="font-semibold text-white">Race {previewData.race_number}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Horses Extracted</div>
                <div className="font-semibold text-white">{previewData.horses?.length || 0}</div>
              </div>
            </div>

            {/* Horses Table */}
            {previewData.horses && previewData.horses.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-2">Horses</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-gray-300 border border-betting-mediumBlue rounded">
                    <thead className="bg-betting-dark border-b border-betting-mediumBlue">
                      <tr>
                        <th className="px-2 py-1 text-left">#</th>
                        <th className="px-2 py-1 text-left">Horse Name</th>
                        <th className="px-2 py-1 text-left">Jockey</th>
                        <th className="px-2 py-1 text-left">ML Odds</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.horses.slice(0, 10).map((horse, idx) => (
                        <tr key={idx} className="border-b border-betting-mediumBlue hover:bg-betting-dark/50">
                          <td className="px-2 py-1">{horse.program_number}</td>
                          <td className="px-2 py-1 font-medium">{horse.horse_name}</td>
                          <td className="px-2 py-1">{horse.jockey_name || '-'}</td>
                          <td className="px-2 py-1">{horse.morning_line || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Stats */}
            {stats && (
              <div className="mt-4 p-3 bg-green-900/20 border border-green-700 rounded">
                <div className="text-sm text-green-300">
                  <div>✅ {stats.races_inserted} race(s) saved</div>
                  <div>✅ {stats.horses_inserted} horses saved</div>
                  <div>⏱️ Completed in {stats.duration_ms}ms</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Usage Info */}
      <Card className="bg-blue-900/20 border border-blue-700">
        <CardContent className="pt-6 text-sm text-blue-200 space-y-2">
          <p>
            <strong>How it works:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Paste an Off-Track Betting race page URL</li>
            <li>Gemini 2.0 Flash AI extracts race and horse data</li>
            <li>Data is automatically saved to your database</li>
            <li>View and analyze scraped races on your dashboard</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeminiScraperPanel;
