import { Mic, MicOff, Play, Pause, Trash2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useVoice, VoiceState } from '@/hooks/useVoice';

interface VoiceControlsProps {
  onSendMessage: (message: string, mode: 'voice') => void;
  disabled?: boolean;
}

export function VoiceControls({ onSendMessage, disabled }: VoiceControlsProps) {
  const {
    isSupported,
    state,
    setState,
    transcript,
    setTranscript,
    recordingTime,
    isPlaying,
    startRecording,
    stopRecording,
    discardRecording,
    stopPlayback,
  } = useVoice();

  const handleSend = () => {
    if (transcript.trim()) {
      onSendMessage(transcript.trim(), 'voice');
      setTranscript('');
      setState('idle');
    }
  };

  if (!isSupported) {
    return (
      <div className="p-6 text-center border border-border rounded-xl bg-muted/30">
        <MicOff className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Voice input is not supported on this device.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Recording Controls */}
      <div className="flex flex-col items-center space-y-4">
        {state === 'idle' && (
          <Button
            onClick={startRecording}
            disabled={disabled}
            size="lg"
            className="w-20 h-20 rounded-full bg-voice-primary hover:bg-voice-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Mic className="w-8 h-8" />
          </Button>
        )}

        {state === 'recording' && (
          <div className="relative">
            <div className="absolute inset-0 w-20 h-20 rounded-full bg-voice-pulse opacity-30 voice-pulse"></div>
            <Button
              onClick={stopRecording}
              size="lg"
              className="relative w-20 h-20 rounded-full bg-voice-recording hover:bg-voice-recording/90 text-white voice-recording shadow-lg"
            >
              <MicOff className="w-8 h-8" />
            </Button>
          </div>
        )}

        {state === 'recording' && (
          <div className="text-center">
            <p className="text-sm font-medium text-voice-recording">Recording...</p>
            <p className="text-xs text-muted-foreground">{recordingTime}</p>
          </div>
        )}
      </div>

      {/* Transcript Review */}
      {state === 'review' && transcript && (
        <div className="space-y-3 animate-slide-up">
          <div className="space-y-2">
            <label className="text-sm font-medium">Captured text:</label>
            <Textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Edit your message..."
              className="min-h-[100px] resize-none"
            />
          </div>
          
          <div className="flex space-x-2">
            <Button
              onClick={handleSend}
              disabled={!transcript.trim() || disabled}
              className="flex-1"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Message
            </Button>
            <Button
              onClick={discardRecording}
              variant="outline"
              size="icon"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Audio Playback Controls */}
      {isPlaying && (
        <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg animate-fade-in">
          <div className="flex items-center space-x-2 flex-1">
            <div className="w-2 h-8 bg-voice-primary/60 rounded animate-pulse"></div>
            <div className="w-2 h-6 bg-voice-primary/70 rounded animate-pulse" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-10 bg-voice-primary/80 rounded animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-4 bg-voice-primary/60 rounded animate-pulse" style={{ animationDelay: '0.3s' }}></div>
            <div className="w-2 h-7 bg-voice-primary/70 rounded animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            <span className="text-xs text-muted-foreground ml-2">Playing response...</span>
          </div>
          <Button
            onClick={stopPlayback}
            variant="ghost"
            size="sm"
          >
            <Pause className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Instructions */}
      {state === 'idle' && (
        <p className="text-xs text-center text-muted-foreground">
          Tap the microphone to start voice input
        </p>
      )}
    </div>
  );
}