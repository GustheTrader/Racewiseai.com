import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Globe, 
  Loader2, 
  Play,
  Pause,
  Database,
  RefreshCw,
  Activity,
  DollarSign,
  TrendingUp,
  Clock,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface PoolData {
  pool_type: string;
  total_pool: number;
}

interface HorseOdds {
  program_number: number;
  horse_name: string;
  win_odds?: string;
  win_pool?: number;
  place_pool?: number;
  show_pool?: number;
}

interface LiveScrapedData {
  track_name: string;
  race_date: string;
  race_number: number;
  horses: HorseOdds[];
  betting_pools: PoolData[];
  scraped_at: string;
}

const OtcLiveScraperTab: React.FC = () => {
  const [isPolling, setIsPolling] = useState(false);
  const [pollingInterval, setPollingInterval] = useState(20);
  const [url, setUrl] = useState('');
  const [trackName, setTrackName] = useState('');
  const [raceNumber, setRaceNumber] = useState(1);
  const [lastData, setLastData] = useState<LiveScrapedData | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScraping, setIsScraping] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev].slice(0, 50));
  }, []);

  const scrapeData = useCallback(async () => {
    if (!url) {
      setError('URL is required');
      return;
    }

    setIsScraping(true);
    setError(null);
    addLog(`Scraping ${url}...`);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('scrape-with-gemini', {
        body: { url, track_name: trackName || undefined }
      });

      if (fnError) throw fnError;

      if (data?.success) {
        setLastData(data.data);
        setLastUpdate(new Date());
        addLog(`✓ Scraped ${data.data.horses?.length || 0} horses, ${data.data.betting_pools?.length || 0} pools`);

        // Save to Supabase
        await saveToSupabase(data.data);
      } else {
        throw new Error(data?.error || 'Scraping failed');
      }
    } catch (err: any) {
      const msg = err.message || 'Scraping failed';
      setError(msg);
      addLog(`✗ Error: ${msg}`);
      toast.error(msg);
    } finally {
      setIsScraping(false);
    }
  }, [url, trackName, addLog]);

  const saveToSupabase = async (data: LiveScrapedData) => {
    try {
      const raceDate = data.race_date || new Date().toISOString().split('T')[0];

      // Save odds data
      for (const horse of data.horses || []) {
        await supabase
          .from('odds_data')
          .upsert({
            track_name: data.track_name,
            race_number: data.race_number || raceNumber,
            race_date: raceDate,
            horse_number: horse.program_number,
            horse_name: horse.horse_name,
            win_odds: horse.win_odds,
            pool_data: {
              win_pool: horse.win_pool,
              place_pool: horse.place_pool,
              show_pool: horse.show_pool,
              scraped_at: data.scraped_at
            }
          }, { onConflict: 'track_name,race_number,race_date,horse_number' });
      }

      // Save betting pools
      for (const pool of data.betting_pools || []) {
        await supabase
          .from('betting_pools')
          .insert({
            race_id: `${data.track_name}-${data.race_number || raceNumber}-${raceDate}`,
            pool_type: pool.pool_type,
            total_pool: pool.total_pool,
            timestamp: new Date().toISOString()
          });
      }

      addLog(`💾 Saved to Supabase`);
    } catch (err: any) {
      addLog(`⚠ Save error: ${err.message}`);
    }
  };

  const startPolling = useCallback(() => {
    if (!url) {
      toast.error('Please enter a URL first');
      return;
    }

    setIsPolling(true);
    addLog(`Started polling every ${pollingInterval}s`);
    toast.success(`Live scraping started (${pollingInterval}s interval)`);

    // Immediate first scrape
    scrapeData();

    // Set up interval
    pollingRef.current = setInterval(() => {
      scrapeData();
    }, pollingInterval * 1000);
  }, [url, pollingInterval, scrapeData, addLog]);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    setIsPolling(false);
    addLog('Stopped polling');
    toast.info('Live scraping stopped');
  }, [addLog]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20">
          <Globe className="h-6 w-6 text-green-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">OTC Live Scraper</h2>
          <p className="text-sm text-muted-foreground">Real-time odds & pool scraping with Gemini AI</p>
        </div>
        {isPolling && (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 animate-pulse">
            <Activity className="h-3 w-3 mr-1" />
            LIVE
          </Badge>
        )}
      </div>

      {/* Configuration Card */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <RefreshCw className="h-4 w-4" />
            Scraper Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="url">OTB URL</Label>
              <Input
                id="url"
                placeholder="https://offtrackbetting.com/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isPolling}
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="track">Track Name (optional)</Label>
              <Input
                id="track"
                placeholder="e.g., Santa Anita"
                value={trackName}
                onChange={(e) => setTrackName(e.target.value)}
                disabled={isPolling}
                className="bg-background"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="race">Race Number</Label>
              <Input
                id="race"
                type="number"
                min={1}
                max={15}
                value={raceNumber}
                onChange={(e) => setRaceNumber(parseInt(e.target.value) || 1)}
                disabled={isPolling}
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="interval">Interval (seconds)</Label>
              <Input
                id="interval"
                type="number"
                min={10}
                max={300}
                value={pollingInterval}
                onChange={(e) => setPollingInterval(parseInt(e.target.value) || 20)}
                disabled={isPolling}
                className="bg-background"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 pt-2">
            {!isPolling ? (
              <Button 
                onClick={startPolling}
                disabled={!url || isScraping}
                className="gap-2 bg-green-600 hover:bg-green-700"
              >
                <Play className="h-4 w-4" />
                Start Live Scraping
              </Button>
            ) : (
              <Button 
                onClick={stopPolling}
                variant="destructive"
                className="gap-2"
              >
                <Pause className="h-4 w-4" />
                Stop Scraping
              </Button>
            )}

            <Button
              variant="outline"
              onClick={scrapeData}
              disabled={!url || isScraping}
              className="gap-2"
            >
              {isScraping ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Manual Scrape
            </Button>

            {lastUpdate && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground ml-auto">
                <Clock className="h-4 w-4" />
                Last: {lastUpdate.toLocaleTimeString()}
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 rounded-lg p-3">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Live Data Display */}
      {lastData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Odds Table */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4 text-green-400" />
                Live Odds - {lastData.track_name} R{lastData.race_number}
              </CardTitle>
              <CardDescription>
                {lastData.horses?.length || 0} horses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[350px]">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="w-[40px]">#</TableHead>
                      <TableHead>Horse</TableHead>
                      <TableHead>Odds</TableHead>
                      <TableHead className="text-right">Win</TableHead>
                      <TableHead className="text-right">Place</TableHead>
                      <TableHead className="text-right">Show</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lastData.horses?.map((horse) => (
                      <TableRow key={horse.program_number}>
                        <TableCell>
                          <Badge className="bg-primary/20 text-primary">
                            {horse.program_number}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {horse.horse_name}
                        </TableCell>
                        <TableCell className="font-mono font-bold text-green-400">
                          {horse.win_odds || '-'}
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {horse.win_pool ? formatCurrency(horse.win_pool) : '-'}
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {horse.place_pool ? formatCurrency(horse.place_pool) : '-'}
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {horse.show_pool ? formatCurrency(horse.show_pool) : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Pool Totals */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <DollarSign className="h-4 w-4 text-yellow-400" />
                Pool Totals
              </CardTitle>
              <CardDescription>
                Exotic betting pools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[350px]">
                <div className="space-y-2">
                  {lastData.betting_pools?.map((pool, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <span className="font-medium text-foreground">{pool.pool_type}</span>
                      <span className="font-mono font-bold text-green-400">
                        {formatCurrency(pool.total_pool)}
                      </span>
                    </div>
                  ))}
                  {(!lastData.betting_pools || lastData.betting_pools.length === 0) && (
                    <div className="text-center text-muted-foreground py-8">
                      No pool data available
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Activity Log */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4" />
              Activity Log
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setLogs([])}
              disabled={logs.length === 0}
            >
              Clear
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[150px]">
            <div className="font-mono text-xs space-y-1">
              {logs.length === 0 ? (
                <div className="text-muted-foreground italic">No activity yet</div>
              ) : (
                logs.map((log, idx) => (
                  <div key={idx} className="text-muted-foreground">
                    {log}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default OtcLiveScraperTab;
