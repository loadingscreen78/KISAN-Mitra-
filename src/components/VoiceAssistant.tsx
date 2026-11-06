import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, MicOff, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getApiBaseUrl } from '@/lib/apiConfig';

interface VoiceAssistantProps {
  onVoiceResponse?: (message: string, response: string) => void;
  className?: string;
  onCleanup?: () => void;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResultList {
  [index: number]: {
    [index: number]: SpeechRecognitionResult;
    isFinal: boolean;
  };
  length: number;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: any) => void;
  onstart: () => void;
  onend: () => void;
  start(): void;
  stop(): void;
}

export default function VoiceAssistant({ onVoiceResponse, className, onCleanup }: VoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Check if speech recognition is supported and if we're in a secure context
    const checkSupport = () => {
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isHTTP = window.location.protocol === 'http:';
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      
      // Check for HTTPS requirement on mobile
      if (isMobile && isHTTP && !isLocalhost) {
        setError('Voice features require HTTPS on mobile devices when using network URLs. Please enable HTTPS or use text-based chat instead.');
        setIsSupported(false);
        return;
      }

      if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        setIsSupported(true);
      } else {
        setError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
        setIsSupported(false);
      }
    };

    checkSupport();

    return () => {
      cleanup();
    };
  }, []);

  // Cleanup function to stop all voice activities
  const cleanup = () => {
    try {
      // Stop speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      
      // Stop audio playback
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
      
      // Cancel speech synthesis
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      
      // Cancel any ongoing API requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      
      // Reset states
      setIsListening(false);
      setIsProcessing(false);
      setIsPlaying(false);
      setError('');
      
      // Call cleanup callback if provided
      if (onCleanup) {
        onCleanup();
      }
    } catch (error) {
      console.error('Error during voice assistant cleanup:', error);
    }
  };

  // Expose cleanup function to parent components
  useEffect(() => {
    // Store cleanup function on window for external access
    (window as any).voiceAssistantCleanup = cleanup;
    
    return () => {
      delete (window as any).voiceAssistantCleanup;
    };
  }, []);

  const initializeSpeechRecognition = () => {
    if (!isSupported) return null;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'hi-IN'; // Set to Hindi, but will also detect English

    recognition.onstart = () => {
      setIsListening(true);
      setError('');
      setTranscript('');
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const results = event.results;
      if (results.length > 0) {
        const lastResult = results[results.length - 1];
        if (lastResult.isFinal) {
          const transcript = lastResult[0].transcript;
          setTranscript(transcript);
          processVoiceInput(transcript);
        }
      }
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      let errorMessage = '';
      
      switch(event.error) {
        case 'not-allowed':
          errorMessage = 'Microphone permission denied. Please allow microphone access and try again.';
          break;
        case 'no-speech':
          errorMessage = 'No speech detected. Please try speaking again.';
          break;
        case 'audio-capture':
          errorMessage = 'Microphone not available. Please check your device settings.';
          break;
        case 'network':
          errorMessage = 'Network error. Please check your internet connection.';
          break;
        case 'service-not-allowed':
          errorMessage = 'Speech service not allowed. Please enable microphone permissions.';
          break;
        default:
          errorMessage = `Speech recognition error: ${event.error}. Please try again.`;
      }
      
      setError(errorMessage);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    return recognition;
  };

  const processVoiceInput = async (transcript: string) => {
    setIsProcessing(true);
    
    // Create an abort controller for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/voice-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: transcript }),
        signal: abortController.signal,
      });

      const data = await response.json();
      
      if (data.success) {
        setResponse(data.response);
        
        // Call the callback if provided
        if (onVoiceResponse) {
          onVoiceResponse(transcript, data.response);
        }

        // Play audio response if available
        if (data.has_audio && data.audio_url) {
          playAudioResponse(data.audio_url);
        } else {
          // Fallback to browser TTS
          speakText(data.response);
        }
      } else {
        setError(data.error || 'Failed to get response');
        speakText('I apologize, but I encountered an error. Please try again.');
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        setError('Voice processing was cancelled.');
        console.log('Voice processing aborted by user');
      } else {
        console.error('Voice chat error:', error);
        setError('Network error. Please check your connection.');
        speakText('I am having trouble connecting. Please try again.');
      }
    } finally {
      setIsProcessing(false);
      abortControllerRef.current = null;
    }
  };

  const playAudioResponse = (audioUrl: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.onplay = () => setIsPlaying(true);
    audio.onended = () => setIsPlaying(false);
    audio.onerror = () => {
      setIsPlaying(false);
      setError('Failed to play audio response');
      // Fallback to browser TTS
      speakText(response);
    };

    audio.play().catch((error) => {
      console.error('Audio playback error:', error);
      setError('Audio playback failed');
      speakText(response);
    });
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'hi-IN'; // Hindi
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  const startListening = async () => {
    if (!isSupported) {
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isHTTP = window.location.protocol === 'http:';
      
      if (isMobile && isHTTP) {
        setError('Voice features require HTTPS on mobile devices. Please use text chat or enable HTTPS.');
      } else {
        setError('Speech recognition not supported in this browser.');
      }
      return;
    }

    // Request microphone permission explicitly
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      }
    } catch (permissionError: any) {
      let errorMsg = 'Microphone permission required. ';
      
      if (permissionError.name === 'NotAllowedError') {
        errorMsg += 'Please allow microphone access in your browser settings and try again.';
      } else if (permissionError.name === 'NotFoundError') {
        errorMsg += 'No microphone found. Please check your device.';
      } else if (permissionError.name === 'NotSupportedError') {
        errorMsg += 'Microphone not supported on this device.';
      } else {
        errorMsg += 'Please check your browser settings and try again.';
      }
      
      setError(errorMsg);
      return;
    }

    const recognition = initializeSpeechRecognition();
    if (recognition) {
      recognitionRef.current = recognition;
      try {
        recognition.start();
      } catch (startError) {
        setError('Failed to start speech recognition. Please refresh the page and try again.');
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const cancelProcessing = () => {
    cleanup();
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  };

  if (!isSupported) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="text-center text-gray-500">
          <MicOff className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Voice assistant not available</p>
          <p className="text-sm mt-2">
            {error || 'Please use Chrome, Edge, or Safari for voice features'}
          </p>
          {/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && (
            <div className="mt-4 space-y-3">
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-left">
                <p className="text-sm font-medium text-red-800">🚫 Voice Not Available on Mobile HTTP</p>
                <p className="text-xs text-red-700 mt-1">
                  Mobile browsers require HTTPS for microphone access.
                </p>
              </div>
              
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-left">
                <p className="text-sm font-medium text-blue-800">💡 Solutions:</p>
                <p className="text-xs text-blue-700 mt-1">
                  1. Set up HTTPS on your server<br/>
                  2. Use text-based chat instead<br/>
                  3. Access via localhost if testing locally
                </p>
              </div>
              
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-left">
                <p className="text-sm font-medium text-green-800">✅ Alternative: Text Chat</p>
                <p className="text-xs text-green-700 mt-1">
                  You can still use the AI assistant through text messages in the chat section.
                </p>
                <button 
                  onClick={() => window.location.href = '/mitra'}
                  className="mt-2 px-3 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700 transition-colors"
                >
                  Go to Text Chat
                </button>
              </div>
            </div>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("p-6", className)} style={{ position: 'relative', zIndex: 1 }}>
      <div className="text-center space-y-4">
        <h3 className="text-lg font-semibold text-green-800">🎤 Voice Assistant</h3>
        
        <div className="flex justify-center space-x-4">
          {/* Microphone Button */}
          <Button
            variant={isListening ? "destructive" : "default"}
            size="lg"
            onClick={isListening ? stopListening : startListening}
            disabled={isProcessing}
            className={cn(
              "w-16 h-16 rounded-full",
              isListening && "animate-pulse bg-red-500 hover:bg-red-600"
            )}
          >
            {isProcessing ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : isListening ? (
              <MicOff className="w-6 h-6" />
            ) : (
              <Mic className="w-6 h-6" />
            )}
          </Button>

          {/* Stop/Cancel Button - always visible when voice is active */}
          {(isProcessing || isPlaying || isListening) && (
            <Button
              variant="destructive"
              size="lg"
              onClick={cleanup}
              className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 shadow-lg"
              title="Stop All Voice Activity"
              style={{ position: 'relative', zIndex: 10 }}
            >
              <VolumeX className="w-6 h-6" />
            </Button>
          )}

          {/* Audio Control Button - only when not processing */}
          {!isProcessing && !isListening && (
            <Button
              variant={isPlaying ? "destructive" : "outline"}
              size="lg"
              onClick={stopAudio}
              disabled={!isPlaying}
              className="w-16 h-16 rounded-full"
            >
              {isPlaying ? (
                <VolumeX className="w-6 h-6" />
              ) : (
                <Volume2 className="w-6 h-6" />
              )}
            </Button>
          )}
        </div>

        <div className="space-y-2" style={{ userSelect: 'none', pointerEvents: isPlaying ? 'none' : 'auto' }}>
          <p className="text-sm text-gray-600">
            {isListening
              ? "🎤 Listening... Speak your farming question (Press red button to stop)"
              : isProcessing
              ? "🤔 Processing your question... (Press red button to cancel)"
              : isPlaying
              ? "🔊 Playing response... (Press red button to stop or scroll to see chat)"
              : "Tap microphone to start voice conversation"}
          </p>

          {transcript && (
            <div className="bg-blue-50 p-3 rounded-lg" style={{ pointerEvents: 'auto' }}>
              <p className="text-sm font-medium text-blue-800">You said:</p>
              <p className="text-blue-700">{transcript}</p>
            </div>
          )}

          {response && (
            <div className="bg-green-50 p-3 rounded-lg" style={{ pointerEvents: 'auto' }}>
              <p className="text-sm font-medium text-green-800">Kisan Mitra AI says:</p>
              <p className="text-green-700">{response}</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-red-800">Error:</p>
              <p className="text-red-700">{error}</p>
            </div>
          )}
        </div>

        <div className="text-xs text-gray-500 space-y-1" style={{ pointerEvents: 'auto' }}>
          <p>🗣️ Supports Hindi and English</p>
          <p>🌾 Ask about crops, diseases, weather, soil, etc.</p>
          {isPlaying && (
            <p className="text-red-500 font-medium animate-pulse">💡 You can scroll up to see previous messages while I speak</p>
          )}
        </div>
      </div>
    </Card>
  );
}