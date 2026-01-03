import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Flame, 
  FileText, 
  Trophy, 
  RefreshCw, 
  Zap,
  TrendingUp,
  Clock,
  Star
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ModelReport {
  id: string;
  model_type: string;
  track_name: string;
  race_date: string;
  race_number: number;
  report_data: any;
  ensemble_scores: Record<string, any> | null;
  track_bias: any;
  bris_analysis: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

const LiveModelReports: React.FC = () => {
  const [reports, setReports] = useState<ModelReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<ModelReport | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Fetch initial reports
  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('model_reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setReports((data || []) as ModelReport[]);
      setLastUpdate(new Date());
    } catch (err: any) {
      console.error('Error fetching reports:', err);
      toast.error('Failed to load model reports');
    } finally {
      setIsLoading(false);
    }
  };

  // Set up realtime subscription
  useEffect(() => {
    fetchReports();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('model-reports-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'model_reports'
        },
        (payload) => {
          console.log('Realtime update received:', payload);
          
          if (payload.eventType === 'INSERT') {
            setReports(prev => [payload.new as ModelReport, ...prev]);
            toast.success(`New ${payload.new.model_type} report: ${payload.new.track_name} R${payload.new.race_number}`);
          } else if (payload.eventType === 'UPDATE') {
            setReports(prev => prev.map(r => 
              r.id === payload.new.id ? (payload.new as ModelReport) : r
            ));
            toast.info(`Updated: ${payload.new.track_name} R${payload.new.race_number}`);
          } else if (payload.eventType === 'DELETE') {
            setReports(prev => prev.filter(r => r.id !== payload.old.id));
          }
          
          setLastUpdate(new Date());
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getModelIcon = (type: string) => {
    switch (type) {
      case 'twinspires':
        return <Flame className="h-4 w-4 text-orange-400" />;
      case 'trd':
        return <FileText className="h-4 w-4 text-blue-400" />;
      default:
        return <Zap className="h-4 w-4 text-yellow-400" />;
    }
  };

  const getModelBadge = (type: string) => {
    const styles: Record<string, string> = {
      twinspires: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      trd: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      ord: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    };
    return styles[type] || 'bg-gray-500/20 text-gray-400';
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getTopHorses = (scores: Record<string, any>) => {
    if (!scores) return [];
    return Object.entries(scores)
      .map(([pp, data]) => ({ pp, ...data }))
      .sort((a, b) => (b.ensembleScore || 0) - (a.ensembleScore || 0))
      .slice(0, 3);
  };

  return (
    <Card className="bg-card border-border h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-400" />
              Live Model Reports
            </CardTitle>
            <CardDescription>
              Real-time updates from TwinSpires & TRD models
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {lastUpdate && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {lastUpdate.toLocaleTimeString()}
              </span>
            )}
            <Button size="sm" variant="outline" onClick={fetchReports} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" title="Live" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          {reports.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Flame className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No model reports uploaded yet</p>
              <p className="text-xs mt-1">Upload from the TwinSpires Model tab</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map(report => (
                <Card 
                  key={report.id} 
                  className={`cursor-pointer transition-all hover:bg-muted/50 ${
                    selectedReport?.id === report.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedReport(selectedReport?.id === report.id ? null : report)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getModelIcon(report.model_type)}
                        <div>
                          <p className="font-semibold text-foreground">
                            {report.track_name} - Race {report.race_number}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(report.race_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getModelBadge(report.model_type)}>
                          {report.model_type.toUpperCase()}
                        </Badge>
                      </div>
                    </div>

                    {/* Top Picks Preview */}
                    {report.ensemble_scores && (
                      <div className="mt-2 flex gap-2">
                        {getTopHorses(report.ensemble_scores).map((horse, idx) => (
                          <div key={horse.pp} className="flex items-center gap-1 text-xs">
                            {idx === 0 && <Trophy className="h-3 w-3 text-yellow-400" />}
                            <span className={`font-bold ${getScoreColor(horse.ensembleScore || 0)}`}>
                              #{horse.pp}
                            </span>
                            <span className="text-muted-foreground truncate max-w-[60px]">
                              {horse.name?.split(' ')[0]}
                            </span>
                            <span className={`font-mono ${getScoreColor(horse.ensembleScore || 0)}`}>
                              {horse.ensembleScore?.toFixed(0)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Expanded Details */}
                    {selectedReport?.id === report.id && report.ensemble_scores && (
                      <div className="mt-4 pt-3 border-t border-border">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/30">
                              <TableHead className="w-[50px]">PP</TableHead>
                              <TableHead>Horse</TableHead>
                              <TableHead className="text-center">Ensemble</TableHead>
                              <TableHead className="text-center">BRIS</TableHead>
                              <TableHead className="text-center">Bonuses</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {Object.entries(report.ensemble_scores)
                              .map(([pp, data]: [string, any]) => ({ pp, ...data }))
                              .sort((a, b) => (b.ensembleScore || 0) - (a.ensembleScore || 0))
                              .map((horse, idx) => (
                                <TableRow key={horse.pp}>
                                  <TableCell>
                                    <Badge variant="outline">{horse.pp}</Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-1">
                                      {idx === 0 && <Trophy className="h-3 w-3 text-yellow-400" />}
                                      <span className="font-semibold">{horse.name}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <span className={`text-lg font-bold ${getScoreColor(horse.ensembleScore || 0)}`}>
                                      {horse.ensembleScore?.toFixed(0) || '-'}
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {horse.brisPickRank ? (
                                      <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                                        #{horse.brisPickRank}
                                      </Badge>
                                    ) : '-'}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <div className="flex justify-center gap-1 text-xs">
                                      {horse.jockeyBonus > 0 && (
                                        <Badge variant="outline" className="text-green-400 border-green-400/30">
                                          J+{horse.jockeyBonus}
                                        </Badge>
                                      )}
                                      {horse.trainerBonus > 0 && (
                                        <Badge variant="outline" className="text-green-400 border-green-400/30">
                                          T+{horse.trainerBonus}
                                        </Badge>
                                      )}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>

                        {report.bris_analysis && (
                          <div className="mt-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                            <p className="text-xs text-blue-400 font-semibold mb-1">BRIS Analysis</p>
                            <p className="text-sm text-foreground">{report.bris_analysis}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default LiveModelReports;
