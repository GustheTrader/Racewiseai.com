import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, Bot, User, Mic, MicOff, Volume2, VolumeX, Loader2, Settings2, Trash2, RotateCcw, Pause, Play } from 'lucide-react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useGoogleTTS, MALE_VOICES, MaleVoiceId } from '@/hooks/useGoogleTTS';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface VoiceAgentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  agentName: string;
  agentDescription: string;
  agentType: string;
  accentColor: string;
}

const VoiceAgentDialog: React.FC<VoiceAgentDialogProps> = ({ 
  isOpen, 
  onClose, 
  agentName, 
  agentDescription,
  agentType,
  accentColor
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [continuousModeEnabled, setContinuousModeEnabled] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Storage key for this agent's chat history
  const chatStorageKey = `chat-history-${agentType}`;

  // Load saved chat history
  const loadChatHistory = (): Message[] => {
    try {
      const saved = localStorage.getItem(chatStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }));
      }
    } catch (e) {
      console.error('Failed to load chat history:', e);
    }
    return [];
  };

  // Save chat history
  const saveChatHistory = (msgs: Message[]) => {
    try {
      // Keep last 50 messages to avoid storage limits
      const toSave = msgs.slice(-50);
      localStorage.setItem(chatStorageKey, JSON.stringify(toSave));
    } catch (e) {
      console.error('Failed to save chat history:', e);
    }
  };

  // Clear chat history
  const clearChatHistory = () => {
    localStorage.removeItem(chatStorageKey);
    const greeting = `Hello! I'm ${agentName}. ${agentDescription} How can I help you today?`;
    const newMessages = [{
      id: Date.now().toString(),
      content: greeting,
      role: 'assistant' as const,
      timestamp: new Date()
    }];
    setMessages(newMessages);
    saveChatHistory(newMessages);
    toast.success('Chat history cleared');
  };
  
  // Load saved voice preference for this agent
  const getSavedVoice = (): MaleVoiceId => {
    const saved = localStorage.getItem(`voice-preference-${agentType}`);
    return (saved as MaleVoiceId) || 'en-US-Neural2-D';
  };

  // Google TTS hook for confident male voices
  const { 
    speak, 
    stop: stopTTS, 
    isSpeaking, 
    isLoading: ttsLoading,
    currentVoice,
    setVoice: setTTSVoice,
    availableVoices
  } = useGoogleTTS({ defaultVoice: getSavedVoice() });

  // Save voice preference when changed
  const setVoice = (voiceId: MaleVoiceId) => {
    localStorage.setItem(`voice-preference-${agentType}`, voiceId);
    setTTSVoice(voiceId);
  };
  
  const { 
    isListening, 
    transcript, 
    startListening, 
    stopListening, 
    isSupported: speechSupported,
    error: speechError
  } = useSpeechRecognition();

  // Initialize with saved history or greeting, then auto-start listening
  useEffect(() => {
    if (isOpen && !isInitialized) {
      const savedHistory = loadChatHistory();
      if (savedHistory.length > 0) {
        setMessages(savedHistory);
        toast.success(`Resumed ${savedHistory.length} previous messages`);
      } else {
        const greeting = `Hello! I'm ${agentName}. ${agentDescription} How can I help you today?`;
        const newMessages = [{
          id: '1',
          content: greeting,
          role: 'assistant' as const,
          timestamp: new Date()
        }];
        setMessages(newMessages);
        saveChatHistory(newMessages);
        if (voiceEnabled) {
          speak(greeting);
        }
      }
      setIsInitialized(true);
      
      // Auto-start listening after a brief delay to let speech finish
      if (speechSupported) {
        const autoListenTimer = setTimeout(() => {
          startListening();
        }, savedHistory.length > 0 ? 500 : 3000); // Quick start if resuming, wait for greeting otherwise
        
        return () => clearTimeout(autoListenTimer);
      }
    }
  }, [isOpen, isInitialized, agentName, agentDescription, voiceEnabled, speak, speechSupported, startListening]);

  // Save messages whenever they change
  useEffect(() => {
    if (messages.length > 0 && isInitialized) {
      saveChatHistory(messages);
    }
  }, [messages, isInitialized]);

  // Auto-send timer ref for detecting when user stops talking
  const autoSendTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTranscriptRef = useRef<string>('');

  // Handle transcript from speech recognition with 2-second auto-send delay
  useEffect(() => {
    // Clear any existing timer when transcript changes
    if (autoSendTimerRef.current) {
      clearTimeout(autoSendTimerRef.current);
      autoSendTimerRef.current = null;
    }

    if (transcript && transcript !== lastTranscriptRef.current) {
      lastTranscriptRef.current = transcript;
      setInputValue(transcript);
      
      // Set a 2-second timer to auto-send when user stops talking
      if (isListening && !isLoading) {
        autoSendTimerRef.current = setTimeout(() => {
          if (transcript.trim()) {
            stopListening();
            handleSendMessage(transcript);
            lastTranscriptRef.current = '';
          }
        }, 2000); // 2 second delay after last speech detected
      }
    }

    return () => {
      if (autoSendTimerRef.current) {
        clearTimeout(autoSendTimerRef.current);
      }
    };
  }, [transcript, isListening, isLoading, stopListening]);

  // Also send if user manually stops listening with content
  useEffect(() => {
    if (!isListening && lastTranscriptRef.current.trim() && !isLoading) {
      const textToSend = lastTranscriptRef.current;
      lastTranscriptRef.current = '';
      handleSendMessage(textToSend);
    }
  }, [isListening, isLoading]);

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-restart listening after agent finishes speaking for continuous conversation
  const wasSpeakingRef = useRef(false);
  useEffect(() => {
    if (isSpeaking) {
      wasSpeakingRef.current = true;
    } else if (wasSpeakingRef.current && !isSpeaking && !isLoading && isOpen && speechSupported && continuousModeEnabled) {
      // Agent just finished speaking - restart listening (only if continuous mode is enabled)
      wasSpeakingRef.current = false;
      const restartTimer = setTimeout(() => {
        if (!isListening && isOpen && continuousModeEnabled) {
          startListening();
        }
      }, 500); // Brief pause before restarting
      return () => clearTimeout(restartTimer);
    }
  }, [isSpeaking, isLoading, isOpen, speechSupported, isListening, startListening, continuousModeEnabled]);

  // Toggle continuous mode
  const toggleContinuousMode = () => {
    const newValue = !continuousModeEnabled;
    setContinuousModeEnabled(newValue);
    if (!newValue && isListening) {
      stopListening(); // Stop listening when pausing continuous mode
    }
    toast.success(newValue ? 'Continuous mode enabled' : 'Continuous mode paused');
  };

  // Cleanup on close - reset initialized flag
  useEffect(() => {
    if (!isOpen) {
      stopTTS();
      stopListening();
      setIsInitialized(false);
    }
  }, [isOpen, stopListening, stopTTS]);

  const handleSendMessage = async (text?: string) => {
    const messageText = text || inputValue;
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageText,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    stopTTS();

    try {
      const conversationHistory = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content
      }));

      const { data, error } = await supabase.functions.invoke('agent-chat', {
        body: { 
          messages: conversationHistory,
          agentType 
        }
      });

      if (error) throw error;

      const aiResponse = data.response || 'I apologize, but I encountered an issue processing your request.';
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        role: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);

      if (voiceEnabled) {
        speak(aiResponse);
      }
    } catch (err) {
      console.error('Chat error:', err);
      toast.error('Failed to get response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleVoice = () => {
    if (isSpeaking) {
      stopTTS();
    }
    setVoiceEnabled(!voiceEnabled);
  };

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      stopTTS();
      startListening();
    }
  };

  // Get agent-specific icon color for dark theme
  const getAgentAccentClass = () => {
    if (agentType === 'cosmic-bombs') return 'text-orange-400';
    if (agentType === 'risk-analysis') return 'text-amber-400';
    return 'text-orange-500';
  };

  const getAgentBorderClass = () => {
    if (agentType === 'cosmic-bombs') return 'border-orange-500/50';
    if (agentType === 'risk-analysis') return 'border-amber-500/50';
    return 'border-orange-600/50';
  };

  // Spiral animation component for listening mode
  const SpiralAnimation = () => (
    <div className="relative w-32 h-32 mx-auto">
      {/* Outer spiral rings */}
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="absolute inset-0 rounded-full border-2 border-orange-500/40"
          style={{
            animation: `spin ${3 + i * 0.5}s linear infinite ${i % 2 === 0 ? '' : 'reverse'}`,
            transform: `scale(${1 - i * 0.15})`,
            borderTopColor: 'rgb(251 146 60)',
            borderRightColor: 'transparent',
            borderBottomColor: 'rgb(251 146 60 / 0.3)',
            borderLeftColor: 'transparent',
          }}
        />
      ))}
      {/* Center pulse */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full animate-pulse flex items-center justify-center shadow-lg shadow-orange-500/50">
          <Mic className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  // Audio waveform visualization for speaking mode
  const SpeakingWaveform = () => (
    <div className="flex items-center justify-center gap-1 h-8">
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="w-1 bg-gradient-to-t from-green-500 to-emerald-400 rounded-full"
          style={{
            animation: `waveform 0.8s ease-in-out infinite`,
            animationDelay: `${i * 0.05}s`,
            height: '100%',
          }}
        />
      ))}
      <style>{`
        @keyframes waveform {
          0%, 100% { transform: scaleY(0.3); opacity: 0.5; }
          50% { transform: scaleY(1); opacity: 1; }
        }
      `}</style>
    </div>
  );

  // Status message based on current state
  const getStatusMessage = () => {
    if (isListening) return "🎤 Listening... Speak your question!";
    if (isLoading) return "🧠 Analyzing your query...";
    if (isSpeaking) return "🔊 Speaking response...";
    if (ttsLoading) return "⏳ Preparing audio...";
    if (!continuousModeEnabled) return "⏸️ Continuous mode paused - Click mic to speak";
    return "💬 Ready to help you win!";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900/98 backdrop-blur-xl border-gray-700/50 text-white max-w-2xl h-[85vh] flex flex-col p-0 gap-0">
        {/* Header - Dark theme with orange accent border */}
        <DialogHeader className={`bg-gray-800/90 border-b-2 ${getAgentBorderClass()} px-6 py-4 rounded-t-lg`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 bg-gray-700/80 rounded-xl border ${getAgentBorderClass()}`}>
                <Bot className={`h-6 w-6 ${getAgentAccentClass()}`} />
              </div>
              <div>
                <DialogTitle className={`text-xl font-bold ${getAgentAccentClass()}`}>{agentName}</DialogTitle>
                <p className="text-gray-400 text-sm max-w-md">{agentDescription}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Message Count Indicator */}
              <div className="flex items-center gap-1.5 bg-gray-700/60 border border-gray-600/50 px-2.5 py-1 rounded-lg">
                <span className="text-xs text-gray-400">Messages:</span>
                <span className="text-xs font-semibold text-orange-400">{messages.length}</span>
              </div>
              {/* Clear History Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearChatHistory}
                className="text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg flex items-center gap-1.5 px-2 border border-gray-600/50"
                title="Clear chat history"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              {/* Continuous Mode Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleContinuousMode}
                className={`rounded-lg flex items-center gap-1.5 px-2.5 border ${
                  continuousModeEnabled 
                    ? 'text-green-400 hover:text-green-300 border-green-500/50 bg-green-500/10 hover:bg-green-500/20' 
                    : 'text-yellow-400 hover:text-yellow-300 border-yellow-500/50 bg-yellow-500/10 hover:bg-yellow-500/20'
                }`}
                title={continuousModeEnabled ? 'Pause continuous listening' : 'Resume continuous listening'}
              >
                {continuousModeEnabled ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                <span className="text-xs font-medium">{continuousModeEnabled ? 'Auto' : 'Paused'}</span>
              </Button>
              {/* Voice Settings Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowVoiceSettings(!showVoiceSettings)}
                className={`text-gray-300 hover:text-orange-400 hover:bg-gray-700/50 rounded-lg flex items-center gap-1.5 px-3 border border-gray-600/50 ${
                  showVoiceSettings ? 'bg-gray-700/50 text-orange-400' : ''
                }`}
                title="Voice settings"
              >
                <Settings2 className="h-4 w-4" />
                <span className="text-xs font-medium">Voice</span>
              </Button>
            </div>
          </div>
          {/* Voice Selection Panel - Collapsible */}
          {showVoiceSettings && (
            <div className="mt-3 p-3 bg-gray-700/50 rounded-lg border border-gray-600/50">
              <p className="text-xs text-gray-400 mb-2 font-medium">🎙️ Select AI Voice (Confident Male SME)</p>
              <Select value={currentVoice} onValueChange={(v) => setVoice(v as MaleVoiceId)}>
                <SelectTrigger className="bg-gray-800/80 border-gray-600/50 text-white text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 z-50">
                  {Object.entries(availableVoices).map(([id, { label, accent }]) => (
                    <SelectItem key={id} value={id} className="text-white hover:bg-gray-700">
                      <span>{label}</span>
                      <span className="ml-2 text-xs text-gray-400">({accent})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </DialogHeader>
        
        {/* Active Status Indicator Bar */}
        <div className={`px-6 py-3 border-b border-gray-700/50 flex items-center justify-center gap-3 ${
          isListening ? 'bg-gradient-to-r from-red-500/20 via-orange-500/20 to-red-500/20' :
          isLoading ? 'bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20' :
          isSpeaking ? 'bg-gradient-to-r from-green-500/20 via-emerald-500/20 to-green-500/20' :
          'bg-gray-800/50'
        }`}>
          {/* Waveform for speaking mode */}
          {isSpeaking && <SpeakingWaveform />}
          
          {/* Pulse dot for other states */}
          {(ttsLoading || isListening) && !isSpeaking && (
            <div className={`w-2 h-2 rounded-full animate-pulse ${
              isListening ? 'bg-red-400' : 'bg-blue-400'
            }`} />
          )}
          <span className={`text-sm font-medium ${
            isListening ? 'text-red-400' :
            isLoading ? 'text-blue-400' :
            isSpeaking ? 'text-green-400' :
            'text-gray-400'
          }`}>
            {getStatusMessage()}
          </span>
          
          {/* Additional waveform on right side when speaking */}
          {isSpeaking && <SpeakingWaveform />}
        </div>

        {/* Listening Mode - Spiral Animation */}
        {isListening && (
          <div className="px-6 py-8 bg-gradient-to-b from-gray-800/80 to-gray-900/80 border-b border-gray-700/50">
            <SpiralAnimation />
            <div className="text-center mt-4 space-y-2">
              <p className="text-orange-400 font-bold text-lg animate-pulse">🎤 LISTENING MODE ACTIVE</p>
              <p className="text-gray-400 text-sm">Speak clearly into your microphone...</p>
              <p className="text-amber-400 text-xs font-medium mt-2">Ask me anything about the races!</p>
            </div>
          </div>
        )}
        
        {/* Messages */}
        <ScrollArea className="flex-1 px-6 py-4 bg-gray-900/50">
          <div className="space-y-4">
            {/* Good Luck Banner */}
            {messages.length <= 1 && !isListening && (
              <div className="bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border border-amber-500/30 rounded-xl p-4 mb-4 text-center">
                <p className="text-amber-400 font-bold text-lg">🍀 Good Luck Today! 🍀</p>
                <p className="text-orange-300 text-sm mt-1">Let's bring home the cheddar! 🧀💰</p>
                <div className="mt-3 text-gray-400 text-xs">
                  <p>💡 <span className="text-gray-300">Ask me questions</span> about horses, odds, pace analysis, or betting strategies!</p>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${
                  message.role === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === 'user' 
                    ? 'bg-gradient-to-br from-orange-500 to-amber-600' 
                    : 'bg-gray-700 border border-gray-600'
                }`}>
                  {message.role === 'user' 
                    ? <User className="h-5 w-5 text-white" />
                    : <Bot className={`h-5 w-5 ${getAgentAccentClass()}`} />
                  }
                </div>
                <div
                  className={`max-w-[75%] p-4 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-orange-500/20 to-amber-500/10 border border-orange-500/30'
                      : 'bg-gray-800/80 border border-gray-700/50'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  <span className="text-xs opacity-50 mt-2 block">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-700 border border-gray-600">
                  <Bot className={`h-5 w-5 ${getAgentAccentClass()}`} />
                </div>
                <div className="bg-gray-800/80 border border-gray-700/50 p-4 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-orange-400" />
                    <span className="text-sm text-gray-400">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
        
        {/* Input Area */}
        <div className="border-t border-gray-700/50 p-4 bg-gray-800/50">
          {/* Ask Questions Prompt - Center above input */}
          {!isListening && !isLoading && (
            <div className="text-center mb-3">
              <p className="text-gray-400 text-sm">
                🎯 <span className="text-orange-400 font-medium">Ask me questions</span> about today's races, or tap the mic to speak!
              </p>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            {/* Voice Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleVoice}
              className={`rounded-full ${voiceEnabled ? 'text-green-400 hover:text-green-300 hover:bg-green-500/10' : 'text-gray-500 hover:text-gray-400 hover:bg-gray-700/50'}`}
              title={voiceEnabled ? 'Disable voice responses' : 'Enable voice responses'}
            >
              {voiceEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </Button>
            
            {/* Microphone Button - Enhanced with spiral effect when active */}
            {speechSupported && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleMicClick}
                disabled={isLoading}
                className={`rounded-full transition-all duration-300 relative ${
                  isListening 
                    ? 'bg-red-500 hover:bg-red-600 text-white scale-110' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
                title={isListening ? 'Stop listening' : 'Start voice input'}
              >
                {isListening && (
                  <>
                    <span className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping" />
                    <span className="absolute inset-0 rounded-full border border-red-300 animate-pulse" />
                  </>
                )}
                {isListening ? <MicOff className="h-5 w-5 relative z-10" /> : <Mic className="h-5 w-5" />}
              </Button>
            )}
            
            {/* Text Input */}
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isListening ? '🎤 Listening...' : '💬 Type your question or tap the mic...'}
              disabled={isLoading || isListening}
              className="flex-1 bg-gray-700/50 border-gray-600/50 text-white placeholder-gray-500 rounded-full px-4 focus:border-orange-500/50"
            />
            
            {/* Send Button */}
            <Button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isLoading}
              className="rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white shadow-lg shadow-orange-500/20"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          {speechError && (
            <p className="text-xs text-red-400 mt-2">Speech recognition error: {speechError}</p>
          )}
          
          {/* Encouraging footer message */}
          <div className="text-center mt-3 text-xs text-gray-500">
            🏇 May the odds be ever in your favor! Bring home that cheddar! 🧀
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VoiceAgentDialog;
