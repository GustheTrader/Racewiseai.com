import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Upload, 
  Loader2, 
  FileText, 
  Database,
  Trophy,
  ChevronDown,
  ChevronRight,
  Target,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { fileToBase64 } from '@/utils/dataToolboxUtils';

interface TrdHorse {
  programNumber: string;
  name: string;
  pp: number;
  consensusRank: number;
  consensusScore: number;
  mlOdds?: string;
  jockey?: string;
  trainer?: string;
}

interface TrdRace {
  number: number;
  horses: TrdHorse[];
  distance?: string;
  surface?: string;
  conditions?: string;
}

interface TrdParsedData {
  track: string;
  date: string;
  races: TrdRace[];
}

const TrdModelUploadTab: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [parsedData, setParsedData] = useState<TrdParsedData | null>(null);
  const [selectedRace, setSelectedRace] = useState<number | null>(null);
  const [expandedHorses, setExpandedHorses] = useState<Set<string>>(new Set());

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

      toast.info('Processing TRD PDF with AI...');
      setUploadProgress(50);

      // Call the edge function for TRD parsing
      const { data, error } = await supabase.functions.invoke('parse-pdf-with-gemini', {
        body: {
          pdfData: base64Data,
          parseType: 'trd_consensus'
        }
      });

      if (error) throw error;

      setUploadProgress(90);
      setParsedData(data);
      setSelectedRace(data.races?.[0]?.number || null);
      setUploadProgress(100);
      
      toast.success(`Parsed ${data.races?.length || 0} races from ${data.track}`);
    } catch (err: any) {
      console.error('TRD parsing error:', err);
      toast.error(err.message || 'Failed to parse TRD PDF');
    } finally {
      setIsProcessing(false);
      setUploadProgress(0);
    }
  };

  const handleUploadToSupabase = async (uploadAllRaces = false) => {
    if (!parsedData) {
      toast.error('No data to upload');
      return;
    }

    setIsProcessing(true);
    try {
      const raceDate = parsedData.date || new Date().toISOString().split('T')[0];
      const selectedRaceData = parsedData.races?.find(r => r.number === selectedRace);
      const racesToUpload = uploadAllRaces ? parsedData.races : [selectedRaceData].filter(Boolean);
      
      let uploaded = 0;
      for (const race of racesToUpload || []) {
        if (!race) continue;
        
        // Prepare consensus scores
        const ensembleScores = race.horses?.reduce((acc, horse) => {
          acc[horse.programNumber] = {
            name: horse.name,
            consensusRank: horse.consensusRank,
            consensusScore: horse.consensusScore,
            mlOdds: horse.mlOdds
          };
          return acc;
        }, {} as Record<string, any>);

        const { error } = await supabase
          .from('model_reports')
          .upsert({
            model_type: 'trd_consensus',
            track_name: parsedData.track,
            race_date: raceDate,
            race_number: race.number,
            report_data: race as any,
            ensemble_scores: ensembleScores
          }, { 
            onConflict: 'model_type,track_name,race_date,race_number' 
          });

        if (error) {
          console.error('Upload error:', error);
          throw error;
        }
        uploaded++;
      }

      toast.success(`Uploaded ${uploaded} TRD report(s) - Dashboard will update live!`);
    } catch (err: any) {
      console.error('Upload error:', err);
      toast.error(err.message || 'Failed to upload TRD report');
    } finally {
      setIsProcessing(false);
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

  const selectedRaceData = parsedData?.races?.find(r => r.number === selectedRace);

  return (
    <div className="space-y-4">

      {/* Upload Card */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Upload TRD PDF
          </CardTitle>
          <CardDescription>
            Upload TRD consensus rankings to push to the live dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="block cursor-pointer">
            <div className="border-2 border-dashed border-blue-500/30 rounded-xl p-8 text-center hover:border-blue-500/50 hover:bg-blue-500/5 transition-all">
              {isProcessing ? (
                <div className="space-y-4">
                  <Loader2 className="h-12 w-12 mx-auto animate-spin text-blue-400" />
                  <p className="text-lg font-medium text-foreground">Processing PDF...</p>
                  <Progress value={uploadProgress} className="max-w-xs mx-auto" />
                </div>
              ) : (
                <>
                  <Upload className="h-12 w-12 mx-auto mb-4 text-blue-400" />
                  <p className="text-lg font-medium text-foreground mb-2">
                    Drop TRD PDF here or click to upload
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Supports TRD consensus ranking sheets
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
        </CardContent>
      </Card>

      {/* Parsed Data Display */}
      {parsedData && (
        <div className="space-y-4">
          {/* Track Info */}
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-foreground">{parsedData.track}</h3>
                  <p className="text-sm text-muted-foreground">{parsedData.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{parsedData.races?.length || 0} Races</Badge>
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                    TRD Model
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
              >
                R{race.number}
              </Button>
            ))}
          </div>

          {/* Race Data Table */}
          {selectedRaceData && (
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Race {selectedRaceData.number}</CardTitle>
                    <CardDescription>
                      {selectedRaceData.distance} • {selectedRaceData.surface}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleUploadToSupabase(false)}
                      disabled={isProcessing}
                      variant="outline"
                      className="gap-2"
                    >
                      <Database className="h-4 w-4" />
                      Upload Race
                    </Button>
                    <Button
                      onClick={() => handleUploadToSupabase(true)}
                      disabled={isProcessing}
                      className="gap-2 bg-blue-600 hover:bg-blue-700"
                    >
                      <TrendingUp className="h-4 w-4" />
                      Upload All Races
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="w-[50px]">Rank</TableHead>
                        <TableHead className="w-[50px]">PP</TableHead>
                        <TableHead>Horse</TableHead>
                        <TableHead>ML</TableHead>
                        <TableHead>Jockey</TableHead>
                        <TableHead>Trainer</TableHead>
                        <TableHead className="text-center">Score</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedRaceData.horses
                        ?.sort((a, b) => a.consensusRank - b.consensusRank)
                        .map((horse, idx) => (
                          <TableRow 
                            key={horse.programNumber}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => toggleHorseExpanded(horse.programNumber)}
                          >
                            <TableCell>
                              <Badge className={
                                idx === 0 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                                idx === 1 ? 'bg-gray-400/20 text-gray-300 border-gray-400/30' :
                                idx === 2 ? 'bg-orange-700/20 text-orange-400 border-orange-700/30' :
                                'bg-muted text-muted-foreground'
                              }>
                                #{horse.consensusRank}
                              </Badge>
                            </TableCell>
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
                                <span className="font-semibold text-foreground">{horse.name}</span>
                                {idx === 0 && <Trophy className="h-4 w-4 text-yellow-400" />}
                              </div>
                            </TableCell>
                            <TableCell className="font-mono font-bold text-green-400">
                              {horse.mlOdds || '-'}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {horse.jockey || '-'}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {horse.trainer || '-'}
                            </TableCell>
                            <TableCell className="text-center">
                              <span className={`text-lg font-bold ${getScoreColor(horse.consensusScore || 0)}`}>
                                {horse.consensusScore?.toFixed(0) || '-'}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default TrdModelUploadTab;
