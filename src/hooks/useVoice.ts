import { useState, useRef, useCallback, useEffect } from 'react';
import { synthesizeVoice } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

// Type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export type VoiceState = 'idle' | 'recording' | 'processing' | 'review';

export function useVoice() {
  const [isSupported, setIsSupported] = useState(false);
  const [state, setState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout>();
  const audioRef = useRef<HTMLAudioElement>();
  const { toast } = useToast();

  // Check speech recognition support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          }
        }
        if (finalTranscript) {
          setTranscript(prev => prev + finalTranscript);
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setState('idle');
        toast({
          title: 'Voice Error',
          description: 'Failed to recognize speech. Please try again.',
          variant: 'destructive',
        });
      };

      recognition.onend = () => {
        if (state === 'recording') {
          setState('review');
        }
      };

      recognitionRef.current = recognition;
    }
  }, [state, toast]);

  const startRecording = useCallback(async () => {
    if (!isSupported || !recognitionRef.current) {
      toast({
        title: 'Not Supported',
        description: 'Voice input is not supported on this device.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      setTranscript('');
      setRecordingTime(0);
      setState('recording');
      
      // Start recording timer
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      recognitionRef.current.start();
    } catch (error) {
      console.error('Failed to start recording:', error);
      toast({
        title: 'Permission Denied',
        description: 'Please allow microphone access to use voice input.',
        variant: 'destructive',
      });
    }
  }, [isSupported, toast]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current && state === 'recording') {
      recognitionRef.current.stop();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  }, [state]);

  const discardRecording = useCallback(() => {
    setTranscript('');
    setRecordingTime(0);
    setState('idle');
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);

  const playText = useCallback(async (text: string, voice?: string) => {
    try {
      setIsPlaying(true);
      const audioBlob = await synthesizeVoice({ text, voice });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      audio.onerror = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
        toast({
          title: 'Playback Error',
          description: 'Failed to play audio response.',
          variant: 'destructive',
        });
      };
      
      await audio.play();
    } catch (error) {
      console.error('Failed to play text:', error);
      setIsPlaying(false);
      toast({
        title: 'Voice Synthesis Error',
        description: 'Failed to generate audio response.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const stopPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, []);

  // Format recording time as mm:ss
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  return {
    isSupported,
    state,
    setState,
    transcript,
    setTranscript,
    recordingTime: formatTime(recordingTime),
    isPlaying,
    startRecording,
    stopRecording,
    discardRecording,
    playText,
    stopPlayback,
  };
}