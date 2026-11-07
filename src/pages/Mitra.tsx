import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Mic, ArrowUp, Bot, Sparkles, User, RefreshCw } from 'lucide-react';
import VoiceAssistant from '@/components/VoiceAssistant';
import AmbientBackground from '@/components/AmbientBackground';
import GlassBottomNav from '@/components/GlassBottomNav';
import { getApiBaseUrl } from '@/lib/apiConfig';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  time?: string;
}

const Mitra = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showVoiceMode, setShowVoiceMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [messageIdCounter, setMessageIdCounter] = useState(1);
  const [isVoiceProcessing, setIsVoiceProcessing] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScroll = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    setShowScrollToTop(scrollTop > 200);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showVoiceMode) {
          handleVoiceModeToggle();
        } else {
          handleBack();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showVoiceMode]);

  // Initial welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: 0,
      text: "Namaste! I'm Mitra, your AI farming companion. Ask me anything about crop diseases, fertilizers, weather advisory, or market prices in English or Hindi.",
      isUser: false,
      time: getCurrentTime()
    };
    setMessages([welcomeMessage]);
  }, []);

  const sendMessage = async (messageText?: string) => {
    const currentMessage = messageText || inputMessage;
    if (!currentMessage.trim()) return;

    const userMessage: Message = {
      id: messageIdCounter,
      text: currentMessage,
      isUser: true,
      time: getCurrentTime()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setMessageIdCounter(prev => prev + 1);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch(`${getApiBaseUrl()}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentMessage }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      const botResponse = result.response;
      
      const botMessage: Message = {
        id: messageIdCounter + 1,
        text: botResponse,
        isUser: false,
        time: getCurrentTime()
      };
      
      setMessages(prev => [...prev, botMessage]);
      setMessageIdCounter(prev => prev + 2);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: messageIdCounter + 1,
        text: "I am having trouble connecting to the network. Please ensure the backend is running and your GEMINI_API_KEY is configured.",
        isUser: false,
        time: getCurrentTime()
      };
      setMessages(prev => [...prev, errorMessage]);
      setMessageIdCounter(prev => prev + 2);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceResponse = (userMessage: string, botResponse: string) => {
    const userMsg: Message = {
      id: messageIdCounter,
      text: userMessage,
      isUser: true,
      time: getCurrentTime()
    };
    
    const botMsg: Message = {
      id: messageIdCounter + 1,
      text: botResponse,
      isUser: false,
      time: getCurrentTime()
    };
    
    setMessages(prev => [...prev, userMsg, botMsg]);
    setMessageIdCounter(prev => prev + 2);
    setIsVoiceProcessing(false);
  };

  const handleBack = () => {
    setIsVoiceProcessing(false);
    setShowVoiceMode(false);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if ((window as any).voiceAssistantCleanup) {
      (window as any).voiceAssistantCleanup();
    }
    navigate('/home');
  };

  const handleVoiceModeToggle = () => {
    if (showVoiceMode) {
      setIsVoiceProcessing(false);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if ((window as any).voiceAssistantCleanup) {
        (window as any).voiceAssistantCleanup();
      }
    }
    setShowVoiceMode(!showVoiceMode);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickPrompts = [
    "How to treat Tomato Early Blight?",
    "Best fertilizer for wheat tillering",
    "Tomato mandi price trends",
    "गेहूं में पीला रतुआ का इलाज क्या है?"
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-emerald-50/40 via-background to-emerald-50/20 pb-32">
      {/* Ambient background glow */}
      <AmbientBackground />

      {/* Floating Expo-Glass Top Header */}
      <header className="sticky top-0 z-40 backdrop-blur-2xl bg-white/75 border-b border-white/60 shadow-[0_4px_20px_0_rgba(0,0,0,0.03)]">
        <div className="max-w-2xl lg:max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <button
            onClick={handleBack}
            aria-label="Back"
            className="p-2.5 glass-panel rounded-full hover:bg-white/90 text-slate-700 transition-all active:scale-95 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-800" />
          </button>
          
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-600 to-green-500 text-white flex items-center justify-center shadow-md border border-white/60">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-extrabold text-slate-900 tracking-tight leading-none">
                  Mitra AI
                </h1>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-[10px] text-emerald-700 font-medium mt-0.5">
                {isVoiceProcessing ? 'Listening to voice...' : 'Farming Assistant'}
              </p>
            </div>
          </div>
          
          <button
            onClick={handleVoiceModeToggle}
            aria-label="Voice Mode"
            className={`p-2.5 rounded-full transition-all duration-200 active:scale-95 shadow-sm ${
              showVoiceMode 
                ? 'bg-emerald-600 text-white ring-4 ring-emerald-500/25 animate-pulse' 
                : 'glass-panel text-slate-700 hover:bg-white/90'
            }`}
          >
            <Mic className="w-4 h-4 text-emerald-800" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-2xl lg:max-w-3xl mx-auto px-4 sm:px-6 pt-4 space-y-4">
        {/* Voice Assistant Panel if active */}
        {showVoiceMode && (
          <div className="glass-panel-elevated p-4 border border-emerald-400/40">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Live Voice Assistant
              </span>
              <button
                onClick={handleVoiceModeToggle}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 glass-pill px-2.5 py-1"
              >
                Close
              </button>
            </div>
            <VoiceAssistant 
              onVoiceResponse={handleVoiceResponse} 
              className="border-0 shadow-none bg-transparent"
              onCleanup={() => {
                setIsVoiceProcessing(false);
                setShowVoiceMode(false);
              }}
            />
          </div>
        )}

        {/* Quick Suggestion Chips */}
        {messages.length <= 2 && (
          <div className="space-y-1.5">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
              Suggested Questions
            </p>
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(prompt)}
                  className="glass-pill px-3 py-1.5 text-xs text-emerald-900 font-medium hover:bg-emerald-500/10 hover:border-emerald-400/50 transition-all text-left active:scale-95"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Messages Flow */}
        <div 
          ref={messagesContainerRef}
          className="space-y-3.5 pb-20"
        >
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex items-end gap-2 ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!message.isUser && (
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-500 text-white flex items-center justify-center flex-shrink-0 text-xs shadow-sm mb-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div 
                className={`max-w-[82%] p-3.5 rounded-3xl text-sm leading-relaxed ${
                  message.isUser 
                    ? 'bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-500 text-white rounded-br-sm shadow-[0_8px_20px_-3px_rgba(16,185,129,0.35)] border border-emerald-400/30' 
                    : 'glass-panel rounded-bl-sm text-slate-800 border border-white/80 shadow-[0_8px_24px_rgba(0,0,0,0.04)]'
                }`}
              >
                <p className="whitespace-pre-line">{message.text}</p>
                {message.time && (
                  <div className={`text-[10px] mt-1.5 text-right ${message.isUser ? 'text-emerald-100' : 'text-slate-400'}`}>
                    {message.time}
                  </div>
                )}
              </div>

              {message.isUser && (
                <div className="w-7 h-7 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center flex-shrink-0 text-xs shadow-sm mb-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-end gap-2 justify-start">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-500 text-white flex items-center justify-center flex-shrink-0 text-xs shadow-sm mb-1">
                <Bot className="w-4 h-4" />
              </div>
              <div className="glass-panel rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2 text-xs text-slate-600 shadow-sm border border-white/80">
                <RefreshCw className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                <span>Mitra is thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Floating Glass Input Bar */}
      <div className="fixed bottom-16 left-0 right-0 z-40 p-3 pb-[max(12px,env(safe-area-inset-bottom))] pointer-events-none">
        <div className="max-w-2xl lg:max-w-3xl mx-auto px-4 sm:px-6 pointer-events-auto">
          <div className="backdrop-blur-3xl bg-white/85 border border-white/70 shadow-[0_12px_40px_0_rgba(0,0,0,0.12)] rounded-full p-1.5 pl-4 flex items-center gap-2">
            <input 
              type="text" 
              placeholder="Ask Mitra about your crops..." 
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={isLoading}
              className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
            />
            
            <button
              onClick={() => handleVoiceModeToggle()}
              className="p-2.5 rounded-full text-slate-500 hover:text-emerald-600 hover:bg-emerald-500/10 transition-colors"
              title="Voice mode"
            >
              <Mic className="w-4 h-4" />
            </button>

            <button 
              onClick={() => sendMessage()}
              disabled={isLoading || !inputMessage.trim()}
              className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-600 to-green-500 text-white flex items-center justify-center shadow-md active:scale-95 disabled:opacity-40 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Unified Bottom Navigation */}
      <GlassBottomNav activeTab="mitra" />
    </div>
  );
};

export default Mitra;
