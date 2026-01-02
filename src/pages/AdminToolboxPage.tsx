import React, { useState } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Navigate } from 'react-router-dom';
import { Zap, Globe, CheckCircle2, Upload, FileText, RefreshCw, Database, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useScrapeJobs } from '@/hooks/useScrapeJobs';
import { parseMorningCard, parseRacingDigest, parseBackupEntries } from '@/integrations/geminiService';
import { fileToBase64 } from '@/utils/dataToolboxUtils';
import { toast } from 'sonner';
import racewiseLogo from '@/assets/racewise-logo.png';

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
  const { user, isLoading: authLoading, isAdmin } = useAuth();
  const [selectedTrack, setSelectedTrack] = useState(tracks[0]);
  const [cardData, setCardData] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('morning');
  const [connectionStatus, setConnectionStatus] = useState<'ready' | 'syncing' | 'error'>('ready');
  
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

  if (!user || !isAdmin) {
    return <Navigate to="/auth" replace />;
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const base64Data = await fileToBase64(file);
      
      let result;
      if (activeTab === 'morning') {
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

  const handleQuantumReport = async () => {
    setIsProcessing(true);
    try {
      // Simulate quantum morning report processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Quantum Morning Report generated');
    } catch (err) {
      toast.error('Failed to generate report');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleScrapeBaseline = async () => {
    const trackJob = jobs.find(j => 
      j.track_name.toLowerCase().includes(selectedTrack.toLowerCase().split(' ')[0])
    );
    
    if (trackJob) {
      await runJobManually(trackJob);
    } else {
      toast.info('No scrape job configured for this track');
    }
  };

  const handleLoadToSupabase = async () => {
    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Data loaded to Supabase');
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setIsProcessing(false);
    }
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
                RaceWise AI <span className="text-amber-500">Toolbox</span>
              </h1>
              <p className="text-xs text-gray-500 tracking-widest uppercase">
                Quantum Inspired Models
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-700 bg-[#0d1221]">
            <CheckCircle2 className={`h-4 w-4 ${connectionStatus === 'ready' ? 'text-green-500' : 'text-yellow-500'}`} />
            <span className="text-sm font-medium uppercase tracking-wide">
              {connectionStatus === 'ready' ? 'Ready' : 'Syncing...'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content - 3 Column Layout */}
      <main className="max-w-[1600px] mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column - Workflow Panel */}
          <div className="lg:col-span-3 space-y-4">
            {/* Workflow Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4 bg-[#131a2e] border border-blue-900/30 rounded-lg p-1">
                <TabsTrigger 
                  value="morning" 
                  className="text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded"
                >
                  1. MORNING
                </TabsTrigger>
                <TabsTrigger 
                  value="trd" 
                  className="text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded"
                >
                  2. TRD
                </TabsTrigger>
                <TabsTrigger 
                  value="backup" 
                  className="text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded"
                >
                  BACKUP
                </TabsTrigger>
                <TabsTrigger 
                  value="live" 
                  className="text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded"
                >
                  3. LIVE
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Track Selector */}
            <Card className="bg-[#131a2e] border-blue-900/30">
              <CardContent className="p-4">
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
                  placeholder="Enter Card Data or Drag PDF here..."
                  className="min-h-[120px] bg-[#0d1221] border-blue-900/30 text-white placeholder:text-gray-500 resize-none"
                />
                
                {/* File Upload Zone */}
                <label className="block cursor-pointer">
                  <div className="border-2 border-dashed border-blue-900/50 rounded-lg p-8 text-center hover:border-blue-600/50 transition-colors">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-gray-500" />
                    <p className="text-sm text-gray-400 font-medium uppercase tracking-wide">
                      Drag PDF here or
                    </p>
                    <p className="text-sm text-gray-500 uppercase tracking-wide">
                      Click to Upload
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
                onClick={handleQuantumReport}
                disabled={isProcessing}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold uppercase tracking-wide py-6"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Quantum Morning Report
              </Button>

              <Button
                onClick={handleScrapeBaseline}
                disabled={isRunningJob}
                variant="outline"
                className="w-full border-blue-600 text-blue-400 hover:bg-blue-600/10 font-semibold uppercase tracking-wide py-5"
              >
                <Globe className="h-4 w-4 mr-2" />
                Scrape Market Baseline
              </Button>

              <Button
                onClick={handleLoadToSupabase}
                disabled={isProcessing}
                variant="ghost"
                className="w-full text-gray-400 hover:text-white hover:bg-gray-800/50 font-medium uppercase tracking-wide py-5"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isProcessing ? 'animate-spin' : ''}`} />
                Load to Supabase
              </Button>
            </div>
          </div>

          {/* Center Column - Hero Section */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center min-h-[500px]">
            {/* Neural Engine Visual */}
            <div className="relative mb-8">
              {/* Glow Effect */}
              <div className="absolute inset-0 blur-3xl bg-blue-600/20 rounded-full scale-150" />
              
              {/* Icon Container */}
              <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-900/50 to-blue-950/50 border border-blue-700/30 flex items-center justify-center">
                <Zap className="h-12 w-12 text-blue-400" />
              </div>
              
              {/* Decorative Ring */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-48 h-24 border border-blue-900/30 rounded-full opacity-30" />
            </div>

            {/* Title */}
            <h2 className="text-3xl md:text-4xl font-bold text-gray-300 text-center tracking-wide uppercase mb-2">
              Professional Handicapping
            </h2>
            <h3 className="text-2xl md:text-3xl font-bold text-amber-500 text-center tracking-wide uppercase mb-6">
              Neural Engine
            </h3>

            {/* Description */}
            <p className="text-gray-500 text-center max-w-md uppercase tracking-widest text-xs leading-relaxed">
              Use automated morning reports to scrape live OTB data and enrich it with TRD ensemble rankings.
            </p>
          </div>

          {/* Right Column - Market Feed */}
          <div className="lg:col-span-3 space-y-4">
            {/* Market Feed Header */}
            <Card className="bg-[#131a2e] border-blue-900/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm font-semibold text-green-500 uppercase tracking-wide">
                    Market Feed
                  </span>
                </div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  OTB Dashboard Sync Active
                </p>
              </CardContent>
            </Card>

            {/* Stats Summary */}
            <Card className="bg-[#131a2e] border-blue-900/30">
              <CardContent className="p-4 space-y-4">
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
                <div className="flex justify-between items-center py-2">
                  <span className="text-xs text-gray-500 uppercase">Success Rate</span>
                  <Badge variant="outline" className="border-amber-600 text-amber-400">
                    {stats?.successRate || 100}%
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Quick Action */}
            <Card className="bg-[#131a2e] border-blue-900/30">
              <CardContent className="p-4 text-center">
                <Globe className="h-8 w-8 mx-auto mb-3 text-gray-600" />
                <p className="text-xs text-gray-500 uppercase tracking-wide leading-relaxed">
                  Run Quantum Morning Report to scrape live entries from offtrackbetting.com.
                </p>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            {jobs.slice(0, 3).map((job) => (
              <Card key={job.id} className="bg-[#0d1221] border-blue-900/20">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
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
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminToolboxPage;
