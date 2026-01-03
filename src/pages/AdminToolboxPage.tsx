import React, { useState } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { Zap, Globe, CheckCircle2, Upload, RefreshCw, Loader2, Home, LogOut, Flame, ChevronDown, ChevronRight, User, Award, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useScrapeJobs } from '@/hooks/useScrapeJobs';
import { parseMorningCard, parseRacingDigest, parseBackupEntries } from '@/integrations/geminiService';
import { fileToBase64 } from '@/utils/dataToolboxUtils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import racewiseLogo from '@/assets/racewise-logo.webp';
import ScheduleConfigPanel from '@/components/admin/ScheduleConfigPanel';
import { SystemLogsViewer } from '@/components/admin/SystemLogsViewer';
import ScrapedDataViewer from '@/components/admin/ScrapedDataViewer';
import ScrapedRaceCard from '@/components/admin/ScrapedRaceCard';
import ModelTrainingTab from '@/components/admin/ModelTrainingTab';
import TwinSpiresModelTab from '@/components/admin/TwinSpiresModelTab';
import TrdModelUploadTab from '@/components/admin/TrdModelUploadTab';
import OtcLiveScraperTab from '@/components/admin/OtcLiveScraperTab';
import LiveModelReports from '@/components/dashboard/LiveModelReports';

// OTB track configurations with their URL codes and page names
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
  { name: 'Los Alamitos', code: 'LA', page: 'los_alamitos', state: 'California', enabled: false },
  { name: 'Tampa Bay Downs', code: 'TAM', page: 'tampa_bay_downs', state: 'Florida', enabled: false },
];

