import { useState, useEffect } from "react";
import { Trash2, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { checkHealth } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
interface ToolbarProps {
  onClearChat: () => void;
  disabled?: boolean;
}
export function Toolbar({ onClearChat, disabled }: ToolbarProps) {
  const handleClearChat = () => {
    if (window.confirm("Are you sure you want to clear this conversation?")) {
      onClearChat();
    }
  };
  return (
    <header className="relative">
      <div className="absolute inset-0 bg-gradient-header opacity-90"></div>
      <div className="relative flex items-center justify-between px-6 py-4 backdrop-blur-sm">
        <div className="flex-1 text-center">
          <h1 className="text-xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
            Ankit's Personal Assistant
          </h1>
          <p className="text-xs text-white/70 mt-1">AI-Powered Assistant</p>
        </div>
        <Button
          onClick={handleClearChat}
          disabled={disabled}
          variant="ghost"
          size="sm"
          className="text-white/90 hover:text-white hover:bg-white/10 border border-white/20"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Clear
        </Button>
      </div>
    </header>
  );
}
