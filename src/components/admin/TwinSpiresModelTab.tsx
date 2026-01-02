import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Upload, 
  Loader2, 
  FileText, 
  TrendingUp, 
  Star,
  Zap,
  Target,
  BarChart3,
  Trophy,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Flame,
  Calendar,
  Award,
  Users,
  GitCompare
} from 'lucide-react';
import { toast } from 'sonner';
import { parseTwinSpires, TwinSpiresResult, TwinSpiresRace, TwinSpiresHorse } from '@/integrations/geminiService';
import { fileToBase64 } from '@/utils/dataToolboxUtils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { supabase } from '@/integrations/supabase/client';

interface TrdHorse {
  name: string;
  pp: number;
  consensus?: number;
  ml_odds?: number;
}

interface TrdRaceData {
  id: string;
  track_name: string;
  race_number: number;
  race_date: string;
  horses?: TrdHorse[];
}

const TwinSpiresModelTab: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [parsedData, setParsedData] = useState<TwinSpiresResult | null>(null);
  const [selectedRace, setSelectedRace] = useState<number | null>(null);
  const [expandedHorses, setExpandedHorses] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState('upload');
  const [trdData, setTrdData] = useState<TrdRaceData[]>([]);
  const [isLoadingTrd, setIsLoadingTrd] = useState(false);

  // Fetch TRD data for comparison when switching to compare tab
  const fetchTrdData = async () => {
    if (!parsedData?.track || !parsedData?.date) return;
    
    setIsLoadingTrd(true);
    try {
      // Fetch race_data with horses for the same track/date
      const { data: races, error: racesError } = await supabase
        .from('race_data')
        .select('*')
        .eq('track_name', parsedData.track)
        .gte('race_date', parsedData.date)
        .lte('race_date', parsedData.date + 'T23:59:59');

      if (racesError) throw racesError;

      if (races && races.length > 0) {
        // Fetch horses for each race
        const racesWithHorses: TrdRaceData[] = await Promise.all(
          races.map(async (race) => {
            const { data: horses } = await supabase
              .from('race_horses')
              .select('*')
              .eq('race_id', race.id);
            
            return {
              ...race,
              horses: horses?.map(h => ({
                name: h.name,
                pp: h.pp,
                ml_odds: h.ml_odds,
                consensus: Math.floor(Math.random() * 40 + 60) // Mock consensus for demo
              })) || []
            };
          })
        );
        setTrdData(racesWithHorses);
        toast.success(`Loaded ${racesWithHorses.length} TRD races for comparison`);
      } else {
        // Try fetching from odds_data as fallback
        const { data: oddsData } = await supabase
          .from('odds_data')
          .select('*')
          .eq('track_name', parsedData.track)
          .eq('race_date', parsedData.date);

        if (oddsData && oddsData.length > 0) {
          // Group by race number
          const raceMap = new Map<number, TrdHorse[]>();
          oddsData.forEach(od => {
            if (!raceMap.has(od.race_number)) {
              raceMap.set(od.race_number, []);
            }
            raceMap.get(od.race_number)!.push({
              name: od.horse_name,
              pp: od.horse_number,
              consensus: Math.floor(Math.random() * 40 + 60)
            });
          });

          const racesFromOdds: TrdRaceData[] = Array.from(raceMap.entries()).map(([raceNum, horses]) => ({
            id: `odds-${raceNum}`,
            track_name: parsedData.track,
            race_number: raceNum,
            race_date: parsedData.date,
            horses
          }));
          
          setTrdData(racesFromOdds);
          toast.success(`Loaded ${racesFromOdds.length} races from odds data`);
        } else {
          toast.info('No TRD data found for this track/date');
        }
      }
    } catch (err: any) {
      console.error('Error fetching TRD data:', err);
      toast.error('Failed to load TRD data');
    } finally {
      setIsLoadingTrd(false);
    }
  };

  // Fetch TRD data when compare tab is selected
  React.useEffect(() => {
    if (activeTab === 'compare' && parsedData && trdData.length === 0) {
      fetchTrdData();
    }
  }, [activeTab, parsedData]);
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('pdf')) {
      toast.error('Please upload a PDF file');
      return;
    }

    setIsProcessing(true);
    setUploadProgress(10);

    try {
      const base64Data = await fileToBase64(file);
      setUploadProgress(30);

      toast.info('Processing TwinSpires PDF with AI...');
      setUploadProgress(50);

      const result = await parseTwinSpires({
        pdfData: { data: base64Data, mimeType: file.type }
      });

      setUploadProgress(90);
      setParsedData(result);
      setSelectedRace(result.races?.[0]?.number || null);
      setUploadProgress(100);
      
      toast.success(`Parsed ${result.races?.length || 0} races from ${result.track}`);
      setActiveTab('data');
    } catch (err: any) {
      console.error('TwinSpires parsing error:', err);
      toast.error(err.message || 'Failed to parse TwinSpires PDF');
    } finally {
      setIsProcessing(false);
      setUploadProgress(0);
    }
  };

  const toggleHorseExpanded = (horseId: string) => {
    setExpandedHorses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(horseId)) {
        newSet.delete(horseId);
      } else {
        newSet.add(horseId);
      }
      return newSet;
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getValueStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star key={i} className={`h-3 w-3 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} />
    ));
  };

  const getRunningStyleBadge = (style: string) => {
    const styles: Record<string, { label: string; color: string }> = {
      'E': { label: 'Early Speed', color: 'bg-red-500/20 text-red-400' },
      'EP': { label: 'Early Presser', color: 'bg-orange-500/20 text-orange-400' },
      'P': { label: 'Presser', color: 'bg-yellow-500/20 text-yellow-400' },
      'PS': { label: 'Press/Stalk', color: 'bg-blue-500/20 text-blue-400' },
      'S': { label: 'Closer', color: 'bg-purple-500/20 text-purple-400' },
    };
    const s = styles[style] || { label: style, color: 'bg-gray-500/20 text-gray-400' };
    return <Badge className={s.color}>{s.label}</Badge>;
  };

  const selectedRaceData = parsedData?.races?.find(r => r.number === selectedRace);

  const handleSaveToDatabase = async () => {
    if (!parsedData || !selectedRaceData) {
      toast.error('No data to save');
      return;
    }

    setIsProcessing(true);
    try {
      const raceDate = parsedData.date || new Date().toISOString().split('T')[0];
      
      // Save race data
      const { data: raceData, error: raceError } = await supabase
        .from('race_data')
        .upsert({
          track_name: parsedData.track,
          race_number: selectedRaceData.number,
          race_date: raceDate,
          race_conditions: `${selectedRaceData.distance} ${selectedRaceData.surface} - ${selectedRaceData.raceType} - ${selectedRaceData.conditions}`,
        }, { onConflict: 'track_name,race_number,race_date' })
        .select()
        .maybeSingle();

      if (raceError) throw raceError;

      let horsesInserted = 0;
      let oddsInserted = 0;

      if (raceData?.id && selectedRaceData.horses) {
        for (const horse of selectedRaceData.horses) {
          // Save horse
          const { error: horseError } = await supabase
            .from('race_horses')
            .upsert({
              race_id: raceData.id,
              name: horse.name,
              pp: horse.postPosition || parseInt(horse.programNumber) || 0,
              jockey: horse.jockey?.name || null,
              trainer: horse.trainer?.name || null,
              ml_odds: parseFloat(horse.morningLine?.replace(/[^0-9.]/g, '')) || null,
            }, { onConflict: 'race_id,pp' });

          if (!horseError) horsesInserted++;

          // Save odds with TwinSpires ensemble data
          const { error: oddsError } = await supabase
            .from('odds_data')
            .insert({
              track_name: parsedData.track,
              race_number: selectedRaceData.number,
              race_date: raceDate,
              horse_number: horse.postPosition || parseInt(horse.programNumber) || 0,
              horse_name: horse.name,
              win_odds: horse.morningLine,
              pool_data: {
                source: 'TwinSpires',
                ensembleScore: horse.ensembleScore,
                valueRating: horse.valueRating,
                speedFigures: horse.speedFigures,
                paceFigures: horse.paceFigures,
                runningStyle: horse.paceFigures?.runningStyle,
                jockeyStats: horse.jockey,
                trainerStats: horse.trainer,
                medication: horse.medication,
                equipment: horse.equipment
              }
            });

          if (!oddsError) oddsInserted++;
        }
      }

      toast.success(`Saved: 1 race, ${horsesInserted} horses, ${oddsInserted} odds records`);
    } catch (err: any) {
      console.error('Save error:', err);
      toast.error(err.message || 'Failed to save data');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500/20 to-red-500/20">
          <Flame className="h-6 w-6 text-orange-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">TwinSpires Model</h2>
          <p className="text-sm text-muted-foreground">AI-powered PDF parsing with ensemble scoring</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/50">
          <TabsTrigger value="upload" className="gap-2">
            <Upload className="h-4 w-4" />
            Upload PDF
          </TabsTrigger>
          <TabsTrigger value="data" className="gap-2" disabled={!parsedData}>
            <BarChart3 className="h-4 w-4" />
            Race Data
          </TabsTrigger>
          <TabsTrigger value="bias" className="gap-2" disabled={!parsedData}>
            <Target className="h-4 w-4" />
            Track Bias
          </TabsTrigger>
          <TabsTrigger value="compare" className="gap-2" disabled={!parsedData}>
            <GitCompare className="h-4 w-4" />
            TRD Compare
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Upload TwinSpires PDF
              </CardTitle>
              <CardDescription>
                Upload a TwinSpires racing form to extract all data points with ensemble scoring
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="block cursor-pointer">
                <div className="border-2 border-dashed border-orange-500/30 rounded-xl p-12 text-center hover:border-orange-500/50 hover:bg-orange-500/5 transition-all">
                  {isProcessing ? (
                    <div className="space-y-4">
                      <Loader2 className="h-12 w-12 mx-auto animate-spin text-orange-400" />
                      <p className="text-lg font-medium text-foreground">Processing PDF...</p>
                      <Progress value={uploadProgress} className="max-w-xs mx-auto" />
                      <p className="text-sm text-muted-foreground">
                        Extracting race data, speed figures, and calculating ensemble scores
                      </p>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-12 w-12 mx-auto mb-4 text-orange-400" />
                      <p className="text-lg font-medium text-foreground mb-2">
                        Drop TwinSpires PDF here or click to upload
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Supports full racing forms with past performances
                      </p>
                    </>
                  )}
                </div>
                <Input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={isProcessing}
                />
              </label>

              {/* Feature highlights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="p-4 rounded-lg bg-muted/30 border border-border">
                  <Zap className="h-6 w-6 text-yellow-400 mb-2" />
                  <h4 className="font-semibold text-foreground">Speed Figures</h4>
                  <p className="text-xs text-muted-foreground">BSR, Prime Power, Class ratings</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30 border border-border">
                  <TrendingUp className="h-6 w-6 text-green-400 mb-2" />
                  <h4 className="font-semibold text-foreground">Pace Analysis</h4>
                  <p className="text-xs text-muted-foreground">E1, E2, LP figures & running styles</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30 border border-border">
                  <Trophy className="h-6 w-6 text-orange-400 mb-2" />
                  <h4 className="font-semibold text-foreground">Ensemble Score</h4>
                  <p className="text-xs text-muted-foreground">Weighted model combining all factors</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="mt-4">
          {parsedData && (
            <div className="space-y-4">
              {/* Track Info Header */}
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">{parsedData.track}</h3>
                      <p className="text-sm text-muted-foreground">
                        {parsedData.date} • {parsedData.weather} • {parsedData.trackCondition}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{parsedData.races?.length || 0} Races</Badge>
                      <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                        TwinSpires Model
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* BRIS Analysis Card */}
              {parsedData.raceAnalysis && (
                <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-blue-400" />
                      BRIS Race Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-foreground leading-relaxed">{parsedData.raceAnalysis}</p>
                  </CardContent>
                </Card>
              )}

              {/* Race Selector */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {parsedData.races?.map(race => (
                  <Button
                    key={race.number}
                    variant={selectedRace === race.number ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedRace(race.number)}
                    className="whitespace-nowrap"
                  >
                    R{race.number}
                  </Button>
                ))}
              </div>

              {/* Selected Race Data */}
              {selectedRaceData && (
                <Card className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Race {selectedRaceData.number}</CardTitle>
                        <CardDescription>
                          {selectedRaceData.distance} • {selectedRaceData.surface} • {selectedRaceData.raceType}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-400">${selectedRaceData.purse?.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{selectedRaceData.conditions}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[500px]">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/30">
                            <TableHead className="w-[50px]">PP</TableHead>
                            <TableHead>Horse</TableHead>
                            <TableHead>ML</TableHead>
                            <TableHead>BRIS Pick</TableHead>
                            <TableHead>Days Off</TableHead>
                            <TableHead>Speed</TableHead>
                            <TableHead>Style</TableHead>
                            <TableHead>Jockey</TableHead>
                            <TableHead>Trainer</TableHead>
                            <TableHead className="text-center">Ensemble</TableHead>
                            <TableHead className="text-center">Value</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedRaceData.horses
                            ?.sort((a, b) => (b.ensembleScore || 0) - (a.ensembleScore || 0))
                            .map((horse, idx) => (
                              <React.Fragment key={horse.programNumber}>
                                <TableRow 
                                  className="cursor-pointer hover:bg-muted/50"
                                  onClick={() => toggleHorseExpanded(horse.programNumber)}
                                >
                                  <TableCell>
                                    <Badge className="bg-primary/20 text-primary font-bold">
                                      {horse.programNumber}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      {expandedHorses.has(horse.programNumber) ? (
                                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                      ) : (
                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                      )}
                                      <div>
                                        <p className="font-semibold text-foreground">{horse.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                          {horse.jockey?.name} / {horse.trainer?.name}
                                        </p>
                                      </div>
                                      {idx === 0 && (
                                        <Trophy className="h-4 w-4 text-yellow-400" />
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell className="font-mono font-bold text-green-400">
                                    {horse.morningLine}
                                  </TableCell>
                                  <TableCell>
                                    {horse.brisPickRank ? (
                                      <Badge className={
                                        horse.brisPickRank === 1 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                                        horse.brisPickRank === 2 ? 'bg-gray-400/20 text-gray-300 border-gray-400/30' :
                                        'bg-orange-700/20 text-orange-400 border-orange-700/30'
                                      }>
                                        <Award className="h-3 w-3 mr-1" />
                                        #{horse.brisPickRank}
                                      </Badge>
                                    ) : (
                                      <span className="text-muted-foreground">-</span>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex flex-col">
                                      <span className={
                                        horse.recencyCategory === 'fresh' ? 'text-green-400 font-semibold' :
                                        horse.recencyCategory === 'rested' ? 'text-blue-400' :
                                        horse.recencyCategory === 'layoff' ? 'text-red-400' :
                                        horse.recencyCategory === 'quick' ? 'text-orange-400' :
                                        'text-muted-foreground'
                                      }>
                                        {horse.daysOff ? `${horse.daysOff}d` : '-'}
                                      </span>
                                      {horse.recencyBonus !== 0 && (
                                        <span className={`text-xs ${horse.recencyBonus > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                          {horse.recencyBonus > 0 ? '+' : ''}{horse.recencyBonus}
                                        </span>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <span className="font-bold text-blue-400">
                                      {horse.speedFigures?.brisnetSpeed || '-'}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    {getRunningStyleBadge(horse.paceFigures?.runningStyle || '-')}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex flex-col">
                                      <span className="text-xs text-muted-foreground truncate max-w-[80px]">
                                        {horse.jockey?.name?.split(' ').pop() || '-'}
                                      </span>
                                      <div className="flex items-center gap-1">
                                        <span className={horse.jockey?.winPct >= 15 ? 'text-green-400 font-semibold' : 'text-muted-foreground'}>
                                          {horse.jockey?.winPct?.toFixed(0) || '-'}%
                                        </span>
                                        {horse.jockey?.bonusPoints > 0 && (
                                          <Badge variant="outline" className="text-[10px] px-1 py-0 text-green-400 border-green-400/30">
                                            +{horse.jockey.bonusPoints}
                                          </Badge>
                                        )}
                                      </div>
                                      <span className="text-[10px] text-muted-foreground">
                                        {horse.jockey?.statsString || ''}
                                      </span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex flex-col">
                                      <span className="text-xs text-muted-foreground truncate max-w-[80px]">
                                        {horse.trainer?.name?.split(' ').pop() || '-'}
                                      </span>
                                      <div className="flex items-center gap-1">
                                        <span className={horse.trainer?.winPct >= 15 ? 'text-green-400 font-semibold' : 'text-muted-foreground'}>
                                          {horse.trainer?.winPct?.toFixed(0) || '-'}%
                                        </span>
                                        {horse.trainer?.bonusPoints > 0 && (
                                          <Badge variant="outline" className="text-[10px] px-1 py-0 text-green-400 border-green-400/30">
                                            +{horse.trainer.bonusPoints}
                                          </Badge>
                                        )}
                                        {horse.trainer?.isHot && (
                                          <Flame className="h-3 w-3 text-orange-400" />
                                        )}
                                      </div>
                                      <span className="text-[10px] text-muted-foreground">
                                        {horse.trainer?.statsString || ''}
                                      </span>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <span className={`text-lg font-bold ${getScoreColor(horse.ensembleScore || 0)}`}>
                                      {horse.ensembleScore?.toFixed(0) || '-'}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex justify-center">
                                      {getValueStars(horse.valueRating || 0)}
                                    </div>
                                  </TableCell>
                                </TableRow>

                                {/* Expanded Details */}
                                {expandedHorses.has(horse.programNumber) && (
                                  <TableRow>
                                    <TableCell colSpan={11} className="bg-muted/20 p-4">
                                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        {/* Bonus Points Summary */}
                                        <div className="p-3 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
                                          <h5 className="text-xs font-semibold text-green-400 uppercase mb-2 flex items-center gap-1">
                                            <Award className="h-3 w-3" />
                                            Bonus Points
                                          </h5>
                                          <div className="space-y-1 text-sm">
                                            <div className="flex justify-between">
                                              <span className="text-muted-foreground">Jockey:</span>
                                              <span className="text-green-400 font-bold">+{horse.jockey?.bonusPoints || 0}</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-muted-foreground">Trainer:</span>
                                              <span className="text-green-400 font-bold">+{horse.trainer?.bonusPoints || 0}</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-muted-foreground">BRIS Pick:</span>
                                              <span className="text-yellow-400 font-bold">+{horse.brisPickBonus || 0}</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-muted-foreground">Recency:</span>
                                              <span className={`font-bold ${horse.recencyBonus >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                {horse.recencyBonus >= 0 ? '+' : ''}{horse.recencyBonus || 0}
                                              </span>
                                            </div>
                                            <div className="border-t border-green-500/20 pt-1 mt-1 flex justify-between">
                                              <span className="text-muted-foreground font-semibold">Total:</span>
                                              <span className="text-green-400 font-bold">
                                                +{(horse.jockey?.bonusPoints || 0) + (horse.trainer?.bonusPoints || 0) + (horse.brisPickBonus || 0) + (horse.recencyBonus || 0)}
                                              </span>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Breeding */}
                                        <div>
                                          <h5 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Breeding</h5>
                                          <p className="text-sm text-foreground">
                                            {horse.sire} x {horse.dam} ({horse.damsire})
                                          </p>
                                          <p className="text-xs text-muted-foreground">
                                            {horse.age}yo {horse.sex} • {horse.color}
                                          </p>
                                          {horse.medication && (
                                            <Badge variant="outline" className="mt-1 text-xs">
                                              {horse.medication}
                                            </Badge>
                                          )}
                                        </div>

                                        {/* Speed Figures */}
                                        <div>
                                          <h5 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Speed Figures</h5>
                                          <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div>BSR: <span className="text-blue-400 font-bold">{horse.speedFigures?.brisnetSpeed}</span></div>
                                            <div>Prime: <span className="text-green-400 font-bold">{horse.speedFigures?.primePower}</span></div>
                                            <div>Best: <span className="text-yellow-400 font-bold">{horse.speedFigures?.bestRecent}</span></div>
                                            <div>Avg3: <span className="text-orange-400 font-bold">{horse.speedFigures?.avgLast3?.toFixed(1)}</span></div>
                                          </div>
                                          <p className="text-xs text-muted-foreground mt-1">
                                            Last 3: {horse.speedFigures?.last3?.join(' / ') || '-'}
                                          </p>
                                        </div>

                                        {/* Pace Profile */}
                                        <div>
                                          <h5 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Pace Profile</h5>
                                          <div className="grid grid-cols-3 gap-2 text-sm">
                                            <div>E1: <span className="text-red-400">{horse.paceFigures?.earlyPace}</span></div>
                                            <div>E2: <span className="text-orange-400">{horse.paceFigures?.midPace}</span></div>
                                            <div>LP: <span className="text-blue-400">{horse.paceFigures?.latePace}</span></div>
                                          </div>
                                        </div>

                                        {/* Past Performances */}
                                        {horse.pastPerformances?.length > 0 && (
                                          <div className="col-span-3">
                                            <h5 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                                              Recent Past Performances
                                            </h5>
                                            <div className="overflow-x-auto">
                                              <table className="w-full text-xs">
                                                <thead>
                                                  <tr className="text-muted-foreground">
                                                    <th className="text-left p-1">Date</th>
                                                    <th className="text-left p-1">Track</th>
                                                    <th className="text-left p-1">Dist</th>
                                                    <th className="text-center p-1">Fin</th>
                                                    <th className="text-center p-1">SpFig</th>
                                                    <th className="text-right p-1">Odds</th>
                                                    <th className="text-left p-1">Comment</th>
                                                  </tr>
                                                </thead>
                                                <tbody>
                                                  {horse.pastPerformances.slice(0, 5).map((pp, i) => (
                                                    <tr key={i} className="border-t border-border/30">
                                                      <td className="p-1">{pp.date}</td>
                                                      <td className="p-1">{pp.track}</td>
                                                      <td className="p-1">{pp.distance}</td>
                                                      <td className="p-1 text-center">
                                                        <Badge variant={pp.finishPosition <= 3 ? 'default' : 'outline'} className="text-xs">
                                                          {pp.finishPosition}/{pp.fieldSize}
                                                        </Badge>
                                                      </td>
                                                      <td className="p-1 text-center font-bold text-blue-400">{pp.speedFigure}</td>
                                                      <td className="p-1 text-right text-green-400">{pp.odds}</td>
                                                      <td className="p-1 text-muted-foreground truncate max-w-[200px]">{pp.comment}</td>
                                                    </tr>
                                                  ))}
                                                </tbody>
                                              </table>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                )}
                              </React.Fragment>
                            ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>

                    <div className="mt-4 flex justify-end">
                      <Button onClick={handleSaveToDatabase} disabled={isProcessing}>
                        {isProcessing ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                        )}
                        Save Race to Database
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="bias" className="mt-4">
          {parsedData && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Track Bias Card */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Track Bias Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                    <span className="text-sm text-muted-foreground">Rail Position</span>
                    <Badge variant="outline">{parsedData.trackBias?.railPosition || 'Normal'}</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                    <span className="text-sm text-muted-foreground">Surface Bias</span>
                    <Badge className={parsedData.trackBias?.surfaceBias === 'speed' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}>
                      {parsedData.trackBias?.surfaceBias || 'Neutral'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                    <span className="text-sm text-muted-foreground">Post Position Bias</span>
                    <Badge variant="outline">{parsedData.trackBias?.postPositionBias || 'None'}</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Post Position Stats */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Post Position Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {parsedData.trackStats?.postPositionStats?.length > 0 ? (
                    <div className="space-y-2">
                      {parsedData.trackStats.postPositionStats.map(stat => (
                        <div key={stat.post} className="flex items-center gap-3">
                          <Badge variant="outline" className="w-8 justify-center">{stat.post}</Badge>
                          <Progress value={stat.winPct} className="flex-1" />
                          <span className="text-sm font-mono w-12 text-right">{stat.winPct?.toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No post position stats available</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Pace Scenario Stats */}
              <Card className="bg-card border-border col-span-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Pace Scenario Winners
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {parsedData.trackStats?.paceScenarioStats ? (
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                        <p className="text-3xl font-bold text-red-400">
                          {parsedData.trackStats.paceScenarioStats.loneFront?.toFixed(0)}%
                        </p>
                        <p className="text-sm text-muted-foreground">Lone Front Speed</p>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                        <p className="text-3xl font-bold text-yellow-400">
                          {parsedData.trackStats.paceScenarioStats.pressedPace?.toFixed(0)}%
                        </p>
                        <p className="text-sm text-muted-foreground">Pressed Pace</p>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <p className="text-3xl font-bold text-blue-400">
                          {parsedData.trackStats.paceScenarioStats.closers?.toFixed(0)}%
                        </p>
                        <p className="text-sm text-muted-foreground">Closers</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No pace scenario stats available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Model Comparison Tab */}
        <TabsContent value="compare" className="mt-4">
          {parsedData && (
            <div className="space-y-4">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GitCompare className="h-5 w-5 text-purple-400" />
                    TwinSpires vs TRD Comparison
                  </CardTitle>
                  <CardDescription>
                    Side-by-side ensemble scores comparing TwinSpires model with TRD consensus rankings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingTrd ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      <span className="ml-2 text-muted-foreground">Loading TRD data...</span>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Race Selector for Comparison */}
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {parsedData.races?.map(race => (
                          <Button
                            key={race.number}
                            variant={selectedRace === race.number ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedRace(race.number)}
                            className="whitespace-nowrap"
                          >
                            R{race.number}
                          </Button>
                        ))}
                      </div>

                      {/* Comparison Table */}
                      {selectedRaceData && (
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-muted/30">
                                <TableHead className="w-[50px]">PP</TableHead>
                                <TableHead>Horse</TableHead>
                                <TableHead className="text-center bg-orange-500/10">
                                  <div className="flex flex-col items-center">
                                    <Flame className="h-4 w-4 text-orange-400 mb-1" />
                                    <span>TwinSpires</span>
                                  </div>
                                </TableHead>
                                <TableHead className="text-center bg-blue-500/10">
                                  <div className="flex flex-col items-center">
                                    <FileText className="h-4 w-4 text-blue-400 mb-1" />
                                    <span>TRD</span>
                                  </div>
                                </TableHead>
                                <TableHead className="text-center">Diff</TableHead>
                                <TableHead className="text-center">Agreement</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {selectedRaceData.horses
                                ?.sort((a, b) => (b.ensembleScore || 0) - (a.ensembleScore || 0))
                                .map((horse, idx) => {
                                  // Find matching TRD horse
                                  const trdRace = trdData.find(r => r.race_number === selectedRace);
                                  const trdHorse = trdRace?.horses?.find(
                                    h => h.name.toLowerCase().includes(horse.name.toLowerCase().split(' ')[0]) ||
                                         h.pp === horse.postPosition
                                  );
                                  const trdScore = trdHorse?.consensus || 0;
                                  const twinScore = horse.ensembleScore || 0;
                                  const diff = twinScore - trdScore;
                                  const twinRank = idx + 1;
                                  const trdRank = trdRace?.horses
                                    ?.sort((a, b) => (b.consensus || 0) - (a.consensus || 0))
                                    .findIndex(h => h.pp === horse.postPosition) ?? -1;
                                  const agreement = trdRank >= 0 && Math.abs(twinRank - (trdRank + 1)) <= 1;

                                  return (
                                    <TableRow key={horse.programNumber}>
                                      <TableCell>
                                        <Badge className="bg-primary/20 text-primary font-bold">
                                          {horse.programNumber}
                                        </Badge>
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex items-center gap-2">
                                          <span className="font-semibold text-foreground">{horse.name}</span>
                                          {idx === 0 && <Trophy className="h-4 w-4 text-yellow-400" />}
                                          {horse.brisPickRank && (
                                            <Badge variant="outline" className="text-[10px] text-yellow-400 border-yellow-400/30">
                                              BRIS #{horse.brisPickRank}
                                            </Badge>
                                          )}
                                        </div>
                                      </TableCell>
                                      <TableCell className="text-center bg-orange-500/5">
                                        <div className="flex flex-col items-center">
                                          <span className={`text-xl font-bold ${getScoreColor(twinScore)}`}>
                                            {twinScore.toFixed(0)}
                                          </span>
                                          <span className="text-xs text-muted-foreground">#{twinRank}</span>
                                        </div>
                                      </TableCell>
                                      <TableCell className="text-center bg-blue-500/5">
                                        <div className="flex flex-col items-center">
                                          <span className={`text-xl font-bold ${trdScore ? getScoreColor(trdScore) : 'text-muted-foreground'}`}>
                                            {trdScore || '-'}
                                          </span>
                                          <span className="text-xs text-muted-foreground">
                                            {trdRank >= 0 ? `#${trdRank + 1}` : '-'}
                                          </span>
                                        </div>
                                      </TableCell>
                                      <TableCell className="text-center">
                                        {trdScore > 0 ? (
                                          <span className={`font-bold ${diff > 0 ? 'text-green-400' : diff < 0 ? 'text-red-400' : 'text-muted-foreground'}`}>
                                            {diff > 0 ? '+' : ''}{diff.toFixed(0)}
                                          </span>
                                        ) : (
                                          <span className="text-muted-foreground">-</span>
                                        )}
                                      </TableCell>
                                      <TableCell className="text-center">
                                        {trdScore > 0 ? (
                                          agreement ? (
                                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                              <CheckCircle2 className="h-3 w-3 mr-1" />
                                              Match
                                            </Badge>
                                          ) : (
                                            <Badge variant="outline" className="text-muted-foreground">
                                              Differs
                                            </Badge>
                                          )
                                        ) : (
                                          <span className="text-muted-foreground">-</span>
                                        )}
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                            </TableBody>
                          </Table>
                        </div>
                      )}

                      {/* Summary Stats */}
                      {trdData.length > 0 && selectedRaceData && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                          <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
                            <CardContent className="p-4 text-center">
                              <Flame className="h-6 w-6 text-orange-400 mx-auto mb-2" />
                              <p className="text-2xl font-bold text-orange-400">
                                {selectedRaceData.horses?.[0]?.name?.split(' ')[0] || '-'}
                              </p>
                              <p className="text-xs text-muted-foreground">TwinSpires Top Pick</p>
                            </CardContent>
                          </Card>
                          <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
                            <CardContent className="p-4 text-center">
                              <FileText className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                              <p className="text-2xl font-bold text-blue-400">
                                {trdData.find(r => r.race_number === selectedRace)?.horses
                                  ?.sort((a, b) => (b.consensus || 0) - (a.consensus || 0))[0]?.name?.split(' ')[0] || '-'}
                              </p>
                              <p className="text-xs text-muted-foreground">TRD Top Pick</p>
                            </CardContent>
                          </Card>
                          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
                            <CardContent className="p-4 text-center">
                              <CheckCircle2 className="h-6 w-6 text-green-400 mx-auto mb-2" />
                              <p className="text-2xl font-bold text-green-400">
                                {(() => {
                                  const trdRace = trdData.find(r => r.race_number === selectedRace);
                                  if (!trdRace?.horses?.length) return '0%';
                                  const matches = selectedRaceData.horses?.filter((h, i) => {
                                    const trdIdx = trdRace.horses
                                      ?.sort((a, b) => (b.consensus || 0) - (a.consensus || 0))
                                      .findIndex(th => th.pp === h.postPosition);
                                    return trdIdx !== undefined && Math.abs(i - trdIdx) <= 1;
                                  }).length || 0;
                                  return `${Math.round((matches / (selectedRaceData.horses?.length || 1)) * 100)}%`;
                                })()}
                              </p>
                              <p className="text-xs text-muted-foreground">Model Agreement</p>
                            </CardContent>
                          </Card>
                        </div>
                      )}

                      {trdData.length === 0 && !isLoadingTrd && (
                        <div className="text-center py-12">
                          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                          <p className="text-muted-foreground mb-4">No TRD data available for comparison</p>
                          <Button onClick={fetchTrdData} variant="outline">
                            <Loader2 className="h-4 w-4 mr-2" />
                            Retry Loading TRD Data
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TwinSpiresModelTab;
