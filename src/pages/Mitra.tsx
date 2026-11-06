import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Mic, ArrowUp } from 'lucide-react';
import VoiceAssistant from '@/components/VoiceAssistant';
import { authService } from '@/lib/authService';
import { getApiBaseUrl } from '@/lib/apiConfig';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
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

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Scroll to top function
  const scrollToTop = () => {
    messagesContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Check scroll position to show/hide scroll to top button
  const handleScroll = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    setShowScrollToTop(scrollTop > 200);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add scroll listener to window
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape key to go back or close voice mode
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
      text: "Hello! I'm Kisan Mitra AI, your AI farming assistant. I can help you with crop cultivation, pest management, soil health, and farming advice. You can type your questions or use voice mode for hands-free interaction!",
      isUser: false
    };
    setMessages([welcomeMessage]);
  }, []);

  const sendMessage = async (messageText?: string) => {
    const currentMessage = messageText || inputMessage;
    if (!currentMessage.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: messageIdCounter,
      text: currentMessage,
      isUser: true
    };
    
    setMessages(prev => [...prev, userMessage]);
    setMessageIdCounter(prev => prev + 1);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Use backend API instead of direct Gemini calls
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
      
      // Add bot response
      const botMessage: Message = {
        id: messageIdCounter + 1,
        text: botResponse,
        isUser: false
      };
      
      setMessages(prev => [...prev, botMessage]);
      setMessageIdCounter(prev => prev + 2);
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: messageIdCounter + 1,
        text: "I am having trouble connecting to the network. Please check your internet connection and try again.",
        isUser: false
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setMessageIdCounter(prev => prev + 2);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle voice responses
  const handleVoiceResponse = (userMessage: string, botResponse: string) => {
    const userMsg: Message = {
      id: messageIdCounter,
      text: userMessage,
      isUser: true
    };
    
    const botMsg: Message = {
      id: messageIdCounter + 1,
      text: botResponse,
      isUser: false
    };
    
    setMessages(prev => [...prev, userMsg, botMsg]);
    setMessageIdCounter(prev => prev + 2);
    setIsVoiceProcessing(false); // Reset voice processing state
  };

  // Handle navigation with cleanup
  const handleBack = () => {
    // Stop any ongoing voice processing
    setIsVoiceProcessing(false);
    setShowVoiceMode(false);
    
    // Clean up any ongoing speech recognition or audio
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    
    // Call voice assistant cleanup if available
    if ((window as any).voiceAssistantCleanup) {
      (window as any).voiceAssistantCleanup();
    }
    
    // Navigate to home page
    navigate('/home');
  };

  // Handle voice mode toggle with proper cleanup
  const handleVoiceModeToggle = () => {
    if (showVoiceMode) {
      // Cleanup when turning off voice mode
      setIsVoiceProcessing(false);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      // Call voice assistant cleanup if available
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

  return (
    <div className="bg-gray-100 min-h-screen overflow-y-auto p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-auto flex flex-col" style={{ minHeight: 'calc(100vh - 2rem)', maxHeight: 'none' }}>
        
        {/* Chat Header */}
        <div className="bg-green-600 text-white p-4 flex items-center justify-between rounded-t-2xl shadow-md">
          <button
            onClick={handleBack}
            className="text-white hover:bg-white/20 rounded-full p-2 transition-colors hover:scale-110 active:scale-95"
            title="Go Back"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-xl font-bold">Kisan Mitra AI</h1>
            {isVoiceProcessing && (
              <p className="text-xs text-green-200 animate-pulse">Voice processing...</p>
            )}
          </div>
          <button
            onClick={handleVoiceModeToggle}
            className={`text-white hover:bg-white/20 rounded-full p-2 transition-colors ${
              showVoiceMode ? 'bg-white/20' : ''
            }`}
            title={showVoiceMode ? 'Close Voice Mode' : 'Open Voice Mode'}
          >
            <Mic className="w-5 h-5" />
          </button>
        </div>

        {/* Voice Assistant Mode */}
        {showVoiceMode && (
          <div className="p-4 border-b border-gray-200 bg-green-50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-800">🎤 Voice Mode Active</span>
              <button
                onClick={handleVoiceModeToggle}
                className="text-green-600 hover:text-green-800 text-sm font-medium px-2 py-1 rounded hover:bg-green-100"
                title="Close Voice Mode"
              >
                Close
              </button>
            </div>
            <VoiceAssistant 
              onVoiceResponse={handleVoiceResponse} 
              className="border-0 shadow-none"
              onCleanup={() => {
                setIsVoiceProcessing(false);
                setShowVoiceMode(false);
              }}
            />
          </div>
        )}

        {/* Chat Messages Container */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 p-4 space-y-4 relative" 
          style={{ maxHeight: 'none', overflowY: 'visible', touchAction: 'pan-y' }}
        >
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`${
                message.isUser 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-200 text-gray-800'
              } p-3 rounded-xl max-w-[80%] shadow-sm`}>
                {message.text}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-200 text-gray-800 p-3 rounded-xl shadow-sm animate-pulse">
                Thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
          
          {/* Scroll to Top Button */}
          {showScrollToTop && (
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="fixed bottom-20 right-6 bg-green-600 hover:bg-green-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 z-50 animate-bounce"
              title="Scroll to top of page"
              style={{ 
                position: 'fixed',
                bottom: '80px',
                right: '16px',
                zIndex: 1000
              }}
            >
              <ArrowUp className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Chat Input and Send Button */}
        <div className="p-4 border-t border-gray-200 flex items-center space-x-2">
          <input 
            type="text" 
            placeholder="Type your message here..." 
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyUp={handleKeyPress}
            disabled={isLoading}
            className="flex-1 p-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
          />
          <button 
            onClick={() => sendMessage()}
            disabled={isLoading || !inputMessage.trim()}
            className="bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50"
          >
            <Send className="w-6 h-6 rotate-90" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default Mitra;