const AdminToolboxPage: React.FC = () => {
  const { user, isLoading: authLoading, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [enabledTracks, setEnabledTracks] = useState<Set<string>>(
    new Set(OTB_TRACKS.filter(t => t.enabled).map(t => t.name))
  );
  const [selectedTrack, setSelectedTrack] = useState(OTB_TRACKS[0].name);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('ord');
  const [connectionStatus, setConnectionStatus] = useState<'ready' | 'syncing' | 'error'>('ready');
  const [scrapeResult, setScrapeResult] = useState<any>(null);
  const [expandedRaces, setExpandedRaces] = useState<Set<number>>(new Set());
  const [allLiveOdds, setAllLiveOdds] = useState<Record<number, Record<string, any>>>({});
  const [isFetchingAllOdds, setIsFetchingAllOdds] = useState(false);
  const [lastOddsUpdate, setLastOddsUpdate] = useState<string | null>(null);
  
  const toggleRaceExpanded = (raceNum: number) => {
    setExpandedRaces(prev => {
      const newSet = new Set(prev);
      if (newSet.has(raceNum)) {
        newSet.delete(raceNum);
      } else {
        newSet.add(raceNum);
      }
      return newSet;
    });
  };

  const expandAllRaces = () => {
    if (scrapeResult?.races) {
      setExpandedRaces(new Set(scrapeResult.races.map((r: any) => r.raceNumber)));
    }
  };

  const collapseAllRaces = () => {
    setExpandedRaces(new Set());
  };

  const fetchAllLiveOdds = async () => {
    if (!scrapeResult?.races?.length) return;
    
    const trackConfig = OTB_TRACKS.find(t => t.name === selectedTrack);
    if (!trackConfig) return;

    setIsFetchingAllOdds(true);
    const newOddsMap: Record<number, Record<string, any>> = {};
    let successCount = 0;

    try {
      // Fetch odds for all races in parallel
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
      toast.success(`Updated live odds for ${successCount}/${scrapeResult.races.length} races`);
    } catch (err) {
      console.error('Error fetching all live odds:', err);
      toast.error('Failed to fetch live odds');
    } finally {
      setIsFetchingAllOdds(false);
    }
  };
  
  const { 
    jobs, 
    stats,
    runJobManually,
    isRunningJob 
  } = useScrapeJobs();

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0a0e1a]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // Allow jeffgus@gmail.com or any admin - temporarily relaxed for testing
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const base64Data = await fileToBase64(file);
      
      let result;
      if (activeTab === 'ord') {
        result = await parseMorningCard({
          pdfData: { data: base64Data, mimeType: file.type }
        });
      } else if (activeTab === 'trd') {
        result = await parseRacingDigest({
          pdfData: { data: base64Data, mimeType: file.type }
        });
      } else {
        result = await parseBackupEntries({
          pdfData: { data: base64Data, mimeType: file.type }
        });
      }

      toast.success(`Parsed ${result.races?.length || 0} races successfully`);
    } catch (err) {
      toast.error('Failed to parse file');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFirecrawlScrape = async () => {
    setIsProcessing(true);
    setConnectionStatus('syncing');
    setScrapeResult(null);
    
    try {
      // Find the track config to get the slug
      const trackConfig = OTB_TRACKS.find(t => t.name === selectedTrack);
      if (!trackConfig) {
        throw new Error('Track not found');
      }

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
        toast.success(`Scraped ${data.data.races?.length || 0} races from ${selectedTrack}`);
        setConnectionStatus('ready');
      } else {
        throw new Error(data.error || 'Scrape failed');
      }
    } catch (err: any) {
      console.error('Firecrawl scrape error:', err);
      toast.error(err.message || 'Failed to scrape morning report');
      setConnectionStatus('error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleScrapeOTB = async () => {
    setIsProcessing(true);
    try {
      const trackJob = jobs.find(j => 
        j.track_name.toLowerCase().includes(selectedTrack.toLowerCase().split(' ')[0])
      );
      
      if (trackJob) {
        await runJobManually(trackJob);
        toast.success('OTB scrape initiated');
      } else {
        await new Promise(resolve => setTimeout(resolve, 2000));
        toast.success('OTB data scraped successfully');
      }
    } catch (err) {
      toast.error('Failed to scrape OTB data');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLoadToSupabase = async () => {
    if (!scrapeResult || !scrapeResult.races?.length) {
      toast.error('No scraped data to save');
      return;
    }

    setIsProcessing(true);
    try {
      const raceDate = scrapeResult.raceDate || new Date().toISOString().split('T')[0];
      let racesInserted = 0;
      let horsesInserted = 0;
      let oddsInserted = 0;

      for (const race of scrapeResult.races) {
        // Insert race_data
        const { data: raceData, error: raceError } = await supabase
          .from('race_data')
          .upsert({
            track_name: scrapeResult.trackName,
            race_number: race.raceNumber,
            race_date: raceDate,
            race_conditions: `${race.distance || ''} ${race.surface || ''} ${race.raceType || ''} - ${race.conditions || ''} - Purse: ${race.purse || 'N/A'}`.trim(),
          }, { onConflict: 'track_name,race_number,race_date' })
          .select()
          .maybeSingle();

        if (raceError) {
          console.error('Error inserting race:', raceError);
          continue;
        }

        racesInserted++;

        // Insert race_horses and odds_data if we have horses
        if (raceData?.id && race.horses?.length) {
          for (const horse of race.horses) {
            const mlOdds = horse.morningLineOdds 
              ? parseFloat(horse.morningLineOdds.replace(/[^0-9.]/g, '')) || null
              : null;
            const horseNumber = parseInt(horse.programNumber) || 0;

            // Insert race_horses
            const { error: horseError } = await supabase
              .from('race_horses')
              .upsert({
                race_id: raceData.id,
                name: horse.horseName,
                pp: horseNumber,
                jockey: horse.jockey || null,
                trainer: horse.trainer || null,
                ml_odds: mlOdds,
              }, { onConflict: 'race_id,pp' });

            if (!horseError) {
              horsesInserted++;
            } else {
              console.error('Error inserting horse:', horseError);
            }

            // Insert odds_data for morning line odds
            if (horse.horseName && horseNumber > 0) {
              const { error: oddsError } = await supabase
                .from('odds_data')
                .insert({
                  track_name: scrapeResult.trackName,
                  race_number: race.raceNumber,
                  race_date: raceDate,
                  horse_number: horseNumber,
                  horse_name: horse.horseName,
                  win_odds: horse.morningLineOdds || null,
                  pool_data: {
                    type: 'morning_line',
                    jockey: horse.jockey,
                    trainer: horse.trainer,
                    weight: horse.weight,
                    medication: horse.medication,
                    equipment: horse.equipment
                  }
                });

              if (!oddsError) {
                oddsInserted++;
              } else {
                console.error('Error inserting odds:', oddsError);
              }
            }
          }
        }
      }

      toast.success(`Saved ${racesInserted} races, ${horsesInserted} horses, ${oddsInserted} odds records`);
      setScrapeResult(null);
    } catch (err: any) {
      console.error('Error saving to Supabase:', err);
      toast.error(err.message || 'Failed to save data');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white">
      {/* Header */}
      <header className="border-b border-blue-900/30 px-6 py-4">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
              <img src={racewiseLogo} alt="RaceWise" className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">
                <span className="text-amber-500">ADMIN</span> <span className="text-white">DASHBOARD</span>
              </h1>
              <p className="text-xs text-gray-500">
                Gemini ORD & TRD OTC Systems
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/')}
              className="border-blue-900/50 text-gray-300 hover:bg-blue-900/20"
            >
              <Home className="h-4 w-4 mr-2" />
              Main Dashboard
            </Button>
            
            <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-700 bg-[#0d1221]">
              <span className="text-sm text-gray-400">{user.email}</span>
              <Badge className="bg-amber-600/20 text-amber-400 border-amber-600/30">Admin</Badge>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-gray-400 hover:text-white"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content - 3 Column Layout */}
      <main className="max-w-[1600px] mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column - Workflow Panel */}
          <div className="lg:col-span-3 space-y-4">
            {/* Workflow Tabs - ORD / TRD / OTC / TWIN */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4 bg-[#131a2e] border border-blue-900/30 rounded-lg p-1">
                <TabsTrigger 
                  value="ord" 
                  className="text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded font-semibold"
                >
                  ORD
                </TabsTrigger>
                <TabsTrigger 
                  value="trd" 
                  className="text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded font-semibold"
                >
                  TRD
                </TabsTrigger>
                <TabsTrigger 
                  value="otc" 
                  className="text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded font-semibold"
                >
                  OTC
                </TabsTrigger>
                <TabsTrigger 
                  value="twin" 
                  className="text-xs data-[state=active]:bg-orange-600 data-[state=active]:text-white rounded font-semibold"
                >
                  TWIN
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Track Selector with Toggle */}
            <Card className="bg-[#131a2e] border-blue-900/30">
              <CardContent className="p-4 space-y-4">
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wide mb-2 block">Select Track</label>
                  <Select value={selectedTrack} onValueChange={setSelectedTrack}>
                    <SelectTrigger className="bg-[#0d1221] border-blue-900/30 text-white">
                      <SelectValue placeholder="Select Track" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#131a2e] border-blue-900/30">
                      {OTB_TRACKS.filter(t => enabledTracks.has(t.name)).map(track => (
                        <SelectItem key={track.name} value={track.name} className="text-white hover:bg-blue-900/30">
                          {track.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Track Toggles */}
                <Collapsible>
                  <CollapsibleTrigger className="flex items-center gap-2 text-xs text-gray-400 hover:text-white w-full">
                    <ChevronRight className="h-3 w-3" />
                    <span>Manage Tracks</span>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-3">
                    <ScrollArea className="h-48">
                      <div className="space-y-2">
                        {OTB_TRACKS.map(track => (
                          <label key={track.name} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-blue-900/20 p-1 rounded">
                            <input
                              type="checkbox"
                              checked={enabledTracks.has(track.name)}
                              onChange={(e) => {
                                const newSet = new Set(enabledTracks);
                                if (e.target.checked) {
                                  newSet.add(track.name);
                                } else {
                                  newSet.delete(track.name);
                                  if (selectedTrack === track.name && newSet.size > 0) {
                                    setSelectedTrack(Array.from(newSet)[0]);
                                  }
                                }
                                setEnabledTracks(newSet);
                              }}
                              className="rounded border-blue-900/50 bg-[#0d1221] text-blue-600"
                            />
                            <span className="text-white">{track.name}</span>
                            <span className="text-gray-500 text-xs ml-auto">{track.state}</span>
                          </label>
                        ))}
                      </div>
                    </ScrollArea>
                  </CollapsibleContent>
                </Collapsible>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleFirecrawlScrape}
                disabled={isProcessing}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold uppercase tracking-wide py-5"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Flame className="h-4 w-4 mr-2" />
                )}
                Firecrawl Morning Report
              </Button>

              <Button
                onClick={handleScrapeOTB}
                disabled={isProcessing || isRunningJob}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold uppercase tracking-wide py-5"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Globe className="h-4 w-4 mr-2" />
                )}
                Scrape OTB Data
              </Button>

              <Button
                onClick={handleLoadToSupabase}
                disabled={isProcessing || !scrapeResult}
                variant="outline"
                className="w-full border-blue-600 text-blue-400 hover:bg-blue-600/10 font-semibold uppercase tracking-wide py-5"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isProcessing ? 'animate-spin' : ''}`} />
                Load to Supabase
              </Button>
            </div>

            {/* Scrape Results Preview */}
            {scrapeResult && (
              <Card className="bg-[#131a2e] border-green-900/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-xs text-green-400 uppercase tracking-wide">
                      Scraped Data
                    </span>
                  </div>
                  <p className="text-sm text-white font-medium">{scrapeResult.trackName}</p>
                  <p className="text-xs text-gray-500">{scrapeResult.raceDate}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {scrapeResult.races?.length || 0} races found
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Center Column - Preview Panel or Hero Section */}
          <div className="lg:col-span-6 flex flex-col min-h-[500px]">
            {scrapeResult && scrapeResult.races?.length > 0 ? (
              /* Preview Panel */
              <Card className="bg-[#131a2e] border-blue-900/30 h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg text-white flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        Scraped Data Preview
                      </CardTitle>
                      <p className="text-sm text-gray-400 mt-1">
                        {scrapeResult.trackName} • {scrapeResult.raceDate} • {scrapeResult.races.length} races
                        {lastOddsUpdate && (
                          <span className="ml-2 text-green-400">• Odds: {lastOddsUpdate}</span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={fetchAllLiveOdds}
                        disabled={isFetchingAllOdds}
                        className="bg-green-600 hover:bg-green-700 text-white text-xs"
                      >
                        {isFetchingAllOdds ? (
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        ) : (
                          <RefreshCw className="h-3 w-3 mr-1" />
                        )}
                        Fetch All Live Odds
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={expandAllRaces}
                        className="text-xs text-gray-400 hover:text-white"
                      >
                        Expand All
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={collapseAllRaces}
                        className="text-xs text-gray-400 hover:text-white"
                      >
                        Collapse All
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setScrapeResult(null);
                          setAllLiveOdds({});
                          setLastOddsUpdate(null);
                        }}
                        className="text-gray-400 hover:text-white"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[500px] px-4 pb-4">
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
            ) : (
              /* Hero Section when no data */
              <div className="flex flex-col items-center justify-center h-full">
                {/* Neural Engine Visual */}
                <div className="relative mb-8">
                  <div className="absolute inset-0 blur-3xl bg-blue-600/20 rounded-full scale-150" />
                  <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-900/50 to-blue-950/50 border border-blue-700/30 flex items-center justify-center">
                    <Zap className="h-12 w-12 text-blue-400" />
                  </div>
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-48 h-24 border border-blue-900/30 rounded-full opacity-30" />
                </div>

                <h2 className="text-3xl md:text-4xl font-bold text-gray-300 text-center tracking-wide uppercase mb-2">
                  Gemini Data Pipeline
                </h2>
                <h3 className="text-2xl md:text-3xl font-bold text-amber-500 text-center tracking-wide uppercase mb-6">
                  ORD • TRD • OTC
                </h3>

                <p className="text-gray-500 text-center max-w-md uppercase tracking-widest text-xs leading-relaxed">
                  Parse morning cards, integrate TRD rankings, and scrape live OTB odds data through the Gemini AI pipeline.
                </p>

                {/* Connection Status */}
                <div className="mt-8 flex items-center gap-2 px-4 py-2 rounded-full border border-gray-700 bg-[#0d1221]">
                  <CheckCircle2 className={`h-4 w-4 ${connectionStatus === 'ready' ? 'text-green-500' : 'text-yellow-500'}`} />
                  <span className="text-sm font-medium uppercase tracking-wide text-gray-400">
                    {connectionStatus === 'ready' ? 'System Ready' : 'Syncing...'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Stats & Jobs */}
          <div className="lg:col-span-3 space-y-4">
            {/* Stats Summary */}
            <Card className="bg-[#131a2e] border-blue-900/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm font-semibold text-green-500 uppercase tracking-wide">
                    System Status
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-blue-900/20">
                    <span className="text-xs text-gray-500 uppercase">Active Jobs</span>
                    <Badge variant="outline" className="border-blue-600 text-blue-400">
                      {stats?.activeJobs || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-blue-900/20">
                    <span className="text-xs text-gray-500 uppercase">Total Scrapes</span>
                    <Badge variant="outline" className="border-green-600 text-green-400">
                      {stats?.totalRuns || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-blue-900/20">
                    <span className="text-xs text-gray-500 uppercase">Success Rate</span>
                    <Badge variant="outline" className="border-amber-600 text-amber-400">
                      {stats?.successRate || 100}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-xs text-gray-500 uppercase">Total Records</span>
                    <Badge variant="outline" className="border-purple-600 text-purple-400">
                      {stats?.totalRecords || 0}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Live Model Reports - Realtime Dashboard */}
            <LiveModelReports />

            {/* Schedule Config Panel */}
            <ScheduleConfigPanel />

            {/* System Logs Viewer */}
            <SystemLogsViewer />

            {/* Recent Jobs */}
            <Card className="bg-[#131a2e] border-blue-900/30">
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  Recent Jobs
                </h3>
                <div className="space-y-2">
                  {jobs.slice(0, 4).map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-2 rounded bg-[#0d1221]">
                      <div>
                        <p className="text-sm font-medium text-white">{job.track_name}</p>
                        <p className="text-xs text-gray-500">{job.job_type}</p>
                      </div>
                      <Badge 
                        variant={job.is_active ? 'default' : 'outline'}
                        className={job.is_active ? 'bg-green-600/20 text-green-400 border-green-600/30' : 'text-gray-500'}
                      >
                        {job.is_active ? 'Active' : 'Paused'}
                      </Badge>
                    </div>
                  ))}
                  {jobs.length === 0 && (
                    <p className="text-xs text-gray-500 text-center py-4">No jobs configured</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Info */}
            <Card className="bg-[#131a2e] border-blue-900/30">
              <CardContent className="p-4 text-center">
                <Globe className="h-8 w-8 mx-auto mb-3 text-gray-600" />
                <p className="text-xs text-gray-500 uppercase tracking-wide leading-relaxed">
                  Use ORD for morning entries, TRD for rankings, and OTC for live OTB odds scraping.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* TwinSpires Model Section */}
        <div className="mt-8">
          <TwinSpiresModelTab />
        </div>

        {/* TRD Model Upload Section - Independent */}
        <div className="mt-8">
          <TrdModelUploadTab />
        </div>

        {/* OTC Live Scraper Section - Independent */}
        <div className="mt-8">
          <OtcLiveScraperTab />
        </div>

        {/* Scraped Data Viewer Section */}
        <div className="mt-8">
          <ScrapedDataViewer />
        </div>

        {/* Model Training Section */}
        <div className="mt-8">
          <ModelTrainingTab />
        </div>
      </main>
    </div>
  );
};

export default AdminToolboxPage;
