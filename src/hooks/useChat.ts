import { useState, useCallback, useEffect } from "react";
import { ChatMessage, sendChatMessage, newChat as apiNewChat } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const STORAGE_KEY = "ankit-assistant:history";
const MAX_MESSAGES = 50;

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const { toast } = useToast();

  // Load persisted history on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const restoredMessages = parsed.map((msg: ChatMessage) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(restoredMessages);
      }
    } catch (error) {
      console.error("Failed to load chat history:", error);
    }
  }, []);

  // Persist messages to localStorage
  const persistMessages = useCallback((newMessages: ChatMessage[]) => {
    try {
      // Keep only the last MAX_MESSAGES
      const messagesToStore = newMessages.slice(-MAX_MESSAGES);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messagesToStore));
    } catch (error) {
      console.error("Failed to persist chat history:", error);
    }
  }, []);

  const addMessage = useCallback(
    (message: ChatMessage) => {
      setMessages((prev) => {
        const newMessages = [...prev, message];
        persistMessages(newMessages);
        return newMessages;
      });
    },
    [persistMessages]
  );

  const addSystemMessage = useCallback(
    (content: string) => {
      const systemMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "system",
        content,
        timestamp: new Date(),
      };
      addMessage(systemMessage);
    },
    [addMessage]
  );

  const updateLastMessage = useCallback(
    (updater: (content: string) => string) => {
      setMessages((prev) => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage && lastMessage.role === "assistant") {
          lastMessage.content = updater(lastMessage.content);
        }
        persistMessages(newMessages);
        return newMessages;
      });
    },
    [persistMessages]
  );

  const sendMessage = useCallback(
    async (content: string, mode: "text" | "voice" = "text") => {
      if (!content.trim() || isLoading) return;

      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        content: content.trim(),
        timestamp: new Date(),
      };

      addMessage(userMessage);
      setIsLoading(true);
      setIsStreaming(true);

      // Create assistant message placeholder
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
        timestamp: new Date(),
      };
      addMessage(assistantMessage);

      try {
        await sendChatMessage(
          { message: content.trim(), mode },
          (chunk: string) => {
            // Handle streaming chunks
            updateLastMessage((prev) => prev + chunk);
          }
        );
      } catch (error) {
        console.error("Failed to send message:", error);
        updateLastMessage(
          () =>
            "Sorry, I encountered an error processing your message. Please try again."
        );
        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
        setIsStreaming(false);
      }
    },
    [isLoading, addMessage, updateLastMessage, toast]
  );

  const clearChat = useCallback(async () => {
    try {
      setIsLoading(true);
      await apiNewChat();
      setMessages([]);
      localStorage.removeItem(STORAGE_KEY);
      toast({
        title: "Chat cleared",
        description: "Your conversation has been reset.",
      });
    } catch (error) {
      console.error("Failed to clear chat:", error);
      toast({
        title: "Error",
        description: "Failed to clear chat. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    messages,
    isLoading,
    isStreaming,
    sendMessage,
    clearChat,
    addSystemMessage,
  };
}
