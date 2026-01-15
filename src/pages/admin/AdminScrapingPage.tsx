import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useScrapeJobs } from '@/hooks/useScrapeJobs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Loader2, RefreshCw, Flame, Globe, CheckCircle2, 
  ChevronRight, Save, X, Zap, Sun, Moon, Play
} from 'lucide-react';
import ScrapedRaceCard from '@/components/admin/ScrapedRaceCard';
import StatsCards from '@/components/admin/stats/StatsCards';
import JobsTable from '@/components/admin/jobs/JobsTable';
import CreateJobDialog from '@/components/admin/jobs/CreateJobDialog';
import ActiveJobsList from '@/components/admin/ActiveJobsList';

const OTB_TRACKS = [
  { name: 'Turfway Park', code: 'TP', page: 'turfway_park', state: 'Kentucky', enabled: true },
  { name: 'Santa Anita Park', code: 'SA', page: 'santa_anita_park', state: 'California', enabled: true },
  { name: 'Gulfstream Park', code: 'GP', page: 'gulfstream_park', state: 'Florida', enabled: false },
  { name: 'Churchill Downs', code: 'CD', page: 'churchill_downs', state: 'Kentucky', enabled: false },
  { name: 'Aqueduct', code: 'AQU', page: 'aqueduct', state: 'New York', enabled: false },
  { name: 'Del Mar', code: 'DMR', page: 'del_mar', state: 'California', enabled: false },
  { name: 'Saratoga', code: 'SAR', page: 'saratoga_race_course', state: 'New York', enabled: false },
  { name: 'Belmont Park', code: 'BEL', page: 'belmont_park', state: 'New York', enabled: false },
  { name: 'Oaklawn Park', code: 'OP', page: 'oaklawn_park', state: 'Arkansas', enabled: false },
  { name: 'Keeneland', code: 'KEE', page: 'keeneland', state: 'Kentucky', enabled: false },
];

