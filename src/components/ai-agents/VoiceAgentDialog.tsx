import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, Bot, User, Mic, MicOff, Volume2, VolumeX, Loader2, Settings2 } from 'lucide-react';
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
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Google TTS hook for confident male voices
  const { 
    speak, 
    stop: stopTTS, 
    isSpeaking, 
    isLoading: ttsLoading,
    currentVoice,
    setVoice,
    availableVoices
  } = useGoogleTTS({ defaultVoice: 'en-US-Neural2-D' });
  
  const { 
    isListening, 
    transcript, 
    startListening, 
    stopListening, 
    isSupported: speechSupported,
    error: speechError
  } = useSpeechRecognition();

  // Initialize with greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting = `Hello! I'm ${agentName}. ${agentDescription} How can I help you today?`;
      setMessages([{
        id: '1',
        content: greeting,
        role: 'assistant',
        timestamp: new Date()
      }]);
      if (voiceEnabled) {
        speak(greeting);
      }
    }
  }, [isOpen, agentName, agentDescription, messages.length, voiceEnabled, speak]);

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

  // Cleanup on close
  useEffect(() => {
    if (!isOpen) {
      stopTTS();
      stopListening();
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900/95 backdrop-blur-xl border-gray-700/50 text-white max-w-2xl h-[85vh] flex flex-col p-0 gap-0">
        {/* Header */}
        <DialogHeader className={`${accentColor} px-6 py-4 rounded-t-lg`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-white">{agentName}</DialogTitle>
                <p className="text-white/80 text-sm">{agentDescription}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Voice Settings Toggle - Always visible gear */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowVoiceSettings(!showVoiceSettings)}
                className={`text-white hover:text-white hover:bg-white/20 rounded-full flex items-center gap-1.5 px-3 ${
                  showVoiceSettings ? 'bg-white/20' : ''
                }`}
                title="Voice settings"
              >
                <Settings2 className="h-4 w-4" />
                <span className="text-xs font-medium">Voice</span>
              </Button>
              {/* Voice Status Indicator */}
              {(isSpeaking || ttsLoading) && (
                <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-xs">{ttsLoading ? 'Loading...' : 'Speaking...'}</span>
                </div>
              )}
              {isListening && (
                <div className="flex items-center gap-1 bg-red-500/30 px-2 py-1 rounded-full">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                  <span className="text-xs">Listening...</span>
                </div>
              )}
            </div>
          </div>
          {/* Voice Selection Panel - Collapsible */}
          {showVoiceSettings && (
            <div className="mt-3 p-3 bg-white/10 rounded-lg border border-white/20">
              <p className="text-xs text-white/70 mb-2 font-medium">🎙️ Select AI Voice (Confident Male SME)</p>
              <Select value={currentVoice} onValueChange={(v) => setVoice(v as MaleVoiceId)}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white text-sm">
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
        <ScrollArea className="flex-1 px-6 py-4">
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
                    ? 'bg-gradient-to-br from-orange-500 to-red-500' 
                    : accentColor
                }`}>
                  {message.role === 'user' 
                    ? <User className="h-5 w-5 text-white" />
                    : <Bot className="h-5 w-5 text-white" />
                  }
                </div>
                <div
                  className={`max-w-[75%] p-4 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30'
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
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${accentColor}`}>
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div className="bg-gray-800/80 border border-gray-700/50 p-4 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-gray-400">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
        
        {/* Input Area */}
        <div className="border-t border-gray-700/50 p-4 bg-gray-900/50">
          <div className="flex items-center gap-2">
            {/* Voice Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleVoice}
              className={`rounded-full ${voiceEnabled ? 'text-green-400 hover:text-green-300' : 'text-gray-500 hover:text-gray-400'}`}
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
              className="flex-1 bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-500 rounded-full px-4"
            />
            
            {/* Send Button */}
            <Button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isLoading}
              className={`rounded-full ${accentColor} hover:opacity-90`}
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
