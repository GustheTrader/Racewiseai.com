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
  Flame
} from 'lucide-react';
import { toast } from 'sonner';
import { parseTwinSpires, TwinSpiresResult, TwinSpiresRace, TwinSpiresHorse } from '@/integrations/geminiService';
import { fileToBase64 } from '@/utils/dataToolboxUtils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { supabase } from '@/integrations/supabase/client';

const TwinSpiresModelTab: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [parsedData, setParsedData] = useState<TwinSpiresResult | null>(null);
  const [selectedRace, setSelectedRace] = useState<number | null>(null);
  const [expandedHorses, setExpandedHorses] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState('upload');

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
                            <TableHead>Speed</TableHead>
                            <TableHead>Class</TableHead>
                            <TableHead>Pace</TableHead>
                            <TableHead>Style</TableHead>
                            <TableHead>Jockey %</TableHead>
                            <TableHead>Trainer %</TableHead>
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
                                    <span className="font-bold text-blue-400">
                                      {horse.speedFigures?.brisnetSpeed || '-'}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    <span className="text-purple-400">
                                      {horse.speedFigures?.classRating || '-'}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    <span className="text-orange-400">
                                      {horse.speedFigures?.avgLast3?.toFixed(0) || '-'}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    {getRunningStyleBadge(horse.paceFigures?.runningStyle || '-')}
                                  </TableCell>
                                  <TableCell>
                                    <span className={horse.jockey?.meetWinPct >= 15 ? 'text-green-400' : 'text-muted-foreground'}>
                                      {horse.jockey?.meetWinPct?.toFixed(0) || '-'}%
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    <span className={horse.trainer?.meetWinPct >= 15 ? 'text-green-400' : 'text-muted-foreground'}>
                                      {horse.trainer?.meetWinPct?.toFixed(0) || '-'}%
                                    </span>
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
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
      </Tabs>
    </div>
  );
};

export default TwinSpiresModelTab;
