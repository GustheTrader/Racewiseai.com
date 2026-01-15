import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, Bot, User, Mic, MicOff, Volume2, VolumeX, Loader2, Settings2, Trash2, RotateCcw } from 'lucide-react';
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

  // Initialize with saved history or greeting
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
    }
  }, [isOpen, isInitialized, agentName, agentDescription, voiceEnabled, speak]);

  // Save messages whenever they change
  useEffect(() => {
    if (messages.length > 0 && isInitialized) {
      saveChatHistory(messages);
    }
  }, [messages, isInitialized]);

  // Handle transcript from speech recognition
  useEffect(() => {
    if (transcript && !isListening) {
      setInputValue(transcript);
      // Auto-send after voice input
      handleSendMessage(transcript);
    }
  }, [transcript, isListening]);

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
              {/* Voice Status Indicator */}
              {(isSpeaking || ttsLoading) && (
                <div className="flex items-center gap-1 bg-green-500/20 border border-green-500/30 px-2 py-1 rounded-lg">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-xs text-green-400">{ttsLoading ? 'Loading...' : 'Speaking...'}</span>
                </div>
              )}
              {isListening && (
                <div className="flex items-center gap-1 bg-red-500/20 border border-red-500/30 px-2 py-1 rounded-lg">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                  <span className="text-xs text-red-400">Listening...</span>
                </div>
              )}
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
        
        {/* Messages */}
        <ScrollArea className="flex-1 px-6 py-4 bg-gray-900/50">
          <div className="space-y-4">
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
            
            {/* Microphone Button */}
            {speechSupported && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleMicClick}
                disabled={isLoading}
                className={`rounded-full transition-all duration-300 ${
                  isListening 
                    ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
                title={isListening ? 'Stop listening' : 'Start voice input'}
              >
                {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>
            )}
            
            {/* Text Input */}
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isListening ? 'Listening...' : 'Type or speak your message...'}
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VoiceAgentDialog;
