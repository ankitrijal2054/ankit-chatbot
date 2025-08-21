import { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChatMessage } from '@/lib/api';
import { markdownComponents } from '@/lib/markdown';

interface MessageBubbleProps {
  message: ChatMessage;
  isStreaming?: boolean;
}

export const MessageBubble = memo(function MessageBubble({ 
  message, 
  isStreaming = false 
}: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center mb-4">
        <div className="px-4 py-2 bg-muted/50 text-muted-foreground text-sm rounded-full border border-border/50 animate-fade-in">
          {message.content}
        </div>
      </div>
    );
  }
  
  return (
    <div className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`
        max-w-[85%] px-4 py-3 rounded-2xl
        ${isUser 
          ? 'chat-bubble-user' 
          : 'chat-bubble-assistant'
        }
        ${isStreaming ? 'typewriter-cursor' : ''}
        animate-fade-in
      `}>
        {isUser ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        ) : (
          <div className="text-sm leading-relaxed prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={markdownComponents}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
});