import { useState, useRef, useEffect } from "react";
import { Send, Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { VoiceControls } from "./VoiceControls";

interface ChatInputProps {
  onSendMessage: (message: string, mode: "text" | "voice") => void;
  disabled?: boolean;
  onVoiceModeChange?: (voiceMode: boolean) => void;
  isVoiceMode?: boolean;
}

export function ChatInput({
  onSendMessage,
  disabled = false,
  onVoiceModeChange,
  isVoiceMode: externalVoiceMode,
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync internal voice mode with external prop
  useEffect(() => {
    if (externalVoiceMode !== undefined) {
      setIsVoiceMode(externalVoiceMode);
    }
  }, [externalVoiceMode]);

  // Listen for suggested prompt events and auto-submit
  useEffect(() => {
    const handleSuggestedPrompt = (event: CustomEvent) => {
      setInput(event.detail);
      setIsVoiceMode(false);
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    };

    const handleSubmitSuggestedPrompt = (event: CustomEvent) => {
      if (event.detail && !disabled) {
        onSendMessage(event.detail, "text");
        setInput("");
      }
    };

    window.addEventListener(
      "suggestedPrompt",
      handleSuggestedPrompt as EventListener
    );
    window.addEventListener(
      "submitSuggestedPrompt",
      handleSubmitSuggestedPrompt as EventListener
    );
    return () => {
      window.removeEventListener(
        "suggestedPrompt",
        handleSuggestedPrompt as EventListener
      );
      window.removeEventListener(
        "submitSuggestedPrompt",
        handleSubmitSuggestedPrompt as EventListener
      );
    };
  }, [disabled, onSendMessage]);

  const handleSubmit = () => {
    if (input.trim() && !disabled) {
      onSendMessage(input.trim(), "text");
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !disabled) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
    }
  }, [input]);

  return (
    <div className="border-t border-border bg-background/95 backdrop-blur-sm p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Input Controls */}
        {isVoiceMode ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              <Button
                onClick={() => {
                  setIsVoiceMode(false);
                  onVoiceModeChange?.(false);
                }}
                variant="destructive"
                size="sm"
                className="flex items-center gap-2"
              >
                <MicOff className="w-4 h-4" />
                End voice mode
              </Button>
            </div>
            <VoiceControls onSendMessage={onSendMessage} disabled={disabled} />
          </div>
        ) : (
          <div className="flex space-x-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => {
                    setIsVoiceMode(true);
                    onVoiceModeChange?.(true);
                  }}
                  variant="outline"
                  size="icon"
                  disabled={disabled}
                  className="h-[44px] w-[44px] shrink-0"
                >
                  <Mic className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Start voice mode</p>
              </TooltipContent>
            </Tooltip>
            <div className="flex-1">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything about Ankit..."
                disabled={disabled}
                className="min-h-[44px] max-h-[120px] resize-none pr-12 text-base"
                rows={1}
              />
            </div>
            <Button
              onClick={handleSubmit}
              disabled={!input.trim() || disabled}
              size="icon"
              className="h-[44px] w-[44px] shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
