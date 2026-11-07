import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { MicrophoneIcon, PaperPlaneRightIcon, XIcon } from '@phosphor-icons/react';
import VoiceAssistant from '@/components/VoiceAssistant';
import PageHeader from '@/components/PageHeader';
import { pageColumn } from '@/lib/layout';
import { getApiBaseUrl } from '@/lib/apiConfig';
import { cn } from '@/lib/utils';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  time?: string;
}

const quickPrompts = [
  'How do I treat early blight on tomato?',
  'Best fertilizer for wheat at tillering',
  'Tomato mandi price trend this week',
  'गेहूं में पीला रतुआ का इलाज क्या है?',
];

const getCurrentTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const stopVoice = () => {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  const cleanup = (window as { voiceAssistantCleanup?: () => void }).voiceAssistantCleanup;
  cleanup?.();
};

const Mitra = () => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>(() => [
    { id: 0, text: t('ui.mitra_welcome'), isUser: false, time: getCurrentTime() },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showVoiceMode, setShowVoiceMode] = useState(false);
  const [isVoiceProcessing, setIsVoiceProcessing] = useState(false);
  const nextId = useRef(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // The page opens at the top; only new messages scroll the thread.
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isLoading]);

  // Stop speech when leaving the page.
  useEffect(() => stopVoice, []);

  const closeVoiceMode = () => {
    setIsVoiceProcessing(false);
    stopVoice();
    setShowVoiceMode(false);
  };

  const toggleVoiceMode = () => {
    if (showVoiceMode) closeVoiceMode();
    else setShowVoiceMode(true);
  };

  // Escape closes the voice panel.
  useEffect(() => {
    if (!showVoiceMode) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeVoiceMode();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showVoiceMode]);

  const append = (...items: Omit<Message, 'id'>[]) => {
    setMessages((previous) => [
      ...previous,
      ...items.map((item) => ({ ...item, id: nextId.current++ })),
    ]);
  };

  const sendMessage = async (messageText?: string) => {
    const currentMessage = (messageText ?? inputMessage).trim();
    if (!currentMessage || isLoading) return;

    append({ text: currentMessage, isUser: true, time: getCurrentTime() });
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
      append({ text: result.response, isUser: false, time: getCurrentTime() });
    } catch (error) {
      console.error('Error sending message:', error);
      append({ text: t('ui.mitra_offline'), isUser: false, time: getCurrentTime() });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceResponse = (userMessage: string, botResponse: string) => {
    append(
      { text: userMessage, isUser: true, time: getCurrentTime() },
      { text: botResponse, isUser: false, time: getCurrentTime() },
    );
    setIsVoiceProcessing(false);
  };

  return (
    <div className="min-h-screen pb-tabbar-cta">
      <PageHeader
        title={t('ui.mitra_title')}
        subtitle={isVoiceProcessing ? t('ui.mitra_listening') : t('ui.mitra_status')}
        width="narrow"
        actions={
          <button
            type="button"
            onClick={toggleVoiceMode}
            aria-pressed={showVoiceMode}
            aria-label={t('ui.voice_mode')}
            className={cn('glass-icon-button', showVoiceMode && 'glass-tinted text-white')}
          >
            <MicrophoneIcon size={20} weight={showVoiceMode ? 'fill' : 'regular'} aria-hidden="true" />
          </button>
        }
      />

      <main className={cn(pageColumn('narrow'), 'space-y-6 pt-2')}>
        {showVoiceMode && (
          <section aria-label={t('ui.voice_assistant')} className="glass-panel-elevated animate-rise-in p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="title-4 text-field-900">{t('ui.voice_assistant')}</h2>
              <button
                type="button"
                onClick={closeVoiceMode}
                aria-label={t('ui.close')}
                className="grid h-11 w-11 place-items-center rounded-full text-field-500 hover:text-field-900"
              >
                <XIcon size={18} weight="bold" aria-hidden="true" />
              </button>
            </div>
            <VoiceAssistant
              onVoiceResponse={handleVoiceResponse}
              className="border-0 bg-transparent shadow-none"
              onCleanup={() => {
                setIsVoiceProcessing(false);
                setShowVoiceMode(false);
              }}
            />
          </section>
        )}

        <ol className="space-y-4" aria-live="polite">
          {messages.map((message) => (
            <li
              key={message.id}
              className={cn('flex animate-rise-in', message.isUser ? 'justify-end' : 'justify-start')}
            >
              <div
                className={cn(
                  'max-w-[85%] rounded-3xl px-4 py-3',
                  message.isUser ? 'glass-tinted rounded-br-lg' : 'glass rounded-bl-lg text-field-900',
                )}
              >
                <p className="body-6 whitespace-pre-line">{message.text}</p>
                {message.time && (
                  <p className={cn('caption-5 figures mt-1 text-right', message.isUser ? 'text-white/70' : 'text-field-500')}>
                    {message.time}
                  </p>
                )}
              </div>
            </li>
          ))}

          {isLoading && (
            <li className="flex animate-rise-in justify-start">
              <div className="glass flex items-center gap-2 rounded-3xl rounded-bl-lg px-4 py-4" role="status">
                <span className="sr-only">{t('ui.mitra_thinking')}</span>
                {[0, 1, 2].map((dot) => (
                  <span
                    key={dot}
                    aria-hidden="true"
                    className="h-2 w-2 animate-bounce rounded-full bg-field-400 motion-reduce:animate-none"
                    style={{ animationDelay: `${dot * 120}ms` }}
                  />
                ))}
              </div>
            </li>
          )}
        </ol>

        {messages.length <= 2 && !isLoading && (
          <section aria-labelledby="mitra-suggested" className="animate-rise-in">
            <h2 id="mitra-suggested" className="caption-4 mb-2 text-field-500">
              {t('ui.mitra_suggested')}
            </h2>
            <ul className="flex flex-wrap gap-2">
              {quickPrompts.map((prompt) => (
                <li key={prompt}>
                  <button
                    type="button"
                    onClick={() => sendMessage(prompt)}
                    className="glass-pill caption-1 min-h-11 px-4 py-2 text-left text-field-800 transition-transform duration-500 ease-spring hover:text-field-900 active:scale-95"
                  >
                    {prompt}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div ref={messagesEndRef} />
      </main>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          sendMessage();
        }}
        className="pointer-events-none fixed inset-x-0 bottom-tabbar z-40 px-4"
      >
        <div className="glass pointer-events-auto mx-auto flex max-w-2xl items-center gap-2 rounded-full p-1 pl-4 shadow-[0_10px_30px_-12px_rgb(27_31_25/0.4)]">
          <label htmlFor="mitra-input" className="sr-only">
            {t('ui.mitra_placeholder')}
          </label>
          <input
            id="mitra-input"
            type="text"
            autoComplete="off"
            placeholder={t('ui.mitra_placeholder')}
            value={inputMessage}
            onChange={(event) => setInputMessage(event.target.value)}
            disabled={isLoading}
            className="h-12 min-w-0 flex-1 bg-transparent text-field-900 placeholder:text-field-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={toggleVoiceMode}
            aria-label={t('ui.voice_mode')}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-field-600 transition-colors duration-300 hover:text-leaf-700"
          >
            <MicrophoneIcon size={20} aria-hidden="true" />
          </button>
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            aria-label={t('ui.send')}
            className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-leaf-600 text-white transition-[transform,opacity] duration-500 ease-spring active:scale-90 disabled:opacity-40"
          >
            <PaperPlaneRightIcon size={20} weight="fill" aria-hidden="true" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default Mitra;