const AdminScrapingPage: React.FC = () => {
  const [enabledTracks, setEnabledTracks] = useState<Set<string>>(
    new Set(OTB_TRACKS.filter(t => t.enabled).map(t => t.name))
  );
  const [selectedTrack, setSelectedTrack] = useState(OTB_TRACKS[0].name);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scrapeMode, setScrapeMode] = useState<'morning' | 'live'>('morning');
  const [scrapeResult, setScrapeResult] = useState<any>(null);
  const [expandedRaces, setExpandedRaces] = useState<Set<number>>(new Set());
  const [allLiveOdds, setAllLiveOdds] = useState<Record<number, Record<string, any>>>({});
  const [lastOddsUpdate, setLastOddsUpdate] = useState<string | null>(null);
  const [isFetchingAllOdds, setIsFetchingAllOdds] = useState(false);
  const [isSavingReport, setIsSavingReport] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { 
    jobs, 
    stats,
    isLoading,
    loadJobs,
    loadStats,
    createJob,
    toggleJobStatus,
    deleteJob,
    runJobManually,
    isRunningJob 
  } = useScrapeJobs();

  // Setup realtime subscription for scrape_jobs
  useEffect(() => {
    const channel = supabase
      .channel('scrape-jobs-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'scrape_jobs'
      }, (payload) => {
        console.log('[REALTIME] scrape_jobs update:', payload);
        loadJobs();
        loadStats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadJobs, loadStats]);

  const handleFirecrawlScrape = async () => {
    setIsProcessing(true);
    setScrapeResult(null);
    
    try {
      const trackConfig = OTB_TRACKS.find(t => t.name === selectedTrack);
      if (!trackConfig) throw new Error('Track not found');

      const { data, error } = await supabase.functions.invoke('firecrawl-morning-report', {
        body: { 
          trackName: selectedTrack,
          trackCode: trackConfig.code,
          trackPage: trackConfig.page
        }
      });

      if (error) throw error;

      if (data.success) {
        setScrapeResult(data.data);
        toast.success(`Morning report: ${data.data.races?.length || 0} races from ${selectedTrack}`);
      } else {
        throw new Error(data.error || 'Scrape failed');
      }
    } catch (err: any) {
      console.error('Morning report error:', err);
      toast.error(err.message || 'Failed to scrape morning report');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLiveOddsScrape = async () => {
    if (!scrapeResult?.races?.length) {
      toast.error('Run morning report first to get race list');
      return;
    }

    const trackConfig = OTB_TRACKS.find(t => t.name === selectedTrack);
    if (!trackConfig) return;

    setIsFetchingAllOdds(true);
    const newOddsMap: Record<number, Record<string, any>> = {};
    let successCount = 0;

    try {
      const promises = scrapeResult.races.map(async (race: any) => {
        try {
          const { data, error } = await supabase.functions.invoke('firecrawl-live-odds', {
            body: {
              trackName: scrapeResult.trackName,
              trackCode: trackConfig.code,
              trackPage: trackConfig.page,
              raceNumber: race.raceNumber
            }
          });

          if (!error && data.success && data.data?.horses) {
            const oddsMap: Record<string, any> = {};
            data.data.horses.forEach((h: any) => {
              oddsMap[h.programNumber] = h;
            });
            newOddsMap[race.raceNumber] = oddsMap;
            successCount++;
          }
        } catch (err) {
          console.error(`Error fetching odds for race ${race.raceNumber}:`, err);
        }
      });

      await Promise.all(promises);
      
      setAllLiveOdds(newOddsMap);
      setLastOddsUpdate(new Date().toLocaleTimeString());
      toast.success(`Live odds updated: ${successCount}/${scrapeResult.races.length} races`);
    } catch (err) {
      console.error('Error fetching live odds:', err);
      toast.error('Failed to fetch live odds');
    } finally {
      setIsFetchingAllOdds(false);
    }
  };

  const saveToDatabase = async () => {
    if (!scrapeResult?.races?.length) {
      toast.error('No scraped data to save');
      return;
    }

    setIsSavingReport(true);
    try {
      const raceDate = scrapeResult.raceDate || new Date().toISOString().split('T')[0];
      
      const racesWithLiveOdds = scrapeResult.races.map((race: any) => ({
        ...race,
        horses: race.horses?.map((horse: any) => ({
          ...horse,
          liveOdds: allLiveOdds[race.raceNumber]?.[horse.programNumber]?.currentOdds || null
        }))
      }));

      const reportData = {
        trackName: scrapeResult.trackName,
        raceDate,
        races: racesWithLiveOdds,
        scrapedAt: scrapeResult.scrapedAt,
        liveOddsUpdatedAt: lastOddsUpdate,
        snapshotAt: new Date().toISOString()
      };

      const totalHorses = racesWithLiveOdds.reduce((acc: number, race: any) => 
        acc + (race.horses?.length || 0), 0
      );

      const { error } = await supabase
        .from('morning_reports')
        .insert({
          track_name: scrapeResult.trackName,
          race_date: raceDate,
          races_found: scrapeResult.races.length,
          horses_found: totalHorses,
          raw_data: reportData,
          status: 'success',
          scraped_at: new Date().toISOString()
        });

      if (error) throw error;

      toast.success(`Saved: ${scrapeResult.races.length} races, ${totalHorses} horses`);
    } catch (err: any) {
      console.error('Error saving:', err);
      toast.error(err.message || 'Failed to save');
    } finally {
      setIsSavingReport(false);
    }
  };

  const toggleRaceExpanded = (raceNum: number) => {
    setExpandedRaces(prev => {
      const newSet = new Set(prev);
      if (newSet.has(raceNum)) newSet.delete(raceNum);
      else newSet.add(raceNum);
      return newSet;
    });
  };

  return (
    <div className="space-y-6">
      {/* Mode Toggle & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                Scrape Mode
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={scrapeMode === 'morning' ? 'default' : 'outline'}
                  onClick={() => setScrapeMode('morning')}
                  className="flex items-center gap-2"
                >
                  <Sun className="h-4 w-4" />
                  AM Report
                </Button>
                <Button
                  variant={scrapeMode === 'live' ? 'default' : 'outline'}
                  onClick={() => setScrapeMode('live')}
                  className="flex items-center gap-2"
                >
                  <Moon className="h-4 w-4" />
                  Live Odds
                </Button>
              </div>

              <Select value={selectedTrack} onValueChange={setSelectedTrack}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Track" />
                </SelectTrigger>
                <SelectContent>
                  {OTB_TRACKS.filter(t => enabledTracks.has(t.name)).map(track => (
                    <SelectItem key={track.name} value={track.name}>
                      {track.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Collapsible>
                <CollapsibleTrigger className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground w-full">
                  <ChevronRight className="h-3 w-3" />
                  <span>Manage Tracks</span>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-3">
                  <ScrollArea className="h-40">
                    <div className="space-y-2">
                      {OTB_TRACKS.map(track => (
                        <label key={track.name} className="flex items-center gap-2 text-sm cursor-pointer p-1 rounded hover:bg-accent">
                          <input
                            type="checkbox"
                            checked={enabledTracks.has(track.name)}
                            onChange={(e) => {
                              const newSet = new Set(enabledTracks);
                              if (e.target.checked) newSet.add(track.name);
                              else {
                                newSet.delete(track.name);
                                if (selectedTrack === track.name && newSet.size > 0) {
                                  setSelectedTrack(Array.from(newSet)[0]);
                                }
                              }
                              setEnabledTracks(newSet);
                            }}
                            className="rounded"
                          />
                          <span>{track.name}</span>
                          <span className="text-muted-foreground text-xs ml-auto">{track.state}</span>
                        </label>
                      ))}
                    </div>
                  </ScrollArea>
                </CollapsibleContent>
              </Collapsible>

              {scrapeMode === 'morning' ? (
                <Button
                  onClick={handleFirecrawlScrape}
                  disabled={isProcessing}
                  className="w-full bg-amber-600 hover:bg-amber-700"
                >
                  {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Flame className="h-4 w-4 mr-2" />}
                  Firecrawl Morning Report
                </Button>
              ) : (
                <Button
                  onClick={handleLiveOddsScrape}
                  disabled={isFetchingAllOdds || !scrapeResult}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {isFetchingAllOdds ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                  Fetch Live Odds
                </Button>
              )}

              {scrapeResult && (
                <Button
                  onClick={saveToDatabase}
                  disabled={isSavingReport}
                  variant="outline"
                  className="w-full"
                >
                  {isSavingReport ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Save to Database
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <StatsCards stats={stats} isLoading={isLoading} />
        </div>
      </div>

      {/* Scraped Data Preview */}
      {scrapeResult && scrapeResult.races?.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Scraped Data Preview
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {scrapeResult.trackName} • {scrapeResult.raceDate} • {scrapeResult.races.length} races
                  {lastOddsUpdate && <span className="ml-2 text-green-400">• Odds: {lastOddsUpdate}</span>}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => {
                setScrapeResult(null);
                setAllLiveOdds({});
                setLastOddsUpdate(null);
              }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {scrapeResult.races.map((race: any) => {
                  const trackConfig = OTB_TRACKS.find(t => t.name === selectedTrack);
                  return (
                    <ScrapedRaceCard
                      key={race.raceNumber}
                      race={race}
                      isExpanded={expandedRaces.has(race.raceNumber)}
                      onToggle={() => toggleRaceExpanded(race.raceNumber)}
                      trackName={scrapeResult.trackName}
                      trackCode={trackConfig?.code}
                      trackPage={trackConfig?.page}
                      initialLiveOdds={allLiveOdds[race.raceNumber]}
                    />
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Jobs Management */}
      <Tabs defaultValue="active" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="active">Active Jobs</TabsTrigger>
            <TabsTrigger value="all">All Jobs</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => { loadJobs(); loadStats(); }}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => setIsDialogOpen(true)}>
              Create Job
            </Button>
          </div>
        </div>

        <TabsContent value="active">
          <ActiveJobsList 
            jobs={jobs.filter(j => j.is_active)} 
            onRunJob={runJobManually} 
            isRunningJob={isRunningJob} 
          />
        </TabsContent>

        <TabsContent value="all">
          <JobsTable
            jobs={jobs}
            isLoading={isLoading}
            onRunJob={runJobManually}
            onToggleJobStatus={toggleJobStatus}
            onDeleteJob={deleteJob}
            isRunningJob={isRunningJob}
          />
        </TabsContent>
      </Tabs>

      <CreateJobDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        createJob={createJob}
      />
    </div>
  );
};

export default AdminScrapingPage;
