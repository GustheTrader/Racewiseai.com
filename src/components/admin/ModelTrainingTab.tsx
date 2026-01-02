import React, { useState } from 'react';
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
  Pause, 
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
  Database
} from 'lucide-react';
import { toast } from 'sonner';

interface ModelConfig {
  id: string;
  name: string;
  type: 'gradient_boost' | 'neural_net' | 'ensemble' | 'random_forest';
  status: 'idle' | 'training' | 'completed' | 'failed';
  accuracy?: number;
  features: string[];
  createdAt: string;
  trainedAt?: string;
  epochs?: number;
  progress?: number;
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

const ModelTrainingTab: React.FC = () => {
  const [activeTab, setActiveTab] = useState('train');
  const [modelName, setModelName] = useState('');
  const [modelType, setModelType] = useState<string>('gradient_boost');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    'speed_figure', 'pace_rating', 'class_rating', 'jockey_stats', 'trainer_stats'
  ]);
  const [epochs, setEpochs] = useState(100);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);

  const [models, setModels] = useState<ModelConfig[]>([
    {
      id: '1',
      name: 'SpeedClass-v1',
      type: 'gradient_boost',
      status: 'completed',
      accuracy: 67.4,
      features: ['speed_figure', 'class_rating', 'pace_rating'],
      createdAt: '2024-01-10T10:00:00Z',
      trainedAt: '2024-01-10T12:30:00Z',
    },
    {
      id: '2',
      name: 'FullFeature-NN',
      type: 'neural_net',
      status: 'completed',
      accuracy: 71.2,
      features: ['speed_figure', 'class_rating', 'jockey_stats', 'trainer_stats', 'track_bias', 'odds_movement'],
      createdAt: '2024-01-12T08:00:00Z',
      trainedAt: '2024-01-12T14:45:00Z',
    },
  ]);

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
    setTrainingProgress(0);

    const newModel: ModelConfig = {
      id: Date.now().toString(),
      name: modelName,
      type: modelType as ModelConfig['type'],
      status: 'training',
      features: selectedFeatures,
      createdAt: new Date().toISOString(),
      epochs,
      progress: 0,
    };

    setModels(prev => [newModel, ...prev]);
    toast.info(`Training started for ${modelName}`);

    // Simulate training progress
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setTrainingProgress(i);
      setModels(prev => prev.map(m => 
        m.id === newModel.id ? { ...m, progress: i } : m
      ));
    }

    // Complete training
    const accuracy = 60 + Math.random() * 15;
    setModels(prev => prev.map(m => 
      m.id === newModel.id 
        ? { ...m, status: 'completed', accuracy: parseFloat(accuracy.toFixed(1)), trainedAt: new Date().toISOString(), progress: 100 }
        : m
    ));

    setIsTraining(false);
    setTrainingProgress(0);
    setModelName('');
    toast.success(`Model ${modelName} trained successfully! Accuracy: ${accuracy.toFixed(1)}%`);
  };

  const handleDeleteModel = (modelId: string) => {
    setModels(prev => prev.filter(m => m.id !== modelId));
    toast.success('Model deleted');
  };

  const getStatusBadge = (status: ModelConfig['status']) => {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20">
          <Brain className="h-6 w-6 text-purple-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Model Training</h2>
          <p className="text-sm text-muted-foreground">Build and manage AI prediction models</p>
        </div>
      </div>

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
                      <span className="text-muted-foreground">Training Progress</span>
                      <span className="text-primary font-medium">{trainingProgress}%</span>
                    </div>
                    <Progress value={trainingProgress} className="h-2" />
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
            <CardHeader>
              <CardTitle>Trained Models</CardTitle>
              <CardDescription>Manage your prediction models</CardDescription>
            </CardHeader>
            <CardContent>
              {models.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No models trained yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {models.map(model => (
                    <div 
                      key={model.id} 
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Brain className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">{model.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {MODEL_TYPES.find(t => t.id === model.type)?.label}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {model.features.length} features
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {model.status === 'training' && model.progress !== undefined && (
                          <div className="w-24">
                            <Progress value={model.progress} className="h-2" />
                          </div>
                        )}
                        
                        {model.accuracy && (
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-400">{model.accuracy}%</p>
                            <p className="text-xs text-muted-foreground">Accuracy</p>
                          </div>
                        )}

                        {getStatusBadge(model.status)}

                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon"
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
                <p className="text-3xl font-bold text-foreground">{models.filter(m => m.status === 'completed').length}</p>
                <p className="text-sm text-muted-foreground">Trained Models</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-400" />
                <p className="text-3xl font-bold text-foreground">
                  {models.filter(m => m.accuracy).length > 0 
                    ? (models.filter(m => m.accuracy).reduce((a, m) => a + (m.accuracy || 0), 0) / models.filter(m => m.accuracy).length).toFixed(1)
                    : '—'}%
                </p>
                <p className="text-sm text-muted-foreground">Avg Accuracy</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-6 text-center">
                <BarChart3 className="h-8 w-8 mx-auto mb-2 text-blue-400" />
                <p className="text-3xl font-bold text-foreground">
                  {models.filter(m => m.accuracy).sort((a, b) => (b.accuracy || 0) - (a.accuracy || 0))[0]?.accuracy?.toFixed(1) || '—'}%
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
              {models.filter(m => m.accuracy).length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No trained models to compare</p>
              ) : (
                <div className="space-y-4">
                  {models
                    .filter(m => m.accuracy)
                    .sort((a, b) => (b.accuracy || 0) - (a.accuracy || 0))
                    .map((model, idx) => (
                      <div key={model.id} className="flex items-center gap-4">
                        <span className="text-sm font-medium w-6 text-muted-foreground">#{idx + 1}</span>
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="font-medium text-foreground">{model.name}</span>
                            <span className="text-green-400 font-bold">{model.accuracy}%</span>
                          </div>
                          <Progress value={model.accuracy} className="h-2" />
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
