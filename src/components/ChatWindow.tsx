import { useEffect } from "react";
import { MessageBubble } from "./MessageBubble";
import { useAutoScroll } from "@/hooks/useAutoScroll";
import { ChatMessage } from "@/lib/api";

interface ChatWindowProps {
  messages: ChatMessage[];
  isStreaming: boolean;
}

const SUGGESTED_PROMPTS = [
  "Who is Ankit and what does he do?",
  "What projects has Ankit built?",
  "Summarize Ankit's experience.",
  "How can I contact Ankit?",
];

export function ChatWindow({ messages, isStreaming }: ChatWindowProps) {
  const { ref, scrollToBottom } = useAutoScroll<HTMLDivElement>(
    messages.length
  );

  // Force scroll when streaming
  useEffect(() => {
    if (isStreaming) {
      const interval = setInterval(scrollToBottom, 100);
      return () => clearInterval(interval);
    }
  }, [isStreaming, scrollToBottom]);

  const isEmpty = messages.length === 0;

  return (
    <div ref={ref} className="flex-1 overflow-y-auto chat-scroll p-4 pb-6">
      {isEmpty ? (
        <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto">
          <div className="text-center mb-8 animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-primary to-primary/60 rounded-2xl flex items-center justify-center">
              <span className="text-2xl text-primary-foreground font-semibold">
                A
              </span>
            </div>
            <h2 className="text-2xl font-semibold mb-3 text-foreground">
              Hi, I'm Ankit's Personal Assistant
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-md">
              I can answer any question you have about Ankit. Try one of these
              to get started:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
            {SUGGESTED_PROMPTS.map((prompt, index) => (
              <button
                key={index}
                onClick={() => {
                  // Send prompt to ChatInput and submit
                  const event = new CustomEvent("suggestedPrompt", {
                    detail: prompt,
                  });
                  window.dispatchEvent(event);
                  setTimeout(() => {
                    const submitEvent = new CustomEvent(
                      "submitSuggestedPrompt",
                      { detail: prompt }
                    );
                    window.dispatchEvent(submitEvent);
                  }, 150);
                }}
                className="p-4 text-left bg-card border border-border rounded-xl hover:bg-accent hover:text-accent-foreground transition-all duration-200 hover:scale-[1.02] hover:shadow-sm animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <span className="text-sm font-medium">{prompt}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          {messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              isStreaming={
                isStreaming &&
                index === messages.length - 1 &&
                message.role === "assistant"
              }
            />
          ))}

          {isStreaming && (
            <div className="flex justify-start mb-4">
              <div className="flex items-center space-x-1 px-4 py-3 rounded-2xl chat-bubble-assistant">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
