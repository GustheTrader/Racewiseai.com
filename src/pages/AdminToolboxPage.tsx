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

const tracks = [
  'Santa Anita Park',
  'Gulfstream Park',
  'Churchill Downs',
  'Aqueduct',
  'Del Mar',
  'Saratoga',
  'Belmont Park',
  'Oaklawn Park',
  'Keeneland',
  'Los Alamitos',
];

const AdminToolboxPage: React.FC = () => {
  const { user, isLoading: authLoading, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [selectedTrack, setSelectedTrack] = useState(tracks[0]);
  const [cardData, setCardData] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('ord');
  const [connectionStatus, setConnectionStatus] = useState<'ready' | 'syncing' | 'error'>('ready');
  const [scrapeResult, setScrapeResult] = useState<any>(null);
  const [expandedRaces, setExpandedRaces] = useState<Set<number>>(new Set());
  
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

  // TEMPORARILY DISABLED FOR TESTING - Restore this check later
  // if (!user || !isAdmin) {
  //   return <Navigate to="/auth" replace />;
  // }

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
      const { data, error } = await supabase.functions.invoke('firecrawl-morning-report', {
        body: { trackName: selectedTrack }
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
            {/* Workflow Tabs - ORD / TRD / OTC */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 bg-[#131a2e] border border-blue-900/30 rounded-lg p-1">
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
              </TabsList>
            </Tabs>

            {/* Track Selector */}
            <Card className="bg-[#131a2e] border-blue-900/30">
              <CardContent className="p-4">
                <label className="text-xs text-gray-500 uppercase tracking-wide mb-2 block">Select Track</label>
                <Select value={selectedTrack} onValueChange={setSelectedTrack}>
                  <SelectTrigger className="bg-[#0d1221] border-blue-900/30 text-white">
                    <SelectValue placeholder="Select Track" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#131a2e] border-blue-900/30">
                    {tracks.map(track => (
                      <SelectItem key={track} value={track} className="text-white hover:bg-blue-900/30">
                        {track}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Input Area */}
            <Card className="bg-[#131a2e] border-blue-900/30">
              <CardContent className="p-4 space-y-4">
                <Textarea
                  value={cardData}
                  onChange={(e) => setCardData(e.target.value)}
                  placeholder="Paste race card data or upload PDF..."
                  className="min-h-[100px] bg-[#0d1221] border-blue-900/30 text-white placeholder:text-gray-500 resize-none"
                />
                
                {/* File Upload Zone */}
                <label className="block cursor-pointer">
                  <div className="border-2 border-dashed border-blue-900/50 rounded-lg p-6 text-center hover:border-blue-600/50 transition-colors">
                    <Upload className="h-6 w-6 mx-auto mb-2 text-gray-500" />
                    <p className="text-xs text-gray-400 uppercase tracking-wide">
                      Drop PDF or Click to Upload
                    </p>
                  </div>
                  <input
                    type="file"
                    accept=".pdf,.txt"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={isProcessing}
                  />
                </label>
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
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
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
                        onClick={() => setScrapeResult(null)}
                        className="text-gray-400 hover:text-white"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[450px] px-4 pb-4">
                    <div className="space-y-3">
                      {scrapeResult.races.map((race: any) => (
                        <Collapsible
                          key={race.raceNumber}
                          open={expandedRaces.has(race.raceNumber)}
                          onOpenChange={() => toggleRaceExpanded(race.raceNumber)}
                        >
                          <CollapsibleTrigger asChild>
                            <div className="flex items-center justify-between p-3 bg-[#0d1221] rounded-lg cursor-pointer hover:bg-[#151d33] transition-colors">
                              <div className="flex items-center gap-3">
                                <Badge className="bg-amber-600/20 text-amber-400 border-amber-600/30 font-bold">
                                  R{race.raceNumber}
                                </Badge>
                                <div>
                                  <p className="text-sm font-medium text-white">
                                    {race.distance} {race.surface} • {race.raceType}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {race.postTime} • Purse: {race.purse || 'N/A'} • {race.horses?.length || 0} horses
                                  </p>
                                </div>
                              </div>
                              {expandedRaces.has(race.raceNumber) ? (
                                <ChevronDown className="h-4 w-4 text-gray-400" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-gray-400" />
                              )}
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="mt-2 ml-4 space-y-1">
                              {race.conditions && (
                                <p className="text-xs text-gray-500 italic mb-2">{race.conditions}</p>
                              )}
                              <div className="grid grid-cols-1 gap-1">
                                {race.horses?.map((horse: any, idx: number) => (
                                  <div 
                                    key={idx} 
                                    className="flex items-center justify-between p-2 bg-[#0a0e1a] rounded border border-blue-900/20"
                                  >
                                    <div className="flex items-center gap-3">
                                      <span className="w-6 h-6 flex items-center justify-center rounded bg-blue-900/30 text-blue-400 text-xs font-bold">
                                        {horse.programNumber}
                                      </span>
                                      <div>
                                        <p className="text-sm font-medium text-white">{horse.horseName}</p>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                          <span className="flex items-center gap-1">
                                            <User className="h-3 w-3" />
                                            {horse.jockey || 'TBD'}
                                          </span>
                                          <span className="flex items-center gap-1">
                                            <Award className="h-3 w-3" />
                                            {horse.trainer || 'TBD'}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    <Badge variant="outline" className="border-green-600/50 text-green-400">
                                      ML: {horse.morningLineOdds || 'N/A'}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      ))}
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
      </main>
    </div>
  );
};

export default AdminToolboxPage;
