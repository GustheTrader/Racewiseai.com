import React, { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Brain,
  Play,
  Trash2,
  Download,
  BarChart3,
  Zap,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Settings,
  TrendingUp,
  Database,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

type ModelStatus = 'idle' | 'training' | 'completed' | 'failed';

interface TrainedModel {
  id: string;
  name: string;
  model_type: string;
  status: ModelStatus;
  accuracy: number | null;
  log_loss: number | null;
  training_samples: number | null;
  features: string[];
  epochs: number;
  notes: string | null;
  error: string | null;
  weights: Record<string, number> | null;
  created_at: string;
  trained_at: string | null;
}

const AVAILABLE_FEATURES = [
  { id: 'speed_figure', label: 'Speed Figures', category: 'Performance' },
  { id: 'pace_rating', label: 'Pace Ratings', category: 'Performance' },
  { id: 'class_rating', label: 'Class Rating', category: 'Performance' },
  { id: 'jockey_stats', label: 'Jockey Statistics', category: 'Connections' },
  { id: 'trainer_stats', label: 'Trainer Statistics', category: 'Connections' },
  { id: 'jockey_trainer_combo', label: 'Jockey-Trainer Combo', category: 'Connections' },
  { id: 'track_bias', label: 'Track Bias', category: 'Track' },
  { id: 'surface_preference', label: 'Surface Preference', category: 'Track' },
  { id: 'distance_preference', label: 'Distance Preference', category: 'Form' },
  { id: 'days_since_race', label: 'Days Since Last Race', category: 'Form' },
  { id: 'weight_carried', label: 'Weight Carried', category: 'Form' },
  { id: 'post_position', label: 'Post Position', category: 'Race' },
  { id: 'field_size', label: 'Field Size', category: 'Race' },
  { id: 'morning_line_odds', label: 'Morning Line Odds', category: 'Market' },
  { id: 'odds_movement', label: 'Odds Movement', category: 'Market' },
];

const MODEL_TYPES = [
  { id: 'gradient_boost', label: 'Gradient Boosting', description: 'Fast, accurate, handles mixed data' },
  { id: 'neural_net', label: 'Neural Network', description: 'Deep learning for complex patterns' },
  { id: 'ensemble', label: 'Ensemble', description: 'Combines multiple models' },
  { id: 'random_forest', label: 'Random Forest', description: 'Robust, interpretable results' },
];

const asFeatures = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];

