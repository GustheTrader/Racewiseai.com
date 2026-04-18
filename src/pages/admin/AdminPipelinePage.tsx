import React, { useState, useRef, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import {
  TrendingUp, RefreshCw, ChevronDown, Download, Zap,
  LayoutGrid, Star, FileText, AlertCircle, Cpu, FileUp, MousePointer2,
  Copy, Check, Share2, Award,
} from 'lucide-react';
import { toast } from 'sonner';
import { parseMorningCard, parseRacingDigest, parseBackupEntries } from '@/integrations/geminiService';
import type { PipelineResult, Horse } from '@/types/DataToolboxTypes';
import {
  convertToCSV, convertToXML, downloadFile, fileToBase64, processHandicapping,
} from '@/utils/dataToolboxUtils';

const TRACKS = [
  { id: 'santaanita', name: 'Santa Anita Park' },
  { id: 'turfway', name: 'Turfway Park' },
  { id: 'gulfstream', name: 'Gulfstream Park' },
  { id: 'aqueduct', name: 'Aqueduct' },
  { id: 'fairgrounds', name: 'Fair Grounds' },
  { id: 'oaklawn', name: 'Oaklawn Park' },
  { id: 'tampa', name: 'Tampa Bay Downs' },
  { id: 'losalamitos', name: 'Los Alamitos QH' },
  { id: 'custom', name: 'Other / Custom...' },
];

type ToolMode = 'morning_card' | 'digest' | 'entry';
type ActiveTab = 'preview' | 'betting_sheet' | 'rankings' | 'csv' | 'betting_table' | 'xml';

const getTopSixWithTies = (horses: Horse[]) => {
  const sorted = [...horses].sort((a, b) => b.modelScore - a.modelScore);
  if (sorted.length <= 6) return sorted;
  const cutoffScore = sorted[5].modelScore;
  return sorted.filter((h, idx) => idx < 6 || h.modelScore === cutoffScore);
};

const AdminPipelinePage: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState<{ file: File; base64: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [result, setResult] = useState<PipelineResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('preview');
  const [toolMode, setToolMode] = useState<ToolMode>('morning_card');
  const [selectedTrackId, setSelectedTrackId] = useState(TRACKS[0].id);
  const [customTrackName, setCustomTrackName] = useState('');
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle');
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressInterval = useRef<number | null>(null);

  const getEffectiveTrackName = () =>
    selectedTrackId === 'custom'
      ? customTrackName
      : TRACKS.find(t => t.id === selectedTrackId)?.name || '';

  const startProgress = (message: string) => {
    setProgress(0);
    setStatusMessage(message);
    if (progressInterval.current) window.clearInterval(progressInterval.current);
    progressInterval.current = window.setInterval(() => {
      setProgress(prev => (prev < 94 ? prev + 1 : prev));
    }, 140);
  };

  const endProgress = (message = 'Processing complete.') => {
    if (progressInterval.current) window.clearInterval(progressInterval.current);
    setProgress(100);
    setStatusMessage(message);
    setTimeout(() => {
      setProgress(0);
      setStatusMessage('');
      setIsProcessing(false);
    }, 1500);
  };

  const processFile = useCallback(async (file: File) => {
    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      setError('Only PDF files are supported.');
      return;
    }
    const base64 = await fileToBase64(file);
    setSelectedFile({ file, base64 });
    setInputText('');
    setError(null);
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await processFile(file);
  };

  const handleRunTool = async () => {
    if (!selectedFile) {
      setError('Upload a PDF first. Text-only parsing is not available on the server.');
      return;
    }
    setIsProcessing(true);
    setError(null);
    const trackName = getEffectiveTrackName();
    const pdfData = { data: selectedFile.base64, mimeType: selectedFile.file.type };

    try {
      let data: PipelineResult;
      if (toolMode === 'morning_card') {
        startProgress('Parsing Morning Card via Gemini...');
        data = await parseMorningCard({ pdfData }, trackName);
        if (!data.track || data.track.toLowerCase().includes('unknown')) data.track = trackName;
      } else if (toolMode === 'digest') {
        startProgress('Parsing TRD Racing Digest...');
        data = await parseRacingDigest({ pdfData });
      } else {
        startProgress('Parsing Backup Entries...');
        data = await parseBackupEntries({ pdfData });
      }

      const handicappingResult = processHandicapping(data);
      setResult(handicappingResult);
      endProgress('Pipeline Execution Successful.');
    } catch (err: any) {
      setError(err?.message || 'Pipeline execution failed.');
      setProgress(0);
      setIsProcessing(false);
      if (progressInterval.current) window.clearInterval(progressInterval.current);
    }
  };

  const handleShare = async () => {
    if (!result) return;
    const topPicksText = result.races.map(r => {
      const top = [...r.horses].sort((a, b) => b.modelScore - a.modelScore)[0];
      return `Race ${r.number}: ${top.name} (${top.modelOdds})`;
    }).join('\n');
    const shareText = `RaceWise AI Analysis - ${result.track} (${result.date})\n\nTop Neural Picks:\n${topPicksText}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `RaceWise AI - ${result.track}`, text: shareText });
      } else {
        await navigator.clipboard.writeText(shareText);
        setShareStatus('copied');
        setTimeout(() => setShareStatus('idle'), 2000);
        toast.success('Analysis copied to clipboard');
      }
    } catch {
      // User cancelled share or clipboard unavailable — no-op
    }
  };

  const renderTabContent = () => {
    if (!result) return null;

    if (activeTab === 'csv' || activeTab === 'xml') {
      const content = activeTab === 'csv' ? convertToCSV(result) : convertToXML(result);
      return (
        <div className="relative">
          <textarea
            readOnly
            value={content}
            className="w-full h-[600px] bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-300 focus:outline-none"
          />
          <button
            onClick={() => {
              navigator.clipboard.writeText(content);
              toast.success(`${activeTab.toUpperCase()} copied`);
            }}
            className="absolute top-4 right-4 p-2 bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors border border-slate-700"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
      );
    }

    if (activeTab === 'rankings') {
      return (
        <div className="space-y-12">
          {result.races.map(race => (
            <div key={race.number} className="space-y-6">
              <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
                <span className="text-blue-500">Race {race.number}</span>
                <span className="text-sm text-slate-500 font-bold">{race.distance} • {race.surface}</span>
              </h3>
              <div className="h-64 w-full bg-slate-900/50 rounded-xl p-4 border border-slate-800">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[...race.horses].sort((a, b) => b.modelScore - a.modelScore).slice(0, 8)}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                    <XAxis type="number" stroke="#475569" fontSize={10} />
                    <YAxis dataKey="name" type="category" width={100} stroke="#475569" fontSize={10} />
                    <RechartsTooltip
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '0.5rem' }}
                      itemStyle={{ color: '#3b82f6', fontWeight: 900 }}
                    />
                    <Bar dataKey="modelScore" radius={[0, 4, 4, 0]}>
                      {[...race.horses].sort((a, b) => b.modelScore - a.modelScore).slice(0, 8).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : index === 1 ? '#8b5cf6' : '#334155'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (activeTab === 'betting_table') {
      return (
        <div className="space-y-10">
          {result.races.map(race => (
            <div key={race.number} className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/50">
              <div className="p-4 bg-slate-800/80 border-b border-slate-700">
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  Race {race.number} <span className="text-slate-400 mx-2">|</span> {race.distance}
                </h3>
              </div>
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[9px] font-black">
                  <tr>
                    <th className="px-4 py-3">Rank</th>
                    <th className="px-4 py-3">PP</th>
                    <th className="px-4 py-3">Horse</th>
                    <th className="px-4 py-3 text-right">Model Score</th>
                    <th className="px-4 py-3 text-right">Win %</th>
                    <th className="px-4 py-3 text-right">Fair Odds</th>
                    <th className="px-4 py-3 text-right">ML</th>
                    <th className="px-4 py-3">Jockey / Trainer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {[...race.horses].sort((a, b) => b.modelScore - a.modelScore).map((horse, idx) => (
                    <tr
                      key={horse.programNumber}
                      className={`hover:bg-slate-800/30 transition-colors ${idx === 0 ? 'bg-blue-900/10' : ''}`}
                    >
                      <td className="px-4 py-3 font-black text-slate-500">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex w-6 h-6 items-center justify-center bg-slate-800 rounded-md text-[10px] font-black text-white">
                          {horse.programNumber}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-white">{horse.name}</td>
                      <td className="px-4 py-3 text-right font-mono text-blue-400 font-bold">{horse.modelScore.toFixed(1)}</td>
                      <td className="px-4 py-3 text-right font-mono text-slate-300">{horse.winPercentage}%</td>
                      <td className="px-4 py-3 text-right font-mono text-emerald-400 font-bold">{horse.modelOdds}</td>
                      <td className="px-4 py-3 text-right font-mono text-slate-400">{horse.morningLine}</td>
                      <td className="px-4 py-3 text-slate-500 font-medium text-[10px] uppercase truncate max-w-[200px]">
                        {horse.jockey} / {horse.trainer}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      );
    }

    // preview / betting_sheet
    return (
      <div className="space-y-8">
        {result.races.map(race => {
          const topHorses = getTopSixWithTies(race.horses);
          return (
            <div key={race.number} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-2xl">
              <div className="flex justify-between items-end border-b border-slate-700 pb-4 mb-4 mt-2">
                <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter flex flex-col gap-1">
                    <span className="text-blue-500 text-sm tracking-widest leading-none">{result.track}</span>
                    RACE {race.number}
                  </h3>
                  <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-wide">
                    {race.distance} • {race.surface}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] tracking-widest text-slate-500 uppercase font-black">Top Pick Probability</span>
                  <p className="text-xl font-black text-emerald-400 mt-1">{topHorses[0]?.winPercentage}%</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {topHorses.map((horse, idx) => (
                  <div
                    key={horse.programNumber}
                    className={`relative p-4 rounded-xl border flex flex-col gap-3 justify-between ${
                      idx === 0
                        ? 'bg-blue-600/10 border-blue-500/30'
                        : idx === 1
                        ? 'bg-violet-600/5 border-violet-500/20'
                        : 'bg-slate-800/40 border-slate-700/50'
                    }`}
                  >
                    {idx === 0 && <Star className="absolute top-3 right-3 w-4 h-4 text-emerald-400 fill-emerald-400/20" />}
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${
                            idx === 0 ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          {horse.programNumber}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-white leading-none mb-1 mr-6">{horse.name}</h4>
                          <p className="text-[9px] uppercase tracking-widest text-slate-400 truncate max-w-[120px]">
                            {horse.jockey} • {horse.trainer}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <div className="bg-slate-950/50 rounded-lg p-2 flex flex-col items-center justify-center border border-slate-800/80">
                        <span className="text-[8px] uppercase tracking-widest text-slate-500 mb-0.5">Score</span>
                        <span className={`text-xs font-black ${idx === 0 ? 'text-blue-400' : 'text-slate-300'}`}>
                          {horse.modelScore.toFixed(1)}
                        </span>
                      </div>
                      <div className="bg-slate-950/50 rounded-lg p-2 flex flex-col items-center justify-center border border-slate-800/80">
                        <span className="text-[8px] uppercase tracking-widest text-slate-500 mb-0.5">Model</span>
                        <span className="text-xs font-black text-emerald-400">{horse.modelOdds}</span>
                      </div>
                      <div className="bg-slate-950/50 rounded-lg p-2 flex flex-col items-center justify-center border border-slate-800/80">
                        <span className="text-[8px] uppercase tracking-widest text-slate-500 mb-0.5">ML</span>
                        <span className="text-xs font-black text-slate-400">{horse.morningLine}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div
      className="rounded-2xl bg-[#02040a] text-slate-100 overflow-hidden"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div className="fixed inset-0 z-[100] bg-blue-600/10 backdrop-blur-xl flex flex-col items-center justify-center border-[10px] border-dashed border-blue-500/40 pointer-events-none">
          <div className="w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(37,99,235,0.6)] ring-4 ring-white/20 animate-bounce">
            <FileUp className="w-16 h-16 text-white" />
          </div>
          <h2 className="mt-12 text-5xl font-black uppercase tracking-tighter text-white">Drop Master PDF</h2>
          <p className="mt-4 text-blue-400 font-black uppercase tracking-[0.4em] animate-pulse">Neural Parsing Ready</p>
        </div>
      )}

      <header className="bg-slate-900/60 border-b border-slate-800/60 backdrop-blur-2xl relative">
        <div className="px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-violet-600 rounded-xl flex items-center justify-center shadow-[0_0_25px_rgba(37,99,235,0.4)] ring-1 ring-white/10">
              <TrendingUp className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter text-white">
                RaceWise <span className="text-blue-500">Pipeline</span>
              </h1>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.3em] flex items-center gap-1.5">
                <Cpu className="w-2.5 h-2.5 text-violet-500" /> Ensemble Handicapping Engine
              </p>
            </div>
          </div>
        </div>
        <div
          className="h-[2px] bg-gradient-to-r from-blue-600 to-violet-600 shadow-[0_0_15px_#2563eb] transition-all"
          style={{ width: `${progress}%` }}
        />
      </header>

      <main className="p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* CONTROLS */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-800/80">
            {(['morning_card', 'digest', 'entry'] as ToolMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => setToolMode(mode)}
                className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${
                  toolMode === mode
                    ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]'
                    : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                {mode === 'morning_card' ? 'Morning' : mode === 'digest' ? 'TRD' : 'Backup'}
              </button>
            ))}
          </div>

          <section className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 space-y-4">
            <div className="relative">
              <select
                value={selectedTrackId}
                onChange={e => setSelectedTrackId(e.target.value)}
                className="w-full h-12 bg-slate-950/60 border border-slate-800/80 rounded-xl px-4 text-[11px] font-black appearance-none outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer"
              >
                {TRACKS.map(t => (
                  <option key={t.id} value={t.id} className="bg-slate-900">
                    {t.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700 pointer-events-none" />
            </div>

            {selectedTrackId === 'custom' && (
              <input
                type="text"
                value={customTrackName}
                onChange={e => setCustomTrackName(e.target.value)}
                placeholder="Custom track name..."
                className="w-full h-10 bg-slate-950/60 border border-slate-800 rounded-xl px-4 text-xs outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            )}

            <div
              className={`relative cursor-pointer transition-all ${isDragging ? 'scale-[1.02] ring-2 ring-blue-500/40' : ''}`}
              onClick={() => !selectedFile && fileInputRef.current?.click()}
            >
              <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept=".pdf" />
              <textarea
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder="Drag a PDF here or click to upload..."
                className="w-full h-48 bg-slate-950/60 border border-slate-800 rounded-2xl p-6 text-xs font-mono outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 resize-none"
                disabled
              />

              {selectedFile && (
                <div className="absolute inset-2 bg-slate-950/95 border border-blue-500/20 rounded-2xl flex flex-col items-center justify-center gap-4 backdrop-blur-3xl">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/20">
                    <FileText className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="text-center px-4">
                    <p className="text-[10px] font-black uppercase text-white truncate max-w-[240px]">
                      {selectedFile.file.name}
                    </p>
                    <p className="text-[8px] font-black text-blue-500/60 uppercase tracking-widest mt-1">Ready to Parse</p>
                  </div>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      setSelectedFile(null);
                    }}
                    className="text-[9px] font-black text-red-500 uppercase tracking-widest px-4 py-2 hover:bg-red-500/10 rounded-lg"
                  >
                    Remove
                  </button>
                </div>
              )}

              {!selectedFile && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-30">
                  <div className="relative mb-4">
                    <FileUp className="w-8 h-8 text-blue-400" />
                    <MousePointer2 className="absolute -right-2 -bottom-2 w-4 h-4 text-violet-500 animate-pulse" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-center">
                    Drag PDF Here or<br />Click to Upload
                  </p>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] font-black text-red-500 uppercase leading-relaxed">{error}</p>
              </div>
            )}

            <button
              onClick={handleRunTool}
              disabled={isProcessing || !selectedFile}
              className={`w-full h-14 font-black uppercase text-[11px] rounded-2xl transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-40 ${
                toolMode === 'morning_card'
                  ? 'bg-blue-600 shadow-blue-900/40'
                  : toolMode === 'digest'
                  ? 'bg-violet-600 shadow-violet-900/40'
                  : 'bg-slate-800'
              } text-white shadow-[0_8px_30px_rgba(0,0,0,0.4)]`}
            >
              {isProcessing ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Execute Pipeline'}
            </button>
          </section>
        </div>

        {/* RESULTS */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {!result && !isProcessing ? (
            <div className="flex-1 min-h-[500px] flex flex-col items-center justify-center border-2 border-dashed border-slate-800/60 rounded-[2rem] p-12 bg-slate-900/10">
              <Zap className="w-12 h-12 text-blue-600/40 mb-8 animate-pulse" />
              <h2 className="text-3xl font-black text-slate-500 uppercase tracking-tighter text-center">
                Pro Handicapping
                <br />
                <span className="text-blue-600/60">Neural Engine</span>
              </h2>
              <p className="text-[10px] text-slate-600 font-bold uppercase mt-6 tracking-[0.3em] text-center max-w-sm">
                Upload a morning card, TRD digest, or backup card PDF to run the ensemble model.
              </p>
            </div>
          ) : isProcessing ? (
            <div className="flex-1 min-h-[500px] flex flex-col items-center justify-center border border-slate-800 rounded-[2rem] bg-slate-900/20">
              <div className="relative w-24 h-24 mb-10">
                <RefreshCw className="w-24 h-24 text-blue-500 animate-spin opacity-20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-black text-white">{progress}%</span>
                </div>
              </div>
              <h2 className="text-lg font-black uppercase tracking-widest text-slate-100 text-center px-4">
                {statusMessage}
              </h2>
              <div className="w-64 h-1 bg-slate-800 rounded-full mt-6 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-violet-600 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            result && (
              <>
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex items-center justify-between border-l-8 border-l-blue-600">
                  <div className="flex flex-col">
                    <h2 className="text-3xl font-black uppercase tracking-tighter text-white leading-none">
                      {result.track}
                    </h2>
                    <p className="text-blue-400 font-black text-xs uppercase mt-3 tracking-widest flex items-center gap-2">
                      <Award className="w-3.5 h-3.5 text-violet-500" />
                      {result.date} • {result.races.length} Races
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleShare}
                      title="Share Analysis"
                      className="p-4 bg-slate-800 rounded-xl border border-slate-700 hover:border-blue-500/50 hover:bg-slate-700/50 transition-all"
                    >
                      {shareStatus === 'copied' ? (
                        <Check className="w-5 h-5 text-green-400" />
                      ) : (
                        <Share2 className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() => downloadFile(convertToCSV(result), 'handicapping_card.csv', 'text/csv')}
                      title="Download CSV"
                      className="p-4 bg-slate-800 rounded-xl border border-slate-700 hover:border-blue-500/50 hover:bg-slate-700/50 transition-all"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
                  <div className="flex border-b border-slate-800 bg-slate-900/80 p-1 overflow-x-auto">
                    {(['preview', 'betting_sheet', 'rankings', 'betting_table', 'csv', 'xml'] as ActiveTab[]).map(tab => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 min-w-[110px] py-3 text-[9px] font-black uppercase tracking-[0.2em] transition-all rounded-xl ${
                          activeTab === tab
                            ? 'text-blue-400 bg-blue-500/10'
                            : 'text-slate-500 hover:text-slate-200'
                        }`}
                      >
                        {tab.replace('_', ' ')}
                      </button>
                    ))}
                  </div>

                  <div className="max-h-[800px] overflow-y-auto p-6 bg-slate-950/40">{renderTabContent()}</div>
                </div>
              </>
            )
          )}
          {!result && !isProcessing && (
            <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
              <LayoutGrid className="w-3 h-3" /> Results appear here
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPipelinePage;
