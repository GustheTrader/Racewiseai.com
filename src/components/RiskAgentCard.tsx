import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Upload, 
  Link, 
  AlertTriangle, 
  CheckCircle, 
  TrendingDown,
  TrendingUp,
  Eye,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { useVisualAssessment } from '@/hooks/useVisualAssessment';
import { RiskTier, riskTierColors, riskTierLabels } from '@/types/VisualAssessmentTypes';

interface RiskAgentCardProps {
  horseId?: string;
  raceId?: string;
  entryId?: string;
  horseName?: string;
}

export function RiskAgentCard({ horseId, raceId, entryId, horseName }: RiskAgentCardProps) {
  const [videoUrl, setVideoUrl] = useState('');
  const [isReturnFromLayoff, setIsReturnFromLayoff] = useState(false);
  const [isClassDrop, setIsClassDrop] = useState(false);
  const [previousInjury, setPreviousInjury] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { isAnalyzing, result, error, analyzeFromUrl, analyzeFromFile, clearResult } = useVisualAssessment();

  const handleUrlAnalysis = async () => {
    if (!videoUrl.trim()) return;
    await analyzeFromUrl(videoUrl, {
      horse_id: horseId,
      race_id: raceId,
      entry_id: entryId,
      assessment_type: 'paddock',
      is_return_from_layoff: isReturnFromLayoff,
      is_class_drop: isClassDrop,
      previous_injury_flag: previousInjury
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    await analyzeFromFile(file, {
      horse_id: horseId,
      race_id: raceId,
      entry_id: entryId,
      assessment_type: 'paddock',
      is_return_from_layoff: isReturnFromLayoff,
      is_class_drop: isClassDrop,
      previous_injury_flag: previousInjury
    });
  };

  const getRiskIcon = (tier: RiskTier) => {
    switch (tier) {
      case 'LOW': return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'MODERATE': return <Eye className="h-5 w-5 text-yellow-400" />;
      case 'ELEVATED': return <TrendingUp className="h-5 w-5 text-orange-400" />;
      case 'HIGH': return <AlertTriangle className="h-5 w-5 text-red-400" />;
    }
  };

  const getScoreColor = (score: number, inverse = false) => {
    const adjustedScore = inverse ? 100 - score : score;
    if (adjustedScore <= 25) return 'text-green-400';
    if (adjustedScore <= 50) return 'text-yellow-400';
    if (adjustedScore <= 75) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">CV/VLM Risk Agent</CardTitle>
          </div>
          {result && (
            <Button variant="ghost" size="sm" onClick={clearResult}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Reset
            </Button>
          )}
        </div>
        <CardDescription>
          {horseName ? `Analyzing: ${horseName}` : 'Analyze paddock/warm-up footage for lameness and behavior'}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!result ? (
          <>
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </TabsTrigger>
                <TabsTrigger value="url">
                  <Link className="h-4 w-4 mr-2" />
                  URL
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="upload" className="space-y-3">
                <div 
                  className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload paddock image/video
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Supports JPEG, PNG, MP4, MOV
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </TabsContent>
              
              <TabsContent value="url" className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="video-url">Video/Image URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="video-url"
                      placeholder="https://..."
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                    />
                    <Button onClick={handleUrlAnalysis} disabled={isAnalyzing || !videoUrl.trim()}>
                      {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Analyze'}
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="space-y-3 pt-2 border-t border-border">
              <Label className="text-sm font-medium">Context Flags</Label>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="layoff" 
                    checked={isReturnFromLayoff}
                    onCheckedChange={(c) => setIsReturnFromLayoff(!!c)}
                  />
                  <Label htmlFor="layoff" className="text-sm">Return from layoff</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="classdrop" 
                    checked={isClassDrop}
                    onCheckedChange={(c) => setIsClassDrop(!!c)}
                  />
                  <Label htmlFor="classdrop" className="text-sm">Class drop</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="injury" 
                    checked={previousInjury}
                    onCheckedChange={(c) => setPreviousInjury(!!c)}
                  />
                  <Label htmlFor="injury" className="text-sm">Previous injury</Label>
                </div>
              </div>
            </div>

            {isAnalyzing && (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
                  <p className="text-sm text-muted-foreground">Analyzing visual indicators...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-4">
            {/* Risk Tier Badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getRiskIcon(result.risk_tier as RiskTier)}
                <Badge className={riskTierColors[result.risk_tier as RiskTier]}>
                  {riskTierLabels[result.risk_tier as RiskTier]}
                </Badge>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{result.overall_risk_score}</p>
                <p className="text-xs text-muted-foreground">Overall Risk Score</p>
              </div>
            </div>

            {/* Score Gauges */}
            <div className="grid grid-cols-2 gap-3">
              <ScoreGauge 
                label="Lameness Risk" 
                value={result.scores.lameness_risk} 
                color={getScoreColor(result.scores.lameness_risk)}
              />
              <ScoreGauge 
                label="Gait Symmetry" 
                value={result.scores.gait_symmetry}
                color={getScoreColor(result.scores.gait_symmetry, true)}
                inverse
              />
              <ScoreGauge 
                label="Warmup Intensity" 
                value={result.scores.warmup_intensity}
                color={getScoreColor(result.scores.warmup_intensity, true)}
                inverse
              />
              <ScoreGauge 
                label="Nervousness" 
                value={result.scores.nervousness_score}
                color={getScoreColor(result.scores.nervousness_score)}
              />
            </div>

            {/* Behavioral Indicators */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-muted/30 rounded p-2">
                <p className="text-muted-foreground text-xs">Head Position</p>
                <p className="font-medium capitalize">{result.behavioral.head_position || 'N/A'}</p>
              </div>
              <div className="bg-muted/30 rounded p-2">
                <p className="text-muted-foreground text-xs">Ear Position</p>
                <p className="font-medium capitalize">{result.behavioral.ear_position || 'N/A'}</p>
              </div>
            </div>

            {/* Red Flags */}
            {result.red_flags.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  <p className="font-medium text-red-400 text-sm">Red Flags Detected</p>
                </div>
                <ul className="text-sm text-red-300 space-y-1">
                  {result.red_flags.map((flag, i) => (
                    <li key={i}>• {flag}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Model Adjustment */}
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="font-medium text-sm">Model Adjustment</p>
                <Badge variant={result.model_adjustment_suggestion.adjustment < 0 ? 'destructive' : 'default'}>
                  {result.model_adjustment_suggestion.adjustment > 0 ? '+' : ''}
                  {Math.round(result.model_adjustment_suggestion.adjustment * 100)}%
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {result.model_adjustment_suggestion.reason}
              </p>
            </div>

            {/* Confidence */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Analysis Confidence</span>
              <span className="font-medium">{Math.round(result.confidence * 100)}%</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ScoreGauge({ 
  label, 
  value, 
  color, 
  inverse = false 
}: { 
  label: string; 
  value: number; 
  color: string;
  inverse?: boolean;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className={`text-sm font-medium ${color}`}>{value}</span>
      </div>
      <Progress 
        value={value} 
        className="h-2" 
      />
      {inverse && (
        <p className="text-[10px] text-muted-foreground">Higher is better</p>
      )}
    </div>
  );
}

export default RiskAgentCard;