const ModelTrainingTab: React.FC = () => {
  const [activeTab, setActiveTab] = useState('train');
  const [modelName, setModelName] = useState('');
  const [modelType, setModelType] = useState<string>('gradient_boost');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    'speed_figure', 'pace_rating', 'class_rating', 'jockey_stats', 'trainer_stats'
  ]);
  const [epochs, setEpochs] = useState(100);
  const [isTraining, setIsTraining] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [models, setModels] = useState<TrainedModel[]>([]);

  const loadModels = useCallback(async () => {
    const { data, error } = await supabase
      .from('trained_models')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error(`Could not load models: ${error.message}`);
      setIsLoading(false);
      return;
    }

    setModels(
      (data ?? []).map((row) => ({
        id: row.id,
        name: row.name,
        model_type: row.model_type,
        status: (row.status as ModelStatus) ?? 'idle',
        accuracy: row.accuracy === null ? null : Number(row.accuracy),
        log_loss: row.log_loss === null ? null : Number(row.log_loss),
        training_samples: row.training_samples,
        features: asFeatures(row.features),
        epochs: row.epochs,
        notes: row.notes,
        error: row.error,
        weights: (row.weights as Record<string, number> | null) ?? null,
        created_at: row.created_at,
        trained_at: row.trained_at,
      })),
    );
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadModels();

    const channel = supabase
      .channel('trained-models-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trained_models' }, () => {
        loadModels();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadModels]);

  const toggleFeature = (featureId: string) => {
    setSelectedFeatures(prev =>
      prev.includes(featureId)
        ? prev.filter(f => f !== featureId)
        : [...prev, featureId]
    );
  };

  const handleStartTraining = async () => {
    if (!modelName.trim()) {
      toast.error('Please enter a model name');
      return;
    }
    if (selectedFeatures.length < 3) {
      toast.error('Select at least 3 features');
      return;
    }

    setIsTraining(true);

    try {
      const { data: session } = await supabase.auth.getUser();
      const { data: inserted, error: insertError } = await supabase
        .from('trained_models')
        .insert({
          name: modelName.trim(),
          model_type: modelType,
          features: selectedFeatures,
          epochs,
          status: 'training',
          created_by: session?.user?.id ?? null,
        })
        .select('id')
        .single();

      if (insertError) throw insertError;

      toast.info(`Training started for ${modelName}`);
      await loadModels();

      const { data, error } = await supabase.functions.invoke('train-model', {
        body: { modelId: inserted.id },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      await loadModels();
      const acc = data?.holdout?.accuracy;
      toast.success(
        acc != null
          ? `${modelName} trained on ${data.trainRaces} races — holdout accuracy ${Number(acc).toFixed(1)}%`
          : `${modelName} trained successfully`,
      );
      setModelName('');
      setActiveTab('models');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Training failed';
      toast.error(message);
      await loadModels();
    } finally {
      setIsTraining(false);
    }
  };

  const handleRetrain = async (model: TrainedModel) => {
    setIsTraining(true);
    try {
      const { data, error } = await supabase.functions.invoke('train-model', {
        body: { modelId: model.id },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success(`${model.name} retrained`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Retraining failed');
    } finally {
      await loadModels();
      setIsTraining(false);
    }
  };

  const handleDeleteModel = async (modelId: string) => {
    const { error } = await supabase.from('trained_models').delete().eq('id', modelId);
    if (error) {
      toast.error(`Delete failed: ${error.message}`);
      return;
    }
    setModels(prev => prev.filter(m => m.id !== modelId));
    toast.success('Model deleted');
  };

  const handleDownload = (model: TrainedModel) => {
    const blob = new Blob([JSON.stringify(model, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${model.name.replace(/\s+/g, '-').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: ModelStatus) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30"><CheckCircle2 className="h-3 w-3 mr-1" />Trained</Badge>;
      case 'training':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30"><Loader2 className="h-3 w-3 mr-1 animate-spin" />Training</Badge>;
      case 'failed':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30"><AlertCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Idle</Badge>;
    }
  };

  const groupedFeatures = AVAILABLE_FEATURES.reduce((acc, feature) => {
    if (!acc[feature.category]) acc[feature.category] = [];
    acc[feature.category].push(feature);
    return acc;
  }, {} as Record<string, typeof AVAILABLE_FEATURES>);

  const trainedModels = models.filter(m => m.status === 'completed' && m.accuracy !== null);

  return (
    <div className="space-y-4">

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/50">
          <TabsTrigger value="train" className="gap-2">
            <Zap className="h-4 w-4" />
            Train New
          </TabsTrigger>
          <TabsTrigger value="models" className="gap-2">
            <Database className="h-4 w-4" />
            Models ({models.length})
          </TabsTrigger>
          <TabsTrigger value="metrics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Metrics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="train" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Configuration Panel */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Model Configuration
                </CardTitle>
                <CardDescription>
                  Trains on historical race results and past performances stored in your database.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Model Name</Label>
                  <Input
                    placeholder="e.g., SpeedClass-v2"
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    disabled={isTraining}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Model Type</Label>
                  <Select value={modelType} onValueChange={setModelType} disabled={isTraining}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MODEL_TYPES.map(type => (
                        <SelectItem key={type.id} value={type.id}>
                          <div className="flex flex-col">
                            <span>{type.label}</span>
                            <span className="text-xs text-muted-foreground">{type.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Training Epochs</Label>
                  <Input
                    type="number"
                    min={10}
                    max={500}
                    value={epochs}
                    onChange={(e) => setEpochs(parseInt(e.target.value) || 100)}
                    disabled={isTraining}
                  />
                </div>

                {isTraining && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Training in progress</span>
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    </div>
                    <Progress value={undefined} className="h-2" />
                  </div>
                )}

                <Button
                  onClick={handleStartTraining}
                  disabled={isTraining || !modelName.trim() || selectedFeatures.length < 3}
                  className="w-full"
                >
                  {isTraining ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Training...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Start Training
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Feature Selection */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Feature Selection
                </CardTitle>
                <CardDescription>
                  Selected: {selectedFeatures.length} / {AVAILABLE_FEATURES.length}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-4">
                    {Object.entries(groupedFeatures).map(([category, features]) => (
                      <div key={category}>
                        <h4 className="text-sm font-semibold text-muted-foreground mb-2">{category}</h4>
                        <div className="space-y-2">
                          {features.map(feature => (
                            <div
                              key={feature.id}
                              className="flex items-center space-x-2 p-2 rounded hover:bg-muted/50 cursor-pointer"
                              onClick={() => !isTraining && toggleFeature(feature.id)}
                            >
                              <Checkbox
                                checked={selectedFeatures.includes(feature.id)}
                                disabled={isTraining}
                              />
                              <Label className="cursor-pointer flex-1">{feature.label}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="models" className="mt-4">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Trained Models</CardTitle>
                <CardDescription>Saved to your database and shared across sessions</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={loadModels} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Loader2 className="h-8 w-8 mx-auto mb-3 animate-spin" />
                  <p>Loading models…</p>
                </div>
              ) : models.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No models trained yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {models.map(model => (
                    <div
                      key={model.id}
                      className="p-4 rounded-lg bg-muted/30 border border-border"
                    >
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Brain className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground">{model.name}</h4>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <Badge variant="outline" className="text-xs">
                                {MODEL_TYPES.find(t => t.id === model.model_type)?.label ?? model.model_type}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {model.features.length} features
                              </span>
                              {model.training_samples ? (
                                <span className="text-xs text-muted-foreground">
                                  {model.training_samples} samples
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          {model.accuracy !== null && (
                            <div className="text-right">
                              <p className="text-lg font-bold text-green-400">{model.accuracy.toFixed(1)}%</p>
                              <p className="text-xs text-muted-foreground">Holdout accuracy</p>
                            </div>
                          )}
                          {model.log_loss !== null && (
                            <div className="text-right">
                              <p className="text-lg font-bold text-blue-400">{model.log_loss.toFixed(3)}</p>
                              <p className="text-xs text-muted-foreground">Log loss</p>
                            </div>
                          )}

                          {getStatusBadge(model.status)}

                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Retrain"
                              onClick={() => handleRetrain(model)}
                              disabled={isTraining || model.status === 'training'}
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Download weights"
                              onClick={() => handleDownload(model)}
                              disabled={model.status !== 'completed'}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteModel(model.id)}
                              disabled={model.status === 'training'}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {model.error && (
                        <p className="mt-3 text-xs text-destructive flex items-start gap-2">
                          <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                          {model.error}
                        </p>
                      )}
                      {model.notes && (
                        <p className="mt-3 text-xs text-muted-foreground">{model.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-card border-border">
              <CardContent className="p-6 text-center">
                <Brain className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-3xl font-bold text-foreground">{trainedModels.length}</p>
                <p className="text-sm text-muted-foreground">Trained Models</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-400" />
                <p className="text-3xl font-bold text-foreground">
                  {trainedModels.length > 0
                    ? (trainedModels.reduce((a, m) => a + (m.accuracy || 0), 0) / trainedModels.length).toFixed(1)
                    : '—'}%
                </p>
                <p className="text-sm text-muted-foreground">Avg Accuracy</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-6 text-center">
                <BarChart3 className="h-8 w-8 mx-auto mb-2 text-blue-400" />
                <p className="text-3xl font-bold text-foreground">
                  {[...trainedModels].sort((a, b) => (b.accuracy || 0) - (a.accuracy || 0))[0]?.accuracy?.toFixed(1) || '—'}%
                </p>
                <p className="text-sm text-muted-foreground">Best Accuracy</p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card border-border mt-4">
            <CardHeader>
              <CardTitle>Model Performance Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              {trainedModels.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No trained models to compare</p>
              ) : (
                <div className="space-y-4">
                  {[...trainedModels]
                    .sort((a, b) => (b.accuracy || 0) - (a.accuracy || 0))
                    .map((model, idx) => (
                      <div key={model.id} className="flex items-center gap-4">
                        <span className="text-sm font-medium w-6 text-muted-foreground">#{idx + 1}</span>
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="font-medium text-foreground">{model.name}</span>
                            <span className="text-green-400 font-bold">{model.accuracy?.toFixed(1)}%</span>
                          </div>
                          <Progress value={model.accuracy ?? 0} className="h-2" />
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ModelTrainingTab;
