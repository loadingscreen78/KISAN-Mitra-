import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Send, MessageCircle, Loader2, Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getApiBaseUrl } from '@/lib/apiConfig';

interface TextChatFallbackProps {
  onChatResponse?: (message: string, response: string) => void;
  className?: string;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  message: string;
  timestamp: Date;
}

export default function TextChatFallback({ onChatResponse, className }: TextChatFallbackProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (type: 'user' | 'bot', message: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isProcessing) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setError('');
    
    // Add user message
    addMessage('user', userMessage);
    setIsProcessing(true);

    try {
      const response = await fetch(`${getApiBaseUrl()}/api/voice-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();
      
      if (data.success) {
        addMessage('bot', data.response);
        
        // Call the callback if provided
        if (onChatResponse) {
          onChatResponse(userMessage, data.response);
        }
      } else {
        setError(data.error || 'Failed to get response');
        addMessage('bot', 'I apologize, but I encountered an error. Please try again.');
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      setError('Network error. Please check your connection.');
      addMessage('bot', 'I am having trouble connecting. Please check your internet connection and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Card className={cn("p-6", className)}>
      <div className="space-y-4">
        <div className="text-center">
          <MessageCircle className="w-12 h-12 mx-auto mb-4 text-green-600" />
          <h3 className="text-lg font-semibold text-green-800">💬 Text Chat Assistant</h3>
          <p className="text-sm text-gray-600">Ask your farming questions via text</p>
        </div>

        {/* Chat Messages */}
        <div className="h-64 overflow-y-auto border rounded-lg p-4 bg-gray-50 space-y-3">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Bot className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Start a conversation with Kisan Mitra AI</p>
              <p className="text-xs mt-1">Ask about crops, diseases, weather, soil, etc.</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex items-start space-x-2",
                  msg.type === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {msg.type === 'bot' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-green-600" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[80%] p-3 rounded-lg text-sm",
                    msg.type === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white border shadow-sm'
                  )}
                >
                  <p>{msg.message}</p>
                  <p className={cn(
                    "text-xs mt-1 opacity-70",
                    msg.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                  )}>
                    {msg.timestamp.toLocaleTimeString()}
                  </p>
                </div>
                {msg.type === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                )}
              </div>
            ))
          )}
          
          {isProcessing && (
            <div className="flex items-start space-x-2 justify-start">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-green-600" />
              </div>
              <div className="bg-white border shadow-sm p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                  <span className="text-sm text-gray-600">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Input Area */}
        <div className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your farming question here..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            disabled={isProcessing}
          />
          <Button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isProcessing}
            className="bg-green-600 hover:bg-green-700 text-white px-6"
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>

        <div className="text-xs text-gray-500 space-y-1 text-center">
          <p>🗣️ Supports Hindi and English</p>
          <p>🌾 Ask about crops, diseases, weather, soil, fertilizers, etc.</p>
          <p>💡 Press Enter to send your message</p>
        </div>
      </div>
    </Card>
  );
}
