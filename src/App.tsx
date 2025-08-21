import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ChatWindow } from "@/components/ChatWindow";
import { ChatInput } from "@/components/ChatInput";
import { Toolbar } from "@/components/Toolbar";
import { useChat } from "@/hooks/useChat";
import { useVoice } from "@/hooks/useVoice";

const App = () => {
  const {
    messages,
    isLoading,
    isStreaming,
    sendMessage,
    clearChat,
    addSystemMessage,
  } = useChat();
  const { playText } = useVoice();
  const [isVoiceMode, setIsVoiceMode] = useState(false);

  // Play TTS for assistant responses in voice mode
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (
      lastMessage?.role === "assistant" &&
      !isStreaming &&
      lastMessage.content
    ) {
      // Check if this was a voice interaction (you might want to track this in your state)
      // For now, we'll just play TTS for all assistant responses
      // playText(lastMessage.content);
    }
  }, [messages, isStreaming, playText]);

  const handleSendMessage = async (
    content: string,
    mode: "text" | "voice" = "text"
  ) => {
    await sendMessage(content, mode);

    // If voice mode and we have a response, play it
    if (mode === "voice") {
      setTimeout(() => {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage?.role === "assistant" && lastMessage.content) {
          playText(lastMessage.content);
        }
      }, 1000);
    }
  };

  const handleVoiceModeChange = (voiceMode: boolean) => {
    // If switching from voice to text mode, add system message
    if (isVoiceMode && !voiceMode) {
      addSystemMessage("Voice chat ended");
    }
    setIsVoiceMode(voiceMode);
  };

  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <div className="flex flex-col h-screen bg-background">
        <Toolbar onClearChat={clearChat} disabled={isLoading} />

        {!isVoiceMode && (
          <ChatWindow messages={messages} isStreaming={isStreaming} />
        )}

        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={isLoading}
          onVoiceModeChange={handleVoiceModeChange}
          isVoiceMode={isVoiceMode}
        />
      </div>
    </TooltipProvider>
  );
};

export default App;
