import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Confident male voice options
export const MALE_VOICES = {
  'en-US-Neural2-D': { label: 'Marcus (Deep & Confident)', accent: 'American' },
  'en-US-Neural2-I': { label: 'James (Warm & Authoritative)', accent: 'American' },
  'en-US-Neural2-J': { label: 'Alex (Clear & Professional)', accent: 'American' },
  'en-US-Studio-M': { label: 'David (Studio Quality)', accent: 'American' },
  'en-GB-Neural2-B': { label: 'William (British Authoritative)', accent: 'British' },
  'en-GB-Neural2-D': { label: 'Charles (British Professional)', accent: 'British' },
} as const;

export type MaleVoiceId = keyof typeof MALE_VOICES;

interface UseGoogleTTSOptions {
  defaultVoice?: MaleVoiceId;
  speakingRate?: number;
  pitch?: number;
}

interface UseGoogleTTSReturn {
  speak: (text: string, voiceId?: MaleVoiceId) => Promise<void>;
  stop: () => void;
  isSpeaking: boolean;
  isLoading: boolean;
  error: string | null;
  currentVoice: MaleVoiceId;
  setVoice: (voiceId: MaleVoiceId) => void;
  availableVoices: typeof MALE_VOICES;
}

export function useGoogleTTS(options: UseGoogleTTSOptions = {}): UseGoogleTTSReturn {
  const {
    defaultVoice = 'en-US-Neural2-D',
    speakingRate = 0.95,
    pitch = -2.0
  } = options;

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentVoice, setCurrentVoice] = useState<MaleVoiceId>(defaultVoice);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setIsSpeaking(false);
    
    // Also stop any browser TTS fallback
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  // Browser TTS fallback with male voice settings
  const fallbackSpeak = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) {
      setError('Speech synthesis not supported');
      return;
    }

    window.speechSynthesis.cancel();
    
    const speakWithVoice = () => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9; // Slightly slower for confidence
      utterance.pitch = 0.8; // Lower pitch for male voice
      utterance.volume = 1.0;

      // Try to find a male voice
      const voices = window.speechSynthesis.getVoices();
      const maleVoice = voices.find(v => 
        v.lang.startsWith('en') && 
        (v.name.toLowerCase().includes('male') || 
         v.name.toLowerCase().includes('david') ||
         v.name.toLowerCase().includes('james') ||
         v.name.toLowerCase().includes('mark') ||
         v.name.toLowerCase().includes('google') && v.name.toLowerCase().includes('us'))
      ) || voices.find(v => v.lang.startsWith('en-US')) 
        || voices.find(v => v.lang.startsWith('en'));
      
      if (maleVoice) {
        utterance.voice = maleVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    };

    // Voices may not be loaded yet - wait for them
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      speakWithVoice();
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        speakWithVoice();
        window.speechSynthesis.onvoiceschanged = null;
      };
      setTimeout(() => speakWithVoice(), 100);
    }
  }, []);

  const speak = useCallback(async (text: string, voiceId?: MaleVoiceId) => {
    if (!text.trim()) return;
    
    stop();
    setIsLoading(true);
    setError(null);

    try {
      // Use free browser-based Web Speech API directly (no API key needed)
      fallbackSpeak(text);
    } catch (err) {
      console.error('TTS error:', err);
      setError(err instanceof Error ? err.message : 'Speech failed');
    } finally {
      setIsLoading(false);
    }
  }, [stop, fallbackSpeak]);


  const setVoice = useCallback((voiceId: MaleVoiceId) => {
    setCurrentVoice(voiceId);
  }, []);

  return {
    speak,
    stop,
    isSpeaking,
    isLoading,
    error,
    currentVoice,
    setVoice,
    availableVoices: MALE_VOICES
  };
}

// Helper function to convert base64 to blob
function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

// Export a simple speak function for quick use (uses free browser TTS)
export async function speakWithGoogleTTS(text: string, voiceId: MaleVoiceId = 'en-US-Neural2-D'): Promise<void> {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 0.8;
    
    const voices = window.speechSynthesis.getVoices();
    const maleVoice = voices.find(v => 
      v.lang.startsWith('en') && 
      (v.name.toLowerCase().includes('david') ||
       v.name.toLowerCase().includes('james') ||
       v.name.toLowerCase().includes('mark'))
    ) || voices.find(v => v.lang.startsWith('en'));
    
    if (maleVoice) utterance.voice = maleVoice;
    window.speechSynthesis.speak(utterance);
  }
}

export function stopGoogleTTS(): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
